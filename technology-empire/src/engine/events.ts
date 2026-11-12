// Macro economy (business cycle, inflation, rates, FX) and random world events.
// Deterministic: all randomness comes from s.rng via ./rng.
//
// Conventions owned by this module:
// - macro.phaseDays = days ELAPSED in the current phase. A phase ends with a hazard
//   rate that makes its length uniformly distributed in [PHASE_MIN, PHASE_MAX].
// - commodity.shockDays / platformMarket.trendDays are counted down here (once per day);
//   when they reach 0 the multiplier (supplyShock / trend) is reset to 1.
// - stats.lastEventDay is set whenever a random event fires (min gap EVENT_MIN_GAP days).
import type { Company, Country, Facility, GameState, GoodId, Macro, PlatformCatId, Product } from './types';
import { CATEGORIES, GOODS, GOOD_IDS, PLATFORMS, PLATFORM_IDS, RAW_GOODS, SECTORS } from './data/defs';
import { createCountries } from './data/countries';
import { chance, gauss, pick, rand, randInt, randRange } from './rng';
import { addNews, clamp } from './util';
import { availableTechs } from './selectors';

// ─── Formatting helpers (Turkish) ─────────────────────────────────────────
const pct = (x: number, d = 1) => `%${(x * 100).toFixed(d).replace('.', ',')}`;
function money(x: number): string {
  const a = Math.abs(x);
  if (a >= 1e9) return `${(x / 1e9).toFixed(2).replace('.', ',')} milyar $`;
  if (a >= 1e6) return `${(x / 1e6).toFixed(1).replace('.', ',')} milyon $`;
  if (a >= 1e3) return `${Math.round(x / 1e3)} bin $`;
  return `${Math.round(x)} $`;
}

// ─── Static country baselines (for mean reversion) ───────────────────────
let BASE: Record<string, { gdpGrowth: number; politicalRisk: number }> | null = null;
function countryBase(id: string): { gdpGrowth: number; politicalRisk: number } | undefined {
  if (!BASE) {
    BASE = {};
    for (const c of Object.values(createCountries())) BASE[c.id] = { gdpGrowth: c.gdpGrowth, politicalRisk: c.politicalRisk };
  }
  return BASE[id];
}

// ─── Business cycle ───────────────────────────────────────────────────────
type Phase = Macro['phase'];
const PHASE_MIN = 180;
const PHASE_MAX = 720;
const NEXT_PHASE: Record<Phase, Phase> = { expansion: 'slowdown', slowdown: 'recession', recession: 'recovery', recovery: 'expansion' };
const GROWTH_TARGET: Record<Phase, number> = { expansion: 0.035, slowdown: 0.015, recession: -0.02, recovery: 0.025 };
const INFLATION_ADD: Record<Phase, number> = { expansion: 0.012, slowdown: 0.006, recession: -0.01, recovery: -0.002 };
const POTENTIAL_GROWTH = 0.025;

function phaseNews(s: GameState, phase: Phase) {
  const m = s.macro;
  const g = pct(m.gdpGrowth), r = pct(m.baseRate, 2), inf = pct(m.inflation);
  const texts: Record<Phase, [string, string][]> = {
    expansion: [
      ['Küresel ekonomi genişleme dönemine girdi', `Toparlanma güç kazandı: küresel büyüme ${g}, enflasyon ${inf}. Tüketici talebi artıyor; kapasite yatırımı için uygun bir dönem.`],
      ['Ekonomide güçlü büyüme dönemi başladı', `İstihdam ve harcamalar hızlanıyor. Analistler elektronik ve bulut talebinde belirgin artış bekliyor. Politika faizi ${r}.`],
    ],
    slowdown: [
      ['Küresel büyüme yavaşlıyor', `Öncü göstergeler soğumaya işaret ediyor: büyüme ${g}, enflasyon ${inf}. Merkez bankaları ${r} seviyesindeki faizle temkinli.`],
      ['Ekonomide yavaşlama sinyalleri', `Sipariş defterleri incelirken tüketici güveni geriliyor. Stok ve borç seviyelerini gözden geçirmenin tam zamanı.`],
    ],
    recession: [
      ['Küresel ekonomi resesyona girdi', `Küresel büyüme ${g} ile negatife döndü. Tüketici elektroniği ve reklam bütçelerinde kesinti bekleniyor; nakit akışını koruyun.`],
      ['Resesyon resmileşti: talep daralıyor', `Şirketler yatırım planlarını erteliyor. Politika faizi ${r}; merkez bankaları gevşemeye hazırlanıyor.`],
    ],
    recovery: [
      ['Ekonomide toparlanma başladı', `Dip geride kaldı: büyüme ${g} ile yeniden pozitif. Düşük faiz (${r}) yatırım iştahını canlandırıyor.`],
      ['Piyasalarda toparlanma havası', `Tüketici harcamaları ve kurumsal BT bütçeleri yeniden artıyor. Erken yatırım yapanlar avantaj kazanabilir.`],
    ],
  };
  const [title, body] = pick(s, texts[phase]);
  addNews(s, 'economy', title, body, { important: true });
}

