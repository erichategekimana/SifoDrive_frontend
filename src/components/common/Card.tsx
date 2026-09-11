import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  glass = false,
  className = '',
  ...props
}) => {
  const classes = [
    'card',
    interactive ? 'card-interactive' : '',
    glass ? 'glass-panel' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
