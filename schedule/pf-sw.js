// Pie·Fection — Service Worker (push + contador no ícone)
// Publicar na MESMA pasta do index.html do schedule (schedule/pf-sw.js).
const DB_NAME = 'pf-sw', STORE = 'kv';

function idb(){
  return new Promise((res, rej)=>{
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = ()=>r.result.createObjectStore(STORE);
    r.onsuccess = ()=>res(r.result);
    r.onerror = ()=>rej(r.error);
  });
}
async function kvGet(k){
  try{ const d = await idb(); return await new Promise(res=>{ const q = d.transaction(STORE).objectStore(STORE).get(k); q.onsuccess = ()=>res(q.result); q.onerror = ()=>res(undefined); }); }
  catch(e){ return undefined; }
}
async function kvSet(k, v){
  try{ const d = await idb(); await new Promise(res=>{ const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(v, k); t.oncomplete = ()=>res(); t.onerror = ()=>res(); }); }
  catch(e){}
}
async function setBadge(n){
  try{
    if(n > 0 && self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(n);
    else if(self.navigator && self.navigator.clearAppBadge) await self.navigator.clearAppBadge();
  }catch(e){}
}

self.addEventListener('install', ()=>self.skipWaiting());
self.addEventListener('activate', e=>e.waitUntil(self.clients.claim()));

self.addEventListener('push', event=>{
  let data = {};
  try{ data = event.data ? event.data.json() : {}; }catch(e){ data = {body: event.data ? event.data.text() : ''}; }
  const title = data.title || '🍕 Pie·Fection';
  event.waitUntil((async()=>{
    // contador: cada push soma 1 (o app recalcula o número exato quando abre)
    const n = ((await kvGet('badge')) || 0) + 1;
    await kvSet('badge', n);
    await setBadge(n);
    await self.registration.showNotification(title, {
      body: data.body || 'Você tem uma nova notificação.',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: {url: data.url || './'}
    });
  })());
});

self.addEventListener('notificationclick', event=>{
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  event.waitUntil((async()=>{
    const list = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for(const c of list){
      if(c.url.startsWith(self.registration.scope) && 'focus' in c){
        try{ c.postMessage({type:'open', url:target}); }catch(e){}
        return c.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});

// o app informa o número exato de não lidos
self.addEventListener('message', event=>{
  const d = event.data || {};
  if(d.type === 'badge'){
    event.waitUntil((async()=>{ await kvSet('badge', d.n || 0); await setBadge(d.n || 0); })());
  }
});
