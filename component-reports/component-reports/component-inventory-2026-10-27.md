# Component inventory - app-clustermarket
Generated 2026-10-27 10:47 from `C:\Users\mills\Documents\Code\Clustermarket\app-clustermarket`.

Direct = a package we chose to depend on. Indirect = pulled in by another package (still shipped / still a risk).
Full list incl. indirect: `component-inventory-2026-10-27.csv`.

## Runtime and system
| Component | Version | Where from |
|---|---|---|
| Ruby | 3.4.10 | .ruby-version |
| Bundler | 2.6.6 | Gemfile.lock |
| Node.js (required by package.json) | >=20 | package.json engines |
| Docker base image | ruby:3.4.10-slim-trixie | Dockerfile (FROM) |
| Node.js (installed in Docker build) | 20.x | Dockerfile (nodesource) |
| OS package: adduser | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: build-essential | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: curl | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: git | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: gnupg | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: imagemagick | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: iputils-ping | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libcurl4-openssl-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libfontconfig1 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libjemalloc2 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libjpeg-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libncurses5-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libpng16-16 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libpq5 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libpq-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libreadline6-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libssl-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libxml2 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libxml2-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libxrender1 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: libyaml-dev | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: nano | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: nodejs | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: postgresql-client-15 | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: redis-tools | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: tzdata-legacy | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: yarn | (latest from Debian at build time) | Dockerfile (apt-get) |
| OS package: zlib1g-dev | (latest from Debian at build time) | Dockerfile (apt-get) |

