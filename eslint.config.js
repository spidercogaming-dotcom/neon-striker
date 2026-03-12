export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  icon: string;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  pattern: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Crate {
  id: string;
  name: string;
  price: number;
  items: { weaponId: string; chance: number }[];
  color: string;
}

export interface Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  weapon: Weapon;
  coins: number;
  kills: number;
  deaths: number;
  inventory: Weapon[];
  skins: Skin[];
  currentSkin: Skin | null;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  weapon: Weapon;
  name: string;
  isPlayer: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  owner: 'player' | 'enemy';
  color: string;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'speed' | 'damage' | 'ammo';
  duration: number;
}

export type GameMode = 'practice' | 'online';
