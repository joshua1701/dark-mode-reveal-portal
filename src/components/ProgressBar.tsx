
import React from 'react';
import { cn } from '@/lib/utils';

type ProgressBarProps = {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
};

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  className,
  showLabel = true,
  height = 'md'
}) => {
  const getProgressColor = () => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-blue-500';
    return 'bg-designer-badge';
  };

  const getHeightClass = () => {
    switch (height) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  return (
    <div className="w-full">
      <div className={cn("relative w-full overflow-hidden rounded-full bg-white/10", getHeightClass(), className)}>
        <div 
          className={cn("transition-all duration-500 ease-in-out rounded-full", getProgressColor())}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs flex justify-between text-designer-text-secondary">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
