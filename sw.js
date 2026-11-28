/* Studio (Filippo): service worker.
   Pagina: prima la rete (così gli aggiornamenti arrivano subito), ma se è lenta (3 s) o manca la connessione parte la copia salvata.
   Icone, font e manifest: prima la copia salvata. Cambiando V si rifà tutta la cache. */
const V='sf-v81';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','maskable-512.png','apple-touch-icon.png','fonts/plusjakartasans-latin.woff2','fonts/figtree-400-7bfd10.woff2','fonts/figtree-500-94e34f.woff2','fonts/figtree-600-4376f5.woff2','fonts/figtree-700-70aaa6.woff2','fonts/figtree-800-6d348a.woff2','fonts/stixtwotext-400-b032cc.woff2','fonts/stixtwotext-400-d31977.woff2','fonts/stixtwotext-400-69b24b.woff2','fonts/stixtwotext-400i-cdfeaa.woff2','fonts/stixtwotext-400i-581897.woff2','fonts/stixtwotext-400i-7c2b7a.woff2'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){
    const net=fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(V).then(c=>c.put('index.html',k))}return x});
    const slow=new Promise(res=>setTimeout(()=>res(caches.match('index.html')),3000));
    e.respondWith(Promise.race([net.catch(()=>caches.match('index.html')),slow]).then(x=>x||net));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(V).then(c=>c.put(r,k))}return x})));
});
