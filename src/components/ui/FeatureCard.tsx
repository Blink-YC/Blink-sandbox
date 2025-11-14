import { ReactNode } from 'react';
import { IconContainer } from './IconContainer';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <IconContainer variant="gradient" size="lg" className="mb-6">
        {icon}
      </IconContainer>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}


