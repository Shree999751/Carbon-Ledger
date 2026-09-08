export type CountryCode = 'UK' | 'US' | 'DE' | 'FR' | 'IN' | 'JP' | 'AU' | 'CA';

export interface RegionalFactors {
  grid: number; // kg CO2e / kWh
  gas: number;  // kg CO2e / kWh
  diesel: number; // kg CO2e / L
  petrol: number; // kg CO2e / L
}

export interface Scope1ItemRow {
  id: string;
  name: string;
  fuelType?: string;
  subType?: string;
  unit: string;
  activity: number | '';
  ef: number | '';
  gwp?: number;
  status?: 'verified' | 'provisional';
}

export interface Scope2ItemRow {
  id: string;
  name: string;
  subType?: 'location' | 'market' | 'steam' | 'heat' | 'cool' | 'custom';
  unit: string;
  activity: number | '';
  ef: number | '';
  status?: 'verified' | 'provisional' | 'reference';
}

export interface Scope1Inputs {
  naturalGasKwh: number | '';
  naturalGasUnit: string;
  mobileDieselL: number | '';
  mobileUnit: string;
  refrigerantKg: number | '';
  refrigerantType: string;
  refrigerantGwp: number;
  processEmissionsKg: number | '';
  processEf: number | '';
  otherAct: number | '';
  otherEf: number | '';
  otherName: string;
  stationaryRows?: Scope1ItemRow[];
  mobileRows?: Scope1ItemRow[];
  refrigerantRows?: Scope1ItemRow[];
  processRows?: Scope1ItemRow[];
  otherRows?: Scope1ItemRow[];
}

export interface Scope2Inputs {
  electricityLocKwh: number | '';
  electricityMktKwh: number | '';
  electricityMktEf: number | '';
  steamKwh: number | '';
  heatKwh: number | '';
  coolKwh: number | '';
  electricityRows?: Scope2ItemRow[];
  districtEnergyRows?: Scope2ItemRow[];
}

export interface Scope3CategoryInput {
  id: number | string;
  name: string;
  type: 'upstream' | 'downstream';
  unit: string;
  activity: number | '';
  ef: number; // kg CO2e / unit
  status: 'verified' | 'provisional';
}

export interface OrganizationSetup {
  orgName: string;
  country: CountryCode;
  region: string;
  industry: string;
  reportingYear: string;
  accountingStandard: 'GHG Protocol Corporate Standard' | 'ISO 14064-1:2018' | 'PCAF (financed emissions)';
  boundary: '' | 'Operational Control' | 'Financial Control' | 'Equity Share';
  gwpBasis: 'AR5' | 'AR4' | 'AR6';
  frameworks: string[];
  revenue: number | '';
  fte: number | '';
  floorArea: number | '';
}

export interface PeerBenchmark {
  id: string;
  name: string;
  value: number;
  note?: string;
}

export interface DecarbonizationLevers {
  renewableElectricityPct: number;
  evFleetPct: number;
  travelOptimizationPct: number;
}

export interface CalculatedInventory {
  scope1: {
    naturalGasT: number;
    mobileDieselT: number;
    refrigerantT: number;
    processT: number;
    otherT: number;
    totalT: number;
  };
  scope2: {
    locationTotalT: number;
    marketTotalT: number;
    hasMarketBased: boolean;
    headlineT: number;
  };
  scope3: {
    categories: Array<{
      id: number;
      name: string;
      activity: number;
      unit: string;
      ef: number;
      tco2e: number;
      status: 'verified' | 'provisional';
    }>;
    totalT: number;
  };
  totalReportableT: number;
  totalProvisionalT: number;
  grandTotalT: number;
  intensity: {
    perRevenue: number | null; // kg / €1,000
    perFte: number | null;     // tCO2e / FTE
    perFloorArea: number | null; // kg / m2
  };
}
