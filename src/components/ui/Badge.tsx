import { ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'accent' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-600/10 text-blue-600',
  accent: 'bg-orange-500/10 text-orange-500',
  neutral: 'bg-gray-100 text-gray-700',
};

export function Badge({ children, variant = 'primary', icon, className = '' }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}
    >
      {icon && icon}
      {children}
    </div>
  );
}

