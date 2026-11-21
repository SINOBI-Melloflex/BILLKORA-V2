/* BillKora premium dashboard + chrome (loads after migration.js) */
(function(){
var T='\u09f3';
function fmt(n){return T+Number(n||0).toLocaleString('en-IN')}
function ck(n){n=Number(n)||0;return n>=100000?(n/100000).toFixed(n%100000?1:0)+'L':n>=1000?(n/1000).toFixed(n%1000?1:0)+'k':String(n)}
function mk(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)}
function ft(t){var d=new Date(t);return isNaN(d)?'':d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+', '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
function tryApi(list){var i=0;function next(){if(i>=list.length)return Promise.resolve([]);var u=list[i++];return api(u).then(function(r){return Array.isArray(r)?r:next()}).catch(function(e){if(e&&e.message==='auth')throw e;return next()})}return next()}
function spark(v){if(!v||v.length<2)return '';var mx=Math.max.apply(null,v),mn=Math.min.apply(null,v),r=(mx-mn)||1,p=v.map(function(y,i){return (i/(v.length-1)*120).toFixed(1)+','+(36-((y-mn)/r)*30).toFixed(1)}).join(' ');return '<svg class="sp" viewBox="0 0 120 40" preserveAspectRatio="none"><polyline points="'+p+'" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/></svg>'}
function kpi(cls,ic,label,val,sub,sp){return '<div class="pd-k '+cls+'"><div class="ki"><i data-i="'+ic+'"></i></div><div><div class="kl">'+label+'</div><div class="kv">'+val+'</div><div class="ks">'+sub+'</div></div>'+spark(sp)+'</div>'}
function chart(cum,dim){var W=620,H=250,L=44,B=28,R=12,Tp=14,mx=Math.max.apply(null,cum.concat([1])),step=Math.pow(10,Math.floor(Math.log(mx)/Math.LN10)),top=Math.ceil(mx/step)*step;if(top/step<3)top=Math.ceil(mx/(step/2))*(step/2);
 var pw=W-L-R,ph=H-Tp-B,X=function(i){return L+(dim>1?i/(dim-1):0)*pw},Y=function(v){return Tp+ph-(v/top)*ph},g='',i;
 for(i=0;i<=4;i++){var yv=top/4*i,yy=Y(yv);g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="#e6edfa"/><text x="'+(L-8)+'" y="'+(yy+4)+'" font-size="11" fill="#5b6b88" text-anchor="end">'+ck(yv)+'</text>'}
 [1,8,15,22,dim].forEach(function(d){g+='<text x="'+X(d-1)+'" y="'+(H-8)+'" font-size="11" fill="#5b6b88" text-anchor="middle">'+d+'</text>'});
 var pts=cum.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1)}),last=cum.length-1;
 var line=cum.length?'<path d="M'+pts.join(' L')+'" fill="none" stroke="#1e6bff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M'+X(0)+','+Y(0)+' L'+pts.join(' L')+' L'+X(last)+','+Y(0)+'Z" fill="url(#pdg)"/><circle cx="'+X(last)+'" cy="'+Y(cum[last])+'" r="5" fill="#fff" stroke="#1e6bff" stroke-width="3"/>':'';
 return '<svg viewBox="0 0 '+W+' '+H+'"><defs><linearGradient id="pdg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e6bff" stop-opacity=".35"/><stop offset="1" stop-color="#1e6bff" stop-opacity="0"/></linearGradient></defs>'+g+line+'</svg>'}
