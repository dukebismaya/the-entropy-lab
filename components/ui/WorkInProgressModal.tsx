import React, { useEffect, useRef } from 'react';
import { Button } from './Button';

interface WorkInProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkInProgressModal: React.FC<WorkInProgressModalProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="wip-modal" role="dialog" aria-modal="true" aria-label="Feature in progress" onClick={onClose}>
      <div className="wip-modal__noise" aria-hidden="true" />
      <div className="wip-modal__panel" ref={panelRef} onClick={event => event.stopPropagation()}>
        <p className="hero-subtext">Community Grid</p>
        <h2 className="wip-modal__title glitch-text" data-text="Systems Recalibrating">
          Systems Recalibrating
        </h2>
        <p className="wip-modal__message">
          We are still weaving the community uplink. Check back soon to sync with squads across every gameverse.
        </p>
        <div className="wip-modal__status" aria-live="polite">
          <span className="wip-modal__pulse" aria-hidden="true" />
          <span>Signal pending • ETA: TBA</span>
        </div>
        <Button ref={closeButtonRef} onClick={onClose} className="mt-6 w-full justify-center" variant="secondary">
          Return to Mod Grid
        </Button>
      </div>
    </div>
  );
};
