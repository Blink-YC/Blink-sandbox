import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-[1400px] mx-auto px-5 lg:px-7 ${className}`}>
      {children}
    </div>
  );
}

