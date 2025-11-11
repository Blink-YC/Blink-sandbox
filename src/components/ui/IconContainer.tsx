import { ReactNode } from 'react';

export type IconContainerVariant = 'primary' | 'accent' | 'gradient' | 'primary-light' | 'accent-light';
export type IconContainerSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconContainerProps {
  children: ReactNode;
  variant?: IconContainerVariant;
  size?: IconContainerSize;
  className?: string;
}

const variantStyles: Record<IconContainerVariant, string> = {
  primary: 'bg-blue-600 text-white',
  accent: 'bg-orange-500 text-white',
  gradient: 'bg-gradient-to-br from-blue-600 to-blue-400 text-white',
  'primary-light': 'bg-blue-600/10 text-blue-600',
  'accent-light': 'bg-orange-500/10 text-orange-600',
};

const sizeStyles: Record<IconContainerSize, { container: string; icon: string }> = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  xl: { container: 'w-20 h-20', icon: 'w-10 h-10' },
};

export function IconContainer({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: IconContainerProps) {
  return (
    <div
      className={`${sizeStyles[size].container} ${variantStyles[variant]} rounded-2xl flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}

