# Carbon Ledger — Enterprise GHG Accounting & Decarbonization Platform

An enterprise-grade greenhouse gas (GHG) corporate inventory and decarbonization platform aligned with **ISO 14064-1:2018** and the **GHG Protocol Corporate Standard**.

## 🌿 Key Features

- **Setup & Boundary**: Configure operational boundaries, equity share, base year, reporting year, and regional electricity emission factors (IEA, DESNZ, EPA eGRID).
- **Activity Data Collection (Scopes 1, 2, & 3)**:
  - **Scope 1**: Stationary combustion, mobile combustion, process emissions, refrigerant leakage (with custom GWP calculators).
  - **Scope 2**: Dual-reporting architecture (Location-based vs. Market-based with contractual instruments / RECs).
  - **Scope 3**: Value chain screening across Categories 1–15 (spend-based and activity-based models).
  - **Hierarchical Tables**: Dynamic sub-tables with row-level hierarchy and `+ Add Row` functionality for granular multi-facility tracking.
- **Inventory Results & Analytics**:
  - Center-KPI Donut emissions breakdown.
  - Normalized carbon intensity benchmarks (per revenue, per FTE, per m² floor area).
  - Modern column overview with reference gridlines.
  - Ranked decarbonization priority leaderboard separating verified operations from value chain screening.
- **Peer Benchmarking**: Compare intensity metrics against industry sector benchmarks.
- **Scenarios & Decarbonization Simulator**: Interactive forecasting model for renewable PPA adoption, fleet electrification, and energy efficiency.
- **Audit-Ready Report & Export Center**:
  - High-fidelity official GHG Inventory template with template border.
  - Print/PDF export isolation with 1-click generation.
  - ISO 14064 compliance methodology statement.
  - Instant CSV activity data template export and upload.
- **Responsive Architecture**:
  - Collapsible desktop navigation (Expanded vs. Icon-rail modes).
  - Mobile off-canvas drawer navigation with touch-friendly backdrop.
  - Clean print stylesheet eliminating UI banners and toolbars during printing.

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **Language**: TypeScript
- **Styling**: Modern Vanilla CSS Design System
- **Icons**: Lucide React
- **Exporting**: Clean browser print emulation & CSV streaming

## 💻 Local Development

```bash
# Clone repository
git clone https://github.com/Shree999751/Carbon-Ledger.git

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

## 📄 License
MIT License
