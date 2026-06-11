import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const classes = ['card', `card--pad-${padding}`, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
