import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePointerGlow } from '../../hooks/usePointerGlow';

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ isVisible, onClick }) => {
  const { handlePointerMove, handlePointerLeave } = usePointerGlow();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseTimeout = useRef<number | null>(null);

  const clearCollapseTimer = () => {
    if (collapseTimeout.current) {
      window.clearTimeout(collapseTimeout.current);
      collapseTimeout.current = null;
    }
  };

  const scheduleCollapse = useCallback(
    (delay = 2200) => {
      clearCollapseTimer();
      collapseTimeout.current = window.setTimeout(() => {
        setIsCollapsed(true);
      }, delay);
    },
    [],
  );

  useEffect(() => {
    if (isVisible) {
      setIsCollapsed(false);
      scheduleCollapse();
    } else {
      setIsCollapsed(false);
      clearCollapseTimer();
    }
    return clearCollapseTimer;
  }, [isVisible, scheduleCollapse]);

  const handleMouseEnter = () => {
    clearCollapseTimer();
    setIsCollapsed(false);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    handlePointerLeave(event);
    if (isVisible) {
      scheduleCollapse(1200);
    }
  };

  const handleFocus = () => {
    clearCollapseTimer();
    setIsCollapsed(false);
  };

  const handleBlur = () => {
    if (isVisible) {
      scheduleCollapse(1200);
    }
  };

  return (
    <button
      type="button"
      className={`scroll-top ${isVisible ? 'scroll-top--visible' : ''} ${isCollapsed ? 'scroll-top--collapsed' : ''}`}
      onClick={onClick}
      aria-label="Scroll to top"
      onMouseMove={handlePointerMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span className="scroll-top__label">Back to Orbit</span>
      <svg
        className="scroll-top__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 19V5" strokeLinecap="round" />
        <path d="M6 11L12 5L18 11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};
