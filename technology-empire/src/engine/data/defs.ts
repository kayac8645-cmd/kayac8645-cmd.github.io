// Static game definitions: goods, sectors, facility types, product categories,
// platform & cloud markets, tech tree. Pure data — no simulation logic.
import type {
  CategoryId, CloudServiceId, FacilityTypeId, GoodId, PlatformCatId, SectorId, SectorKind,
} from '../types';

// ─── Goods ────────────────────────────────────────────────────────────────
export interface GoodDef {
  id: GoodId; name: string; unit: string; basePrice: number; raw: boolean;
  /** NPC world baseline daily supply (= demand at equilibrium) */
  npcVolume: number;
  /** processing recipe (for intermediates) */
  recipe?: Partial<Record<GoodId, number>>;
  volatility: number;
}
export const GOODS: Record<GoodId, GoodDef> = {
  copper: { id: 'copper', name: 'Bakır', unit: 'ton', basePrice: 90, raw: true, npcVolume: 40000, volatility: 0.010 },
  gold: { id: 'gold', name: 'Altın', unit: 'ons', basePrice: 600, raw: true, npcVolume: 3000, volatility: 0.006 },
  silver: { id: 'silver', name: 'Gümüş', unit: 'kg', basePrice: 25, raw: true, npcVolume: 20000, volatility: 0.010 },
  lithium: { id: 'lithium', name: 'Lityum', unit: 'ton', basePrice: 150, raw: true, npcVolume: 12000, volatility: 0.016 },
  cobalt: { id: 'cobalt', name: 'Kobalt', unit: 'ton', basePrice: 300, raw: true, npcVolume: 4000, volatility: 0.015 },
  nickel: { id: 'nickel', name: 'Nikel', unit: 'ton', basePrice: 170, raw: true, npcVolume: 8000, volatility: 0.012 },
  silicon: { id: 'silicon', name: 'Silikon', unit: 'ton', basePrice: 40, raw: true, npcVolume: 60000, volatility: 0.008 },
  rareEarth: { id: 'rareEarth', name: 'Nadir Toprak', unit: 'ton', basePrice: 500, raw: true, npcVolume: 2500, volatility: 0.018 },
  iron: { id: 'iron', name: 'Demir', unit: 'ton', basePrice: 12, raw: true, npcVolume: 300000, volatility: 0.007 },
  aluminum: { id: 'aluminum', name: 'Alüminyum', unit: 'ton', basePrice: 24, raw: true, npcVolume: 150000, volatility: 0.008 },
  wafer: { id: 'wafer', name: 'Silikon Wafer', unit: 'adet', basePrice: 800, raw: false, npcVolume: 3000, volatility: 0.006, recipe: { silicon: 4 } },
  logicChip: { id: 'logicChip', name: 'Mantık Çipi', unit: 'adet', basePrice: 90, raw: false, npcVolume: 60000, volatility: 0.008, recipe: { wafer: 0.05, rareEarth: 0.01, gold: 0.003 } },
  memoryChip: { id: 'memoryChip', name: 'Bellek Çipi', unit: 'adet', basePrice: 12, raw: false, npcVolume: 500000, volatility: 0.012, recipe: { wafer: 0.006, copper: 0.003 } },
  battery: { id: 'battery', name: 'Batarya Hücresi', unit: 'adet', basePrice: 30, raw: false, npcVolume: 150000, volatility: 0.008, recipe: { lithium: 0.08, cobalt: 0.02, nickel: 0.02 } },
  display: { id: 'display', name: 'Ekran Paneli', unit: 'adet', basePrice: 60, raw: false, npcVolume: 80000, volatility: 0.006, recipe: { silicon: 0.2, rareEarth: 0.04, aluminum: 0.3 } },
};
export const GOOD_IDS = Object.keys(GOODS) as GoodId[];
export const RAW_GOODS = GOOD_IDS.filter((g) => GOODS[g].raw);

