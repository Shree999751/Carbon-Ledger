import { OrganizationSetup, Scope1Inputs, Scope2Inputs, Scope3CategoryInput } from '../types/ghg';
import { DEFAULT_SCOPE3_CATEGORIES } from './emissionFactors';

export const SAMPLE_ORG_SETUP: OrganizationSetup = {
  orgName: 'Your Organization',
  country: 'UK',
  region: 'Greater London',
  industry: 'Manufacturing',
  reportingYear: '2026',
  currency: 'GBP',
  accountingStandard: 'GHG Protocol Corporate Standard',
  boundary: '', // Left blank initially as draft alert
  gwpBasis: 'AR5',
  frameworks: ['CSRD', 'CDP'],
  revenue: 20000000,
  fte: 160,
  floorArea: 8500,
};

export const SAMPLE_SCOPE1: Scope1Inputs = {
  naturalGasKwh: 120000,
  naturalGasUnit: 'kWh',
  mobileDieselL: 4500,
  mobileUnit: 'L',
  refrigerantKg: 45,
  refrigerantType: 'HFC-134a',
  refrigerantGwp: 1300,
  processEmissionsKg: '',
  processEf: '',
  otherAct: '',
  otherEf: '',
  otherName: '',
};

export const SAMPLE_SCOPE2: Scope2Inputs = {
  electricityLocKwh: 450000,
  electricityMktKwh: 450000,
  electricityMktEf: 0, // Green tariff / REGO certified zero carbon
  steamKwh: '',
  heatKwh: '',
  coolKwh: '',
};

export const getSampleScope3 = (): Scope3CategoryInput[] => {
  return DEFAULT_SCOPE3_CATEGORIES.map(cat => {
    if (cat.id === 1) return { ...cat, activity: 250000 };
    if (cat.id === 2) return { ...cat, activity: 180000 };
    return { ...cat, activity: '' };
  });
};
