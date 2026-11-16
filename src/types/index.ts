// ─── Core entity types ────────────────────────────────────────────────────────

export type VerificationLevel = 'official' | 'multiple-sources' | 'secondary' | 'unverified';
export type Locale = 'en' | 'hi';
export type DeviceStatus = 'available' | 'discontinued' | 'announced' | 'rumored' | 'cancelled';

// ─── Image ───────────────────────────────────────────────────────────────────

export type ImageType =
  | 'front' | 'rear' | 'side' | 'top' | 'bottom'
  | 'gallery' | 'packaging' | 'internal' | 'motherboard'
  | 'pinout' | 'block-diagram' | 'architecture' | 'exploded'
  | 'technical' | 'datasheet' | 'lifestyle' | 'placeholder';

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: ImageType;
  alt: string;
  sourceUrl?: string;
  sourceName?: string;
  license?: string;
  licenseUrl?: string;
  attribution?: string;
  width?: number;
  height?: number;
  verificationStatus: VerificationLevel;
  retrievedAt?: string;
}

// ─── Source reference ─────────────────────────────────────────────────────────

export interface SourceRef {
  provider: string;
  url: string;
  retrievedAt: string;
  license?: string;
  attribution?: string;
  verificationLevel: VerificationLevel;
}

// ─── Brand ───────────────────────────────────────────────────────────────────

export interface Brand {
  id: string;             // brd-000001
  slug: string;
  name: string;
  aliases: string[];
  website?: string;
  headquarters?: string;
  logoUrl?: string;
  description: string;
  productCategories: string[];
  founded?: string;
  sources: SourceRef[];
  updatedAt: string;
  schemaVersion: number;
}

// ─── Device (Consumer Electronics & Computing Hardware) ───────────────────────

export type DeviceCategory =
  | 'smartphone' | 'tablet' | 'laptop' | 'desktop' | 'workstation'
  | 'mini-pc' | 'all-in-one' | 'gaming-console' | 'smartwatch'
  | 'headphones' | 'earbuds' | 'tv' | 'monitor' | 'camera'
  | 'router' | 'storage' | 'printer' | 'gpu' | 'other';

export interface DeviceVariant {
  id: string;
  name: string;
  region?: string;
  storageOptions?: string[];
  colorOptions?: string[];
  ramOptions?: string[];
}

export interface AffiliateLink {
  retailerId: string;
  retailerName: string;
  country: string;
  currency: string;
  price?: number;
  priceLastChecked?: string;
  productUrl: string;
  affiliateUrl: string;
  condition: 'new' | 'refurbished' | 'used';
  inStock?: boolean;
}

