
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  allowOverflow?: boolean;
  variant?: 'default' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, allowOverflow = false, variant = 'default' }) => {
  const isInteractive = Boolean(onClick);
  const hoverClasses = isInteractive ? 'hover:border-cyber-purple transition-all duration-300 transform hover:-translate-y-1' : '';
  const clippingClass = allowOverflow ? '' : 'overflow-hidden';
  const variantClass = variant === 'flat' ? 'cyber-card--flat' : '';
  
  return (
    <div
      className={`relative glass-card cyber-card ${variantClass} ${isInteractive ? 'cyber-card--interactive' : ''} p-5 ${clippingClass} transition-transform duration-300 ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
