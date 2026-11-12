import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import * as db from '../src/persistence/db';
import type { SerializedState } from '../src/core/state';

describe('IndexedDB persistence', () => {
  it('stores, lists, loads, prunes and deletes saves', async () => {
    const data = { version: 1, meta: { params: { name: 'X', seed: '1' }, day: 10 }, hrElev: new Float32Array([1, 2, 3]), fields: { temp: new Float32Array([4]) }, region: new Int16Array([1]), bio: [new Float32Array([5])] } as unknown as SerializedState;
    for (let k = 0; k < 5; k++) {
      await db.putSave({ id: `cp-${k}`, name: 'cp', kind: 'checkpoint', createdAt: k, day: k * 100, planetName: 'X', seed: '1', summary: { temp: 0, humans: 0, species: 0 } }, data);
    }
    await db.putSave({ id: 'm', name: 'manual', kind: 'manual', createdAt: 9, day: 1, planetName: 'X', seed: '1', summary: { temp: 0, humans: 0, species: 0 } }, data);
    expect((await db.listSaves()).length).toBe(6);
    await db.pruneCheckpoints(2, '1');
    const left = await db.listSaves();
    expect(left.filter((s) => s.kind === 'checkpoint').map((s) => s.day).sort((a, b) => a - b)).toEqual([300, 400]);
    const loaded = await db.loadSave('m');
    expect(Array.from(loaded!.hrElev)).toEqual([1, 2, 3]);
    await db.deleteSave('m');
    expect(await db.loadSave('m')).toBeNull();
  });
  it('stores seeds', async () => {
    await db.putSeed({ id: 's', name: 'n', params: { seed: '42' } as never, createdAt: 1 });
    expect((await db.listSeeds())[0].params.seed).toBe('42');
  });
});
