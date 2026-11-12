// Human resources (headcount, payroll, morale, managers) and research.
// Deterministic: all randomness comes from s.rng via ../rng.
import type { CategoryId, Company, Department, GameState, Manager } from '../types';
import { DEPARTMENTS } from '../types';
import { CATEGORIES, FACILITIES, MANAGER_ROLE_INFO, TECHS } from '../data/defs';
import { addNews, adminRequired, clamp, countryCosts, mgr, refreshCandidates, requiredProductionWorkers, SALARY_MULT } from '../util';
import { frontierPerf, researchRate } from '../preview';
import { chance, gauss } from '../rng';

const HIRE_RATE = 0.08; // fraction of the gap closed per day (min 1 person)
const LAYOFF_RATE = 0.1;
const HIRE_COST_MONTHS = 0.5;
const SEVERANCE_MONTHS = 1;

const isPlayer = (s: GameState, c: Company) => c.holdingId === s.playerHoldingId;
const fmtPct = (x: number) => `%${(x * 100).toFixed(0)}`;

/** CHRO lowers payroll cost by up to 5% (skill 100). */
function chroSalaryFactor(c: Company): number {
  return 1 - clamp(mgr(c, 'CHRO'), 0, 100) * 0.0005;
}

/** Monthly USD wage of one employee of a department (before CHRO discount). */
export function deptWageMonthly(s: GameState, c: Company, dept: Department): number {
  const hq = countryCosts(s, s.countries[c.countryId]).wageMonthly;
  if (dept === 'production' && c.facilities.length > 0) {
    let w = 0, total = 0;
    for (const f of c.facilities) {
      const n = FACILITIES[f.type].workers * f.level;
      const country = s.countries[f.countryId];
      if (!country || n <= 0) continue;
      w += countryCosts(s, country).wageMonthly * n;
      total += n;
    }
    if (total > 0) return (w / total) * SALARY_MULT.production;
  }
  return hq * (SALARY_MULT[dept] ?? 1);
}

/** Market (fair) monthly salary of a manager for role & skill — same formula as makeManager. */
export function managerMarketSalary(s: GameState, m: Pick<Manager, 'role' | 'skill'>): number {
  const base = m.role === 'CEO' ? 22000 : 13000;
  return base * (0.4 + (m.skill / 100) ** 2 * 2.2) * s.macro.wageIndex;
}

// ─── Daily HR ─────────────────────────────────────────────────────────────
export function runHrDay(s: GameState): void {
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) continue;
    c.employeeTargets.production = requiredProductionWorkers(c);
    const salaryFactor = chroSalaryFactor(c);
    let laidOff = 0;
    const staffBefore = c.employees.production + c.employees.rnd + c.employees.sales + c.employees.admin;

    // Headcount adjustment (gradual)
    for (const d of DEPARTMENTS) {
      const target = Math.max(0, Math.round(c.employeeTargets[d] ?? 0));
      const cur = c.employees[d];
      const gap = target - cur;
      if (gap === 0) continue;
      const wage = deptWageMonthly(s, c, d) * salaryFactor;
      if (gap > 0) {
        if (c.cash < 0) continue; // no hiring while cash is negative
        const n = Math.min(gap, Math.max(1, Math.ceil(gap * HIRE_RATE)));
        const cost = n * wage * HIRE_COST_MONTHS;
        c.employees[d] = cur + n;
        c.cash -= cost;
        c.ledger.other += cost;
      } else {
        const n = Math.min(-gap, Math.max(1, Math.ceil(-gap * LAYOFF_RATE)));
        const cost = n * wage * SEVERANCE_MONTHS;
        c.employees[d] = cur - n;
        c.cash -= cost;
        c.ledger.other += cost;
        laidOff += n;
      }
    }

    // Daily payroll
    let payroll = 0;
    for (const d of DEPARTMENTS) payroll += (c.employees[d] * deptWageMonthly(s, c, d) * salaryFactor) / 30;
    c.cash -= payroll;
    c.ledger.salaries += payroll;
    let mgrPay = 0;
    for (const m of Object.values(c.managers)) if (m) mgrPay += m.salary / 30;
    c.cash -= mgrPay;
    c.ledger.managerSalaries += mgrPay;

    // Morale
    const need = adminRequired(c);
    const overwork = need > 0 && c.employees.admin < need ? (1 - c.employees.admin / need) * 30 : 0;
    const target = clamp(70 + mgr(c, 'CHRO') * 0.2 - overwork, 0, 100);
    let morale = c.morale + (target - c.morale) * 0.03;
    if (laidOff > 0) morale -= Math.min(15, (laidOff / Math.max(1, staffBefore)) * 60 + 0.3);
    c.morale = clamp(morale, 0, 100);
  }
}

