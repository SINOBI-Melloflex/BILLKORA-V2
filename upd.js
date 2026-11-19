const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=__dirname,REPO='SINOBI-Melloflex/BILLKORA-V2',BR='main';
const RAW='https://raw.githubusercontent.com/'+REPO+'/'+BR+'/package.json';
const ZIP='https://github.com/'+REPO+'/archive/refs/heads/'+BR+'.zip';
const cur=()=>{try{return JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8')).version||'0.0.0'}catch(e){return '0.0.0'}};
const cmp=(a,b)=>{const x=String(a).split('.').map(n=>parseInt(n,10)||0),y=String(b).split('.').map(n=>parseInt(n,10)||0);for(let i=0;i<3;i++){if((x[i]||0)>(y[i]||0))return 1;if((x[i]||0)<(y[i]||0))return -1}return 0};
const fr=e=>{const m=String((e&&e.message)||e);if((e&&e.name==='TimeoutError')||m==='fetch failed')return 'Could not reach GitHub. Check the internet connection of this computer.';return m};
async function latest(){
 const r=await fetch(RAW+'?t='+Date.now(),{signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('Could not read the repository (HTTP '+r.status+')');
 const j=await r.json();if(!j.version)throw new Error('The repository has no version number');return String(j.version);
}
const PS=String.raw`param([string]$Root,[string]$NodeExe,[int]$Port=4050)
$ErrorActionPreference='Continue'
$tmp=Join-Path $Root 'update-tmp'
$log=Join-Path $tmp 'update.log'
function L($m){((Get-Date -Format 'HH:mm:ss')+' '+$m) | Out-File $log -Append -Encoding utf8}
$bk=$null
try{
 Start-Sleep -Seconds 2
 $x=Join-Path $tmp 'x'
 Expand-Archive -LiteralPath (Join-Path $tmp 'update.zip') -DestinationPath $x -Force
 $src=Get-ChildItem $x -Directory | Select-Object -First 1
 if(-not $src -or -not (Test-Path (Join-Path $src.FullName 'server.js'))){throw 'The package has no server.js'}
 L 'package ok'
 Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
 Start-Sleep -Seconds 2
 $bk=Join-Path $Root ('update-backup-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
 New-Item -ItemType Directory -Path $bk -Force | Out-Null
 robocopy $Root $bk /E /XD data runtime node_modules update-tmp 'update-backup-*' .git /XF *.log /NFL /NDL /NJH /NJS /NP | Out-Null
 robocopy $src.FullName $Root /E /XD data runtime node_modules update-tmp .git /XF *.log *.lnk .gitignore Start-BillKora.bat launch.vbs BillKora.ps1 /NFL /NDL /NJH /NJS /NP | Out-Null
 if($LASTEXITCODE -ge 8){throw ('copy failed, code '+$LASTEXITCODE)}
 L 'files copied'
 Get-ChildItem $Root -Directory -Filter 'update-backup-*' | Sort-Object Name -Descending | Select-Object -Skip 3 | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}catch{
 L ('ERROR '+$_.Exception.Message)
 if($bk -and (Test-Path $bk)){ robocopy $bk $Root /E /XD data runtime node_modules update-tmp 'update-backup-*' .git /NFL /NDL /NJH /NJS /NP | Out-Null; L 'restored from backup' }
}
Start-Process -FilePath $NodeExe -ArgumentList 'server.js' -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $Root 'server-upd.log') -RedirectStandardError (Join-Path $Root 'server-upd-err.log')
L 'server started'
`;
let busy=false;
async function apply(){
 if(busy)throw new Error('An update is already running');
 busy=true;
 try{
  const lv=await latest();
  if(cmp(lv,cur())<=0){busy=false;return{ok:true,upToDate:true,version:cur()}}
  const tmp=path.join(ROOT,'update-tmp');
  fs.rmSync(tmp,{recursive:true,force:true});fs.mkdirSync(tmp,{recursive:true});
  const r=await fetch(ZIP,{signal:AbortSignal.timeout(180000)});
  if(!r.ok)throw new Error('Download failed (HTTP '+r.status+')');
  const buf=Buffer.from(await r.arrayBuffer());
  if(buf.length<2000||buf[0]!==0x50||buf[1]!==0x4B)throw new Error('The downloaded file is not a valid update package');
  fs.writeFileSync(path.join(tmp,'update.zip'),buf);
  fs.writeFileSync(path.join(tmp,'apply.ps1'),PS);
  const ch=cp.spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-WindowStyle','Hidden','-File',path.join(tmp,'apply.ps1'),'-Root',ROOT,'-NodeExe',process.execPath,'-Port','4050'],{detached:true,stdio:'ignore',windowsHide:true});
  ch.unref();
  return{ok:true,version:lv,restarting:true};
 }catch(e){busy=false;throw e}
}
module.exports=function(col,id,act,M,b,ok,bad,db,save,uid,now,str){
 if(col==='updver'&&M==='GET'){ok({version:cur()});return true}
 if(col==='updinfo'&&M==='GET'){latest().then(l=>ok({ok:true,current:cur(),latest:l,newer:cmp(l,cur())>0})).catch(e=>ok({ok:false,current:cur(),msg:fr(e)}));return true}
 if(col==='updapply'&&M==='POST'){apply().then(ok).catch(e=>bad(fr(e)));return true}
 return false;
};