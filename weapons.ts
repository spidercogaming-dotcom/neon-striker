import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinDisplay } from '../components/CoinDisplay';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { weapons } from '../data/weapons';
import { skins } from '../data/skins';
import type { Player, Weapon, Skin } from '../types/game';

interface ShopProps {
  player: Player;
  onBack: () => void;
  onBuyWeapon: (weapon: Weapon) => boolean;
  onBuySkin: (skin: Skin) => boolean;
}

export const Shop = ({ player, onBack, onBuyWeapon, onBuySkin }: ShopProps) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'skins'>('weapons');

  const rarityColors = {
    common: 'from-slate-500 to-slate-600',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-orange-500 to-yellow-500'
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <NeonButton onClick={onBack} color="#60a5fa" size="sm">
              ← Back
            </NeonButton>
          </motion.div>
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text"
          >
            🛒 SHOP
          </motion.h1>
          <CoinDisplay coins={player.coins} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <NeonButton
            onClick={() => setActiveTab('weapons')}
            color={activeTab === 'weapons' ? '#22d3ee' : '#475569'}
            glow={activeTab === 'weapons'}
          >
            🔫 Weapons
          </NeonButton>
          <NeonButton
            onClick={() => setActiveTab('skins')}
            color={activeTab === 'skins' ? '#f472b6' : '#475569'}
            glow={activeTab === 'skins'}
          >
            🎨 Skins
          </NeonButton>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'weapons' ? (
            <motion.div
              key="weapons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {weapons.map((weapon) => {
                const owned = player.inventory.some(w => w.id === weapon.id);
                const canAfford = player.coins >= weapon.price;

                return (
                  <GlassCard
                    key={weapon.id}
                    glow={owned}
                    glowColor={weapon.color}
                    className="p-6"
                  >
                    <div className={`h-1 rounded-full mb-4 bg-gradient-to-r ${rarityColors[weapon.rarity]}`} />
                    
                    <div className="text-6xl mb-4">{weapon.icon}</div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{weapon.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 mb-4">
                      <div>💥 Damage: <span className="text-white">{weapon.damage}</span></div>
                      <div>⚡ Fire Rate: <span className="text-white">{weapon.fireRate}ms</span></div>
                      <div>🔫 Ammo: <span className="text-white">{weapon.ammo}</span></div>
                      <div>🔄 Reload: <span className="text-white">{weapon.reloadTime}ms</span></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">🪙</span>
                        <span className="text-xl font-bold text-white">{weapon.price}</span>
                      </div>
                      
                      {owned ? (
                        <span className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-bold">
                          OWNED
                        </span>
                      ) : (
                        <NeonButton
                          onClick={() => onBuyWeapon(weapon)}
                          color={canAfford ? '#22d3ee' : '#ef4444'}
                          size="sm"
                          disabled={!canAfford}
                        >
                          {canAfford ? 'BUY' : 'NEED MORE'}
                        </NeonButton>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="skins"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {skins.map((skin) => {
                const owned = player.skins.some(s => s.id === skin.id);
                const canAfford = player.coins >= skin.price;
                const isRainbow = skin.color === 'rainbow';

                return (
                  <GlassCard
                    key={skin.id}
                    glow={owned}
                    glowColor={skin.color}
                    className="p-6"
                  >
                    <div className={`h-1 rounded-full mb-4 bg-gradient-to-r ${rarityColors[skin.rarity]}`} />
                    
                    <div
                      className="w-full h-32 rounded-xl mb-4 flex items-center justify-center text-6xl"
                      style={{
                        background: isRainbow
                          ? 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)'
                          : `linear-gradient(135deg, ${skin.color}40, ${skin.color}20)`,
                        border: `3px solid ${isRainbow ? 'transparent' : skin.color}`
                      }}
                    >
                      👤
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{skin.name}</h3>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">🪙</span>
                        <span className="text-lg font-bold text-white">{skin.price}</span>
                      </div>
                      
                      {owned ? (
                        <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-bold text-sm">
                          OWNED
                        </span>
                      ) : (
                        <NeonButton
                          onClick={() => onBuySkin(skin)}
                          color={canAfford ? '#f472b6' : '#ef4444'}
                          size="sm"
                          disabled={!canAfford}
                        >
                          {canAfford ? 'BUY' : 'NEED MORE'}
                        </NeonButton>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