## Back end - direct dependencies (136)
| Component | Version | Type |
|---|---|---|
| active_record_extended | 3.3.0 | Direct |
| active_record_query_trace | 1.8 | Direct |
| active_storage_validations | 1.0.4 | Direct |
| activeadmin | 3.5.0 | Direct |
| acts-as-taggable-on | 11.0.0 | Direct |
| ahoy_matey | 4.2.1 | Direct |
| authtrail | 0.5.0 | Direct |
| aws-sdk-lambda | 1.100.0 | Direct |
| aws-sdk-s3 | 1.208.0 | Direct |
| base64 | 0.3.0 | Direct |
| benchmark | 0.5.0 | Direct |
| better_errors | 2.10.1 | Direct |
| bigdecimal | 4.1.2 | Direct |
| binding_of_caller | 1.0.0 | Direct |
| bootsnap | 1.25.0 | Direct |
| braintree | 3.4.0 | Direct |
| brakeman | 5.4.1 | Direct |
| byebug | 11.1.3 | Direct |
| chargebee | 2.65.0 | Direct |
| ckeditor | 4.3.0 | Direct |
| coffee-rails | 5.0.0 | Direct |
| connection_pool | 2.5.5 | Direct |
| countries | 5.7.2 | Direct |
| country_select | 8.0.3 | Direct |
| cssbundling-rails | 1.0.0 | Direct |
| csv | 3.3.2 | Direct |
| customerio | 5.6.0 | Direct |
| db-query-matchers | 0.14.0 | Direct |
| derailed_benchmarks | 2.1.2 | Direct |
| devise | 5.0.4 | Direct |
| devise-async | 1.0.0 | Direct |
| devise-i18n | 1.11.0 | Direct |
| devise-two-factor | 6.4.0 | Direct |
| discard | 1.4.0 | Direct |
| doorkeeper | 5.8.2 | Direct |
| dotenv-rails | 2.8.1 | Direct |
| drb | 2.2.3 | Direct |
| factory_bot_rails | 6.2.0 | Direct |
| faker | 3.2.1 | Direct |
| flipper | 0.28.3 | Direct |
| flipper-active_record | 0.28.3 | Direct |
| flipper-redis | 0.28.3 | Direct |
| flipper-ui | 0.28.3 | Direct |
| foreman | 0.87.2 | Direct |
| gitlab | 4.19.0 | Direct |
| graphiql-rails | 1.9.0 | Direct |
| graphql | 2.6.10 | Direct |
| graphql-pro | 1.30.2 | Direct |
| guard-rspec | 4.7.3 | Direct |
| hubspot-api-client | 19.0.0 | Direct |
| icalendar | 2.12.2 | Direct |
| image_processing | 1.14.0 | Direct |
| invisible_captcha | 2.1.0 | Direct |
| jbuilder | 2.11.5 | Direct |
| jquery-tablesorter | 1.27.2 | Direct |
| jsbundling-rails | 1.0.0 | Direct |
| json_schemer | 0.2.25 | Direct |
| jwe | 1.1.1 | Direct |
| jwt | 3.2.0 | Direct |
| listen | 3.9.0 | Direct |
| logger | 1.7.0 | Direct |
| lograge | 0.12.0 | Direct |
| lograge-sql | 2.5.1 | Direct |
| logstash-event | 1.2.02 | Direct |
| mailgun-ruby | 1.1.10 | Direct |
| matrix | 0.4.2 | Direct |
| mini_racer | 0.22.0 | Direct |
| money | 6.19.0 | Direct |
| multi-select-rails | 0.9.12 | Direct |
| mutex_m | 0.3.0 | Direct |
| net-imap | 0.6.6 | Direct |
| net-pop | 0.1.2 | Direct |
| net-smtp | 0.5.1 | Direct |
| oauth2 | 2.0.22 | Direct |
| observer | 0.1.2 | Direct |
| omniauth-multi-provider | 0.3.0 | Direct |
| omniauth-rails_csrf_protection | 1.0.1 | Direct |
| omniauth-saml | 2.2.5 | Direct |
| ostruct | 0.6.1 | Direct |
| paper_trail | 15.2.0 | Direct |
| paper_trail-globalid | 0.2.0 | Direct |
| parallel_tests | 5.1.0 | Direct |
| pexels | 0.0.4 | Direct |
| pg | 1.5.9 | Direct |
| pg_search | 2.3.6 | Direct |
| prawn | 2.4.0 | Direct |
| prawn-html | 0.7.1 | Direct |
| prawn-table | 0.2.2 | Direct |
| puma | 8.0.2 | Direct |
| pundit | 2.5.2 | Direct |
| pundit-matchers | 1.6.0 | Direct |
| rack-attack | 6.8.0 | Direct |
| rails | 7.2.3.2 | Direct |
| rails-controller-testing | 1.0.5 | Direct |
| rbs | 1.0.4 | Direct |
| recurrence | 1.3.0 | Direct |
| redis-rails | 5.0.2 | Direct |
| reek | 1.3.7 | Direct |
| request_store | 1.7.0 | Direct |
| rest-client | 2.1.0 | Direct |
| roo | 3.0.0 | Direct |
| roo-xls | 2.0.0 | Direct |
| rspec_junit_formatter | 0.5.1 | Direct |
| rspec-rails | 7.1.1 | Direct |
| rspec-retry | 0.6.2 | Direct |
| rubocop | 1.62.1 | Direct |
| rubocop-graphql | 0.10.0 | Direct |
| rubocop-rspec | 2.2.0 | Direct |
| sass-rails | 6.0.0 | Direct |
| scout_apm | 5.3.5 | Direct |
| sentry-rails | 5.23.0 | Direct |
| sentry-ruby | 5.23.0 | Direct |
| sentry-sidekiq | 5.23.0 | Direct |
| shoulda-matchers | 4.5.1 | Direct |
| sidekiq | 7.3.9 | Direct |
| sidekiq-scheduler | 5.0.6 | Direct |
| sidekiq-throttled | 1.4.0 | Direct |
| simplecov | 0.22.0 | Direct |
| simplecov-cobertura | 3.1.0 | Direct |
| slim | 4.1.0 | Direct |
| spring | 3.0.0 | Direct |
| spring-commands-rspec | 1.0.4 | Direct |
| sprockets | 4.2.1 | Direct |
| state_machines-activerecord | 0.8.0 | Direct |
| timecop | 0.9.6 | Direct |
| timezone | 1.3.23 | Direct |
| twitter-typeahead-rails | 0.11.1 | Direct |
| tzinfo | 2.0.6 | Direct |
| uglifier | 4.2.0 | Direct |
| unicode-emoji | 3.5.0 | Direct |
| valid_url | 0.0.4 | Direct |
| vcr | 6.1.0 | Direct |
| webauthn | 3.4.3 | Direct |
| webmock | 3.18.1 | Direct |
| webpacker-svelte | 0.0.0 | Direct |
| will_paginate | 4.0.1 | Direct |

