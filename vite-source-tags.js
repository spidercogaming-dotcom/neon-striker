import { motion } from 'framer-motion';

interface CoinDisplayProps {
  coins: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CoinDisplay = ({ coins, size = 'md' }: CoinDisplayProps) => {
  const sizeClasses = {
    sm: 'text-lg px-3 py-1',
    md: 'text-xl px-4 py-2',
    lg: 'text-2xl px-5 py-2.5'
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-2 font-bold rounded-full ${sizeClasses[size]}`}
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
        border: '2px solid rgba(251,191,36,0.5)',
        color: '#fbbf24'
      }}
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        🪙
      </motion.span>
      <span>{coins.toLocaleString()}</span>
    </motion.div>
  );
};