// ─── Research ─────────────────────────────────────────────────────────────
/** Grants a tech to a company: techs, patents, global tech list (frontier), news. */
export function completeTech(s: GameState, c: Company, techId: string): void {
  const t = TECHS[techId];
  if (!t || c.techs.includes(techId)) return;
  c.techs.push(techId);
  c.patents += 1;
  const player = isPlayer(s, c);
  const firstInWorld = !s.globalTechs.includes(techId);
  if (firstInWorld) {
    s.globalTechs.push(techId);
    let frontierNote = '';
    if (t.frontier) {
      const cats: CategoryId[] = t.frontier.categories;
      for (const cat of cats) if (s.categories[cat]) s.categories[cat].frontierPerf = frontierPerf(s, cat);
      const names = cats.map((k) => CATEGORIES[k]?.name ?? k).join(', ');
      frontierNote = ` ${names} kategorilerinde performans sınırı ${fmtPct(t.frontier.mult - 1)} yükseldi; eski ürünler göreli olarak geriler.`;
    }
    addNews(s, 'patent', `${c.name}, "${t.name}" teknolojisinin patentini aldı`,
      `${c.name} dünyada ilk kez ${t.name} teknolojisini geliştirdi (${t.description}).${frontierNote}`,
      { important: player, companyId: c.id, countryId: c.countryId });
  } else if (player) {
    addNews(s, 'tech', `Ar-Ge tamamlandı: ${t.name}`,
      `${c.name}, ${t.name} teknolojisini geliştirdi (${t.description}).`,
      { important: true, companyId: c.id, countryId: c.countryId });
  }
}

export function runResearchDay(s: GameState): void {
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt || !c.research) continue;
    const r = c.research;
    const t = TECHS[r.techId];
    if (!t || c.techs.includes(r.techId)) { c.research = null; continue; }
    const spend = c.cash < 0 ? 0 : Math.min(Math.max(0, r.budget), c.cash);
    if (spend > 0) {
      c.cash -= spend;
      c.ledger.rnd += spend;
    }
    const pts = researchRate(s, c, spend);
    r.progress += pts;
    c.researchPoints += pts;
    if (r.progress >= t.cost) {
      c.research = null;
      completeTech(s, c, t.id);
    }
  }
}

// ─── Monthly HR ───────────────────────────────────────────────────────────
function profitTrend(c: Company): { margin: number; trend: number } {
  const rs = c.reports;
  if (rs.length === 0) return { margin: 0, trend: 0 };
  const last = rs[rs.length - 1];
  const scale = Math.max(100_000, Math.abs(last.revenue));
  const margin = clamp(last.netIncome / scale, -1, 1);
  const prev = rs.slice(-4, -1);
  if (prev.length === 0) return { margin, trend: 0 };
  const avgPrev = prev.reduce((a, r) => a + r.netIncome, 0) / prev.length;
  const trend = clamp((last.netIncome - avgPrev) / scale, -1, 1);
  return { margin, trend };
}

export function runHrMonth(s: GameState): void {
  refreshCandidates(s);
  const yearEnd = s.day % 360 === 0;
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) continue;
    const { margin, trend } = profitTrend(c);
    for (const m of Object.values(c.managers)) {
      if (!m) continue;
      // Performance evaluation (rolling)
      const raw = 25 + m.skill * 0.45 + margin * 30 + trend * 25 + gauss(s) * 6;
      m.performance = Math.round(clamp(m.performance * 0.6 + clamp(raw, 0, 100) * 0.4, 0, 100));
      if (yearEnd) {
        // wage inflation follows macro inflation (wageIndex growth); seasoned managers gain experience
        m.salary = Math.round((m.salary * (1 + clamp(s.macro.inflation, 0, 0.2))) / 100) * 100;
        m.experience += 1;
      }
    }
    // Underpaid managers may quit (2%/month chance each)
    for (const m of Object.values(c.managers)) {
      if (!m) continue;
      const payRatio = m.salary / Math.max(1, managerMarketSalary(s, m));
      if (payRatio >= 0.85) continue;
      if (!chance(s, 0.02)) continue;
      delete c.managers[m.role];
      if (isPlayer(s, c)) {
        const title = MANAGER_ROLE_INFO[m.role]?.title ?? m.role;
        addNews(s, 'company', `${c.name}: ${m.role} istifa etti`,
          `${title} ${m.name} (yetenek ${m.skill}) düşük maaş nedeniyle istifa etti. Yöneticiler ekranından yeni bir aday işe alın.`,
          { important: true, companyId: c.id, countryId: c.countryId });
      }
    }
  }
}
