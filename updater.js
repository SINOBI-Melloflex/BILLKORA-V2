'use strict';
const https=require('https'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),cp=require('child_process');
const ROOT=__dirname,REPO='SINOBI-Melloflex/BILLKORA-V2',ASSET='BillKora-Update.zip';
const SKIP=['data','runtime','uninstall.exe','install.log'];
const PS=(process.env.SystemRoot||'C:\\Windows')+'\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
let busy=false,fails=[];

function curVer(){try{return fs.readFileSync(path.join(ROOT,'version.txt'),'utf8').trim()||'0.0.0'}catch(e){return '0.0.0'}}
function cmp(a,b){
  const x=String(a).replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0),y=String(b).replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0);
  for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d>0?1:-1}
  return 0;
}
function okHost(u){try{const p=new URL(u);return p.protocol==='https:'&&(p.hostname==='github.com'||p.hostname==='api.github.com'||/\.githubusercontent\.com$/.test(p.hostname))}catch(e){return false}}

function open(url,accept,hops){
  return new Promise((resolve,reject)=>{
    if(!okHost(url))return reject(new Error('Blocked an unexpected address'));
    const r=https.get(url,{headers:{'User-Agent':'BillKora-Updater','Accept':accept}},resp=>{
      const sc=resp.statusCode;
      if(sc>=300&&sc<400&&resp.headers.location){
        resp.resume();
        if((hops||0)>=6)return reject(new Error('Too many redirects'));
        return resolve(open(new URL(resp.headers.location,url).toString(),accept,(hops||0)+1));
      }
      if(sc!==200){resp.resume();return reject(new Error(sc===404?'No update has been published yet':'GitHub answered '+sc))}
      resolve(resp);
    });
    r.setTimeout(30000,()=>r.destroy(new Error('Connection timed out')));
    r.on('error',reject);
  });
}
async function getJson(url){
  const resp=await open(url,'application/vnd.github+json',0);
  return new Promise((res,rej)=>{
    let s='';resp.setEncoding('utf8');
    resp.on('data',d=>{s+=d;if(s.length>2000000)resp.destroy()});
    resp.on('end',()=>{try{res(JSON.parse(s))}catch(e){rej(new Error('Bad answer from GitHub'))}});
    resp.on('error',rej);
  });
}
async function download(url,dest){
  const resp=await open(url,'*/*',0);
  const want=parseInt(resp.headers['content-length']||'0',10);
  return new Promise((resolve,reject)=>{
    const h=crypto.createHash('sha256'),f=fs.createWriteStream(dest);let got=0;
    resp.on('data',d=>{got+=d.length;h.update(d)});
    resp.on('error',reject);
    resp.on('aborted',()=>reject(new Error('Download interrupted')));
    f.on('error',reject);
    f.on('finish',()=>{if(want&&got!==want)reject(new Error('Download incomplete'));else resolve(h.digest('hex'))});
    resp.pipe(f);
  });
}
function run(cmd,args){
  return new Promise((res,rej)=>{
    cp.execFile(cmd,args,{windowsHide:true,timeout:120000},(e,so,se)=>e?rej(new Error(String(se||e.message).slice(0,300))):res());
  });
}
function walk(d,base,out){
  for(const n of fs.readdirSync(d)){
    const p=path.join(d,n),rel=base?base+'/'+n:n;
    if(fs.statSync(p).isDirectory())walk(p,rel,out);else out.push(rel);
  }
  return out;
}

async function check(){
  const j=await getJson('https://api.github.com/repos/'+REPO+'/releases/latest');
  const cur=curVer(),latest=String(j.tag_name||'').replace(/^v/i,'');
  const a=(j.assets||[]).find(x=>x.name===ASSET);
  return{current:cur,latest:latest,available:!!a&&cmp(latest,cur)>0,notes:String(j.body||'').slice(0,600),asset:a?a.browser_download_url:null,digest:a&&a.digest?String(a.digest):null};
}

