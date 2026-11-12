// Finance module: daily stock valuation, month-end accounting (loans, depreciation,
// tax, dividends, reports), distress / bankruptcy and holding bookkeeping.
// Deterministic: randomness only via rng.ts on `s`.
import type { Company, GameState, Id, Loan, MonthlyReport } from '../types';
import { emptyLedger } from '../types';
import { gauss, genId } from '../rng';
import { addNews, clamp, countryCosts, mgr } from '../util';
import { loanOffer } from '../preview';
import { bookEquity, companiesOf, debtOf, inventoryValue, marketCap, netWorth, totalAssets, totalEmployees } from '../selectors';

const PRICE_HISTORY_CAP = 120;
const REPORTS_CAP = 36;
const NET_WORTH_CAP = 120;
const GAME_OVER_TITLE = 'Oyun bitti: imparatorluk çöktü';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const monthLabel = (day: number) => `${MONTHS[Math.floor((((day % 360) + 360) % 360) / 30)]} ${2030 + Math.floor(day / 360)}`;

/** Compact USD formatting for news text (mirrors ui/format.money, engine must not import UI). */
function money(v: number): string {
  const a = Math.abs(v), sign = v < 0 ? '-' : '';
  if (a >= 1e12) return `${sign}$${(a / 1e12).toFixed(1)} T`;
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(1)} Mr`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)} M`;
  if (a >= 1e4) return `${sign}$${(a / 1e3).toFixed(1)} B`;
  return `${sign}$${a.toFixed(0)}`;
}

const isPlayerCompany = (s: GameState, c: Company) => c.holdingId === s.playerHoldingId;

/** Sum of all expense fields of a ledger, excluding tax (capex & dividends are never expenses). */
function preTaxExpenses(c: Company): number {
  const l = c.ledger;
  return l.cogsMaterials + l.salaries + l.managerSalaries + l.energy + l.maintenance + l.logistics +
    l.marketing + l.rnd + l.infra + l.other + l.interest + l.depreciation;
}
const ledgerNetIncome = (c: Company) => c.ledger.revenue - preTaxExpenses(c) - c.ledger.tax;

// ─── Valuation ───────────────────────────────────────────────────────────

/** Revenue growth: rolling 30-day revenue vs. the monthly report ~3 months ago (clamped −0.5..1). */
function revenueGrowth(c: Company): number {
  const n = c.reports.length;
  if (n < 3) return 0;
  const past = c.reports[n - 3].revenue;
  if (past <= 0) return c.revenue30 > 0 ? 0.3 : 0;
  return clamp(c.revenue30 / past - 1, -0.5, 1);
}

/** Equity value (USD, ≥ 0) per ENGINE_NOTES valuation model. Used for public & private companies. */
export function valuation(s: GameState, c: Company): number {
  if (c.bankrupt) return 0;
  const annualProfit = c.profit30 * 12;
  const g = revenueGrowth(c);
  const pe = clamp(14 + 30 * g, 5, 45) * (0.7 + 0.3 * s.macro.demandIndex);
  const be = bookEquity(s, c);
  const value = Math.max(be * 0.8, annualProfit * pe + be * 0.4, c.revenue30 * 12 * 0.6 * (1 + g)) - 0.3 * debtOf(c);
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

export function runFinanceDay(s: GameState): void {
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) continue;
    const shares = Math.max(1, c.sharesOutstanding);
    const target = Math.max(0.01, valuation(s, c) / shares);
    let price = c.sharePrice;
    if (!(price > 0) || !Number.isFinite(price)) price = target;
    price *= Math.exp(0.04 * Math.log(target / price) + 0.012 * gauss(s));
    c.sharePrice = Math.max(0.01, price);
    c.priceHistory.push(c.sharePrice);
    if (c.priceHistory.length > PRICE_HISTORY_CAP) c.priceHistory.splice(0, c.priceHistory.length - PRICE_HISTORY_CAP);
  }
}

// ─── Loans ───────────────────────────────────────────────────────────────

/** Create an annuity loan, add proceeds to company cash (financing, not revenue). */
export function makeLoan(s: GameState, c: Company, amount: number, termMonths: number, annualRate: number): Loan {
  const principal = Math.max(0, amount);
  const n = Math.max(1, Math.round(termMonths));
  const r = Math.max(0, annualRate) / 12;
  const monthlyPayment = r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;
  const loan: Loan = {
    id: genId(s, 'l'), principal, balance: principal, annualRate: Math.max(0, annualRate),
    termMonths: n, monthlyPayment, takenDay: s.day,
  };
  c.loans.push(loan);
  c.cash += principal;
  return loan;
}

