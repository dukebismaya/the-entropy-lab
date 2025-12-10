
import React, { forwardRef } from 'react';
import { usePointerGlow } from '../../hooks/usePointerGlow';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', icon, className = '', onMouseMove, onMouseLeave, ...props }, ref) => {
  const { handlePointerMove, handlePointerLeave } = usePointerGlow();
  const mergedMouseMove: React.MouseEventHandler<HTMLButtonElement> = event => {
    handlePointerMove(event);
    onMouseMove?.(event);
  };

  const mergedMouseLeave: React.MouseEventHandler<HTMLButtonElement> = event => {
    handlePointerLeave(event);
    onMouseLeave?.(event);
  };
  const baseClasses = 'relative overflow-hidden px-5 py-3 rounded-full font-semibold tracking-[0.25em] uppercase transition-all duration-300 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-charcoal glow-hover';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyber-cyan via-white to-cyber-purple text-white button-glow-cyan hover:saturate-150 hover:scale-105',
    secondary: 'bg-gradient-to-r from-cyber-magenta via-cyber-purple to-cyber-cyan text-white button-glow-magenta hover:scale-105',
    ghost: 'bg-transparent border border-cyber-cyan/60 text-cyber-cyan hover:bg-cyber-cyan/10 hover:text-white',
  };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        onMouseMove={mergedMouseMove}
        onMouseLeave={mergedMouseLeave}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