function ring(pct,txt,sub){var c=2*Math.PI*52,d=(pct/100*c).toFixed(1);return '<svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="52" fill="none" stroke="#e3ecfb" stroke-width="11"/><circle cx="65" cy="65" r="52" fill="none" stroke="#17b890" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+d+' '+c.toFixed(1)+'" transform="rotate(-90 65 65)"/><text x="65" y="66" text-anchor="middle" font-size="22" font-weight="800" fill="#0f1f3d">'+txt+'</text><text x="65" y="84" text-anchor="middle" font-size="10" fill="#5b6b88">'+sub+'</text></svg>'}
function topo(rt,cust){return '<svg viewBox="0 0 360 230"><g stroke="#3b82ff" stroke-width="2" fill="none"><path d="M180 52 V92"/><path d="M180 128 L80 176"/><path d="M180 128 V176"/><path d="M180 128 L280 176"/></g><g font-size="12" fill="#fff" text-anchor="middle" font-family="Segoe UI,Arial"><circle cx="180" cy="34" r="20" fill="#1e6bff"/><text x="180" y="72" font-size="11">Internet</text><rect x="152" y="92" width="56" height="34" rx="8" fill="#2a7bff"/><text x="180" y="148" font-size="11">Core Router ('+rt+')</text><rect x="52" y="176" width="56" height="30" rx="8" fill="#1747d6"/><text x="80" y="224" font-size="11">Customers '+cust+'</text><rect x="152" y="176" width="56" height="30" rx="8" fill="#2a7bff"/><text x="180" y="224" font-size="11">Switch</text><rect x="252" y="176" width="56" height="30" rx="8" fill="#1747d6"/><text x="280" y="224" font-size="11">Server</text></g></svg>'}
function act(cls,ic,title,sub,t){return '<div class="pd-a"><div class="ai '+cls+'"><i data-i="'+ic+'"></i></div><div><b>'+title+'</b><small>'+sub+'</small></div><time>'+ft(t)+'</time></div>'}

V.dashboard=function(){
 return Promise.all([api('admin/customers'),api('admin/packages'),tryApi(['admin/devices']),tryApi(['admin/invoices','admin/billing','admin/bills']),tryApi(['admin/tickets','admin/support'])]).then(function(r){
  var C=r[0]||[],PK=r[1]||[],DV=r[2],IV=r[3],TK=r[4],now=new Date(),cm=mk(now),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),today=now.getDate(),i,j;
  var nm={},pk={};C.forEach(function(c){nm[c.id]=c.name});PK.forEach(function(p){pk[p.id]=p});
  var billed=0,coll=0,due=0,daily=[],keys=[],bm={},dm={};for(i=0;i<dim;i++)daily.push(0);
  for(j=5;j>=0;j--)keys.push(mk(new Date(now.getFullYear(),now.getMonth()-j,1)));
  IV.forEach(function(v){var a=Number(v.amount)||0,m=v.month||'';if(m===cm)billed+=a;bm[m]=(bm[m]||0)+a;
   if(v.status==='paid'){var d=new Date(v.paidOn||v.issued);if(!isNaN(d)&&mk(d)===cm){coll+=a;daily[d.getDate()-1]+=a}}
   else if(v.status!=='cancelled'){due+=a;dm[m]=(dm[m]||0)+a}});
  var cum=[],s=0;for(i=0;i<today;i++){s+=daily[i];cum.push(s)}
  var cs=keys.map(function(k){return C.filter(function(c){var d=new Date(c.joined);return !isNaN(d)&&mk(d)<=k}).length});
  var act0=C.filter(function(c){return c.status==='active'}).length,sus=C.filter(function(c){return c.status==='suspended'}).length;
  var on=DV.filter(function(d){return d.status==='online'}).length,off=DV.length-on;
  var latest=C.slice().sort(function(a,b){return Date.parse(b.joined||0)-Date.parse(a.joined||0)})[0];
  var ev=[];
  IV.forEach(function(v){if(v.status==='paid'&&v.paidOn)ev.push({t:v.paidOn,h:act('a-g','check','Payment Received',esc(nm[v.customerId]||'Customer')+' | '+fmt(v.amount),v.paidOn)});if(v.issued)ev.push({t:v.issued,h:act('a-p','file','Invoice Generated',esc(v.no||'')+' | '+fmt(v.amount),v.issued)})});
  TK.forEach(function(t){if(t.date)ev.push({t:t.date,h:act('a-b','hp','New Ticket Created',esc(t.no||'')+' | '+esc(t.subject||''),t.date)})});
  C.forEach(function(c){if(c.joined)ev.push({t:c.joined,h:act('a-o','users','New Customer Added',esc(c.name),c.joined)})});
  ev.sort(function(a,b){return Date.parse(b.t)-Date.parse(a.t)});
  var mname=now.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  var h='<div class="pd-wel"><div><h2>Welcome Back, Admin! &#128075;</h2><p>Here\u2019s what\u2019s happening with your ISP today.</p></div><div class="pd-date">'+mname+'</div></div>'
  +'<div class="pd-kpi">'+kpi('k1','users','Total Customers',C.length.toLocaleString('en-IN'),act0+' active &middot; '+sus+' suspended',cs)
  +kpi('k2','card','Total Revenue',fmt(billed),'Billed this month',keys.map(function(k){return bm[k]||0}))
  +kpi('k3','file','Due Amount',fmt(due),'Unpaid invoices',keys.map(function(k){return dm[k]||0}))
  +kpi('k4','check','Collected',fmt(coll),'Collected this month',cum.length>1?cum:[0,coll])+'</div>'
  +'<div class="pd-r2"><div class="card pd-chart"><div class="pd-h"><h3><i data-i="chart"></i>Revenue Overview</h3><span class="pd-pill">This Month</span></div><div class="pd-leg"><span style="color:#1e6bff">&#9679; Collection (cumulative)</span></div>'+chart(cum,dim)+'</div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="wifi"></i>Network Status</h3></div>'
  +(DV.length?'<div class="pd-ok">'+(off?off+' device(s) need attention':'All Systems Online')+'</div><div class="pd-ring">'+ring(Math.round(on/DV.length*1000)/10,(Math.round(on/DV.length*1000)/10)+'%','Devices up')+'<div class="pd-nl"><div><i class="d" style="background:#17b890"></i>Online<b>'+on+'</b></div><div><i class="d" style="background:#e5484d"></i>Offline<b>'+off+'</b></div><div><i class="d" style="background:#1e6bff"></i>Total<b>'+DV.length+'</b></div></div></div><p style="margin-top:12px"><a class="pd-pill" href="#network">View Details &rarr;</a></p>'
   :'<p class="pd-empty">No router or device is linked yet. Connect your MikroTik to see live uptime here.</p><p style="margin-top:14px"><a class="pd-pill" href="#network">Open Network &rarr;</a></p>')+'</div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="zap"></i>Quick Actions</h3></div><div class="pd-qa"><a class="q1" href="#customers"><i data-i="users"></i>Add<br>Customer</a><a class="q2" href="#billing"><i data-i="file"></i>Create<br>Invoice</a><a class="q3" href="#payments"><i data-i="card"></i>Record<br>Payment</a><a class="q4" href="#support"><i data-i="hp"></i>Open<br>Ticket</a></div></div></div>'
  +'<div class="pd-r3"><div class="card"><div class="pd-h"><h3><i data-i="user"></i>Latest Customer</h3><a class="pd-pill" href="#customers">View All</a></div>'
  +(latest?'<div class="pd-prof"><div class="pd-ava">'+esc((latest.name||'?').charAt(0).toUpperCase())+'</div><div><b style="font-size:17px">'+esc(latest.name)+'</b><div class="muted">'+esc(latest.phone||'')+'</div><div class="muted">'+esc(latest.address||'')+'</div><div style="margin-top:6px">'+bdg(latest.status||'active')+'</div></div></div><div class="pd-kv"><span>Package</span><b>'+esc(pk[latest.packageId]?pk[latest.packageId].name:'-')+'</b><span>Monthly</span><b>'+(pk[latest.packageId]?fmt(pk[latest.packageId].price):'-')+'</b><span>Customer ID</span><b>'+esc(latest.cid||'')+'</b><span>Username</span><b>'+esc(latest.username||'')+'</b></div>':'<p class="pd-empty">No customers yet. Add one, or bring your old list with Data / Device Migration.</p><p style="margin-top:14px"><a class="pd-pill" href="#migration">Start Migration</a></p>')+'</div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="clock"></i>Recent Activities</h3></div><div class="pd-act">'+(ev.length?ev.slice(0,5).map(function(e){return e.h}).join(''):'<p class="pd-empty">Activity will appear here as customers, bills and payments are added.</p>')+'</div></div>'
  +'<div class="card"><div class="pd-h"><h3><i data-i="server"></i>Network Monitoring (NOC)</h3><span class="pd-live">'+(DV.length?'Live':'Not connected')+'</span></div><div class="pd-noc"><div class="pd-topo">'+topo(DV.length,act0)+'</div><div class="pd-dv">'+(DV.length?DV.slice(0,4).map(function(d){return '<div><span>'+esc(d.type||'Device')+'<br><small class="muted">'+esc(d.ip||'')+'</small></span>'+bdg(d.status)+'</div>'}).join(''):'<p class="pd-empty">Connect a MikroTik to see device status here.</p>')+'</div></div></div></div>';
  P('Dashboard',h);chrome();if(typeof icons==='function')icons()})};

