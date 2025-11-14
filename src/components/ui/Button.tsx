import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow',
  secondary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow',
  outline: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'text-blue-600 hover:bg-blue-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  href,
  onClick, 
  icon,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all';
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedStyles}>
        {children}
        {icon && icon}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={combinedStyles}>
      {children}
      {icon && icon}
    </button>
  );
}
