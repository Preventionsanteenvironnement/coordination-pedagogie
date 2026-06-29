/* Moteur partagé des guides AESH : navigation multipage + tiroir de sources.
   Chaque guide définit window.GUIDE_SOURCES = { id:{ref,txt,url} } avant de charger ce script. */
(function(){
  const pages=[...document.querySelectorAll('[data-page]')];
  const nav=document.getElementById('nav');
  nav.innerHTML=pages.map((p,i)=>'<button class="pill '+(i===0?'on':'')+'" data-i="'+i+'"><span class="pn">'+(i+1)+'</span>'+p.dataset.title+'</button>').join('');
  const pills=[...nav.children]; let cur=0;
  function show(i){ if(i<0||i>=pages.length) return;
    pages[cur].classList.remove('on'); pills[cur].classList.remove('on'); cur=i;
    pages[cur].classList.add('on'); pills[cur].classList.add('on');
    document.getElementById('tb-n').textContent=(i+1)+' / '+pages.length;
    pills[cur].scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}); window.scrollTo({top:0,behavior:'smooth'});
    const prev=document.getElementById('prev'), next=document.getElementById('next');
    prev.disabled=i===0; next.disabled=i===pages.length-1;
    document.getElementById('prev-t').textContent=i>0?pages[i-1].dataset.title:'';
    document.getElementById('next-t').textContent=i<pages.length-1?pages[i+1].dataset.title:'Terminé';
  }
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-i]'); if(b) show(+b.dataset.i);});
  document.getElementById('prev').addEventListener('click',()=>show(cur-1));
  document.getElementById('next').addEventListener('click',()=>show(cur+1));
  const SOURCES=window.GUIDE_SOURCES||{};
  const bg=document.getElementById('sheet-bg'), sheet=document.getElementById('sheet');
  function openSheet(id){const s=SOURCES[id]; if(!s)return;
    document.getElementById('sheet-ref').textContent=s.ref; document.getElementById('sheet-txt').textContent=s.txt;
    const a=document.getElementById('sheet-link'); if(s.url){a.href=s.url;a.hidden=false;}else{a.hidden=true;}
    bg.classList.add('on'); sheet.classList.add('on');}
  function closeSheet(){bg.classList.remove('on'); sheet.classList.remove('on');}
  document.addEventListener('click',e=>{const c=e.target.closest('[data-src]'); if(c) openSheet(c.dataset.src);});
  bg.addEventListener('click',closeSheet); document.getElementById('sheet-x').addEventListener('click',closeSheet);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeSheet(); if(e.key==='ArrowRight') show(cur+1); if(e.key==='ArrowLeft') show(cur-1); });
  show(0);
})();
