/* BillKora ERP: sidebar, top bar, dashboard (loads after premium.js) */
(function(){
var T='\u09f3';
function fmt(n){return T+Number(n||0).toLocaleString('en-IN')}
function ck(n){n=Number(n)||0;return n>=100000?(n/100000).toFixed(n%100000?1:0)+'L':n>=1000?(n/1000).toFixed(n%1000?1:0)+'k':String(n)}
function mk(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)}
function ft(t){var d=new Date(t);return isNaN(d)?'':d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+', '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
function pct(a,b){if(!b)return a?100:0;return Math.round((a-b)/b*1000)/10}
function chip(p){return '<span class="gr'+(p<0?' dn':'')+'">'+(p<0?'&#9660; ':'&#9650; ')+Math.abs(p)+'%</span>'}
function tryApi(u){return api(u).then(function(r){return Array.isArray(r)?r:[]}).catch(function(e){if(e&&e.message==='auth')throw e;return []})}
function g(id){return document.getElementById(id)}

var MENU=[['dashboard','home','Dashboard'],['customers','users','Customer Management'],['requests','mail','New Requests'],['hub','server','Migration & Network Devices'],['packages','box','Package Management'],['billing','file','Billing & Invoice'],['payments','card','Payment Management'],['support','hp','Support & Ticketing'],['field','pin','Installation & Field Service'],['inventory','box','Inventory & Assets'],['reports','chart','Accounts & Reports'],['hrm','user','HR & Staff'],['settings','gear','Settings']];
function buildSide(){var s=document.querySelector('.side');if(!s)return;
 s.innerHTML='<div class="erp-brand"><img src="logo.png" alt=""><div><b>ISP Management</b><small>&amp; Billing ERP</small></div></div>'
 +MENU.map(function(m){return '<a data-v="'+m[0]+'" href="#'+m[0]+'"><i data-i="'+m[1]+'"></i>'+m[2]+'</a>'}).join('')
 
 +'<div class="pd-sys"><b><i></i>System Online</b><small>Last updated:<br>'+ft(new Date())+'</small></div><div class="erp-art"></div><div class="pd-tag">Smarter Network,<br>Stronger Business</div>';
 icons()}

function dark(on){document.body.classList.toggle('dark',on);try{localStorage.setItem('bkdark',on?'1':'0')}catch(e){}}
function buildTop(){var t=document.querySelector('.top');if(!t)return;var old=t.querySelector('.r');if(old)old.remove();
 if(!t.querySelector('.pd-s')){t.insertAdjacentHTML('beforeend','<div class="pd-s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input id="pds" placeholder="Search Customer, Invoice, Ticket... (Ctrl + K)" autocomplete="off"><div id="pdr" class="pd-res"></div></div>')}
 t.insertAdjacentHTML('beforeend','<div class="r" style="margin-left:auto;display:flex;align-items:center;gap:12px"><button class="er-ic" title="Dark / Light" onclick="bkDark()">&#9790;</button><a class="er-ic" href="#requests" title="Notifications"><i data-i="bell"></i><span class="nb" id="nb" style="display:none"></span></a><div class="er-prof"><button class="er-pb" onclick="bkPm()"><div class="av">A</div><div><b>Admin</b><small>Super Admin</small></div></button><div class="er-pm" id="pm"><a href="#" onclick="logout();return false">Logout</a></div></div></div>');
 var inp=g('pds'),box=g('pdr'),cache=null;
 inp.addEventListener('focus',function(){api('admin/customers').then(function(x){cache=x}).catch(function(){})});
 inp.addEventListener('input',function(){var q=inp.value.trim().toLowerCase();if(!q||!cache){box.style.display='none';return}
  var m=cache.filter(function(c){return [c.name,c.cid,c.phone,c.username].join(' ').toLowerCase().indexOf(q)>-1}).slice(0,6);
  box.innerHTML=m.length?m.map(function(c){return '<a href="#customers"><span>'+esc(c.name)+'</span><small>'+esc(c.cid||'')+' &middot; '+esc(c.phone||'')+'</small></a>'}).join(''):'<div class="pd-nr">No match</div>';box.style.display='block'});
 document.addEventListener('click',function(e){if(!e.target.closest('.pd-s'))box.style.display='none';if(!e.target.closest('.er-prof'))g('pm').style.display='none'});
 document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();inp.focus()}});
 api('admin/summary').then(function(s){var n=(s.newRequests||0)+(s.dueBills||0);if(n){var b=g('nb');b.textContent=n;b.style.display='block'}}).catch(function(){});
 icons()}
