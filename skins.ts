import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinDisplay } from '../components/CoinDisplay';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { crates } from '../data/crates';
import { weapons } from '../data/weapons';
import type { Player, Weapon } from '../types/game';

interface CratesProps {
  player: Player;
  onBack: () => void;
  onSpendCoins: (amount: number) => boolean;
  onAddCoins: (amount: number) => void;
  onAddWeapon: (weapon: Weapon) => void;
}

export const Crates = ({ player, onBack, onSpendCoins, onAddCoins, onAddWeapon }: CratesProps) => {
  const [opening, setOpening] = useState(false);
  const [selectedCrate, setSelectedCrate] = useState<string | null>(null);
  const [reward, setReward] = useState<Weapon | null>(null);
  const [showReward, setShowReward] = useState(false);

  const openCrate = (crateId: string) => {
    const crate = crates.find(c => c.id === crateId);
    if (!crate || !onSpendCoins(crate.price)) return;

    setOpening(true);
    setSelectedCrate(crateId);

    // Simulate opening animation
    setTimeout(() => {
      // Select random weapon based on chances
      const roll = Math.random() * 100;
      let cumulative = 0;
      let selectedWeapon = weapons[0];

      for (const item of crate.items) {
        cumulative += item.chance;
        if (roll <= cumulative) {
          selectedWeapon = weapons.find(w => w.id === item.weaponId) || weapons[0];
          break;
        }
      }

      setReward(selectedWeapon);
      setShowReward(true);
      setOpening(false);
    }, 2000);
  };

  const closeReward = () => {
    if (reward) {
      onAddWeapon(reward);
    }
    setShowReward(false);
    setSelectedCrate(null);
    setReward(null);
  };

  const sellReward = () => {
    if (reward) {
      onAddCoins(Math.floor(reward.price / 2));
      closeReward();
    }
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <NeonButton onClick={onBack} color="#60a5fa" size="sm">
            ← Back
          </NeonButton>
          <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            📦 CRATES
          </h1>
          <CoinDisplay coins={player.coins} />
        </div>

        {/* Crates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {crates.map((crate) => {
            const canAfford = player.coins >= crate.price;

            return (
              <GlassCard
                key={crate.id}
                glow
                glowColor={crate.color}
                className="p-6 text-center"
              >
                <motion.div
                  className={`text-8xl mb-4 ${opening && selectedCrate === crate.id ? 'animate-bounce' : ''}`}
                  animate={opening && selectedCrate === crate.id ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  📦
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{crate.name}</h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-yellow-400">🪙</span>
                  <span className="text-xl font-bold text-white">{crate.price}</span>
                </div>

                <div className="text-sm text-slate-400 mb-4">
                  Contains {crate.items.length} different weapons!
                </div>

                <NeonButton
                  onClick={() => openCrate(crate.id)}
                  color={crate.color}
                  size="md"
                  disabled={!canAfford || opening}
                >
                  {opening && selectedCrate === crate.id ? 'OPENING...' : 'OPEN'}
                </NeonButton>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Reward Modal */}
      <AnimatePresence>
        {showReward && reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeReward}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard
                glow
                glowColor={reward.color}
                className="p-12 text-center max-w-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-9xl mb-6"
                >
                  {reward.icon}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-slate-400 mb-2">You got:</p>
                  <h2 className="text-4xl font-black text-white mb-4">{reward.name}</h2>
                  
                  <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold mb-6 bg-gradient-to-r ${
                    reward.rarity === 'legendary' ? 'from-orange-500 to-yellow-500' :
                    reward.rarity === 'epic' ? 'from-purple-500 to-pink-500' :
                    reward.rarity === 'rare' ? 'from-blue-500 to-cyan-500' :
                    'from-slate-500 to-slate-600'
                  } text-white`}>
                    {reward.rarity.toUpperCase()}
                  </div>

                  <div className="flex gap-4 justify-center">
                    <NeonButton onClick={closeReward} color="#60a5fa" size="md">
                      KEEP
                    </NeonButton>
                    <NeonButton onClick={sellReward} color="#22c55e" size="md">
                      SELL FOR {Math.floor(reward.price / 2)} 🪙
                    </NeonButton>
                  </div>
                </motion.div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
