(function(){
var OV=null,chat,ctl,dotsEl,RID=0,TM=null,TICK=null,CUR=0,D={},PATH=['hello','which'];
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var CSS=[
 '.mti-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,6,20,.78);backdrop-filter:blur(6px);animation:mtiF .25s ease both;font-family:Segoe UI,Arial,sans-serif}',
 '.mti-p{position:relative;width:100%;max-width:580px;height:min(640px,92vh);display:flex;flex-direction:column;background:linear-gradient(160deg,#0b1230,#141a46);border:1px solid rgba(139,92,246,.35);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 60px rgba(59,130,246,.15);color:#f1f5f9;overflow:hidden;animation:mtiP .4s cubic-bezier(.2,.9,.3,1.2) both}',
 '.mti-h{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.08)}',
 '.mti-ti{font-weight:700;font-size:15px;flex:1}.mti-ti small{display:block;font-weight:400;font-size:11px;color:#94a3b8;margin-top:2px}',
 '.mti-x{cursor:pointer;color:#94a3b8;font-size:18px;width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px}.mti-x:hover{background:rgba(255,255,255,.08);color:#f87171}',
 '.mti-dots{display:flex;gap:6px;padding:10px 20px 0}.mti-dots i{flex:1;height:4px;border-radius:4px;background:rgba(255,255,255,.1);transition:background .4s}.mti-dots i.on{background:linear-gradient(90deg,#3b82f6,#8b5cf6)}',
 '.mti-c{flex:1;overflow:auto;padding:18px 20px 8px;scroll-behavior:smooth}',
 '.mti-r{display:flex;gap:10px;margin-bottom:12px;animation:mtiU .35s ease both}.mti-r.u{justify-content:flex-end}',
 '.mti-o{flex:0 0 30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7dd3fc,#3b82f6 55%,#6d28d9);box-shadow:0 0 18px rgba(59,130,246,.7);animation:mtiO 2.4s ease-in-out infinite}',
 '.mti-bb{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px 14px 14px 4px;padding:11px 14px;font-size:14px;line-height:1.55;white-space:pre-line;max-width:86%}',
 '.mti-bb.cur::after{content:"|";margin-left:1px;color:#22d3ee;animation:mtiB .7s steps(1) infinite}',
 '.mti-ub{background:linear-gradient(90deg,#2563eb,#7c3aed);border-radius:14px 14px 4px 14px;padding:9px 14px;font-size:14px;max-width:80%;word-break:break-all}',
 '.mti-k{padding:10px 20px 18px;min-height:100px;opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s}.mti-k.on{opacity:1;transform:none}',
 '.mti-in{display:flex;gap:8px;align-items:center}.mti-inw{flex:1;position:relative}',
 '.mti-i{width:100%;box-sizing:border-box;padding:12px 40px 12px 14px;border-radius:12px;border:1px solid #3a4878;background:#161e42;color:#f1f5f9;font-size:15px;outline:none}',
 '.mti-i:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.25)}',
 '.mti-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;color:#94a3b8;font-size:15px;padding:4px;user-select:none}',
 '.mti-b{padding:11px 18px;border:0;border-radius:12px;cursor:pointer;font-weight:600;font-size:14px;color:#fff;background:linear-gradient(90deg,#1e6bff,#8b5cf6);transition:transform .15s,box-shadow .15s}',
 '.mti-b:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(99,102,241,.45)}',
 '.mti-b.g{background:rgba(255,255,255,.07);border:1px solid rgba(148,163,184,.35)}',
 '.mti-er{color:#f87171;font-size:12.5px;min-height:18px;margin-top:6px}',
 '.mti-bk{margin-top:6px;font-size:12.5px;color:#94a3b8;cursor:pointer;display:inline-block}.mti-bk:hover{color:#f1f5f9}',
 '.mti-row{display:flex;gap:10px;flex-wrap:wrap}',
 '.mti-ck div{display:flex;align-items:center;gap:10px;padding:5px 0;font-size:13.5px;color:#94a3b8}',
 '.mti-ck i{width:16px;height:16px;border-radius:50%;border:2px solid #3a4878;flex:0 0 auto;box-sizing:border-box}',
 '.mti-ck .a{color:#f1f5f9}.mti-ck .a i{border-color:#3b82f6 transparent #8b5cf6 transparent;animation:mtiS .8s linear infinite}',
 '.mti-ck .d{color:#f1f5f9}.mti-ck .d i{background:#34d399;border-color:#34d399}',
 '.mti-ck .f{color:#f87171}.mti-ck .f i{background:#f87171;border-color:#f87171}',
 '@keyframes mtiF{from{opacity:0}to{opacity:1}}@keyframes mtiP{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}',
 '@keyframes mtiU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes mtiS{to{transform:rotate(360deg)}}',
 '@keyframes mtiB{50%{opacity:0}}@keyframes mtiO{0%,100%{transform:scale(1);box-shadow:0 0 14px rgba(59,130,246,.6)}50%{transform:scale(1.12);box-shadow:0 0 28px rgba(139,92,246,.9)}}',
 '@media (prefers-reduced-motion:reduce){.mti-ov *{animation:none!important;transition:none!important}}'
].join('');
var QT={
 hello:"Hi! I'm your migration assistant.\nI'll bring your PPPoE users, passwords and profiles straight from your MikroTik, so you don't need any billing file.\n\nI only READ from the router. Nothing is changed and nobody gets disconnected.",
 which:"Which router should I read from?",
 ip:"What is your MikroTik's IP address? It is the address you use in WinBox, for example 192.168.88.1.",
 port:"Which API port does it use? Most routers use 8728, so you can just continue.",
 user:"Which username should I log in with? A read-only user is enough.",
 pass:"And its password? It stays on this PC and is only used for this one read.",
 admin:"Last one. To keep your system safe, please type your BillKora admin password.",
 read:"Perfect, thank you! Give me a moment while I read your router. Remember, I only look, I never change anything."
};
var CFG={
 ip:{type:'text',ph:'e.g. 192.168.88.1',key:'ip'},
 port:{type:'number',ph:'8728',key:'port',def:'8728'},
 user:{type:'text',ph:'e.g. admin',key:'user'},
 pass:{type:'password',ph:'Router password (can be empty)',key:'pass'},
 admin:{type:'password',ph:'BillKora admin password',key:'admin'}
};
function el(t,c){var e=document.createElement(t);if(c)e.className=c;return e}
function msg(t,bad){if(typeof toast==='function')toast(t,bad?1:0);else alert(t)}
function setPath(){PATH=D.mode==='saved'?['hello','which','admin','read']:['hello','which','ip','port','user','pass','admin','read']}
function ANS(id){
 if(id==='hello')return "Let's start";
 if(id==='which')return D.mode==='saved'?'Use my saved router':'Enter router details';
 if(id==='ip')return D.ip;if(id==='port')return D.port;if(id==='user')return D.user;
 if(id==='pass'||id==='admin')return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
 return null;
}
function scroll(){if(chat)chat.scrollTop=chat.scrollHeight}
function bot(text){
 var r=el('div','mti-r'),o=el('div','mti-o'),b=el('div','mti-bb');
 b.textContent=text||'';r.appendChild(o);r.appendChild(b);chat.appendChild(r);scroll();return b;
}
function usr(text){var r=el('div','mti-r u'),b=el('div','mti-ub');b.textContent=text;r.appendChild(b);chat.appendChild(r);scroll()}
function typeInto(node,text,done){
 if(TM){clearInterval(TM);TM=null}
 if(reduce){node.textContent=text;if(done)done();return}
 var i=0;node.textContent='';node.classList.add('cur');
 TM=setInterval(function(){
  i+=2;node.textContent=text.slice(0,i);scroll();
  if(i>=text.length){clearInterval(TM);TM=null;node.classList.remove('cur');if(done)done()}
 },14);
}
function dots(){
 var n=PATH.length-1,h='';
 for(var i=1;i<=n;i++)h+='<i'+(i<=CUR?' class="on"':'')+'></i>';
 dotsEl.innerHTML=h;
}
function btn(label,fn,ghost){var b=el('button','mti-b'+(ghost?' g':''));b.type='button';b.textContent=label;b.onclick=fn;return b}
function showCtl(){ctl.classList.add('on')}
function back(){if(CUR>0)render(CUR-1)}
function go(){render(CUR+1)}
function backLink(){
 if(CUR<1)return null;
 var a=el('span','mti-bk');a.textContent='\u2190 Back';a.onclick=back;return a;
}
function V(id,v){
 if(id==='ip'&&!/^[A-Za-z0-9.\-]{1,100}$/.test(v))return 'Please type the router address, for example 192.168.88.1';
 if(id==='port'){var n=parseInt(v,10);if(!(n>=1&&n<=65535))return 'The port must be a number from 1 to 65535'}
 if(id==='user'&&!v)return 'Please type the router username';
 if(id==='admin'&&!v)return 'Please type your BillKora admin password';
 return '';
}
function showInput(id){
 var c=CFG[id],w=el('div','mti-in'),iw=el('div','mti-inw'),inp=el('input','mti-i'),er=el('div','mti-er');
 inp.type=c.type;inp.placeholder=c.ph;inp.value=D[c.key]!=null&&D[c.key]!==''?D[c.key]:(c.def||'');inp.autocomplete='off';
 iw.appendChild(inp);
 if(c.type==='password'){
  var eye=el('span','mti-eye');eye.textContent='\uD83D\uDC41';
  eye.onclick=function(){inp.type=inp.type==='password'?'text':'password'};iw.appendChild(eye);
 }
 var ok=btn('Continue \u2192',function(){
  var v=(c.type==='password')?inp.value:inp.value.trim();
  var e=V(id,v);if(e){er.textContent=e;return}
  D[c.key]=v;go();
 });
 inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();ok.click()}};
 w.appendChild(iw);w.appendChild(ok);ctl.appendChild(w);ctl.appendChild(er);
 var bl=backLink();if(bl)ctl.appendChild(bl);
 setTimeout(function(){try{inp.focus()}catch(x){}},60);
}
function showCtlFor(id){
 ctl.innerHTML='';
 if(id==='hello'){ctl.appendChild(btn("Let's start  \u2192",go))}
 else if(id==='which'){
  var r=el('div','mti-row');
  r.appendChild(btn('Use my saved router',function(){D.mode='saved';setPath();go()}));
  r.appendChild(btn('Enter router details',function(){D.mode='new';setPath();go()},true));
  ctl.appendChild(r);var bl=backLink();if(bl)ctl.appendChild(bl);
 }
 else if(CFG[id])showInput(id);
 showCtl();
}
function render(n){
 RID++;var my=RID;
 if(TM){clearInterval(TM);TM=null}
 if(TICK){clearInterval(TICK);TICK=null}
 chat.innerHTML='';ctl.innerHTML='';ctl.classList.remove('on');
 CUR=n;
 for(var i=0;i<n;i++){bot(QT[PATH[i]]);var a=ANS(PATH[i]);if(a!==null)usr(a)}
 dots();
 var id=PATH[n],b=bot('');
 typeInto(b,QT[id],function(){
  if(my!==RID)return;
  if(id==='read')startRead(my);else showCtlFor(id);
 });
}
function failBox(text,retryIdx){
 var b=bot('');
 typeInto(b,text,function(){
  ctl.innerHTML='';
  var r=el('div','mti-row');
  r.appendChild(btn('Try again',function(){render(retryIdx>=0?retryIdx:1)}));
  r.appendChild(btn('Close',closeBox,true));
  ctl.appendChild(r);showCtl();
 });
}
function friendly(m){
 m=String(m||'');
 var ia=PATH.indexOf('admin'),iu=PATH.indexOf('user'),ip=PATH.indexOf('ip');
 if(/Wrong admin password/i.test(m))return ["That admin password doesn't match. Let's try it again.",ia];
 if(/Too many attempts/i.test(m))return ["Too many wrong attempts. Please wait one minute and try again.",ia];
 if(/Login failed|invalid user|cannot log/i.test(m))return ["The router refused that username or password. Let's check them again.",iu>=0?iu:1];
 if(/Cannot connect|timeout|did not answer|closed by router|ECONN|EHOST|ENET/i.test(m))return ["I couldn't reach the router.\n\nPlease check the IP address, and that the API service is enabled in WinBox under IP > Services (port 8728).",ip>=0?ip:1];
 if(/No saved MikroTik/i.test(m))return ["I couldn't find a saved router. Please enter the router details instead.",1];
 return ["Something went wrong: "+m,1];
}
function startRead(my){
 var names=['Connecting to your router','Logging in','Reading PPPoE users','Reading profiles and pools'];
 var r=el('div','mti-r'),o=el('div','mti-o'),b=el('div','mti-bb'),ck=el('div','mti-ck'),items=[];
 names.forEach(function(t){var d=el('div'),i=el('i'),s=el('span');s.textContent=t;d.appendChild(i);d.appendChild(s);ck.appendChild(d);items.push(d)});
 b.appendChild(ck);r.appendChild(o);r.appendChild(b);chat.appendChild(r);scroll();
 var idx=0;items[0].className='a';
 TICK=setInterval(function(){
  if(idx<2){items[idx].className='d';idx++;items[idx].className='a'}
 },1100);
 var body={adminPass:D.admin||'',ip:D.mode==='saved'?'':(D.ip||''),port:D.port||'8728',user:D.user||'',pass:D.pass||''};
 fetch('/api/mtimport/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
 .then(function(r){return r.json()}).then(function(j){
  if(my!==RID)return;
  clearInterval(TICK);TICK=null;
  if(!j.ok)throw new Error(j.error||'Could not read the router');
  var rows=[['Customer Name','Phone','PPPoE Username','PPPoE Password','Package','Monthly Bill','Previous Due','Sub Zone','Zone','Address','IP Address','MAC Address']],n=0;
  j.secrets.forEach(function(s){
   if(/^BillKora test/i.test(s.comment||''))return;
   var nm=(s.comment&&s.comment.length<=60)?s.comment:s.name;
   rows.push([String(nm),'',String(s.name),String(s.password),String(s.profile||'default'),'','','','','','','']);n++;
  });
  if(!n)throw new Error('No PPPoE users were found on the router.');
  var ws=XLSX.utils.aoa_to_sheet(rows),wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'MikroTik');
  var arr=XLSX.write(wb,{bookType:'xlsx',type:'array'});
  var file=new File([arr],'mikrotik-import.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  D.pass='';D.admin='';
  items.forEach(function(d){d.className='d'});
  setTimeout(function(){
   if(my!==RID)return;
   var t='All done! I found '+n+' PPPoE users in '+j.profiles.length+' profiles on your router.'+(j.skipped?'\n('+j.skipped+' non-PPPoE entries were skipped.)':'')+'\n\nNext, I will ask you for the monthly price of each package.';
   var bb=bot('');
   typeInto(bb,t,function(){
    if(my!==RID)return;
    ctl.innerHTML='';
    ctl.appendChild(btn('Continue to prices  \u2192',function(){closeBox();window.x3File(file)}));
    showCtl();
   });
  },500);
 }).catch(function(e){
  if(my!==RID)return;
  if(TICK){clearInterval(TICK);TICK=null}
  items.forEach(function(d){if(d.className==='a')d.className='f'});
  var f=friendly(e.message);failBox(f[0],f[1]);
 });
}
function onKey(e){if(e.key==='Escape')closeBox()}
function closeBox(){
 RID++;
 if(TM){clearInterval(TM);TM=null}
 if(TICK){clearInterval(TICK);TICK=null}
 document.removeEventListener('keydown',onKey);
 if(OV&&OV.parentNode)OV.parentNode.removeChild(OV);
 OV=null;D={};
}
function openBox(){
 if(OV)return;
 if(typeof XLSX==='undefined'||typeof window.x3File!=='function'){msg('The migration assistant is not ready. Reload the page and try again.',1);return}
 if(!document.getElementById('mtiCss')){var s=document.createElement('style');s.id='mtiCss';s.textContent=CSS;document.head.appendChild(s)}
 D={};setPath();
 OV=el('div','mti-ov');
 var p=el('div','mti-p'),h=el('div','mti-h'),ti=el('div','mti-ti'),x=el('div','mti-x');
 ti.innerHTML='Import from MikroTik<small>Read only. Your router stays untouched.</small>';
 x.textContent='\u2715';x.onclick=closeBox;
 h.appendChild(ti);h.appendChild(x);
 dotsEl=el('div','mti-dots');chat=el('div','mti-c');ctl=el('div','mti-k');
 p.appendChild(h);p.appendChild(dotsEl);p.appendChild(chat);p.appendChild(ctl);
 OV.appendChild(p);document.body.appendChild(OV);
 document.addEventListener('keydown',onKey);
 render(0);
}
function inject(){
 var d=document.getElementById('x3drop');
 if(!d||document.getElementById('mtImpBtn'))return;
 var w=document.createElement('div');
 w.style.cssText='margin-top:16px;text-align:center';
 w.innerHTML='<div style="opacity:.7;font-size:12px;margin-bottom:8px">No billing file? Start from your router instead</div><button class="x3b" id="mtImpBtn" type="button">Import directly from MikroTik</button>';
 d.appendChild(w);
 document.getElementById('mtImpBtn').onclick=function(e){e.stopPropagation();openBox()};
}
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
inject();
})();