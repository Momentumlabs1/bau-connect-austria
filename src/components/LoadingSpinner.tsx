import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/bauconnect-logo-new.png';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
};

export const LoadingScreen = ({ message }: { message?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-white">
      {/* Simple CSS-only loading - no heavy JS animations */}
      <div className="relative">
        <img 
          src={logo} 
          alt="BauConnect24" 
          className="h-24 md:h-32 w-auto animate-pulse"
        />
      </div>
    </div>
  );
};
