import { ReactNode } from 'react';

export type CardVariant = 'default' | 'primary' | 'accent' | 'ghost';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border-2 border-gray-200',
  primary: 'bg-gradient-to-br from-blue-600/5 to-blue-600/10 border-2 border-blue-600/20 hover:border-blue-600/40',
  accent: 'bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-2 border-orange-500/20 hover:border-orange-500/40',
  ghost: 'bg-white border border-gray-100',
};

export function Card({ children, variant = 'default', hover = false, className = '' }: CardProps) {
  const hoverStyles = hover ? 'hover:-translate-y-1 hover:shadow-lg' : '';

  return (
    <div
      className={`rounded-2xl p-8 transition-all ${variantStyles[variant]} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
