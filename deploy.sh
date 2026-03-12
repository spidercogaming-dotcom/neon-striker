import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: string;
}

export const GlassCard = ({ 
  children, 
  className = '',
  glow = false,
  glowColor = '#60a5fa'
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative backdrop-blur-xl rounded-2xl border border-white/10 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        boxShadow: glow 
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${glowColor}20`
          : '0 8px 32px rgba(0,0,0,0.3)'
      }}
    >
      {children}
    </motion.div>
  );
};
