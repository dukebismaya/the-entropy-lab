import React, { useEffect, useMemo, useRef, useState } from 'react';

interface RollingCounterProps {
  value: number;
  formatter?: (value: number) => string;
  durationMs?: number;
  className?: string;
  refreshToken?: number;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const RollingCounter: React.FC<RollingCounterProps> = ({
  value,
  formatter = val => val.toLocaleString(),
  durationMs = 1400,
  className = '',
  refreshToken = 0,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const animationFrameRef = useRef<number>();
  const previousValueRef = useRef(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setHasEnteredView(true);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const animateToValue = (target: number, from: number) => {
    const start = performance.now();
    const duration = Math.max(300, durationMs);
    const step = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - start) / duration);
      const eased = easeOutExpo(progress);
      const nextValue = from + (target - from) * eased;
      setAnimatedValue(nextValue);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        previousValueRef.current = target;
      }
    };
    animationFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!hasEnteredView) return;
    const fromValue = previousValueRef.current;
    cancelAnimationFrame(animationFrameRef.current ?? 0);
    animateToValue(value, fromValue);
    return () => cancelAnimationFrame(animationFrameRef.current ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, hasEnteredView, refreshToken]);

  const display = useMemo(() => formatter(Math.round(animatedValue)), [animatedValue, formatter]);

  return (
    <span ref={containerRef} className={`rolling-number ${className}`}>
      <span className="rolling-number__glow" aria-hidden="true" />
      <span className="rolling-number__digits">{display}</span>
    </span>
  );
};
