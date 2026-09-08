import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { OrganizationSetup, CountryCode, CURRENCIES, getCurrencySymbol } from '../types/ghg';
import { Tooltip } from './Tooltip';

interface SetupTabProps {
  setup: OrganizationSetup;
  onChange: (updated: Partial<OrganizationSetup>) => void;
}

export const SetupTab: React.FC<SetupTabProps> = ({ setup, onChange }) => {
  const currSym = getCurrencySymbol(setup.currency || 'USD');

  const [openGuides, setOpenGuides] = useState<{ standard: boolean; boundary: boolean; gwp: boolean }>({
    standard: false,
    boundary: false,
    gwp: false,
  });

  const toggleGuide = (key: 'standard' | 'boundary' | 'gwp') => {
    setOpenGuides((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allOpen = openGuides.standard && openGuides.boundary && openGuides.gwp;
  const toggleAllGuides = () => {
    const next = !allOpen;
    setOpenGuides({ standard: next, boundary: next, gwp: next });
  };

  const handleFrameworkToggle = (fw: string) => {
    const current = setup.frameworks || [];
    if (current.includes(fw)) {
      onChange({ frameworks: current.filter((x) => x !== fw) });
    } else {
      onChange({ frameworks: [...current, fw] });
    }
  };

  return (
    <section className="tab-pane">
      {/* 1. Organization & Reporting */}
      <div className="form-card">
        <div className="form-card-header">
          Organization &amp; Reporting
          <Tooltip content="Legal entity metadata, reporting year, and reporting currency" showIcon />
        </div>
        <div className="form-card-body">
          <div className="field-desc" style={{ marginBottom: 14 }}>
            <span className="req">*</span> Required fields for inventory calculation.
          </div>

          <div className="grid-2col">
            <div className="form-group">
              <label className="field-label">
                Organization name <span className="req">*</span>
                <Tooltip content="Used as report title and certification header" showIcon />
              </label>
              <input
                type="text"
                value={setup.orgName}
                onChange={(e) => onChange({ orgName: e.target.value })}
                placeholder="e.g. Acme Corporation"
              />
            </div>

            <div className="form-group">
              <label className="field-label">
                Country <span className="req">*</span>{' '}
                <span className="opt">— determines grid/fuel emission factors</span>
                <Tooltip content="Select primary country of operations for national grid intensity factors" showIcon />
              </label>
              <select
                value={setup.country}
                onChange={(e) => onChange({ country: e.target.value as CountryCode })}
              >
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IN">India</option>
                <option value="JP">Japan</option>
                <option value="AU">Australia</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>

          <div className="grid-2col">
            <div className="form-group">
              <label className="field-label">
                State / Region <span className="opt">OPTIONAL</span>
              </label>
              <input
                type="text"
                value={setup.region}
                onChange={(e) => onChange({ region: e.target.value })}
                placeholder="e.g. Maharashtra, California, Greater London..."
              />
            </div>

            <div className="form-group">
              <label className="field-label">
                Industry <span className="opt">OPTIONAL — for context/reporting only, not used in calculations</span>
              </label>
              <select
                value={setup.industry}
                onChange={(e) => onChange({ industry: e.target.value })}
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Technology & Software">Technology &amp; Software</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Retail & Consumer Goods">Retail &amp; Consumer Goods</option>
                <option value="Healthcare & Pharma">Healthcare &amp; Pharma</option>
                <option value="Energy & Utilities">Energy &amp; Utilities</option>
                <option value="Construction & Real Estate">Construction &amp; Real Estate</option>
                <option value="Transportation & Logistics">Transportation &amp; Logistics</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid-2col">
            <div className="form-group">
              <label className="field-label">
                Reporting year <span className="req">*</span>
              </label>
              <select
                value={setup.reportingYear}
                onChange={(e) => onChange({ reportingYear: e.target.value })}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label">
                Reporting currency <span className="req">*</span>
                <Tooltip content="Base financial currency used for revenue turnover and carbon intensity ratios" showIcon />
              </label>
              <select
                value={setup.currency || 'USD'}
                onChange={(e) => onChange({ currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GHG Accounting Standards & Boundaries */}
      <div className="form-card">
        <div className="form-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            GHG Accounting
            <Tooltip content="Protocol rules, boundaries, and GWP conversion factors" showIcon />
          </div>
          <div className="form-card-header-actions">
            <button
              type="button"
              className="btn-card-action"
              onClick={toggleAllGuides}
              title={allOpen ? 'Collapse all comparison guides' : 'Expand all comparison guides'}
            >
              {allOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span>{allOpen ? 'Collapse All Guides' : 'Expand All Guides'}</span>
            </button>
          </div>
        </div>
        <div className="form-card-body">
          {/* 2.1 Accounting Standard */}
          <div className="form-group">
            <label className="field-label">
              Accounting standard <span className="req">*</span>
              <Tooltip content="Inventory framework & Scope 2 dual-reporting rules" showIcon />
            </label>
            <div className="field-desc">
              Defines calculation methodology and whether market-based Scope 2 is enabled.
            </div>
            <select
              value={setup.accountingStandard}
              onChange={(e) => onChange({ accountingStandard: e.target.value as any })}
            >
              <option value="GHG Protocol Corporate Standard">GHG Protocol Corporate Standard</option>
              <option value="ISO 14064-1:2018">ISO 14064-1:2018</option>
              <option value="PCAF (financed emissions)">PCAF (financed emissions)</option>
            </select>

            <div>
              <button
                type="button"
                className={`meta-accordion-toggle ${openGuides.standard ? 'active' : ''}`}
                onClick={() => toggleGuide('standard')}
                aria-expanded={openGuides.standard}
              >
                <Info size={13} />
                <span>{openGuides.standard ? 'Hide standards comparison' : 'Compare standards & methodology'}</span>
                <ChevronDown size={14} className={`meta-accordion-chevron ${openGuides.standard ? 'open' : ''}`} />
              </button>

              {openGuides.standard && (
                <div className="meta-accordion-content">
                  <table className="meta-table meta-table-interactive">
                    <thead>
                      <tr>
                        <th style={{ width: '35%' }}>Standard</th>
                        <th>What it determines</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={setup.accountingStandard === 'GHG Protocol Corporate Standard' ? 'selected' : ''}
                        onClick={() => onChange({ accountingStandard: 'GHG Protocol Corporate Standard' })}
                        title="Click to select GHG Protocol Corporate Standard"
                      >
                        <td>
                          GHG Protocol Corporate Standard
                          {setup.accountingStandard === 'GHG Protocol Corporate Standard' && (
                            <span className="meta-badge">SELECTED</span>
                          )}
                        </td>
                        <td>Baseline methodology with market-based Scope 2 dual-reporting.</td>
                      </tr>
                      <tr
                        className={setup.accountingStandard === 'ISO 14064-1:2018' ? 'selected' : ''}
                        onClick={() => onChange({ accountingStandard: 'ISO 14064-1:2018' })}
                        title="Click to select ISO 14064-1:2018"
                      >
                        <td>
                          ISO 14064-1:2018
                          {setup.accountingStandard === 'ISO 14064-1:2018' && (
                            <span className="meta-badge">SELECTED</span>
                          )}
                        </td>
                        <td>Direct and indirect categorizations; market-based Scope 2 omitted.</td>
                      </tr>
                      <tr
                        className={setup.accountingStandard === 'PCAF (financed emissions)' ? 'selected' : ''}
                        onClick={() => onChange({ accountingStandard: 'PCAF (financed emissions)' })}
                        title="Click to select PCAF"
                      >
                        <td>
                          PCAF (financed emissions)
                          {setup.accountingStandard === 'PCAF (financed emissions)' && (
                            <span className="meta-badge">SELECTED</span>
                          )}
                        </td>
                        <td>For financial institutions reporting financed/facilitated Scope 3 Cat 15 emissions.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 2.2 Organizational Boundary */}
          <div className="form-group" style={{ marginTop: 22 }}>
            <label className="field-label">
              Organizational boundary <span className="req">*</span>
              <Tooltip content="Consolidation rule for subsidiaries and joint operations" showIcon />
            </label>
            <div className="field-desc">
              Defines how operations and subsidiaries are consolidated across all scopes.
            </div>
            <select
              value={setup.boundary}
              onChange={(e) => onChange({ boundary: e.target.value as any })}
            >
              <option value="">— Not selected —</option>
              <option value="Operational Control">Operational Control</option>
              <option value="Financial Control">Financial Control</option>
              <option value="Equity Share">Equity Share</option>
            </select>

            <div>
              <button
                type="button"
                className={`meta-accordion-toggle ${openGuides.boundary ? 'active' : ''}`}
                onClick={() => toggleGuide('boundary')}
                aria-expanded={openGuides.boundary}
              >
                <Info size={13} />
                <span>{openGuides.boundary ? 'Hide boundary approaches' : 'Compare consolidation approaches'}</span>
                <ChevronDown size={14} className={`meta-accordion-chevron ${openGuides.boundary ? 'open' : ''}`} />
              </button>

              {openGuides.boundary && (
                <div className="meta-accordion-content">
                  <table className="meta-table meta-table-interactive">
                    <thead>
                      <tr>
                        <th style={{ width: '35%' }}>Approach</th>
                        <th>What it includes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={setup.boundary === 'Operational Control' ? 'selected' : ''}
                        onClick={() => onChange({ boundary: 'Operational Control' })}
                        title="Click to select Operational Control"
                      >
                        <td>
                          Operational Control
                          {setup.boundary === 'Operational Control' && <span className="meta-badge">SELECTED</span>}
                        </td>
                        <td>100% of emissions from operations you introduce operating policies for.</td>
                      </tr>
                      <tr
                        className={setup.boundary === 'Financial Control' ? 'selected' : ''}
                        onClick={() => onChange({ boundary: 'Financial Control' })}
                        title="Click to select Financial Control"
                      >
                        <td>
                          Financial Control
                          {setup.boundary === 'Financial Control' && <span className="meta-badge">SELECTED</span>}
                        </td>
                        <td>100% of emissions from operations where you direct financial policies.</td>
                      </tr>
                      <tr
                        className={setup.boundary === 'Equity Share' ? 'selected' : ''}
                        onClick={() => onChange({ boundary: 'Equity Share' })}
                        title="Click to select Equity Share"
                      >
                        <td>
                          Equity Share
                          {setup.boundary === 'Equity Share' && <span className="meta-badge">SELECTED</span>}
                        </td>
                        <td>Emissions in proportion to your equity ownership share.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!setup.boundary && (
              <div style={{ fontSize: '11.5px', color: '#92580a', marginTop: 6 }}>
                ⚠ Boundary unselected — required before final verification.
              </div>
            )}
          </div>

          {/* 2.3 GWP Basis */}
          <div className="form-group" style={{ marginTop: 22 }}>
            <label className="field-label">
              Global Warming Potential (GWP) basis <span className="req">*</span>
              <Tooltip content="IPCC 100-year factors converting non-CO2 gases to CO2e" showIcon />
            </label>
            <div className="field-desc">
              Converts non-CO2 gases (methane, N2O, refrigerants) into CO2 equivalents over 100 years.
            </div>
            <select
              value={setup.gwpBasis}
              onChange={(e) => onChange({ gwpBasis: e.target.value as any })}
            >
              <option value="AR5">IPCC AR5 (100-yr)</option>
              <option value="AR4">IPCC AR4 (100-yr)</option>
              <option value="AR6">IPCC AR6 (100-yr)</option>
            </select>

            <div>
              <button
                type="button"
                className={`meta-accordion-toggle ${openGuides.gwp ? 'active' : ''}`}
                onClick={() => toggleGuide('gwp')}
                aria-expanded={openGuides.gwp}
              >
                <Info size={13} />
                <span>{openGuides.gwp ? 'Hide IPCC assessment reports' : 'Compare IPCC GWP assessment factors'}</span>
                <ChevronDown size={14} className={`meta-accordion-chevron ${openGuides.gwp ? 'open' : ''}`} />
              </button>

              {openGuides.gwp && (
                <div className="meta-accordion-content">
                  <table className="meta-table meta-table-interactive">
                    <thead>
                      <tr>
                        <th style={{ width: '35%' }}>IPCC Report</th>
                        <th>What it means here</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={setup.gwpBasis === 'AR4' ? 'selected' : ''}
                        onClick={() => onChange({ gwpBasis: 'AR4' })}
                        title="Click to select IPCC AR4"
                      >
                        <td>
                          IPCC AR4 (100-yr) (2007)
                          {setup.gwpBasis === 'AR4' && <span className="meta-badge">SELECTED</span>}
                        </td>
                        <td>Fourth Assessment Report values referenced by older regulations.</td>
                      </tr>
                      <tr
                        className={setup.gwpBasis === 'AR5' ? 'selected' : ''}
                        onClick={() => onChange({ gwpBasis: 'AR5' })}
                        title="Click to select IPCC AR5"
                      >
                        <td>
                          IPCC AR5 (100-yr) (2013–14)
                          {setup.gwpBasis === 'AR5' && <span className="meta-badge">SELECTED</span>}
                        </td>
                        <td>Fifth Assessment Report values (default for this tool and primary factors).</td>
                      </tr>
                      <tr
                        className={setup.gwpBasis === 'AR6' ? 'selected' : ''}
                        onClick={() => onChange({ gwpBasis: 'AR6' })}
                        title="Click to select IPCC AR6"
                      >
                        <td>
                          IPCC AR6 (100-yr) (2021)
                          {setup.gwpBasis === 'AR6' && <span className="meta-badge">SELECTED</span>}
                        </td>
                        <td>Sixth Assessment Report values required by newest standards (CSRD/ESRS).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reporting Frameworks */}
      <div className="form-card">
        <div className="form-card-header">
          Reporting Frameworks <span style={{ fontSize: 12, fontWeight: 'normal', color: '#5e685f' }}>Optional</span>
          <Tooltip content="Target frameworks for reporting (CSRD, CDP, GRI)" showIcon />
        </div>
        <div className="form-card-body">
          <div className="field-desc">
            Frameworks you intend to report against; included in export reports and audit trails.
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 10 }}>
            {['BRSR', 'GRI', 'ISSB / IFRS S2', 'CDP', 'CSRD / ESRS', 'Other'].map((fw) => (
              <label key={fw} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={setup.frameworks?.includes(fw)}
                  onChange={() => handleFrameworkToggle(fw)}
                />
                <span>{fw}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Advanced Intensity Metrics */}
      <div className="form-card">
        <div className="form-card-header">
          Advanced — intensity metrics (optional)
          <Tooltip content="Operational activity denominators for carbon intensity KPIs" showIcon />
        </div>
        <div className="form-card-body">
          <div className="field-desc">
            Enables intensity calculations in Results (per {currSym}1k revenue, per FTE, per m² area).
          </div>
          <div className="grid-3col">
            <div className="form-group">
              <label className="field-label">
                Annual Revenue ({currSym.trim() || setup.currency || 'USD'})
                <Tooltip content="Gross turnover for revenue intensity" showIcon />
              </label>
              <input
                type="number"
                value={setup.revenue}
                onChange={(e) => onChange({ revenue: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="e.g. 20000000"
              />
            </div>
            <div className="form-group">
              <label className="field-label">
                Full-Time Employees (FTE)
                <Tooltip content="Average headcount for per-employee intensity" showIcon />
              </label>
              <input
                type="number"
                value={setup.fte}
                onChange={(e) => onChange({ fte: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="e.g. 160"
              />
            </div>
            <div className="form-group">
              <label className="field-label">
                Floor Area (m²)
                <Tooltip content="Facility area for per-m² intensity" showIcon />
              </label>
              <input
                type="number"
                value={setup.floorArea}
                onChange={(e) => onChange({ floorArea: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="e.g. 8500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