export interface Device {
  id: string;             // dev-000001
  slug: string;
  name: string;
  brand: string;          // brand id
  brandName: string;
  category: DeviceCategory;
  subcategory?: string;
  status: DeviceStatus;
  announcedAt?: string;
  releasedAt?: string;
  discontinuedAt?: string;
  description: string;
  images: ProductImage[];
  specs: Record<string, unknown>;  // category-specific, see schemas/specs/
  keyFeatures: string[];
  variants: DeviceVariant[];
  affiliateLinks: AffiliateLink[];
  relatedIds: string[];
  predecessorId?: string;
  successorId?: string;
  tags: string[];
  sources: SourceRef[];
  verificationLevel: VerificationLevel;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

// ─── Spec schemas per category ────────────────────────────────────────────────

export interface SmartphoneSpecs {
  display: {
    technology: string;
    size: string;
    resolution: string;
    refreshRate: string;
    brightness?: string;
    protection?: string;
  };
  processor: {
    name: string;
    manufacturer: string;
    architecture?: string;
    cores?: string;
    gpu?: string;
    npu?: string;
    process?: string;
  };
  memory: { ram: string; storage: string; expandable?: boolean };
  battery: { capacity: string; chargingSpeed?: string; wirelessCharging?: string };
  camera: {
    main?: string;
    ultrawide?: string;
    telephoto?: string;
    front?: string;
    video?: string;
  };
  os: { name: string; version?: string; updateSupport?: string };
  connectivity: {
    cellular?: string;
    wifi?: string;
    bluetooth?: string;
    nfc?: boolean;
    usb?: string;
  };
  sensors: string[];
  dimensions: { height: string; width: string; depth: string; weight: string };
  colors?: string[];
}

export interface LaptopSpecs {
  processor: {
    name: string;
    manufacturer: string;
    cores?: string;
    architecture?: string;
    tdp?: string;
  };
  memory: {
    ram: string;
    ramType?: string;
    maxRam?: string;
    storage: string;
    storageType?: string;
    additionalSlots?: string;
  };
  display: {
    size: string;
    resolution: string;
    technology: string;
    refreshRate?: string;
    brightness?: string;
    colorGamut?: string;
    touchscreen?: boolean;
  };
  gpu?: {
    integrated?: string;
    discrete?: string;
    vram?: string;
  };
  battery: { capacity: string; life?: string; chargingSpeed?: string };
  ports: string[];
  wireless: { wifi: string; bluetooth: string; lte?: boolean };
  keyboard: { backlit?: boolean; layout?: string; numpad?: boolean };
  webcam?: string;
  audio?: string;
  dimensions: { height?: string; width: string; depth: string; weight: string };
  os: string;
  upgradeability: { ram: string; storage: string };
}

export interface CpuSpecs {
  architecture: string;
  generation: string;
  coreCount: number;
  threadCount: number;
  baseClock: string;
  boostClock?: string;
  cache: { l1?: string; l2?: string; l3?: string };
  tdp: string;
  socket: string;
  process: string;
  memorySupport: string;
  pcieLanes?: string;
  integratedGraphics?: string;
  eccSupport?: boolean;
  releaseDate?: string;
  msrp?: string;
  features: string[];
}

export interface GpuSpecs {
  architecture: string;
  generation: string;
  vram: string;
  vramType: string;
  memoryBandwidth?: string;
  coreClock?: string;
  boostClock?: string;
  computeUnits?: number;
  shaderProcessors?: number;
  tdp: string;
  busInterface?: string;
  ports: string[];
  apiSupport: string[];
  resolution?: string;
  releaseDate?: string;
  msrp?: string;
  features: string[];
}

// ─── Electronic Component ─────────────────────────────────────────────────────

export type ComponentCategory =
  | 'resistor' | 'capacitor' | 'inductor' | 'diode' | 'transistor'
  | 'mosfet' | 'bjt' | 'ic' | 'microcontroller' | 'microprocessor'
  | 'sensor' | 'relay' | 'connector' | 'oscillator' | 'regulator'
  | 'opamp' | 'logic-gate' | 'memory' | 'rf' | 'module' | 'other';

export interface ElectronicComponent {
  id: string;             // cmp-000001
  slug: string;
  name: string;
  commonNames: string[];
  manufacturerName: string;
  partNumber: string;
  category: ComponentCategory;
  subcategory?: string;
  description: string;
  specs: Record<string, string | number | boolean | null>;
  packageType?: string;
  dimensions?: string;
  pinCount?: number;
  pinout?: { pin: string | number; name: string; description?: string }[];
  electricalChars: Record<string, string>;
  operatingPrinciple?: string;
  applications: string[];
  equivalentParts?: string[];
  images: ProductImage[];
  datasheetUrl?: string;
  manufacturerUrl?: string;
  safetyNotes?: string[];
  sources: SourceRef[];
  verificationLevel: VerificationLevel;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

// ─── Technology ───────────────────────────────────────────────────────────────

export interface Technology {
  id: string;             // tech-000001
  slug: string;
  name: string;
  acronym?: string;
  category: string;
  description: string;
  fullDescription: string;
  origin?: string;
  yearIntroduced?: number;
  status: 'active' | 'legacy' | 'emerging' | 'experimental';
  advantages: string[];
  limitations: string[];
  applications: string[];
  relatedTechIds: string[];
  images: ProductImage[];
  sources: SourceRef[];
  updatedAt: string;
  schemaVersion: number;
}

// ─── Article / Tutorial ───────────────────────────────────────────────────────

export type ArticleType = 'guide' | 'tutorial' | 'explainer' | 'comparison' | 'news' | 'reference';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface Article {
  id: string;             // art-000001
  slug: string;
  title: string;
  type: ArticleType;
  difficulty?: DifficultyLevel;
  summary: string;
  content: string;        // Markdown
  relatedDeviceIds: string[];
  relatedTechIds: string[];
  tags: string[];
  author?: string;
  publishedAt: string;
  updatedAt: string;
  sources: SourceRef[];
  schemaVersion: number;
}

// ─── Troubleshooting ──────────────────────────────────────────────────────────

export interface TroubleshootingGuide {
  id: string;             // fix-000001
  slug: string;
  title: string;
  deviceCategory: string;
  problem: string;
  symptoms: string[];
  possibleCauses: string[];
  safetyWarnings: string[];
  steps: {
    id: string;
    description: string;
    expectedResult?: string;
    nextIfYes?: string;
    nextIfNo?: string;
    action?: 'info' | 'check' | 'fix' | 'professional';
  }[];
  tools?: string[];
  difficulty: 'easy' | 'moderate' | 'advanced' | 'professional-only';
  relatedDeviceIds: string[];
  sources: SourceRef[];
  updatedAt: string;
  schemaVersion: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export type SearchResultType = 'device' | 'component' | 'brand' | 'technology' | 'article' | 'troubleshooting';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  imageUrl?: string;
  category?: string;
  score?: number;
  tags?: string[];
}

// ─── Comparison ───────────────────────────────────────────────────────────────

export interface ComparisonItem {
  id: string;
  type: 'device' | 'component';
  name: string;
  imageUrl?: string;
  specs: Record<string, string | number | boolean | null | undefined>;
  url: string;
}

// ─── Platform metadata ────────────────────────────────────────────────────────

export interface PlatformStats {
  deviceCount: number;
  componentCount: number;
  brandCount: number;
  technologyCount: number;
  articleCount: number;
  lastUpdated: string;
}