window.bkDark=function(){dark(!document.body.classList.contains('dark'))};
window.bkPm=function(){var m=g('pm');m.style.display=m.style.display==='block'?'none':'block'};
try{if(localStorage.getItem('bkdark')==='1')dark(true)}catch(e){}

window.P=function(t,h){var h1=g('ttl');if(h1)h1.textContent=t;g('v').innerHTML=(t==='Dashboard'?'':'<h2 class="pt">'+esc(t)+'</h2>')+h;icons();window.scrollTo(0,0)};
function foot(){var m=document.querySelector('.main');if(m&&!m.querySelector('.er-foot'))m.insertAdjacentHTML('beforeend','<div class="er-foot"><span>&copy; '+new Date().getFullYear()+' BillKora ISP Management System. All rights reserved.</span><span>Powered by Innovation</span></div>')}

/* modules whose backend is not built yet */
function mod(key,title,phase,items,note){V[key]=function(){P(title,'<div class="card er-mod"><span class="er-ph">'+phase+'</span><h3>'+title+'</h3><p>'+note+'</p><ul>'+items.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div>');return Promise.resolve()}}
mod('mikrotik','MikroTik & RADIUS','Next step','Multiple router management|RouterOS API connection and status|PPPoE secrets and active sessions|Disconnect / reconnect user|Package change auto-sync to router|Router offline warning, error log and retry'.split('|'),'This module needs the RouterOS API connector. It will be built next, with real connection and no fake data.');
mod('corporate','Corporate Clients','Phase 3','Company profile with multiple branches|Dedicated package, CIR / MIR, public IP|Contract and SLA with downtime record|Separate billing and payment history'.split('|'),'Planned for the business-management phase.');
mod('resellers','Reseller Management','Phase 2','Add reseller and credit limit|Wallet / balance and commission|Package and bandwidth allocation|Reseller sees only their own customers'.split('|'),'Planned after payments and MikroTik integration.');
mod('field','Installation & Field Service','Phase 3','New installation request|Technician assignment and schedule|Device serial and installation photo|Mobile friendly job completion'.split('|'),'Planned for the business-management phase.');
mod('inventory','Inventory & Assets','Phase 3','Router, switch, OLT, ONU stock|Stock in / out with serial and MAC|Assign device to customer or POP|Warranty and damaged stock'.split('|'),'Planned for the business-management phase.');
mod('hrm','HRM & Employee','Phase 5','Employee profile and roles|Attendance and leave|Duty schedule and tasks'.split('|'),'Planned for the advanced phase.');

function chart(cum,dim){var W=620,H=250,L=44,B=28,R=12,Tp=14,mx=Math.max.apply(null,cum.concat([1])),step=Math.pow(10,Math.floor(Math.log(mx)/Math.LN10)),top=Math.ceil(mx/step)*step;if(top/step<3)top=Math.ceil(mx/(step/2))*(step/2);
 var pw=W-L-R,ph=H-Tp-B,X=function(i){return L+(dim>1?i/(dim-1):0)*pw},Y=function(v){return Tp+ph-(v/top)*ph},s='',i;
 for(i=0;i<=4;i++){var yy=Y(top/4*i);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="#e6edfa"/><text x="'+(L-8)+'" y="'+(yy+4)+'" font-size="11" fill="#7a8aa8" text-anchor="end">'+ck(top/4*i)+'</text>'}
 [1,8,15,22,dim].forEach(function(d){s+='<text x="'+X(d-1)+'" y="'+(H-8)+'" font-size="11" fill="#7a8aa8" text-anchor="middle">'+d+'</text>'});
 var pts=cum.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1)}),last=cum.length-1;
 if(cum.length)s+='<path d="M'+pts.join(' L')+'" fill="none" stroke="#1e6bff" stroke-width="3" stroke-linejoin="round"/><path d="M'+X(0)+','+Y(0)+' L'+pts.join(' L')+' L'+X(last)+','+Y(0)+'Z" fill="url(#eg)"/><circle cx="'+X(last)+'" cy="'+Y(cum[last])+'" r="5" fill="#fff" stroke="#1e6bff" stroke-width="3"/>';
 return '<svg viewBox="0 0 '+W+' '+H+'"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e6bff" stop-opacity=".35"/><stop offset="1" stop-color="#1e6bff" stop-opacity="0"/></linearGradient></defs>'+s+'</svg>'}
function spark(v){if(!v||v.length<2)return '';var mx=Math.max.apply(null,v),mn=Math.min.apply(null,v),r=(mx-mn)||1,p=v.map(function(y,i){return (i/(v.length-1)*120).toFixed(1)+','+(36-((y-mn)/r)*30).toFixed(1)}).join(' ');return '<svg class="sp" viewBox="0 0 120 40" preserveAspectRatio="none"><polyline points="'+p+'" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/></svg>'}
function kpi(c,ic,l,v,p,sp){return '<div class="pd-k '+c+'"><div class="ki"><i data-i="'+ic+'"></i></div><div><div class="kl">'+l+'</div><div class="kv">'+v+chip(p)+'</div><div class="ks">vs last month</div></div>'+spark(sp)+'</div>'}
function ring(p,t,s){var c=2*Math.PI*52,d=(p/100*c).toFixed(1);return '<svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="52" fill="none" stroke="#e3ecfb" stroke-width="11"/><circle cx="65" cy="65" r="52" fill="none" stroke="#17b890" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+d+' '+c.toFixed(1)+'" transform="rotate(-90 65 65)"/><text x="65" y="66" text-anchor="middle" font-size="22" font-weight="800" fill="#0f1f3d">'+t+'</text><text x="65" y="84" text-anchor="middle" font-size="10" fill="#7a8aa8">'+s+'</text></svg>'}
function topo(n,cu){return '<svg viewBox="0 0 360 230"><g stroke="#3b82ff" stroke-width="2" fill="none"><path d="M180 52V92"/><path d="M180 128L80 176"/><path d="M180 128V176"/><path d="M180 128L280 176"/></g><g font-size="11" fill="#fff" text-anchor="middle"><circle cx="180" cy="34" r="20" fill="#1e6bff"/><text x="180" y="72">Internet</text><rect x="152" y="92" width="56" height="34" rx="8" fill="#2a7bff"/><text x="180" y="148">Core Router ('+n+')</text><rect x="52" y="176" width="56" height="30" rx="8" fill="#1747d6"/><text x="80" y="224">OLT / Customers '+cu+'</text><rect x="152" y="176" width="56" height="30" rx="8" fill="#2a7bff"/><text x="180" y="224">Switch</text><rect x="252" y="176" width="56" height="30" rx="8" fill="#1747d6"/><text x="280" y="224">Server</text></g></svg>'}
function act(c,ic,t,s,at){return '<div class="pd-a"><div class="ai '+c+'"><i data-i="'+ic+'"></i></div><div><b>'+t+'</b><small>'+s+'</small></div><time>'+ft(at)+'</time></div>'}

var PD={};
window.pdTab=function(k,el){document.querySelectorAll('.er-vt a').forEach(function(a){a.classList.remove('on')});if(el)el.classList.add('on');var c=PD.c,h='';
 if(k==='ov'){h='<div class="pd-kv"><span>Package</span><b>'+esc(PD.pk[c.packageId]?PD.pk[c.packageId].name:'-')+'</b><span>Monthly</span><b>'+(PD.pk[c.packageId]?fmt(PD.pk[c.packageId].price):'-')+'</b><span>Customer ID</span><b>'+esc(c.cid||'')+'</b><span>Username</span><b>'+esc(c.username||'')+'</b><span>Active since</span><b>'+esc(String(c.joined||'').slice(0,10))+'</b></div>'}
 if(k==='bill')h=tbl(['Invoice','Month','Amount','Status'],PD.iv.slice(0,5).map(function(v){return [esc(v.no),v.month,fmt(v.amount),bdg(v.status)]}));
 if(k==='pay')h=tbl(['Receipt','Amount','Method'],PD.pm.slice(0,5).map(function(p){return [esc(p.no),fmt(p.amount),esc(p.method)]}));
 if(k==='tk')h=tbl(['Ticket','Subject','Status'],PD.tk.slice(0,5).map(function(t){return [esc(t.no),esc(t.subject),bdg(t.status)]}));
 if(k==='cn'){var d=PD.dv.filter(function(x){return x.customerId===c.id});h=d.length?tbl(['Type','IP','MAC','Status'],d.map(function(x){return [esc(x.type),esc(x.ip),esc(x.mac),bdg(x.status)]})):'<p class="pd-empty">No device linked to this customer yet.</p>'}
 g('pdBody').innerHTML=h};
window.nocTab=function(k,el){document.querySelectorAll('.er-nt a').forEach(function(a){a.classList.remove('on')});el.classList.add('on');var D2=PD.dv,h='';
 if(k==='topo')h='<div class="pd-noc"><div class="pd-topo">'+topo(D2.length,PD.active)+'</div><div class="pd-dv">'+(D2.length?D2.slice(0,4).map(function(d){return '<div><span>'+esc(d.type||'Device')+'<br><small class="muted">'+esc(d.ip||'')+'</small></span>'+bdg(d.status)+'</div>'}).join(''):'<p class="pd-empty">No device is linked yet.</p>')+'</div></div>';
 if(k==='dev')h=tbl(['Type','IP','Status'],D2.map(function(d){return [esc(d.type),esc(d.ip),bdg(d.status)]}));
 if(k==='bw')h='<p class="pd-empty">Live bandwidth needs the MikroTik / SNMP connector. It will show here after that module is built.</p>';
 if(k==='al'){var o=D2.filter(function(d){return d.status!=='online'});h=o.length?tbl(['Device','IP','Status'],o.map(function(d){return [esc(d.type),esc(d.ip),bdg(d.status)]})):'<p class="pd-empty">No alerts. Everything is fine.</p>'}
 g('nocBody').innerHTML=h;icons()};

V.dashboard=function(){
 return Promise.all([api('admin/customers'),api('admin/packages'),tryApi('admin/devices'),tryApi('admin/invoices'),tryApi('admin/tickets'),tryApi('admin/payments')]).then(function(r){
  var C=r[0]||[],PK=r[1]||[],DV=r[2],IV=r[3],TK=r[4],PM=r[5],now=new Date(),cm=mk(now),pmn=mk(new Date(now.getFullYear(),now.getMonth()-1,1)),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),today=now.getDate(),i,j;
  var pk={},nm={},bm={},dm={},cl={},daily=[];C.forEach(function(c){nm[c.id]=c.name});PK.forEach(function(p){pk[p.id]=p});for(i=0;i<dim;i++)daily.push(0);
  IV.forEach(function(v){var a=Number(v.amount)||0;bm[v.month]=(bm[v.month]||0)+a;if(v.status==='due')dm[v.month]=(dm[v.month]||0)+a});
  PM.forEach(function(p){var d=new Date(p.date),m=mk(d),a=Number(p.amount)||0;cl[m]=(cl[m]||0)+a;if(m===cm&&!isNaN(d))daily[d.getDate()-1]+=a});
  var keys=[];for(j=5;j>=0;j--)keys.push(mk(new Date(now.getFullYear(),now.getMonth()-j,1)));
  var cum=[],s=0;for(i=0;i<today;i++){s+=daily[i];cum.push(s)}
  var cs=keys.map(function(k){return C.filter(function(c){var d=new Date(c.joined);return !isNaN(d)&&mk(d)<=k}).length});
  var newNow=C.filter(function(c){return mk(new Date(c.joined))===cm}).length,newPrev=C.filter(function(c){return mk(new Date(c.joined))===pmn}).length;
  var act0=C.filter(function(c){return c.status==='active'}).length,on=DV.filter(function(d){return d.status==='online'}).length,off=DV.length-on;
  var latest=C.slice().sort(function(a,b){return Date.parse(b.joined||0)-Date.parse(a.joined||0)})[0];
  PD={c:latest,pk:pk,dv:DV,active:act0,iv:[],pm:[],tk:[]};
  if(latest){PD.iv=IV.filter(function(v){return v.customerId===latest.id});PD.pm=PM.filter(function(p){return p.customerId===latest.id});PD.tk=TK.filter(function(t){return t.customerId===latest.id})}
  var ev=[];PM.forEach(function(p){ev.push({t:p.date,h:act('a-g','check','Payment Received',esc(p.customer)+' | '+fmt(p.amount),p.date)})});
  IV.forEach(function(v){if(v.issued)ev.push({t:v.issued,h:act('a-p','file','Invoice Generated',esc(v.no||'')+' | '+fmt(v.amount),v.issued)})});
  TK.forEach(function(t){if(t.date)ev.push({t:t.date,h:act('a-b','hp','New Ticket Created',esc(t.no||'')+' | '+esc(t.subject||''),t.date)})});
  C.forEach(function(c){if(c.joined)ev.push({t:c.joined,h:act('a-o','users','New Customer Added',esc(c.name),c.joined)})});
  ev.sort(function(a,b){return Date.parse(b.t)-Date.parse(a.t)});
  var f1=new Date(now.getFullYear(),now.getMonth(),1).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),f2=new Date(now.getFullYear(),now.getMonth()+1,0).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  var h='<div class="pd-wel"><div class="er-wel"><h2>Welcome Back, Admin! &#128075;</h2><p>Here\u2019s what\u2019s happening with your ISP today.</p></div><div class="pd-date">&#128197; '+f1+' &ndash; '+f2+'</div></div>'
  +'<div class="pd-kpi">'+kpi('k1','users','Total Customers',C.length.toLocaleString('en-IN'),pct(newNow,newPrev),cs)
  +kpi('k2','card','Total Revenue',fmt(bm[cm]||0),pct(bm[cm]||0,bm[pmn]||0),keys.map(function(k){return bm[k]||0}))
  +kpi('k3','file','Due Amount',fmt(dm[cm]||0),pct(dm[cm]||0,dm[pmn]||0),keys.map(function(k){return dm[k]||0}))
  +kpi('k4','check','Collected',fmt(cl[cm]||0),pct(cl[cm]||0,cl[pmn]||0),keys.map(function(k){return cl[k]||0}))+'</div>'
  +'<div class="pd-r2"><div class="card pd-chart"><div class="pd-h"><h3><i data-i="chart"></i>Revenue Overview</h3><span class="pd-pill">This Month</span></div><div class="pd-leg"><span style="color:#1e6bff">&#9679; Collection (cumulative)</span></div>'+chart(cum,dim)+'</div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="wifi"></i>Network Status</h3></div>'+(DV.length?'<div class="pd-ok">'+(off?off+' device(s) need attention':'All Systems Online')+'</div><div class="pd-ring">'+ring(Math.round(on/DV.length*1000)/10,(Math.round(on/DV.length*1000)/10)+'%','Network Uptime')+'<div class="pd-nl"><div><i class="d" style="background:#17b890"></i>Online<b>'+on+'</b></div><div><i class="d" style="background:#f5a623"></i>Warning<b>0</b></div><div><i class="d" style="background:#e5484d"></i>Offline<b>'+off+'</b></div></div></div><p style="margin-top:12px"><a class="pd-pill" href="#network">View Details &rarr;</a></p>':'<p class="pd-empty">No router or device is linked yet. After the MikroTik module is connected, live uptime will show here.</p><p style="margin-top:14px"><a class="pd-pill" href="#network">Open Network &rarr;</a></p>')+'</div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="zap"></i>Quick Actions</h3></div><div class="pd-qa"><a class="q1" href="#customers" onclick="setTimeout(function(){editC()},300)"><i data-i="users"></i>Add<br>Customer</a><a class="q2" href="#billing" onclick="setTimeout(function(){newInv()},600)"><i data-i="file"></i>Create<br>Invoice</a><a class="q3" href="#payments" onclick="setTimeout(function(){recP()},600)"><i data-i="card"></i>Record<br>Payment</a></div></div></div>'
  +'<div class="pd-r3"><div class="card"><div class="pd-h"><h3><i data-i="user"></i>Customer Profile</h3><a class="pd-pill" href="#customers">View All</a></div>'
  +(latest?'<div class="er-pc"><div><div class="pd-prof" style="flex-direction:column;align-items:flex-start"><div class="pd-ava">'+esc((latest.name||'?').charAt(0).toUpperCase())+'</div><b>'+esc(latest.name)+'</b><div class="muted">'+esc(latest.phone||'')+'</div><div class="muted">'+esc(latest.address||'')+'</div>'+bdg(latest.status||'active')+'</div><div class="er-vt"><a class="on" onclick="pdTab(\'ov\',this)">Overview</a><a onclick="pdTab(\'bill\',this)">Billing History</a><a onclick="pdTab(\'pay\',this)">Payment History</a><a onclick="pdTab(\'tk\',this)">Support Tickets</a><a onclick="pdTab(\'cn\',this)">Connection Info</a></div></div><div id="pdBody"></div></div>':'<p class="pd-empty">No customers yet. Add one from Customer Management.</p>')+'</div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="clock"></i>Recent Activities</h3></div><div class="pd-act">'+(ev.length?ev.slice(0,5).map(function(e){return e.h}).join(''):'<p class="pd-empty">Activity will appear here as customers, bills and payments are added.</p>')+'</div></div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="server"></i>Network Monitoring (NOC)</h3><span class="pd-live">'+(DV.length?'Live':'Not connected')+'</span></div><div class="er-tabs er-nt"><a class="on" onclick="nocTab(\'topo\',this)">Topology</a><a onclick="nocTab(\'dev\',this)">Devices</a><a onclick="nocTab(\'bw\',this)">Bandwidth</a><a onclick="nocTab(\'al\',this)">Alerts</a></div><div id="nocBody"></div></div></div>';
  P('Dashboard',h);if(latest)pdTab('ov',null);nocTab('topo',document.querySelector('.er-nt a'));icons()})};

buildSide();buildTop();foot();
if(typeof go==='function')go();
})();