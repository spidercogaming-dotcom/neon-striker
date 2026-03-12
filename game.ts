import type { Weapon } from '../types/game';

export const weapons: Weapon[] = [
  {
    id: 'pistol',
    name: 'Pistol',
    damage: 15,
    fireRate: 400,
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1500,
    price: 0,
    rarity: 'common',
    color: '#60a5fa',
    icon: '🔫'
  },
  {
    id: 'smg',
    name: 'SMG',
    damage: 12,
    fireRate: 100,
    ammo: 30,
    maxAmmo: 30,
    reloadTime: 2000,
    price: 500,
    rarity: 'common',
    color: '#34d399',
    icon: '⚡'
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    damage: 80,
    fireRate: 800,
    ammo: 6,
    maxAmmo: 6,
    reloadTime: 2500,
    price: 800,
    rarity: 'rare',
    color: '#fbbf24',
    icon: '💥'
  },
  {
    id: 'rifle',
    name: 'Assault Rifle',
    damage: 25,
    fireRate: 150,
    ammo: 25,
    maxAmmo: 25,
    reloadTime: 2200,
    price: 1200,
    rarity: 'rare',
    color: '#f87171',
    icon: '🎯'
  },
  {
    id: 'sniper',
    name: 'Sniper',
    damage: 100,
    fireRate: 1500,
    ammo: 5,
    maxAmmo: 5,
    reloadTime: 3000,
    price: 2000,
    rarity: 'epic',
    color: '#a78bfa',
    icon: '🔭'
  },
  {
    id: 'minigun',
    name: 'Minigun',
    damage: 20,
    fireRate: 50,
    ammo: 100,
    maxAmmo: 100,
    reloadTime: 4000,
    price: 3500,
    rarity: 'legendary',
    color: '#fb923c',
    icon: '🌀'
  },
  {
    id: 'laser',
    name: 'Laser Cannon',
    damage: 50,
    fireRate: 200,
    ammo: 20,
    maxAmmo: 20,
    reloadTime: 1500,
    price: 5000,
    rarity: 'legendary',
    color: '#22d3ee',
    icon: '⚡'
  }
];

export const getWeaponById = (id: string): Weapon | undefined => {
  return weapons.find(w => w.id === id);
};
