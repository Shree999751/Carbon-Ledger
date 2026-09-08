import { CountryCode, RegionalFactors, Scope3CategoryInput } from '../types/ghg';

export const REGIONAL_EMISSION_FACTORS: Record<CountryCode, RegionalFactors> = {
  UK: {
    grid: 0.1294, // UK DESNZ/DEFRA 2026 Grid Electricity
    gas: 0.2022,  // UK Natural Gas gross CV
    diesel: 2.5835, // UK 100% Mineral Diesel
    petrol: 2.1600, // UK Petrol
  },
  US: {
    grid: 0.3710, // US EPA eGRID National Average
    gas: 0.1810,  // US EPA GHG Hub
    diesel: 2.6900,
    petrol: 2.3100,
  },
  DE: {
    grid: 0.3800, // German Grid Mix (UBA)
    gas: 0.2010,
    diesel: 2.6100,
    petrol: 2.1800,
  },
  FR: {
    grid: 0.0520, // RTE France (Nuclear/Hydro weighted)
    gas: 0.2020,
    diesel: 2.5900,
    petrol: 2.1700,
  },
  IN: {
    grid: 0.7100, // CEA India CO2 Baseline Database
    gas: 0.2050,
    diesel: 2.6800,
    petrol: 2.2900,
  },
  JP: {
    grid: 0.4500, // MOE Japan
    gas: 0.2030,
    diesel: 2.5800,
    petrol: 2.2200,
  },
  AU: {
    grid: 0.6800, // National Greenhouse Accounts Australia
    gas: 0.1980,
    diesel: 2.6800,
    petrol: 2.2800,
  },
  CA: {
    grid: 0.1200, // Environment and Climate Change Canada (Hydro heavy)
    gas: 0.1850,
    diesel: 2.6800,
    petrol: 2.2900,
  },
};

export const REFRIGERANT_GWP_FACTORS = [
  { label: 'HFC-134a (GWP 1,300)', gwp: 1300, gas: 'HFC-134a' },
  { label: 'R-410A (GWP 1,924)', gwp: 1924, gas: 'R-410A' },
  { label: 'R-404A (GWP 3,943)', gwp: 3943, gas: 'R-404A' },
  { label: 'R-32 (GWP 677)', gwp: 677, gas: 'R-32' },
  { label: 'R-407C (GWP 1,624)', gwp: 1624, gas: 'R-407C' },
  { label: 'Carbon Dioxide (GWP 1)', gwp: 1, gas: 'CO2' },
];

export const DEFAULT_SCOPE3_CATEGORIES: Scope3CategoryInput[] = [
  { id: 1, name: '1. Purchased Goods & Services', type: 'upstream', unit: 'EUR', activity: '', ef: 0.201, status: 'provisional' },
  { id: 2, name: '2. Capital Goods', type: 'upstream', unit: 'EUR', activity: '', ef: 0.157, status: 'provisional' },
  { id: 3, name: '3. Fuel- & Energy-Related Activities', type: 'upstream', unit: 'EUR', activity: '', ef: 0.150, status: 'provisional' },
  { id: 4, name: '4. Upstream Transportation & Distribution', type: 'upstream', unit: 'EUR', activity: '', ef: 0.120, status: 'provisional' },
  { id: 5, name: '5. Waste Generated in Operations', type: 'upstream', unit: 'tonnes', activity: '', ef: 450.0, status: 'provisional' },
  { id: 6, name: '6. Business Travel', type: 'upstream', unit: 'km', activity: '', ef: 0.150, status: 'provisional' },
  { id: 7, name: '7. Employee Commuting', type: 'upstream', unit: 'km', activity: '', ef: 0.090, status: 'provisional' },
  { id: 8, name: '8. Upstream Leased Assets', type: 'upstream', unit: 'EUR', activity: '', ef: 0.100, status: 'provisional' },
  { id: 9, name: '9. Downstream Transportation & Distribution', type: 'downstream', unit: 'EUR', activity: '', ef: 0.120, status: 'provisional' },
  { id: 10, name: '10. Processing of Sold Products', type: 'downstream', unit: 'EUR', activity: '', ef: 0.180, status: 'provisional' },
  { id: 11, name: '11. Use of Sold Products', type: 'downstream', unit: 'EUR', activity: '', ef: 0.220, status: 'provisional' },
  { id: 12, name: '12. End-of-Life Treatment of Sold Products', type: 'downstream', unit: 'tonnes', activity: '', ef: 320.0, status: 'provisional' },
  { id: 13, name: '13. Downstream Leased Assets', type: 'downstream', unit: 'EUR', activity: '', ef: 0.100, status: 'provisional' },
  { id: 14, name: '14. Franchises', type: 'downstream', unit: 'EUR', activity: '', ef: 0.140, status: 'provisional' },
  { id: 15, name: '15. Investments (PCAF / Financed)', type: 'downstream', unit: 'EUR', activity: '', ef: 0.080, status: 'provisional' },
];
