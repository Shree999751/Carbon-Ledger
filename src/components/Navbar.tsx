import React from 'react';
import { MainTabType } from '../types/ghg';

interface NavbarProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: MainTabType; label: string }[] = [
    { id: 'setup', label: '1. Setup' },
    { id: 'activity', label: '2. Activity Data' },
    { id: 'results', label: '3. Results' },
    { id: 'benchmarking', label: '4. Benchmarking' },
    { id: 'scenarios', label: '5. Scenarios' },
    { id: 'report', label: '6. Report & Downloads' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`btn-main-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChangeTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};
