import {
  OrganizationSetup,
  Scope1Inputs,
  Scope2Inputs,
  Scope3CategoryInput,
  CalculatedInventory,
} from '../types/ghg';
import { REGIONAL_EMISSION_FACTORS } from '../data/emissionFactors';

export function calculateInventory(
  setup: OrganizationSetup,
  s1: Scope1Inputs,
  s2: Scope2Inputs,
  s3: Scope3CategoryInput[]
): CalculatedInventory {
  const ef = REGIONAL_EMISSION_FACTORS[setup.country] || REGIONAL_EMISSION_FACTORS.UK;

  // Scope 1 calculations (multi-row aware with legacy fallback)
  const naturalGasT = s1.stationaryRows && s1.stationaryRows.length > 0
    ? s1.stationaryRows.reduce((sum, r) => {
        const factor = r.ef !== '' ? Number(r.ef) : ef.gas;
        return sum + (Number(r.activity || 0) * factor) / 1000;
      }, 0)
    : s1.naturalGasKwh !== '' ? (Number(s1.naturalGasKwh) * ef.gas) / 1000 : 0;

  const mobileDieselT = s1.mobileRows && s1.mobileRows.length > 0
    ? s1.mobileRows.reduce((sum, r) => {
        const factor = r.ef !== '' ? Number(r.ef) : ef.diesel;
        return sum + (Number(r.activity || 0) * factor) / 1000;
      }, 0)
    : s1.mobileDieselL !== '' ? (Number(s1.mobileDieselL) * ef.diesel) / 1000 : 0;

  const refrigerantT = s1.refrigerantRows && s1.refrigerantRows.length > 0
    ? s1.refrigerantRows.reduce((sum, r) => {
        const gwp = r.gwp ? Number(r.gwp) : 1300;
        return sum + (Number(r.activity || 0) * gwp) / 1000;
      }, 0)
    : s1.refrigerantKg !== '' ? (Number(s1.refrigerantKg) * Number(s1.refrigerantGwp || 1300)) / 1000 : 0;

  const processT = s1.processRows && s1.processRows.length > 0
    ? s1.processRows.reduce((sum, r) => sum + (Number(r.activity || 0) * Number(r.ef || 0)) / 1000, 0)
    : (s1.processEmissionsKg !== '' && s1.processEf !== '')
      ? (Number(s1.processEmissionsKg) * Number(s1.processEf)) / 1000
      : 0;

  const otherT = s1.otherRows && s1.otherRows.length > 0
    ? s1.otherRows.reduce((sum, r) => sum + (Number(r.activity || 0) * Number(r.ef || 0)) / 1000, 0)
    : (s1.otherAct !== '' && s1.otherEf !== '')
      ? (Number(s1.otherAct) * Number(s1.otherEf)) / 1000
      : 0;

  const s1TotalT = naturalGasT + mobileDieselT + refrigerantT + processT + otherT;

  // Scope 2 calculations (multi-row aware with legacy fallback)
  let locElectricityT = 0;
  let mktElectricityT = 0;
  let hasMarketBased = false;

  if (s2.electricityRows && s2.electricityRows.length > 0) {
    s2.electricityRows.forEach((r) => {
      const act = Number(r.activity || 0);
      if (r.subType === 'market') {
        hasMarketBased = true;
        mktElectricityT += (act * Number(r.ef || 0)) / 1000;
      } else {
        locElectricityT += (act * ef.grid) / 1000;
      }
    });
  } else {
    locElectricityT = s2.electricityLocKwh !== '' ? (Number(s2.electricityLocKwh) * ef.grid) / 1000 : 0;
    hasMarketBased = s2.electricityMktKwh !== '';
    mktElectricityT = hasMarketBased ? (Number(s2.electricityMktKwh) * Number(s2.electricityMktEf || 0)) / 1000 : 0;
  }

  let steamT = 0;
  let heatT = 0;
  let coolT = 0;

  if (s2.districtEnergyRows && s2.districtEnergyRows.length > 0) {
    s2.districtEnergyRows.forEach((r) => {
      const act = Number(r.activity || 0);
      const factor = r.ef !== '' ? Number(r.ef) : 0.183;
      if (r.subType === 'cool') {
        coolT += (act * factor) / 1000;
      } else if (r.subType === 'heat') {
        heatT += (act * factor) / 1000;
      } else {
        steamT += (act * factor) / 1000;
      }
    });
  } else {
    steamT = s2.steamKwh !== '' ? (Number(s2.steamKwh) * 0.183) / 1000 : 0;
    heatT = s2.heatKwh !== '' ? (Number(s2.heatKwh) * 0.183) / 1000 : 0;
    coolT = s2.coolKwh !== '' ? (Number(s2.coolKwh) * 0.150) / 1000 : 0;
  }

  const districtTotalT = steamT + heatT + coolT;
  const locationTotalT = locElectricityT + districtTotalT;
  const marketTotalT = mktElectricityT + districtTotalT;
  const headlineT = hasMarketBased ? marketTotalT : 0;

  // Scope 3 calculations
  const evaluatedS3 = s3.map(cat => {
    const act = cat.activity !== '' ? Number(cat.activity) : 0;
    const tco2e = (act * cat.ef) / 1000;
    return {
      id: typeof cat.id === 'number' ? cat.id : Number(cat.id) || 0,
      name: cat.name,
      activity: act,
      unit: cat.unit,
      ef: cat.ef,
      tco2e,
      status: cat.status,
    };
  });

  const s3TotalT = evaluatedS3.reduce((sum, item) => sum + item.tco2e, 0);

  // Totals
  const totalReportableT = s1TotalT + (hasMarketBased ? marketTotalT : 0);
  const totalProvisionalT = s3TotalT;
  const grandTotalT = totalReportableT + totalProvisionalT;

  // Intensity Metrics
  const rev = setup.revenue !== '' ? Number(setup.revenue) : 0;
  const fte = setup.fte !== '' ? Number(setup.fte) : 0;
  const area = setup.floorArea !== '' ? Number(setup.floorArea) : 0;

  const perRevenue = (rev > 0 && grandTotalT > 0) ? (grandTotalT * 1000 / rev) * 1000 : null; // kg / €1,000
  const perFte = (fte > 0 && grandTotalT > 0) ? grandTotalT / fte : null;                     // tCO2e / FTE
  const perFloorArea = (area > 0 && grandTotalT > 0) ? (grandTotalT * 1000) / area : null;     // kg / m2

  return {
    scope1: {
      naturalGasT,
      mobileDieselT,
      refrigerantT,
      processT,
      otherT,
      totalT: s1TotalT,
    },
    scope2: {
      locationTotalT,
      marketTotalT,
      hasMarketBased,
      headlineT,
    },
    scope3: {
      categories: evaluatedS3,
      totalT: s3TotalT,
    },
    totalReportableT,
    totalProvisionalT,
    grandTotalT,
    intensity: {
      perRevenue,
      perFte,
      perFloorArea,
    },
  };
}
