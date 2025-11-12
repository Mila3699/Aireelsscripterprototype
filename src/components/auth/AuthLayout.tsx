import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { AuthStatusChecker } from '../AuthStatusChecker';
import { scaleInSpring, fadeIn, fadeInUpDelayed } from '../../lib/animations';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'login' | 'register';
}

export function AuthLayout({ 
  title, 
  subtitle, 
  children, 
  footer,
  variant = 'login' 
}: AuthLayoutProps) {
  const gradientClass = variant === 'login' 
    ? 'from-purple-500 to-blue-500'
    : 'from-blue-500 to-purple-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <AuthStatusChecker />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          {...scaleInSpring}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </motion.div>

        {/* Form */}
        <motion.div {...fadeInUpDelayed(0.4)}>
          {children}
        </motion.div>

        {/* Footer */}
        {footer && (
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