// ─── Facility types ──────────────────────────────────────────────────────
export interface FacilityDef {
  id: FacilityTypeId; name: string; sector: SectorId;
  buildCost: number; upgradeCostMult: number;
  /** base capacity per level per day (output units; mine: USD-value/day at base price; dc: max hosted units) */
  capacity: number;
  workers: number; // production workers per level
  energyMWh: number; // per level per day at full utilisation
  maintenance: number; // USD/day per level
  baseDefect: number; // scrap ratio
  buildDays: number;
  /** goods it can output (processing/mine) */
  outputs?: GoodId[];
  requiresTech?: string;
  description: string;
}
export const FACILITIES: Record<FacilityTypeId, FacilityDef> = {
  mine: { id: 'mine', name: 'Maden Sahası', sector: 'mining', buildCost: 2_500_000, upgradeCostMult: 0.7, capacity: 9000, workers: 60, energyMWh: 8, maintenance: 1500, baseDefect: 0, buildDays: 0, outputs: RAW_GOODS, description: 'Hammadde çıkarır. Rezerv, saflık ve ülke lojistiği verimi belirler.' },
  waferPlant: { id: 'waferPlant', name: 'Wafer Tesisi', sector: 'semiconductor', buildCost: 6_000_000, upgradeCostMult: 0.7, capacity: 40, workers: 40, energyMWh: 25, maintenance: 4000, baseDefect: 0.05, buildDays: 0, outputs: ['wafer'], description: 'Silikondan wafer üretir.' },
  logicFab: { id: 'logicFab', name: 'Mantık Çipi Fabrikası', sector: 'semiconductor', buildCost: 18_000_000, upgradeCostMult: 0.75, capacity: 1000, workers: 80, energyMWh: 60, maintenance: 12000, baseDefect: 0.12, buildDays: 0, outputs: ['logicChip'], requiresTech: 'fab_basic', description: 'Wafer işleyerek CPU/GPU çekirdekleri üretir.' },
  memoryFab: { id: 'memoryFab', name: 'Bellek Fabrikası', sector: 'semiconductor', buildCost: 12_000_000, upgradeCostMult: 0.75, capacity: 6000, workers: 70, energyMWh: 45, maintenance: 8000, baseDefect: 0.08, buildDays: 0, outputs: ['memoryChip'], description: 'DRAM / NAND bellek çipi üretir.' },
  batteryPlant: { id: 'batteryPlant', name: 'Batarya Tesisi', sector: 'semiconductor', buildCost: 5_000_000, upgradeCostMult: 0.7, capacity: 1500, workers: 50, energyMWh: 20, maintenance: 3000, baseDefect: 0.04, buildDays: 0, outputs: ['battery'], description: 'Lityum-iyon hücre üretir.' },
  displayPlant: { id: 'displayPlant', name: 'Ekran Tesisi', sector: 'semiconductor', buildCost: 7_000_000, upgradeCostMult: 0.7, capacity: 800, workers: 55, energyMWh: 22, maintenance: 3500, baseDefect: 0.06, buildDays: 0, outputs: ['display'], description: 'LCD/OLED panel üretir.' },
  assemblyPlant: { id: 'assemblyPlant', name: 'Montaj Fabrikası', sector: 'hardware', buildCost: 1_500_000, upgradeCostMult: 0.6, capacity: 120, workers: 45, energyMWh: 6, maintenance: 1200, baseDefect: 0.03, buildDays: 0, description: 'Bileşenlerden nihai ürün (GPU, telefon, sunucu…) üretir.' },
  dataCenter: { id: 'dataCenter', name: 'Veri Merkezi', sector: 'cloud', buildCost: 8_000_000, upgradeCostMult: 0.8, capacity: 2000, workers: 25, energyMWh: 4, maintenance: 5000, baseDefect: 0, buildDays: 0, description: 'Bulut/AI hesaplama kapasitesi sağlar. Genişletme sunucu/GPU gerektirir.' },
};

// ─── Product categories & spec system ────────────────────────────────────
export interface SpecOption {
  label: string;
  perf: number; // performance multiplier
  cost: number; // cost multiplier on BOM
  power?: number; // power multiplier
  quality?: number; // additive quality
  requiresTech?: string;
  /** extra BOM added */
  bomAdd?: Partial<Record<GoodId, number>>;
}
export interface SpecField { key: string; label: string; options: SpecOption[] }
export interface CategoryDef {
  id: CategoryId; name: string; sector: SectorId;
  baseDemand: number; // global units/day at macro 1
  refPrice: number;
  elasticity: number;
  perfWeight: number;
  annualGrowth: number;
  basePerf: number;
  basePower: number;
  laborHours: number;
  bom: Partial<Record<GoodId, number>>;
  fields: SpecField[];
  requiresTech?: string;
  /** used as input for data center expansion */
  dcInput?: CloudServiceId;
}

const NODE_FIELD: SpecField = {
  key: 'node', label: 'Üretim Teknolojisi', options: [
    { label: '28nm', perf: 1, cost: 1, power: 1 },
    { label: '14nm', perf: 1.45, cost: 1.12, power: 0.82, requiresTech: 'node14' },
    { label: '7nm', perf: 2.1, cost: 1.3, power: 0.66, requiresTech: 'node7' },
    { label: '5nm', perf: 2.9, cost: 1.55, power: 0.56, requiresTech: 'node5' },
    { label: '3nm', perf: 3.9, cost: 1.85, power: 0.48, requiresTech: 'node3' },
  ],
};
const TIER_FIELD: SpecField = {
  key: 'tier', label: 'Segment', options: [
    { label: 'Giriş', perf: 0.6, cost: 0.6, power: 0.6 },
    { label: 'Orta', perf: 1, cost: 1, power: 1 },
    { label: 'Performans', perf: 1.5, cost: 1.6, power: 1.4 },
    { label: 'Amiral', perf: 2.1, cost: 2.5, power: 1.9 },
  ],
};