export function runMacroDay(s: GameState): void {
  const m = s.macro;

  // Phase transition: uniform length in [PHASE_MIN, PHASE_MAX] via hazard rate.
  m.phaseDays += 1;
  if (m.phaseDays >= PHASE_MIN) {
    const hazard = 1 / Math.max(1, PHASE_MAX - m.phaseDays + 1);
    if (chance(s, hazard)) {
      m.phase = NEXT_PHASE[m.phase];
      m.phaseDays = 0;
      phaseNews(s, m.phase);
    }
  }

  // GDP growth: smooth drift toward phase target.
  const gTarget = GROWTH_TARGET[m.phase];
  m.gdpGrowth = clamp(m.gdpGrowth + (gTarget - m.gdpGrowth) * 0.012 + gauss(s) * 0.0003, -0.06, 0.07);

  // Energy index: mean-reverting random walk.
  m.energyIndex = clamp(m.energyIndex + (1 - m.energyIndex) * 0.004 + gauss(s) * 0.006, 0.5, 2.5);

  // Inflation: higher in expansion, includes energy shocks and demand pressure.
  const infTarget = 0.022 + INFLATION_ADD[m.phase] + (m.energyIndex - 1) * 0.05 + (m.demandIndex - 1) * 0.04;
  m.inflation = clamp(m.inflation + (infTarget - m.inflation) * 0.01 + gauss(s) * 0.0002, -0.02, 0.15);

  // Central bank: Taylor-like rule with smoothing. gap = slack (potential − actual growth).
  const gap = POTENTIAL_GROWTH - m.gdpGrowth;
  const rTarget = clamp(0.01 + 1.4 * m.inflation - 0.5 * gap, 0.0025, 0.2);
  m.baseRate = clamp(m.baseRate + (rTarget - m.baseRate) * 0.015, 0.0025, 0.2);

  // Consumer demand index follows growth (smoothed).
  const dTarget = clamp(1 + (m.gdpGrowth - POTENTIAL_GROWTH) * 4, 0.7, 1.3);
  m.demandIndex = clamp(m.demandIndex + (dTarget - m.demandIndex) * 0.02, 0.7, 1.3);

  // Cumulative indices.
  m.wageIndex *= 1 + (m.inflation + 0.01) / 360;
  m.priceLevel *= 1 + m.inflation / 360;

  // Countries.
  const monthEnd = s.day % 30 === 0;
  for (const c of Object.values(s.countries)) {
    const base = countryBase(c.id);
    const risk = clamp(c.politicalRisk, 0, 100);
    const vol = 0.0005 + (risk / 100) * 0.0035;
    const drift = (Math.max(0, risk - 40) / 60) * 0.045 / 360; // high-risk ≈ high-inflation → slight depreciation
    c.fx = clamp(c.fx * Math.exp(drift + gauss(s) * vol), 0.2, 20);
    const gBase = base?.gdpGrowth ?? c.gdpGrowth;
    const gTargetC = gBase + (m.gdpGrowth - POTENTIAL_GROWTH) * 1.2;
    c.gdpGrowth = clamp(c.gdpGrowth + (gTargetC - c.gdpGrowth) * 0.01 + gauss(s) * 0.00015, -0.12, 0.15);
    c.taxModifier *= 0.998;
    if (Math.abs(c.taxModifier) < 0.0005) c.taxModifier = 0;
    if (base) c.politicalRisk = clamp(c.politicalRisk + (base.politicalRisk - c.politicalRisk) * 0.0015, 0, 100);
    if (monthEnd) c.gdp *= 1 + c.gdpGrowth / 12;
  }

  if (monthEnd) {
    const last = m.history[m.history.length - 1];
    if (last) {
      const dr = m.baseRate - last.baseRate;
      if (Math.abs(dr) >= 0.004) {
        addNews(s, 'economy',
          dr > 0 ? `Merkez bankaları faizi ${pct(m.baseRate, 2)} seviyesine yükseltti` : `Merkez bankaları faizi ${pct(m.baseRate, 2)} seviyesine indirdi`,
          dr > 0
            ? `Enflasyon ${pct(m.inflation)} ile hedefin üzerinde. Kredi maliyetleri artıyor; yeni borçlanma pahalılaşacak.`
            : `Büyüme ${pct(m.gdpGrowth)} seviyesinde zayıf seyrederken para politikası gevşiyor. Kredi koşulları kolaylaşıyor.`);
      }
    }
    m.history.push({ day: s.day, gdpGrowth: m.gdpGrowth, inflation: m.inflation, baseRate: m.baseRate, demandIndex: m.demandIndex });
    if (m.history.length > 120) m.history.splice(0, m.history.length - 120);
  }
}

