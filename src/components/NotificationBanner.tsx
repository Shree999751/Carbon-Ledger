import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OrganizationSetup } from '../types/ghg';

interface NotificationBannerProps {
  setup: OrganizationSetup;
  isSampleLoaded: boolean;
  onNavigateToResults: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  setup,
  isSampleLoaded,
  onNavigateToResults,
}) => {
  const missingBoundary = !setup.boundary;

  return (
    <div className="banner-container">
      {isSampleLoaded && (
        <div className="info-banner">
          <CheckCircle2 size={14} color="#163829" />
          <span>
            Sample data loaded. Use &quot;Clear&quot; from the options menu to reset.
          </span>
        </div>
      )}

      <div className="alert-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <span>
            Draft — {missingBoundary ? 'Select an inventory boundary to finalize' : 'Verify activity data and emission factors'}
          </span>
        </div>
        <button
          type="button"
          className="alert-banner-btn"
          onClick={onNavigateToResults}
        >
          Results
        </button>
      </div>
    </div>
  );
};
