import { ReactNode } from 'react';
import { IconContainer, IconContainerVariant } from './IconContainer';

interface StepCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: IconContainerVariant;
  className?: string;
}

export function StepCard({
  icon,
  title,
  description,
  variant = 'primary',
  className = '',
}: StepCardProps) {
  return (
    <div className={`text-center ${className}`}>
      <IconContainer variant={variant} size="xl" className="mx-auto mb-6">
        {icon}
      </IconContainer>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

