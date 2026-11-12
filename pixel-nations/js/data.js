// Statik oyun verisi: kaynaklar, binalar, birlikler, teknolojiler, yönetim biçimleri, 15 devlet
export const T = { DEEP: 0, SEA: 1, LAKE: 2, PLAINS: 3, FOREST: 4, DESERT: 5, HILLS: 6, MOUNTAIN: 7, SNOW: 8 };
export const TERR = [
  { id: 0, name: 'Derin Deniz', water: true, col: '#16406e', def: 1, cost: 1 },
  { id: 1, name: 'Sığ Deniz', water: true, col: '#2a6fa8', def: 1, cost: 1 },
  { id: 2, name: 'Göl', water: true, col: '#3c88b8', def: 1, cost: 1 },
  { id: 3, name: 'Ova', water: false, col: '#6fa845', def: 1.0, cost: 1 },
  { id: 4, name: 'Orman', water: false, col: '#2f6e35', def: 1.25, cost: 1.5 },
  { id: 5, name: 'Çöl', water: false, col: '#d6b872', def: 0.95, cost: 1.25 },
  { id: 6, name: 'Tepelik', water: false, col: '#8e8a55', def: 1.4, cost: 1.8 },
  { id: 7, name: 'Dağ', water: false, col: '#7b766f', def: 1.9, cost: 3 },
  { id: 8, name: 'Kar/Tundra', water: false, col: '#dfe9ee', def: 1.1, cost: 1.6 },
];
export const isWater = (t) => t <= 2;

// Kaynaklar (indeks sırası sabit)
export const RES = [
  { id: 'food', name: 'Gıda', base: 4, col: '#8bd450' },
  { id: 'iron', name: 'Demir', base: 8, col: '#a9b8cc' },
  { id: 'coal', name: 'Kömür', base: 6, col: '#8a8a98' },
  { id: 'oil', name: 'Petrol', base: 14, col: '#a07be0' },
  { id: 'gold', name: 'Altın', base: 40, col: '#f5c93a' },
  { id: 'wood', name: 'Kereste', base: 5, col: '#c08848' },
  { id: 'stone', name: 'Taş', base: 5, col: '#d8cfba' },
  { id: 'power', name: 'Elektrik', base: 3, col: '#5fd8ff' },
];
export const NR = RES.length;
export const F = 0, IR = 1, CO = 2, OI = 3, GO = 4, WO = 5, ST = 6, EL = 7;

