import { useState } from 'react';
import { Modal, Field, NumInput, Select } from './ui';
import { useGame, useStore } from '../../store/gameStore';
import * as actions from '../../engine/actions';
import { SECTORS, SECTOR_IDS } from '../../engine/data/defs';
import { playerCompanies } from '../../engine/selectors';
import { money } from '../format';
import type { SectorId } from '../../engine/types';

/** Dialog to found a new subsidiary. Shared by Companies and Sectors screens. */
export default function FoundCompanyModal({ onClose, defaultSector }: { onClose: () => void; defaultSector?: SectorId }) {
  const g = useGame();
  const run = useStore((s) => s.run);
  const selectCompany = useStore((s) => s.selectCompany);
  const setScreen = useStore((s) => s.setScreen);
  const mine = playerCompanies(g);
  const [sector, setSector] = useState<SectorId>(defaultSector ?? 'hardware');
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState(mine[0]?.countryId ?? 'US');
  const [capital, setCapital] = useState(2_000_000);
  const def = SECTORS[sector];
  const holdingCash = g.holdings[g.playerHoldingId].cash;
  const total = def.foundingCost + capital;
  const country = g.countries[countryId];
  const countries = Object.values(g.countries).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const submit = () => {
    const finalName = name.trim() || `${def.name.split(' ')[0]} A.Ş.`;
    const r = run((s) => actions.foundCompany(s, { name: finalName, sector, countryId, initialCapital: capital, icon: def.icon }), `${finalName} kuruldu`);
    if (r.ok) {
      if (r.id) { selectCompany(r.id); setScreen('companies'); }
      onClose();
    }
  };

  return (
    <Modal title="Yeni Şirket Kur" onClose={onClose} footer={<>
      <button onClick={onClose}>Vazgeç</button>
      <button className="primary" disabled={total > holdingCash || capital < 0} onClick={submit}>Şirketi Kur</button>
    </>}>
      <Field label="Şirket adı"><input value={name} placeholder="Örn. Atlas Çip A.Ş." onChange={(e) => setName(e.target.value)} maxLength={40} /></Field>
      <Field label="Sektör" hint={def.description}>
        <Select value={sector} onChange={setSector} options={SECTOR_IDS.map((id) => ({ value: id, label: `${SECTORS[id].icon} ${SECTORS[id].name}` }))} />
      </Field>
      <p className="muted small">{def.description}</p>
      <Field label="Ülke">
        <Select value={countryId} onChange={setCountryId} options={countries.map((c) => ({ value: c.id, label: c.name }))} />
      </Field>
      {country && <p className="muted small">Maaş {money(country.avgSalary, 0)}/ay · Vergi %{((country.corporateTax + country.taxModifier) * 100).toFixed(0)} · Elektrik ${country.electricityCost}/MWh · Teknoloji {country.techLevel} · Risk {country.politicalRisk}</p>}
      <Field label="Başlangıç sermayesi (USD)" hint="Holding kasasından şirkete aktarılır.">
        <NumInput value={capital} min={0} step={100000} onCommit={setCapital} />
      </Field>
      <div className="kv">
        <span>Kuruluş maliyeti</span><span>{money(def.foundingCost)}</span>
        <span>Sermaye</span><span>{money(capital)}</span>
        <span>Toplam</span><span className={total > holdingCash ? 'neg' : ''}>{money(total)}</span>
        <span>Holding nakdi</span><span>{money(holdingCash)}</span>
      </div>
      {total > holdingCash && <p className="neg small">Holding nakdi yetersiz.</p>}
    </Modal>
  );
}