export const CATEGORIES: Record<CategoryId, CategoryDef> = {
  gpu: {
    id: 'gpu', name: 'Ekran Kartı (GPU)', sector: 'hardware', baseDemand: 9000, refPrice: 550, elasticity: 2.2, perfWeight: 1.6, annualGrowth: 0.08,
    basePerf: 100, basePower: 220, laborHours: 1.2, bom: { logicChip: 1, memoryChip: 8, copper: 0.3 }, dcInput: 'ai',
    fields: [NODE_FIELD, TIER_FIELD,
      { key: 'vram', label: 'VRAM', options: [
        { label: '8 GB', perf: 0.9, cost: 1 }, { label: '12 GB', perf: 1, cost: 1.08, bomAdd: { memoryChip: 4 } },
        { label: '16 GB', perf: 1.1, cost: 1.15, bomAdd: { memoryChip: 8 } }, { label: '24 GB', perf: 1.2, cost: 1.25, bomAdd: { memoryChip: 16 } },
        { label: '32 GB', perf: 1.28, cost: 1.35, bomAdd: { memoryChip: 24 } }] },
      { key: 'mem', label: 'Bellek Türü', options: [
        { label: 'GDDR6', perf: 1, cost: 1 }, { label: 'GDDR7', perf: 1.15, cost: 1.08, requiresTech: 'gddr7' }, { label: 'HBM3', perf: 1.35, cost: 1.4, requiresTech: 'hbm' }] },
    ],
  },
  cpu: {
    id: 'cpu', name: 'İşlemci (CPU)', sector: 'hardware', baseDemand: 14000, refPrice: 320, elasticity: 2.0, perfWeight: 1.5, annualGrowth: 0.04,
    basePerf: 100, basePower: 95, laborHours: 0.6, bom: { logicChip: 1, copper: 0.2 },
    fields: [NODE_FIELD, TIER_FIELD,
      { key: 'cores', label: 'Çekirdek', options: [
        { label: '6 çekirdek', perf: 0.85, cost: 0.9 }, { label: '8 çekirdek', perf: 1, cost: 1 }, { label: '12 çekirdek', perf: 1.2, cost: 1.2, bomAdd: { logicChip: 0.3 } },
        { label: '16 çekirdek', perf: 1.38, cost: 1.4, bomAdd: { logicChip: 0.6 } }, { label: '24 çekirdek', perf: 1.55, cost: 1.7, bomAdd: { logicChip: 1 }, requiresTech: 'chiplet' }] },
    ],
  },
  ram: {
    id: 'ram', name: 'Bellek (RAM)', sector: 'hardware', baseDemand: 25000, refPrice: 90, elasticity: 2.6, perfWeight: 1.1, annualGrowth: 0.05,
    basePerf: 100, basePower: 5, laborHours: 0.2, bom: { memoryChip: 4, copper: 0.02 },
    fields: [
      { key: 'gen', label: 'Nesil', options: [
        { label: 'DDR4', perf: 1, cost: 1 }, { label: 'DDR5', perf: 1.5, cost: 1.2, requiresTech: 'ddr5' }, { label: 'DDR6', perf: 2.2, cost: 1.45, requiresTech: 'ddr6' }] },
      { key: 'cap', label: 'Kapasite', options: [
        { label: '16 GB', perf: 0.8, cost: 0.6 }, { label: '32 GB', perf: 1, cost: 1 }, { label: '64 GB', perf: 1.25, cost: 1.9, bomAdd: { memoryChip: 4 } }, { label: '128 GB', perf: 1.45, cost: 3.6, bomAdd: { memoryChip: 12 } }] },
      { key: 'speed', label: 'Hız Sınıfı', options: [
        { label: 'Standart', perf: 1, cost: 1 }, { label: 'Yüksek Frekans', perf: 1.12, cost: 1.12 }, { label: 'Overclock', perf: 1.22, cost: 1.25, power: 1.3 }] },
    ],
  },
  ssd: {
    id: 'ssd', name: 'Depolama (SSD/HDD)', sector: 'hardware', baseDemand: 22000, refPrice: 110, elasticity: 2.5, perfWeight: 1.1, annualGrowth: 0.06,
    basePerf: 100, basePower: 6, laborHours: 0.25, bom: { memoryChip: 5, logicChip: 0.2 },
    fields: [
      { key: 'iface', label: 'Arayüz', options: [
        { label: 'HDD (SATA)', perf: 0.4, cost: 0.5, bomAdd: { iron: 0.3 } }, { label: 'SATA SSD', perf: 1, cost: 1 }, { label: 'NVMe Gen4', perf: 1.6, cost: 1.15 }, { label: 'NVMe Gen5', perf: 2.2, cost: 1.3, requiresTech: 'pcie5' }] },
      { key: 'cap', label: 'Kapasite', options: [
        { label: '512 GB', perf: 0.8, cost: 0.6 }, { label: '1 TB', perf: 1, cost: 1 }, { label: '2 TB', perf: 1.15, cost: 1.8, bomAdd: { memoryChip: 5 } }, { label: '4 TB', perf: 1.3, cost: 3.2, bomAdd: { memoryChip: 15 } }] },
    ],
  },
  server: {
    id: 'server', name: 'Sunucu', sector: 'hardware', baseDemand: 900, refPrice: 6500, elasticity: 1.7, perfWeight: 1.4, annualGrowth: 0.12,
    basePerf: 100, basePower: 800, laborHours: 6, bom: { logicChip: 8, memoryChip: 64, iron: 3, copper: 2 }, dcInput: 'cloud', requiresTech: 'server_design',
    fields: [NODE_FIELD,
      { key: 'form', label: 'Form Faktörü', options: [
        { label: '1U Rack', perf: 0.8, cost: 0.8 }, { label: '2U Rack', perf: 1, cost: 1 }, { label: 'Blade', perf: 1.3, cost: 1.35 }, { label: 'AI Node', perf: 1.8, cost: 2.2, bomAdd: { logicChip: 8, memoryChip: 64 }, requiresTech: 'ai_accel' }] },
    ],
  },
  laptop: {
    id: 'laptop', name: 'Bilgisayar (Masaüstü/Dizüstü)', sector: 'hardware', baseDemand: 12000, refPrice: 1000, elasticity: 2.0, perfWeight: 1.2, annualGrowth: 0.02,
    basePerf: 100, basePower: 65, laborHours: 2, bom: { logicChip: 2, memoryChip: 8, battery: 1, display: 1, aluminum: 2 },
    fields: [NODE_FIELD, TIER_FIELD,
      { key: 'type', label: 'Tip', options: [
        { label: 'Masaüstü', perf: 1.1, cost: 0.9, power: 2.5 }, { label: 'Dizüstü', perf: 1, cost: 1 }, { label: 'İş İstasyonu', perf: 1.5, cost: 1.8, power: 3 }] },
    ],
  },
  smartphone: {
    id: 'smartphone', name: 'Akıllı Telefon', sector: 'mobile', baseDemand: 40000, refPrice: 650, elasticity: 2.1, perfWeight: 1.2, annualGrowth: 0.03,
    basePerf: 100, basePower: 5, laborHours: 0.8, bom: { logicChip: 1, memoryChip: 6, battery: 1, display: 1, aluminum: 1, gold: 0.05 },
    fields: [NODE_FIELD, TIER_FIELD,
      { key: 'camera', label: 'Kamera', options: [
        { label: 'Tekli', perf: 0.9, cost: 0.95 }, { label: 'Çift', perf: 1, cost: 1 }, { label: 'Üçlü Pro', perf: 1.15, cost: 1.12, quality: 5 }, { label: 'Periskop', perf: 1.25, cost: 1.22, quality: 8, requiresTech: 'optics' }] },
      { key: 'screen', label: 'Ekran', options: [
        { label: 'LCD', perf: 0.9, cost: 0.9 }, { label: 'OLED', perf: 1.05, cost: 1.05, quality: 5 }, { label: 'Katlanabilir', perf: 1.2, cost: 1.5, quality: 8, bomAdd: { display: 1 }, requiresTech: 'foldable' }] },
    ],
  },
  tablet: {
    id: 'tablet', name: 'Tablet', sector: 'mobile', baseDemand: 9000, refPrice: 500, elasticity: 2.2, perfWeight: 1.1, annualGrowth: 0.01,
    basePerf: 100, basePower: 8, laborHours: 0.8, bom: { logicChip: 1, memoryChip: 6, battery: 2, display: 1.5, aluminum: 1.2 },
    fields: [NODE_FIELD, TIER_FIELD],
  },
  wearable: {
    id: 'wearable', name: 'Giyilebilir Teknoloji', sector: 'mobile', baseDemand: 15000, refPrice: 250, elasticity: 2.4, perfWeight: 1.0, annualGrowth: 0.09,
    basePerf: 100, basePower: 1, laborHours: 0.4, bom: { logicChip: 0.3, memoryChip: 1, battery: 0.2, display: 0.2, aluminum: 0.2 }, requiresTech: 'wearables',
    fields: [TIER_FIELD,
      { key: 'sensors', label: 'Sensörler', options: [
        { label: 'Temel', perf: 0.9, cost: 0.9 }, { label: 'Sağlık', perf: 1.1, cost: 1.1, quality: 5 }, { label: 'Medikal Sınıf', perf: 1.3, cost: 1.35, quality: 10, requiresTech: 'biosensor' }] },
    ],
  },
};
export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];