// Binalar: out = temel üretim/seviye, pot = iklim/yatak potansiyeli anahtarı
export const BLD = {
  farm: { name: 'Çiftlik', ic: 'food', res: F, out: 14, pot: 'food', cost: { money: 900, wood: 10 }, d: 6, desc: 'Gıda üretir.' },
  iron: { name: 'Demir Madeni', ic: 'iron', res: IR, out: 7, pot: 'iron', cost: { money: 1300, wood: 15, stone: 10 }, d: 8, desc: 'Demir cevheri çıkarır.' },
  coal: { name: 'Kömür Ocağı', ic: 'coal', res: CO, out: 9, pot: 'coal', cost: { money: 1200, wood: 15, stone: 10 }, d: 8, desc: 'Kömür çıkarır.' },
  oil: { name: 'Petrol Kuyusu', ic: 'oil', res: OI, out: 5, pot: 'oil', cost: { money: 2200, iron: 15, stone: 10 }, d: 10, desc: 'Petrol çıkarır.' },
  gold: { name: 'Altın Madeni', ic: 'gold', res: GO, out: 0.9, pot: 'gold', cost: { money: 2400, iron: 10, stone: 15 }, d: 12, desc: 'Altın çıkarır.' },
  wood: { name: 'Kereste Atölyesi', ic: 'wood', res: WO, out: 9, pot: 'wood', cost: { money: 800, stone: 5 }, d: 5, desc: 'Kereste üretir.' },
  stone: { name: 'Taş Ocağı', ic: 'stone', res: ST, out: 8, pot: 'stone', cost: { money: 900, wood: 10 }, d: 6, desc: 'Yapı taşı çıkarır.' },
  power: { name: 'Enerji Santrali', ic: 'power', res: EL, out: 26, pot: null, cost: { money: 2000, iron: 20, stone: 15 }, d: 9, desc: 'Elektrik üretir (kömür yakar, nehir/göl kıyısında hidro bonus).' },
  factory: { name: 'Fabrika', ic: 'factory', cost: { money: 2200, iron: 20, stone: 20 }, d: 10, desc: 'Demir+kömür+elektrikle sanayi ürünü; askerî üretim kapasitesi.' },
  market: { name: 'Pazar/Borsa', ic: 'market', cost: { money: 1400, wood: 15, stone: 10 }, d: 7, desc: 'Ticaret kapasitesi ve hizmet geliri.' },
  port: { name: 'Liman', ic: 'port', cost: { money: 2000, wood: 30, stone: 20 }, d: 9, desc: 'Deniz ticareti, donanma ve çıkarma üssü.', needsCoast: true },
  school: { name: 'Okul/Üniversite', ic: 'school', cost: { money: 1500, stone: 15 }, d: 8, desc: 'Araştırma puanı ve verimlilik.' },
  hospital: { name: 'Hastane', ic: 'hospital', cost: { money: 1300, stone: 10 }, d: 7, desc: 'Sağlık, nüfus artışı, insan gücü.' },
  barracks: { name: 'Kışla', ic: 'barracks', cost: { money: 1400, wood: 15, stone: 10 }, d: 7, desc: 'İnsan gücü yenilenmesi ve üretim hızı.' },
  fort: { name: 'Tahkimat', ic: 'fort', cost: { money: 1600, stone: 40 }, d: 8, desc: 'Şehir savunması ve milis.' },
  infra: { name: 'Altyapı', ic: 'infra', cost: { money: 1200, stone: 15, wood: 10 }, d: 7, desc: 'Yol/rayı; verim, ikmal ve nüfus kapasitesi.' },
};
export const BLD_KEYS = Object.keys(BLD);
export const EXTRACT = ['farm', 'iron', 'coal', 'oil', 'gold', 'wood', 'stone'];
export const POT_SCALE = { food: 20, iron: 3, coal: 3, oil: 3, gold: 3, wood: 15, stone: 8 };

// Birlikler
export const UNITS = {
  inf: { name: 'Piyade', dom: 'land', hp: 100, atk: 10, def: 12, speed: 0.34, cost: { money: 500, iron: 1 }, mp: 10, time: 96, up: { money: 4.0, food: 0.3 }, req: null },
  tank: { name: 'Tank', dom: 'land', hp: 120, atk: 24, def: 14, speed: 0.62, cost: { money: 2200, iron: 8, oil: 4 }, mp: 4, time: 240, up: { money: 16.0, food: 0.15, oil: 0.3 }, req: 'land1' },
  art: { name: 'Topçu', dom: 'land', hp: 70, atk: 22, def: 5, speed: 0.28, cost: { money: 1300, iron: 5 }, mp: 5, time: 168, up: { money: 9.6, food: 0.15, iron: 0.1 }, req: null },
  air: { name: 'Hava Filosu', dom: 'air', hp: 80, atk: 26, def: 16, speed: 2.6, cost: { money: 2800, iron: 6, oil: 6 }, mp: 2, time: 288, up: { money: 19.2, oil: 0.4 }, req: 'air1' },
  navy: { name: 'Donanma', dom: 'sea', hp: 200, atk: 28, def: 18, speed: 0.7, cost: { money: 3600, iron: 12, oil: 5, wood: 4 }, mp: 5, time: 360, up: { money: 22.4, oil: 0.3, food: 0.1 }, req: null, needsPort: true },
};
export const UNIT_KEYS = Object.keys(UNITS);
// saldıran tür -> savunan tür çarpanı
export const MATCHUP = {
  inf: { inf: 1, tank: 0.6, art: 1.3, air: 0.2, navy: 0.1 },
  tank: { inf: 1.5, tank: 1, art: 1.8, air: 0.1, navy: 0.1 },
  art: { inf: 1.25, tank: 1.15, art: 1.3, air: 0.1, navy: 0.6 },
  air: { inf: 1.0, tank: 1.45, art: 1.35, air: 1, navy: 1.25 },
  navy: { inf: 0.8, tank: 0.8, art: 0.9, air: 0.5, navy: 1 },
};

