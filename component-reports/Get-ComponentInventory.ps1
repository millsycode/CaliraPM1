<#
.SYNOPSIS
  Lists every front end and back end component (with version) used by app-clustermarket.

.DESCRIPTION
  Read-only. Reads the lock files in the app folder; nothing is installed, changed or sent anywhere.
    Back end  : Gemfile.lock       (Ruby gems)
    Front end : yarn.lock          (npm packages; this is what the Dockerfile installs for production)
                package.json       (marks which packages are ones we chose vs. pulled in by another package)
    Runtime   : .ruby-version, Dockerfile (base image, Node, OS packages)
    Vendored  : vendor/assets/javascripts (files copied into the repo by hand)

  Writes two files to the output folder:
    component-inventory-<date>.csv  full list (open in Excel, filter by Layer / Name)
    component-inventory-<date>.md   readable summary (runtime + direct dependencies)

.PARAMETER AppPath
  Folder containing Gemfile.lock / package.json. Defaults to the Clustermarket checkout.

.PARAMETER OutDir
  Where to write reports. Defaults to a "component-reports" folder next to this script.

.PARAMETER Search
  One or more names to look for, e.g. -Search brotli,openssl. Matches component names
  and also checks vendored files, the Dockerfile and installed node_modules folders.

.EXAMPLE
  .\Get-ComponentInventory.ps1
  .\Get-ComponentInventory.ps1 -Search brotli
#>
[CmdletBinding()]
param(
    [string]$AppPath = 'C:\Users\mills\Documents\Code\Clustermarket\app-clustermarket',
    [string]$OutDir  = '',
    [string[]]$Search = @()
)

$ErrorActionPreference = 'Stop'
if (-not $OutDir) {
    $here = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $OutDir = Join-Path $here 'component-reports'
}

if (-not (Test-Path -LiteralPath $AppPath)) { throw "App folder not found: $AppPath" }
$AppPath = (Resolve-Path -LiteralPath $AppPath).Path
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$items = New-Object System.Collections.Generic.List[object]
function Add-Item($layer, $eco, $name, $version, $kind, $source) {
    $items.Add([pscustomobject]@{
        Layer = $layer; Ecosystem = $eco; Name = $name; Version = $version; Kind = $kind; Source = $source
    })
}
function Read-Lines($file) {
    $p = Join-Path $AppPath $file
    if (Test-Path -LiteralPath $p) { return Get-Content -LiteralPath $p } else { Write-Warning "$file not found - skipped"; return @() }
}

# ---------------------------------------------------------------- Back end: Gemfile.lock
$gemLines = Read-Lines 'Gemfile.lock'
$gemSpecs = @{}      # name -> list of versions
$gemRemote = @{}     # name -> source
$directGems = @{}    # name -> version constraint from Gemfile
$section = ''; $inSpecs = $false; $remote = ''
foreach ($line in $gemLines) {
    if ($line -match '^[A-Z][A-Z ]+$') { $section = $line.Trim(); $inSpecs = $false; $remote = ''; continue }
    if ($section -in 'GEM', 'GIT', 'PATH') {
        if ($line -match '^\s{2}(remote|path):\s*(.+)$') { $remote = $Matches[2]; continue }
        if ($line -match '^\s{2}specs:') { $inSpecs = $true; continue }
        if ($inSpecs -and $line -match '^\s{4}(\S+) \(([^)]+)\)\s*$') {
            $n = $Matches[1]; $v = $Matches[2]
            if (-not $gemSpecs.ContainsKey($n)) { $gemSpecs[$n] = New-Object System.Collections.Generic.List[string] }
            $gemSpecs[$n].Add($v); $gemRemote[$n] = $remote
        }
    }
    elseif ($section -eq 'DEPENDENCIES') {
        if ($line -match '^\s{2}(\S+?)!?(?: \((.+)\))?!?\s*$') { $directGems[$Matches[1]] = $Matches[2] }
    }
    elseif ($section -eq 'RUBY VERSION' -and $line -match 'ruby (\S+)') { $rubyLocked = $Matches[1] }
    elseif ($section -eq 'BUNDLED WITH' -and $line -match '\S') { $bundler = $line.Trim() }
}
foreach ($n in ($gemSpecs.Keys | Sort-Object)) {
    $kind = if ($directGems.ContainsKey($n)) { 'Direct' } else { 'Indirect' }
    Add-Item 'Back end' 'Ruby gem' $n (($gemSpecs[$n] | Select-Object -Unique) -join ', ') $kind $gemRemote[$n]
}

