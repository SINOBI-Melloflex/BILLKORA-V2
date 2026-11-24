'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=__dirname;
let fails=[];
function readDb(){return JSON.parse(fs.readFileSync(path.join(ROOT,'data','db.json'),'utf8').replace(/^\uFEFF/,''))}
function adminOk(pw){try{return !!pw&&crypto.createHash('sha256').update(pw).digest('hex')===readDb().settings.admin.pass}catch(e){return false}}
function send(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function route(req,res){
  if(req.url.split('?')[0]!=='/api/mtimport/read'||req.method!=='POST')return send(res,404,{error:'Not found'});
  let body='';
  req.on('data',d=>{body+=d;if(body.length>20000)req.destroy()});
  req.on('end',()=>{
    let b={};try{b=JSON.parse(body)}catch(e){}
    const now=Date.now();fails=fails.filter(t=>now-t<60000);
    if(fails.length>=5)return send(res,429,{error:'Too many attempts. Please wait a minute.'});
    if(!adminOk(String(b.adminPass||''))){fails.push(now);return send(res,401,{error:'Wrong admin password'})}
    let o;
    const ip=String(b.ip||'').trim();
    if(ip){
      if(!/^[A-Za-z0-9.\-]{1,100}$/.test(ip))return send(res,400,{error:'The router address looks wrong'});
      const port=Number(b.port)||8728;
      if(port<1||port>65535)return send(res,400,{error:'The port looks wrong'});
      o={host:ip,port:port,user:String(b.user||''),pass:String(b.pass||'')};
    }else{
      let d=null;
      try{d=(readDb().netdevices||[]).find(x=>x.kind==='MikroTik'&&(x.method||'api')==='api'&&x.ip&&x.user)}catch(e){}
      if(!d)return send(res,400,{error:'No saved MikroTik found. Please type the router IP, port, username and password.'});
      o={host:d.ip,port:Number(d.port)||8728,user:d.user,pass:d.pass||''};
    }
    o.timeout=20000;
    // READ ONLY: only two print commands are ever sent
    require('./mt.js').run(o,[['/ppp/secret/print'],['/ppp/profile/print']]).then(r=>{
      let skipped=0;
      const secrets=[];
      (r[0]||[]).forEach(s=>{
        const sv=String(s.service||'').toLowerCase();
        if(sv&&sv!=='pppoe'&&sv!=='any'){skipped++;return}
        if(!s.name)return;
        secrets.push({name:s.name,password:s.password||'',profile:s.profile||'default',disabled:s.disabled==='true',comment:s.comment||''});
      });
      send(res,200,{ok:true,secrets:secrets,skipped:skipped,profiles:(r[1]||[]).map(p=>p.name)});
    }).catch(e=>send(res,500,{error:e.message}));
  });
}
exports.hook=function(http){
  const orig=http.createServer;
  http.createServer=function(){
    const args=Array.prototype.slice.call(arguments);
    const i=args.findIndex(a=>typeof a==='function');
    if(i>=0){
      const h=args[i];
      args[i]=function(req,res){
        if(req.url&&req.url.indexOf('/api/mtimport/')===0)return route(req,res);
        return h.apply(this,arguments);
      };
    }
    return orig.apply(http,args);
  };
};