// Yönetim biçimleri
export const GOV = {
  monarchy: { name: 'Monarşi', stab: 4, eco: 1.0, mil: 1.05, res: 0.95, corr: 0.10, war: 0.9 },
  empire: { name: 'İmparatorluk', stab: 2, eco: 1.0, mil: 1.15, res: 0.95, corr: 0.12, war: 0.7 },
  republic: { name: 'Cumhuriyet', stab: 3, eco: 1.05, mil: 1.0, res: 1.05, corr: 0.07, war: 1.1 },
  democracy: { name: 'Demokrasi', stab: 5, eco: 1.08, mil: 0.95, res: 1.12, corr: 0.05, war: 1.6 },
  federation: { name: 'Federasyon', stab: 4, eco: 1.04, mil: 0.98, res: 1.05, corr: 0.07, war: 1.2 },
  junta: { name: 'Askerî Cunta', stab: -3, eco: 0.94, mil: 1.25, res: 0.85, corr: 0.18, war: 0.5 },
  theocracy: { name: 'Teokrasi', stab: 7, eco: 0.92, mil: 1.05, res: 0.75, corr: 0.10, war: 0.8 },
  oligarchy: { name: 'Tüccar Oligarşisi', stab: 1, eco: 1.15, mil: 0.9, res: 1.0, corr: 0.13, war: 1.2 },
  peoples: { name: 'Halk Cumhuriyeti', stab: 2, eco: 1.0, mil: 1.1, res: 1.0, corr: 0.10, war: 0.8, indus: 1.12 },
  sultanate: { name: 'Sultanlık', stab: 3, eco: 0.98, mil: 1.08, res: 0.9, corr: 0.14, war: 0.8 },
  khanate: { name: 'Hanlık', stab: 0, eco: 0.92, mil: 1.2, res: 0.8, corr: 0.12, war: 0.6 },
  confed: { name: 'Konfederasyon', stab: 3, eco: 1.0, mil: 1.0, res: 1.0, corr: 0.08, war: 1.0 },
};

