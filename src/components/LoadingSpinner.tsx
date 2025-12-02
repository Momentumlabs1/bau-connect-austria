import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
        {/* Rotating gradient ring */}
        <motion.div
          className="absolute -inset-6 md:-inset-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6), hsl(var(--primary))) border-box',
              border: '3px solid transparent'
            }}
          />
        </motion.div>
        
        {/* Logo - large and clear */}
        <motion.img 
          src={logo} 
          alt="BauConnect24" 
          className="h-40 md:h-48 w-auto relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
};