# ---------------------------------------------------------------- Front end: yarn.lock + package.json
$yarnVersions = @{}   # name -> versions
$yarnByKey = @{}      # "name@range" -> version
$curKeys = @()
foreach ($line in (Read-Lines 'yarn.lock')) {
    if ($line -match '^\S' -and $line -notmatch '^#' -and $line.TrimEnd().EndsWith(':')) {
        $curKeys = $line.TrimEnd().TrimEnd(':').Split(',') | ForEach-Object { $_.Trim().Trim('"') }
    }
    elseif ($line -match '^\s{2}version "?([^"]+)"?\s*$' -and $curKeys.Count) {
        $v = $Matches[1]
        foreach ($k in $curKeys) {
            $at = $k.LastIndexOf('@'); if ($at -lt 1) { continue }
            $n = $k.Substring(0, $at)
            if (-not $yarnVersions.ContainsKey($n)) { $yarnVersions[$n] = New-Object System.Collections.Generic.List[string] }
            if (-not $yarnVersions[$n].Contains($v)) { $yarnVersions[$n].Add($v) }
            $yarnByKey[$k] = $v
        }
        $curKeys = @()
    }
}
$pkgPath = Join-Path $AppPath 'package.json'
$directJs = @{}   # name -> 'Direct (runtime)' / 'Direct (dev tooling)'
$nodeEngine = $null
if (Test-Path -LiteralPath $pkgPath) {
    $pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json
    if ($pkg.engines.node) { $nodeEngine = $pkg.engines.node }
    foreach ($grp in @(@('dependencies', 'Direct (runtime)'), @('devDependencies', 'Direct (dev tooling)'))) {
        $obj = $pkg.($grp[0]); if (-not $obj) { continue }
        foreach ($p in $obj.PSObject.Properties) {
            $directJs[$p.Name] = $grp[1]
            $key = "$($p.Name)@$($p.Value)"
            if ($yarnByKey.ContainsKey($key) -and -not $yarnVersions.ContainsKey($p.Name)) { $yarnVersions[$p.Name] = @($yarnByKey[$key]) }
        }
    }
}
foreach ($n in ($yarnVersions.Keys | Sort-Object)) {
    $kind = if ($directJs.ContainsKey($n)) { $directJs[$n] } else { 'Indirect' }
    Add-Item 'Front end' 'npm package' $n (($yarnVersions[$n] | Sort-Object) -join ', ') $kind 'yarn.lock'
}
foreach ($n in $directJs.Keys) {
    if (-not $yarnVersions.ContainsKey($n)) { Add-Item 'Front end' 'npm package' $n '(not in yarn.lock)' $directJs[$n] 'package.json' }
}

# ---------------------------------------------------------------- Runtime / system (Dockerfile, .ruby-version)
$runtime = New-Object System.Collections.Generic.List[object]
function Add-Runtime($name, $version, $note) {
    $runtime.Add([pscustomobject]@{ Name = $name; Version = $version; Note = $note })
    Add-Item 'Runtime' 'Platform' $name $version 'Platform' $note
}
$rubyFile = Join-Path $AppPath '.ruby-version'
if (Test-Path -LiteralPath $rubyFile) { Add-Runtime 'Ruby' ((Get-Content -LiteralPath $rubyFile -Raw).Trim()) '.ruby-version' }
if ($bundler) { Add-Runtime 'Bundler' $bundler 'Gemfile.lock' }
if ($nodeEngine) { Add-Runtime 'Node.js (required by package.json)' $nodeEngine 'package.json engines' }

