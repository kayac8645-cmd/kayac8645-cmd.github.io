// Company selector bound to store.selectedCompanyId (player's companies only).
import { useEffect } from 'react';
import type { Company, SectorKind } from '../../engine/types';
import { SECTORS } from '../../engine/data/defs';
import { playerCompanies } from '../../engine/selectors';
import { useGame, useStore } from '../../store/gameStore';
import { Select } from './ui';

function suitable(companies: Company[], kinds?: SectorKind[]): Company[] {
  return kinds ? companies.filter((c) => kinds.includes(SECTORS[c.sector].kind)) : companies;
}

/** Returns the currently focused player company (auto-selecting the first suitable one). */
export function useSelectedCompany(kinds?: SectorKind[]): Company | null {
  const g = useGame();
  const sel = useStore((s) => s.selectedCompanyId);
  const list = suitable(playerCompanies(g), kinds);
  const cur = list.find((c) => c.id === sel) ?? null;
  const first = list[0]?.id ?? null;
  useEffect(() => {
    if (!cur && first) useStore.getState().selectCompany(first);
  }, [cur, first]);
  return cur ?? list[0] ?? null;
}

export default function CompanyPicker({ kinds, label = 'Şirket' }: { kinds?: SectorKind[]; label?: string }) {
  const g = useGame();
  const company = useSelectedCompany(kinds);
  const list = suitable(playerCompanies(g), kinds);
  if (list.length === 0) return <span className="muted">Uygun şirket yok</span>;
  return (
    <label className="picker row">
      <span className="muted">{label}</span>
      <Select
        value={company?.id ?? ''}
        options={list.map((c) => ({ value: c.id, label: `${SECTORS[c.sector].icon} ${c.name}` }))}
        onChange={(v) => useStore.getState().selectCompany(v)}
      />
    </label>
  );
}
