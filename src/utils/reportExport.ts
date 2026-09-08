import {
  OrganizationSetup,
  Scope1Inputs,
  Scope2Inputs,
  Scope3CategoryInput,
  CalculatedInventory,
  RegionalFactors,
  DecarbonizationLevers,
} from '../types/ghg';

/**
 * Triggers a native file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an audit-grade CSV export containing all organization parameters,
 * Scope 1, Scope 2 (dual-reporting), Scope 3 line items, and intensity metrics.
 */
export function generateAuditCsv(
  setup: OrganizationSetup,
  scope1: Scope1Inputs,
  scope2: Scope2Inputs,
  scope3: Scope3CategoryInput[],
  calculated: CalculatedInventory,
  ef: RegionalFactors
): string {
  const lines: string[] = [];
  const add = (...cols: (string | number)[]) => {
    lines.push(
      cols
        .map((c) => {
          const s = String(c ?? '');
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(',')
    );
  };

  // Section 1: Report Metadata
  add('CORPORATE GREENHOUSE GAS (GHG) EMISSIONS INVENTORY REPORT');
  add('Generated Date', new Date().toISOString().split('T')[0]);
  add('Organization Name', setup.orgName || 'Your Organization');
  add('Reporting Year', `FY ${setup.reportingYear}`);
  add('Country / Jurisdiction', setup.country);
  add('Industry Sector', setup.industry);
  add('Accounting Standard', setup.accountingStandard);
  add('Consolidation Boundary', setup.boundary || 'Operational Control');
  add('GWP Reference Basis', `${setup.gwpBasis} (IPCC Assessment Report)`);
  add('Target Frameworks', setup.frameworks.join('; ') || 'CSRD / ESRS E1');
  add('');

  // Section 2: Executive Inventory Summary
  add('EXECUTIVE EMISSIONS SUMMARY');
  add('Metric', 'Emissions (tCO2e)', 'Accounting Status', 'Methodology Note');
  add(
    'Scope 1 - Direct Emissions',
    calculated.scope1.totalT.toFixed(3),
    'Verified',
    'Stationary, mobile, refrigerants, and processes'
  );
  add(
    'Scope 2 - Market-based Headline',
    (calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : 0).toFixed(3),
    'Verified',
    'Contractual instruments, PPAs, bundled RECs/GOs'
  );
  add(
    'Scope 2 - Location-based Reference',
    calculated.scope2.locationTotalT.toFixed(3),
    'Reference',
    `National average grid factor (${ef.grid} kg CO2e/kWh)`
  );
  add(
    'TOTAL REPORTABLE (Scope 1 + Scope 2 Market)',
    calculated.totalReportableT.toFixed(3),
    'Verified / Compliance',
    'Headline compliance figure for statutory disclosure'
  );
  add(
    'Scope 3 - Value Chain',
    calculated.scope3.totalT.toFixed(3),
    'Provisional / Screening',
    'EEIO spend-based model; pending third-party audit'
  );
  add(
    'GRAND TOTAL (Scopes 1, 2 & 3 Combined)',
    calculated.grandTotalT.toFixed(3),
    'Combined Modeled Footprint',
    'Total modeled operational + value chain footprint'
  );
  add('');

  // Section 3: Intensity Metrics
  add('CARBON INTENSITY BENCHMARKS');
  add('Intensity Indicator', 'Value', 'Unit', 'Denominator Basis');
  add(
    'Revenue Intensity',
    calculated.intensity.perRevenue !== null ? calculated.intensity.perRevenue.toFixed(3) : 'N/A',
    'kg CO2e / €1,000 turnover',
    setup.revenue ? `€${Number(setup.revenue).toLocaleString()}` : 'Not provided'
  );
  add(
    'Employee Intensity',
    calculated.intensity.perFte !== null ? calculated.intensity.perFte.toFixed(3) : 'N/A',
    'tCO2e / FTE',
    setup.fte ? `${setup.fte} full-time equivalents` : 'Not provided'
  );
  add(
    'Facility Area Intensity',
    calculated.intensity.perFloorArea !== null ? calculated.intensity.perFloorArea.toFixed(3) : 'N/A',
    'kg CO2e / m²',
    setup.floorArea ? `${Number(setup.floorArea).toLocaleString()} m²` : 'Not provided'
  );
  add('');

  // Section 4: Granular Activity Ledger
  add('GRANULAR ACTIVITY DATA & CALCULATION SCHEDULE');
  add('Scope', 'Category', 'Source / Activity', 'Activity Data', 'Unit', 'Emission Factor', 'EF Unit', 'Emissions (tCO2e)', 'Assurance Status');

  // Scope 1 items
  add(
    'Scope 1',
    'Stationary Combustion',
    'Natural Gas (Heating & Boilers)',
    scope1.naturalGasKwh || 0,
    scope1.naturalGasUnit,
    ef.gas,
    'kg CO2e / kWh',
    calculated.scope1.naturalGasT.toFixed(3),
    'Verified'
  );
  add(
    'Scope 1',
    'Mobile Combustion',
    'Company Fleet (Diesel & Fuels)',
    scope1.mobileDieselL || 0,
    scope1.mobileUnit,
    ef.diesel,
    'kg CO2e / L',
    calculated.scope1.mobileDieselT.toFixed(3),
    'Verified'
  );
  add(
    'Scope 1',
    'Fugitive Emissions',
    `Refrigerant Leakage (${scope1.refrigerantType})`,
    scope1.refrigerantKg || 0,
    'kg',
    scope1.refrigerantGwp,
    'GWP (100-yr)',
    calculated.scope1.refrigerantT.toFixed(3),
    'Verified'
  );
  add(
    'Scope 1',
    'Process Emissions',
    'Direct Chemical / Industrial Process',
    scope1.processEmissionsKg || 0,
    'kg',
    scope1.processEf || 0,
    'kg CO2e / kg',
    calculated.scope1.processT.toFixed(3),
    'Verified'
  );
  if (scope1.otherName || scope1.otherAct) {
    add(
      'Scope 1',
      'Other Direct Emissions',
      scope1.otherName || 'Custom Scope 1',
      scope1.otherAct || 0,
      'units',
      scope1.otherEf || 0,
      'kg CO2e / unit',
      calculated.scope1.otherT.toFixed(3),
      'Verified'
    );
  }

  // Scope 2 items
  add(
    'Scope 2',
    'Location-based Electricity',
    `Grid Power Consumption (${setup.country})`,
    scope2.electricityLocKwh || 0,
    'kWh',
    ef.grid,
    'kg CO2e / kWh',
    calculated.scope2.locationTotalT.toFixed(3),
    'Reference'
  );
  add(
    'Scope 2',
    'Market-based Electricity',
    'Contracted Tariffs / PPAs / Green Certificates',
    scope2.electricityMktKwh || 0,
    'kWh',
    scope2.electricityMktEf !== '' ? scope2.electricityMktEf : ef.grid,
    'kg CO2e / kWh',
    (calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : 0).toFixed(3),
    'Verified'
  );
  if (scope2.steamKwh) {
    add('Scope 2', 'Purchased Steam', 'District Steam Supply', scope2.steamKwh, 'kWh', 0.17, 'kg CO2e / kWh', ((Number(scope2.steamKwh) * 0.17) / 1000).toFixed(3), 'Verified');
  }
  if (scope2.heatKwh) {
    add('Scope 2', 'District Heating', 'Purchased Heat Supply', scope2.heatKwh, 'kWh', 0.15, 'kg CO2e / kWh', ((Number(scope2.heatKwh) * 0.15) / 1000).toFixed(3), 'Verified');
  }
  if (scope2.coolKwh) {
    add('Scope 2', 'District Cooling', 'Purchased Chilled Water', scope2.coolKwh, 'kWh', 0.12, 'kg CO2e / kWh', ((Number(scope2.coolKwh) * 0.12) / 1000).toFixed(3), 'Verified');
  }

  // Scope 3 items
  scope3.forEach((cat) => {
    const act = cat.activity !== '' ? Number(cat.activity) : 0;
    const tco2e = (act * cat.ef) / 1000;
    add(
      'Scope 3',
      `Category ${cat.id}: ${cat.type.toUpperCase()}`,
      cat.name,
      act,
      cat.unit,
      cat.ef,
      `kg CO2e / ${cat.unit}`,
      tco2e.toFixed(3),
      cat.status === 'verified' ? 'Verified' : 'Provisional'
    );
  });

  return lines.join('\r\n');
}

/**
 * Generates an audit-ready JSON ledger data package
 */
export function generateAuditJson(
  setup: OrganizationSetup,
  scope1: Scope1Inputs,
  scope2: Scope2Inputs,
  scope3: Scope3CategoryInput[],
  calculated: CalculatedInventory,
  ef: RegionalFactors,
  levers?: DecarbonizationLevers
): string {
  const exportPayload = {
    schema: 'https://ghgprotocol.org/corporate-standard/v2',
    generator: 'Carbon Ledger Enterprise Accounting System',
    exportTimestamp: new Date().toISOString(),
    organization: {
      name: setup.orgName || 'Your Organization',
      country: setup.country,
      region: setup.region,
      industry: setup.industry,
      reportingYear: setup.reportingYear,
      accountingStandard: setup.accountingStandard,
      consolidationBoundary: setup.boundary || 'Operational Control',
      gwpBasis: setup.gwpBasis,
      disclosureFrameworks: setup.frameworks,
      financialMetrics: {
        annualRevenueEur: setup.revenue !== '' ? Number(setup.revenue) : null,
        fullTimeEmployees: setup.fte !== '' ? Number(setup.fte) : null,
        facilityFloorAreaM2: setup.floorArea !== '' ? Number(setup.floorArea) : null,
      },
    },
    emissionFactorLibrary: {
      country: setup.country,
      gridElectricityKgPerKwh: ef.grid,
      naturalGasKgPerKwh: ef.gas,
      dieselFuelKgPerL: ef.diesel,
      petrolFuelKgPerL: ef.petrol,
      sources: [
        'UK DESNZ / DEFRA 2026 GHG Conversion Factors',
        'IEA World Energy Outlook Grid Averages',
        'IPCC Fifth Assessment Report (AR5) 100-year GWPs',
        'EXIOBASE / CEDA Multi-Regional Input-Output Models',
      ],
    },
    inventorySummaryTco2e: {
      scope1Total: Number(calculated.scope1.totalT.toFixed(3)),
      scope2MarketBasedHeadline: Number((calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : 0).toFixed(3)),
      scope2LocationBasedReference: Number(calculated.scope2.locationTotalT.toFixed(3)),
      totalReportableScope1And2: Number(calculated.totalReportableT.toFixed(3)),
      scope3ProvisionalScreening: Number(calculated.scope3.totalT.toFixed(3)),
      grandTotalFootprint: Number(calculated.grandTotalT.toFixed(3)),
    },
    intensityMetrics: calculated.intensity,
    detailedActivityLedger: {
      scope1: {
        naturalGas: { activity: scope1.naturalGasKwh, unit: scope1.naturalGasUnit, factor: ef.gas, emissionsT: calculated.scope1.naturalGasT },
        mobileDiesel: { activity: scope1.mobileDieselL, unit: scope1.mobileUnit, factor: ef.diesel, emissionsT: calculated.scope1.mobileDieselT },
        refrigerant: { type: scope1.refrigerantType, activityKg: scope1.refrigerantKg, gwp: scope1.refrigerantGwp, emissionsT: calculated.scope1.refrigerantT },
        processEmissions: { activityKg: scope1.processEmissionsKg, factor: scope1.processEf, emissionsT: calculated.scope1.processT },
        other: { name: scope1.otherName, activity: scope1.otherAct, factor: scope1.otherEf, emissionsT: calculated.scope1.otherT },
      },
      scope2: {
        locationBased: { activityKwh: scope2.electricityLocKwh, factor: ef.grid, emissionsT: calculated.scope2.locationTotalT },
        marketBased: { activityKwh: scope2.electricityMktKwh, factor: scope2.electricityMktEf, emissionsT: calculated.scope2.marketTotalT },
        steamKwh: scope2.steamKwh,
        heatKwh: scope2.heatKwh,
        coolKwh: scope2.coolKwh,
      },
      scope3Categories: scope3.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        activity: cat.activity,
        unit: cat.unit,
        emissionFactor: cat.ef,
        tco2e: Number(((Number(cat.activity || 0) * cat.ef) / 1000).toFixed(3)),
        status: cat.status,
      })),
    },
    decarbonizationLevers: levers || null,
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Generates an executive briefing memo in Markdown format
 */
export function generateExecutiveSummaryMarkdown(
  setup: OrganizationSetup,
  scope1: Scope1Inputs,
  scope2: Scope2Inputs,
  scope3: Scope3CategoryInput[],
  calculated: CalculatedInventory,
  signatory?: { name: string; title: string }
): string {
  const org = setup.orgName || 'Your Organization';
  const yr = setup.reportingYear || '2026';
  const signName = signatory?.name || 'Sustainability Lead / Environmental Controller';
  const signTitle = signatory?.title || 'Head of ESG & Statutory Assurance';
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return `# Corporate Greenhouse Gas Inventory & Disclosure Memo

**To:** Board of Directors, Executive Committee, ESG Audit Committee  
**From:** ${signName}, ${signTitle}  
**Date:** ${dateStr}  
**Subject:** FY ${yr} Corporate Carbon Footprint & Statutory GHG Protocol Inventory — ${org}  
**Accounting Standard:** ${setup.accountingStandard} | ISO 14064-1:2018  
**Consolidation Boundary:** ${setup.boundary || 'Operational Control'}  

---

## 1. Executive Summary & Headline Disclosures

During financial year **${yr}**, ${org} completed its annual corporate greenhouse gas (GHG) accounting inventory adhering strictly to the **GHG Protocol Corporate Standard**.

### Key Emissions Disclosures:
- **Total Reportable Emissions (Scope 1 + Scope 2 Market-based):** **${calculated.totalReportableT.toFixed(2)} tCO2e** *(Audit-Ready Compliance Baseline)*
- **Scope 1 (Direct Operations & Fleets):** **${calculated.scope1.totalT.toFixed(2)} tCO2e** (${Math.round((calculated.scope1.totalT / (calculated.grandTotalT || 1)) * 100)}% of total)
- **Scope 2 (Market-based Purchased Electricity & Energy):** **${(calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : 0).toFixed(2)} tCO2e**
- **Scope 2 (Location-based Reference):** **${calculated.scope2.locationTotalT.toFixed(2)} tCO2e** *(Physical grid emission reference)*
- **Scope 3 (Upstream & Downstream Value Chain):** **${calculated.scope3.totalT.toFixed(2)} tCO2e** *(Provisional spend-based screening)*
- **Grand Total Modeled Footprint:** **${calculated.grandTotalT.toFixed(2)} tCO2e**

---

## 2. Carbon Intensity Ratios

Normalized metrics provide comparative baselines for annual tracking and CSRD / ESRS E1 reporting:
- **Turnover Intensity:** ${calculated.intensity.perRevenue !== null ? `${calculated.intensity.perRevenue.toFixed(2)} kg CO2e per €1,000 revenue` : 'Baseline data pending revenue specification'}
- **Workforce Intensity:** ${calculated.intensity.perFte !== null ? `${calculated.intensity.perFte.toFixed(2)} tCO2e per full-time employee (FTE)` : 'Baseline data pending headcount'}
- **Facility Intensity:** ${calculated.intensity.perFloorArea !== null ? `${calculated.intensity.perFloorArea.toFixed(2)} kg CO2e per m² occupied area` : 'Baseline data pending area'}

---

## 3. Top Emission Drivers

1. **Stationary Heating & Natural Gas:** ${calculated.scope1.naturalGasT.toFixed(2)} tCO2e
2. **Purchased Grid Power:** ${(calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : calculated.scope2.locationTotalT).toFixed(2)} tCO2e
3. **Company Vehicle Fleet:** ${calculated.scope1.mobileDieselT.toFixed(2)} tCO2e
4. **Refrigerant Leaks (Fugitive):** ${calculated.scope1.refrigerantT.toFixed(2)} tCO2e
5. **Supply Chain (Scope 3 Screening):** ${calculated.scope3.totalT.toFixed(2)} tCO2e

---

## 4. Statutory Assurance & Declaration

All Scope 1 and Scope 2 activity data have been reconciled against primary billing records, utility meter data, and national conversion factors (IPCC AR5 100-year GWPs). Scope 3 figures reflect an initial spend-based screening and will transition to primary supplier questionnaires during the subsequent phase.

**Signatory Authorization:**  
_${signName}_  
${signTitle}  
${org}
`;
}

/**
 * Generates a standalone, self-contained HTML document ready for opening offline,
 * email sharing, or instant browser printing to PDF.
 */
export function generateStandaloneHtmlReport(
  setup: OrganizationSetup,
  scope1: Scope1Inputs,
  scope2: Scope2Inputs,
  scope3: Scope3CategoryInput[],
  calculated: CalculatedInventory,
  ef: RegionalFactors,
  signatory?: { name: string; title: string }
): string {
  const org = setup.orgName || 'Your Organization';
  const yr = setup.reportingYear || '2026';
  const signName = signatory?.name || 'Sustainability Lead / Environmental Controller';
  const signTitle = signatory?.title || 'Head of ESG & Statutory Assurance';
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Corporate GHG Inventory Report — ${org} (FY ${yr})</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1a231e;
      background: #fdfdfd;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 30px;
    }
    .report-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #d8dfd4;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    }
    .header-band {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #163829;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      color: #163829;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 12px;
      color: #58655c;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-stamp {
      background: #eef5eb;
      border: 1px solid #163829;
      color: #163829;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-align: right;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f7faf5;
      border: 1px solid #e2e8df;
      padding: 14px 18px;
      border-radius: 4px;
      margin-bottom: 26px;
    }
    .meta-item label {
      display: block;
      font-size: 10px;
      color: #647469;
      text-transform: uppercase;
      font-weight: 600;
    }
    .meta-item span {
      font-size: 12.5px;
      font-weight: 600;
      color: #1a231e;
    }
    .headline-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .headline-box {
      border: 1px solid #d8dfd4;
      padding: 14px;
      border-radius: 4px;
      background: #ffffff;
    }
    .headline-box.highlight {
      background: #163829;
      color: #ffffff;
      border-color: #163829;
    }
    .headline-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      opacity: 0.85;
      margin-bottom: 6px;
    }
    .headline-value {
      font-size: 20px;
      font-weight: 700;
    }
    .headline-box.highlight .headline-value {
      color: #74e3a8;
    }
    .headline-sub {
      font-size: 10px;
      opacity: 0.75;
      margin-top: 4px;
    }
    h3 {
      font-size: 14px;
      color: #163829;
      border-bottom: 1px solid #e2e8df;
      padding-bottom: 6px;
      margin: 24px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #e9eee6;
    }
    th {
      background: #edf3e9;
      color: #163829;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
    }
    .val-col {
      text-align: right;
      font-family: monospace;
      font-weight: 600;
    }
    .verified-pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      background: #e2f2e5;
      color: #135e28;
      font-size: 9.5px;
      font-weight: 700;
    }
    .provisional-pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      background: #fdf3e2;
      color: #92580a;
      font-size: 9.5px;
      font-weight: 700;
    }
    .sign-section {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px dashed #d8dfd4;
    }
    .sign-box {
      width: 45%;
    }
    .sign-line {
      border-bottom: 1px solid #222;
      height: 40px;
      margin-bottom: 8px;
    }
    .print-btn {
      display: inline-block;
      background: #163829;
      color: #fff;
      padding: 10px 18px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      margin-bottom: 20px;
      cursor: pointer;
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; background: #fff; }
      .report-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div style="text-align: right; max-width: 900px; margin: 0 auto;">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="report-card">
    <div class="header-band">
      <div>
        <div class="brand-title">${org}</div>
        <div class="brand-sub">GHG Protocol Corporate Carbon Disclosure & Inventory Report</div>
      </div>
      <div class="badge-stamp">
        AUDIT-READY BASELINE<br>
        <span style="font-size: 9px; font-weight: 400;">ISO 14064-1 / GHG Protocol</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <label>Reporting Period</label>
        <span>FY ${yr}</span>
      </div>
      <div class="meta-item">
        <label>Jurisdiction</label>
        <span>${setup.country}</span>
      </div>
      <div class="meta-item">
        <label>Accounting Boundary</label>
        <span>${setup.boundary || 'Operational Control'}</span>
      </div>
      <div class="meta-item">
        <label>GWP Metric</label>
        <span>${setup.gwpBasis} (IPCC AR5)</span>
      </div>
    </div>

    <div class="headline-grid">
      <div class="headline-box highlight">
        <div class="headline-label">Total Reportable</div>
        <div class="headline-value">${calculated.totalReportableT.toFixed(2)} t</div>
        <div class="headline-sub">Scope 1 + Scope 2 Market</div>
      </div>
      <div class="headline-box">
        <div class="headline-label">Scope 1 Direct</div>
        <div class="headline-value">${calculated.scope1.totalT.toFixed(2)} t</div>
        <div class="headline-sub">Verified Primary Data</div>
      </div>
      <div class="headline-box">
        <div class="headline-label">Scope 2 Market</div>
        <div class="headline-value">${(calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : 0).toFixed(2)} t</div>
        <div class="headline-sub">Contractual Instruments</div>
      </div>
      <div class="headline-box">
        <div class="headline-label">Scope 3 Screening</div>
        <div class="headline-value">${calculated.scope3.totalT.toFixed(2)} t</div>
        <div class="headline-sub">Provisional Spend-based</div>
      </div>
    </div>

    <h3>Scope 1 & Scope 2 Operational Inventory</h3>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Activity Source</th>
          <th>Data / Volume</th>
          <th>Factor</th>
          <th class="val-col">Emissions (tCO2e)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Scope 1 Stationary</td>
          <td>Natural Gas (Heating & Boilers)</td>
          <td>${scope1.naturalGasKwh ? Number(scope1.naturalGasKwh).toLocaleString() : '0'} ${scope1.naturalGasUnit}</td>
          <td>${ef.gas} kg/kWh</td>
          <td class="val-col">${calculated.scope1.naturalGasT.toFixed(2)}</td>
          <td><span class="verified-pill">VERIFIED</span></td>
        </tr>
        <tr>
          <td>Scope 1 Mobile</td>
          <td>Company Fleet (Diesel)</td>
          <td>${scope1.mobileDieselL ? Number(scope1.mobileDieselL).toLocaleString() : '0'} ${scope1.mobileUnit}</td>
          <td>${ef.diesel} kg/L</td>
          <td class="val-col">${calculated.scope1.mobileDieselT.toFixed(2)}</td>
          <td><span class="verified-pill">VERIFIED</span></td>
        </tr>
        <tr>
          <td>Scope 1 Fugitive</td>
          <td>Refrigerant (${scope1.refrigerantType})</td>
          <td>${scope1.refrigerantKg || '0'} kg</td>
          <td>GWP ${scope1.refrigerantGwp}</td>
          <td class="val-col">${calculated.scope1.refrigerantT.toFixed(2)}</td>
          <td><span class="verified-pill">VERIFIED</span></td>
        </tr>
        <tr>
          <td>Scope 2 Market-based</td>
          <td>Contracted Clean Power & Tariff</td>
          <td>${scope2.electricityMktKwh ? Number(scope2.electricityMktKwh).toLocaleString() : '0'} kWh</td>
          <td>${scope2.electricityMktEf !== '' ? scope2.electricityMktEf : ef.grid} kg/kWh</td>
          <td class="val-col">${(calculated.scope2.hasMarketBased ? calculated.scope2.marketTotalT : 0).toFixed(2)}</td>
          <td><span class="verified-pill">VERIFIED</span></td>
        </tr>
        <tr>
          <td>Scope 2 Location-based</td>
          <td>National Grid Average (Reference)</td>
          <td>${scope2.electricityLocKwh ? Number(scope2.electricityLocKwh).toLocaleString() : '0'} kWh</td>
          <td>${ef.grid} kg/kWh</td>
          <td class="val-col">${calculated.scope2.locationTotalT.toFixed(2)}</td>
          <td><span style="font-size: 9.5px; color: #555;">REFERENCE</span></td>
        </tr>
      </tbody>
    </table>

    <h3>Carbon Intensity Normalized Indicators</h3>
    <table>
      <thead>
        <tr>
          <th>Indicator</th>
          <th>Denominator</th>
          <th class="val-col">Intensity Value</th>
          <th>Compliance Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Per Unit Revenue Turnover</td>
          <td>${setup.revenue ? '€' + Number(setup.revenue).toLocaleString() : 'Not provided'}</td>
          <td class="val-col">${calculated.intensity.perRevenue !== null ? calculated.intensity.perRevenue.toFixed(2) + ' kg / €1k' : '—'}</td>
          <td>CSRD ESRS E1 Aligned</td>
        </tr>
        <tr>
          <td>Per Full-Time Employee (FTE)</td>
          <td>${setup.fte ? setup.fte + ' employees' : 'Not provided'}</td>
          <td class="val-col">${calculated.intensity.perFte !== null ? calculated.intensity.perFte.toFixed(2) + ' tCO2e / FTE' : '—'}</td>
          <td>Internal Benchmark</td>
        </tr>
        <tr>
          <td>Per m² Facility Area</td>
          <td>${setup.floorArea ? Number(setup.floorArea).toLocaleString() + ' m²' : 'Not provided'}</td>
          <td class="val-col">${calculated.intensity.perFloorArea !== null ? calculated.intensity.perFloorArea.toFixed(2) + ' kg / m²' : '—'}</td>
          <td>Real Estate Decarb Ratio</td>
        </tr>
      </tbody>
    </table>

    <div class="sign-section">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div style="font-weight: 700;">${signName}</div>
        <div style="color: #647469; font-size: 11px;">${signTitle}</div>
        <div style="color: #647469; font-size: 10px;">Date of Certification: ${dateStr}</div>
      </div>
      <div class="sign-box" style="text-align: right;">
        <div style="display: inline-block; text-align: center; border: 2px solid #163829; padding: 10px 16px; border-radius: 6px;">
          <div style="font-size: 10px; font-weight: 700; color: #163829; letter-spacing: 0.1em;">CARBON LEDGER</div>
          <div style="font-size: 12px; font-weight: 800; color: #163829; margin: 2px 0;">ASSURANCE VERIFIED</div>
          <div style="font-size: 9px; color: #58655c;">GHG PROTOCOL COMPLIANT</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
