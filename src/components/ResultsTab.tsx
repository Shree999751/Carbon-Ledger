import React from 'react';
import { Info, TrendingUp, Users, Building2 } from 'lucide-react';
import { OrganizationSetup, CalculatedInventory, RegionalFactors, getCurrencySymbol } from '../types/ghg';
import { Tooltip } from './Tooltip';

interface ResultsTabProps {
  setup: OrganizationSetup;
  calculated: CalculatedInventory;
  ef: RegionalFactors;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  setup,
  calculated,
}) => {
  const { scope1, scope2, scope3, totalReportableT, grandTotalT, intensity } = calculated;
  const currSym = getCurrencySymbol(setup.currency || 'USD');

  // Donut chart calculations
  const totalModeled = grandTotalT > 0 ? grandTotalT : 1;
  const pS1 = Math.round((scope1.totalT / totalModeled) * 100);
  const pS2 = Math.round(((scope2.hasMarketBased ? scope2.marketTotalT : 0) / totalModeled) * 100);
  const pS3 = Math.round((scope3.totalT / totalModeled) * 100);

  const circ = 2 * Math.PI * 14; // ~87.96
  const s1Len = (pS1 / 100) * circ;
  const s2Len = (pS2 / 100) * circ;
  const s3Len = (pS3 / 100) * circ;

  // Bar Overview scaling
  const maxBarVal = Math.max(scope1.totalT, scope2.headlineT, scope3.totalT, grandTotalT, 1);
  const barH = (v: number) => `${Math.max(4, (v / maxBarVal) * 90)}px`;

  // Top Emission Sources (Verified vs Provisional)
  const verifiedSources = [
    { name: 'Refrigerant Leakage', val: scope1.refrigerantT },
    { name: 'Stationary Combustion', val: scope1.naturalGasT },
    { name: 'Mobile Combustion', val: scope1.mobileDieselT },
    { name: 'Process Emissions', val: scope1.processT },
    { name: 'Other Direct Sources', val: scope1.otherT },
  ].filter((s) => s.val > 0).sort((a, b) => b.val - a.val);

  const provisionalSources = scope3.categories
    .filter((c) => c.tco2e > 0)
    .sort((a, b) => b.tco2e - a.tco2e);

  const maxSourceVal = Math.max(
    ...verifiedSources.map((s) => s.val),
    ...provisionalSources.map((s) => s.tco2e),
    1
  );

  return (
    <section className="tab-pane">
      <h2 className="results-heading">
        FY {setup.reportingYear} GHG Inventory — {setup.orgName || 'Your Organization'}
      </h2>

      {/* 4 SUMMARY CARDS */}
      <div className="summary-cards-grid">
        <div className="summary-card card-scope1">
          <div className="card-label">
            SCOPE 1
            <Tooltip content="Direct emissions from owned/controlled sources (fuels, fleet, refrigerants)" showIcon />
          </div>
          <div className="card-val">
            {scope1.totalT > 0 ? scope1.totalT.toFixed(2) : '—'}{' '}
            <span className="card-unit">tCO2e</span>
          </div>
          <div className="card-subtext verified">✓ verified</div>
        </div>

        <div className="summary-card card-scope2">
          <div className="card-label">
            SCOPE 2
            <Tooltip content="Indirect emissions from purchased energy (market-based headline)" showIcon />
          </div>
          <div className="card-val">
            {scope2.hasMarketBased ? scope2.marketTotalT.toFixed(2) : '—'}
          </div>
          <div className="card-subtext">
            {scope2.hasMarketBased ? 'market-based' : 'no data'}
          </div>
        </div>

        <div className="summary-card card-scope3">
          <div className="card-label">
            SCOPE 3
            <Tooltip content="Value chain emissions (Categories 1–15); provisional until audited." showIcon />
          </div>
          <div className="card-val">—</div>
          <div className="card-subtext provisional">
            {scope3.totalT > 0 ? `⚠ provisional only: ${scope3.totalT.toFixed(2)} t` : 'no data'}
          </div>
        </div>

        <div className="summary-card card-total">
          <div className="card-label">
            TOTAL REPORTABLE
            <Tooltip content="Audit-ready total: Scope 1 + Scope 2 market-based headline." showIcon />
          </div>
          <div className="card-val">
            {totalReportableT > 0 ? totalReportableT.toFixed(2) : '—'}{' '}
            <span className="card-unit">tCO2e</span>
          </div>
          <div className="card-subtext">
            + {scope3.totalT.toFixed(2)} t provisional
          </div>
        </div>
      </div>

      <div className="results-footnote">
        Including provisional estimates: {grandTotalT.toFixed(1)} tCO2e — not suitable for statutory reporting until verified.
      </div>

      {/* 3 WIDGETS ROW: Donut, Intensity, Bar */}
      <div className="widgets-grid modern-widgets-grid">
        {/* Widget 1: Emissions Breakdown (Donut) */}
        <div className="widget-box modern-widget-box">
          <div className="widget-header-row">
            <div className="widget-title">Emissions Breakdown</div>
            <Tooltip content="Proportional breakdown across Scope 1, 2, and 3 modeled footprint" showIcon />
          </div>

          <div className="donut-modern-container">
            <div className="donut-chart-wrapper">
              <svg className="donut-chart-svg modern" viewBox="0 0 100 100">
                {/* Base ring track */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#edf3ea" strokeWidth="11" />
                {/* Scope 1 Arc */}
                {pS1 > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="var(--chart-scope1)"
                    strokeWidth="11"
                    strokeDasharray={`${(pS1 / 100) * 238.76} ${238.76}`}
                    strokeDashoffset="59.69"
                    strokeLinecap="round"
                  />
                )}
                {/* Scope 2 Arc */}
                {pS2 > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="var(--chart-scope2)"
                    strokeWidth="11"
                    strokeDasharray={`${(pS2 / 100) * 238.76} ${238.76}`}
                    strokeDashoffset={59.69 - (pS1 / 100) * 238.76}
                    strokeLinecap="round"
                  />
                )}
                {/* Scope 3 Arc */}
                {pS3 > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="var(--chart-scope3)"
                    strokeWidth="11"
                    strokeDasharray={`${(pS3 / 100) * 238.76} ${238.76}`}
                    strokeDashoffset={59.69 - ((pS1 + pS2) / 100) * 238.76}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              {/* Donut Center Metrics */}
              <div className="donut-center-overlay">
                <div className="donut-center-kpi">
                  {grandTotalT > 0 ? grandTotalT.toFixed(1) : '0.0'}
                </div>
                <div className="donut-center-sub">tCO2e Total</div>
              </div>
            </div>

            {/* Structured Legend */}
            <div className="donut-legend-modern">
              <div className="legend-row-card">
                <div className="legend-accent-bar s1" />
                <div className="legend-text-col">
                  <div className="legend-label-row">
                    <span className="legend-scope-name">Scope 1 Direct</span>
                    <span className="legend-pct-pill">{pS1}%</span>
                  </div>
                  <div className="legend-metrics-row">
                    <span className="legend-metric-val">{scope1.totalT.toFixed(1)} t</span>
                    <span className="legend-audit-tag verified">Reportable</span>
                  </div>
                </div>
              </div>

              <div className="legend-row-card">
                <div className="legend-accent-bar s2" />
                <div className="legend-text-col">
                  <div className="legend-label-row">
                    <span className="legend-scope-name">Scope 2 Energy</span>
                    <span className="legend-pct-pill">{pS2}%</span>
                  </div>
                  <div className="legend-metrics-row">
                    <span className="legend-metric-val">
                      {(scope2.hasMarketBased ? scope2.marketTotalT : 0).toFixed(1)} t
                    </span>
                    <span className="legend-audit-tag">
                      {scope2.hasMarketBased ? 'Market' : 'Location'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="legend-row-card">
                <div className="legend-accent-bar s3" />
                <div className="legend-text-col">
                  <div className="legend-label-row">
                    <span className="legend-scope-name">Scope 3 Supply Chain</span>
                    <span className="legend-pct-pill">{pS3}%</span>
                  </div>
                  <div className="legend-metrics-row">
                    <span className="legend-metric-val">{scope3.totalT.toFixed(1)} t</span>
                    <span className="legend-audit-tag provisional">Provisional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-clean-footer">
            <Info size={12} className="chart-footer-icon" />
            <span>Scope 1 &amp; 2 count toward statutory reportable total. Scope 3 is provisional screening.</span>
          </div>
        </div>

        {/* Widget 2: Emissions Intensity Ratios */}
        <div className="widget-box modern-widget-box">
          <div className="widget-header-row">
            <div className="widget-title">Emissions Intensity Ratios</div>
            <Tooltip content="Operational carbon intensity benchmarks normalized by corporate business drivers" showIcon />
          </div>

          <div className="intensity-tiles-group">
            {/* Tile 1: Revenue Intensity */}
            <div className="intensity-tile">
              <div className="intensity-tile-icon-box rev">
                <TrendingUp size={16} />
              </div>
              <div className="intensity-tile-content">
                <div className="intensity-tile-header">
                  <span className="intensity-tile-title">Revenue Intensity</span>
                  <span className="intensity-tile-unit">per {currSym}1k turnover</span>
                </div>
                <div className="intensity-tile-val">
                  {intensity.perRevenue !== null ? `${intensity.perRevenue.toFixed(2)} kg` : '—'}
                </div>
                <div className="intensity-tile-sub">
                  {setup.revenue
                    ? `${grandTotalT.toFixed(1)} t ÷ ${currSym}${Number(setup.revenue).toLocaleString()}`
                    : 'Configure revenue in Setup'}
                </div>
              </div>
            </div>

            {/* Tile 2: Employee Intensity */}
            <div className="intensity-tile">
              <div className="intensity-tile-icon-box fte">
                <Users size={16} />
              </div>
              <div className="intensity-tile-content">
                <div className="intensity-tile-header">
                  <span className="intensity-tile-title">Headcount Intensity</span>
                  <span className="intensity-tile-unit">per employee (FTE)</span>
                </div>
                <div className="intensity-tile-val">
                  {intensity.perFte !== null ? `${intensity.perFte.toFixed(2)} tCO2e` : '—'}
                </div>
                <div className="intensity-tile-sub">
                  {setup.fte
                    ? `${grandTotalT.toFixed(1)} t ÷ ${setup.fte} staff members`
                    : 'Configure FTE in Setup'}
                </div>
              </div>
            </div>

            {/* Tile 3: Floor Area Intensity */}
            <div className="intensity-tile">
              <div className="intensity-tile-icon-box area">
                <Building2 size={16} />
              </div>
              <div className="intensity-tile-content">
                <div className="intensity-tile-header">
                  <span className="intensity-tile-title">Facility Intensity</span>
                  <span className="intensity-tile-unit">per m² floor area</span>
                </div>
                <div className="intensity-tile-val">
                  {intensity.perFloorArea !== null ? `${intensity.perFloorArea.toFixed(2)} kg` : '—'}
                </div>
                <div className="intensity-tile-sub">
                  {setup.floorArea
                    ? `${grandTotalT.toFixed(1)} t ÷ ${Number(setup.floorArea).toLocaleString()} m² area`
                    : 'Configure area in Setup'}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-clean-footer">
            <Info size={12} className="chart-footer-icon" />
            <span>Intensity benchmarks update automatically with inventory changes.</span>
          </div>
        </div>

        {/* Widget 3: Overview Column Chart */}
        <div className="widget-box modern-widget-box">
          <div className="widget-header-row">
            <div className="widget-title">Emissions Overview</div>
            <Tooltip content="Comparative volume of emissions by Scope and combined total" showIcon />
          </div>

          <div className="modern-column-chart">
            {/* Horizontal Guide Grid Lines */}
            <div className="chart-gridlines">
              <div className="gridline"><span className="gridline-label">100%</span></div>
              <div className="gridline"><span className="gridline-label">50%</span></div>
              <div className="gridline baseline" />
            </div>

            {/* Columns Area */}
            <div className="chart-columns-flex">
              {/* Column 1: Scope 1 */}
              <div className="column-col">
                <div className="column-val-pill s1">
                  {scope1.totalT > 0 ? `${scope1.totalT.toFixed(1)}t` : '0t'}
                </div>
                <div className="column-bar-track">
                  <div
                    className="column-bar-fill s1"
                    style={{ height: `${Math.max(6, Math.min(100, Math.round((scope1.totalT / maxBarVal) * 100)))}%` }}
                  />
                </div>
                <div className="column-footer">
                  <div className="column-footer-title">
                    <span className="col-dot s1" />
                    <span className="col-label">Scope 1</span>
                  </div>
                  <span className="col-subpct">{pS1}%</span>
                </div>
              </div>

              {/* Column 2: Scope 2 */}
              <div className="column-col">
                <div className="column-val-pill s2">
                  {scope2.headlineT > 0 ? `${scope2.headlineT.toFixed(1)}t` : '0t'}
                </div>
                <div className="column-bar-track">
                  <div
                    className="column-bar-fill s2"
                    style={{ height: `${Math.max(6, Math.min(100, Math.round((scope2.headlineT / maxBarVal) * 100)))}%` }}
                  />
                </div>
                <div className="column-footer">
                  <div className="column-footer-title">
                    <span className="col-dot s2" />
                    <span className="col-label">Scope 2</span>
                  </div>
                  <span className="col-subpct">{pS2}%</span>
                </div>
              </div>

              {/* Column 3: Scope 3 */}
              <div className="column-col">
                <div className="column-val-pill s3">
                  {scope3.totalT > 0 ? `${scope3.totalT.toFixed(1)}t` : '0t'}
                </div>
                <div className="column-bar-track">
                  <div
                    className="column-bar-fill s3"
                    style={{ height: `${Math.max(6, Math.min(100, Math.round((scope3.totalT / maxBarVal) * 100)))}%` }}
                  />
                </div>
                <div className="column-footer">
                  <div className="column-footer-title">
                    <span className="col-dot s3" />
                    <span className="col-label">Scope 3</span>
                  </div>
                  <span className="col-subpct">{pS3}%</span>
                </div>
              </div>

              {/* Column 4: Total */}
              <div className="column-col total">
                <div className="column-val-pill total">
                  {grandTotalT > 0 ? `${grandTotalT.toFixed(1)}t` : '0t'}
                </div>
                <div className="column-bar-track">
                  <div
                    className="column-bar-fill total"
                    style={{ height: `${Math.max(6, Math.min(100, Math.round((grandTotalT / maxBarVal) * 100)))}%` }}
                  />
                </div>
                <div className="column-footer">
                  <div className="column-footer-title">
                    <span className="col-dot total" />
                    <span className="col-label">Total</span>
                  </div>
                  <span className="col-subpct">100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-clean-footer">
            <Info size={12} className="chart-footer-icon" />
            <span>Total bar represents consolidated gross emissions footprint.</span>
          </div>
        </div>
      </div>

      {/* TOP EMISSION SOURCES: REDESIGNED UNCLUTTERED LEADERBOARD */}
      <div className="top-sources-card modern-leaderboard">
        <div className="leaderboard-header">
          <div>
            <div className="leaderboard-title">Top Emission Sources</div>
            <div className="leaderboard-subtitle">
              Ranked breakdown of highest carbon contributors across operations and value chain
            </div>
          </div>
          <Tooltip content="Identifies key decarbonization priority levers ranked by emissions impact" showIcon />
        </div>

        <div className="sources-split-grid">
          {/* Section 1: Verified / Operational Sources (Scope 1 & 2) */}
          <div className="source-group-card verified-group">
            <div className="group-card-header">
              <div className="group-header-left">
                <span className="group-status-pill verified">Reportable Operations</span>
                <span className="group-sub-count">{verifiedSources.length} sources active</span>
              </div>
              <div className="group-header-total">
                <span className="group-total-num">
                  {verifiedSources.reduce((acc, s) => acc + s.val, 0).toFixed(1)}
                </span>
                <span className="group-total-unit">tCO2e</span>
              </div>
            </div>

            <div className="source-items-list">
              {verifiedSources.length === 0 ? (
                <div className="empty-sources-msg">No verified operational emissions entered.</div>
              ) : (
                verifiedSources.map((item, idx) => {
                  const verifiedTotal = verifiedSources.reduce((acc, s) => acc + s.val, 0);
                  const pct = verifiedTotal > 0 ? Math.round((item.val / verifiedTotal) * 100) : 0;
                  return (
                    <div key={item.name} className="source-item-card">
                      <div className="source-card-top">
                        <div className="source-card-info">
                          <span className="source-rank-badge">#{idx + 1}</span>
                          <span className="source-name-text">{item.name}</span>
                          <span className="source-scope-tag s1">Scope 1</span>
                        </div>
                        <div className="source-card-metrics">
                          <span className="source-tonnage-val">{item.val.toFixed(2)} t</span>
                          <span className="source-share-badge">{pct}%</span>
                        </div>
                      </div>

                      <div className="source-track-wrapper">
                        <div
                          className="source-track-fill verified"
                          style={{ width: `${Math.max(4, Math.round((item.val / maxSourceVal) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Provisional Value Chain Sources (Scope 3) */}
          <div className="source-group-card provisional-group">
            <div className="group-card-header">
              <div className="group-header-left">
                <span className="group-status-pill provisional">Value Chain (Scope 3)</span>
                <span className="group-sub-count">{provisionalSources.length} categories active</span>
              </div>
              <div className="group-header-total">
                <span className="group-total-num">
                  {provisionalSources.reduce((acc, s) => acc + s.tco2e, 0).toFixed(1)}
                </span>
                <span className="group-total-unit">tCO2e</span>
              </div>
            </div>

            <div className="source-items-list">
              {provisionalSources.length === 0 ? (
                <div className="empty-sources-msg">No Scope 3 categories modeled.</div>
              ) : (
                provisionalSources.map((item, idx) => {
                  const s3TotalVal = provisionalSources.reduce((acc, s) => acc + s.tco2e, 0);
                  const pct = s3TotalVal > 0 ? Math.round((item.tco2e / s3TotalVal) * 100) : 0;
                  return (
                    <div key={item.name} className="source-item-card">
                      <div className="source-card-top">
                        <div className="source-card-info">
                          <span className="source-rank-badge provisional">#{idx + 1}</span>
                          <span className="source-name-text">{item.name}</span>
                          <span className="source-scope-tag s3">Scope 3</span>
                        </div>
                        <div className="source-card-metrics">
                          <span className="source-tonnage-val">{item.tco2e.toFixed(2)} t</span>
                          <span className="source-share-badge provisional">{pct}%</span>
                        </div>
                      </div>

                      <div className="source-track-wrapper">
                        <div
                          className="source-track-fill provisional"
                          style={{ width: `${Math.max(4, Math.round((item.tco2e / maxSourceVal) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EMISSION FACTORS DATABASE EXCERPT */}
      <div className="form-card">
        <div className="form-card-header">Emission Factors Database Citations</div>
        <div className="form-card-body">
          <table className="meta-table">
            <thead>
              <tr>
                <th>Factor Key</th>
                <th>Region</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Source &amp; Vintage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Grid Electricity (Location-based)</td>
                <td>{setup.country}</td>
                <td>{REGIONAL_FACTORS_LABEL(setup.country)}</td>
                <td>kg CO2e / kWh</td>
                <td>National GHG Inventory / IEA / DESNZ</td>
              </tr>
              <tr>
                <td>Natural Gas (Stationary Combustion)</td>
                <td>Global / National</td>
                <td>0.2022</td>
                <td>kg CO2e / kWh</td>
                <td>IPCC 2006 Guidelines / DEFRA</td>
              </tr>
              <tr>
                <td>Diesel Fuel (Mobile Combustion)</td>
                <td>Global / National</td>
                <td>2.5835</td>
                <td>kg CO2e / L</td>
                <td>DESNZ 2026 Mineral Fuel Factors</td>
              </tr>
              <tr>
                <td>HFC-134a Refrigerant</td>
                <td>Global</td>
                <td>1,300</td>
                <td>GWP (100-yr)</td>
                <td>IPCC Fifth Assessment Report (AR5 WG1)</td>
              </tr>
              <tr>
                <td>Purchased Goods &amp; Services</td>
                <td>EU / Global</td>
                <td>0.2010</td>
                <td>kg CO2e / EUR</td>
                <td>Exiobase / CEDA EEIO spend-based model</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

function REGIONAL_FACTORS_LABEL(code: string): string {
  switch (code) {
    case 'UK': return '0.1294';
    case 'US': return '0.3710';
    case 'DE': return '0.3800';
    case 'FR': return '0.0520';
    case 'IN': return '0.7100';
    case 'JP': return '0.4500';
    case 'AU': return '0.6800';
    case 'CA': return '0.1200';
    default: return '0.1294';
  }
}
