const APP='safar-app-v1', TILES='safar-tiles-v1';
const ASSETS=['./','./index.html','./manifest.json','./leaflet/leaflet.js','./leaflet/leaflet.css','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const BLANK=()=>new Response(Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/png'}});
self.addEventListener('fetch',e=>{
  const req=e.request, u=new URL(req.url);
  if(req.method!=='GET')return;
  if(u.hostname.endsWith('tile.openstreetmap.org')){
    e.respondWith((async()=>{
      const c=await caches.open(TILES), hit=await c.match(req.url);
      if(hit)return hit;
      try{const r=await fetch(req);if(r.ok||r.type==='opaque')c.put(req.url,r.clone());return r}
      catch(_){return BLANK()}
    })());
    return;
  }
  if(u.origin===location.origin){
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(h=>h||fetch(req).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Response.error())));
  }
});