// ─── Cloud ───────────────────────────────────────────────────────────────
export interface CloudDef { id: CloudServiceId; name: string; baseDemand: number; refPrice: number; elasticity: number; annualGrowth: number; inputCategory: CategoryId; unitsPerInput: number; energyPerUnit: number; requiresTech?: string }
export const CLOUD: Record<CloudServiceId, CloudDef> = {
  cloud: { id: 'cloud', name: 'Bulut Hesaplama & Depolama', baseDemand: 200000, refPrice: 6, elasticity: 1.8, annualGrowth: 0.18, inputCategory: 'server', unitsPerInput: 4, energyPerUnit: 0.004 },
  ai: { id: 'ai', name: 'AI Hesaplama (GPU Kiralama)', baseDemand: 150000, refPrice: 3, elasticity: 1.5, annualGrowth: 0.35, inputCategory: 'gpu', unitsPerInput: 1, energyPerUnit: 0.007, requiresTech: 'gpu_cloud' },
};

// ─── Platforms ───────────────────────────────────────────────────────────
export interface PlatformDef {
  id: PlatformCatId; name: string; sector: SectorId;
  addressable: number; // global potential users
  dauRatio: number; cpm: number; impressionsPerDau: number;
  premiumRate: number; refPremiumPrice: number;
  infraPerDau: number; // USD/day per DAU
  modPerUser: number; // USD/day per user at moderation 1
  viral: number; baseChurn: number;
  creatorRate: number;
  launchCost: number;
  requiresTech?: string;
}
export const PLATFORMS: Record<PlatformCatId, PlatformDef> = {
  video: { id: 'video', name: 'Video Paylaşım', sector: 'social', addressable: 2.4e9, dauRatio: 0.55, cpm: 9, impressionsPerDau: 12, premiumRate: 0.03, refPremiumPrice: 12, infraPerDau: 0.0045, modPerUser: 0.0006, viral: 0.012, baseChurn: 0.0025, creatorRate: 0.02, launchCost: 3_000_000 },
  photo: { id: 'photo', name: 'Fotoğraf Paylaşım', sector: 'social', addressable: 2.0e9, dauRatio: 0.6, cpm: 7, impressionsPerDau: 14, premiumRate: 0.01, refPremiumPrice: 5, infraPerDau: 0.0018, modPerUser: 0.0005, viral: 0.014, baseChurn: 0.0028, creatorRate: 0.05, launchCost: 1_500_000 },
  messaging: { id: 'messaging', name: 'Mesajlaşma', sector: 'social', addressable: 3.0e9, dauRatio: 0.8, cpm: 2, impressionsPerDau: 3, premiumRate: 0.02, refPremiumPrice: 4, infraPerDau: 0.0006, modPerUser: 0.0002, viral: 0.016, baseChurn: 0.0018, creatorRate: 0, launchCost: 1_000_000 },
  streaming: { id: 'streaming', name: 'Canlı Yayın', sector: 'social', addressable: 0.9e9, dauRatio: 0.35, cpm: 11, impressionsPerDau: 8, premiumRate: 0.06, refPremiumPrice: 9, infraPerDau: 0.006, modPerUser: 0.0007, viral: 0.011, baseChurn: 0.003, creatorRate: 0.03, launchCost: 2_500_000 },
  forum: { id: 'forum', name: 'Forum & Topluluk', sector: 'social', addressable: 0.8e9, dauRatio: 0.4, cpm: 5, impressionsPerDau: 10, premiumRate: 0.015, refPremiumPrice: 6, infraPerDau: 0.0008, modPerUser: 0.0008, viral: 0.01, baseChurn: 0.0022, creatorRate: 0.08, launchCost: 800_000 },
  music: { id: 'music', name: 'Müzik & Yayın Hizmeti', sector: 'social', addressable: 1.0e9, dauRatio: 0.45, cpm: 6, impressionsPerDau: 4, premiumRate: 0.25, refPremiumPrice: 10, infraPerDau: 0.002, modPerUser: 0.0001, viral: 0.009, baseChurn: 0.0024, creatorRate: 0.005, launchCost: 2_000_000 },
  os: { id: 'os', name: 'İşletim Sistemi', sector: 'software', addressable: 1.5e9, dauRatio: 0.7, cpm: 0, impressionsPerDau: 0, premiumRate: 0.3, refPremiumPrice: 8, infraPerDau: 0.0003, modPerUser: 0.00005, viral: 0.006, baseChurn: 0.001, creatorRate: 0.001, launchCost: 6_000_000, requiresTech: 'kernel' },
  aiApi: { id: 'aiApi', name: 'Yapay Zekâ Modeli & API', sector: 'software', addressable: 0.6e9, dauRatio: 0.4, cpm: 0, impressionsPerDau: 0, premiumRate: 0.12, refPremiumPrice: 20, infraPerDau: 0.02, modPerUser: 0.0003, viral: 0.02, baseChurn: 0.003, creatorRate: 0.01, launchCost: 5_000_000, requiresTech: 'llm' },
  gameEngine: { id: 'gameEngine', name: 'Oyun Motoru', sector: 'software', addressable: 0.05e9, dauRatio: 0.5, cpm: 0, impressionsPerDau: 0, premiumRate: 0.35, refPremiumPrice: 30, infraPerDau: 0.001, modPerUser: 0.0001, viral: 0.008, baseChurn: 0.0015, creatorRate: 0.2, launchCost: 2_000_000 },
  office: { id: 'office', name: 'Ofis Yazılımları', sector: 'software', addressable: 1.2e9, dauRatio: 0.5, cpm: 0, impressionsPerDau: 0, premiumRate: 0.2, refPremiumPrice: 10, infraPerDau: 0.0005, modPerUser: 0.00005, viral: 0.007, baseChurn: 0.0012, creatorRate: 0, launchCost: 1_500_000 },
  devTools: { id: 'devTools', name: 'Geliştirici Araçları', sector: 'software', addressable: 0.06e9, dauRatio: 0.6, cpm: 0, impressionsPerDau: 0, premiumRate: 0.3, refPremiumPrice: 25, infraPerDau: 0.002, modPerUser: 0.0001, viral: 0.012, baseChurn: 0.0018, creatorRate: 0.05, launchCost: 800_000 },
  security: { id: 'security', name: 'Siber Güvenlik', sector: 'software', addressable: 0.4e9, dauRatio: 0.3, cpm: 0, impressionsPerDau: 0, premiumRate: 0.4, refPremiumPrice: 15, infraPerDau: 0.0008, modPerUser: 0.0001, viral: 0.006, baseChurn: 0.0012, creatorRate: 0, launchCost: 1_200_000 },
};
export const PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformCatId[];