## Front end - direct dependencies (98)
| Component | Version | Type |
|---|---|---|
| @apollo/client | 4.1.6 | Direct (runtime) |
| @babel/core | 7.25.2 | Direct (dev tooling) |
| @babel/plugin-proposal-class-properties | 7.16.0 | Direct (dev tooling) |
| @babel/plugin-proposal-optional-chaining | 7.16.0 | Direct (dev tooling) |
| @babel/plugin-proposal-private-methods | 7.16.0 | Direct (dev tooling) |
| @babel/plugin-proposal-private-property-in-object | 7.16.0 | Direct (dev tooling) |
| @babel/plugin-transform-runtime | 7.15.0 | Direct (dev tooling) |
| @babel/preset-env | 7.16.4 | Direct (dev tooling) |
| @faker-js/faker | 9.7.0 | Direct (dev tooling) |
| @fortawesome/fontawesome-free | 6.5.1 | Direct (runtime) |
| @fullcalendar/adaptive | 6.1.20 | Direct (runtime) |
| @fullcalendar/core | 6.1.20 | Direct (runtime) |
| @fullcalendar/daygrid | 6.1.20 | Direct (runtime) |
| @fullcalendar/interaction | 6.1.20 | Direct (runtime) |
| @fullcalendar/list | 6.1.20 | Direct (runtime) |
| @fullcalendar/moment | 6.1.20 | Direct (runtime) |
| @fullcalendar/moment-timezone | 6.1.20 | Direct (runtime) |
| @fullcalendar/resource | 6.1.20 | Direct (runtime) |
| @fullcalendar/resource-daygrid | 6.1.20 | Direct (runtime) |
| @fullcalendar/resource-timegrid | 6.1.20 | Direct (runtime) |
| @fullcalendar/resource-timeline | 6.1.20 | Direct (runtime) |
| @fullcalendar/timegrid | 6.1.20 | Direct (runtime) |
| @graphql-codegen/cli | 5.0.2 | Direct (dev tooling) |
| @graphql-codegen/typescript | 4.0.9 | Direct (dev tooling) |
| @rails/activestorage | 8.1.200 | Direct (runtime) |
| @redocly/cli | 2.64.0 | Direct (runtime) |
| @storybook/addon-docs | 9.0.15 | Direct (dev tooling) |
| @storybook/addon-links | 9.0.15 | Direct (dev tooling) |
| @storybook/addon-svelte-csf | 5.0.4 | Direct (dev tooling) |
| @storybook/svelte-vite | 9.0.15 | Direct (dev tooling) |
| @sveltejs/vite-plugin-svelte | 5.0.3 | Direct (dev tooling) |
| @testing-library/dom | 10.4.0 | Direct (dev tooling) |
| @testing-library/jest-dom | 6.6.3 | Direct (dev tooling) |
| @testing-library/svelte | 5.2.7 | Direct (dev tooling) |
| @testing-library/user-event | 14.6.1 | Direct (dev tooling) |
| @vitest/coverage-v8 | 3.1.1 | Direct (dev tooling) |
| @vitest/ui | 3.2.4 | Direct (dev tooling) |
| ahoy.js | 0.4.4 | Direct (runtime) |
| babel-loader | 8.2.5 | Direct (dev tooling) |
| bootstrap | 4.6.2 | Direct (runtime) |
| dompurify | 3.3.3 | Direct (runtime) |
| downloadjs | 1.4.7 | Direct (runtime) |
| enforce-unique | 1.3.0 | Direct (dev tooling) |
| esbuild | 0.14.42, 0.25.2, 0.25.5 | Direct (dev tooling) |
| esbuild-plugin-import-glob | 0.1.1 | Direct (dev tooling) |
| esbuild-sass-plugin | 2.2.6 | Direct (dev tooling) |
| esbuild-svelte | 0.9.2 | Direct (dev tooling) |
| eslint | 8.56.0, 8.57.1 | Direct (dev tooling) |
| eslint-plugin-import | 2.25.2 | Direct (dev tooling) |
| eslint-plugin-storybook | 9.0.15 | Direct (dev tooling) |
| eslint-plugin-svelte3 | 3.2.1 | Direct (dev tooling) |
| fuzzybear | 1.0.1 | Direct (runtime) |
| graphql | 16.13.1 | Direct (runtime) |
| jest-extended | 4.0.2 | Direct (dev tooling) |
| jquery | 3.7.1 | Direct (runtime) |
| jsdom | 26.1.0 | Direct (dev tooling) |
| lodash | 4.17.21 | Direct (dev tooling) |
| lodash-es | 4.17.23 | Direct (runtime) |
| marked | 17.0.4 | Direct (runtime) |
| moment | 2.30.1 | Direct (runtime) |
| moment-range | 4.0.2 | Direct (runtime) |
| moment-timezone | 0.5.45 | Direct (runtime) |
| msw | 2.7.5 | Direct (dev tooling) |
| msw-storybook-addon | 2.0.5 | Direct (dev tooling) |
| overlayscrollbars | 2.14.0 | Direct (runtime) |
| papaparse | 5.5.3 | Direct (runtime) |
| popper.js | 1.16.1 | Direct (runtime) |
| postcss | 8.5.5 | Direct (dev tooling) |
| postcss-flexbugs-fixes | 5.0.2 | Direct (runtime) |
| postcss-import | 14.1.0 | Direct (dev tooling) |
| postcss-preset-env | 7.7.1 | Direct (dev tooling) |
| prettier | 3.5.3 | Direct (dev tooling) |
| prettier-eslint | 16.4.2 | Direct (dev tooling) |
| prettier-plugin-svelte | 3.4.0 | Direct (dev tooling) |
| promise-retry | 2.0.1 | Direct (runtime) |
| qrious | 4.0.2 | Direct (runtime) |
| quill | 2.0.3 | Direct (runtime) |
| quill-delta | 5.1.0 | Direct (runtime) |
| quill-delta-to-html | 0.12.1 | Direct (runtime) |
| resize-observer-polyfill | 1.5.1 | Direct (dev tooling) |
| rrule | 2.6.6 | Direct (runtime) |
| rxjs | 7.8.2 | Direct (runtime) |
| sass-loader | 13.0.0 | Direct (dev tooling) |
| storybook | 9.1.21 | Direct (dev tooling) |
| subscriptions-transport-ws | 0.11.0 | Direct (runtime) |
| svelte | 5.54.0 | Direct (runtime) |
| svelte-carousel | 1.0.25 | Direct (runtime) |
| svelte-eslint-parser | 1.2.0 | Direct (dev tooling) |
| svelte-flatpickr | 3.3.5 | Direct (runtime) |
| svelte-preprocess | 6.0.3 | Direct (dev tooling) |
| svelte-select | 5.8.3 | Direct (runtime) |
| svelte-spa-router | 5.0.1 | Direct (runtime) |
| swipecalendar | 3.0.10 | Direct (runtime) |
| uuid | 13.0.0 | Direct (runtime) |
| vite | 6.3.3 | Direct (dev tooling) |
| vitest | 3.2.4 | Direct (dev tooling) |
| vitest-dom | 0.1.1 | Direct (dev tooling) |
| webpacker-svelte | 1.0.0 | Direct (dev tooling) |