/** Monthly debt service. A loan taken during the current month only pays pro-rata interest. */
function serviceLoans(s: GameState, c: Company) {
  for (const l of c.loans) {
    if (l.balance <= 0) continue;
    const r = l.annualRate / 12;
    const age = s.day - l.takenDay;
    if (age < 30) {
      const interest = l.balance * r * Math.max(0, age) / 30;
      c.cash -= interest; c.ledger.interest += interest;
      continue;
    }
    const interest = l.balance * r;
    const principal = l.termMonths <= 1 ? l.balance : clamp(l.monthlyPayment - interest, 0, l.balance);
    c.cash -= interest + principal;
    c.ledger.interest += interest;
    l.balance -= principal;
    l.termMonths -= 1;
  }
  c.loans = c.loans.filter((l) => l.balance > 0.01 && l.termMonths > 0);
}

// ─── Dividends ───────────────────────────────────────────────────────────

/** Pay `amount` (limited to available positive cash) to shareholders pro rata; free float leaves the game. Returns amount paid. */
export function payDividends(s: GameState, c: Company, amount: number): number {
  const paid = Math.min(Math.max(0, amount), Math.max(0, c.cash));
  if (paid <= 0) return 0;
  c.cash -= paid;
  c.ledger.dividends += paid;
  const shares = Math.max(1, c.sharesOutstanding);
  for (const [hid, sh] of Object.entries(c.shareholders)) {
    const h = s.holdings[hid];
    if (h && sh > 0) h.cash += (paid * sh) / shares;
  }
  return paid;
}

// ─── Control & bankruptcy ────────────────────────────────────────────────

/** Move a company under another holding (share transfers are done by the caller). */
export function transferControl(s: GameState, c: Company, newHoldingId: Id): void {
  const h = s.holdings[newHoldingId];
  if (!h) return;
  c.holdingId = newHoldingId;
  c.autoManaged = h.isPlayer ? !!c.managers.CEO : true;
  const held = Object.values(c.shareholders).reduce((a, b) => a + b, 0);
  if (held >= c.sharesOutstanding - 1e-6) c.isPublic = false;
  c.distressMonths = 0;
}

/** Bankruptcy: liquidate assets (30% of book), pay creditors, residual to shareholders, wipe operations. */
export function liquidateCompany(s: GameState, c: Company, reason: string): void {
  if (c.bankrupt) return;
  const fixed = c.facilities.reduce((a, f) => a + f.bookValue, 0);
  const proceeds = fixed * 0.3 + inventoryValue(s, c) * 0.3 + Math.max(0, c.cash);
  const claims = debtOf(c) + Math.max(0, -c.cash);
  const residual = Math.max(0, proceeds - claims);
  const shares = Math.max(1, c.sharesOutstanding);
  if (residual > 0) {
    for (const [hid, sh] of Object.entries(c.shareholders)) {
      const h = s.holdings[hid];
      if (h && sh > 0) h.cash += (residual * sh) / shares;
    }
  }
  c.cash = 0;
  c.loans = [];
  c.facilities = [];
  c.goodsStock = {};
  c.productStock = {};
  for (const pid of c.products) {
    const p = s.products[pid];
    if (p) { p.active = false; p.marketing = 0; p.lastSales = 0; p.share = 0; }
  }
  for (const pid of c.platforms) {
    const p = s.platforms[pid];
    if (p) { p.users = 0; p.dau = 0; p.premiumUsers = 0; p.marketing = 0; p.devSpend = 0; p.infraCapacity = 0; }
  }
  c.cloudOffers = [];
  c.markets = [];
  c.research = null;
  c.managers = {};
  c.employees = { production: 0, rnd: 0, sales: 0, admin: 0 };
  c.employeeTargets = { production: 0, rnd: 0, sales: 0, admin: 0 };
  c.revenue30 = 0; c.profit30 = 0;
  c.dividendPayout = 0;
  c.isPublic = false;
  c.sharePrice = 0.01;
  c.priceHistory.push(0.01);
  if (c.priceHistory.length > PRICE_HISTORY_CAP) c.priceHistory.splice(0, c.priceHistory.length - PRICE_HISTORY_CAP);
  c.bankrupt = true;
  const owner = s.holdings[c.holdingId];
  addNews(s, 'finance', `${c.name} iflas etti`,
    `${reason} Tesisler defter değerinin %30'una tasfiye edildi, ${money(claims)} borç silindi; hissedarlar yatırımlarını kaybetti.` +
    (residual > 0 ? ` Kalan ${money(residual)} hissedarlara dağıtıldı.` : '') +
    (owner ? ` (${owner.name})` : ''),
    { important: true, companyId: c.id, countryId: c.countryId });
}

// ─── Month end ───────────────────────────────────────────────────────────