// Teknoloji ağacı: 8 alan x 4 kademe
export const TECH_AREAS = [
  { id: 'agri', name: 'Tarım' }, { id: 'ind', name: 'Sanayi' }, { id: 'eco', name: 'Ekonomi' }, { id: 'land', name: 'Kara Ordusu' },
  { id: 'air', name: 'Hava Kuvvetleri' }, { id: 'navy', name: 'Deniz Kuvvetleri' }, { id: 'infra', name: 'Altyapı' }, { id: 'sci', name: 'Bilim' },
];
const tc = (lv) => ({ rp: [0, 200, 450, 800, 1400][lv], money: [0, 2500, 6000, 12000, 24000][lv] });
const T_ = (id, area, lv, name, desc, fx, req = []) => ({ id, area, lv, name, desc, fx, req: lv > 1 ? [area + (lv - 1), ...req] : req, ...tc(lv) });
export const TECHS = [
  T_('agri1', 'agri', 1, 'Demir Saban', 'Gıda üretimi +10%', { food: 0.10 }),
  T_('agri2', 'agri', 2, 'Sulama ve Gübre', 'Gıda +12%, nüfus kapasitesi', { food: 0.12, popCap: 0.1 }),
  T_('agri3', 'agri', 3, 'Mekanik Tarım', 'Gıda +15%, kereste +8%', { food: 0.15, wood: 0.08 }, ['ind1']),
  T_('agri4', 'agri', 4, 'Tarımsal Bilim', 'Gıda +20%', { food: 0.20 }, ['sci2']),
  T_('ind1', 'ind', 1, 'Buhar Makineleri', 'Madenler +10%', { mine: 0.10 }),
  T_('ind2', 'ind', 2, 'Montaj Hattı', 'Fabrika verimi +15%', { factory: 0.15 }),
  T_('ind3', 'ind', 3, 'Elektrifikasyon', 'Elektrik +20%, bina sınırı 4', { power: 0.2, bldCap: 1 }, ['infra1']),
  T_('ind4', 'ind', 4, 'Otomasyon', 'Fabrika +25%, madenler +10%', { factory: 0.25, mine: 0.10 }),
  T_('eco1', 'eco', 1, 'Bankacılık', 'Vergi toplama +5%', { tax: 0.05 }),
  T_('eco2', 'eco', 2, 'Borsa ve Sigorta', 'Ticaret kapasitesi +25%', { trade: 0.25 }, ['sci1']),
  T_('eco3', 'eco', 3, 'Merkez Bankası', 'Enflasyon baskısı azalır, düşük faiz', { infl: 0.3 }),
  T_('eco4', 'eco', 4, 'Küresel Ticaret Ağı', 'Ticaret +30%, vergi +5%', { trade: 0.3, tax: 0.05 }),
  T_('land1', 'land', 1, 'Zırhlı Araçlar', 'Tank birimi açılır; piyade +5%', { landAtk: 0.05, unlock: 'tank' }, ['ind1']),
  T_('land2', 'land', 2, 'Ağır Topçu', 'Topçu saldırısı +20%', { artAtk: 0.2 }),
  T_('land3', 'land', 3, 'Motorlu Piyade', 'Kara hızı +15%, savunma +10%', { landSpeed: 0.15, landDef: 0.1 }),
  T_('land4', 'land', 4, 'Birleşik Silahlar', 'Tüm kara saldırısı +15%', { landAtk: 0.15, tankAtk: 0.1 }),
  T_('air1', 'air', 1, 'Pilotluk', 'Hava filosu açılır', { unlock: 'air' }, ['sci1']),
  T_('air2', 'air', 2, 'Av Uçakları', 'Hava saldırısı +15%', { airAtk: 0.15 }),
  T_('air3', 'air', 3, 'Bombardıman', 'Hava-yer hasarı +25%', { airGround: 0.25 }),
  T_('air4', 'air', 4, 'Jet Motoru', 'Hız +40%, saldırı +10%', { airSpeed: 0.4, airAtk: 0.1 }),
  T_('navy1', 'navy', 1, 'Çelik Gövde', 'Gemi dayanıklılığı +15%', { navyHp: 0.15 }),
  T_('navy2', 'navy', 2, 'Sonar ve Radar', 'Deniz saldırısı +15%', { navyAtk: 0.15 }, ['ind2']),
  T_('navy3', 'navy', 3, 'Taşıma Filosu', 'Deniz hızı +30%', { navySpeed: 0.3 }),
  T_('navy4', 'navy', 4, 'Zırhlı Savaş Gemileri', 'Gemi saldırısı +25%', { navyAtk: 0.25, navyHp: 0.1 }),
  T_('infra1', 'infra', 1, 'Demiryolları', 'İkmal menzili +3, verim +4%', { supply: 3, infra: 0.04 }, ['ind1']),
  T_('infra2', 'infra', 2, 'Elektrik Şebekesi', 'Bina sınırı 4, enerji kaybı azalır', { bldCap: 1, infra: 0.03 }, ['ind2']),
  T_('infra3', 'infra', 3, 'Modern Limanlar', 'Ticaret +15%, deniz ikmali', { trade: 0.15, supply: 1 }),
  T_('infra4', 'infra', 4, 'Karayolu Ağı', 'Bina sınırı 5, ikmal +3', { bldCap: 1, supply: 3, infra: 0.05 }),
  T_('sci1', 'sci', 1, 'Üniversiteler', 'Araştırma +20%', { rp: 0.2 }),
  T_('sci2', 'sci', 2, 'Laboratuvarlar', 'Araştırma +25%', { rp: 0.25 }),
  T_('sci3', 'sci', 3, 'Araştırma Enstitüsü', 'Araştırma +30%, casusluk +20%', { rp: 0.3, spy: 0.2 }),
  T_('sci4', 'sci', 4, 'Hesaplama Makineleri', 'Araştırma +35%, verim +5%', { rp: 0.35, eco: 0.05 }),
];
export const TECH_BY = Object.fromEntries(TECHS.map((t) => [t.id, t]));

