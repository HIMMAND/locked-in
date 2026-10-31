import { readdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((f) =>
    f.isDirectory() ? walk(`${dir}/${f.name}`) : [`${dir}/${f.name}`],
  );
}
const files = walk("dist").filter((f) => !f.endsWith("/sw.js"));
const revision = createHash("sha256")
  .update(files.map((f) => readFileSync(f)).join(""))
  .digest("hex")
  .slice(0, 12);
const assets = ["/", ...files.map((f) => "/" + f.slice(5))];
writeFileSync(
  "dist/sw.js",
  `const CACHE='locked-in-${revision}';const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('locked-in-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreVary:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('/index.html'):Response.error()))));});`,
);
console.log(`Offline shell: ${assets.length} assets, cache ${revision}`);