// ─── Sectors ─────────────────────────────────────────────────────────────
export interface SectorDef {
  id: SectorId; name: string; kind: SectorKind; description: string;
  foundingCost: number; icon: string;
  facilities: FacilityTypeId[];
  categories?: CategoryId[];
  platformCats?: PlatformCatId[];
  cloudServices?: CloudServiceId[];
}
export const SECTORS: Record<SectorId, SectorDef> = {
  mining: { id: 'mining', name: 'Madencilik & Hammadde', kind: 'extraction', icon: '⛏️', foundingCost: 500_000, facilities: ['mine'], description: 'Bakır, lityum, silikon, nadir toprak… çıkar ve küresel emtia piyasasına sat.' },
  semiconductor: { id: 'semiconductor', name: 'Yarı İletken & Bileşen', kind: 'processing', icon: '🔬', foundingCost: 1_000_000, facilities: ['waferPlant', 'memoryFab', 'logicFab', 'batteryPlant', 'displayPlant'], description: 'Wafer, mantık/bellek çipi, batarya ve ekran üret.' },
  hardware: { id: 'hardware', name: 'Bilgisayar Donanımı', kind: 'manufacturing', icon: '🖥️', foundingCost: 400_000, facilities: ['assemblyPlant'], categories: ['gpu', 'cpu', 'ram', 'ssd', 'laptop', 'server'], description: 'GPU, CPU, RAM, SSD, bilgisayar ve sunucu tasarla, üret, sat.' },
  mobile: { id: 'mobile', name: 'Mobil Cihazlar', kind: 'manufacturing', icon: '📱', foundingCost: 400_000, facilities: ['assemblyPlant'], categories: ['smartphone', 'tablet', 'wearable'], description: 'Akıllı telefon, tablet ve giyilebilir cihazlar.' },
  cloud: { id: 'cloud', name: 'Veri Merkezi & Bulut', kind: 'datacenter', icon: '☁️', foundingCost: 800_000, facilities: ['dataCenter'], cloudServices: ['cloud', 'ai'], description: 'Veri merkezleri kur; bulut ve AI hesaplama kapasitesi kirala.' },
  social: { id: 'social', name: 'Sosyal Medya', kind: 'platform', icon: '💬', foundingCost: 300_000, facilities: [], platformCats: ['video', 'photo', 'messaging', 'streaming', 'forum', 'music'], description: 'Platform kur; kullanıcı büyüt, reklam ve abonelikten gelir elde et.' },
  software: { id: 'software', name: 'Yazılım & Yapay Zekâ', kind: 'platform', icon: '🧠', foundingCost: 300_000, facilities: [], platformCats: ['os', 'aiApi', 'gameEngine', 'office', 'devTools', 'security'], description: 'İşletim sistemi, AI API, ofis, güvenlik yazılımları — abonelik geliri.' },
};
export const SECTOR_IDS = Object.keys(SECTORS) as SectorId[];