export const POLICY_DEFAULT = {
  taxIncome: 0.25, taxCorp: 0.25, tariff: 0.10,
  edu: 0.03, health: 0.03, infra: 0.025, agri: 0.01, industry: 0.01, science: 0.01, military: 0.04,
  mobilization: 0.3, immigration: 0, natalism: 0,
};

// 15 devlet: ad, yönetim, renk, bayrak, karakter, şehir adları
export const NATIONS = [
  { name: 'Aurelya Krallığı', short: 'Aurelya', gov: 'monarchy', col: '#e8c04a', col2: '#7a1f2b', flag: ['hstripe3', 0, 1, 0], tr: { aggr: .35, expan: .4, merc: .5, loyal: .85, para: .4, dipl: .7, scheme: .3, indus: .5, naval: .4, tech: .5, forgive: .5 }, trait: 'Onurlu ve dengeli', cities: ['Aurelis', 'Valdemar', 'Corvane', 'Sunhaven', 'Eldwick', 'Marenne'], aff: {} },
  { name: 'Kharzan İmparatorluğu', short: 'Kharzan', gov: 'empire', col: '#c0392b', col2: '#222222', flag: ['disc', 1, 0, 1], tr: { aggr: .85, expan: .9, merc: .3, loyal: .4, para: .6, dipl: .3, scheme: .5, indus: .6, naval: .3, tech: .5, forgive: .2 }, trait: 'Yayılmacı ve militarist', cities: ['Kharzagrad', 'Dorukan', 'Tymor', 'Ashgard', 'Velkhan', 'Orzak'], aff: {} },
  { name: 'Velmora Cumhuriyeti', short: 'Velmora', gov: 'republic', col: '#3f7fd1', col2: '#f2f2f2', flag: ['vstripe3', 0, 1, 2], tr: { aggr: .2, expan: .2, merc: .9, loyal: .6, para: .3, dipl: .85, scheme: .4, indus: .6, naval: .6, tech: .6, forgive: .6 }, trait: 'Tüccar ve diplomat', cities: ['Velmora', 'Portanza', 'Lisserra', 'Montecara', 'Nerolia', 'Ostrelle'], aff: { coast: 1 } },
  { name: 'Nordvik Birliği', short: 'Nordvik', gov: 'federation', col: '#a9bfd9', col2: '#1d3a63', flag: ['nordic', 1, 0, 0], tr: { aggr: .15, expan: .15, merc: .5, loyal: .8, para: .85, dipl: .6, scheme: .2, indus: .6, naval: .5, tech: .75, forgive: .6 }, trait: 'Savunmacı ve münzevi', cities: ['Nordvik', 'Frostholm', 'Hallvard', 'Isfjord', 'Skarn', 'Eirvik'], aff: { cold: 1, mount: .5 } },
  { name: 'Zephiria Teokrasisi', short: 'Zephiria', gov: 'theocracy', col: '#8e5bc2', col2: '#f2d34a', flag: ['saltire', 0, 1, 0], tr: { aggr: .6, expan: .6, merc: .3, loyal: .5, para: .7, dipl: .3, scheme: .2, indus: .3, naval: .2, tech: .2, forgive: .1 }, trait: 'Fanatik ve inatçı', cities: ['Zephir', 'Sanctum Ara', 'Halyon', 'Meridia', 'Oruthal', 'Kyrene'], aff: {} },
  { name: 'Drakmoor Cuntası', short: 'Drakmoor', gov: 'junta', col: '#d6732b', col2: '#1a1a1a', flag: ['diag', 0, 1, 0], tr: { aggr: .9, expan: .7, merc: .3, loyal: .1, para: .8, dipl: .2, scheme: .7, indus: .5, naval: .3, tech: .4, forgive: .3 }, trait: 'Fırsatçı ve saldırgan', cities: ['Drakmoor', 'Blackforge', 'Hargrave', 'Scorch', 'Vulkan', 'Irongate'], aff: { mount: .6 } },
  { name: 'Solenne Demokrasisi', short: 'Solenne', gov: 'democracy', col: '#4fb36a', col2: '#fafafa', flag: ['hstripe3', 0, 1, 0], tr: { aggr: .1, expan: .1, merc: .7, loyal: .9, para: .3, dipl: .95, scheme: .1, indus: .5, naval: .4, tech: .8, forgive: .7 }, trait: 'Barışçıl ve güvenilir', cities: ['Solenne', 'Belmare', 'Clairvaux', 'Lumenis', 'Avenor', 'Tessaly'], aff: { plains: 1 } },
  { name: 'Tarsis Loncası', short: 'Tarsis', gov: 'oligarchy', col: '#2fa59a', col2: '#f2c230', flag: ['hsplit2', 0, 1, 0], tr: { aggr: .2, expan: .3, merc: 1, loyal: .3, para: .4, dipl: .7, scheme: .6, indus: .5, naval: .8, tech: .5, forgive: .5 }, trait: 'Açgözlü tüccarlar', cities: ['Tarsis', 'Goldwharf', 'Brinemouth', 'Sablemarket', 'Copperquay', 'Salvento'], aff: { coast: 1.2 } },
  { name: 'Ostravia Halk Cumhuriyeti', short: 'Ostravia', gov: 'peoples', col: '#a33d6e', col2: '#f2c230', flag: ['quarter', 0, 1, 0], tr: { aggr: .55, expan: .5, merc: .4, loyal: .6, para: .65, dipl: .4, scheme: .4, indus: .95, naval: .3, tech: .6, forgive: .3 }, trait: 'Sanayi devi', cities: ['Ostravia', 'Kombinat', 'Redstack', 'Zavodna', 'Ursk', 'Mirnograd'], aff: { mount: .4 } },
  { name: 'Ilyrien Prensliği', short: 'Ilyrien', gov: 'monarchy', col: '#5663c9', col2: '#d8d8e8', flag: ['chevron', 0, 1, 0], tr: { aggr: .35, expan: .35, merc: .5, loyal: .15, para: .6, dipl: .6, scheme: .95, indus: .4, naval: .3, tech: .6, forgive: .4 }, trait: 'Entrikacı ve casus', cities: ['Ilyria', 'Veilmoor', 'Dusk Court', 'Silvane', 'Sablecourt', 'Nocturne'], aff: { forest: 1 } },
  { name: 'Mazhara Sultanlığı', short: 'Mazhara', gov: 'sultanate', col: '#b8742a', col2: '#1f6f4a', flag: ['border', 0, 1, 0], tr: { aggr: .5, expan: .45, merc: .65, loyal: .5, para: .5, dipl: .5, scheme: .4, indus: .4, naval: .3, tech: .3, forgive: .4 }, trait: 'Çöl ve petrol zengini', cities: ['Mazhar', 'Kasrabad', 'Sandaz', 'Oasira', 'Tirmaz', 'Hamdun'], aff: { desert: 2 } },
  { name: 'Kaldoran Konfederasyonu', short: 'Kaldoran', gov: 'confed', col: '#7e9150', col2: '#3a2a1a', flag: ['vstripe3', 0, 1, 0], tr: { aggr: .2, expan: .15, merc: .4, loyal: .75, para: .9, dipl: .5, scheme: .3, indus: .6, naval: .1, tech: .5, forgive: .6 }, trait: 'Dağlı ve savunmacı', cities: ['Kaldor', 'Stonegap', 'Highpass', 'Ironcrest', 'Rockhaven', 'Valtorn'], aff: { mount: 2 } },
  { name: 'Vesperia Cumhuriyeti', short: 'Vesperia', gov: 'republic', col: '#36b8d9', col2: '#0e2a4a', flag: ['hstripe3', 1, 0, 1], tr: { aggr: .4, expan: .4, merc: .7, loyal: .55, para: .4, dipl: .6, scheme: .4, indus: .5, naval: .95, tech: .6, forgive: .5 }, trait: 'Deniz gücü', cities: ['Vesper', 'Tidewatch', 'Saltreach', 'Corsair Bay', 'Marlowe', 'Galehaven'], aff: { coast: 2 } },
  { name: 'Brannoch Krallığı', short: 'Brannoch', gov: 'monarchy', col: '#8a5a3c', col2: '#e0e0e0', flag: ['nordic', 1, 0, 1], tr: { aggr: .6, expan: .5, merc: .3, loyal: .7, para: .6, dipl: .4, scheme: .3, indus: .5, naval: .4, tech: .4, forgive: .05 }, trait: 'Kin tutan kuzeyliler', cities: ['Brannoch', 'Wolfden', 'Greymoor', 'Frostmere', 'Ravenhold', 'Thornwick'], aff: { cold: 1.4 } },
  { name: 'Syrath Hanlığı', short: 'Syrath', gov: 'khanate', col: '#e0587a', col2: '#2a2a2a', flag: ['diag', 0, 1, 0], tr: { aggr: .85, expan: .8, merc: .3, loyal: .3, para: .5, dipl: .2, scheme: .4, indus: .3, naval: .2, tech: .2, forgive: .3 }, trait: 'Bozkır akıncıları', cities: ['Syrath', 'Khuran', 'Bozkir', 'Tengri', 'Yaylak', 'Altun'], aff: { plains: 1.5, inland: 1 } },
];
export const NN = NATIONS.length;

