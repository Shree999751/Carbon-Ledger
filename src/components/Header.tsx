import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf,
  FileSpreadsheet,
  Copy,
  Printer,
  RotateCcw,
  Upload,
  MoreVertical,
  Menu,
} from 'lucide-react';
import { OrganizationSetup } from '../types/ghg';
import { generateCsvTemplate, parseCsvFile } from '../utils/csvHelper';

interface HeaderProps {
  setup: OrganizationSetup;
  onLoadSample: () => void;
  onClear: () => void;
  onShowToast: (msg: string) => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setup,
  onLoadSample,
  onClear,
  onShowToast,
  onOpenMobileSidebar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyTemplate = () => {
    setIsOpen(false);
    const csv = generateCsvTemplate();
    navigator.clipboard.writeText(csv).then(
      () => onShowToast('CSV template copied to clipboard!'),
      () => onShowToast('Failed to copy to clipboard')
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(false);
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
    // Reset file input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handlePrint = () => {
    setIsOpen(false);
    window.print();
  };

  const handleSample = () => {
    setIsOpen(false);
    onLoadSample();
  };

  const handleClear = () => {
    setIsOpen(false);
    onClear();
  };

  return (
    <header className="header-panel">
      <div className="header-top">
        <div className="header-left-group">
          {onOpenMobileSidebar && (
            <button
              type="button"
              className="btn-mobile-menu"
              onClick={onOpenMobileSidebar}
              aria-label="Open navigation menu"
              title="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="brand-badge">
            <div className="brand-icon">
              <Leaf size={20} strokeWidth={2.4} />
            </div>
            <div className="brand-protocol">
              Based on GHG<br />Protocol
            </div>
          </div>
        </div>

        <div className="header-title-box">
          <h1 className="main-title">Carbon Accounting Calculator</h1>
          <div className="subtitle-meta">
            {setup.orgName || 'Your Organization'} · {setup.country} · FY {setup.reportingYear}
          </div>
        </div>

        {/* Kebab Action Menu */}
        <div className="kebab-container" ref={dropdownRef}>
          <button
            type="button"
            className={`btn-kebab ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Actions menu"
            aria-expanded={isOpen}
            title="Options menu"
          >
            <MoreVertical size={18} />
          </button>

          {isOpen && (
            <div className="kebab-dropdown" role="menu">
              <button
                type="button"
                className="kebab-menu-item"
                onClick={handleSample}
                role="menuitem"
              >
                <FileSpreadsheet size={15} color="var(--primary-forest)" />
                <span>Load Sample Data</span>
              </button>

              <button
                type="button"
                className="kebab-menu-item"
                onClick={() => fileInputRef.current?.click()}
                role="menuitem"
              >
                <Upload size={15} />
                <span>Upload CSV</span>
              </button>

              <button
                type="button"
                className="kebab-menu-item"
                onClick={handleCopyTemplate}
                role="menuitem"
              >
                <Copy size={15} />
                <span>Copy CSV Template</span>
              </button>

              <button
                type="button"
                className="kebab-menu-item"
                onClick={handlePrint}
                role="menuitem"
              >
                <Printer size={15} />
                <span>Print / Export Report</span>
              </button>

              <div className="kebab-divider" />

              <button
                type="button"
                className="kebab-menu-item danger"
                onClick={handleClear}
                role="menuitem"
              >
                <RotateCcw size={15} />
                <span>Clear</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </header>
  );
};
