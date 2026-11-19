/* BillKora upd.js: Check for update button. Loads last. */
(function(){
function $$(i){return document.getElementById(i)}
function link(){var s=document.querySelector('.side');if(!s||$$('updlnk'))return;
 var a=document.createElement('a');a.id='updlnk';a.href='#';a.innerHTML='<i data-i="ref"></i>Check for update';
 a.onclick=function(e){e.preventDefault();updOpen()};
 var lo=s.querySelector('a[onclick*="logout"]');if(lo)s.insertBefore(a,lo);else s.appendChild(a);
 if(typeof icons==='function')icons()}
window.updOpen=function(){
 box('Check for update','<p class="muted" id="updm" style="line-height:1.7">Checking GitHub...</p><div id="updb"></div>');
 api('admin/updinfo').then(function(r){
  var m=$$('updm'),b=$$('updb');if(!m||!b)return;
  if(!r.ok){m.innerHTML='<b>Current version: '+esc(r.current)+'</b><br>'+esc(r.msg||'Could not check for updates.');b.innerHTML='<div class="mf"><button class="btn o2" onclick="closeBox()">Close</button><button class="btn" onclick="updOpen()">Try again</button></div>';return}
  if(!r.newer){m.innerHTML='You are up to date. <b>Version '+esc(r.current)+'</b> is the latest.';b.innerHTML='<div class="mf"><button class="btn" onclick="closeBox()">OK</button></div>';return}
  m.innerHTML='A new version is available: <b>'+esc(r.latest)+'</b> (you have '+esc(r.current)+'). Your customers, bills and router settings are not touched. The app restarts for about 20 seconds and you sign in again.';
  b.innerHTML='<div class="mf"><button class="btn o2" onclick="closeBox()">Later</button><button class="btn" onclick="updGo()">Update now</button></div>'
 }).catch(function(e){if(e.message!=='auth')toast(e.message,1)})};
window.updGo=function(){
 var m=$$('updm'),b=$$('updb');if(b)b.innerHTML='';if(m)m.innerHTML='Downloading and installing the update. Please keep this window open...';
 api('admin/updapply','POST',{}).then(function(r){
  if(r.upToDate){if(m)m.textContent='Already up to date.';return}
  if(m)m.innerHTML='Installed. Restarting the app, please wait...';
  var t=0,down=false;
  setTimeout(function poll(){t++;
   fetch('/login.html',{cache:'no-store'}).then(function(x){if(x.ok&&(down||t>25))location.href='login.html';else if(t>120){if(m)m.textContent='The app is taking long to restart. Open BillKora again from the desktop shortcut.'}else setTimeout(poll,1500)}).catch(function(){down=true;if(t>120){if(m)m.textContent='The app did not come back. Open BillKora again from the desktop shortcut.'}else setTimeout(poll,1500)})
  },6000)
 }).catch(function(e){if(e.message==='auth')return;if(m)m.innerHTML='<b>Update failed:</b> '+esc(e.message);if(b)b.innerHTML='<div class="mf"><button class="btn" onclick="closeBox()">Close</button></div>'})};
link();
})();