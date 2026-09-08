import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  showIcon = false,
  iconSize = 13,
  position = 'top',
  maxWidth = 240,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = rect.top + scrollY;
    let left = rect.left + scrollX + rect.width / 2;

    if (position === 'top') {
      top = rect.top + scrollY - 8;
    } else if (position === 'bottom') {
      top = rect.bottom + scrollY + 8;
    } else if (position === 'left') {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX - 8;
    } else if (position === 'right') {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.right + scrollX + 8;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Keep position accurate on scroll / resize
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        tabIndex={0}
      >
        {children}
        {showIcon && (
          <Info
            size={iconSize}
            className="tooltip-info-icon"
            style={{ marginLeft: children ? 4 : 0 }}
          />
        )}
      </span>

      {isVisible && (
        <div
          className={`tooltip-portal-bubble position-${position}`}
          style={{
            top: coords.top,
            left: coords.left,
            maxWidth,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
};