$dockerPath = Join-Path $AppPath 'Dockerfile'
$dockerText = ''
if (Test-Path -LiteralPath $dockerPath) {
    $dockerText = (Get-Content -LiteralPath $dockerPath -Raw) -replace '\\\r?\n', ' '
    $args0 = @{}
    foreach ($m in [regex]::Matches($dockerText, '(?m)^ARG\s+(\w+)=(\S+)')) { $args0[$m.Groups[1].Value] = $m.Groups[2].Value }
    foreach ($m in [regex]::Matches($dockerText, '(?m)^FROM\s+(\S+)')) {
        $img = $m.Groups[1].Value
        foreach ($k in $args0.Keys) { $img = $img.Replace('${' + $k + '}', $args0[$k]) }
        if ($img -notmatch '^(base-|build-|bootstnap)') { Add-Runtime 'Docker base image' $img 'Dockerfile (FROM)' }
    }
    $nodeSrc = [regex]::Match($dockerText, 'setup_(\d+)\.x')
    if ($nodeSrc.Success) { Add-Runtime 'Node.js (installed in Docker build)' "$($nodeSrc.Groups[1].Value).x" 'Dockerfile (nodesource)' }
    $apt = @{}
    foreach ($m in [regex]::Matches($dockerText, 'apt-get install([^&;|]*)')) {
        foreach ($tok in ($m.Groups[1].Value -split '\s+')) {
            if ($tok -and $tok -notmatch '^-' -and $tok -ne '\') { $apt[$tok] = $true }
        }
    }
    foreach ($n in ($apt.Keys | Sort-Object)) { Add-Runtime "OS package: $n" '(latest from Debian at build time)' 'Dockerfile (apt-get)' }
}

# ---------------------------------------------------------------- Vendored files copied into the repo
$vendorDir = Join-Path $AppPath 'vendor'
$vendored = @()
if (Test-Path -LiteralPath $vendorDir) {
    $vendored = Get-ChildItem -LiteralPath $vendorDir -Recurse -File -Include *.js, *.css, *.scss, *.woff, *.woff2, *.ttf, *.svg -ErrorAction SilentlyContinue
    foreach ($f in $vendored) {
        $ver = [regex]::Match($f.BaseName, '(\d+\.\d+(\.\d+)*)').Value
        if (-not $ver) { $ver = '(see file header)' }
        $rel = $f.FullName.Substring($AppPath.Length + 1)
        Add-Item 'Front end' 'Vendored file' $f.Name $ver 'Vendored' $rel
    }
}

# ---------------------------------------------------------------- Reports
$stamp = Get-Date -Format 'yyyy-MM-dd'
$csv = Join-Path $OutDir "component-inventory-$stamp.csv"
$md  = Join-Path $OutDir "component-inventory-$stamp.md"
$items | Export-Csv -LiteralPath $csv -NoTypeInformation -Encoding UTF8

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# Component inventory - app-clustermarket")
[void]$sb.AppendLine("Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm') from ``$AppPath``.")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Direct = a package we chose to depend on. Indirect = pulled in by another package (still shipped / still a risk).")
[void]$sb.AppendLine("Full list incl. indirect: ``$(Split-Path $csv -Leaf)``.")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Runtime and system")
[void]$sb.AppendLine("| Component | Version | Where from |"); [void]$sb.AppendLine("|---|---|---|")
foreach ($r in $runtime) { [void]$sb.AppendLine("| $($r.Name) | $($r.Version) | $($r.Note) |") }
foreach ($layer in 'Back end', 'Front end') {
    $direct = $items | Where-Object { $_.Layer -eq $layer -and $_.Kind -like 'Direct*' }
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## $layer - direct dependencies ($(@($direct).Count))")
    [void]$sb.AppendLine("| Component | Version | Type |"); [void]$sb.AppendLine("|---|---|---|")
    foreach ($i in $direct) { [void]$sb.AppendLine("| $($i.Name) | $($i.Version) | $($i.Kind) |") }
}
if ($vendored.Count) {
    [void]$sb.AppendLine(""); [void]$sb.AppendLine("## Vendored files (copied into the repo, not tracked by a package manager)")
    [void]$sb.AppendLine("| File | Version guess | Path |"); [void]$sb.AppendLine("|---|---|---|")
    foreach ($i in ($items | Where-Object Kind -eq 'Vendored')) { [void]$sb.AppendLine("| $($i.Name) | $($i.Version) | $($i.Source) |") }
}
Set-Content -LiteralPath $md -Value $sb.ToString() -Encoding UTF8

# ---------------------------------------------------------------- Console summary
Write-Host ""
Write-Host "Component inventory for $AppPath" -ForegroundColor Cyan
$items | Group-Object Layer, Ecosystem | ForEach-Object {
    $direct = @($_.Group | Where-Object { $_.Kind -like 'Direct*' }).Count
    '{0,-28} {1,5} total   {2,4} direct' -f $_.Name, $_.Count, $direct | Write-Host
}
Write-Host ""
Write-Host "CSV : $csv"
Write-Host "MD  : $md"

# Warn if the two JS lock files disagree (production uses yarn.lock)
$npmLock = Join-Path $AppPath 'package-lock.json'
if (Test-Path -LiteralPath $npmLock) {
    $npmVer = @{}
    foreach ($m in [regex]::Matches((Get-Content -LiteralPath $npmLock -Raw), '"node_modules/((?:@[^/"]+/)?[^/"]+)":\s*\{\s*"version":\s*"([^"]+)"')) {
        $npmVer[$m.Groups[1].Value] = $m.Groups[2].Value
    }
    $drift = @($directJs.Keys | Where-Object { $npmVer.ContainsKey($_) -and $yarnVersions.ContainsKey($_) -and ($yarnVersions[$_] -notcontains $npmVer[$_]) })
    if ($drift.Count) {
        Write-Host ""
        Write-Warning "yarn.lock and package-lock.json disagree on $($drift.Count) direct package(s) (e.g. $($drift[0..([Math]::Min(2,$drift.Count-1))] -join ', ')). The Dockerfile uses yarn.lock, which is what this report shows."
    }
}

# ---------------------------------------------------------------- Optional search
foreach ($term in $Search) {
    Write-Host ""
    Write-Host "Search: '$term'" -ForegroundColor Cyan
    $hits = @($items | Where-Object { $_.Name -like "*$term*" })
    if ($hits.Count) { $hits | Format-Table Layer, Name, Version, Kind, Source -AutoSize | Out-String | Write-Host }
    else { Write-Host "  No package or gem named like '$term' in the lock files (Gemfile.lock, yarn.lock, vendor/, Dockerfile packages)." }

    $nm = Join-Path $AppPath 'node_modules'
    if (Test-Path -LiteralPath $nm) {
        $dirs = @(Get-ChildItem -LiteralPath $nm -Directory -Recurse -Depth 3 -Filter "*$term*" -ErrorAction SilentlyContinue)
        if ($dirs.Count) { Write-Host "  Found in installed node_modules:"; $dirs | Select-Object -First 10 | ForEach-Object { Write-Host "    $($_.FullName.Substring($AppPath.Length + 1))" } }
    }
    if ($dockerText -match $term) { Write-Host "  Mentioned in Dockerfile." }
    Write-Host "  Note: a package does not have to be listed to be present. Node.js, Ruby, curl/libcurl and the Debian base image can bundle compression libraries (Brotli included) inside themselves - check the Runtime rows above for their versions." -ForegroundColor DarkGray
}
