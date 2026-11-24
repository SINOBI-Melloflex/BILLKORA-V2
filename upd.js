const fs=require('fs'),path=require('path'),cp=require('child_process'),zlib=require('zlib');
const ROOT=__dirname,REPO='SINOBI-Melloflex/BILLKORA-V2',BR='main';
const RAW='https://raw.githubusercontent.com/'+REPO+'/'+BR+'/package.json';
const ZIP='https://github.com/'+REPO+'/archive/refs/heads/'+BR+'.zip';
const cur=()=>{try{return JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8').replace(/^\uFEFF/,'')).version||'0.0.0'}catch(e){return '0.0.0'}};
const cmp=(a,b)=>{const x=String(a).split('.').map(n=>parseInt(n,10)||0),y=String(b).split('.').map(n=>parseInt(n,10)||0);for(let i=0;i<3;i++){if((x[i]||0)>(y[i]||0))return 1;if((x[i]||0)<(y[i]||0))return -1}return 0};
const fr=e=>{const m=String((e&&e.message)||e);if((e&&e.name==='TimeoutError')||m==='fetch failed')return 'Could not reach GitHub. Check the internet connection of this computer.';return m};
async function latest(){
 const r=await fetch(RAW+'?t='+Date.now(),{signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('Could not read the repository (HTTP '+r.status+')');
 const j=await r.json();if(!j.version)throw new Error('The repository has no version number');return String(j.version);
}
const CT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t.push(c>>>0)}return t})();
const crc=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CT[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
function unzip(buf){
 const bad=()=>new Error('The downloaded file is not a valid update package');
 let e=-1;
 for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--){if(buf.readUInt32LE(i)===0x06054b50){e=i;break}}
 if(e<0)throw bad();
 const n=buf.readUInt16LE(e+10);let p=buf.readUInt32LE(e+16);const out=[];let total=0;
 for(let k=0;k<n;k++){
  if(p+46>buf.length||buf.readUInt32LE(p)!==0x02014b50)throw bad();
  const meth=buf.readUInt16LE(p+10),cc=buf.readUInt32LE(p+16),csz=buf.readUInt32LE(p+20),usz=buf.readUInt32LE(p+24),nl=buf.readUInt16LE(p+28),el=buf.readUInt16LE(p+30),cl=buf.readUInt16LE(p+32),lo=buf.readUInt32LE(p+42);
  const name=buf.toString('utf8',p+46,p+46+nl);
  p+=46+nl+el+cl;
  if(name.endsWith('/'))continue;
  if(csz===0xFFFFFFFF||usz===0xFFFFFFFF||lo===0xFFFFFFFF)throw bad();
  if(lo+30>buf.length||buf.readUInt32LE(lo)!==0x04034b50)throw bad();
  const ds=lo+30+buf.readUInt16LE(lo+26)+buf.readUInt16LE(lo+28);
  if(ds+csz>buf.length)throw bad();
  const raw=buf.subarray(ds,ds+csz);
  let data;
  if(meth===0)data=raw;else if(meth===8){try{data=zlib.inflateRawSync(raw,{maxOutputLength:150*1024*1024})}catch(x){throw bad()}}else throw bad();
  if(data.length!==usz||crc(data)!==cc)throw bad();
  total+=usz;if(total>300*1024*1024)throw bad();
  out.push({name:name,data:data});
 }
 return out;
}
const SKIP_DIR=['data','runtime','node_modules','update-tmp','backups','.git'];
const SKIP_FILE=['uninstall.exe','install.log','.gitignore'];
const skip=rel=>{const parts=rel.split('/'),top=parts[0].toLowerCase();
 if(parts.length>1&&SKIP_DIR.indexOf(top)>=0)return true;
 if(parts.length===1&&SKIP_FILE.indexOf(top)>=0)return true;
 if(/^update-backup-/.test(top))return true;
 return /\.(log|lnk)$/i.test(rel)};
const soft=rel=>/^BillKora-App\./i.test(rel);
let busy=0;
async function apply(){
 if(busy&&Date.now()-busy<300000)throw new Error('An update is already running. Please wait a few minutes and try again.');
 busy=Date.now();
 const tmp=path.join(ROOT,'update-tmp');
 try{
  const lv=await latest();
  if(cmp(lv,cur())<=0){busy=0;return{ok:true,upToDate:true,version:cur()}}
  const r=await fetch(ZIP,{signal:AbortSignal.timeout(180000)});
  if(!r.ok)throw new Error('Download failed (HTTP '+r.status+')');
  const buf=Buffer.from(await r.arrayBuffer());
  if(buf.length<2000||buf[0]!==0x50||buf[1]!==0x4B)throw new Error('The downloaded file is not a valid update package');
  const all=unzip(buf);
  const files=[];
  for(const f of all){
   const i=f.name.indexOf('/');if(i<0)continue;
   const rel=f.name.slice(i+1);
   if(!rel||rel.split('/').indexOf('..')>=0||/^[\\/]|:/.test(rel))continue;
   if(skip(rel))continue;
   const dest=path.resolve(ROOT,rel);
   if(dest.toLowerCase().indexOf((ROOT+path.sep).toLowerCase())!==0)continue;
   files.push({rel:rel,dest:dest,data:f.data});
  }
  const pk=files.find(f=>f.rel==='package.json'),sv=files.find(f=>f.rel==='server.js');
  if(!pk||!sv)throw new Error('The update package looks wrong. Nothing was changed.');
  let zv;try{zv=String(JSON.parse(pk.data.toString('utf8').replace(/^\uFEFF/,'')).version||'')}catch(e){}
  if(!zv)throw new Error('The update package looks wrong. Nothing was changed.');
  if(cmp(zv,cur())<=0)throw new Error('GitHub is still preparing the new version. Please try again in a minute.');
  files.sort((a,b)=>(a.rel==='package.json')-(b.rel==='package.json'));
  fs.rmSync(tmp,{recursive:true,force:true});fs.mkdirSync(tmp,{recursive:true});
  const dbf=path.join(ROOT,'data','db.json');
  if(fs.existsSync(dbf)){
   fs.copyFileSync(dbf,path.join(ROOT,'data','db.backup-before-update-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json'));
   try{fs.readdirSync(path.join(ROOT,'data')).filter(n=>/^db\.backup-before-update-/.test(n)).sort().reverse().slice(3).forEach(n=>fs.unlinkSync(path.join(ROOT,'data',n)))}catch(e){}
  }
  const done=[];
  try{
   for(const f of files){
    let bak=null;
    if(fs.existsSync(f.dest)){bak=path.join(tmp,'bak',f.rel);fs.mkdirSync(path.dirname(bak),{recursive:true});fs.copyFileSync(f.dest,bak)}
    fs.mkdirSync(path.dirname(f.dest),{recursive:true});
    try{fs.writeFileSync(f.dest,f.data);done.push({dest:f.dest,bak:bak})}
    catch(e){if(soft(f.rel))continue;throw e}
   }
   fs.writeFileSync(path.join(ROOT,'version.txt'),zv);
  }catch(e){
   for(const d of done.reverse()){try{if(d.bak)fs.copyFileSync(d.bak,d.dest);else fs.unlinkSync(d.dest)}catch(x){}}
   throw new Error('Update failed and was undone: '+e.message);
  }
  return{ok:true,version:zv,restarting:true};
 }catch(e){busy=0;throw e}
 finally{try{fs.rmSync(tmp,{recursive:true,force:true})}catch(e){}}
}
const RESTART="setTimeout(function(){require('child_process').spawn(process.argv[1],['server.js'],{cwd:process.argv[2],detached:true,stdio:'ignore',windowsHide:true}).unref();process.exit(0)},2500)";
function restart(){
 if(process.env.BK_NO_RESTART)return;
 try{cp.spawn(process.execPath,['-e',RESTART,process.execPath,ROOT],{detached:true,stdio:'ignore',windowsHide:true}).unref()}catch(e){}
 setTimeout(()=>process.exit(0),300);
}
module.exports=function(col,id,act,M,b,ok,bad,db,save,uid,now,str){
 if(col==='updver'&&M==='GET'){ok({version:cur()});return true}
 if(col==='updinfo'&&M==='GET'){latest().then(l=>ok({ok:true,current:cur(),latest:l,newer:cmp(l,cur())>0})).catch(e=>ok({ok:false,current:cur(),msg:fr(e)}));return true}
 if(col==='updapply'&&M==='POST'){apply().then(r=>{ok(r);if(r.restarting)setTimeout(restart,800)}).catch(e=>bad(fr(e)));return true}
 return false;
};
module.exports.unzip=unzip;
module.exports.ZIP=ZIP;