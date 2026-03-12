import { CoinDisplay } from '../components/CoinDisplay';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import type { Player } from '../types/game';

interface InventoryProps {
  player: Player;
  onBack: () => void;
  onEquipWeapon: (weapon: any) => void;
  onEquipSkin: (skin: any) => void;
}

export const Inventory = ({ player, onBack, onEquipWeapon, onEquipSkin }: InventoryProps) => {
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <NeonButton onClick={onBack} color="#60a5fa" size="sm">
            ← Back
          </NeonButton>
          <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text">
            🎒 INVENTORY
          </h1>
          <CoinDisplay coins={player.coins} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weapons */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🔫 Weapons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.inventory.map((weapon) => {
                const isEquipped = player.weapon.id === weapon.id;

                return (
                  <GlassCard
                    key={weapon.id}
                    glow={isEquipped}
                    glowColor={weapon.color}
                    className={`p-4 ${isEquipped ? 'ring-2 ring-white' : ''}`}
                  >
                    <div className={`h-1 rounded-full mb-3 bg-gradient-to-r ${rarityColors[weapon.rarity]}`} />
                    
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{weapon.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{weapon.name}</h3>
                        <p className="text-sm text-slate-400">
                          {weapon.damage} DMG | {weapon.fireRate}ms
                        </p>
                      </div>
                      {isEquipped ? (
                        <span className="text-green-400 font-bold">EQUIPPED</span>
                      ) : (
                        <NeonButton
                          onClick={() => onEquipWeapon(weapon)}
                          color="#22d3ee"
                          size="sm"
                        >
                          EQUIP
                        </NeonButton>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Skins */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🎨 Skins</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {player.skins.map((skin) => {
                const isEquipped = player.currentSkin?.id === skin.id;
                const isRainbow = skin.color === 'rainbow';

                return (
                  <GlassCard
                    key={skin.id}
                    glow={isEquipped}
                    glowColor={skin.color}
                    className={`p-4 ${isEquipped ? 'ring-2 ring-white' : ''}`}
                  >
                    <div className={`h-1 rounded-full mb-3 bg-gradient-to-r ${rarityColors[skin.rarity]}`} />
                    
                    <div
                      className="w-full h-24 rounded-lg mb-3 flex items-center justify-center text-4xl"
                      style={{
                        background: isRainbow
                          ? 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)'
                          : `linear-gradient(135deg, ${skin.color}40, ${skin.color}20)`,
                        border: `2px solid ${isRainbow ? 'transparent' : skin.color}`
                      }}
                    >
                      👤
                    </div>
                    
                    <h3 className="text-sm font-bold text-white mb-2">{skin.name}</h3>
                    
                    {isEquipped ? (
                      <span className="text-green-400 font-bold text-sm">EQUIPPED</span>
                    ) : (
                      <NeonButton
                        onClick={() => onEquipSkin(skin)}
                        color="#f472b6"
                        size="sm"
                      >
                        EQUIP
                      </NeonButton>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
