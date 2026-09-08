import React, { useState } from 'react';
import { PeerBenchmark, CalculatedInventory, OrganizationSetup, getCurrencySymbol } from '../types/ghg';
import { Tooltip } from './Tooltip';

interface BenchmarkingTabProps {
  setup: OrganizationSetup;
  calculated: CalculatedInventory;
}

export const BenchmarkingTab: React.FC<BenchmarkingTabProps> = ({
  setup,
  calculated,
}) => {
  const [metric, setMetric] = useState<'total' | 'rev' | 'fte' | 'area'>('total');
  const [peers, setPeers] = useState<PeerBenchmark[]>([
    { id: '1', name: 'Industry Sector Average', value: 120.5 },
    { id: '2', name: 'Peer Group Leader (A-list)', value: 65.0 },
    { id: '3', name: '2030 Science-Based Target', value: 45.0 },
  ]);

  const addPeer = () => {
    setPeers([
      ...peers,
      { id: Date.now().toString(), name: `Competitor ${peers.length + 1}`, value: 100 },
    ]);
  };

  const removePeer = (id: string) => {
    setPeers(peers.filter((p) => p.id !== id));
  };

  const updatePeer = (id: string, updated: Partial<PeerBenchmark>) => {
    setPeers(peers.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const currSym = getCurrencySymbol(setup.currency || 'USD');

  // Compute your organization value for the selected metric
  let yourVal = calculated.totalReportableT;
  let unit = 'tCO2e';

  if (metric === 'rev') {
    yourVal = calculated.intensity.perRevenue || 0;
    unit = `kg / ${currSym}1k`;
  } else if (metric === 'fte') {
    yourVal = calculated.intensity.perFte || 0;
    unit = 'tCO2e / FTE';
  } else if (metric === 'area') {
    yourVal = calculated.intensity.perFloorArea || 0;
    unit = 'kg / m²';
  }

  const allItems = [
    { id: 'you', name: `${setup.orgName || 'Your Organization'} (You)`, value: yourVal, isYou: true },
    ...peers.map((p) => ({ ...p, isYou: false })),
  ];

  const maxVal = Math.max(...allItems.map((x) => x.value), 1);

  return (
    <section className="tab-pane">
      <div className="form-card">
        <div className="form-card-header">
          Peer &amp; Benchmark Comparison
          <Tooltip
            content="Benchmark against competitor disclosures, sector averages, or SBTi targets."
            showIcon
          />
        </div>
        <div className="form-card-body">
          <div className="field-desc">
            Compare your emissions against known competitor figures, investor targets, or historical years. All benchmarks are entered manually.
          </div>

          <div className="form-group" style={{ marginTop: 16, maxWidth: 380 }}>
            <label className="field-label">
              Comparing on
              <Tooltip
                content="Normalizes emissions by scale for fair peer comparison."
                showIcon
              />
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
            >
              <option value="total">Total Reportable Emissions (tCO2e)</option>
              <option value="rev">Emissions per unit revenue (kg / {currSym}1,000)</option>
              <option value="fte">Emissions per employee (tCO2e / FTE)</option>
              <option value="area">Emissions per m² floor area (kg / m²)</option>
            </select>
          </div>

          <div style={{ marginTop: 18, marginBottom: 14 }}>
            {peers.map((peer) => (
              <div
                key={peer.id}
                style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}
              >
                <input
                  type="text"
                  value={peer.name}
                  onChange={(e) => updatePeer(peer.id, { name: e.target.value })}
                  placeholder="Peer entity or target name"
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  value={peer.value}
                  onChange={(e) => updatePeer(peer.id, { value: Number(e.target.value) || 0 })}
                  placeholder="Value"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removePeer(peer.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b91c1c',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: '0 8px',
                  }}
                  title="Remove row"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-action"
            onClick={addPeer}
          >
            + Add peer / benchmark
          </button>
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          Comparison Chart
          <Tooltip
            content="Visualizes your performance against manual peer benchmarks."
            showIcon
          />
        </div>
        <div className="form-card-body">
          {allItems.map((item) => {
            const pct = Math.round((item.value / maxVal) * 100);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 12,
                  fontSize: '12.5px',
                }}
              >
                <div
                  style={{
                    width: 210,
                    fontWeight: item.isYou ? 700 : 500,
                    color: item.isYou ? 'var(--primary-forest)' : 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </div>
                <div style={{ flex: 1, height: 24, background: '#eef2e9', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: item.isYou ? 'var(--primary-forest)' : '#b08968',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ width: 100, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {item.value.toFixed(2)} {unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
