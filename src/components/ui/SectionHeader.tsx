import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  title,
  description,
  badge,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignmentClass = align === 'center' ? 'text-center' : 'text-left';
  const descriptionMaxWidth = align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-3xl';

  return (
    <div className={`${alignmentClass} mb-16 ${className}`}>
      {badge && <div className="mb-4">{badge}</div>}
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      {description && (
        <p className={`text-xl text-gray-600 ${descriptionMaxWidth}`}>
          {description}
        </p>
      )}
    </div>
  );
}

