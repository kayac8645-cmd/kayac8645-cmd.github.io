// Shared UI primitives. Keep screens consistent: use these everywhere.
import { useMemo, useState, type ReactNode } from 'react';

export function Card({ title, actions, children, className = '', info }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; info?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-h">
          <h3>{title}{info && <Info text={info} />}</h3>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-b">{children}</div>
    </section>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'pos' | 'neg' | 'warn' }) {
  return (
    <div className="stat">
      <div className="stat-l">{label}</div>
      <div className={`stat-v ${tone ?? ''}`}>{value}</div>
      {sub !== undefined && <div className="stat-s">{sub}</div>}
    </div>
  );
}

export const Info = ({ text }: { text: string }) => <span className="info" title={text} aria-label={text}>ⓘ</span>;

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'pos' | 'neg' | 'warn' | 'accent' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => <button key={t.id} role="tab" aria-selected={t.id === value} className={t.id === value ? 'active' : ''} onClick={() => onChange(t.id)}>{t.label}</button>)}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <header><h3>{title}</h3><button className="ghost" onClick={onClose} aria-label="Kapat">✕</button></header>
        <div className="modal-b">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  );
}

export function Confirm({ text, onYes, onNo, danger }: { text: string; onYes: () => void; onNo: () => void; danger?: boolean }) {
  return (
    <Modal title="Onay" onClose={onNo} footer={<><button onClick={onNo}>Vazgeç</button><button className={danger ? 'danger' : 'primary'} onClick={onYes}>Onayla</button></>}>
      <p>{text}</p>
    </Modal>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}{hint && <Info text={hint} />}</span>{children}</label>;
}

/** Number input that commits on blur/enter. */
export function NumInput({ value, onCommit, min, max, step = 1 }: { value: number; onCommit: (v: number) => void; min?: number; max?: number; step?: number }) {
  const [txt, setTxt] = useState<string | null>(null);
  const commit = () => {
    if (txt === null) return;
    const v = Number(txt.replace(',', '.'));
    if (Number.isFinite(v)) onCommit(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v)));
    setTxt(null);
  };
  return <input type="number" value={txt ?? String(Math.round(value * 100) / 100)} min={min} max={max} step={step}
    onChange={(e) => setTxt(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />;
}

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** value used for sorting; omit to make column unsortable */
  sort?: (row: T) => number | string;
  align?: 'right' | 'left';
  hideOnMobile?: boolean;
}

/** Table with search, sort and optional filter chips. */
export function DataTable<T>({ rows, columns, rowKey, search, filters, onRowClick, empty = 'Kayıt yok', initialSort, pageSize = 50 }: {
  rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string;
  search?: (r: T) => string;
  filters?: { label: string; test: (r: T) => boolean }[];
  onRowClick?: (r: T) => void; empty?: string; initialSort?: { key: string; dir: 1 | -1 }; pageSize?: number;
}) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(initialSort ?? null);
  const [filter, setFilter] = useState(-1);
  const [limit, setLimit] = useState(pageSize);
  const view = useMemo(() => {
    let r = rows;
    if (q && search) { const lq = q.toLocaleLowerCase('tr'); r = r.filter((x) => search(x).toLocaleLowerCase('tr').includes(lq)); }
    if (filter >= 0 && filters) r = r.filter(filters[filter].test);
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sort) { const f = col.sort; r = [...r].sort((a, b) => { const va = f(a), vb = f(b); return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir; }); }
    }
    return r;
  }, [rows, q, sort, filter, columns, search, filters]);
  return (
    <div className="dt">
      {(search || filters) && (
        <div className="dt-bar">
          {search && <input className="dt-search" placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} />}
          {filters && <div className="chips">
            <button className={filter < 0 ? 'chip active' : 'chip'} onClick={() => setFilter(-1)}>Tümü</button>
            {filters.map((f, i) => <button key={f.label} className={filter === i ? 'chip active' : 'chip'} onClick={() => setFilter(i)}>{f.label}</button>)}
          </div>}
        </div>
      )}
      <div className="dt-wrap">
        <table>
          <thead><tr>{columns.map((c) => (
            <th key={c.key} className={`${c.align === 'right' ? 'r' : ''} ${c.hideOnMobile ? 'hm' : ''} ${c.sort ? 'sortable' : ''}`}
              onClick={() => c.sort && setSort(sort?.key === c.key ? { key: c.key, dir: (sort.dir * -1) as 1 | -1 } : { key: c.key, dir: -1 })}>
              {c.label}{sort?.key === c.key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
            </th>))}</tr></thead>
          <tbody>
            {view.length === 0 && <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>}
            {view.slice(0, limit).map((r) => (
              <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? 'click' : ''}>
                {columns.map((c) => <td key={c.key} className={`${c.align === 'right' ? 'r' : ''} ${c.hideOnMobile ? 'hm' : ''}`}>{c.render(r)}</td>)}
              </tr>))}
          </tbody>
        </table>
      </div>
      {view.length > limit && <button className="ghost more" onClick={() => setLimit(limit + pageSize)}>Daha fazla göster ({view.length - limit})</button>}
    </div>
  );
}

export function Bar({ value, max = 1, tone }: { value: number; max?: number; tone?: 'pos' | 'neg' | 'warn' }) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className="bar"><div className={`bar-f ${tone ?? ''}`} style={{ width: `${w}%` }} /></div>;
}

export const Empty = ({ children }: { children: ReactNode }) => <div className="empty-state">{children}</div>;

/** Company selector limited to player's companies (optionally filtered). */
export function Select<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string; disabled?: boolean }[]; onChange: (v: T) => void }) {
  return <select value={String(value)} onChange={(e) => { const o = options.find((x) => String(x.value) === e.target.value); if (o) onChange(o.value); }}>
    {options.map((o) => <option key={String(o.value)} value={String(o.value)} disabled={o.disabled}>{o.label}</option>)}
  </select>;
}
