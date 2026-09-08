import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { Navbar, MainTabType } from './components/Navbar';
import { SetupTab } from './components/SetupTab';
import { ActivityTab } from './components/ActivityTab';
import { ResultsTab } from './components/ResultsTab';
import { BenchmarkingTab } from './components/BenchmarkingTab';
import { ScenariosTab } from './components/ScenariosTab';
import { ReportTab } from './components/ReportTab';

import {
  OrganizationSetup,
  Scope1Inputs,
  Scope2Inputs,
  Scope3CategoryInput,
  DecarbonizationLevers,
} from './types/ghg';
import {
  REGIONAL_EMISSION_FACTORS,
  DEFAULT_SCOPE3_CATEGORIES,
} from './data/emissionFactors';
import {
  SAMPLE_ORG_SETUP,
  SAMPLE_SCOPE1,
  SAMPLE_SCOPE2,
  getSampleScope3,
} from './data/sampleData';
import { calculateInventory } from './utils/calculator';

const STORAGE_KEY = 'CARBON_COMPASS_DATA_V1';

export const App: React.FC = () => {
  // Navigation & Responsive Sidebar States
  const [activeTab, setActiveTab] = useState<MainTabType>('setup');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Setup State
  const [setup, setSetup] = useState<OrganizationSetup>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.setup) return parsed.setup;
      } catch (e) {}
    }
    return {
      orgName: 'Your Organization',
      country: 'UK',
      region: '',
      industry: 'Manufacturing',
      reportingYear: '2026',
      accountingStandard: 'GHG Protocol Corporate Standard',
      boundary: '',
      gwpBasis: 'AR5',
      frameworks: ['CSRD / ESRS'],
      revenue: '',
      fte: '',
      floorArea: '',
    };
  });

  // Scope 1 State
  const [scope1, setScope1] = useState<Scope1Inputs>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.scope1) return parsed.scope1;
      } catch (e) {}
    }
    return {
      naturalGasKwh: '',
      naturalGasUnit: 'kWh',
      mobileDieselL: '',
      mobileUnit: 'L',
      refrigerantKg: '',
      refrigerantType: 'HFC-134a',
      refrigerantGwp: 1300,
      processEmissionsKg: '',
      processEf: '',
      otherAct: '',
      otherEf: '',
      otherName: '',
    };
  });

  // Scope 2 State
  const [scope2, setScope2] = useState<Scope2Inputs>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.scope2) return parsed.scope2;
      } catch (e) {}
    }
    return {
      electricityLocKwh: '',
      electricityMktKwh: '',
      electricityMktEf: '',
      steamKwh: '',
      heatKwh: '',
      coolKwh: '',
    };
  });

  // Scope 3 State
  const [scope3, setScope3] = useState<Scope3CategoryInput[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.scope3) return parsed.scope3;
      } catch (e) {}
    }
    return DEFAULT_SCOPE3_CATEGORIES;
  });

  // Scenarios Levers
  const [levers, setLevers] = useState<DecarbonizationLevers>({
    renewableElectricityPct: 0,
    evFleetPct: 0,
    travelOptimizationPct: 0,
  });

  // Persist state to localStorage
  useEffect(() => {
    const payload = { setup, scope1, scope2, scope3 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [setup, scope1, scope2, scope3]);

  // Reactive Calculation
  const calculated = useMemo(() => {
    return calculateInventory(setup, scope1, scope2, scope3);
  }, [setup, scope1, scope2, scope3]);

  const regionalEf = REGIONAL_EMISSION_FACTORS[setup.country] || REGIONAL_EMISSION_FACTORS.UK;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoadSample = () => {
    setSetup(SAMPLE_ORG_SETUP);
    setScope1(SAMPLE_SCOPE1);
    setScope2(SAMPLE_SCOPE2);
    setScope3(getSampleScope3());
    setIsSampleLoaded(true);
    showToast('Illustrative sample data loaded!');
  };

  const handleClear = () => {
    if (!window.confirm('Reset all entered activity data and custom figures?')) return;
    setScope1({
      naturalGasKwh: '',
      naturalGasUnit: 'kWh',
      mobileDieselL: '',
      mobileUnit: 'L',
      refrigerantKg: '',
      refrigerantType: 'HFC-134a',
      refrigerantGwp: 1300,
      processEmissionsKg: '',
      processEf: '',
      otherAct: '',
      otherEf: '',
      otherName: '',
    });
    setScope2({
      electricityLocKwh: '',
      electricityMktKwh: '',
      electricityMktEf: '',
      steamKwh: '',
      heatKwh: '',
      coolKwh: '',
    });
    setScope3(DEFAULT_SCOPE3_CATEGORIES.map((c) => ({ ...c, activity: '' })));
    setIsSampleLoaded(false);
    showToast('Calculations reset to clean state.');
  };

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed-mode' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        setup={setup}
        calculated={calculated}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onShowToast={showToast}
      />

      <div className="main-viewport">
        <div className="app-container">
          <Header
            setup={setup}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
            onShowToast={showToast}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {activeTab !== 'report' && (
            <NotificationBanner
              setup={setup}
              isSampleLoaded={isSampleLoaded}
              onNavigateToResults={() => setActiveTab('results')}
            />
          )}

          <main className="tab-content-area">
            {activeTab === 'setup' && (
              <SetupTab
                setup={setup}
                onChange={(upd) => setSetup((prev) => ({ ...prev, ...upd }))}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab
                ef={regionalEf}
                scope1={scope1}
                scope2={scope2}
                scope3={scope3}
                calculated={calculated}
                onScope1Change={(upd) => setScope1((prev) => ({ ...prev, ...upd }))}
                onScope2Change={(upd) => setScope2((prev) => ({ ...prev, ...upd }))}
                onScope3Change={(upd) => setScope3(upd)}
              />
            )}

            {activeTab === 'results' && (
              <ResultsTab
                setup={setup}
                calculated={calculated}
                ef={regionalEf}
              />
            )}

            {activeTab === 'benchmarking' && (
              <BenchmarkingTab
                setup={setup}
                calculated={calculated}
              />
            )}

            {activeTab === 'scenarios' && (
              <ScenariosTab
                calculated={calculated}
                levers={levers}
                onLeversChange={(upd) => setLevers((prev) => ({ ...prev, ...upd }))}
              />
            )}

            {activeTab === 'report' && (
              <ReportTab
                setup={setup}
                scope1={scope1}
                scope2={scope2}
                scope3={scope3}
                calculated={calculated}
                ef={regionalEf}
                levers={levers}
                onShowToast={showToast}
              />
            )}
          </main>

          <Navbar activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

          {toastMessage && <div className="toast show">{toastMessage}</div>}
        </div>
      </div>
    </div>
  );
};
export default App;
