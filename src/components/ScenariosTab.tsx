import React from 'react';
import { CalculatedInventory, DecarbonizationLevers } from '../types/ghg';
import { Tooltip } from './Tooltip';

interface ScenariosTabProps {
  calculated: CalculatedInventory;
  levers: DecarbonizationLevers;
  onLeversChange: (updated: Partial<DecarbonizationLevers>) => void;
}

export const ScenariosTab: React.FC<ScenariosTabProps> = ({
  calculated,
  levers,
  onLeversChange,
}) => {
  const { scope1, scope2, scope3, grandTotalT } = calculated;

  // Modeling impact of the 3 levers
  // 1. Renewable switch reduces Scope 2 location-based energy
  const redRenewables = scope2.locationTotalT * (levers.renewableElectricityPct / 100);
  // 2. EV transition reduces Scope 1 mobile combustion
  const redEV = scope1.mobileDieselT * (levers.evFleetPct / 100);
  // 3. Travel optimization reduces Scope 3 business travel (Category 6)
  const businessTravelCat = scope3.categories.find((c) => c.id === 6);
  const travelTco2e = businessTravelCat ? businessTravelCat.tco2e : 0;
  const redTravel = travelTco2e * (levers.travelOptimizationPct / 100);

  const totalReduction = redRenewables + redEV + redTravel;
  const netFootprint = Math.max(0, grandTotalT - totalReduction);
  const redPct = grandTotalT > 0 ? Math.round((totalReduction / grandTotalT) * 100) : 0;

  return (
    <section className="tab-pane">
      <div className="form-card">
        <div className="form-card-header">
          Net-Zero Scenario Simulator
          <Tooltip content="Model emissions reductions across Scopes 1, 2, and 3." showIcon />
        </div>
        <div className="form-card-body">
          <div className="field-desc" style={{ marginBottom: 20 }}>
            Model the effect of three decarbonization levers on your inventory. For planning purposes; see Final Report for baseline formulas.
          </div>

          {/* Lever 1: Renewable Electricity */}
          <div className="slider-row">
            <div className="slider-label-row">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Renewable Electricity Switch
                <Tooltip
                  content="Replaces grid electricity with contracted zero-carbon power (PPAs, GOs, on-site solar)."
                  showIcon
                />
              </span>
              <span>{levers.renewableElectricityPct}%</span>
            </div>
            <div className="slider-sublabel">
              % of Scope 2 electricity switched to zero-carbon supply
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={levers.renewableElectricityPct}
              onChange={(e) =>
                onLeversChange({ renewableElectricityPct: Number(e.target.value) })
              }
            />
          </div>

          {/* Lever 2: EV Fleet Transition */}
          <div className="slider-row">
            <div className="slider-label-row">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                EV Fleet Transition
                <Tooltip
                  content="Shifts fleet to electric vehicles with zero direct tailpipe emissions."
                  showIcon
                />
              </span>
              <span>{levers.evFleetPct}%</span>
            </div>
            <div className="slider-sublabel">
              % of fleet shifted to electric (zero tailpipe emissions)
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={levers.evFleetPct}
              onChange={(e) => onLeversChange({ evFleetPct: Number(e.target.value) })}
            />
          </div>

          {/* Lever 3: Travel Optimization */}
          <div className="slider-row">
            <div className="slider-label-row">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Travel Optimization
                <Tooltip
                  content="Cuts business travel via video conferencing, rail substitution, and travel caps."
                  showIcon
                />
              </span>
              <span>{levers.travelOptimizationPct}%</span>
            </div>
            <div className="slider-sublabel">
              % reduction in Scope 3 business travel
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={levers.travelOptimizationPct}
              onChange={(e) =>
                onLeversChange({ travelOptimizationPct: Number(e.target.value) })
              }
            />
          </div>

          {/* Dynamic Scenario Metrics */}
          <div className="scenario-results-box">
            <div className="scenario-metric">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Baseline footprint (reportable + provisional)
                <Tooltip
                  content="Scope 1, 2, and provisional 3 emissions before reductions."
                  showIcon
                />
              </span>
              <strong>{grandTotalT.toFixed(2)} tCO2e</strong>
            </div>

            <div className="scenario-metric" style={{ color: '#0f5132' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Modeled decarbonization reduction
                <Tooltip
                  content="Annual GHG reduction across all active levers."
                  showIcon
                />
              </span>
              <strong>- {totalReduction.toFixed(2)} tCO2e ({redPct}%)</strong>
            </div>

            <div
              className="scenario-metric"
              style={{
                borderBottom: 'none',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--primary-forest)',
                paddingTop: 10,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                Projected Net Footprint
                <Tooltip
                  content="Projected residual emissions after reductions."
                  showIcon
                />
              </span>
              <span>{netFootprint.toFixed(2)} tCO2e</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
