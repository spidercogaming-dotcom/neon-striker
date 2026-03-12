import { motion } from 'framer-motion';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  glow?: boolean;
}

export const NeonButton = ({ 
  children, 
  onClick, 
  color = '#60a5fa',
  size = 'md',
  disabled = false,
  glow = true
}: NeonButtonProps) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden font-bold text-white rounded-xl ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        border: `2px solid ${color}`,
        boxShadow: glow ? `0 0 20px ${color}40, inset 0 0 20px ${color}10` : 'none'
      }}
    >
      <span className="relative z-10">{children}</span>
      {glow && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity"
          style={{ background: color }}
        />
      )}
    </motion.button>
  );
};
