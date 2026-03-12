import { useState } from 'react';
import { MainMenu } from './pages/MainMenu';
import { Shop } from './pages/Shop';
import { Crates } from './pages/Crates';
import { Inventory } from './pages/Inventory';
import { GameArena } from './pages/GameArena';
import { OnlineGame } from './pages/OnlineGame';
import { useGameState } from './hooks/useGameState';
import type { Weapon, Skin, GameMode } from './types/game';

type Screen = 'menu' | 'shop' | 'crates' | 'inventory' | 'game' | 'online';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const { player, addCoins, spendCoins, buyWeapon, addWeapon, equipWeapon, buySkin, equipSkin, addKill, addDeath } = useGameState();

  const handleBuyWeapon = (weapon: Weapon) => {
    if (!player.inventory.some(w => w.id === weapon.id)) {
      return buyWeapon(weapon);
    }
    return false;
  };

  const handleBuySkin = (skin: Skin) => {
    if (!player.skins.some(s => s.id === skin.id)) {
      return buySkin(skin);
    }
    return false;
  };

  return (
    <>
      {screen === 'menu' && (
        <MainMenu
          player={player}
          onStartPractice={() => {
            setGameMode('practice');
            setScreen('game');
          }}
          onStartSimulated={() => {
            setGameMode('online');
            setScreen('game');
          }}
          onStartRealOnline={() => {
            setScreen('online');
          }}
          onOpenShop={() => setScreen('shop')}
          onOpenCrates={() => setScreen('crates')}
          onOpenInventory={() => setScreen('inventory')}
        />
      )}

      {screen === 'shop' && (
        <Shop
          player={player}
          onBack={() => setScreen('menu')}
          onBuyWeapon={handleBuyWeapon}
          onBuySkin={handleBuySkin}
        />
      )}

      {screen === 'crates' && (
        <Crates
          player={player}
          onBack={() => setScreen('menu')}
          onSpendCoins={spendCoins}
          onAddCoins={addCoins}
          onAddWeapon={addWeapon}
        />
      )}

      {screen === 'inventory' && (
        <Inventory
          player={player}
          onBack={() => setScreen('menu')}
          onEquipWeapon={equipWeapon}
          onEquipSkin={equipSkin}
        />
      )}

      {screen === 'game' && (
        <GameArena
          player={player}
          mode={gameMode}
          onBack={() => setScreen('menu')}
          onAddCoins={addCoins}
          onAddKill={addKill}
          onAddDeath={addDeath}
        />
      )}

      {screen === 'online' && (
        <OnlineGame
          player={player}
          onBack={() => setScreen('menu')}
        />
      )}
    </>
  );
}

export default App;
