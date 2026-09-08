import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Scope1Inputs,
  Scope2Inputs,
  Scope3CategoryInput,
  CalculatedInventory,
  RegionalFactors,
  Scope1ItemRow,
  Scope2ItemRow,
} from '../types/ghg';
import { REFRIGERANT_GWP_FACTORS } from '../data/emissionFactors';
import { Tooltip } from './Tooltip';

interface ActivityTabProps {
  ef: RegionalFactors;
  scope1: Scope1Inputs;
  scope2: Scope2Inputs;
  scope3: Scope3CategoryInput[];
  calculated: CalculatedInventory;
  onScope1Change: (updated: Partial<Scope1Inputs>) => void;
  onScope2Change: (updated: Partial<Scope2Inputs>) => void;
  onScope3Change: (updated: Scope3CategoryInput[]) => void;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  ef,
  scope1,
  scope2,
  scope3,
  calculated,
  onScope1Change,
  onScope2Change,
  onScope3Change,
}) => {
  const [activeScope, setActiveScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1');

  // Helper to ensure stationary rows array exists
  const getStationaryRows = (): Scope1ItemRow[] => {
    if (scope1.stationaryRows && scope1.stationaryRows.length > 0) {
      return scope1.stationaryRows;
    }
    return [
      {
        id: 'stat-1',
        name: 'Natural Gas',
        fuelType: 'natural_gas',
        unit: scope1.naturalGasUnit || 'kWh',
        activity: scope1.naturalGasKwh,
        ef: ef.gas,
        status: 'verified',
      },
    ];
  };

  const getMobileRows = (): Scope1ItemRow[] => {
    if (scope1.mobileRows && scope1.mobileRows.length > 0) {
      return scope1.mobileRows;
    }
    return [
      {
        id: 'mob-1',
        name: 'Diesel (road transport)',
        fuelType: 'diesel',
        unit: scope1.mobileUnit || 'L',
        activity: scope1.mobileDieselL,
        ef: ef.diesel,
        status: 'verified',
      },
    ];
  };

  const getRefrigerantRows = (): Scope1ItemRow[] => {
    if (scope1.refrigerantRows && scope1.refrigerantRows.length > 0) {
      return scope1.refrigerantRows;
    }
    return [
      {
        id: 'ref-1',
        name: scope1.refrigerantType || 'HFC-134a',
        unit: 'kg',
        activity: scope1.refrigerantKg,
        gwp: scope1.refrigerantGwp || 1300,
        ef: '',
        status: 'verified',
      },
    ];
  };

  const getProcessRows = (): Scope1ItemRow[] => {
    if (scope1.processRows && scope1.processRows.length > 0) {
      return scope1.processRows;
    }
    return [
      {
        id: 'proc-1',
        name: 'Industrial Process Release',
        unit: 'kg',
        activity: scope1.processEmissionsKg,
        ef: scope1.processEf,
        status: 'verified',
      },
    ];
  };

  const getOtherRows = (): Scope1ItemRow[] => {
    if (scope1.otherRows && scope1.otherRows.length > 0) {
      return scope1.otherRows;
    }
    return [
      {
        id: 'oth-1',
        name: scope1.otherName || 'Other Direct Source',
        unit: 'unit',
        activity: scope1.otherAct,
        ef: scope1.otherEf,
        status: 'verified',
      },
    ];
  };

  // Scope 2 Row Getters
  const getElectricityRows = (): Scope2ItemRow[] => {
    if (scope2.electricityRows && scope2.electricityRows.length > 0) {
      return scope2.electricityRows;
    }
    return [
      {
        id: 'el-loc',
        name: 'Electricity (Location-based grid average)',
        subType: 'location',
        unit: 'kWh',
        activity: scope2.electricityLocKwh,
        ef: ef.grid,
        status: 'reference',
      },
      {
        id: 'el-mkt',
        name: 'Electricity (Market-based tariff / PPA)',
        subType: 'market',
        unit: 'kWh',
        activity: scope2.electricityMktKwh,
        ef: scope2.electricityMktEf,
        status: 'verified',
      },
    ];
  };

  const getDistrictEnergyRows = (): Scope2ItemRow[] => {
    if (scope2.districtEnergyRows && scope2.districtEnergyRows.length > 0) {
      return scope2.districtEnergyRows;
    }
    return [
      {
        id: 'dist-steam',
        name: 'Steam (Purchased)',
        subType: 'steam',
        unit: 'kWh',
        activity: scope2.steamKwh,
        ef: 0.183,
        status: 'verified',
      },
      {
        id: 'dist-heat',
        name: 'Heating (District)',
        subType: 'heat',
        unit: 'kWh',
        activity: scope2.heatKwh,
        ef: 0.183,
        status: 'verified',
      },
      {
        id: 'dist-cool',
        name: 'Cooling (District)',
        subType: 'cool',
        unit: 'kWh',
        activity: scope2.coolKwh,
        ef: 0.15,
        status: 'verified',
      },
    ];
  };

  // Stationary row handlers
  const handleUpdateStationaryRow = (id: string, field: keyof Scope1ItemRow, val: any) => {
    const rows = getStationaryRows().map((r) => {
      if (r.id === id) {
        const updated = { ...r, [field]: val };
        if (field === 'fuelType') {
          if (val === 'natural_gas') {
            updated.name = 'Natural Gas';
            updated.ef = ef.gas;
          } else if (val === 'fuel_oil') {
            updated.name = 'Fuel Oil (Gas Oil)';
            updated.ef = 0.2758;
          } else if (val === 'lpg') {
            updated.name = 'LPG';
            updated.ef = 0.2145;
          } else if (val === 'coal') {
            updated.name = 'Coal';
            updated.ef = 0.345;
          }
        }
        return updated;
      }
      return r;
    });
    onScope1Change({
      stationaryRows: rows,
      naturalGasKwh: rows[0]?.activity ?? '',
      naturalGasUnit: rows[0]?.unit ?? 'kWh',
    });
  };

  const handleAddStationaryRow = () => {
    const newRow: Scope1ItemRow = {
      id: `stat-${Date.now()}`,
      name: 'Fuel Oil (Gas Oil)',
      fuelType: 'fuel_oil',
      unit: 'kWh',
      activity: '',
      ef: 0.2758,
      status: 'verified',
    };
    onScope1Change({ stationaryRows: [...getStationaryRows(), newRow] });
  };

  const handleDeleteStationaryRow = (id: string) => {
    const current = getStationaryRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope1Change({
      stationaryRows: rows,
      naturalGasKwh: rows[0]?.activity ?? '',
      naturalGasUnit: rows[0]?.unit ?? 'kWh',
    });
  };

  // Mobile row handlers
  const handleUpdateMobileRow = (id: string, field: keyof Scope1ItemRow, val: any) => {
    const rows = getMobileRows().map((r) => {
      if (r.id === id) {
        const updated = { ...r, [field]: val };
        if (field === 'fuelType') {
          if (val === 'diesel') {
            updated.name = 'Diesel (road transport)';
            updated.ef = ef.diesel;
          } else if (val === 'petrol') {
            updated.name = 'Petrol / Gasoline';
            updated.ef = ef.petrol;
          } else if (val === 'cng') {
            updated.name = 'CNG';
            updated.ef = 2.75;
          }
        }
        return updated;
      }
      return r;
    });
    onScope1Change({
      mobileRows: rows,
      mobileDieselL: rows[0]?.activity ?? '',
      mobileUnit: rows[0]?.unit ?? 'L',
    });
  };

  const handleAddMobileRow = () => {
    const newRow: Scope1ItemRow = {
      id: `mob-${Date.now()}`,
      name: 'Petrol / Gasoline',
      fuelType: 'petrol',
      unit: 'L',
      activity: '',
      ef: ef.petrol,
      status: 'verified',
    };
    onScope1Change({ mobileRows: [...getMobileRows(), newRow] });
  };

  const handleDeleteMobileRow = (id: string) => {
    const current = getMobileRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope1Change({
      mobileRows: rows,
      mobileDieselL: rows[0]?.activity ?? '',
      mobileUnit: rows[0]?.unit ?? 'L',
    });
  };

  // Refrigerant row handlers
  const handleUpdateRefrigerantRow = (id: string, field: keyof Scope1ItemRow, val: any) => {
    const rows = getRefrigerantRows().map((r) => (r.id === id ? { ...r, [field]: val } : r));
    onScope1Change({
      refrigerantRows: rows,
      refrigerantKg: rows[0]?.activity ?? '',
      refrigerantGwp: rows[0]?.gwp ?? 1300,
    });
  };

  const handleAddRefrigerantRow = () => {
    const newRow: Scope1ItemRow = {
      id: `ref-${Date.now()}`,
      name: 'R-410A',
      unit: 'kg',
      activity: '',
      gwp: 1924,
      ef: '',
      status: 'verified',
    };
    onScope1Change({ refrigerantRows: [...getRefrigerantRows(), newRow] });
  };

  const handleDeleteRefrigerantRow = (id: string) => {
    const current = getRefrigerantRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope1Change({
      refrigerantRows: rows,
      refrigerantKg: rows[0]?.activity ?? '',
      refrigerantGwp: rows[0]?.gwp ?? 1300,
    });
  };

  // Process row handlers
  const handleUpdateProcessRow = (id: string, field: keyof Scope1ItemRow, val: any) => {
    const rows = getProcessRows().map((r) => (r.id === id ? { ...r, [field]: val } : r));
    onScope1Change({
      processRows: rows,
      processEmissionsKg: rows[0]?.activity ?? '',
      processEf: rows[0]?.ef ?? '',
    });
  };

  const handleAddProcessRow = () => {
    const newRow: Scope1ItemRow = {
      id: `proc-${Date.now()}`,
      name: 'Chemical Reaction Release',
      unit: 'kg',
      activity: '',
      ef: '',
      status: 'verified',
    };
    onScope1Change({ processRows: [...getProcessRows(), newRow] });
  };

  const handleDeleteProcessRow = (id: string) => {
    const current = getProcessRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope1Change({
      processRows: rows,
      processEmissionsKg: rows[0]?.activity ?? '',
      processEf: rows[0]?.ef ?? '',
    });
  };

  // Other row handlers
  const handleUpdateOtherRow = (id: string, field: keyof Scope1ItemRow, val: any) => {
    const rows = getOtherRows().map((r) => (r.id === id ? { ...r, [field]: val } : r));
    onScope1Change({
      otherRows: rows,
      otherName: rows[0]?.name ?? '',
      otherAct: rows[0]?.activity ?? '',
      otherEf: rows[0]?.ef ?? '',
    });
  };

  const handleAddOtherRow = () => {
    const newRow: Scope1ItemRow = {
      id: `oth-${Date.now()}`,
      name: 'Additional Direct Source',
      unit: 'unit',
      activity: '',
      ef: '',
      status: 'verified',
    };
    onScope1Change({ otherRows: [...getOtherRows(), newRow] });
  };

  const handleDeleteOtherRow = (id: string) => {
    const current = getOtherRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope1Change({
      otherRows: rows,
      otherName: rows[0]?.name ?? '',
      otherAct: rows[0]?.activity ?? '',
      otherEf: rows[0]?.ef ?? '',
    });
  };

  // Scope 2 handlers
  const handleUpdateElectricityRow = (id: string, field: keyof Scope2ItemRow, val: any) => {
    const rows = getElectricityRows().map((r) => (r.id === id ? { ...r, [field]: val } : r));
    const loc = rows.find((r) => r.subType === 'location');
    const mkt = rows.find((r) => r.subType === 'market');
    onScope2Change({
      electricityRows: rows,
      electricityLocKwh: loc?.activity ?? '',
      electricityMktKwh: mkt?.activity ?? '',
      electricityMktEf: mkt?.ef ?? '',
    });
  };

  const handleAddElectricityRow = () => {
    const newRow: Scope2ItemRow = {
      id: `el-${Date.now()}`,
      name: 'Contracted Green Power (PPA / Tariff)',
      subType: 'market',
      unit: 'kWh',
      activity: '',
      ef: 0,
      status: 'verified',
    };
    onScope2Change({ electricityRows: [...getElectricityRows(), newRow] });
  };

  const handleDeleteElectricityRow = (id: string) => {
    const current = getElectricityRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope2Change({ electricityRows: rows });
  };

  const handleUpdateDistrictRow = (id: string, field: keyof Scope2ItemRow, val: any) => {
    const rows = getDistrictEnergyRows().map((r) => (r.id === id ? { ...r, [field]: val } : r));
    onScope2Change({ districtEnergyRows: rows });
  };

  const handleAddDistrictRow = () => {
    const newRow: Scope2ItemRow = {
      id: `dist-${Date.now()}`,
      name: 'District Steam / Heating Loop',
      subType: 'steam',
      unit: 'kWh',
      activity: '',
      ef: 0.183,
      status: 'verified',
    };
    onScope2Change({ districtEnergyRows: [...getDistrictEnergyRows(), newRow] });
  };

  const handleDeleteDistrictRow = (id: string) => {
    const current = getDistrictEnergyRows();
    if (current.length <= 1) return;
    const rows = current.filter((r) => r.id !== id);
    onScope2Change({ districtEnergyRows: rows });
  };

  // Scope 3 handlers
  const updateScope3Row = (id: number | string, activity: number | '') => {
    const next = scope3.map((cat) => (cat.id === id ? { ...cat, activity } : cat));
    onScope3Change(next);
  };

  const handleAddScope3Upstream = () => {
    const newCat: Scope3CategoryInput = {
      id: `up-${Date.now()}`,
      name: `Custom Upstream Spend Item ${scope3.filter((c) => c.type === 'upstream').length + 1}`,
      type: 'upstream',
      unit: 'EUR',
      activity: '',
      ef: 0.15,
      status: 'provisional',
    };
    onScope3Change([...scope3, newCat]);
  };

  const handleAddScope3Downstream = () => {
    const newCat: Scope3CategoryInput = {
      id: `down-${Date.now()}`,
      name: `Custom Downstream Activity ${scope3.filter((c) => c.type === 'downstream').length + 1}`,
      type: 'downstream',
      unit: 'EUR',
      activity: '',
      ef: 0.12,
      status: 'provisional',
    };
    onScope3Change([...scope3, newCat]);
  };

  const handleDeleteScope3Row = (id: number | string) => {
    onScope3Change(scope3.filter((c) => c.id !== id));
  };

  // Scope 3 lists
  const upstreamCategories = scope3.filter((c) => c.type === 'upstream');
  const downstreamCategories = scope3.filter((c) => c.type === 'downstream');

  // Subtotals
  const statRows = getStationaryRows();
  const mobRows = getMobileRows();
  const refRows = getRefrigerantRows();
  const procRows = getProcessRows();
  const othRows = getOtherRows();

  const statSubtotal = statRows.reduce(
    (sum, r) => sum + (Number(r.activity || 0) * (r.ef !== '' ? Number(r.ef) : ef.gas)) / 1000,
    0
  );
  const mobSubtotal = mobRows.reduce(
    (sum, r) => sum + (Number(r.activity || 0) * (r.ef !== '' ? Number(r.ef) : ef.diesel)) / 1000,
    0
  );
  const refSubtotal = refRows.reduce(
    (sum, r) => sum + (Number(r.activity || 0) * (r.gwp ? Number(r.gwp) : 1300)) / 1000,
    0
  );
  const procSubtotal = procRows.reduce(
    (sum, r) => sum + (Number(r.activity || 0) * Number(r.ef || 0)) / 1000,
    0
  );
  const othSubtotal = othRows.reduce(
    (sum, r) => sum + (Number(r.activity || 0) * Number(r.ef || 0)) / 1000,
    0
  );

  const electRows = getElectricityRows();
  const distRows = getDistrictEnergyRows();

  return (
    <section className="tab-pane">
      <div className="subtabs-nav">
        <button
          type="button"
          className={`btn-subtab ${activeScope === 'scope1' ? 'active' : ''}`}
          onClick={() => setActiveScope('scope1')}
        >
          Scope 1
        </button>
        <button
          type="button"
          className={`btn-subtab ${activeScope === 'scope2' ? 'active' : ''}`}
          onClick={() => setActiveScope('scope2')}
        >
          Scope 2
        </button>
        <button
          type="button"
          className={`btn-subtab ${activeScope === 'scope3' ? 'active' : ''}`}
          onClick={() => setActiveScope('scope3')}
        >
          Scope 3
        </button>
      </div>

      {/* SCOPE 1 */}
      {activeScope === 'scope1' && (
        <div className="scope-subtab-pane">
          <div className="activity-table-wrapper">
            <table className="activity-table hierarchy-activity-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>
                    <Tooltip content="Direct emission source" showIcon>
                      SOURCE
                    </Tooltip>
                  </th>
                  <th style={{ width: '10%' }}>UNIT</th>
                  <th style={{ width: '18%' }}>
                    <Tooltip content="Activity volume for reporting period" showIcon>
                      ACTIVITY DATA
                    </Tooltip>
                  </th>
                  <th style={{ width: '22%' }}>
                    <Tooltip content="Factor in kg CO2e per unit" showIcon>
                      EMISSION FACTOR
                    </Tooltip>
                  </th>
                  <th style={{ width: '12%' }} className="th-num">
                    <Tooltip content="Emissions in tCO2e: (Activity × EF) ÷ 1,000" showIcon>
                      TCO2E
                    </Tooltip>
                  </th>
                  <th style={{ width: '10%' }} className="th-center">
                    <Tooltip content="Green: Verified factor. Amber: Provisional estimate." showIcon>
                      STATUS
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* SUBHEADING 1: Stationary Combustion */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Stationary Combustion</span>
                      <Tooltip content="Fuel consumed in boilers, furnaces, and heaters" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {statSubtotal > 0 ? `${statSubtotal.toFixed(2)} t` : '—'}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddStationaryRow}
                      title="Add another stationary fuel row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {statRows.map((row) => {
                  const t = (Number(row.activity || 0) * (row.ef !== '' ? Number(row.ef) : ef.gas)) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <select
                          className="sub-fuel-select"
                          value={row.fuelType || 'natural_gas'}
                          onChange={(e) => handleUpdateStationaryRow(row.id, 'fuelType', e.target.value)}
                        >
                          <option value="natural_gas">Natural Gas</option>
                          <option value="fuel_oil">Fuel Oil (Gas Oil)</option>
                          <option value="lpg">LPG</option>
                          <option value="coal">Coal</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={row.unit}
                          onChange={(e) => handleUpdateStationaryRow(row.id, 'unit', e.target.value)}
                        >
                          <option value="kWh">kWh</option>
                          <option value="m3">m³</option>
                          <option value="therms">therms</option>
                          <option value="L">L</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateStationaryRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.0001"
                          value={row.ef !== '' ? row.ef : ef.gas}
                          onChange={(e) =>
                            handleUpdateStationaryRow(
                              row.id,
                              'ef',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder={ef.gas.toFixed(4)}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' ? t.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span className={`status-dot ${row.activity !== '' ? 'verified' : 'empty'}`} />
                          {statRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteStationaryRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* SUBHEADING 2: Mobile Combustion */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Mobile Combustion</span>
                      <Tooltip content="Fuel consumed in company-owned or leased fleet vehicles" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {mobSubtotal > 0 ? `${mobSubtotal.toFixed(2)} t` : '—'}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddMobileRow}
                      title="Add another mobile combustion row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {mobRows.map((row) => {
                  const t = (Number(row.activity || 0) * (row.ef !== '' ? Number(row.ef) : ef.diesel)) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <select
                          className="sub-fuel-select"
                          value={row.fuelType || 'diesel'}
                          onChange={(e) => handleUpdateMobileRow(row.id, 'fuelType', e.target.value)}
                        >
                          <option value="diesel">Diesel (road transport)</option>
                          <option value="petrol">Petrol / Gasoline</option>
                          <option value="cng">CNG</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={row.unit}
                          onChange={(e) => handleUpdateMobileRow(row.id, 'unit', e.target.value)}
                        >
                          <option value="L">L</option>
                          <option value="gallons">gallons (US)</option>
                          <option value="km">km</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateMobileRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.0001"
                          value={row.ef !== '' ? row.ef : ef.diesel}
                          onChange={(e) =>
                            handleUpdateMobileRow(
                              row.id,
                              'ef',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder={ef.diesel.toFixed(4)}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' ? t.toFixed(3) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span className={`status-dot ${row.activity !== '' ? 'verified' : 'empty'}`} />
                          {mobRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteMobileRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* SUBHEADING 3: Refrigerant Leakage */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Refrigerant Leakage</span>
                      <Tooltip content="Fugitive gas leakage from cooling and HVAC chillers" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {refSubtotal > 0 ? `${refSubtotal.toFixed(2)} t` : '—'}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddRefrigerantRow}
                      title="Add another refrigerant row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {refRows.map((row) => {
                  const gwp = row.gwp ? Number(row.gwp) : 1300;
                  const t = (Number(row.activity || 0) * gwp) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <select
                          className="sub-fuel-select"
                          value={row.gwp || 1300}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const found = REFRIGERANT_GWP_FACTORS.find((f) => f.gwp === val);
                            handleUpdateRefrigerantRow(row.id, 'gwp', val);
                            if (found) {
                              handleUpdateRefrigerantRow(row.id, 'name', found.gas);
                            }
                          }}
                        >
                          {REFRIGERANT_GWP_FACTORS.map((rf) => (
                            <option key={rf.gas} value={rf.gwp}>
                              {rf.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>kg</td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateRefrigerantRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>GWP {gwp} (IPCC AR5)</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' ? t.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span className={`status-dot ${row.activity !== '' ? 'verified' : 'empty'}`} />
                          {refRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteRefrigerantRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* SUBHEADING 4: Process Emissions */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Process Emissions</span>
                      <Tooltip content="Direct chemical or physical industrial process emissions" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {procSubtotal > 0 ? `${procSubtotal.toFixed(2)} t` : '—'}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddProcessRow}
                      title="Add another process emission row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {procRows.map((row) => {
                  const t = (Number(row.activity || 0) * Number(row.ef || 0)) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateProcessRow(row.id, 'name', e.target.value)}
                          placeholder="Process description"
                        />
                      </td>
                      <td>kg</td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateProcessRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.0001"
                          value={row.ef}
                          onChange={(e) =>
                            handleUpdateProcessRow(
                              row.id,
                              'ef',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="Custom EF"
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' && row.ef !== '' ? t.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span
                            className={`status-dot ${row.activity !== '' && row.ef !== '' ? 'verified' : 'empty'}`}
                          />
                          {procRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteProcessRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* SUBHEADING 5: Other Direct Sources */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Other Direct Sources</span>
                      <Tooltip content="Any additional custom direct operational source" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {othSubtotal > 0 ? `${othSubtotal.toFixed(2)} t` : '—'}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddOtherRow}
                      title="Add custom direct source row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {othRows.map((row) => {
                  const t = (Number(row.activity || 0) * Number(row.ef || 0)) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateOtherRow(row.id, 'name', e.target.value)}
                          placeholder="Other (please specify)"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          style={{ width: 60 }}
                          value={row.unit}
                          onChange={(e) => handleUpdateOtherRow(row.id, 'unit', e.target.value)}
                          placeholder="unit"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateOtherRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.0001"
                          value={row.ef}
                          onChange={(e) =>
                            handleUpdateOtherRow(
                              row.id,
                              'ef',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="Custom EF"
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' && row.ef !== '' ? t.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span
                            className={`status-dot ${row.activity !== '' && row.ef !== '' ? 'verified' : 'empty'}`}
                          />
                          {othRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteOtherRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-footer-total">
            <span>
              REPORTABLE SCOPE 1
              <Tooltip content="Total verified direct Scope 1 emissions" showIcon />
            </span>
            <span>{calculated.scope1.totalT.toFixed(2)} tCO2e</span>
          </div>
        </div>
      )}

      {/* SCOPE 2 */}
      {activeScope === 'scope2' && (
        <div className="scope-subtab-pane">
          <div className="activity-table-wrapper">
            <table className="activity-table hierarchy-activity-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>
                    <Tooltip content="Purchased energy (Electricity, Steam, Heating, Cooling)" showIcon>
                      SOURCE
                    </Tooltip>
                  </th>
                  <th style={{ width: '10%' }}>UNIT</th>
                  <th style={{ width: '18%' }}>
                    <Tooltip content="Metered energy consumption in kWh" showIcon>
                      ACTIVITY DATA
                    </Tooltip>
                  </th>
                  <th style={{ width: '22%' }}>
                    <Tooltip content="Grid average (location) or supplier tariff (market)" showIcon>
                      EMISSION FACTOR
                    </Tooltip>
                  </th>
                  <th style={{ width: '12%' }} className="th-num">
                    <Tooltip content="Emissions in metric tonnes CO2e" showIcon>
                      TCO2E
                    </Tooltip>
                  </th>
                  <th style={{ width: '10%' }} className="th-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {/* SUBHEADING 1: Purchased Electricity */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Purchased Electricity (Dual-Reporting)</span>
                      <Tooltip content="Location-based average grid and market-based contractual supplies" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {calculated.scope2.hasMarketBased
                        ? `${calculated.scope2.marketTotalT.toFixed(2)} t`
                        : `${calculated.scope2.locationTotalT.toFixed(2)} t`}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddElectricityRow}
                      title="Add another electricity contract row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {electRows.map((row) => {
                  const act = Number(row.activity || 0);
                  const factor = row.ef !== '' ? Number(row.ef) : (row.subType === 'location' ? ef.grid : 0);
                  const t = (act * factor) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateElectricityRow(row.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>kWh</td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateElectricityRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        {row.subType === 'location' ? (
                          <span>{ef.grid.toFixed(4)} (Grid Avg)</span>
                        ) : (
                          <input
                            type="number"
                            step="0.0001"
                            value={row.ef}
                            onChange={(e) =>
                              handleUpdateElectricityRow(
                                row.id,
                                'ef',
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            placeholder="0 (e.g. green PPA)"
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' ? t.toFixed(3) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span
                            className={`status-dot ${
                              row.activity !== ''
                                ? row.subType === 'location'
                                  ? 'reference'
                                  : 'verified'
                                : 'empty'
                            }`}
                          />
                          {electRows.length > 2 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteElectricityRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* SUBHEADING 2: Purchased Heat, Steam & Cooling */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Steam, Heating &amp; Cooling (District Energy)</span>
                      <Tooltip content="Imported steam, hot water, and chilled water loops" showIcon />
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {distRows.some((r) => r.activity !== '') ? 'Active' : '—'}
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddDistrictRow}
                      title="Add another district energy row"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {distRows.map((row) => {
                  const act = Number(row.activity || 0);
                  const factor = row.ef !== '' ? Number(row.ef) : 0.183;
                  const t = (act * factor) / 1000;
                  return (
                    <tr key={row.id} className="hierarchy-data-row">
                      <td>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateDistrictRow(row.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>kWh</td>
                      <td>
                        <input
                          type="number"
                          value={row.activity}
                          onChange={(e) =>
                            handleUpdateDistrictRow(
                              row.id,
                              'activity',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>{factor.toFixed(4)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {row.activity !== '' ? t.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span className={`status-dot ${row.activity !== '' ? 'verified' : 'empty'}`} />
                          {distRows.length > 3 && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteDistrictRow(row.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-footer-dual">
            <div className="headline">
              <span>
                REPORTABLE SCOPE 2 — market-based (headline)
                <Tooltip content="Scope 2 market-based headline total" showIcon />
              </span>
              <span>
                {calculated.scope2.hasMarketBased
                  ? `${calculated.scope2.marketTotalT.toFixed(2)} tCO2e`
                  : '—'}
              </span>
            </div>
            <div className="reference">
              <span>
                Total Scope 2 — location-based (for reference)
                <Tooltip content="Scope 2 physical grid average reference" showIcon />
              </span>
              <span>{calculated.scope2.locationTotalT.toFixed(2)} tCO2e</span>
            </div>
          </div>
        </div>
      )}

      {/* SCOPE 3 */}
      {activeScope === 'scope3' && (
        <div className="scope-subtab-pane">
          <div className="activity-table-wrapper">
            <table className="activity-table hierarchy-activity-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>
                    <Tooltip content="15 GHG Protocol Corporate Value Chain categories" showIcon>
                      CATEGORY
                    </Tooltip>
                  </th>
                  <th style={{ width: '10%' }}>UNIT</th>
                  <th style={{ width: '18%' }}>
                    <Tooltip content="Procurement spend or physical activity volume" showIcon>
                      ACTIVITY DATA
                    </Tooltip>
                  </th>
                  <th style={{ width: '20%' }}>
                    <Tooltip content="Spend factor (kg CO2e / EUR) or physical factor" showIcon>
                      EMISSION FACTOR
                    </Tooltip>
                  </th>
                  <th style={{ width: '12%' }} className="th-num">
                    <Tooltip content="Provisional emissions in tCO2e" showIcon>
                      TCO2E
                    </Tooltip>
                  </th>
                  <th style={{ width: '10%' }} className="th-center">
                    <Tooltip content="Provisional: Spend screening pending supplier audits" showIcon>
                      STATUS
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* UPSTREAM SUBHEADING */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Upstream Value Chain (Categories 1–8)</span>
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {upstreamCategories
                        .reduce((sum, c) => sum + (c.activity !== '' ? (Number(c.activity) * c.ef) / 1000 : 0), 0)
                        .toFixed(2)}{' '}
                      t
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddScope3Upstream}
                      title="Add another upstream line item"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {upstreamCategories.map((cat) => {
                  const val = cat.activity !== '' ? (Number(cat.activity) * cat.ef) / 1000 : null;
                  const isCustom = typeof cat.id === 'string' && cat.id.startsWith('up-');
                  return (
                    <tr key={cat.id} className="hierarchy-data-row">
                      <td>
                        {isCustom ? (
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const next = scope3.map((c) => (c.id === cat.id ? { ...c, name: e.target.value } : c));
                              onScope3Change(next);
                            }}
                          />
                        ) : (
                          cat.name
                        )}
                      </td>
                      <td>{cat.unit}</td>
                      <td>
                        <input
                          type="number"
                          value={cat.activity}
                          onChange={(e) =>
                            updateScope3Row(cat.id, e.target.value === '' ? '' : Number(e.target.value))
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        {isCustom ? (
                          <input
                            type="number"
                            step="0.001"
                            value={cat.ef}
                            onChange={(e) => {
                              const next = scope3.map((c) =>
                                c.id === cat.id ? { ...c, ef: Number(e.target.value) } : c
                              );
                              onScope3Change(next);
                            }}
                          />
                        ) : (
                          cat.ef.toFixed(3)
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {val !== null ? val.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span className={`status-dot ${cat.activity !== '' ? 'provisional' : 'empty'}`} />
                          {isCustom && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteScope3Row(cat.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* DOWNSTREAM SUBHEADING */}
                <tr className="hierarchy-subheading-row">
                  <td colSpan={4} className="subheading-title-cell">
                    <div className="subheading-title-flex">
                      <span className="subheading-indicator" />
                      <span className="subheading-title-text">Downstream Value Chain (Categories 9–15)</span>
                    </div>
                  </td>
                  <td className="subheading-total-cell">
                    <span className="subheading-total-num">
                      {downstreamCategories
                        .reduce((sum, c) => sum + (c.activity !== '' ? (Number(c.activity) * c.ef) / 1000 : 0), 0)
                        .toFixed(2)}{' '}
                      t
                    </span>
                  </td>
                  <td className="subheading-action-cell">
                    <button
                      type="button"
                      className="btn-add-row"
                      onClick={handleAddScope3Downstream}
                      title="Add another downstream line item"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Add Row</span>
                    </button>
                  </td>
                </tr>
                {downstreamCategories.map((cat) => {
                  const val = cat.activity !== '' ? (Number(cat.activity) * cat.ef) / 1000 : null;
                  const isCustom = typeof cat.id === 'string' && cat.id.startsWith('down-');
                  return (
                    <tr key={cat.id} className="hierarchy-data-row">
                      <td>
                        {isCustom ? (
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const next = scope3.map((c) => (c.id === cat.id ? { ...c, name: e.target.value } : c));
                              onScope3Change(next);
                            }}
                          />
                        ) : (
                          cat.name
                        )}
                      </td>
                      <td>{cat.unit}</td>
                      <td>
                        <input
                          type="number"
                          value={cat.activity}
                          onChange={(e) =>
                            updateScope3Row(cat.id, e.target.value === '' ? '' : Number(e.target.value))
                          }
                          placeholder="0"
                        />
                      </td>
                      <td>
                        {isCustom ? (
                          <input
                            type="number"
                            step="0.001"
                            value={cat.ef}
                            onChange={(e) => {
                              const next = scope3.map((c) =>
                                c.id === cat.id ? { ...c, ef: Number(e.target.value) } : c
                              );
                              onScope3Change(next);
                            }}
                          />
                        ) : (
                          cat.ef.toFixed(3)
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {val !== null ? val.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-with-delete">
                          <span className={`status-dot ${cat.activity !== '' ? 'provisional' : 'empty'}`} />
                          {isCustom && (
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteScope3Row(cat.id)}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-footer-total">
            <span>
              TOTAL SCOPE 3 VALUE CHAIN
              <Tooltip content="Sum of upstream and downstream screened categories" showIcon />
            </span>
            <span>{calculated.scope3.totalT.toFixed(2)} tCO2e</span>
          </div>
        </div>
      )}
    </section>
  );
};
