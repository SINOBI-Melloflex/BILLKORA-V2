(function(){
var OV=null;
function msg(t,bad){if(typeof toast==='function')toast(t,bad?1:0);else alert(t)}
function closeBox(){if(OV&&OV.parentNode)OV.parentNode.removeChild(OV);OV=null}
function field(id,label,type,ph){return '<label style="display:block;margin:10px 0 4px;font-size:12px;opacity:.8">'+label+'</label><input id="'+id+'" type="'+type+'" placeholder="'+(ph||'')+'" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #3a4878;background:#161e42;color:#f1f5f9;font-size:14px">'}
function openBox(){
  closeBox();
  OV=document.createElement('div');
  OV.style.cssText='position:fixed;inset:0;background:rgba(3,6,20,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px';
  OV.innerHTML='<div style="width:100%;max-width:460px;max-height:92vh;overflow:auto;background:#0e1534;color:#f1f5f9;border:1px solid #3a4878;border-radius:16px;padding:22px;font-family:Segoe UI,Arial,sans-serif">'
   +'<div style="font-size:19px;font-weight:700">Import directly from MikroTik</div>'
   +'<p style="font-size:13px;opacity:.8;line-height:1.5">BillKora only <b>reads</b> your PPPoE users and profiles. It does not change anything on the router and does not disconnect anyone. Leave the router fields empty to use the router you already saved.</p>'
   +field('mtiIp','Router IP / host (optional)','text','e.g. 192.168.88.1')
   +field('mtiPort','API port','number','8728')
   +field('mtiUser','Router username','text','')
   +field('mtiPass','Router password','password','')
   +field('mtiAdmin','Your BillKora admin password (required)','password','')
   +'<div id="mtiMsg" style="min-height:20px;margin-top:12px;font-size:13px;color:#f87171"></div>'
   +'<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px"><button id="mtiCancel" type="button" style="padding:10px 16px;border-radius:10px;border:1px solid #3a4878;background:transparent;color:#f1f5f9;cursor:pointer">Cancel</button><button id="mtiGo" type="button" style="padding:10px 18px;border:0;border-radius:10px;cursor:pointer;font-weight:600;color:#fff;background:linear-gradient(90deg,#1e6bff,#8b5cf6)">Read from MikroTik</button></div></div>';
  document.body.appendChild(OV);
  document.getElementById('mtiCancel').onclick=closeBox;
  document.getElementById('mtiGo').onclick=go;
}
function val(id){var e=document.getElementById(id);return e?e.value:''}
function go(){
  var st=document.getElementById('mtiMsg'),btn=document.getElementById('mtiGo');
  if(!val('mtiAdmin')){st.textContent='Please enter your BillKora admin password.';return}
  if(typeof XLSX==='undefined'||typeof window.x3File!=='function'){st.textContent='The migration assistant is not ready. Reload the page and try again.';return}
  st.style.color='#94a3b8';st.textContent='Reading from the router (read only)...';btn.disabled=true;
  fetch('/api/mtimport/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminPass:val('mtiAdmin'),ip:val('mtiIp'),port:val('mtiPort'),user:val('mtiUser'),pass:val('mtiPass')})})
  .then(function(r){return r.json()}).then(function(j){
    if(!j.ok)throw new Error(j.error||'Could not read the router');
    var rows=[['Customer Name','Phone','PPPoE Username','PPPoE Password','Package','Monthly Bill','Previous Due','Sub Zone','Zone','Address','IP Address','MAC Address']],n=0;
    j.secrets.forEach(function(s){
      if(/^BillKora test/i.test(s.comment))return;
      var nm=(s.comment&&s.comment.length<=60)?s.comment:s.name;
      rows.push([String(nm),'',String(s.name),String(s.password),String(s.profile||'default'),'','','','','','','']);n++;
    });
    if(!n)throw new Error('No PPPoE users were found on the router.');
    var ws=XLSX.utils.aoa_to_sheet(rows),wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'MikroTik');
    var arr=XLSX.write(wb,{bookType:'xlsx',type:'array'});
    var f=new File([arr],'mikrotik-import.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    closeBox();
    msg('Read '+n+' PPPoE users and '+j.profiles.length+' profiles from the router'+(j.skipped?' ('+j.skipped+' non-PPPoE skipped)':'')+'.');
    window.x3File(f);
  }).catch(function(e){st.style.color='#f87171';st.textContent=e.message;btn.disabled=false});
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