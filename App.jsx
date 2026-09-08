import React, { useState, useMemo } from 'react';

// National / Regional Emission Factors database
const EMISSION_FACTORS = {
  UK: { grid: 0.1294, gas: 0.2022, diesel: 2.5835, petrol: 2.1600 },
  US: { grid: 0.3710, gas: 0.1810, diesel: 2.6900, petrol: 2.3100 },
  DE: { grid: 0.3800, gas: 0.2010, diesel: 2.6100, petrol: 2.1800 },
  FR: { grid: 0.0520, gas: 0.2020, diesel: 2.5900, petrol: 2.1700 },
  IN: { grid: 0.7100, gas: 0.2050, diesel: 2.6800, petrol: 2.2900 },
  JP: { grid: 0.4500, gas: 0.2030, diesel: 2.5800, petrol: 2.2200 },
  AU: { grid: 0.6800, gas: 0.1980, diesel: 2.6800, petrol: 2.2800 },
  CA: { grid: 0.1200, gas: 0.1850, diesel: 2.6800, petrol: 2.2900 },
};

export default function CarbonCompass() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('setup'); // 'setup' | 'activity' | 'results' | 'benchmarking' | 'scenarios' | 'methodology'
  const [scopeSubtab, setScopeSubtab] = useState('scope1'); // 'scope1' | 'scope2' | 'scope3'

  // Organization & Reporting Setup
  const [orgName, setOrgName] = useState('Your Organization');
  const [country, setCountry] = useState('UK');
  const [region, setRegion] = useState('');
  const [industry, setIndustry] = useState('Manufacturing');
  const [reportingYear, setReportingYear] = useState('2026');
  const [accountingStandard, setAccountingStandard] = useState('GHG Protocol Corporate Standard');
  const [boundary, setBoundary] = useState('');
  const [gwpBasis, setGwpBasis] = useState('AR5');
  const [frameworks, setFrameworks] = useState([]);

  // Intensity Metrics Setup
  const [revenue, setRevenue] = useState(20000000);
  const [fte, setFte] = useState(160);
  const [floorArea, setFloorArea] = useState(8500);

  // Scope 1 Activity Inputs
  const [s1NatGas, setS1NatGas] = useState(120000); // kWh
  const [s1Mobile, setS1Mobile] = useState(4500); // L
  const [s1RefrigKg, setS1RefrigKg] = useState(45); // kg
  const [s1RefrigGwp, setS1RefrigGwp] = useState(1300); // HFC-134a
  const [s1Process, setS1Process] = useState('');
  const [s1ProcessEf, setS1ProcessEf] = useState('');
  const [s1Other, setS1Other] = useState('');
  const [s1OtherEf, setS1OtherEf] = useState('');

  // Scope 2 Activity Inputs
  const [s2LocKwh, setS2LocKwh] = useState(450000);
  const [s2MktKwh, setS2MktKwh] = useState(450000);
  const [s2MktEf, setS2MktEf] = useState(0); // e.g. 100% REGOs / Green PPA
  const [s2SteamKwh, setS2SteamKwh] = useState('');
  const [s2HeatKwh, setS2HeatKwh] = useState('');
  const [s2CoolKwh, setS2CoolKwh] = useState('');

  // Scope 3 Activity Inputs (Spend / Activity based)
  const [s3C1Spend, setS3C1Spend] = useState(250000); // Purchased Goods
  const [s3C2Spend, setS3C2Spend] = useState(180000); // Capital Goods
  const [s3C3Spend, setS3C3Spend] = useState('');
  const [s3C4Spend, setS3C4Spend] = useState('');
  const [s3C5Tonnes, setS3C5Tonnes] = useState('');
  const [s3C6Km, setS3C6Km] = useState('');
  const [s3C7Km, setS3C7Km] = useState('');
  const [s3C8Spend, setS3C8Spend] = useState('');
  const [s3C9Spend, setS3C9Spend] = useState('');
  const [s3C10Spend, setS3C10Spend] = useState('');
  const [s3C11Spend, setS3C11Spend] = useState('');
  const [s3C12Tonnes, setS3C12Tonnes] = useState('');
  const [s3C13Spend, setS3C13Spend] = useState('');
  const [s3C14Spend, setS3C14Spend] = useState('');
  const [s3C15Spend, setS3C15Spend] = useState('');

  // Scenarios Levers
  const [leverRenewables, setLeverRenewables] = useState(0);
  const [leverEV, setLeverEV] = useState(0);
  const [leverTravel, setLeverTravel] = useState(0);

  // Benchmarking Peers
  const [peers, setPeers] = useState([]);
  const [benchmarkMetric, setBenchmarkMetric] = useState('total');

  // Active Emission Factors for selected country
  const ef = EMISSION_FACTORS[country] || EMISSION_FACTORS.UK;

  // CALCULATIONS
  const s1NatGasT = (Number(s1NatGas || 0) * ef.gas) / 1000;
  const s1MobileT = (Number(s1Mobile || 0) * ef.diesel) / 1000;
  const s1RefrigT = (Number(s1RefrigKg || 0) * Number(s1RefrigGwp || 1300)) / 1000;
  const s1ProcessT = (Number(s1Process || 0) * Number(s1ProcessEf || 0)) / 1000;
  const s1OtherT = (Number(s1Other || 0) * Number(s1OtherEf || 0)) / 1000;
  const scope1Total = s1NatGasT + s1MobileT + s1RefrigT + s1ProcessT + s1OtherT;

  const s2LocT = (Number(s2LocKwh || 0) * ef.grid) / 1000;
  const s2MktT = (Number(s2MktKwh || 0) * Number(s2MktEf || 0)) / 1000;
  const s2SteamT = (Number(s2SteamKwh || 0) * 0.183) / 1000;
  const s2HeatT = (Number(s2HeatKwh || 0) * 0.183) / 1000;
  const s2CoolT = (Number(s2CoolKwh || 0) * 0.150) / 1000;

  const scope2LocTotal = s2LocT + s2SteamT + s2HeatT + s2CoolT;
  const hasMarketBased = s2MktKwh !== '';
  const scope2MktTotal = (hasMarketBased ? s2MktT : 0) + s2SteamT + s2HeatT + s2CoolT;

  // Scope 3 calculations
  const s3C1T = (Number(s3C1Spend || 0) * 0.201) / 1000;
  const s3C2T = (Number(s3C2Spend || 0) * 0.157) / 1000;
  const s3C3T = (Number(s3C3Spend || 0) * 0.150) / 1000;
  const s3C4T = (Number(s3C4Spend || 0) * 0.120) / 1000;
  const s3C5T = (Number(s3C5Tonnes || 0) * 450.0) / 1000;
  const s3C6T = (Number(s3C6Km || 0) * 0.150) / 1000;
  const s3C7T = (Number(s3C7Km || 0) * 0.090) / 1000;
  const s3C8T = (Number(s3C8Spend || 0) * 0.100) / 1000;
  const s3C9T = (Number(s3C9Spend || 0) * 0.120) / 1000;
  const s3C10T = (Number(s3C10Spend || 0) * 0.180) / 1000;
  const s3C11T = (Number(s3C11Spend || 0) * 0.220) / 1000;
  const s3C12T = (Number(s3C12Tonnes || 0) * 320.0) / 1000;
  const s3C13T = (Number(s3C13Spend || 0) * 0.100) / 1000;
  const s3C14T = (Number(s3C14Spend || 0) * 0.140) / 1000;
  const s3C15T = (Number(s3C15Spend || 0) * 0.080) / 1000;

  const scope3Total = s3C1T + s3C2T + s3C3T + s3C4T + s3C5T + s3C6T + s3C7T + s3C8T + s3C9T + s3C10T + s3C11T + s3C12T + s3C13T + s3C14T + s3C15T;

  const reportableTotal = scope1Total + (hasMarketBased ? scope2MktTotal : 0);
  const grandTotal = reportableTotal + scope3Total;

  // Intensity Ratios
  const perRev = revenue > 0 && grandTotal > 0 ? (grandTotal * 1000 / revenue) * 1000 : 0;
  const perFte = fte > 0 && grandTotal > 0 ? grandTotal / fte : 0;
  const perArea = floorArea > 0 && grandTotal > 0 ? (grandTotal * 1000) / floorArea : 0;

  // Scenario reductions
  const redRenew = s2LocT * (leverRenewables / 100);
  const redEV = s1MobileT * (leverEV / 100);
  const redTravel = s3C6T * (leverTravel / 100);
  const totalReduction = redRenew + redEV + redTravel;
  const scenarioNet = Math.max(0, grandTotal - totalReduction);

  // Load Sample Data action
  const loadSampleData = () => {
    setOrgName('Your Organization');
    setCountry('UK');
    setIndustry('Manufacturing');
    setReportingYear('2026');
    setRevenue(20000000);
    setFte(160);
    setFloorArea(8500);
    setS1NatGas(120000);
    setS1Mobile(4500);
    setS1RefrigKg(45);
    setS2LocKwh(450000);
    setS2MktKwh(450000);
    setS2MktEf(0);
    setS3C1Spend(250000);
    setS3C2Spend(180000);
  };

  const clearAll = () => {
    if (window.confirm('Reset all values to 0?')) {
      setS1NatGas(''); setS1Mobile(''); setS1RefrigKg(''); setS1Process(''); setS1Other('');
      setS2LocKwh(''); setS2MktKwh(''); setS2SteamKwh(''); setS2HeatKwh(''); setS2CoolKwh('');
      setS3C1Spend(''); setS3C2Spend(''); setS3C3Spend(''); setS3C4Spend(''); setS3C5Tonnes('');
      setS3C6Km(''); setS3C7Km(''); setS3C8Spend(''); setS3C9Spend(''); setS3C10Spend('');
      setS3C11Spend(''); setS3C12Tonnes(''); setS3C13Spend(''); setS3C14Spend(''); setS3C15Spend('');
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', background: '#fff', border: '1px solid #d6ddcf', borderRadius: 10, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <header style={{ padding: '24px 32px 18px', borderBottom: '1px solid #d6ddcf' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#163829', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              🌿
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#163829', lineHeight: 1.2 }}>
              Based on GHG<br />Protocol
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.06em', color: '#163829', textTransform: 'uppercase', margin: 0 }}>
              Carbon Accounting Calculator
            </h1>
            <div style={{ fontSize: 13, color: '#5e685f', marginTop: 4 }}>
              {orgName} · {country} · FY {reportingYear}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={loadSampleData} style={{ background: '#f0f7ef', border: '1px solid #a3c99f', color: '#163829', padding: '6px 14px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>
              Load Sample Data
            </button>
            <button onClick={() => window.print()} style={{ background: '#fff', border: '1px solid #b8c4af', padding: '6px 14px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>
              Print / Export Report
            </button>
            <button onClick={clearAll} style={{ background: '#fff', border: '1px solid #b8c4af', padding: '6px 14px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* BANNER */}
      <div style={{ padding: '14px 32px 0' }}>
        <div style={{ background: '#fef8ee', border: '1px solid #fae1b9', borderRadius: 4, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#92580a', fontSize: 12.5, fontWeight: 600 }}>
          <span>⚠ Draft — {boundary === '' ? '4 items require verification (including Boundary approach)' : 'Items pending verification'}</span>
          <button onClick={() => setActiveTab('results')} style={{ background: '#fff', border: '1px solid #d4a373', borderRadius: 4, padding: '3px 12px', color: '#92580a', cursor: 'pointer', fontWeight: 600 }}>
            Results
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '24px 32px' }}>
        {activeTab === 'setup' && (
          <div>
            <div style={{ border: '1px solid #d6ddcf', borderRadius: 6, marginBottom: 20 }}>
              <div style={{ background: '#f4f7f2', padding: '10px 16px', fontWeight: 600, color: '#163829', borderBottom: '1px solid #d6ddcf' }}>
                Organization & Reporting
              </div>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Organization name *</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Country * (Grid & Fuel EF)</label>
                  <select value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Industry</label>
                  <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reporting Year *</label>
                  <select value={reportingYear} onChange={e => setReportingYear(e.target.value)} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }}>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #d6ddcf', borderRadius: 6 }}>
              <div style={{ background: '#f4f7f2', padding: '10px 16px', fontWeight: 600, color: '#163829', borderBottom: '1px solid #d6ddcf' }}>
                Advanced — Intensity Metrics
              </div>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Revenue (€)</label>
                  <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Full-Time Employees (FTE)</label>
                  <input type="number" value={fte} onChange={e => setFte(Number(e.target.value))} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Floor Area (m²)</label>
                  <input type="number" value={floorArea} onChange={e => setFloorArea(Number(e.target.value))} style={{ width: '100%', height: 36, padding: '6px 10px', border: '1px solid #b8c4af', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setScopeSubtab('scope1')} style={{ padding: '6px 18px', fontWeight: 600, borderRadius: 4, border: '1px solid #d6ddcf', background: scopeSubtab === 'scope1' ? '#fff' : '#eef2e9', color: scopeSubtab === 'scope1' ? '#163829' : '#5e685f', cursor: 'pointer' }}>
                Scope 1
              </button>
              <button onClick={() => setScopeSubtab('scope2')} style={{ padding: '6px 18px', fontWeight: 600, borderRadius: 4, border: '1px solid #d6ddcf', background: scopeSubtab === 'scope2' ? '#fff' : '#eef2e9', color: scopeSubtab === 'scope2' ? '#163829' : '#5e685f', cursor: 'pointer' }}>
                Scope 2
              </button>
              <button onClick={() => setScopeSubtab('scope3')} style={{ padding: '6px 18px', fontWeight: 600, borderRadius: 4, border: '1px solid #d6ddcf', background: scopeSubtab === 'scope3' ? '#fff' : '#eef2e9', color: scopeSubtab === 'scope3' ? '#163829' : '#5e685f', cursor: 'pointer' }}>
                Scope 3
              </button>
            </div>

            {scopeSubtab === 'scope1' && (
              <div style={{ border: '1px solid #d6ddcf', borderRadius: 4, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead style={{ background: '#143527', color: '#fff' }}>
                    <tr>
                      <th style={{ padding: 8, textAlign: 'left' }}>SOURCE</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>UNIT</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>ACTIVITY DATA</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>EF (KG CO2E/UNIT)</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>TCO2E</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>Stationary Combustion (Natural Gas)</td>
                      <td style={{ padding: 8 }}>kWh</td>
                      <td style={{ padding: 8 }}><input type="number" value={s1NatGas} onChange={e => setS1NatGas(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}>{ef.gas.toFixed(4)}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s1NatGasT.toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>Mobile Combustion (Diesel)</td>
                      <td style={{ padding: 8 }}>L</td>
                      <td style={{ padding: 8 }}><input type="number" value={s1Mobile} onChange={e => setS1Mobile(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}>{ef.diesel.toFixed(4)}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s1MobileT.toFixed(3)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>Refrigerant Leakage (HFC-134a)</td>
                      <td style={{ padding: 8 }}>kg</td>
                      <td style={{ padding: 8 }}><input type="number" value={s1RefrigKg} onChange={e => setS1RefrigKg(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}>1,300 (AR5 GWP)</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s1RefrigT.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ background: '#e8efe5', padding: '12px 18px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', color: '#163829' }}>
                  <span>REPORTABLE SCOPE 1</span>
                  <span>{scope1Total.toFixed(2)} tCO2e</span>
                </div>
              </div>
            )}

            {scopeSubtab === 'scope2' && (
              <div style={{ border: '1px solid #d6ddcf', borderRadius: 4, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead style={{ background: '#143527', color: '#fff' }}>
                    <tr>
                      <th style={{ padding: 8, textAlign: 'left' }}>SOURCE</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>UNIT</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>ACTIVITY DATA</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>EF (KG CO2E/UNIT)</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>TCO2E</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>Electricity (Location-based)</td>
                      <td style={{ padding: 8 }}>kWh</td>
                      <td style={{ padding: 8 }}><input type="number" value={s2LocKwh} onChange={e => setS2LocKwh(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}>{ef.grid.toFixed(4)}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s2LocT.toFixed(3)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>Electricity (Market-based)</td>
                      <td style={{ padding: 8 }}>kWh</td>
                      <td style={{ padding: 8 }}><input type="number" value={s2MktKwh} onChange={e => setS2MktKwh(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}><input type="number" value={s2MktEf} onChange={e => setS2MktEf(e.target.value)} style={{ width: 80, height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s2MktT.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ background: '#fdfaf3', borderTop: '1px solid #edd9bf', padding: '10px 18px', color: '#935610', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>REPORTABLE SCOPE 2 — market-based (headline)</span>
                  <span>{scope2MktTotal.toFixed(2)} tCO2e</span>
                </div>
                <div style={{ background: '#fdfaf3', padding: '6px 18px 10px', color: '#636b64', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Scope 2 — location-based (reference)</span>
                  <span>{scope2LocTotal.toFixed(2)} tCO2e</span>
                </div>
              </div>
            )}

            {scopeSubtab === 'scope3' && (
              <div style={{ border: '1px solid #d6ddcf', borderRadius: 4, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead style={{ background: '#143527', color: '#fff' }}>
                    <tr>
                      <th style={{ padding: 8, textAlign: 'left' }}>CATEGORY</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>UNIT</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>ACTIVITY DATA</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>EF (KG CO2E/UNIT)</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>TCO2E</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>1. Purchased Goods & Services</td>
                      <td style={{ padding: 8 }}>EUR</td>
                      <td style={{ padding: 8 }}><input type="number" value={s3C1Spend} onChange={e => setS3C1Spend(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}>0.201</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s3C1T.toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #edf0ea' }}>
                      <td style={{ padding: 8 }}>2. Capital Goods</td>
                      <td style={{ padding: 8 }}>EUR</td>
                      <td style={{ padding: 8 }}><input type="number" value={s3C2Spend} onChange={e => setS3C2Spend(e.target.value)} style={{ height: 32, padding: '4px 8px' }} /></td>
                      <td style={{ padding: 8 }}>0.157</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{s3C2T.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ background: '#eef3ea', padding: '12px 18px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', color: '#163829' }}>
                  <span>PROVISIONAL SCOPE 3 FOOTPRINT</span>
                  <span>{scope3Total.toFixed(2)} tCO2e</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <h2 style={{ fontSize: 22, color: '#163829', marginBottom: 16 }}>
              FY {reportingYear} GHG Inventory — {orgName}
            </h2>

            {/* SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
              <div style={{ border: '1px solid #d6ddcf', borderTop: '3px solid #163829', padding: '14px 18px', borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5e685f' }}>SCOPE 1</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{scope1Total.toFixed(2)} <span style={{ fontSize: 12 }}>tCO2e</span></div>
                <div style={{ fontSize: 11, color: '#0f5132', marginTop: 4 }}>✓ verified</div>
              </div>
              <div style={{ border: '1px solid #d6ddcf', borderTop: '3px solid #c68a4c', padding: '14px 18px', borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5e685f' }}>SCOPE 2</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{hasMarketBased ? scope2MktTotal.toFixed(2) : '—'}</div>
                <div style={{ fontSize: 11, color: '#5e685f', marginTop: 4 }}>{hasMarketBased ? 'market-based' : 'no data'}</div>
              </div>
              <div style={{ border: '1px solid #d6ddcf', borderTop: '3px solid #7592a6', padding: '14px 18px', borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5e685f' }}>SCOPE 3</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>—</div>
                <div style={{ fontSize: 11, color: '#855307', marginTop: 4 }}>⚠ provisional only: {scope3Total.toFixed(2)} t</div>
              </div>
              <div style={{ border: '2px solid #163829', background: '#f7faf5', padding: '14px 18px', borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5e685f' }}>TOTAL REPORTABLE</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{reportableTotal.toFixed(2)} <span style={{ fontSize: 12 }}>tCO2e</span></div>
                <div style={{ fontSize: 11, color: '#5e685f', marginTop: 4 }}>+ {scope3Total.toFixed(2)} t provisional</div>
              </div>
            </div>

            {/* INTENSITY RATIOS & SUMMARY */}
            <div style={{ border: '1px solid #d6ddcf', borderRadius: 6, padding: 18, background: '#fbfdfa' }}>
              <div style={{ fontWeight: 600, color: '#163829', marginBottom: 12 }}>Emissions Intensity Ratios</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#5e685f' }}>Per unit revenue</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#163829' }}>{perRev.toFixed(2)} kg / €1,000</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{grandTotal.toFixed(1)} t ÷ €{revenue.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#5e685f' }}>Per employee</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#163829' }}>{perFte.toFixed(2)} tCO2e</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{grandTotal.toFixed(1)} t ÷ {fte} employees</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#5e685f' }}>Per m² floor area</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#163829' }}>{perArea.toFixed(2)} kg / m²</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{grandTotal.toFixed(1)} t ÷ {floorArea.toLocaleString()} m²</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div style={{ border: '1px solid #d6ddcf', borderRadius: 6, padding: 20 }}>
            <h3 style={{ color: '#163829', marginTop: 0 }}>Net-Zero Scenario Simulator</h3>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13 }}>
                <span>Renewable Electricity Switch</span>
                <span>{leverRenewables}%</span>
              </div>
              <input type="range" min="0" max="100" value={leverRenewables} onChange={e => setLeverRenewables(Number(e.target.value))} style={{ width: '100%', accentColor: '#163829' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13 }}>
                <span>EV Fleet Transition</span>
                <span>{leverEV}%</span>
              </div>
              <input type="range" min="0" max="100" value={leverEV} onChange={e => setLeverEV(Number(e.target.value))} style={{ width: '100%', accentColor: '#163829' }} />
            </div>

            <div style={{ background: '#eef3ea', padding: 16, borderRadius: 4, marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dee5d9' }}>
                <span>Baseline Footprint</span>
                <strong>{grandTotal.toFixed(2)} tCO2e</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#0f5132', borderBottom: '1px solid #dee5d9' }}>
                <span>Modeled Reduction</span>
                <strong>- {totalReduction.toFixed(2)} tCO2e</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontWeight: 700, fontSize: 15, color: '#163829' }}>
                <span>Projected Net Footprint</span>
                <span>{scenarioNet.toFixed(2)} tCO2e</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{ background: '#e2eadc', borderTop: '1px solid #d6ddcf', display: 'flex', padding: '0 32px' }}>
        {['setup', 'activity', 'results', 'benchmarking', 'scenarios', 'methodology'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#fff' : 'transparent',
              border: 'none',
              borderTop: activeTab === tab ? '3px solid #163829' : '3px solid transparent',
              padding: '14px 20px',
              fontWeight: 600,
              fontSize: 13,
              color: '#163829',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
}
