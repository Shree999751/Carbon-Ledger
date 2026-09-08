export function generateCsvTemplate(): string {
  return `Scope,Category,Source,ActivityData,Unit,EmissionFactor,Status
Scope 1,Stationary Combustion,Natural Gas,120000,kWh,0.2022,Verified
Scope 1,Mobile Combustion,Diesel,4500,L,2.5835,Verified
Scope 1,Fugitive,HFC-134a,45,kg,1300,Verified
Scope 2,Location-based,Electricity,450000,kWh,0.1294,Verified
Scope 2,Market-based,Electricity,450000,kWh,0.0000,Provisional
Scope 3,Category 1,Purchased Goods & Services,250000,EUR,0.2010,Provisional
Scope 3,Category 2,Capital Goods,180000,EUR,0.1570,Provisional`;
}

export function parseCsvFile(text: string): { rowsCount: number; valid: boolean } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return { rowsCount: 0, valid: false };
  return { rowsCount: lines.length - 1, valid: true };
}