function chrome(){var top=document.querySelector('.top'),side=document.querySelector('.side'),$=function(x){return document.getElementById(x)};
 if(top&&!top.querySelector('.pd-s')){
  var html='<div class="pd-s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input id="pds" placeholder="Search customer name, ID, phone... (Ctrl + K)" autocomplete="off"><div id="pdr" class="pd-res"></div></div>',h1=top.querySelector('h1');
  if(h1)h1.insertAdjacentHTML('afterend',html);else top.insertAdjacentHTML('afterbegin',html);
  var inp=$('pds'),box=$('pdr'),cache=null;
  inp.addEventListener('focus',function(){if(!cache)api('admin/customers').then(function(x){cache=x}).catch(function(){})});
  inp.addEventListener('input',function(){var q=inp.value.trim().toLowerCase();if(!q||!cache){box.style.display='none';return}
   var m=cache.filter(function(c){return [c.name,c.cid,c.phone,c.username].join(' ').toLowerCase().indexOf(q)>-1}).slice(0,6);
   box.innerHTML=m.length?m.map(function(c){return '<a href="#customers"><span>'+esc(c.name)+'</span><small>'+esc(c.cid||'')+' &middot; '+esc(c.phone||'')+'</small></a>'}).join(''):'<div class="pd-nr">No match</div>';box.style.display='block'});
  document.addEventListener('click',function(e){if(!e.target.closest('.pd-s'))box.style.display='none'});
  document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();inp.focus()}})}
 if(side&&!side.querySelector('.pd-sys')){var d=new Date();side.insertAdjacentHTML('beforeend','<div class="pd-sys"><b><i></i>System Online</b><small>Last updated:<br>'+d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})+'</small></div><div class="pd-tag">Smarter Network,<br>Stronger Business</div>')}}
chrome();
if(typeof go==='function'&&(!location.hash||location.hash==='#dashboard'))go();
})();