async function apply(){
  if(busy)throw new Error('An update is already running');
  busy=true;let tmp=null;
  try{
    const c=await check();
    if(!c.available)throw new Error('You already have the latest version ('+c.current+').');
    tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bk-upd-'));
    const zip=path.join(tmp,'update.zip'),stage=path.join(tmp,'x');
    const sum=await download(c.asset,zip);
    if(c.digest&&/^sha256:/i.test(c.digest)&&c.digest.slice(7).toLowerCase()!==sum)throw new Error('The downloaded update failed its security check.');
    const q=s=>"'"+s.replace(/'/g,"''")+"'";
    await run(PS,['-NoProfile','-ExecutionPolicy','Bypass','-Command','Expand-Archive -LiteralPath '+q(zip)+' -DestinationPath '+q(stage)+' -Force']);
    if(!fs.existsSync(path.join(stage,'server.js')))throw new Error('The update package looks wrong. Nothing was changed.');
    const dbf=path.join(ROOT,'data','db.json');
    if(fs.existsSync(dbf)){
      const ts=new Date().toISOString().replace(/[:.]/g,'-');
      fs.copyFileSync(dbf,path.join(ROOT,'data','db.backup-before-update-'+ts+'.json'));
    }
    const files=walk(stage,'',[]),done=[];
    try{
      for(const rel of files){
        const top=rel.split('/')[0].toLowerCase();
        if(SKIP.indexOf(top)>=0)continue;
        const dest=path.resolve(ROOT,rel);
        if(dest.toLowerCase().indexOf((ROOT+path.sep).toLowerCase())!==0)continue;
        let bak=null;
        if(fs.existsSync(dest)){bak=path.join(tmp,'bak',rel);fs.mkdirSync(path.dirname(bak),{recursive:true});fs.copyFileSync(dest,bak)}
        fs.mkdirSync(path.dirname(dest),{recursive:true});
        try{fs.copyFileSync(path.join(stage,rel),dest);done.push({dest:dest,bak:bak})}
        catch(e){if(/^BillKora-App\./i.test(rel))continue;throw e}
      }
      fs.writeFileSync(path.join(ROOT,'version.txt'),c.latest);
    }catch(e){
      for(const d of done.reverse()){try{if(d.bak)fs.copyFileSync(d.bak,d.dest);else fs.unlinkSync(d.dest)}catch(x){}}
      throw new Error('Update failed and was undone: '+e.message);
    }
    return c.latest;
  }finally{
    busy=false;
    try{if(tmp)fs.rmSync(tmp,{recursive:true,force:true})}catch(e){}
  }
}

const RESTART="setTimeout(function(){require('child_process').spawn(process.argv[1],['server.js'],{cwd:process.argv[2],detached:true,stdio:'ignore',windowsHide:true}).unref();process.exit(0)},1800)";
function restart(){
  try{cp.spawn(process.execPath,['-e',RESTART,process.execPath,ROOT],{detached:true,stdio:'ignore',windowsHide:true}).unref()}catch(e){}
  setTimeout(()=>process.exit(0),300);
}
function adminOk(pw){
  try{
    const j=JSON.parse(fs.readFileSync(path.join(ROOT,'data','db.json'),'utf8').replace(/^\uFEFF/,''));
    return !!pw&&crypto.createHash('sha256').update(pw).digest('hex')===j.settings.admin.pass;
  }catch(e){return false}
}
function send(res,code,obj){
  res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify(obj));
}
function route(req,res){
  const u=req.url.split('?')[0];
  if(u==='/api/update/check'&&req.method==='GET'){
    check().then(c=>send(res,200,{current:c.current,latest:c.latest,available:c.available,notes:c.notes})).catch(e=>send(res,500,{error:e.message}));
    return;
  }
  if(u==='/api/update/apply'&&req.method==='POST'){
    let body='';
    req.on('data',d=>{body+=d;if(body.length>10000)req.destroy()});
    req.on('end',()=>{
      let pw='';try{pw=String(JSON.parse(body).password||'')}catch(e){}
      const now=Date.now();fails=fails.filter(t=>now-t<60000);
      if(fails.length>=5)return send(res,429,{error:'Too many attempts. Please wait a minute.'});
      if(!adminOk(pw)){fails.push(now);return send(res,401,{error:'Wrong admin password'})}
      apply().then(v=>{send(res,200,{ok:true,version:v});setTimeout(restart,400)}).catch(e=>send(res,500,{error:e.message}));
    });
    return;
  }
  send(res,404,{error:'Not found'});
}
exports.hook=function(http){
  const orig=http.createServer;
  http.createServer=function(){
    const args=Array.prototype.slice.call(arguments);
    const i=args.findIndex(a=>typeof a==='function');
    if(i>=0){
      const h=args[i];
      args[i]=function(req,res){
        if(req.url&&req.url.indexOf('/api/update/')===0)return route(req,res);
        return h.apply(this,arguments);
      };
    }
    return orig.apply(http,args);
  };
};
exports.check=check;
exports.curVer=curVer;