// ─── Tech tree ───────────────────────────────────────────────────────────
export interface TechEffect {
  /** multiplier on production efficiency (output per worker / defect reduction) */
  efficiency?: number;
  /** multiplier on mine extraction */
  extraction?: number;
  /** cost reduction 0-1 on materials */
  costReduction?: number;
  /** platform engagement bonus */
  engagement?: number;
  /** quality bonus (additive) */
  quality?: number;
  /** data-center energy efficiency (reduction) */
  dcEfficiency?: number;
}
export interface TechDef {
  id: string; name: string; sector: SectorId; cost: number; // research points
  prereq: string[]; description: string; effects?: TechEffect;
  /** contributes to category frontier performance */
  frontier?: { categories: CategoryId[]; mult: number };
}
export const TECHS: Record<string, TechDef> = {};
const T = (t: TechDef) => { TECHS[t.id] = t; };
// Mining
T({ id: 'mine_auto', name: 'Otonom Madencilik', sector: 'mining', cost: 600, prereq: [], description: '+20% çıkarım', effects: { extraction: 1.2 } });
T({ id: 'mine_refine', name: 'Gelişmiş Rafinasyon', sector: 'mining', cost: 900, prereq: ['mine_auto'], description: '+15% çıkarım, -10% işletme', effects: { extraction: 1.15, costReduction: 0.1 } });
T({ id: 'mine_deep', name: 'Derin Kazı', sector: 'mining', cost: 1600, prereq: ['mine_refine'], description: '+25% çıkarım', effects: { extraction: 1.25 } });
// Semiconductor
T({ id: 'fab_basic', name: 'Temel Litografi', sector: 'semiconductor', cost: 500, prereq: [], description: 'Mantık çipi fabrikası açılır' });
T({ id: 'node14', name: '14nm Süreç', sector: 'semiconductor', cost: 1200, prereq: ['fab_basic'], description: '14nm ürün tasarımı', frontier: { categories: ['gpu', 'cpu', 'server', 'laptop', 'smartphone', 'tablet'], mult: 1.45 } });
T({ id: 'node7', name: '7nm EUV Süreç', sector: 'semiconductor', cost: 3000, prereq: ['node14'], description: '7nm ürün tasarımı', frontier: { categories: ['gpu', 'cpu', 'server', 'laptop', 'smartphone', 'tablet'], mult: 1.45 } });
T({ id: 'node5', name: '5nm Süreç', sector: 'semiconductor', cost: 6500, prereq: ['node7'], description: '5nm ürün tasarımı', frontier: { categories: ['gpu', 'cpu', 'server', 'laptop', 'smartphone', 'tablet'], mult: 1.38 } });
T({ id: 'node3', name: '3nm GAA Süreç', sector: 'semiconductor', cost: 12000, prereq: ['node5'], description: '3nm ürün tasarımı', frontier: { categories: ['gpu', 'cpu', 'server', 'laptop', 'smartphone', 'tablet'], mult: 1.34 } });
T({ id: 'yield', name: 'Verim Optimizasyonu', sector: 'semiconductor', cost: 1500, prereq: ['fab_basic'], description: 'Fire -%30', effects: { efficiency: 1.3 } });
T({ id: 'packaging', name: 'İleri Paketleme', sector: 'semiconductor', cost: 2500, prereq: ['yield'], description: 'Maliyet -%8', effects: { costReduction: 0.08 } });
// Hardware
T({ id: 'ddr5', name: 'DDR5 Standardı', sector: 'hardware', cost: 700, prereq: [], description: 'DDR5 RAM', frontier: { categories: ['ram'], mult: 1.5 } });
T({ id: 'ddr6', name: 'DDR6 Standardı', sector: 'hardware', cost: 3500, prereq: ['ddr5'], description: 'DDR6 RAM', frontier: { categories: ['ram'], mult: 1.45 } });
T({ id: 'gddr7', name: 'GDDR7 Bellek', sector: 'hardware', cost: 1400, prereq: [], description: 'GDDR7 GPU belleği', frontier: { categories: ['gpu'], mult: 1.1 } });
T({ id: 'hbm', name: 'HBM Yığın Bellek', sector: 'hardware', cost: 4000, prereq: ['gddr7'], description: 'HBM3 GPU belleği', frontier: { categories: ['gpu'], mult: 1.15 } });
T({ id: 'pcie5', name: 'PCIe Gen5', sector: 'hardware', cost: 1200, prereq: [], description: 'NVMe Gen5 SSD', frontier: { categories: ['ssd'], mult: 1.35 } });
T({ id: 'chiplet', name: 'Chiplet Mimarisi', sector: 'hardware', cost: 2200, prereq: [], description: '24 çekirdek CPU', frontier: { categories: ['cpu'], mult: 1.12 } });
T({ id: 'server_design', name: 'Sunucu Tasarımı', sector: 'hardware', cost: 600, prereq: [], description: 'Sunucu kategorisi açılır' });
T({ id: 'ai_accel', name: 'AI Hızlandırıcı Düğüm', sector: 'hardware', cost: 3800, prereq: ['server_design'], description: 'AI Node sunucular', frontier: { categories: ['server'], mult: 1.2 } });
T({ id: 'lean_mfg', name: 'Yalın Üretim', sector: 'hardware', cost: 1000, prereq: [], description: 'Verim +20%', effects: { efficiency: 1.2 } });
T({ id: 'robot_line', name: 'Robotik Montaj Hattı', sector: 'hardware', cost: 2600, prereq: ['lean_mfg'], description: 'Verim +25%, maliyet -5%', effects: { efficiency: 1.25, costReduction: 0.05 } });
// Mobile
T({ id: 'optics', name: 'Periskop Optik', sector: 'mobile', cost: 1500, prereq: [], description: 'Periskop kamera', frontier: { categories: ['smartphone'], mult: 1.08 } });
T({ id: 'foldable', name: 'Katlanabilir Ekran', sector: 'mobile', cost: 3000, prereq: ['optics'], description: 'Katlanabilir telefon', frontier: { categories: ['smartphone'], mult: 1.1 } });
T({ id: 'wearables', name: 'Giyilebilir Platform', sector: 'mobile', cost: 800, prereq: [], description: 'Giyilebilir kategori açılır' });
T({ id: 'biosensor', name: 'Medikal Biyosensör', sector: 'mobile', cost: 2400, prereq: ['wearables'], description: 'Medikal sınıf sensör', frontier: { categories: ['wearable'], mult: 1.2 } });
T({ id: 'mob_lean', name: 'Mobil Seri Üretim', sector: 'mobile', cost: 1200, prereq: [], description: 'Verim +20%', effects: { efficiency: 1.2 } });
// Cloud
T({ id: 'gpu_cloud', name: 'GPU Bulut Platformu', sector: 'cloud', cost: 900, prereq: [], description: 'AI hesaplama hizmeti açılır' });
T({ id: 'liquid_cool', name: 'Sıvı Soğutma', sector: 'cloud', cost: 1600, prereq: [], description: 'Enerji -%25', effects: { dcEfficiency: 0.25 } });
T({ id: 'dc_orchestr', name: 'Konteyner Orkestrasyonu', sector: 'cloud', cost: 2200, prereq: ['liquid_cool'], description: 'Enerji -%15, kalite +5', effects: { dcEfficiency: 0.15, quality: 5 } });
// Social
T({ id: 'algo_feed', name: 'Algoritmik Akış', sector: 'social', cost: 700, prereq: [], description: 'Etkileşim +10%', effects: { engagement: 0.1 } });
T({ id: 'short_video', name: 'Kısa Video Formatı', sector: 'social', cost: 1500, prereq: ['algo_feed'], description: 'Etkileşim +12%', effects: { engagement: 0.12 } });
T({ id: 'ai_moderation', name: 'AI Moderasyon', sector: 'social', cost: 1800, prereq: ['algo_feed'], description: 'Moderasyon maliyeti -40%', effects: { costReduction: 0.4 } });
// Software
T({ id: 'kernel', name: 'Çekirdek Geliştirme', sector: 'software', cost: 1500, prereq: [], description: 'İşletim sistemi platformu açılır' });
T({ id: 'llm', name: 'Büyük Dil Modelleri', sector: 'software', cost: 2000, prereq: [], description: 'AI API platformu açılır' });
T({ id: 'agents', name: 'Otonom AI Ajanları', sector: 'software', cost: 5000, prereq: ['llm'], description: 'Etkileşim +15%', effects: { engagement: 0.15 } });
T({ id: 'zero_trust', name: 'Sıfır Güven Mimarisi', sector: 'software', cost: 1600, prereq: [], description: 'Kalite +6', effects: { quality: 6 } });

