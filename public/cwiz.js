/* BillKora cwiz.js: conversational Add Customer assistant. Loads last. */
(function(){
var old=window.editC,W=null;
function $$(i){return document.getElementById(i)}
function E(s){return esc(s==null?'':s)}
function E2(s){return E(s).replace(/"/g,'&quot;')}
function sl(ms){return new Promise(function(r){setTimeout(r,ms)})}
var css='.cwo{position:fixed;inset:0;z-index:9999;background:rgba(3,8,20,.8);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:cwf .25s ease}@keyframes cwf{from{opacity:0}to{opacity:1}}'
+'.cwb{position:relative;width:min(760px,100%);max-height:92vh;overflow:auto;border-radius:22px;padding:26px;background:radial-gradient(900px 400px at 10% -10%,#102a5c 0,transparent 60%),#050a18;color:#d7e6ff;border:1px solid #16305f;box-shadow:0 0 50px rgba(0,229,255,.14);animation:cwu .4s ease}@keyframes cwu{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}'
+'.cwx{position:absolute;right:16px;top:10px;font-size:26px;cursor:pointer;color:#7f93b8}.cwx:hover{color:#fff}'
+'.cwdots{display:flex;gap:6px;margin-bottom:18px;padding-right:30px}.cwdots i{flex:1;height:4px;border-radius:4px;background:#12285a}.cwdots i.d{background:#19f5a6}.cwdots i.o{background:#00e5ff;box-shadow:0 0 10px #00e5ff}'
+'.cwa{display:flex;gap:14px;align-items:flex-start;margin-bottom:16px}.cwo2{flex:none;width:42px;height:42px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#7ff3ff,#0077ff 60%,#12206b);box-shadow:0 0 22px rgba(0,229,255,.6);animation:cwp 3s ease-in-out infinite}@keyframes cwp{50%{transform:scale(1.08);box-shadow:0 0 34px rgba(0,229,255,.9)}}'
+'.cwt{background:rgba(14,30,66,.8);border:1px solid #1d3d78;border-radius:4px 16px 16px 16px;padding:13px 17px;font-size:15px;line-height:1.7;min-height:22px}.cwt.cur::after{content:"";display:inline-block;width:8px;height:15px;background:#00e5ff;margin-left:3px;vertical-align:-3px;animation:cwb .7s steps(2) infinite}@keyframes cwb{50%{opacity:0}}'
+'.cwq{margin-left:56px}'
+'.cwi,.cwq select{width:100%;box-sizing:border-box;background:#071230;border:1px solid #23478a;border-radius:12px;padding:12px 15px;color:#e6f0ff;font-size:15px;outline:0}.cwi:focus,.cwq select:focus{border-color:#00e5ff;box-shadow:0 0 14px rgba(0,229,255,.35)}'
+'.cwq small{display:block;color:#7f93b8;margin-top:8px;line-height:1.6}.cwq label{display:block;font-size:12px;color:#7f93b8;margin:10px 0 4px}'
+'.cwrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.cwbt{background:linear-gradient(135deg,#00b8ff,#2f6bff);color:#fff;border:0;border-radius:12px;padding:11px 20px;font-weight:700;cursor:pointer;font-size:14px;box-shadow:0 0 18px rgba(0,160,255,.35);transition:.2s}.cwbt:hover{transform:translateY(-2px)}.cwbt.g{background:transparent;border:1px solid #2a4a80;color:#9fc3ff;box-shadow:none}'
+'.cwg{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.cwc{border:1px solid #23478a;border-radius:14px;padding:12px;background:#071230;cursor:pointer;transition:.2s}.cwc:hover{border-color:#00e5ff}.cwc.on{border-color:#19f5a6;box-shadow:0 0 14px rgba(25,245,166,.35)}.cwc b{display:block}.cwc span{color:#00e5ff;font-weight:700}'
+'.cwr{margin:6px 0 0;width:100%;border-collapse:collapse;font-size:14px}.cwr td{padding:7px 4px;border-bottom:1px solid #12285a}.cwr td:first-child{color:#7f93b8;width:42%}'
+'.cwk{display:flex;align-items:center;gap:12px;padding:9px 0;opacity:.45;transition:.3s}.cwk i{width:22px;height:22px;border-radius:50%;border:2px solid #2a4a80;flex:none;box-sizing:border-box}.cwk.run{opacity:1}.cwk.run i{border-color:#00e5ff #00e5ff transparent transparent;animation:cws .8s linear infinite}.cwk.ok{opacity:1}.cwk.ok i{background:#19f5a6;border-color:#19f5a6;position:relative}.cwk.ok i::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid #031;border-width:0 2px 2px 0;transform:rotate(45deg)}.cwk.err{opacity:1;color:#ffb3c0}.cwk.err i{background:#ff4d6d;border-color:#ff4d6d}@keyframes cws{to{transform:rotate(360deg)}}'
+'.cwn{margin-top:12px;padding:11px 14px;border-radius:12px;background:rgba(255,176,32,.1);border:1px solid #ffb020;color:#ffd58a;line-height:1.6;font-size:13.5px}.cwn.ok{background:rgba(25,245,166,.1);border-color:#19f5a6;color:#19f5a6}.cwn.e{background:rgba(255,77,109,.1);border-color:#ff4d6d;color:#ffb3c0}'
+'.cww{width:70px;margin:0 auto 12px}.cww svg{width:70px;height:70px;fill:none;stroke:#19f5a6;stroke-width:3}.cww circle{stroke-dasharray:152;stroke-dashoffset:152;animation:cwd .8s ease forwards;filter:drop-shadow(0 0 8px #19f5a6)}.cww path{stroke-dasharray:40;stroke-dashoffset:40;animation:cwd .5s .7s ease forwards}@keyframes cwd{to{stroke-dashoffset:0}}'
+'@media(max-width:600px){.cwq{margin-left:0}}@media (prefers-reduced-motion:reduce){.cwo *,.cwb{animation:none!important}}';
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

var ORDER=['name','phone','zone','sub','pkg','rt','user','pass','paid','more','review'];
var RUNLAB=['Saving the customer','Saving zone and type','Creating the PPPoE user on your router','Turning on the internet','Final check'];
function blank(){return {name:'',phone:'',zone:'',sub:'',pkg:'',user:'',pass:'',months:1,method:'Cash',address:'',email:'',nid:'',ctype:'home',portal:'',profile:'',pool:''}}
function subsOf(z){return z?W.zones.filter(function(x){return x.parent===z}):[]}
function tops(){return W.zones.filter(function(x){return !x.parent})}
function zname(id){var z=W.zones.filter(function(x){return x.id===id})[0];return z?z.name:''}
function rtOn(){return !!(W.cat&&W.cat.ok&&W.cat.profiles&&W.cat.profiles.length>1)}
function seq(){return ORDER.filter(function(k){if(k==='sub')return !!W.d.zone;if(k==='rt')return rtOn();return true})}
function opts(list,sel){return list.map(function(o){return '<option value="'+E2(o[0])+'"'+(String(o[0])===String(sel)?' selected':'')+'>'+E(o[1])+'</option>'}).join('')}
function typeIt(el,t){if(!el)return;
 if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=t;return}
 var i=0;el.textContent='';el.classList.add('cur');
 var iv=setInterval(function(){i+=2;if(!document.body.contains(el)){clearInterval(iv);return}el.textContent=t.slice(0,i);if(i>=t.length){clearInterval(iv);el.classList.remove('cur')}},16)}
function paint(msg,inner,nodots){var b=$$('cwb');if(!b||!W)return;
 var s=seq(),i=s.indexOf(W.step),dots=nodots?'':'<div class="cwdots">'+s.map(function(k,j){return '<i class="'+(j<i?'d':(j===i?'o':''))+'"></i>'}).join('')+'</div>';
 b.innerHTML='<div class="cwx" onclick="cwClose()">&times;</div>'+dots+'<div class="cwa"><div class="cwo2"></div><div class="cwt" id="cwt"></div></div><div class="cwq">'+inner+'</div>';
 typeIt($$('cwt'),msg);var f=$$('cwf');if(f)f.focus()}
function inp(type,ph,val,hint){return '<input class="cwi" id="cwf" type="'+type+'" placeholder="'+E2(ph)+'" value="'+E2(val)+'" onkeydown="if(event.key===\'Enter\')cwNext()">'+(hint?'<small>'+hint+'</small>':'')}
function nav(lbl){var s=seq(),i=s.indexOf(W.step);return '<div class="cwrow">'+(i>0?'<button class="cwbt g" onclick="cwBack()">Back</button>':'')+'<button class="cwbt" onclick="cwNext()">'+(lbl||'Next')+'</button></div>'}
function row(a,b){return '<tr><td>'+a+'</td><td><b>'+E(b)+'</b></td></tr>'}

window.cwOpen=function(){
 if($$('cwo'))return;
 var o=document.createElement('div');o.className='cwo';o.id='cwo';o.innerHTML='<div class="cwb" id="cwb"><div class="cwa"><div class="cwo2"></div><div class="cwt">Getting ready...</div></div></div>';document.body.appendChild(o);
 W={step:'name',d:blank(),zones:[],pk:[],names:{},rn:null,linkOk:'',busy:false,done:false,made:null,cat:null,catP:null};
 Promise.all([api('admin/zones'),api('admin/packages'),api('admin/customers'),api('admin/netdevices')]).then(function(r){var rd0=Array.isArray(r[3])?r[3].filter(function(x){return x.kind==='MikroTik'&&(x.method||'api')==='api'&&x.ip&&x.user})[0]:null;if(!W)return;W.rdev=rd0||null;if(!rd0){gate();return}
  if(!W)return;
  W.zones=Array.isArray(r[0])?r[0]:[];W.pk=Array.isArray(r[1])?r[1]:[];
  (r[2]||[]).forEach(function(c){W.names[String(c.username).toLowerCase()]=1;if(c.pppUser)W.names[String(c.pppUser).toLowerCase()]=1});
  if(W.pk.length===1)W.d.pkg=W.pk[0].id;
  show();
  api('admin/mwusers').then(function(x){if(W&&x&&x.ok)W.rn=x.names.map(function(n){return String(n).toLowerCase()})}).catch(function(){});
   var w0=W;W.catP=api('admin/mtcat').then(function(c){if(w0===W&&c&&c.ok)W.cat=c}).catch(function(){});
 }).catch(function(e){W=null;var o2=$$('cwo');if(o2)o2.remove();if(e.message!=='auth')toast(e.message,1)})};

function show(){if(!W)return;var d=W.d,k=W.step;
 if(k==='name')return paint("Hi, I'm your setup assistant. Let's add a new customer. What is the customer's full name?",inp('text','e.g. Rahim Uddin',d.name,'')+nav());
 if(k==='phone')return paint('Nice. What is '+d.name+"'s phone number?",inp('tel','e.g. 01712345678',d.phone,'This is also the default password of the customer portal.')+nav());
 if(k==='zone')return paint(tops().length?'Which zone does '+d.name+' live in? Pick one, or create a new zone.':'You have no zones yet. Type a name to create your first zone, or skip this step.',
  '<select id="cwz">'+opts([['','- No zone -']].concat(tops().map(function(z){return [z.id,z.name]})),d.zone)+'</select><label>Or create a new zone</label><input class="cwi" id="cwnz" placeholder="e.g. Mirpur" onkeydown="if(event.key===\'Enter\')cwNext()">'+nav());
 if(k==='sub')return paint('And the subzone inside '+zname(d.zone)+'? You can skip this.',
  '<select id="cws">'+opts([['','- No subzone -']].concat(subsOf(d.zone).map(function(z){return [z.id,z.name]})),d.sub)+'</select><label>Or create a new subzone</label><input class="cwi" id="cwns" placeholder="e.g. Block C" onkeydown="if(event.key===\'Enter\')cwNext()">'+nav());
 if(k==='pkg'){
  if(!W.pk.length)return paint('There is no package yet. Open Customer Management and use MikroTik Sync to import your router profiles as packages (or use Package Management), set the monthly price, then add the customer.','<div class="cwrow"><button class="cwbt" onclick="cwClose()">Close</button></div>');
  return paint('Which package will '+d.name+' use?','<div class="cwg">'+W.pk.map(function(p){return '<div class="cwc'+(p.id===d.pkg?' on':'')+'" data-id="'+E2(p.id)+'" onclick="cwPick(\''+E2(p.id)+'\')"><b>'+E(p.name)+'</b><span>'+E(money(p.price))+' / month</span><small>'+(p.profile?'Router profile: '+E(p.profile)+(p.pool?' | pool: '+E(p.pool):''):'No router profile linked')+'</small></div>'}).join('')+'</div>'+nav())}
 if(k==='rt'){var pr=W.cat.profiles,pl=W.cat.pools||[];
  paint('Which MikroTik profile should '+d.name+"'s PPPoE user go into? I only show what already exists on your router.",
   '<label>PPPoE profile</label><select id="cwpf" onchange="cwRt()">'+opts([['','- choose profile -']].concat(pr.map(function(x){return [x.name,x.name+(x.rate?'  |  '+x.rate:'')]})),d.profile)+'</select>'
   +(pl.length?'<label>IP pool</label><select id="cwpl">'+opts([['','Use the pool of the profile']].concat(pl.map(function(x){return [x.name,x.name+(x.ranges?'  |  '+x.ranges:'')]})),d.pool)+'</select>':'')
   +'<small id="cwrh"></small>'+nav());
  cwRt();return}
 if(k==='user')return paint('What PPPoE username should the router use for '+d.name+'?',inp('text','e.g. rahim01',d.user,'No spaces. This is the login that the customer\'s router or ONU uses.')+nav());
 if(k==='pass')return paint('And the PPPoE password for '+d.user+'?',inp('text','PPPoE password',d.pass,'It will be saved on the router. Type one, or press Generate.')+'<div class="cwrow" style="margin-top:8px"><button class="cwbt g" onclick="cwGen()">Generate a password</button></div>'+nav());
 if(k==='paid')return paint('Has '+d.name+' paid already? This decides how long the internet stays ON.',
  '<select id="cwm">'+opts([[0,'Not paid yet (internet stays OFF until recharge)'],[1,'1 month (30 days)'],[2,'2 months'],[3,'3 months'],[6,'6 months'],[12,'12 months']],d.months)+'</select><label>Payment method</label><select id="cwp">'+opts(METHODS,d.method)+'</select>'+nav());
 if(k==='more')return paint('Almost done. Anything else to add? Everything on this page is optional.',
  '<label>Address</label><input class="cwi" id="cwad" value="'+E2(d.address)+'"><label>Email</label><input class="cwi" id="cwem" value="'+E2(d.email)+'"><label>NID / ID number</label><input class="cwi" id="cwni" value="'+E2(d.nid)+'"><label>Customer type</label><select id="cwty">'+opts([['home','Home'],['corporate','Corporate'],['reseller','Reseller']],d.ctype)+'</select><label>Customer portal password</label><input class="cwi" id="cwpo" value="'+E2(d.portal)+'" placeholder="blank = phone number">'+nav('Review'));
 if(k==='review'){var p=W.pk.filter(function(x){return x.id===d.pkg})[0]||{};
  return paint('Please check everything. When you press Create, I will do all the work myself.',
   '<table class="cwr">'+row('Name',d.name)+row('Phone',d.phone)+row('Zone',(zname(d.zone)||'-')+(d.sub?' > '+zname(d.sub):''))+row('Package',(p.name||'-')+' ('+money(p.price||0)+')')+row('Router profile',d.profile||(p.profile||'(none)'))+row('IP pool',d.pool||'from the profile')+row('PPPoE user',d.user)+row('PPPoE password',d.pass)+row('Paid',d.months?d.months+' month(s) by '+d.method:'Not paid yet (stays OFF)')+'</table>'
   +'<div class="cwn">On the router I only create this one PPPoE user. Pools and profiles are never touched.'+((d.profile||p.profile)?'':' No router profile is set, so the user is created without one.')+'</div>'
   +'<div class="cwrow"><button class="cwbt g" onclick="cwBack()">Back</button><button class="cwbt" onclick="cwRun()">Create customer</button></div>')}
}
window.cwRt=function(){var s=$$('cwpf'),h=$$('cwrh');if(!s||!h||!W||!W.cat)return;var p=W.cat.profiles.filter(function(x){return x.name===s.value})[0];h.textContent=p?('This profile uses pool: '+(p.pool||'none set')+(p.rate?' | speed limit: '+p.rate:'')+'. If you pick no pool above, the router uses this.'):'Choose the profile from your router.'};
function gh(m){m=String(m||'');if(/refused/i.test(m))return 'Nothing is listening on that port. Enable IP > Services > api on the router or use the right port.';if(/timeout|ETIMEDOUT|EHOST|ENET/i.test(m))return 'No answer. Check the IP address, that this computer can reach the router, and that no firewall blocks the port.';if(/login|password|invalid user|cannot log/i.test(m))return 'The router did not accept the username or password.';return ''}
function reopen(){var o=$$('cwo');if(o)o.remove();W=null;cwOpen()}
function gate(){var x=W.rdev||{},fix=!!W.rdev;
 paint(fix?'I could not reach your MikroTik router. Please check its details.':'Before I can add customers I need your MikroTik router. Every customer is created on a router, so this step is required.',
 '<label>Router IP address or hostname</label><input class="cwi" id="cwf" value="'+E2(x.ip||'')+'" placeholder="e.g. 192.168.88.1">'
 +'<div class="cwg" style="margin-top:6px"><div><label>API port</label><input class="cwi" id="cwgp" type="number" value="'+E2(x.port||'8728')+'"></div><div><label>Router name (optional)</label><input class="cwi" id="cwgn" value="'+E2(x.name||'')+'" placeholder="e.g. Main Router"></div><div><label>Username</label><input class="cwi" id="cwgu" value="'+E2(x.user||'')+'" placeholder="e.g. admin"></div><div><label>Password</label><input class="cwi" id="cwgw" type="password" placeholder="'+(fix?'leave blank to keep':'')+'" onkeydown="if(event.keyCode===13)cwGateGo()"></div></div>'
 +'<small>On the router, IP &gt; Services &gt; api must be enabled and the user needs read, write and api permission. These details stay on this computer.</small><div id="cwgr"></div><div class="cwrow"><button class="cwbt g" onclick="cwClose()">Close</button><button class="cwbt" onclick="cwGateGo()">'+(fix?'Save and test':'Connect router')+'</button></div>',true)}
function unreach(){W.busy=false;paint('I cannot reach your MikroTik router right now.','<div class="cwn e">A customer is only created while the router answers, so the software and the router never get out of sync. Check that the router is on, that this computer can reach it, and that IP &gt; Services &gt; api is enabled.</div><div class="cwrow"><button class="cwbt g" onclick="cwClose()">Close</button><button class="cwbt g" onclick="cwEditRt()">Edit router details</button><button class="cwbt" onclick="cwRetryRt()">Try again</button></div>',true)}
window.cwEditRt=function(){if(W)gate()};
window.cwRetryRt=function(){if(!W)return;var w0=W;W.catP=api('admin/mtcat').then(function(c){if(w0===W&&c&&c.ok)W.cat=c}).catch(function(){});W.step='pkg';show()};
window.cwGateGo=async function(){
 if(!W||W.busy)return;
 var g=function(i){var e=$$(i);return e?e.value:''},rs=$$('cwgr');
 var ip=g('cwf').trim().replace(/^[a-z]+:[/][/]/i,'').replace(/[/].*$/,''),port=parseInt(g('cwgp'),10)||8728,us=g('cwgu').trim(),pw=g('cwgw'),nm=g('cwgn').trim(),m=/^(.+):([0-9]{1,5})$/.exec(ip);
 if(m){ip=m[1];port=parseInt(m[2],10)}
 if(!ip||/[ 	]/.test(ip)){toast('Enter a valid IP address or hostname',1);return}
 if(!(port>0&&port<65536)){toast('Port must be between 1 and 65535',1);return}
 if(!us){toast('Enter the router username',1);return}
 var w0=W,fix=W.rdev,id='';W.busy=true;
 if(rs)rs.innerHTML='<div class="cwk run"><i></i><span>Connecting to the router and logging in...</span></div>';
 try{
  var body={name:nm||(fix&&fix.name)||('MikroTik '+ip),kind:'MikroTik',method:'api',ip:ip,port:String(port),user:us};
  if(pw||!fix)body.pass=pw;
  if(fix){await api('admin/netdevices/'+fix.id,'PUT',body);id=fix.id}
  else{var r0=await api('admin/netdevices','POST',body);id=r0.id}
  var t=await api('admin/mwtest/'+id,'POST',{});
  if(!t.ok)throw new Error(t.msg||'The router did not answer');
  w0.busy=false;reopen();
 }catch(e){
  if(w0)w0.busy=false;
  if(!fix&&id){try{await api('admin/netdevices/'+id,'DELETE')}catch(x){}}
  if(e.message==='auth')return;
  var r2=$$('cwgr');if(r2)r2.innerHTML='<div class="cwn e">'+E(e.message)+(gh(e.message)?'<br>'+E(gh(e.message)):'')+'</div>'}
};
window.cwPick=function(id){if(!W)return;W.d.pkg=id;Array.prototype.forEach.call(document.querySelectorAll('.cwc'),function(x){x.classList.toggle('on',x.getAttribute('data-id')===id)})};
window.cwGen=function(){var c='abcdefghjkmnpqrstuvwxyz23456789',s='';for(var i=0;i<8;i++)s+=c.charAt(Math.floor(Math.random()*c.length));var f=$$('cwf');if(f)f.value=s};
window.cwBack=function(){if(!W||W.busy)return;var s=seq(),i=s.indexOf(W.step);if(i>0){W.step=s[i-1];show()}};
function advance(){var s=seq(),i=s.indexOf(W.step);if(i>=0&&i<s.length-1){W.step=s[i+1];show()}}
async function zoneFor(sel,nn,parent){
 if(!nn)return sel;
 var ex=W.zones.filter(function(z){return (z.parent||'')===(parent||'')&&String(z.name).toLowerCase()===nn.toLowerCase()})[0];
 if(ex)return ex.id;
 var r=await api('admin/zones','POST',{name:nn,parent:parent||''});
 var z=await api('admin/zones');W.zones=Array.isArray(z)?z:[];
 return r.id}
function linkAsk(){paint('The username '+W.d.user+' already exists on your MikroTik.','<div class="cwn">If you continue, I will link that router user to this new customer and update its password, profile and pool. Its comment on the router stays as it is. Nothing else on the router changes.</div><div class="cwrow"><button class="cwbt g" onclick="cwOther()">Choose another username</button><button class="cwbt" onclick="cwLink()">Link the existing user</button></div>')}
window.cwOther=function(){show()};
window.cwLink=function(){if(!W)return;W.linkOk=W.d.user.toLowerCase();advance()};
window.cwNext=async function(){
 if(!W||W.busy)return;
 var d=W.d,k=W.step,v=function(i){var e=$$(i);return e?e.value:''};
 try{
  if(k==='name'){d.name=v('cwf').trim();if(!d.name){toast('Please type the name',1);return}}
  else if(k==='phone'){var ph=v('cwf').trim().replace(/[\s-]/g,'');if(!/^\+?\d{7,15}$/.test(ph)){toast('Please enter a valid phone number',1);return}if(/^1[3-9]\d{8}$/.test(ph))ph='0'+ph;d.phone=ph}
  else if(k==='zone'){W.busy=true;var z=await zoneFor(v('cwz'),v('cwnz').trim(),'');W.busy=false;if(z!==d.zone)d.sub='';d.zone=z}
  else if(k==='sub'){W.busy=true;d.sub=await zoneFor(v('cws'),v('cwns').trim(),d.zone);W.busy=false}
  else if(k==='pkg'){if(!d.pkg){toast('Please choose a package',1);return}
   if(W.catP){W.busy=true;paint('Reading profiles and pools from your router...','<small>One moment. I only read, I change nothing.</small>',true);await W.catP;if(!W)return;W.catP=null;W.busy=false}
   if(!W.cat){unreach();return}
   var pk=W.pk.filter(function(x){return x.id===d.pkg})[0]||{},cp=(W.cat&&W.cat.ok)?W.cat.profiles:[];
   if(d.pkgSet!==d.pkg){d.pkgSet=d.pkg;d.profile=(pk.profile&&cp.some(function(x){return x.name===pk.profile}))?pk.profile:'';d.pool=''}
   if(cp.length===1&&!d.profile)d.profile=cp[0].name}
  else if(k==='rt'){d.profile=v('cwpf');if(!d.profile){toast('Please choose the profile',1);return}d.pool=v('cwpl')}
  else if(k==='user'){var u=v('cwf').trim(),lu=u.toLowerCase();
   if(!u||/\s/.test(u)){toast('Username is required and cannot contain spaces',1);return}
   if(W.names[lu]){toast('This username is already used by another customer',1);return}
   d.user=u;if(W.rn&&W.rn.indexOf(lu)>-1&&W.linkOk!==lu){linkAsk();return}}
  else if(k==='pass'){d.pass=v('cwf').trim();if(!d.pass){toast('Please enter the PPPoE password',1);return}}
  else if(k==='paid'){d.months=parseInt(v('cwm'),10)||0;d.method=v('cwp')||'Cash'}
  else if(k==='more'){d.address=v('cwad').trim();d.email=v('cwem').trim();d.nid=v('cwni').trim();d.ctype=v('cwty')||'home';d.portal=v('cwpo')}
  advance();
 }catch(e){if(W)W.busy=false;if(e.message!=='auth')toast(e.message,1)}};

function tk(i,s,t){var e=$$('cwk'+i);if(!e)return;e.className='cwk '+s;if(t){var sp=e.querySelector('span');if(sp)sp.textContent=t}}
window.cwBackReview=function(){if(!W)return;W.step='review';show()};
window.cwRun=async function(){
 if(!W||W.busy)return;W.busy=true;W.step='run';
 var d=W.d,msgs=[],cu=null,r=null;
 paint('Working on it. You do not need to do anything.','<div>'+RUNLAB.map(function(t,i){return '<div class="cwk" id="cwk'+i+'"><i></i><span>'+E(t)+'</span></div>'}).join('')+'</div><div id="cwres"></div>',true);
 try{
  tk(0,'run');await sl(400);
  var body={name:d.name,phone:d.phone,email:d.email,address:d.address,nid:d.nid,packageId:d.pkg,pppUser:d.user,pppPass:d.pass,username:d.user.toLowerCase(),pass:d.portal,rProfile:d.profile,rPool:d.pool};
  if(d.months===0)body.status='suspended';
  r=await api('admin/customers','POST',body);
  var L=await api('admin/customers');cu=L.filter(function(x){return x.username===r.username})[0];
  if(!cu)throw new Error('Saved, but I could not find the customer again');
  W.names[r.username]=1;W.names[d.user.toLowerCase()]=1;W.made=cu.id;W.done=true;
  tk(0,'ok');
  tk(1,'run');await sl(300);
  await api('admin/cmeta','POST',{customerId:cu.id,zone:d.zone||'',sub:d.sub||'',type:d.ctype||'home'});tk(1,'ok');
  tk(2,'run');await sl(300);
  try{var x=await api('admin/cact/'+cu.id+'/sync','POST',{});msgs.push(x.msg);tk(2,'ok')}catch(e1){if(e1.message==='auth')throw e1;msgs.push('Router: '+e1.message);tk(2,'err')}
  tk(3,'run');await sl(300);
  if(d.months>0){try{var y=await api('admin/cact/'+cu.id+'/recharge','POST',{months:d.months,method:d.method});msgs.push(y.msg);tk(3,'ok')}catch(e2){if(e2.message==='auth')throw e2;msgs.push('Could not turn on: '+e2.message);tk(3,'err')}}
  else{msgs.push('Not paid yet: the internet stays OFF until you recharge.');tk(3,'ok','Left OFF until recharge (not paid yet)')}
  tk(4,'run');await sl(300);tk(4,'ok');
  await sl(700);if(!W)return;W.busy=false;fin(cu,r,msgs);
 }catch(e){
  if(!W)return;W.busy=false;if(e.message==='auth')return;
  var made=!!W.made,rs=$$('cwres');
  if(rs)rs.innerHTML='<div class="cwn e">'+E(e.message)+(made?' The customer was saved, but a later step failed.':' Nothing was saved.')+'</div><div class="cwrow">'+(made?'<button class="cwbt" onclick="cwClose()">Close</button>':'<button class="cwbt" onclick="cwBackReview()">Back to review</button>')+'</div>';
  var cur=document.querySelector('.cwk.run');if(cur)cur.className='cwk err'}};
function fin(cu,r,msgs){var d=W.d;
 paint('Done! '+d.name+' has been added.','<div class="cww"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg></div>'
 +'<table class="cwr">'+row('Customer ID',cu.cid)+row('PPPoE user / password',d.user+' / '+d.pass)+row('Portal login',r.username+' / '+r.password)+'</table>'
 +msgs.map(function(m){return '<div class="'+(/^Router|^Could not|error/i.test(m)?'cwn':'cwn ok')+'">'+E(m)+'</div>'}).join('')
 +'<div class="cwrow"><button class="cwbt" onclick="cwAgain()">Add another customer'+(d.zone?' in '+E(zname(d.zone)):'')+'</button><button class="cwbt g" onclick="cwView(\''+E2(cu.id)+'\')">View customer</button><button class="cwbt g" onclick="cwClose()">Close</button></div>',true)}
window.cwAgain=function(){if(!W)return;var o=W.d;W.d=blank();W.d.zone=o.zone;W.d.sub=o.sub;W.d.pkg=o.pkg;W.d.months=o.months;W.d.method=o.method;W.d.ctype=o.ctype;W.step='name';W.made=null;W.linkOk='';show()};
window.cwView=function(id){cwClose();setTimeout(function(){if(window.c3v)window.c3v(id)},500)};
window.cwClose=function(){if(W&&W.busy)return;var o=$$('cwo');if(o)o.remove();var re=W&&W.done;W=null;if(re&&typeof go==='function')go()};
window.editC=function(id){if(id){if(old)return old(id);return}cwOpen()};
})();