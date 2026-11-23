$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$url = 'https://raw.githubusercontent.com/SINOBI-Melloflex/BILLKORA-V2/main/upd.js'
$root = $null
try {
  $p = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'server\.js' -and $_.ExecutablePath } | Select-Object -First 1
  if ($p) { $d = Split-Path (Split-Path $p.ExecutablePath); if (Test-Path (Join-Path $d 'server.js')) { $root = $d } }
} catch {}
if (-not $root) {
  foreach ($c in @("$env:ProgramFiles\BillKora", "${env:ProgramFiles(x86)}\BillKora", "$env:LOCALAPPDATA\BillKora", "$env:LOCALAPPDATA\Programs\BillKora", 'C:\BillKora')) {
    if (Test-Path (Join-Path $c 'server.js')) { $root = $c; break }
  }
}
if (-not $root) {
  $root = (Read-Host 'BillKora folder path (the folder that contains server.js)').Trim('"')
}
if (-not (Test-Path (Join-Path $root 'server.js'))) { Write-Host "BillKora not found in: $root" -ForegroundColor Red; return }
Write-Host "BillKora folder: $root"
$new = (Invoke-WebRequest $url -UseBasicParsing).Content
if ($new -is [byte[]]) { $new = [Text.Encoding]::UTF8.GetString($new) }
if ($new.Length -lt 3000 -or $new -notmatch 'updapply' -or $new -notmatch 'module\.exports') { Write-Host 'Downloaded file looks wrong. Nothing changed.' -ForegroundColor Red; return }
$target = Join-Path $root 'upd.js'
Copy-Item $target (Join-Path $root 'upd.js.old') -Force -ErrorAction SilentlyContinue
[IO.File]::WriteAllText($target, $new, (New-Object Text.UTF8Encoding $false))
$prefix = $root.TrimEnd('\') + '\'
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
$node = Join-Path $root 'runtime\node.exe'
if (-not (Test-Path $node)) { $ref = Join-Path $root 'runtime\node-path.txt'; if (Test-Path $ref) { $node = (Get-Content $ref -Raw).Trim() } }
Start-Process -FilePath $node -ArgumentList 'server.js' -WorkingDirectory $root -WindowStyle Hidden
Write-Host 'Fixed. Now open BillKora and press Check for update.' -ForegroundColor Green