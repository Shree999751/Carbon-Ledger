import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Building,
  Building2,
  Mail,
  Globe,
  MapPin,
  FileCheck,
  ExternalLink,
  Users,
  MoreVertical,
  Folder,
  Share2,
  Bell,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { OrganizationSetup, CountryCode, CURRENCIES, getCurrencySymbol, ComplianceProject } from '../types/ghg';
import { Tooltip } from './Tooltip';
// import { ProjectsTracker } from './ProjectsTracker';

interface SetupTabProps {
  setup: OrganizationSetup;
  onChange: (updated: Partial<OrganizationSetup>) => void;
  projects?: ComplianceProject[];
  onUpdateProject?: (p: ComplianceProject) => void;
  onAddProject?: (p: ComplianceProject) => void;
  onOpenDriveFolder?: (folder?: string) => void;
}

export const SetupTab: React.FC<SetupTabProps> = ({
  setup,
  onChange,
  projects = [],
  onUpdateProject,
  onAddProject,
  onOpenDriveFolder,
}) => {
  const currSym = getCurrencySymbol(setup.currency || 'USD');
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

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


  const runningCount = projects.filter((p) => p.status === 'running' || p.status === 'overdue').length;

  return (
    <section className="tab-pane setup-tab-pane">
      {/* 0. Top Entity Overview & Action Header (Matching Reference Screenshot) */}
      <div className="client-entity-banner">
        <div className="client-breadcrumb">
          <span className="breadcrumb-arrow">←</span>
          <span className="breadcrumb-text">CLIENTS</span>
        </div>

        <div className="client-header-main-row">
          <div className="client-title-area">
            <div className="client-title-line">
              <h2 className="client-main-name">{setup.orgName || '44 EMB Studios'}</h2>
              <span className="client-running-dot">•</span>
              <span className="client-running-badge">{runningCount} PROJECTS RUNNING</span>
            </div>
            <div className="client-subline-meta">
              <span>{setup.clientCode || 'CL001'}</span>
              <span>•</span>
              <span>{(setup.industry || 'HAND EMBROIDERY').toUpperCase()}</span>
              <span>•</span>
              <span>{(setup.city || 'MUMBAI').toUpperCase()}</span>
            </div>
          </div>

          <div className="client-header-quick-actions">
            {/* Google Drive Link */}
            <button
              type="button"
              className="quick-icon-btn drive-btn"
              title={`Open Client Evidence Folder (${setup.driveFolder || 'Google Drive'})`}
              onClick={() => onOpenDriveFolder && onOpenDriveFolder(setup.driveFolder)}
            >
              <svg width="20" height="20" viewBox="0 0 87.3 78" className="drive-svg-icon">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </button>

            {/* External Link */}
            <a
              href={setup.website || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-icon-btn"
              title="Visit Corporate Website"
            >
              <ExternalLink size={18} />
            </a>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              className="quick-icon-btn notif-btn"
              title="6 Client Audit Notifications"
            >
              <Bell size={18} />
              <span className="notif-badge">6</span>
            </button>

            {/* 3-Dots Actions Menu */}
            <div className="relative-actions-wrapper" style={{ position: 'relative' }}>
              <button
                type="button"
                className="quick-icon-btn"
                title="Company & Work Actions"
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              >
                <MoreVertical size={18} />
              </button>

              {showCompanyMenu && (
                <div className="company-actions-dropdown">
                  <div className="dropdown-section-title">THE COMPANY</div>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowCompanyMenu(false);
                      const el = document.getElementById('company-card-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Building size={15} />
                    <span>Company profile</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowCompanyMenu(false);
                      const el = document.getElementById('company-card-anchor');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <FileCheck size={15} />
                    <span>Edit company details</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowCompanyMenu(false);
                      alert('Manual report filing module ready. Upload audit evidence or certificate.');
                    }}
                  >
                    <Folder size={15} />
                    <span>File a document by hand</span>
                  </button>
                  <div className="dropdown-item-toggle">
                    <div className="toggle-label-group">
                      <span className="toggle-title">Company on client portal</span>
                      <span className="toggle-sub">They can sign in and see what is published to them</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={setup.clientPortalVisible !== false}
                        onChange={(e) => onChange({ clientPortalVisible: e.target.checked })}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  <div className="dropdown-divider" />
                  <div className="dropdown-section-title">THE WORK</div>
                  
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowCompanyMenu(false);
                      setShowAddContactModal(true);
                    }}
                  >
                    <Users size={15} />
                    <span>Assign managers</span>
                  </button>
                  

                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item danger-item"
                    onClick={() => {
                      setShowCompanyMenu(false);
                      if (window.confirm('Reset this entity setup back to blank?')) {
                        onChange({ orgName: '', legalName: '', taxId: '', address: '' });
                      }
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Reset company record</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. COMPANY & CONTACTS SPLIT ROW (Matching Reference Screenshot 2) */}
      <div className="client-profile-grid" id="company-card-anchor">
        {/* Left Column: COMPANY Card */}
        <div className="form-card entity-profile-card">
          <div className="form-card-header clean-header">
            <span className="header-label-caps">COMPANY</span>
          </div>
          <div className="form-card-body entity-card-body">
            <div className="entity-info-grid">
              <div className="entity-field-group">
                <span className="entity-field-label">LEGAL NAME</span>
                <input
                  type="text"
                  className="clean-field-input"
                  value={setup.legalName || ''}
                  placeholder="e.g. 44 EMB Studio Pvt. Ltd."
                  onChange={(e) => onChange({ legalName: e.target.value })}
                />
              </div>

              <div className="entity-field-group">
                <span className="entity-field-label">INDUSTRY</span>
                <input
                  type="text"
                  className="clean-field-input"
                  value={setup.industry || ''}
                  placeholder="e.g. Hand Embroidery"
                  onChange={(e) => onChange({ industry: e.target.value })}
                />
              </div>

              <div className="entity-field-row-half">
                <div className="entity-field-group">
                  <span className="entity-field-label">CITY</span>
                  <input
                    type="text"
                    className="clean-field-input"
                    value={setup.city || ''}
                    placeholder="e.g. Mumbai"
                    onChange={(e) => onChange({ city: e.target.value })}
                  />
                </div>
                <div className="entity-field-group">
                  <span className="entity-field-label">STATE / REGION</span>
                  <input
                    type="text"
                    className="clean-field-input"
                    value={setup.state || setup.region || ''}
                    placeholder="e.g. Maharashtra"
                    onChange={(e) => onChange({ state: e.target.value, region: e.target.value })}
                  />
                </div>
              </div>

              <div className="entity-field-group">
                <span className="entity-field-label">TAX ID / GSTIN</span>
                <input
                  type="text"
                  className="clean-field-input"
                  value={setup.taxId || ''}
                  placeholder="e.g. 27AABCZ0681L1ZY"
                  onChange={(e) => onChange({ taxId: e.target.value })}
                />
              </div>

              <div className="entity-field-group">
                <span className="entity-field-label">OPERATING ADDRESS</span>
                <textarea
                  rows={2}
                  className="clean-field-textarea"
                  value={setup.address || ''}
                  placeholder="Facility / Plant / Headquarters address..."
                  onChange={(e) => onChange({ address: e.target.value })}
                />
              </div>

              <div className="entity-field-row-half">
                <div className="entity-field-group">
                  <span className="entity-field-label">WEBSITE</span>
                  <input
                    type="text"
                    className="clean-field-input"
                    value={setup.website || ''}
                    placeholder="https://..."
                    onChange={(e) => onChange({ website: e.target.value })}
                  />
                </div>
                <div className="entity-field-group">
                  <span className="entity-field-label">DRIVE FOLDER / EVIDENCE REPO</span>
                  <input
                    type="text"
                    className="clean-field-input"
                    value={setup.driveFolder || ''}
                    placeholder="01: 44 EMB Studios"
                    onChange={(e) => onChange({ driveFolder: e.target.value })}
                  />
                </div>
              </div>

              <div className="entity-field-group" style={{ marginTop: 4 }}>
                <span className="entity-field-label">COMPANY ENTITY / FACILITY SELECTOR</span>
                <select
                  className="clean-field-select"
                  value={setup.selectedEntity || (setup.entities && setup.entities[0]) || '44 EMB Studios - Mumbai'}
                  onChange={(e) => onChange({ selectedEntity: e.target.value })}
                >
                  {(setup.entities && setup.entities.length > 0) ? (
                    setup.entities.map((ent) => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))
                  ) : (
                    <>
                      <option value="44 EMB Studios - Mumbai">44 EMB Studios - Mumbai</option>
                      <option value="44 EMB Studios - Surat Facility">44 EMB Studios - Surat Facility</option>
                      <option value="44 EMB Studios - London Showroom">44 EMB Studios - London Showroom</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CONTACTS & OTHER CONTACTS */}
        <div className="entity-contacts-column">
          {/* Contacts Card */}
          <div className="form-card entity-contacts-card">
            <div className="form-card-header clean-header">
              <span className="header-label-caps">CONTACTS</span>
            </div>
            <div className="form-card-body contacts-card-body">
              <div className="contact-item-block">
                <div className="contact-role-sub">PRIMARY CONTACT • ACCOUNT MANAGER</div>
                <div className="contact-person-name">
                  {setup.primaryContact?.name || 'Ms. Sufera Adenwala'}
                </div>
                <div className="contact-person-email">
                  {setup.primaryContact?.email || 'sufera@44embstudio.com'}
                </div>
              </div>

              <div className="contact-divider" />

              <div className="contact-item-block">
                <div className="contact-role-sub">SECONDARY CONTACT • AUDIT COORDINATOR</div>
                <div className="contact-person-name">
                  {setup.secondaryContact?.name || 'Ms. Misbah Kapadia'}
                </div>
                <div className="contact-person-email">
                  {setup.secondaryContact?.email || 'admin-2@44embstudio.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Other Contacts & Client Portal Seats Card */}
          <div className="form-card portal-seats-card">
            <div className="form-card-header clean-header">
              <span className="header-label-caps">OTHER CONTACTS</span>
            </div>
            <div className="form-card-body seats-card-body">
              <div className="seats-bar">
                <span className="seats-label">CLIENT PORTAL SEATS</span>
                <span className="seat-chip">Supervisor <strong>{setup.portalSeats?.supervisor || '1 of 1'}</strong></span>
                <span className="seat-chip">Member <strong>{setup.portalSeats?.member || '2 of 2'}</strong></span>
                <span className="seat-chip">Special seat <strong>{setup.portalSeats?.special || '1 of 1'}</strong></span>
                <button
                  type="button"
                  className="add-seat-icon-btn"
                  title="Add user seat or invite team member"
                  onClick={() => setShowAddContactModal(true)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="seats-disclaimer-text">
                Only the primary and secondary contacts are on file. Anyone else who matters goes here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects section removed */}

      {/* 3. GHG Protocol & Reporting Baseline (Core Calculation Foundation) */}
      <div className="form-card">
        <div className="form-card-header">
          Organization &amp; Reporting Baseline
          <Tooltip content="Legal entity metadata, reporting year, and reporting currency" showIcon />
        </div>
        <div className="form-card-body">
          <div className="field-desc" style={{ marginBottom: 14 }}>
            <span className="req">*</span> Required parameters for emissions factors selection &amp; conversion.
          </div>

          <div className="grid-2col">
            <div className="form-group">
              <label className="field-label">
                Reporting Entity Display Name <span className="req">*</span>
                <Tooltip content="Used as report title and certification header" showIcon />
              </label>
              <input
                type="text"
                value={setup.orgName}
                onChange={(e) => onChange({ orgName: e.target.value })}
                placeholder="e.g. 44 EMB Studios"
              />
            </div>

            <div className="form-group">
              <label className="field-label">
                Primary Operational Country <span className="req">*</span>{' '}
                <span className="opt">— determines grid &amp; fuel factors</span>
                <Tooltip content="Select country of primary operations for national grid intensity factors" showIcon />
              </label>
              <select
                value={setup.country}
                onChange={(e) => onChange({ country: e.target.value as CountryCode })}
              >
                <option value="IN">India (IN - CEA Grid Factor)</option>
                <option value="UK">United Kingdom (UK - DESNZ 2024)</option>
                <option value="US">United States (US - eGRID 2024)</option>
                <option value="DE">Germany (DE - UBA 2024)</option>
                <option value="FR">France (FR - ADEME 2024)</option>
                <option value="JP">Japan (JP - MOE 2024)</option>
                <option value="AU">Australia (AU - NGA 2024)</option>
                <option value="CA">Canada (CA - NIR 2024)</option>
              </select>
            </div>
          </div>

          <div className="grid-2col">
            <div className="form-group">
              <label className="field-label">
                Reporting Year <span className="req">*</span>
              </label>
              <select
                value={setup.reportingYear}
                onChange={(e) => onChange({ reportingYear: e.target.value })}
              >
                <option value="2026">2026 (Active reporting period)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label">
                Reporting Currency <span className="req">*</span>
                <Tooltip content="Base financial currency used for revenue turnover and carbon intensity ratios" showIcon />
              </label>
              <select
                value={setup.currency || 'INR'}
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
              <Tooltip
                content="Defines calculation methodology and whether market-based Scope 2 is enabled."
                showIcon
                maxWidth={280}
              />
            </label>
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
              <Tooltip
                content="Defines how operations and subsidiaries are consolidated across all scopes (Operational Control, Financial Control, Equity Share)."
                showIcon
                maxWidth={280}
              />
            </label>
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
              <Tooltip
                content="Converts non-CO2 gases (methane, N2O, refrigerants) into CO2 equivalents over 100 years based on IPCC assessment reports."
                showIcon
                maxWidth={280}
              />
            </label>
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

      {/* Contact Assignment & Seats Modal */}
      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title">Stakeholder &amp; Verification Seats</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddContactModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="field-label">Primary Contact / Account Lead</label>
                <input
                  type="text"
                  value={setup.primaryContact?.name || ''}
                  placeholder="Full Name (e.g. Ms. Sufera Adenwala)"
                  onChange={(e) =>
                    onChange({
                      primaryContact: {
                        name: e.target.value,
                        email: setup.primaryContact?.email || '',
                        role: setup.primaryContact?.role || 'Primary Contact & ESG Lead',
                      },
                    })
                  }
                  style={{ marginBottom: 6 }}
                />
                <input
                  type="email"
                  value={setup.primaryContact?.email || ''}
                  placeholder="name@company.com"
                  onChange={(e) =>
                    onChange({
                      primaryContact: {
                        name: setup.primaryContact?.name || '',
                        email: e.target.value,
                        role: setup.primaryContact?.role || 'Primary Contact & ESG Lead',
                      },
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="field-label">Secondary / Lead Verification Contact</label>
                <input
                  type="text"
                  value={setup.secondaryContact?.name || ''}
                  placeholder="Full Name (e.g. Ms. Misbah Kapadia)"
                  onChange={(e) =>
                    onChange({
                      secondaryContact: {
                        name: e.target.value,
                        email: setup.secondaryContact?.email || '',
                        role: setup.secondaryContact?.role || 'Lead Auditor / Coordinator',
                      },
                    })
                  }
                  style={{ marginBottom: 6 }}
                />
                <input
                  type="email"
                  value={setup.secondaryContact?.email || ''}
                  placeholder="auditor@company.com"
                  onChange={(e) =>
                    onChange({
                      secondaryContact: {
                        name: setup.secondaryContact?.name || '',
                        email: e.target.value,
                        role: setup.secondaryContact?.role || 'Lead Auditor / Coordinator',
                      },
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="field-label">Client Portal Seat Allocation</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    title="Supervisor Seats"
                    value={setup.portalSeats?.supervisor || '1 of 1'}
                    onChange={(e) =>
                      onChange({
                        portalSeats: {
                          supervisor: e.target.value,
                          member: setup.portalSeats?.member || '2 of 2',
                          special: setup.portalSeats?.special || '1 of 1',
                        },
                      })
                    }
                  />
                  <input
                    type="text"
                    title="Member Seats"
                    value={setup.portalSeats?.member || '2 of 2'}
                    onChange={(e) =>
                      onChange({
                        portalSeats: {
                          supervisor: setup.portalSeats?.supervisor || '1 of 1',
                          member: e.target.value,
                          special: setup.portalSeats?.special || '1 of 1',
                        },
                      })
                    }
                  />
                  <input
                    type="text"
                    title="Special Seat"
                    value={setup.portalSeats?.special || '1 of 1'}
                    onChange={(e) =>
                      onChange({
                        portalSeats: {
                          supervisor: setup.portalSeats?.supervisor || '1 of 1',
                          member: setup.portalSeats?.member || '2 of 2',
                          special: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowAddContactModal(false)}
                >
                  Save Contacts &amp; Seats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
