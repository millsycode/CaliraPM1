#!/usr/bin/env bash
# Sets up Clustermarket for local development inside WSL 2 (Ubuntu 22.04/24.04).
#
# Run from inside WSL:
#   bash /mnt/c/Claude/app-clustermarket/local-dev/wsl-setup.sh [--no-services]
#
# --no-services  Don't install Postgres/Redis natively (use docker-compose.yml instead).
#
# What it does:
#   1. Installs build deps, Ruby 3.4.10 (rbenv), Node 20, yarn
#   2. Installs Postgres + Redis natively (unless --no-services)
#   3. Clones the repo into ~/app-clustermarket (ext4 is far faster than /mnt/c)
#   4. bundle install, yarn install, creates and loads the dev database
#
# Safe to re-run; each step skips work that is already done.
set -euo pipefail

INSTALL_SERVICES=1
[[ "${1:-}" == "--no-services" ]] && INSTALL_SERVICES=0

SRC_REPO="${SRC_REPO:-/mnt/c/Claude/app-clustermarket}"
DEST_REPO="${DEST_REPO:-$HOME/app-clustermarket}"
RUBY_VERSION="${RUBY_VERSION:-3.4.10}"
PG_PASSWORD="postgres" # matches DATABASE_DEV_URL in .env.development

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

if ! grep -qiE 'microsoft|wsl' /proc/version; then
  echo "This script is meant to run inside WSL." >&2
  exit 1
fi

# --- 1. System packages -------------------------------------------------------
log "Installing system packages"
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  build-essential git curl ca-certificates gnupg rsync \
  libssl-dev libcurl4-openssl-dev libxml2-dev libyaml-dev libreadline-dev \
  zlib1g-dev libpq-dev libjpeg-dev libpng-dev libffi-dev libgmp-dev \
  libjemalloc2 imagemagick tzdata

if [[ $INSTALL_SERVICES -eq 1 ]]; then
  log "Installing Postgres and Redis"
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    postgresql postgresql-contrib redis-server
fi

# --- 2. Node 20 + yarn --------------------------------------------------------
if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]]; then
  log "Installing Node 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
if ! command -v yarn >/dev/null; then
  log "Installing yarn"
  sudo npm install -g yarn
fi

# --- 3. Ruby via rbenv --------------------------------------------------------
if [[ ! -d "$HOME/.rbenv" ]]; then
  log "Installing rbenv"
  git clone https://github.com/rbenv/rbenv.git "$HOME/.rbenv"
  git clone https://github.com/rbenv/ruby-build.git "$HOME/.rbenv/plugins/ruby-build"
fi
export PATH="$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"
eval "$(rbenv init - bash)"
if ! grep -q 'rbenv init' "$HOME/.bashrc"; then
  # shellcheck disable=SC2016
  {
    echo 'export PATH="$HOME/.rbenv/bin:$PATH"'
    echo 'eval "$(rbenv init - bash)"'
  } >> "$HOME/.bashrc"
fi
if ! rbenv versions --bare | grep -qx "$RUBY_VERSION"; then
  log "Building Ruby $RUBY_VERSION (takes several minutes)"
  rbenv install "$RUBY_VERSION"
fi
rbenv global "$RUBY_VERSION"

# --- 4. Start and configure services -----------------------------------------
if [[ $INSTALL_SERVICES -eq 1 ]]; then
  log "Starting Postgres and Redis"
  sudo service postgresql start
  sudo service redis-server start
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER postgres PASSWORD '${PG_PASSWORD}';"

  # Keep Postgres small for a dev box.
  PG_CONF_DIR="$(ls -d /etc/postgresql/*/main/conf.d | head -n1)"
  sudo tee "$PG_CONF_DIR/99-local-dev.conf" >/dev/null <<'EOF'
shared_buffers = 64MB
work_mem = 4MB
maintenance_work_mem = 32MB
effective_cache_size = 256MB
max_connections = 30
fsync = off
synchronous_commit = off
full_page_writes = off
EOF
  sudo service postgresql restart

  # Cap Redis memory.
  if ! grep -q '^maxmemory 128mb' /etc/redis/redis.conf; then
    echo 'maxmemory 128mb' | sudo tee -a /etc/redis/redis.conf >/dev/null
    echo 'maxmemory-policy noeviction' | sudo tee -a /etc/redis/redis.conf >/dev/null
    sudo service redis-server restart
  fi
fi

# --- 5. Clone the repo into the Linux filesystem ------------------------------
if [[ ! -d "$DEST_REPO/.git" ]]; then
  log "Cloning $SRC_REPO -> $DEST_REPO"
  ORIGIN_URL="$(git -C "$SRC_REPO" config --get remote.origin.url || true)"
  git clone "$SRC_REPO" "$DEST_REPO"
  [[ -n "$ORIGIN_URL" ]] && git -C "$DEST_REPO" remote set-url origin "$ORIGIN_URL"
fi
cd "$DEST_REPO"

# Local overrides (git-ignored). Created only if missing.
if [[ ! -f .env.development.local ]]; then
  cat > .env.development.local <<EOF
RAILS_MAX_THREADS=1
EOF
fi

# --- 6. Dependencies and database --------------------------------------------
log "bundle install"
gem install bundler --no-document
bundle install -j"$(nproc)"

log "yarn install"
yarn install --frozen-lockfile

log "Creating and loading the dev database"
bin/rails db:create
bin/rails db:structure:load || bin/rails db:schema:load
bin/rails db:seed || echo "(db:seed failed or not needed; continuing)"

log "Done"
cat <<EOF

Next:
  cd ~/app-clustermarket
  bin/dev                  # Rails + JS/CSS watchers  -> http://localhost:3000

Background jobs (optional, ~0.5 GB extra):
  bundle exec sidekiq -C config/sidekiq.yml

After a WSL restart, start services again (native install only):
  sudo service postgresql start && sudo service redis-server start
EOF
