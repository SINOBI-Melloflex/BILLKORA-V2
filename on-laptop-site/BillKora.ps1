Add-Type -AssemblyName System.Windows.Forms,System.Drawing
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$ico = Join-Path $root 'billkora2.ico'
$profileDir = Join-Path $root '.profile'
function Up { try { (New-Object Net.Sockets.TcpClient('127.0.0.1',4050)).Close(); $true } catch { $false } }
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe","$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
function OpenApp {
  if ($edge) { Start-Process $edge -ArgumentList "--app=http://localhost:4050","--user-data-dir=`"$profileDir`"","--window-size=1366,820","--disable-background-mode","--no-first-run" -PassThru }
  else { Start-Process "http://localhost:4050"; $null }
}
function ProfileEdge {
  @(Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*.profile*' })
}
function HasWin {
  if (-not $edge) { return $true }
  try {
    foreach ($e in (ProfileEdge)) {
      $p = Get-Process -Id $e.ProcessId -ErrorAction SilentlyContinue
      if ($p -and $p.MainWindowHandle -ne 0) { return $true }
    }
  } catch { return $true }
  return $false
}
if (Up) { OpenApp | Out-Null; exit }
$node = Join-Path $root 'runtime\node.exe'
if (-not (Test-Path $node)) { $node = (Get-Command node -ErrorAction SilentlyContinue).Source }
if (-not $node) { $node = "$env:ProgramFiles\nodejs\node.exe" }
$srv = Start-Process $node -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden -PassThru
for ($i=0; $i -lt 40 -and -not (Up); $i++) { Start-Sleep -Milliseconds 250 }
function Ask {
  $f = New-Object Windows.Forms.Form; $f.Text='BillKora'; $f.Size='400,170'; $f.StartPosition='CenterScreen'
  $f.FormBorderStyle='FixedDialog'; $f.MaximizeBox=$false; $f.MinimizeBox=$false; $f.TopMost=$true
  $l = New-Object Windows.Forms.Label; $l.Text='Closing BillKora - what do you want to do?'; $l.AutoSize=$true; $l.Location='20,20'
  $b1 = New-Object Windows.Forms.Button; $b1.Text='Run in Background'; $b1.Size='160,36'; $b1.Location='20,60'; $b1.DialogResult='Yes'
  $b2 = New-Object Windows.Forms.Button; $b2.Text='Close Permanently'; $b2.Size='160,36'; $b2.Location='200,60'; $b2.DialogResult='No'
  $f.Controls.AddRange(@($l,$b1,$b2)); "$($f.ShowDialog())"
}
function QuitApp {
  $tray.Visible = $false
  if ($srv -and -not $srv.HasExited) { Stop-Process -Id $srv.Id -Force }
  foreach ($e in (ProfileEdge)) { Stop-Process -Id $e.ProcessId -Force -ErrorAction SilentlyContinue }
  [Windows.Forms.Application]::Exit()
}
$script:seen = $false
$script:win = OpenApp
$tray = New-Object Windows.Forms.NotifyIcon
$tray.Icon = New-Object Drawing.Icon($ico); $tray.Text = 'BillKora (running)'; $tray.Visible = $true
$menu = New-Object Windows.Forms.ContextMenuStrip
$mi1 = $menu.Items.Add('Open BillKora'); $mi1.add_Click({ $script:win = OpenApp })
$mi2 = $menu.Items.Add('Exit BillKora'); $mi2.add_Click({ QuitApp })
$tray.ContextMenuStrip = $menu
$tray.add_DoubleClick({ $script:win = OpenApp })
$timer = New-Object Windows.Forms.Timer; $timer.Interval = 1000
$timer.add_Tick({
  $w = HasWin
  if ($w) { $script:seen = $true; return }
  if ($script:seen -or ($script:win -and $script:win.HasExited)) {
    $timer.Stop()
    $script:seen = $false; $script:win = $null
    if ((Ask) -eq 'No') { QuitApp } else { $timer.Start() }
  }
})
$timer.Start()
[Windows.Forms.Application]::Run()