// ─── Random events ────────────────────────────────────────────────────────
export interface EventDef {
  id: string;
  name: string;
  weight: number;
  /** Applies the event. Returns false if not applicable in the current state (nothing changed). */
  run: (s: GameState) => boolean;
}

export const EVENT_CHANCE = 1 / 20;
export const EVENT_MIN_GAP = 10;
/** Max probability that a company-targeted event hits the player instead of a rival. */
const PLAYER_BIAS = 0.25;

const isPlayer = (s: GameState, c: Company) => c.holdingId === s.playerHoldingId;
const activeCompanies = (s: GameState) => Object.values(s.companies).filter((c) => !c.bankrupt);

function weightedPick<T>(s: GameState, items: readonly T[], w: (t: T) => number): T | undefined {
  let total = 0;
  for (const it of items) total += Math.max(0, w(it));
  if (total <= 0) return undefined;
  let r = rand(s) * total;
  for (const it of items) {
    r -= Math.max(0, w(it));
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

/** Pick a company; the player is chosen at most with probability PLAYER_BIAS (and proportionally to its share of candidates). */
function pickCompany(s: GameState, cands: Company[]): Company | undefined {
  if (cands.length === 0) return undefined;
  const mine = cands.filter((c) => isPlayer(s, c));
  const others = cands.filter((c) => !isPlayer(s, c));
  if (mine.length === 0) return pick(s, others);
  if (others.length === 0) return chance(s, PLAYER_BIAS) ? pick(s, mine) : undefined;
  const pPlayer = Math.min(PLAYER_BIAS, mine.length / cands.length + 0.1);
  return chance(s, pPlayer) ? pick(s, mine) : pick(s, others);
}

function playerTouchesCountry(s: GameState, countryId: string): boolean {
  for (const c of activeCompanies(s)) {
    if (!isPlayer(s, c)) continue;
    if (c.countryId === countryId || c.markets.includes(countryId) || c.facilities.some((f) => f.countryId === countryId)) return true;
  }
  return false;
}

function playerUsesGood(s: GameState, g: GoodId): boolean {
  for (const c of activeCompanies(s)) {
    if (!isPlayer(s, c)) continue;
    if ((c.goodsStock[g] ?? 0) > 0) return true;
    if (c.facilities.some((f) => f.output === g || (GOODS[f.output as GoodId]?.recipe?.[g] ?? 0) > 0)) return true;
    for (const pid of c.products) {
      const p = s.products[pid];
      if (p?.active && (p.bom[g] ?? 0) > 0) return true;
    }
  }
  return false;
}

function countryName(s: GameState, id: string) {
  return s.countries[id]?.name ?? id;
}

// --- Commodity supply shock / glut ---------------------------------------
const SHORTAGE_CAUSES = [
  (g: string, cn: string) => [`${cn} kaynaklı ${g} arzında sert düşüş`, `Büyük madenlerde başlayan grev nedeniyle ${g} sevkiyatları durdu.`],
  (g: string, cn: string) => [`${g} piyasasında arz krizi`, `${cn} hükümeti ${g} ihracatına geçici kota getirdi. Alıcılar alternatif tedarikçi arıyor.`],
  (g: string, cn: string) => [`Sel felaketi ${g} üretimini vurdu`, `${cn} genelindeki şiddetli yağışlar madenleri ve limanları kapattı; küresel ${g} arzı daraldı.`],
  (g: string, cn: string) => [`Lojistik tıkanıklık: ${g} sevkiyatı gecikiyor`, `${cn} çıkışlı yük gemilerinde yaşanan kriz ${g} tedarik zincirini aksattı.`],
] as const;
const GLUT_CAUSES = [
  (g: string, cn: string) => [`${g} piyasasında arz fazlası`, `${cn} sahasında keşfedilen yeni rezervler devreye girdi; ${g} fiyatları baskı altında.`],
  (g: string, cn: string) => [`${g} stokları rekor seviyede`, `${cn} merkezli üreticiler kapasiteyi artırdı, talep aynı hızla büyümedi.`],
] as const;

function eventCommodityShock(s: GameState): boolean {
  const cands = GOOD_IDS.filter((g) => s.commodities[g] && s.commodities[g].shockDays <= 0);
  const g = weightedPick(s, cands, (x) => (GOODS[x].raw ? 3 : 1));
  if (!g) return false;
  const m = s.commodities[g];
  const goodName = GOODS[g].name;
  // Source country: one with deposits of the raw good (weighted), else a tech-heavy producer.
  const countries = Object.values(s.countries);
  const rawSrc = RAW_GOODS.includes(g) ? weightedPick(s, countries, (c) => c.deposits[g] ?? 0) : undefined;
  const src: Country | undefined = rawSrc ?? weightedPick(s, countries, (c) => c.techLevel * c.marketWeight);
  const cn = src ? src.name : 'Asya';
  const shortage = chance(s, 0.7);
  const days = randInt(s, 30, 90);
  let title: string, body: string;
  if (shortage) {
    m.supplyShock = randRange(s, 0.5, 0.75);
    [title, body] = pick(s, SHORTAGE_CAUSES)(goodName, cn);
    body += ` Arz yaklaşık ${pct(1 - m.supplyShock, 0)} azaldı, etkinin ${days} gün sürmesi bekleniyor.`;
  } else {
    m.supplyShock = randRange(s, 1.25, 1.35);
    [title, body] = pick(s, GLUT_CAUSES)(goodName, cn);
    body += ` Arz yaklaşık ${pct(m.supplyShock - 1, 0)} arttı (${days} gün).`;
  }
  m.shockDays = days;
  addNews(s, 'commodity', title, body, { important: playerUsesGood(s, g), countryId: src?.id });
  return true;
}

// --- Energy price spike ---------------------------------------------------
function eventEnergySpike(s: GameState): boolean {
  const add = randRange(s, 0.22, 0.38);
  s.macro.energyIndex = clamp(s.macro.energyIndex + add, 0.5, 2.5);
  const causes = [
    'Doğal gaz boru hattındaki sabotaj Avrupa ve Asya piyasalarında paniğe yol açtı.',
    'OPEC+ beklenmedik üretim kesintisine gitti; petrol ve gaz fiyatları fırladı.',
    'Sıcak hava dalgası elektrik şebekelerini zorluyor; spot elektrik fiyatları rekor kırdı.',
    'Büyük bir LNG terminalindeki yangın küresel enerji arzını daralttı.',
  ];
  addNews(s, 'economy', 'Enerji fiyatlarında şok yükseliş',
    `${pick(s, causes)} Enerji endeksi ${s.macro.energyIndex.toFixed(2).replace('.', ',')} seviyesine çıktı; fabrika ve veri merkezi maliyetleri artacak.`,
    { important: true });
  return true;
}

// --- Platform category trend ----------------------------------------------
const TREND_TEXT: Partial<Record<PlatformCatId, string[]>> = {
  video: ['Kısa video çılgınlığı tüm yaş gruplarına yayıldı.', 'Viral bir dans akımı milyonlarca yeni içerik üreticisini platformlara çekti.'],
  photo: ['Yeni bir fotoğraf filtresi akımı sosyal medyayı kasıp kavuruyor.', 'Seyahat sezonu fotoğraf paylaşımlarını rekor seviyeye taşıdı.'],
  messaging: ['Gizlilik tartışmaları kullanıcıları yeni mesajlaşma uygulamalarına yöneltiyor.', 'Topluluk sohbet grupları gençler arasında hızla yaygınlaşıyor.'],
  streaming: ['Dünya şampiyonası canlı yayın izlenmesinde rekor kırdırdı.', 'Oyun yayıncılığı ana akım eğlence haline geldi.'],
  forum: ['Niş topluluklar algoritmik akışlara alternatif olarak yükselişte.', 'Bir yatırım topluluğunun ünü forum platformlarına kayıt patlaması yaşattı.'],
  music: ['Yapay zekâ destekli çalma listeleri müzik dinlemeyi yeniden popüler yaptı.', 'Bir festival sezonunun ardından müzik aboneliklerinde sıçrama yaşandı.'],
  os: ['Yeni nesil cihaz dalgası işletim sistemi pazarını hareketlendirdi.', 'Açık kaynak ekosistemine ilgi işletim sistemi değişimlerini hızlandırdı.'],
  aiApi: ['Şirketler yapay zekâ ajanlarına akın ediyor; API çağrıları katlanıyor.', 'Viral bir yapay zekâ uygulaması model API talebini patlattı.'],
  gameEngine: ['Bağımsız oyun stüdyolarında rekor kuruluş dalgası yaşanıyor.', 'Bir hit oyun, oyun motoru lisanslarına olan ilgiyi artırdı.'],
  office: ['Hibrit çalışma modeli ofis yazılımı aboneliklerini artırıyor.', 'Kamu kurumları bulut tabanlı ofis paketlerine geçiyor.'],
  devTools: ['Yapay zekâ destekli kodlama araçları geliştiricilerin vazgeçilmezi oldu.', 'Girişim yatırımlarındaki artış geliştirici araçlarına talebi yükseltti.'],
  security: ['Büyük bir fidye yazılımı saldırısı siber güvenlik talebini patlattı.', 'Yeni veri koruma düzenlemeleri şirketleri güvenlik yatırımına zorluyor.'],
};

function eventPlatformTrend(s: GameState): boolean {
  const cands = PLATFORM_IDS.filter((p) => s.platformMarkets[p] && s.platformMarkets[p].trendDays <= 0);
  if (cands.length === 0) return false;
  const cat = pick(s, cands);
  const pm = s.platformMarkets[cat];
  pm.trend = 1.5;
  pm.trendDays = 60;
  const name = PLATFORMS[cat].name;
  const text = pick(s, TREND_TEXT[cat] ?? ['Kullanıcı ilgisi beklenmedik şekilde arttı.']);
  const playerHas = Object.values(s.platforms).some((p) => p.category === cat && s.companies[p.companyId] && isPlayer(s, s.companies[p.companyId]));
  addNews(s, 'trend', `Yeni sosyal trend: ${name} platformlarına ilgi patladı`,
    `${text} Önümüzdeki 60 gün boyunca ${name} kategorisinde yeni kullanıcı kazanımının belirgin şekilde artması bekleniyor.`,
    { important: playerHas });
  return true;
}

// --- Country tax incentive / increase -------------------------------------
function eventTaxChange(s: GameState): boolean {
  const country = weightedPick(s, Object.values(s.countries), (c) => c.marketWeight + 0.01);
  if (!country) return false;
  const incentive = chance(s, 0.5);
  const delta = incentive ? -0.05 : 0.05;
  country.taxModifier = clamp(country.taxModifier + delta, -0.15, 0.15);
  const eff = clamp(country.corporateTax + country.taxModifier, 0, 0.6);
  const important = activeCompanies(s).some((c) => isPlayer(s, c) && (c.countryId === country.id || c.facilities.some((f) => f.countryId === country.id)));
  if (incentive) {
    const why = pick(s, ['yüksek teknoloji yatırımlarını çekmek için', 'ihracatı canlandırmak amacıyla', 'yerli üretimi teşvik etmek için', 'Ar-Ge merkezlerini ülkeye çekmek için']);
    addNews(s, 'policy', `${country.name} kurumlar vergisinde indirime gitti`,
      `${country.name} hükümeti ${why} kurumlar vergisini 5 puan düşürdü. Efektif oran ${pct(eff, 0)}. Teşvikin zamanla sona ermesi bekleniyor.`,
      { important, countryId: country.id });
  } else {
    const why = pick(s, ['bütçe açığını kapatmak için', 'artan kamu borcu nedeniyle', 'teknoloji devlerine yönelik ek vergi düzenlemesiyle', 'savunma harcamalarını finanse etmek için']);
    addNews(s, 'policy', `${country.name} kurumlar vergisini artırdı`,
      `${country.name} hükümeti ${why} kurumlar vergisini 5 puan yükseltti. Efektif oran ${pct(eff, 0)}.`,
      { important, countryId: country.id });
  }
  return true;
}

// --- Rival technology announcement ----------------------------------------
function eventRivalTech(s: GameState): boolean {
  const cands = activeCompanies(s).filter((c) => !isPlayer(s, c) && availableTechs(c).length > 0);
  if (cands.length === 0) return false;
  const c = pick(s, cands);
  const techs = availableTechs(c);
  const t = weightedPick(s, techs, (x) => 1 / Math.sqrt(x.cost)) ?? techs[0];
  c.techs.push(t.id);
  c.patents += 1;
  if (c.research?.techId === t.id) c.research = null;
  const first = !s.globalTechs.includes(t.id);
  if (first) s.globalTechs.push(t.id);
  const holding = s.holdings[c.holdingId];
  const playerSector = activeCompanies(s).some((p) => isPlayer(s, p) && p.sector === c.sector);
  const venue = pick(s, ['yıllık geliştirici konferansında', 'basın toplantısında', 'canlı yayınlanan lansman etkinliğinde', 'yatırımcı gününde']);
  addNews(s, 'tech', `${c.name}, ${t.name} teknolojisini duyurdu`,
    `${holding?.name ?? c.name} bünyesindeki ${c.name}, ${venue} ${t.name} teknolojisini tanıttı (${t.description}).` +
    (first ? ' Bu teknoloji dünyada ilk kez kullanıma sunuldu; rakip ürünler eski kalabilir.' : ' Şirket bu alanda rakiplerine yetişti.'),
    { important: playerSector && first, companyId: c.id });
  return true;
}

// --- Product recall --------------------------------------------------------
function eventRecall(s: GameState): boolean {
  const prods = Object.values(s.products).filter((p) => p.active && (p.sales30 > 0 || (s.companies[p.companyId]?.productStock[p.id] ?? 0) > 0) && s.companies[p.companyId] && !s.companies[p.companyId].bankrupt);
  const owners = [...new Set(prods.map((p) => p.companyId))].map((id) => s.companies[id]);
  const c = pickCompany(s, owners);
  if (!c) return false;
  const p: Product = pick(s, prods.filter((x) => x.companyId === c.id));
  const stock = c.productStock[p.id] ?? 0;
  const lost = stock * 0.3;
  c.productStock[p.id] = stock - lost;
  const cost = clamp(p.sales30 * 0.12 * p.price + lost * p.unitMaterialCost * 0.2, 100_000, 8_000_000);
  c.cash -= cost;
  c.ledger.other += cost;
  c.brand = clamp(c.brand - 8, 0, 100);
  c.satisfaction = clamp(c.satisfaction - 10, 0, 100);
  const defect = pick(s, ['aşırı ısınma', 'batarya şişmesi', 'yazılım kaynaklı ani kapanma', 'güç ünitesi arızası', 'ekran titremesi', 'veri kaybına yol açan donanım hatası']);
  addNews(s, 'recall', `${c.name}: ${p.name} için geri çağırma`,
    `${CATEGORIES[p.category]?.name ?? p.category} ürünü ${p.name} kullanıcılarında ${defect} şikâyetleri artınca ${c.name} ürünü geri çağırdı. ` +
    `Stokların %30'u (${Math.round(lost)} adet) imha edildi, onarım ve iade maliyeti ${money(cost)}. Marka itibarı zarar gördü.`,
    { important: isPlayer(s, c), companyId: c.id });
  return true;
}

// --- Factory fire / breakdown ---------------------------------------------
function eventFacilityFire(s: GameState): boolean {
  const owners = activeCompanies(s).filter((c) => c.facilities.some((f) => f.downDays <= 0));
  const c = pickCompany(s, owners);
  if (!c) return false;
  const f: Facility = pick(s, c.facilities.filter((x) => x.downDays <= 0));
  const days = randInt(s, 10, 30);
  f.downDays = days;
  f.condition = clamp(f.condition - randRange(s, 10, 25), 0, 100);
  const fire = chance(s, 0.5);
  const where = countryName(s, f.countryId);
  addNews(s, 'breakdown',
    fire ? `${c.name} tesisinde yangın: ${f.name}` : `${c.name}: ${f.name} ağır arıza nedeniyle durdu`,
    fire
      ? `${where} konumundaki ${f.name} tesisinde çıkan yangın üretimi durdurdu. Can kaybı yok; tesisin ${days} gün kapalı kalması bekleniyor.`
      : `${where} konumundaki ${f.name} tesisinde kritik ekipman arızası yaşandı. Onarım ${days} gün sürecek.`,
    { important: isPlayer(s, c), companyId: c.id, countryId: f.countryId });
  return true;
}

// --- Big deal / contract ---------------------------------------------------
function eventBigDeal(s: GameState): boolean {
  const c = pickCompany(s, activeCompanies(s).filter((x) => x.revenue30 > 0));
  if (!c) return false;
  const amount = clamp(c.revenue30 * randRange(s, 0.3, 0.8), 500_000, 30_000_000);
  c.cash += amount;
  c.ledger.revenue += amount;
  const client = weightedPick(s, Object.values(s.countries), (x) => x.marketWeight) ?? s.countries[c.countryId];
  const cn = client?.name ?? 'Yabancı';
  const kind = SECTORS[c.sector]?.kind;
  const desc = kind === 'extraction' ? `${cn} merkezli bir sanayi grubuyla uzun vadeli hammadde tedarik anlaşması`
    : kind === 'processing' ? `${cn} kaynaklı bir otomotiv üreticisiyle çip ve bileşen tedarik sözleşmesi`
    : kind === 'manufacturing' ? `${cn} hükümetinin eğitim ve kamu kurumları için açtığı büyük cihaz ihalesi`
    : kind === 'datacenter' ? `${cn} kamu kurumlarının bulut altyapı ihalesi`
    : `${cn} merkezli küresel bir holdingle kurumsal lisans anlaşması`;
  addNews(s, 'deal', `${c.name} dev bir sözleşme kazandı`,
    `${c.name}, ${desc} ile ${money(amount)} tutarında tek seferlik gelir elde etti.`,
    { important: isPlayer(s, c), companyId: c.id, countryId: client?.id });
  return true;
}

// --- Patent dispute --------------------------------------------------------
function eventPatentDispute(s: GameState): boolean {
  const cs = activeCompanies(s);
  const plaintiffs = cs.filter((c) => c.patents > 0);
  const plaintiff = weightedPick(s, plaintiffs, (c) => c.patents);
  if (!plaintiff) return false;
  const rivals = cs.filter((c) => c.holdingId !== plaintiff.holdingId && c.revenue30 > 0);
  const sameSector = rivals.filter((c) => c.sector === plaintiff.sector);
  const pool = sameSector.length > 0 ? sameSector : rivals;
  // keep player exposure moderate
  let defendant: Company | undefined;
  if (isPlayer(s, plaintiff)) defendant = pool.length > 0 ? pick(s, pool) : undefined;
  else defendant = pickCompany(s, pool);
  if (!defendant) return false;
  const amount = clamp(defendant.revenue30 * randRange(s, 0.1, 0.35), 250_000, Math.max(250_000, Math.min(12_000_000, Math.max(0, defendant.cash) * 0.5)));
  defendant.cash -= amount;
  defendant.ledger.other += amount;
  plaintiff.cash += amount;
  plaintiff.ledger.revenue += amount;
  const tech = pick(s, ['güç yönetimi', 'veri sıkıştırma', 'soğutma tasarımı', 'kullanıcı arayüzü', 'sinyal işleme', 'üretim süreci', 'öneri algoritması']);
  addNews(s, 'patent', `Patent davası: ${defendant.name}, ${plaintiff.name} şirketine tazminat ödeyecek`,
    `Mahkeme, ${defendant.name} şirketinin ${plaintiff.name} adına kayıtlı ${tech} patentlerini ihlal ettiğine hükmetti. Uzlaşma bedeli ${money(amount)}.`,
    { important: isPlayer(s, plaintiff) || isPlayer(s, defendant), companyId: defendant.id });
  return true;
}

// --- Market crash ----------------------------------------------------------
function eventMarketCrash(s: GameState): boolean {
  const hit = randRange(s, 0.1, 0.2);
  let n = 0;
  for (const c of activeCompanies(s)) {
    if (isPlayer(s, c)) continue;
    c.sharePrice = Math.max(0.01, c.sharePrice * (1 - hit * randRange(s, 0.8, 1.2)));
    n++;
  }
  if (n === 0) return false;
  s.macro.demandIndex = clamp(s.macro.demandIndex - 0.05, 0.7, 1.3);
  const cause = pick(s, [
    'Büyük bir yatırım bankasının iflas söylentileri',
    'Beklenenden yüksek enflasyon verisi ve faiz artışı korkusu',
    'Teknoloji hisselerindeki aşırı değerleme kaygıları',
    'Jeopolitik gerilimin tırmanması',
  ]);
  addNews(s, 'finance', `Borsalarda kara gün: teknoloji hisseleri ${pct(hit, 0)} değer kaybetti`,
    `${cause} küresel piyasalarda satış dalgasını tetikledi. Halka açık teknoloji şirketlerinin değeri eridi; tüketici güveni zayıfladı.`,
    { important: true });
  return true;
}

// --- Political instability -------------------------------------------------
function eventPoliticalCrisis(s: GameState): boolean {
  const country = weightedPick(s, Object.values(s.countries), (c) => c.politicalRisk + 5);
  if (!country) return false;
  country.politicalRisk = clamp(country.politicalRisk + 10, 0, 100);
  const shock = randRange(s, 0.06, 0.18);
  country.fx = clamp(country.fx * (1 + shock), 0.2, 20);
  const cause = pick(s, ['erken seçim kararı', 'hükümet krizi', 'yaygın sokak protestoları', 'sınır gerginliği', 'kabine istifaları']);
  addNews(s, 'policy', `${country.name} siyasi çalkantıda`,
    `${country.name} gündemine oturan ${cause} piyasaları sarstı. ${country.currency} dolar karşısında ${pct(shock, 0)} değer kaybetti, ülke risk primi yükseldi.`,
    { important: playerTouchesCountry(s, country.id), countryId: country.id });
  return true;
}

export const EVENT_DEFS: EventDef[] = [
  { id: 'commodityShock', name: 'Emtia arz şoku', weight: 16, run: eventCommodityShock },
  { id: 'energySpike', name: 'Enerji fiyat şoku', weight: 7, run: eventEnergySpike },
  { id: 'platformTrend', name: 'Sosyal trend', weight: 12, run: eventPlatformTrend },
  { id: 'taxChange', name: 'Vergi değişikliği', weight: 10, run: eventTaxChange },
  { id: 'rivalTech', name: 'Rakip teknoloji duyurusu', weight: 14, run: eventRivalTech },
  { id: 'recall', name: 'Ürün geri çağırma', weight: 7, run: eventRecall },
  { id: 'facilityFire', name: 'Tesis yangını/arızası', weight: 8, run: eventFacilityFire },
  { id: 'bigDeal', name: 'Büyük sözleşme', weight: 10, run: eventBigDeal },
  { id: 'patentDispute', name: 'Patent davası', weight: 6, run: eventPatentDispute },
  { id: 'marketCrash', name: 'Borsa çöküşü', weight: 3, run: eventMarketCrash },
  { id: 'politicalCrisis', name: 'Siyasi istikrarsızlık', weight: 7, run: eventPoliticalCrisis },
];

/** Count down timed event effects (supply shocks, platform trends). */
function tickEventDurations(s: GameState) {
  for (const m of Object.values(s.commodities)) {
    if (m.shockDays > 0) {
      m.shockDays -= 1;
      if (m.shockDays <= 0) { m.shockDays = 0; m.supplyShock = 1; }
    } else if (m.supplyShock !== 1) {
      m.supplyShock = 1;
    }
  }
  for (const pm of Object.values(s.platformMarkets)) {
    if (pm.trendDays > 0) {
      pm.trendDays -= 1;
      if (pm.trendDays <= 0) { pm.trendDays = 0; pm.trend = 1; }
    } else if (pm.trend !== 1) {
      pm.trend = 1;
    }
  }
}

export function runEventsDay(s: GameState): void {
  tickEventDurations(s);
  if (s.day - s.stats.lastEventDay < EVENT_MIN_GAP) return;
  if (!chance(s, EVENT_CHANCE)) return;
  // Try a few weighted picks in case the chosen event is not applicable.
  const tried = new Set<string>();
  for (let i = 0; i < 4; i++) {
    const def = weightedPick(s, EVENT_DEFS.filter((d) => !tried.has(d.id)), (d) => d.weight);
    if (!def) return;
    tried.add(def.id);
    if (def.run(s)) {
      s.stats.lastEventDay = s.day;
      return;
    }
  }
}
