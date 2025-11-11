interface BlinkLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};


export function BlinkLogo({ 
  size = 'md', 
  showText = true, 
  textSize = 'lg',
  className = '' 
}: BlinkLogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-sm bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-md`}>
        <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
        </svg>
      </div>
      {showText && (
        <span className={`text-gray-900 font-bold ${textSizeClasses[textSize]}`}>
          Blink
        </span>
      )}
    </div>
  );
}

