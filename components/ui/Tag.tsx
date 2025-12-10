
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const Tag: React.FC<TagProps> = ({ children, className = '', onClick, isActive = false }) => {
  const TagRoot: React.ElementType = onClick ? 'button' : 'span';
  const interactiveProps = onClick
    ? {
        type: 'button',
        onClick,
        'aria-pressed': isActive,
      }
    : {};

  return (
    <TagRoot
      {...interactiveProps}
      className={`neon-chip px-3 py-1 text-[0.7rem] font-semibold rounded-full uppercase tracking-widest ${onClick ? 'tag-clickable' : ''} ${isActive ? 'tag-active' : ''} ${className}`}
    >
      {children}
    </TagRoot>
  );
};