export const MEM = {
  war_on_me: { v: -35, hl: 900, t: 'Bize savaş açtı' },
  attacked_ally: { v: -15, hl: 400, t: 'Müttefikimize saldırdı' },
  betrayal: { v: -40, hl: 1800, t: 'Anlaşmayı çiğnedi (ihanet)' },
  city_lost: { v: -30, hl: 1500, t: 'Şehrimizi ele geçirdi' },
  aided: { v: 25, hl: 900, t: 'Savaşta yanımızda yer aldı' },
  gift: { v: 8, hl: 300, t: 'Hediye/yardım gönderdi' },
  sanction: { v: -20, hl: 500, t: 'Bize yaptırım uyguladı' },
  spied: { v: -25, hl: 700, t: 'Casusluk faaliyeti yakalandı' },
  threat: { v: -12, hl: 300, t: 'Bizi tehdit etti' },
  peace: { v: 6, hl: 400, t: 'Barışı kabul etti' },
  ally_honored: { v: 30, hl: 1200, t: 'İttifak yükümlülüğünü yerine getirdi' },
  ally_ignored: { v: -25, hl: 1000, t: 'İttifak çağrımıza cevap vermedi' },
  deal: { v: 10, hl: 500, t: 'Anlaşma imzaladık' },
  refused: { v: -3, hl: 120, t: 'Teklifimizi reddetti' },
  tribute: { v: -8, hl: 300, t: 'Haraç aldı' },
  sabotage: { v: -30, hl: 800, t: 'Sabotaj yaptı' },
};
