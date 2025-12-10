import React, { useEffect, useMemo, useState } from 'react';

interface LightningLoaderProps {
  isVisible: boolean;
  steps?: string[];
  intervalMs?: number;
  statusOverride?: string;
  hint?: string;
}

const defaultSteps = [
  'Initializing storm relays',
  'Charging ion capacitors',
  'Connecting to fixer grid',
  'Syncing chrome manifests',
  'Calibrating neural uplink',
];

export const LightningLoader: React.FC<LightningLoaderProps> = ({
  isVisible,
  steps = defaultSteps,
  intervalMs = 1600,
  statusOverride,
  hint,
}) => {
  const sanitizedSteps = useMemo(() => steps.filter(Boolean), [steps]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isVisible || sanitizedSteps.length <= 1) return;
    const id = window.setInterval(() => {
      setCurrent(prev => (prev + 1) % sanitizedSteps.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, isVisible, sanitizedSteps.length]);

  useEffect(() => {
    if (!isVisible) {
      setCurrent(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const label = statusOverride?.trim() || sanitizedSteps[current] || defaultSteps[0];
  const hintText = hint?.trim() || 'Stand by while Night Market syncs your chrome.';

  return (
    <div className="lightning-loader" role="status" aria-live="polite">
      <div className="lightning-loader__sheen" aria-hidden="true" />
      <div className="lightning-loader__content">
        <div className="lightning-loader__bolts" aria-hidden="true">
          {[0, 1, 2].map(index => (
            <span key={index} className={`lightning-loader__bolt lightning-loader__bolt--${index + 1}`} />
          ))}
        </div>
        <p className="lightning-loader__label">
          {label}
          <span className="lightning-loader__cursor" aria-hidden="true">
            _
          </span>
        </p>
        <p className="lightning-loader__hint">{hintText}</p>
      </div>
    </div>
  );
};
