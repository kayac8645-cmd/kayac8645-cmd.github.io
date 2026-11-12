import type { SerializedState } from '../core/state';
import type { PlanetParams } from '../core/types';

export type SaveKind = 'manual' | 'auto' | 'checkpoint';
export interface SaveMeta {
  id: string;
  name: string;
  kind: SaveKind;
  createdAt: number;
  day: number;
  planetName: string;
  seed: string;
  summary: { temp: number; humans: number; species: number };
}
export interface SeedRecord {
  id: string;
  name: string;
  params: PlanetParams;
  createdAt: number;
}

const DB_NAME = 'world-simulator';
const DB_VERSION = 1;
let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('saves')) db.createObjectStore('saves', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('saveData')) db.createObjectStore('saveData', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('seeds')) db.createObjectStore('seeds', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx<T>(stores: string[], mode: IDBTransactionMode, fn: (t: IDBTransaction) => IDBRequest<T> | void): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const t = db.transaction(stores, mode);
        let result: T | undefined;
        const r = fn(t);
        if (r) r.onsuccess = () => (result = r.result);
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error ?? new Error('transaction aborted'));
      }),
  );
}

export async function putSave(meta: SaveMeta, data: SerializedState): Promise<void> {
  await tx(['saves', 'saveData'], 'readwrite', (t) => {
    t.objectStore('saves').put(meta);
    t.objectStore('saveData').put({ id: meta.id, data });
  });
}

export async function listSaves(): Promise<SaveMeta[]> {
  const r = await tx<SaveMeta[]>(['saves'], 'readonly', (t) => t.objectStore('saves').getAll());
  return (r ?? []).sort((a, b) => b.createdAt - a.createdAt);
}

export async function loadSave(id: string): Promise<SerializedState | null> {
  const r = await tx<{ id: string; data: SerializedState }>(['saveData'], 'readonly', (t) => t.objectStore('saveData').get(id));
  return r?.data ?? null;
}

export async function deleteSave(id: string): Promise<void> {
  await tx(['saves', 'saveData'], 'readwrite', (t) => {
    t.objectStore('saves').delete(id);
    t.objectStore('saveData').delete(id);
  });
}

export async function pruneCheckpoints(keep: number, planetSeed: string) {
  const all = await listSaves();
  const cps = all.filter((s) => s.kind === 'checkpoint' && s.seed === planetSeed).sort((a, b) => b.day - a.day);
  for (const old of cps.slice(keep)) await deleteSave(old.id);
}

export async function listSeeds(): Promise<SeedRecord[]> {
  const r = await tx<SeedRecord[]>(['seeds'], 'readonly', (t) => t.objectStore('seeds').getAll());
  return (r ?? []).sort((a, b) => b.createdAt - a.createdAt);
}

export async function putSeed(rec: SeedRecord) {
  await tx(['seeds'], 'readwrite', (t) => {
    t.objectStore('seeds').put(rec);
  });
}

export async function deleteSeed(id: string) {
  await tx(['seeds'], 'readwrite', (t) => {
    t.objectStore('seeds').delete(id);
  });
}
