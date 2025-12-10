import { useCallback } from 'react';
import type React from 'react';

export const usePointerGlow = () => {
  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    target.style.setProperty('--pointer-x', `${x}%`);
    target.style.setProperty('--pointer-y', `${y}%`);
  }, []);

  const handlePointerLeave = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    target.style.setProperty('--pointer-x', '50%');
    target.style.setProperty('--pointer-y', '50%');
  }, []);

  return { handlePointerMove, handlePointerLeave };
};
