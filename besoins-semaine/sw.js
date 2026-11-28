/* Hors connexion : uniquement les fichiers de cette page, jamais les autres modules ni Firebase. */
'use strict';
const CACHE='cp-besoins-shell-v1',FILES=['./','index.html','app.js','contrat.js','style.css','demo.json'];
const url=f=>new URL(f,self.registration.scope).href;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(url)))));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('cp-besoins-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);u.search='';u.hash='';if(!FILES.map(url).includes(u.href))return;
 e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);await c.put(u.href,r.clone());}return r;}).catch(()=>caches.match(u.href)));
});
