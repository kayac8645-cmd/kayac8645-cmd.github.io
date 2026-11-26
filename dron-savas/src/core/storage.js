// IndexedDB kayıt deposu: sıkıştırılmış (gzip) JSON. Yuvalar: 'auto', 'slot1..3'. Ayarlar localStorage'da.
const DB = 'dronsavasi', STORE = 'saves';
function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => { const t = db.transaction(STORE, mode); const st = t.objectStore(STORE); const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); });
}
async function gzip(str) {
  if (typeof CompressionStream === 'undefined') return new Blob([str]);
  const s = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
  return await new Response(s).blob();
}
async function gunzip(blob, compressed) {
  if (!compressed || typeof DecompressionStream === 'undefined') return await blob.text();
  return await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text();
}
export async function saveGame(slot, data, meta) {
  const json = JSON.stringify(data); const blob = await gzip(json);
  await tx('readwrite', (st) => st.put({ meta: { ...meta, size: blob.size, time: Date.now() }, blob, gz: typeof CompressionStream !== 'undefined' }, slot));
  return blob.size;
}
export async function loadGame(slot) {
  const rec = await tx('readonly', (st) => st.get(slot));
  if (!rec) return null;
  return JSON.parse(await gunzip(rec.blob, rec.gz));
}
export async function listSaves() {
  const out = {};
  for (const s of ['auto', 'slot1', 'slot2', 'slot3']) {
    try { const rec = await tx('readonly', (st) => st.get(s)); if (rec) out[s] = rec.meta; } catch (e) { /* yok */ }
  }
  return out;
}
export function loadSettings() {
  try { return Object.assign({ quality: 1, sound: true, volume: 0.6, vibrate: true, renderer: 'auto' }, JSON.parse(localStorage.getItem('ds_settings') || '{}')); }
  catch (e) { return { quality: 1, sound: true, volume: 0.6, vibrate: true, renderer: 'auto' }; }
}
export function saveSettings(s) { try { localStorage.setItem('ds_settings', JSON.stringify(s)); } catch (e) { /* özel mod */ } }
