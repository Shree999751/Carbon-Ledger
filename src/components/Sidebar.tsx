import React, { useRef } from 'react';
import {
  Compass,
  Leaf,
  Building2,
  Layers,
  BarChart3,
  TrendingUp,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  ShieldCheck,
  Award,
  X,
} from 'lucide-react';
import { MainTabType } from './Navbar';
import { OrganizationSetup, CalculatedInventory } from '../types/ghg';
import { parseCsvFile } from '../utils/csvHelper';

interface SidebarProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  setup: OrganizationSetup;
  calculated: CalculatedInventory;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onShowToast: (msg: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  setup,
  calculated,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onLoadSample,
  onClear,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems: {
    id: MainTabType;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'setup',
      label: '1. Setup & Boundary',
      shortLabel: 'Setup',
      icon: <Building2 size={18} />,
    },
    {
      id: 'activity',
      label: '2. Activity Data',
      shortLabel: 'Activity',
      icon: <Layers size={18} />,
      badge: 'Scopes 1-3',
    },
    {
      id: 'results',
      label: '3. Inventory Results',
      shortLabel: 'Results',
      icon: <BarChart3 size={18} />,
      badge: calculated.totalReportableT > 0 ? `${calculated.totalReportableT.toFixed(1)} t` : undefined,
    },
    {
      id: 'benchmarking',
      label: '4. Benchmarking',
      shortLabel: 'Benchmark',
      icon: <TrendingUp size={18} />,
    },
    {
      id: 'scenarios',
      label: '5. Scenarios Simulator',
      shortLabel: 'Scenarios',
      icon: <Sparkles size={18} />,
    },
    {
      id: 'report',
      label: '6. Report & Downloads',
      shortLabel: 'Report',
      icon: <FileText size={18} />,
      badge: 'Audit Ready',
    },
  ];

  const handleSelectTab = (tab: MainTabType) => {
    onChangeTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const res = parseCsvFile(text);
      if (res.valid) {
        onShowToast(`Uploaded CSV: ${res.rowsCount} activity rows identified`);
      } else {
        onShowToast('Invalid or empty CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const grandTotal = calculated.grandTotalT;
  const s1Total = calculated.scope1.totalT;
  const s2Total = calculated.scope2.hasMarketBased
    ? calculated.scope2.marketTotalT
    : calculated.scope2.locationTotalT;
  const s3Total = calculated.scope3.totalT;

  const pS1 = grandTotal > 0 ? Math.round((s1Total / grandTotal) * 100) : 0;
  const pS2 = grandTotal > 0 ? Math.round((s2Total / grandTotal) * 100) : 0;
  const pS3 = grandTotal > 0 ? Math.round((s3Total / grandTotal) * 100) : 0;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-aside ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Sidebar navigation"
      >
        {/* BRAND & HEADER SECTION */}
        <div className="sidebar-header">
          <div className="sidebar-brand-group">
            <div className="sidebar-logo-box">
              <Compass size={18} strokeWidth={2.4} color="#ffffff" />
            </div>
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <div className="sidebar-app-name">Carbon Compass</div>
                <div className="sidebar-app-sub">GHG Corporate System</div>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand toggle button */}
          <button
            type="button"
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={onCloseMobile}
            title="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* ORGANIZATION STATUS CHIP */}
        {!isCollapsed && (
          <div className="sidebar-org-card">
            <div className="org-card-top">
              <span className="org-name-text">
                {setup.orgName || 'Your Organization'}
              </span>
              <span className="org-flag-badge">{setup.country}</span>
            </div>
            <div className="org-card-sub">
              <span>FY {setup.reportingYear}</span>
              <span className="org-dot-sep">·</span>
              <span className="org-boundary-text">
                {setup.boundary || 'Operational Control'}
              </span>
            </div>
          </div>
        )}

        {/* PRIMARY NAVIGATION LINKS */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            {!isCollapsed ? 'NAVIGATION' : '•••'}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-item-icon">{item.icon}</div>
                {!isCollapsed && (
                  <div className="nav-item-content">
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-item-badge ${item.id === 'report' ? 'verified' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {isActive && <div className="active-rail-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* LIVE CARBON FOOTPRINT MINI-WIDGET */}
        {!isCollapsed && (
          <div className="sidebar-carbon-widget">
            <div className="carbon-widget-header">
              <div className="widget-header-title">Live Footprint</div>
              <span className="widget-header-pill">FY {setup.reportingYear}</span>
            </div>

            <div className="carbon-widget-kpi">
              <span className="widget-kpi-num">
                {calculated.totalReportableT > 0
                  ? calculated.totalReportableT.toFixed(1)
                  : '0.0'}
              </span>
              <span className="widget-kpi-unit">tCO2e</span>
            </div>
            <div className="widget-kpi-label">Total Reportable (Scope 1+2)</div>

            <div className="widget-bars-group">
              {/* Scope 1 bar */}
              <div className="widget-bar-row">
                <span className="bar-scope-name">S1</span>
                <div className="bar-track">
                  <div className="bar-fill s1" style={{ width: `${pS1}%` }} />
                </div>
                <span className="bar-val">{s1Total.toFixed(1)}t</span>
              </div>

              {/* Scope 2 bar */}
              <div className="widget-bar-row">
                <span className="bar-scope-name">S2</span>
                <div className="bar-track">
                  <div className="bar-fill s2" style={{ width: `${pS2}%` }} />
                </div>
                <span className="bar-val">{s2Total.toFixed(1)}t</span>
              </div>

              {/* Scope 3 bar */}
              <div className="widget-bar-row">
                <span className="bar-scope-name">S3</span>
                <div className="bar-track">
                  <div className="bar-fill s3" style={{ width: `${pS3}%` }} />
                </div>
                <span className="bar-val">{s3Total.toFixed(1)}t</span>
              </div>
            </div>
          </div>
        )}

        {/* QUICK UTILITY ACTION SHORTCUTS */}
        <div className="sidebar-actions-section">
          {!isCollapsed && (
            <div className="sidebar-section-title">TOOLS &amp; ACTIONS</div>
          )}

          <div className="sidebar-action-buttons">
            <button
              type="button"
              className="btn-sidebar-action"
              onClick={onLoadSample}
              title="Load Sample Data"
            >
              <FileSpreadsheet size={15} />
              {!isCollapsed && <span>Load Sample Data</span>}
            </button>

            <button
              type="button"
              className="btn-sidebar-action"
              onClick={() => fileInputRef.current?.click()}
              title="Upload CSV File"
            >
              <Upload size={15} />
              {!isCollapsed && <span>Upload CSV</span>}
            </button>

            <button
              type="button"
              className="btn-sidebar-action"
              onClick={() => {
                onChangeTab('report');
                if (isMobileOpen) onCloseMobile();
              }}
              title="Print / Save PDF Report"
            >
              <Printer size={15} />
              {!isCollapsed && <span>Print / Export PDF</span>}
            </button>

            <button
              type="button"
              className="btn-sidebar-action danger"
              onClick={onClear}
              title="Reset All Activity Data"
            >
              <RotateCcw size={15} />
              {!isCollapsed && <span>Clear Data</span>}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* SIDEBAR FOOTER: ASSURANCE STATUS */}
        <div className="sidebar-footer">
          <div className="footer-status-pill">
            <ShieldCheck size={14} color="var(--primary-forest)" />
            {!isCollapsed && <span>ISO 14064 / GHG Protocol</span>}
          </div>
        </div>
      </aside>
    </>
  );
};
