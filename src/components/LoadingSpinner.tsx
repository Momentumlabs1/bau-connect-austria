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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Breathing logo */}
      <motion.div className="relative z-10">
        <motion.img 
          src={logo} 
          alt="BauConnect24" 
          className="h-32 md:h-40 w-auto"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};
