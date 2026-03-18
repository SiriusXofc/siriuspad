param(
  [ValidateSet("msi", "exe")]
  [string]$Format = "msi",
  [string]$Repo = "Nic85796/siriuspad"
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Error "SiriusPad install error: $Message"
  exit 1
}

try {
  $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
} catch {
  Fail "could not fetch the latest release for $Repo. Make sure a release is published."
}

$extension = if ($Format -eq "msi") { ".msi" } else { ".exe" }
$asset = $release.assets | Where-Object { $_.browser_download_url -like "*$extension" } | Select-Object -First 1

if (-not $asset) {
  Fail "latest release does not contain a $extension asset yet."
}

$tempDir = Join-Path $env:TEMP "siriuspad-install"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$assetPath = Join-Path $tempDir $asset.name

Write-Host "Downloading $($asset.browser_download_url)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $assetPath

if ($Format -eq "msi") {
  Write-Host "Running MSI installer..."
  Start-Process msiexec.exe -ArgumentList "/i `"$assetPath`" /passive /norestart" -Wait -NoNewWindow
} else {
  Write-Host "Running EXE installer..."
  Start-Process -FilePath $assetPath -ArgumentList "/S" -Wait
}

Write-Host "SiriusPad install completed successfully."