## Vendored files (copied into the repo, not tracked by a package manager)
| File | Version guess | Path |
|---|---|---|
| .keep | (see file header) | vendor\assets\javascripts\.keep |
| bootstrap-datepicker.min.js | (see file header) | vendor\assets\javascripts\bootstrap-datepicker.min.js |
| bootstrap-tagsinput.js | (see file header) | vendor\assets\javascripts\bootstrap-tagsinput.js |
| daterangepicker.js | (see file header) | vendor\assets\javascripts\daterangepicker.js |
| jquery.browser.js | (see file header) | vendor\assets\javascripts\jquery.browser.js |
| jquery.connections.js | (see file header) | vendor\assets\javascripts\jquery.connections.js |
| jquery.easing-1.3.pack.js | 1.3 | vendor\assets\javascripts\jquery.easing-1.3.pack.js |
| jquery.fancybox-1.3.4.pack.js | 1.3.4 | vendor\assets\javascripts\jquery.fancybox-1.3.4.pack.js |
| jquery.mousewheel-3.0.4.pack.js | 3.0.4 | vendor\assets\javascripts\jquery.mousewheel-3.0.4.pack.js |
| jquery.quicksearch.js | (see file header) | vendor\assets\javascripts\jquery.quicksearch.js |
| jquery.timepicker.min.js | (see file header) | vendor\assets\javascripts\jquery.timepicker.min.js |
| select2.js | (see file header) | vendor\assets\javascripts\select2.js |
| slidr.min.js | (see file header) | vendor\assets\javascripts\slidr.min.js |
| .keep | (see file header) | vendor\assets\stylesheets\.keep |
| active_admin_theme.scss | (see file header) | vendor\assets\stylesheets\active_admin_theme.scss |
| bootstrap-datepicker3.min.css | (see file header) | vendor\assets\stylesheets\bootstrap-datepicker3.min.css |
| bootstrap-datepicker3.standalone.css | (see file header) | vendor\assets\stylesheets\bootstrap-datepicker3.standalone.css |
| bootstrap-tagsinput.css | (see file header) | vendor\assets\stylesheets\bootstrap-tagsinput.css |
| daterangepicker.css | (see file header) | vendor\assets\stylesheets\daterangepicker.css |
| jquery-ui.css | (see file header) | vendor\assets\stylesheets\jquery-ui.css |
| jquery-ui.structure.css | (see file header) | vendor\assets\stylesheets\jquery-ui.structure.css |
| jquery-ui.theme.css | (see file header) | vendor\assets\stylesheets\jquery-ui.theme.css |
| jquery.fancybox-1.3.4.css.scss | 1.3.4 | vendor\assets\stylesheets\jquery.fancybox-1.3.4.css.scss |
| jquery.timepicker.css | (see file header) | vendor\assets\stylesheets\jquery.timepicker.css |
| select2.css | (see file header) | vendor\assets\stylesheets\select2.css |

