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

  // Bar Overview scaling (clean proportional ceiling)
  const maxScopeVal = Math.max(scope1.totalT, scope2.headlineT, scope3.totalT, 1);
  const yCeil = Math.ceil(maxScopeVal / 25) * 25 || 100;
  const s1BarH = Math.max(scope1.totalT > 0 ? 6 : 0, Math.min(100, Math.round((scope1.totalT / yCeil) * 100)));
  const s2BarH = Math.max(scope2.headlineT > 0 ? 6 : 0, Math.min(100, Math.round((scope2.headlineT / yCeil) * 100)));
  const s3BarH = Math.max(scope3.totalT > 0 ? 6 : 0, Math.min(100, Math.round((scope3.totalT / yCeil) * 100)));

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
          <div className="card-val">
            {scope3.totalT > 0 ? scope3.totalT.toFixed(2) : '—'}{' '}
            <span className="card-unit">tCO2e</span>
          </div>
          <div className="card-subtext provisional">
            {scope3.totalT > 0 ? 'Value chain (screening)' : 'no data'}
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
        {/* Widget 1: Scope Breakdown (Donut) */}
        <div className="widget-box modern-widget-box">
          <div className="widget-header-row">
            <div className="widget-title-group">
              <span className="widget-title">Scope Breakdown</span>
              <span className="widget-badge">Gross Footprint</span>
            </div>
            <Tooltip content="Proportional breakdown across Scope 1, Scope 2, and Scope 3 modeled footprint" showIcon />
          </div>

          <div className="donut-modern-layout">
            <div className="donut-chart-wrapper">
              <svg className="donut-chart-svg" viewBox="0 0 120 120">
                {/* Background track */}
                <circle cx="60" cy="60" r="44" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Scope 1 */}
                {pS1 > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke="#15803d"
                    strokeWidth="12"
                    strokeDasharray={`${(pS1 / 100) * 276.46} ${276.46}`}
                    strokeDashoffset="69.11"
                    strokeLinecap="round"
                  />
                )}
                {/* Scope 2 */}
                {pS2 > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="12"
                    strokeDasharray={`${(pS2 / 100) * 276.46} ${276.46}`}
                    strokeDashoffset={69.11 - (pS1 / 100) * 276.46}
                    strokeLinecap="round"
                  />
                )}
                {/* Scope 3 */}
                {pS3 > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="12"
                    strokeDasharray={`${(pS3 / 100) * 276.46} ${276.46}`}
                    strokeDashoffset={69.11 - ((pS1 + pS2) / 100) * 276.46}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="donut-center-overlay">
                <span className="donut-center-kpi">{grandTotalT > 0 ? grandTotalT.toFixed(1) : '0.0'}</span>
                <span className="donut-center-unit">tCO₂e</span>
              </div>
            </div>

            <div className="donut-legend-modern">
              <div className="legend-row-clean">
                <div className="legend-row-top">
                  <div className="legend-name-wrap">
                    <span className="legend-dot s1" />
                    <span className="legend-name">Scope 1 (Direct)</span>
                  </div>
                  <div className="legend-val-wrap">
                    <span className="legend-val">{scope1.totalT.toFixed(1)} t</span>
                    <span className="legend-pct">{pS1}%</span>
                  </div>
                </div>
                <div className="legend-progress-bar">
                  <div className="legend-progress-fill s1" style={{ width: `${pS1}%` }} />
                </div>
              </div>

              <div className="legend-row-clean">
                <div className="legend-row-top">
                  <div className="legend-name-wrap">
                    <span className="legend-dot s2" />
                    <span className="legend-name">Scope 2 (Energy)</span>
                  </div>
                  <div className="legend-val-wrap">
                    <span className="legend-val">{(scope2.hasMarketBased ? scope2.marketTotalT : 0).toFixed(1)} t</span>
                    <span className="legend-pct">{pS2}%</span>
                  </div>
                </div>
                <div className="legend-progress-bar">
                  <div className="legend-progress-fill s2" style={{ width: `${pS2}%` }} />
                </div>
              </div>

              <div className="legend-row-clean">
                <div className="legend-row-top">
                  <div className="legend-name-wrap">
                    <span className="legend-dot s3" />
                    <span className="legend-name">Scope 3 (Value Chain)</span>
                  </div>
                  <div className="legend-val-wrap">
                    <span className="legend-val">{scope3.totalT.toFixed(1)} t</span>
                    <span className="legend-pct">{pS3}%</span>
                  </div>
                </div>
                <div className="legend-progress-bar">
                  <div className="legend-progress-fill s3" style={{ width: `${pS3}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Emissions Intensity Ratios */}
        <div className="widget-box modern-widget-box">
          <div className="widget-header-row">
            <div className="widget-title-group">
              <span className="widget-title">Intensity Ratios</span>
              <span className="widget-badge">Operational KPIs</span>
            </div>
            <Tooltip content="Operational carbon intensity benchmarks normalized by corporate business drivers" showIcon />
          </div>

          <div className="intensity-cards-stack">
            <div className="intensity-metric-card">
              <div className="metric-icon-box rev">
                <TrendingUp size={16} />
              </div>
              <div className="metric-info-col">
                <div className="metric-title-row">
                  <span className="metric-title">Revenue Intensity</span>
                  <span className="metric-unit-badge">kg CO₂e / {currSym}1k</span>
                </div>
                <div className="metric-val-row">
                  <span className="metric-number">
                    {intensity.perRevenue !== null ? intensity.perRevenue.toFixed(2) : '—'}
                  </span>
                  <span className="metric-sub-label">
                    {setup.revenue ? `on ${currSym}${Number(setup.revenue).toLocaleString()} turnover` : 'Turnover pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="intensity-metric-card">
              <div className="metric-icon-box fte">
                <Users size={16} />
              </div>
              <div className="metric-info-col">
                <div className="metric-title-row">
                  <span className="metric-title">Headcount Intensity</span>
                  <span className="metric-unit-badge">tCO₂e / FTE</span>
                </div>
                <div className="metric-val-row">
                  <span className="metric-number">
                    {intensity.perFte !== null ? intensity.perFte.toFixed(2) : '—'}
                  </span>
                  <span className="metric-sub-label">
                    {setup.fte ? `across ${setup.fte} employees` : 'Headcount pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="intensity-metric-card">
              <div className="metric-icon-box area">
                <Building2 size={16} />
              </div>
              <div className="metric-info-col">
                <div className="metric-title-row">
                  <span className="metric-title">Facility Intensity</span>
                  <span className="metric-unit-badge">kg CO₂e / m²</span>
                </div>
                <div className="metric-val-row">
                  <span className="metric-number">
                    {intensity.perFloorArea !== null ? intensity.perFloorArea.toFixed(2) : '—'}
                  </span>
                  <span className="metric-sub-label">
                    {setup.floorArea ? `across ${Number(setup.floorArea).toLocaleString()} m² active area` : 'Area pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Overview Bar Chart */}
        <div className="widget-box modern-widget-box">
          <div className="widget-header-row">
            <div className="widget-title-group">
              <span className="widget-title">Emissions Overview</span>
              <span className="widget-badge">Comparative</span>
            </div>
            <Tooltip content="Comparative volume of emissions by Scope with actual tonnages" showIcon />
          </div>

          <div className="overview-chart-container">
            <div className="overview-chart-canvas">
              {/* Reference Gridlines with Real Values */}
              <div className="overview-gridlines">
                <div className="overview-gridline">
                  <span className="overview-gridline-val">{yCeil} t</span>
                </div>
                <div className="overview-gridline">
                  <span className="overview-gridline-val">{Math.round(yCeil * 0.5)} t</span>
                </div>
                <div className="overview-gridline" style={{ borderBottomStyle: 'solid', borderBottomColor: '#cbd5e1' }}>
                  <span className="overview-gridline-val">0 t</span>
                </div>
              </div>

              {/* Proportional Bars */}
              <div className="overview-bars-row">
                {/* Scope 1 */}
                <div className="overview-bar-item">
                  <div className="overview-bar-val">{scope1.totalT.toFixed(1)}t</div>
                  <div className="overview-bar-track">
                    <div className="overview-bar-fill s1" style={{ height: `${s1BarH}%` }} />
                  </div>
                  <div className="overview-bar-footer">
                    <span className="overview-bar-name">Scope 1</span>
                    <span className="overview-bar-pct">{pS1}%</span>
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="overview-bar-item">
                  <div className="overview-bar-val">{(scope2.hasMarketBased ? scope2.marketTotalT : 0).toFixed(1)}t</div>
                  <div className="overview-bar-track">
                    <div className="overview-bar-fill s2" style={{ height: `${s2BarH}%` }} />
                  </div>
                  <div className="overview-bar-footer">
                    <span className="overview-bar-name">Scope 2</span>
                    <span className="overview-bar-pct">{pS2}%</span>
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="overview-bar-item">
                  <div className="overview-bar-val">{scope3.totalT.toFixed(1)}t</div>
                  <div className="overview-bar-track">
                    <div className="overview-bar-fill s3" style={{ height: `${s3BarH}%` }} />
                  </div>
                  <div className="overview-bar-footer">
                    <span className="overview-bar-name">Scope 3</span>
                    <span className="overview-bar-pct">{pS3}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Inventory Summary Strip */}
            <div className="overview-summary-strip">
              <div className="strip-item">
                <span className="strip-label">Reportable (S1+2):</span>
                <span className="strip-val">{totalReportableT.toFixed(1)} t</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Gross Total:</span>
                <span className="strip-val">{grandTotalT.toFixed(1)} t</span>
              </div>
            </div>
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
