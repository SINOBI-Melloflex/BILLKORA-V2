(function(){
  var MIN=0.6;
  var st=document.createElement('style');
  st.id='bk-fit-css';
  (document.head||document.documentElement).appendChild(st);
  function fit(){
    var w=window.innerWidth,h=window.innerHeight;
    var z=Math.min(w/2400,h/1100);
    z=Math.max(MIN,Math.min(1,Math.round(z*100)/100));
    document.documentElement.style.zoom=(z===1?'':z);
    var H=Math.ceil(h/z);
    st.textContent='.side{height:'+H+'px!important;max-height:'+H+'px!important}.app{min-height:'+H+'px!important}';
  }
  fit();
  window.addEventListener('resize',fit);
})();