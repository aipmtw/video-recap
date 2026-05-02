# Build + zip-deploy the Next.js standalone bundle to Azure App Service.
#
# Prereqs:
#   - az login (as mark.pl.chen@toastmasters.org.tw)
#   - infra/bicep already deployed -> $ResourceGroup contains $SiteName
#
# Usage:
#   .\scripts\deploy.ps1 -ResourceGroup rg-video-recap -SiteName app-video-recap

param(
    [Parameter(Mandatory = $true)] [string] $ResourceGroup,
    [Parameter(Mandatory = $true)] [string] $SiteName
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "==> Installing dependencies"
npm ci

Write-Host "==> Building Next.js (standalone)"
npm run build

$bundle = Join-Path $root '.next\standalone'
if (-not (Test-Path $bundle)) {
    throw "Standalone bundle not found at $bundle. Check next.config.mjs has output: 'standalone'."
}

Write-Host "==> Assembling deploy bundle"
$bundleStatic = Join-Path $bundle '.next\static'
New-Item -ItemType Directory -Force -Path (Split-Path $bundleStatic -Parent) | Out-Null
Copy-Item -Recurse -Force '.next\static' $bundleStatic
if (Test-Path 'public') {
    Copy-Item -Recurse -Force 'public' (Join-Path $bundle 'public')
}

$zip = Join-Path $root 'deploy.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }

Write-Host "==> Creating $zip (POSIX-compliant entries; excludes .env)"
# Compress-Archive writes Windows backslashes inside zip entries which break
# extraction on Linux Kudu (rsync exit 23). Use the cross-platform Node helper.
node scripts/zip-bundle.mjs

Write-Host "==> Deploying to App Service: $SiteName"
az webapp deploy `
    --resource-group $ResourceGroup `
    --name $SiteName `
    --src-path $zip `
    --type zip

$hostname = az webapp show -g $ResourceGroup -n $SiteName --query defaultHostName -o tsv
Write-Host "==> Live: https://$hostname"
Write-Host "==> Archive: https://$hostname/video-recap"
