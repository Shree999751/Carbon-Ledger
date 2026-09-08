import React from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileCode,
  Globe,
  FileText,
} from 'lucide-react';
import {
  OrganizationSetup,
  Scope1Inputs,
  Scope2Inputs,
  Scope3CategoryInput,
  CalculatedInventory,
  RegionalFactors,
  DecarbonizationLevers,
} from '../types/ghg';
import {
  downloadFile,
  generateAuditCsv,
  generateAuditJson,
  generateExecutiveSummaryMarkdown,
  generateStandaloneHtmlReport,
} from '../utils/reportExport';

interface ReportTabProps {
  setup: OrganizationSetup;
  scope1: Scope1Inputs;
  scope2: Scope2Inputs;
  scope3: Scope3CategoryInput[];
  calculated: CalculatedInventory;
  ef: RegionalFactors;
  levers?: DecarbonizationLevers;
  onShowToast: (msg: string) => void;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  setup,
  scope1,
  scope2,
  scope3,
  calculated,
  ef,
  levers,
  onShowToast,
}) => {
  const orgName = setup.orgName || 'Global Enterprise Corp';
  const yr = setup.reportingYear || '2025';
  const boundary = setup.boundary || 'Operational Control';
  const todayIso = new Date().toISOString().split('T')[0];

  // Totals & Percentages
  const s1Total = calculated.scope1.totalT;
  const s2Total = calculated.scope2.hasMarketBased
    ? calculated.scope2.marketTotalT
    : calculated.scope2.headlineT || calculated.scope2.locationTotalT;
  const s3Total = calculated.scope3.totalT;
  const grandTotal = s1Total + s2Total + s3Total;
  const grandTotalKg = Math.round(grandTotal * 1000);

  const pctS1 = grandTotal > 0 ? (s1Total / grandTotal) * 100 : 0;
  const pctS2 = grandTotal > 0 ? (s2Total / grandTotal) * 100 : 0;
  const pctS3 = grandTotal > 0 ? (s3Total / grandTotal) * 100 : 0;

  // Build Scope 1 items
  const scope1Items: Array<{
    category: string;
    source: string;
    quantityUnit: string;
    tco2e: number;
    pct: number;
  }> = [];

  if (Number(scope1.naturalGasKwh) > 0 || calculated.scope1.naturalGasT > 0) {
    const t = calculated.scope1.naturalGasT;
    scope1Items.push({
      category: 'Stationary Fuels',
      source: 'Verified DEFRA Factor',
      quantityUnit: `${Number(scope1.naturalGasKwh || 0).toLocaleString()} ${scope1.naturalGasUnit || 'kWh'}`,
      tco2e: t,
      pct: s1Total > 0 ? (t / s1Total) * 100 : 0,
    });
  }

  if (Number(scope1.mobileDieselL) > 0 || calculated.scope1.mobileDieselT > 0) {
    const t = calculated.scope1.mobileDieselT;
    scope1Items.push({
      category: 'Owned Vehicles / Fleet',
      source: 'Verified DEFRA Factor',
      quantityUnit: `${Number(scope1.mobileDieselL || 0).toLocaleString()} ${scope1.mobileUnit || 'L'}`,
      tco2e: t,
      pct: s1Total > 0 ? (t / s1Total) * 100 : 0,
    });
  }

  if (Number(scope1.refrigerantKg) > 0 || calculated.scope1.refrigerantT > 0) {
    const t = calculated.scope1.refrigerantT;
    scope1Items.push({
      category: 'Fugitive Refrigerants',
      source: `IPCC AR5 (${scope1.refrigerantType || 'HFC-134a'})`,
      quantityUnit: `${Number(scope1.refrigerantKg || 0).toLocaleString()} kg`,
      tco2e: t,
      pct: s1Total > 0 ? (t / s1Total) * 100 : 0,
    });
  }

  if (Number(scope1.processEmissionsKg) > 0 || calculated.scope1.processT > 0) {
    const t = calculated.scope1.processT;
    scope1Items.push({
      category: 'Process Emissions',
      source: 'Verified Chemical Process Factor',
      quantityUnit: `${Number(scope1.processEmissionsKg || 0).toLocaleString()} kg`,
      tco2e: t,
      pct: s1Total > 0 ? (t / s1Total) * 100 : 0,
    });
  }

  if (Number(scope1.otherAct) > 0 || calculated.scope1.otherT > 0) {
    const t = calculated.scope1.otherT;
    scope1Items.push({
      category: scope1.otherName || 'Other Direct Sources',
      source: 'Verified Factor',
      quantityUnit: `${Number(scope1.otherAct || 0).toLocaleString()} units`,
      tco2e: t,
      pct: s1Total > 0 ? (t / s1Total) * 100 : 0,
    });
  }

  // Fallback defaults if scope 1 is empty so layout is never broken
  if (scope1Items.length === 0) {
    scope1Items.push(
      {
        category: 'Stationary Fuels',
        source: 'Verified DEFRA Factor',
        quantityUnit: '0 kWh',
        tco2e: 0,
        pct: 0,
      },
      {
        category: 'Owned Vehicles / Fleet',
        source: 'Verified DEFRA Factor',
        quantityUnit: '0 L',
        tco2e: 0,
        pct: 0,
      }
    );
  }

  // Build Scope 2 items
  const scope2Items: Array<{
    category: string;
    source: string;
    quantityUnit: string;
    tco2e: number;
    pct: number;
  }> = [];

  const s2Kwh = scope2.electricityMktKwh || scope2.electricityLocKwh;
  if (Number(s2Kwh) > 0 || s2Total > 0) {
    scope2Items.push({
      category: 'Electricity, Heat & Cooling',
      source: 'Verified DEFRA Factor',
      quantityUnit: `${Number(s2Kwh || 0).toLocaleString()} kWh`,
      tco2e: s2Total,
      pct: 100.0,
    });
  } else {
    scope2Items.push({
      category: 'Electricity, Heat & Cooling',
      source: 'Verified DEFRA Factor',
      quantityUnit: '0 kWh',
      tco2e: 0,
      pct: 0,
    });
  }

  // Build Scope 3 items
  const activeScope3 = calculated.scope3.categories.filter((c) => c.tco2e > 0);
  const scope3Items: Array<{
    category: string;
    source: string;
    quantityUnit: string;
    tco2e: number;
    pct: number;
  }> = [];

  if (activeScope3.length > 0) {
    activeScope3.forEach((c) => {
      scope3Items.push({
        category: c.name,
        source: 'Verified DEFRA Factor',
        quantityUnit: `${Number(c.activity || 0).toLocaleString()} ${c.unit}`,
        tco2e: c.tco2e,
        pct: s3Total > 0 ? (c.tco2e / s3Total) * 100 : 0,
      });
    });
  } else {
    scope3Items.push(
      {
        category: 'Air Travel',
        source: 'Verified DEFRA Factor',
        quantityUnit: '0 passenger.km',
        tco2e: 0,
        pct: 0,
      },
      {
        category: 'Employee Commuting',
        source: 'Verified DEFRA Factor',
        quantityUnit: '0 km',
        tco2e: 0,
        pct: 0,
      },
      {
        category: 'Home Office Working',
        source: 'Verified DEFRA Factor',
        quantityUnit: '0 kWh',
        tco2e: 0,
        pct: 0,
      },
      {
        category: 'Waste Disposal',
        source: 'Verified DEFRA Factor',
        quantityUnit: '0 tonnes',
        tco2e: 0,
        pct: 0,
      }
    );
  }

  // Export handlers
  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent = generateAuditCsv(setup, scope1, scope2, scope3, calculated, ef);
    const filename = `${orgName.replace(/[^a-z0-9]/gi, '_')}_GHG_Report_FY${yr}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
    onShowToast(`Downloaded Audit CSV: ${filename}`);
  };

  const handleDownloadJson = () => {
    const jsonContent = generateAuditJson(setup, scope1, scope2, scope3, calculated, ef, levers);
    const filename = `${orgName.replace(/[^a-z0-9]/gi, '_')}_GHG_Report_FY${yr}.json`;
    downloadFile(jsonContent, filename, 'application/json');
    onShowToast(`Downloaded JSON Ledger: ${filename}`);
  };

  const handleDownloadHtml = () => {
    const htmlContent = generateStandaloneHtmlReport(setup, scope1, scope2, scope3, calculated, ef);
    const filename = `${orgName.replace(/[^a-z0-9]/gi, '_')}_GHG_Report_FY${yr}.html`;
    downloadFile(htmlContent, filename, 'text/html');
    onShowToast(`Downloaded Standalone HTML: ${filename}`);
  };

  return (
    <section className="tab-pane target-report-tab-pane">
      {/* QUICK DOWNLOAD TOOLBAR (HIDDEN IN PRINT) */}
      <div className="report-download-toolbar no-print">
        <div className="toolbar-left-text">
          <span>Official GHG Emissions Inventory Report</span>
        </div>
        <div className="toolbar-actions-group">
          <button
            type="button"
            className="btn-toolbar-download"
            onClick={handleDownloadCsv}
            title="Download CSV Spreadsheet"
          >
            <FileSpreadsheet size={14} />
            <span>CSV Data</span>
          </button>
          <button
            type="button"
            className="btn-toolbar-download"
            onClick={handleDownloadJson}
            title="Download JSON Ledger"
          >
            <FileCode size={14} />
            <span>JSON Ledger</span>
          </button>
          <button
            type="button"
            className="btn-toolbar-download"
            onClick={handleDownloadHtml}
            title="Download Standalone HTML Report"
          >
            <Globe size={14} />
            <span>Offline HTML</span>
          </button>
        </div>
      </div>

      {/* REPORT PAPER CARD MATCHING USER TEMPLATE */}
      <div className="ghg-report-card" id="ghg-printable-area">
        {/* REPORT HEADER */}
        <div className="ghg-report-header">
          <div className="header-left-col">
            <h1 className="ghg-main-report-title">
              Greenhouse Gas Emissions Inventory Report
            </h1>
            <p className="ghg-standards-caption">
              Compliant with GHG Protocol Corporate Standard, EU CSRD (EEA 2023), India SEBI BRSR (CEA 2023) &amp; UK DESNZ Standards
            </p>
          </div>

          <div className="header-right-meta">
            <div className="meta-line">
              <span className="meta-label">Organization:</span>{' '}
              <span className="meta-val">{orgName}</span>
            </div>
            <div className="meta-line">
              <span className="meta-label">Reporting Period:</span>{' '}
              <span className="meta-val">FY {yr}</span>
            </div>
            <div className="meta-line">
              <span className="meta-label">Consolidation Approach:</span>{' '}
              <span className="meta-val">{boundary}</span>
            </div>
            <div className="meta-line">
              <span className="meta-label">Report Generated:</span>{' '}
              <span className="meta-val">{todayIso}</span>
            </div>
          </div>
        </div>

        {/* TOP DIVIDER LINE */}
        <div className="ghg-header-divider" />

        {/* 4 SUMMARY CARDS GRID */}
        <div className="ghg-kpi-grid">
          {/* Card 1: Total Footprint */}
          <div className="ghg-kpi-card">
            <div className="ghg-kpi-title">Total Corporate GHG Footprint</div>
            <div className="ghg-kpi-metric">
              {grandTotal.toFixed(2)} <span className="ghg-kpi-unit">t CO2e</span>
            </div>
            <div className="ghg-kpi-subtitle">
              {grandTotalKg.toLocaleString()} kg CO2e
            </div>
          </div>

          {/* Card 2: Scope 1 */}
          <div className="ghg-kpi-card">
            <div className="ghg-kpi-title">Scope 1 (Direct)</div>
            <div className="ghg-kpi-metric">
              {s1Total.toFixed(2)} <span className="ghg-kpi-unit">t CO2e</span>
            </div>
            <div className="ghg-kpi-subtitle">
              {pctS1.toFixed(1)}% of Total
            </div>
          </div>

          {/* Card 3: Scope 2 */}
          <div className="ghg-kpi-card">
            <div className="ghg-kpi-title">Scope 2 (Indirect Energy)</div>
            <div className="ghg-kpi-metric">
              {s2Total.toFixed(2)} <span className="ghg-kpi-unit">t CO2e</span>
            </div>
            <div className="ghg-kpi-subtitle">
              {pctS2.toFixed(1)}% of Total
            </div>
          </div>

          {/* Card 4: Scope 3 */}
          <div className="ghg-kpi-card">
            <div className="ghg-kpi-title">Scope 3 (Value Chain)</div>
            <div className="ghg-kpi-metric">
              {s3Total.toFixed(2)} <span className="ghg-kpi-unit">t CO2e</span>
            </div>
            <div className="ghg-kpi-subtitle">
              {pctS3.toFixed(1)}% of Total
            </div>
          </div>
        </div>

        {/* SECTION: SCOPE 1 */}
        <div className="ghg-scope-section">
          <h2 className="ghg-scope-title">Scope 1: Direct GHG Emissions</h2>
          <p className="ghg-scope-desc">
            Direct emissions arising from owned or controlled stationary sources, fugitive refrigerants, bioenergy, and mobile vehicles.
          </p>

          <table className="ghg-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Category</th>
                <th style={{ width: '28%' }}>Emission Source Category</th>
                <th style={{ width: '24%' }}>Quantity &amp; Unit</th>
                <th style={{ width: '10%' }}>t CO2e</th>
                <th style={{ width: '10%' }}>% of Scope 1</th>
              </tr>
            </thead>
            <tbody>
              {scope1Items.map((row, idx) => (
                <tr key={idx}>
                  <td className="col-category"><strong>{row.category}</strong></td>
                  <td className="col-source">{row.source}</td>
                  <td className="col-qty">{row.quantityUnit}</td>
                  <td className="col-tco2e"><strong>{row.tco2e.toFixed(3)}</strong></td>
                  <td className="col-pct">{row.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION: SCOPE 2 */}
        <div className="ghg-scope-section">
          <h2 className="ghg-scope-title">Scope 2: Energy Indirect GHG Emissions</h2>
          <p className="ghg-scope-desc">
            Location-based emissions from purchased electricity, heat, steam, and district cooling.
          </p>

          <table className="ghg-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Category</th>
                <th style={{ width: '28%' }}>Emission Source Category</th>
                <th style={{ width: '24%' }}>Quantity &amp; Unit</th>
                <th style={{ width: '10%' }}>t CO2e</th>
                <th style={{ width: '10%' }}>% of Scope 2</th>
              </tr>
            </thead>
            <tbody>
              {scope2Items.map((row, idx) => (
                <tr key={idx}>
                  <td className="col-category"><strong>{row.category}</strong></td>
                  <td className="col-source">{row.source}</td>
                  <td className="col-qty">{row.quantityUnit}</td>
                  <td className="col-tco2e"><strong>{row.tco2e.toFixed(3)}</strong></td>
                  <td className="col-pct">{row.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION: SCOPE 3 */}
        <div className="ghg-scope-section">
          <h2 className="ghg-scope-title">Scope 3: Other Indirect GHG Emissions (Value Chain)</h2>
          <p className="ghg-scope-desc">
            Upstream and downstream activities including materials, waste, business travel, commuting, food, water, and home working.
          </p>

          <table className="ghg-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Category</th>
                <th style={{ width: '28%' }}>Emission Source Category</th>
                <th style={{ width: '24%' }}>Quantity &amp; Unit</th>
                <th style={{ width: '10%' }}>t CO2e</th>
                <th style={{ width: '10%' }}>% of Scope 3</th>
              </tr>
            </thead>
            <tbody>
              {scope3Items.map((row, idx) => (
                <tr key={idx}>
                  <td className="col-category"><strong>{row.category}</strong></td>
                  <td className="col-source">{row.source}</td>
                  <td className="col-qty">{row.quantityUnit}</td>
                  <td className="col-tco2e"><strong>{row.tco2e.toFixed(3)}</strong></td>
                  <td className="col-pct">{row.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM PRINT / DOWNLOAD BUTTON (MATCHING USER IMAGE) */}
        <div className="ghg-report-footer-actions">
          <button
            type="button"
            className="btn-print-ghg-primary"
            onClick={handlePrintPdf}
          >
            <Printer size={16} />
            <span>Print GHG Report / Save as PDF</span>
          </button>
        </div>
      </div>
    </section>
  );
};
