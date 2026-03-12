import { useState, useEffect } from 'react';
import type { Player, Weapon, Skin } from '../types/game';
import { weapons } from '../data/weapons';
import { skins } from '../data/skins';

const DEFAULT_PLAYER: Player = {
  x: 400,
  y: 300,
  health: 100,
  maxHealth: 100,
  weapon: weapons[0],
  coins: 500,
  kills: 0,
  deaths: 0,
  inventory: [weapons[0]],
  skins: [skins[0]],
  currentSkin: skins[0]
};

export const useGameState = () => {
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('shooterPlayer');
    return saved ? JSON.parse(saved) : DEFAULT_PLAYER;
  });

  useEffect(() => {
    localStorage.setItem('shooterPlayer', JSON.stringify(player));
  }, [player]);

  const addCoins = (amount: number) => {
    setPlayer(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const spendCoins = (amount: number) => {
    if (player.coins < amount) return false;
    setPlayer(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  };

  const buyWeapon = (weapon: Weapon) => {
    if (spendCoins(weapon.price)) {
      setPlayer(prev => ({
        ...prev,
        inventory: [...prev.inventory, weapon]
      }));
      return true;
    }
    return false;
  };

  const addWeapon = (weapon: Weapon) => {
    setPlayer(prev => {
      // Check if already owned
      if (prev.inventory.some(w => w.id === weapon.id)) {
        return prev;
      }
      return {
        ...prev,
        inventory: [...prev.inventory, weapon]
      };
    });
  };

  const equipWeapon = (weapon: Weapon) => {
    setPlayer(prev => ({ ...prev, weapon }));
  };

  const buySkin = (skin: Skin) => {
    if (spendCoins(skin.price)) {
      setPlayer(prev => ({
        ...prev,
        skins: [...prev.skins, skin]
      }));
      return true;
    }
    return false;
  };

  const equipSkin = (skin: Skin) => {
    setPlayer(prev => ({ ...prev, currentSkin: skin }));
  };

  const addKill = () => {
    setPlayer(prev => ({ ...prev, kills: prev.kills + 1 }));
  };

  const addDeath = () => {
    setPlayer(prev => ({ ...prev, deaths: prev.deaths + 1 }));
  };

  const resetStats = () => {
    setPlayer(prev => ({ ...prev, kills: 0, deaths: 0 }));
  };

  return {
    player,
    addCoins,
    spendCoins,
    buyWeapon,
    addWeapon,
    equipWeapon,
    buySkin,
    equipSkin,
    addKill,
    addDeath,
    resetStats
  };
};
