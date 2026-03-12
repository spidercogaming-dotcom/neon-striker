import { motion } from 'framer-motion';
import { CoinDisplay } from '../components/CoinDisplay';
import { NeonButton } from '../components/NeonButton';
import type { Player } from '../types/game';

interface MainMenuProps {
  player: Player;
  onStartPractice: () => void;
  onStartSimulated: () => void;
  onStartRealOnline: () => void;
  onOpenShop: () => void;
  onOpenCrates: () => void;
  onOpenInventory: () => void;
}

export const MainMenu = ({ 
  player, 
  onStartPractice,
  onStartSimulated,
  onStartRealOnline,
  onOpenShop, 
  onOpenCrates,
  onOpenInventory
}: MainMenuProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NEON STRIKE
          </h1>
          <p className="text-xl text-slate-400">Ultimate Multiplayer Shooter</p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{player.kills}</p>
            <p className="text-sm text-slate-400">Kills</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{player.deaths}</p>
            <p className="text-sm text-slate-400">Deaths</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">
              {player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills}
            </p>
            <p className="text-sm text-slate-400">K/D Ratio</p>
          </div>
        </motion.div>

        {/* Coins */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <CoinDisplay coins={player.coins} size="lg" />
        </motion.div>

        {/* Main Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-4 flex-wrap justify-center mb-4">
            <NeonButton
              onClick={onStartPractice}
              size="lg"
              color="#22d3ee"
              glow
            >
              🎯 PRACTICE
            </NeonButton>
            <NeonButton
              onClick={onStartSimulated}
              size="lg"
              color="#a855f7"
              glow
            >
              🤖 SIMULATED
            </NeonButton>
            <NeonButton
              onClick={onStartRealOnline}
              size="lg"
              color="#f43f5e"
              glow
            >
              🌐 REAL ONLINE
            </NeonButton>
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <NeonButton 
              onClick={onOpenShop} 
              size="md" 
              color="#fbbf24"
            >
              🛒 SHOP
            </NeonButton>
            <NeonButton 
              onClick={onOpenCrates} 
              size="md" 
              color="#a78bfa"
            >
              📦 CRATES
            </NeonButton>
            <NeonButton 
              onClick={onOpenInventory} 
              size="md" 
              color="#34d399"
            >
              🎒 INVENTORY
            </NeonButton>
          </div>
        </motion.div>

        {/* Online Players */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-semibold">
              {Math.floor(Math.random() * 500) + 1000} players online
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