function buildReport(s: GameState, c: Company): MonthlyReport {
  return {
    ...c.ledger,
    day: s.day,
    netIncome: ledgerNetIncome(c),
    cash: c.cash,
    debt: debtOf(c),
    inventoryValue: inventoryValue(s, c),
    assets: totalAssets(s, c),
    equity: bookEquity(s, c),
    marketCap: marketCap(c),
    employees: totalEmployees(c),
  };
}

function handleDistress(s: GameState, c: Company) {
  const player = isPlayerCompany(s, c);
  if (c.cash < 0 && !player) {
    const need = -c.cash;
    const offer = loanOffer(s, c.id);
    if (offer.maxAmount >= need) {
      const amount = Math.min(offer.maxAmount, Math.ceil((need * 1.25 + 100_000) / 1000) * 1000);
      makeLoan(s, c, amount, 24, offer.annualRate);
    }
  }
  if (c.cash >= 0) { c.distressMonths = 0; return; }
  c.distressMonths += 1;
  if (c.distressMonths >= 3) {
    liquidateCompany(s, c, `${c.name} üç ay üst üste negatif nakitle kapattı ve yükümlülüklerini karşılayamadı.`);
    return;
  }
  if (player) {
    addNews(s, 'finance', `${c.name}: nakit açığı (${c.distressMonths}/3 ay)`,
      `${c.name} ayı ${money(c.cash)} nakitle kapattı. 3 ay üst üste negatif nakit iflasa yol açar — holdingden nakit aktarın, kredi alın veya giderleri kısın.`,
      { important: true, companyId: c.id, countryId: c.countryId });
  }
}

export function runMonthEnd(s: GameState): void {
  let playerRevenue = 0, playerNet = 0, playerCount = 0;
  const playerLines: string[] = [];

  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) { c.ledger = emptyLedger(); continue; }

    // 1. Debt service
    serviceLoans(s, c);

    // 2. Depreciation (non-cash, declining balance 1/120 per month)
    for (const f of c.facilities) {
      if (f.bookValue <= 0) continue;
      const d = f.bookValue / 120;
      f.bookValue -= d;
      c.ledger.depreciation += d;
    }

    // 3. Tax on positive pre-tax income
    const preTax = c.ledger.revenue - preTaxExpenses(c);
    if (preTax > 0) {
      const country = s.countries[c.countryId];
      const rate = country ? countryCosts(s, country).tax * (1 - mgr(c, 'CFO') * 0.002) : 0;
      const tax = preTax * Math.max(0, rate);
      c.cash -= tax;
      c.ledger.tax += tax;
    }

    // 4. Dividends from positive net income
    const net = ledgerNetIncome(c);
    if (net > 0 && c.dividendPayout > 0) payDividends(s, c, net * clamp(c.dividendPayout, 0, 1));

    // 5. Report
    const report = buildReport(s, c);
    c.reports.push(report);
    if (c.reports.length > REPORTS_CAP) c.reports.splice(0, c.reports.length - REPORTS_CAP);
    c.ledger = emptyLedger();

    if (isPlayerCompany(s, c)) {
      playerRevenue += report.revenue; playerNet += report.netIncome; playerCount++;
      playerLines.push(`${c.name}: gelir ${money(report.revenue)}, net kâr ${money(report.netIncome)}, nakit ${money(report.cash)}`);
    }

    // 6. Distress & bankruptcy
    handleDistress(s, c);
  }

  // Player monthly summary
  if (playerCount > 0) {
    addNews(s, 'finance', `Aylık rapor: gelir ${money(playerRevenue)}, net kâr ${money(playerNet)}`,
      `${monthLabel(s.day - 1)} dönemi. ${playerLines.join(' · ')}`, { important: false });
  }

  // Holdings
  for (const h of Object.values(s.holdings)) {
    if (h.eliminated) continue;
    h.netWorthHistory.push({ day: s.day, value: netWorth(s, h.id) });
    if (h.netWorthHistory.length > NET_WORTH_CAP) h.netWorthHistory.splice(0, h.netWorthHistory.length - NET_WORTH_CAP);
    const live = companiesOf(s, h.id).length;
    if (!h.isPlayer) {
      if (live === 0 && h.cash < 0) {
        h.eliminated = true;
        addNews(s, 'finance', `${h.name} piyasadan silindi`, `${h.name} holdinginin faal şirketi kalmadı ve borçlarını ödeyemedi.`, { important: true });
      }
    } else if (live === 0 && h.cash < 300_000 && !s.news.some((n) => n.kind === 'system' && n.title === GAME_OVER_TITLE)) {
      addNews(s, 'system', GAME_OVER_TITLE,
        `${h.name} holdinginin faal şirketi kalmadı ve yeni bir şirket kuracak sermayesi yok (${money(h.cash)}). Yeni oyun başlatabilir veya kayıtlı bir oyunu yükleyebilirsiniz.`,
        { important: true });
    }
  }
}