export const MANAGER_ROLE_INFO: Record<string, { title: string; effect: string }> = {
  CEO: { title: 'Genel Müdür', effect: 'Genel verimlilik; otomatik yönetim için gerekli' },
  CFO: { title: 'Finans Direktörü', effect: 'Kredi faizini ve vergi yükünü düşürür' },
  CTO: { title: 'Teknoloji Direktörü', effect: 'Ar-Ge hızını artırır' },
  COO: { title: 'Operasyon Direktörü', effect: 'Üretim verimini artırır, fireyi azaltır' },
  CMO: { title: 'Pazarlama Direktörü', effect: 'Pazarlama etkinliği ve marka büyümesi' },
  CHRO: { title: 'İK Direktörü', effect: 'Moral ve maaş maliyeti' },
  CPO: { title: 'Ürün Direktörü', effect: 'Ürün kalitesi ve platform özellikleri' },
};

export const DIFFICULTY: Record<string, { label: string; cash: number; debt: number; aiBoost: number }> = {
  easy: { label: 'Kolay', cash: 25_000_000, debt: 0, aiBoost: 0.85 },
  normal: { label: 'Normal', cash: 12_000_000, debt: 3_000_000, aiBoost: 1 },
  hard: { label: 'Zor', cash: 6_000_000, debt: 4_000_000, aiBoost: 1.2 },
};
