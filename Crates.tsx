import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Player, Enemy, Projectile, PowerUp, GameMode } from '../types/game';
import { weapons } from '../data/weapons';
import { CoinDisplay } from '../components/CoinDisplay';
import { NeonButton } from '../components/NeonButton';

interface GameArenaProps {
  player: Player;
  mode: GameMode;
  onBack: () => void;
  onAddCoins: (amount: number) => void;
  onAddKill: () => void;
  onAddDeath: () => void;
}

export const GameArena = ({ player, mode, onBack, onAddCoins, onAddKill, onAddDeath }: GameArenaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(player.maxHealth);
  const [ammo, setAmmo] = useState(player.weapon.ammo);
  const [reloading, setReloading] = useState(false);
  const [killCount, setKillCount] = useState(0);
  
  // Game state refs
  const playerPosRef = useRef({ x: 400, y: 300 });
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastShotRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const enemySpawnRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 800, height: 600 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;
    canvasSizeRef.current = { width: 800, height: 600 };
    mouseRef.current = { x: 400, y: 300 };
  }, []);

  // Spawn enemy
  const spawnEnemy = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0: x = Math.random() * 800; y = -30; break;
      case 1: x = 830; y = Math.random() * 600; break;
      case 2: x = Math.random() * 800; y = 630; break;
      case 3: x = -30; y = Math.random() * 600; break;
      default: x = 0; y = 0;
    }

    // Different weapon availability based on mode
    const enemyWeapons = mode === 'online'
      ? weapons // All weapons available in online mode
      : weapons.slice(0, Math.min(wave + 1, weapons.length)); // Progressive in practice
    const randomWeapon = enemyWeapons[Math.floor(Math.random() * enemyWeapons.length)];

    // Generate random player names for online mode
    const randomNames = [
      'ShadowX', 'NeonNinja', 'CyberWolf', 'PixelHunter', 'StormRider',
      'GhostSniper', 'BlazeMaster', 'FrostByte', 'ThunderBolt', 'NightHawk',
      'DragonSlayer', 'PhoenixRise', 'QuantumLeap', 'VoidWalker', 'StarGazer'
    ];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)] + Math.floor(Math.random() * 999);

    enemiesRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      health: mode === 'online' ? 100 : (30 + wave * 10),
      maxHealth: mode === 'online' ? 100 : (30 + wave * 10),
      speed: mode === 'online' ? (2 + Math.random() * 2) : (1 + wave * 0.2),
      weapon: randomWeapon,
      name: mode === 'online' ? randomName : `Enemy ${Math.floor(Math.random() * 1000)}`,
      isPlayer: false
    });
  }, [wave, mode]);

  // Spawn power-up
  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > 0.2) return; // 20% chance
    
    const types: PowerUp['type'][] = ['health', 'speed', 'damage', 'ammo'];
    powerUpsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      type: types[Math.floor(Math.random() * types.length)],
      duration: 5000
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasSizeRef.current.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasSizeRef.current.height); ctx.stroke();
      }
      for (let y = 0; y < canvasSizeRef.current.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasSizeRef.current.width, y); ctx.stroke();
      }

      // Update player position
      const speed = 5;
      if (keysRef.current.has('w') || keysRef.current.has('ArrowUp')) playerPosRef.current.y -= speed;
      if (keysRef.current.has('s') || keysRef.current.has('ArrowDown')) playerPosRef.current.y += speed;
      if (keysRef.current.has('a') || keysRef.current.has('ArrowLeft')) playerPosRef.current.x -= speed;
      if (keysRef.current.has('d') || keysRef.current.has('ArrowRight')) playerPosRef.current.x += speed;

      // Clamp player position
      playerPosRef.current.x = Math.max(20, Math.min(canvasSizeRef.current.width - 20, playerPosRef.current.x));
      playerPosRef.current.y = Math.max(20, Math.min(canvasSizeRef.current.height - 20, playerPosRef.current.y));

      // Draw player
      const skinColor = player.currentSkin?.color || '#60a5fa';
      const isRainbow = player.currentSkin?.color === 'rainbow';
      
      ctx.save();
      const angle = Math.atan2(mouseRef.current.y - playerPosRef.current.y, mouseRef.current.x - playerPosRef.current.x);
      ctx.translate(playerPosRef.current.x, playerPosRef.current.y);
      ctx.rotate(angle);
      
      // Player body
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      if (isRainbow) {
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.25, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.75, '#0000ff');
        gradient.addColorStop(1, '#ff00ff');
      } else {
        gradient.addColorStop(0, skinColor);
        gradient.addColorStop(1, `${skinColor}40`);
      }
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      
      // Gun
      ctx.fillStyle = '#475569';
      ctx.fillRect(15, -4, 25, 8);
      ctx.restore();

      // Spawn enemies
      enemySpawnRef.current += deltaTime;
      const spawnRate = mode === 'online'
        ? Math.max(500 - wave * 20, 200) // Faster spawning in online mode
        : Math.max(1000 - wave * 50, 300); // Progressive in practice mode
      const maxEnemies = mode === 'online' ? 15 : 10;

      if (enemySpawnRef.current > spawnRate && enemiesRef.current.length < maxEnemies) {
        spawnEnemy();
        enemySpawnRef.current = 0;
      }

      // Update and draw enemies
      enemiesRef.current = enemiesRef.current.filter(enemy => {
        let targetX = playerPosRef.current.x;
        let targetY = playerPosRef.current.y;

        // In online mode, enemies can target each other
        if (mode === 'online') {
          let closestDist = Infinity;
          let closestEnemy: Enemy | null = null;

          // Find closest target (player or other enemy)
          for (const otherEnemy of enemiesRef.current) {
            if (otherEnemy.id === enemy.id) continue;

            const dx = otherEnemy.x - enemy.x;
            const dy = otherEnemy.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = otherEnemy;
            }
          }

          // Check distance to player
          const playerDx = playerPosRef.current.x - enemy.x;
          const playerDy = playerPosRef.current.y - enemy.y;
          const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);

          // Target closest entity
          if (playerDist < closestDist) {
            targetX = playerPosRef.current.x;
            targetY = playerPosRef.current.y;
          } else if (closestEnemy) {
            targetX = closestEnemy.x;
            targetY = closestEnemy.y;
          }
        }

        // Move towards target
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 100) {
          enemy.x += (dx / dist) * enemy.speed;
          enemy.y += (dy / dist) * enemy.speed;
        }

        // Draw enemy
        ctx.fillStyle = mode === 'online' ? '#f97316' : '#ef4444';
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 18, 0, Math.PI * 2); ctx.fill();

        // Enemy name (only in online mode)
        if (mode === 'online') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(enemy.name, enemy.x, enemy.y - 35);
        }

        // Health bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(enemy.x - 25, enemy.y - 30, 50, 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(enemy.x - 25, enemy.y - 30, 50 * (enemy.health / enemy.maxHealth), 6);

        // Enemy shoots
        if (Math.random() < (mode === 'online' ? 0.02 : 0.01)) {
          const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
          projectilesRef.current.push({
            id: Math.random().toString(),
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            damage: enemy.weapon.damage * 0.5,
            owner: 'enemy',
            color: mode === 'online' ? '#f97316' : '#ef4444'
          });
        }

        return enemy.health > 0;
      });

      // Update and draw projectiles
      projectilesRef.current = projectilesRef.current.filter(proj => {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Draw projectile
        ctx.fillStyle = proj.color;
        ctx.beginPath(); ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2); ctx.fill();
        
        // Glow effect
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check collisions
        if (proj.owner === 'player') {
          for (let enemy of enemiesRef.current) {
            const dx = proj.x - enemy.x;
            const dy = proj.y - enemy.y;
            if (Math.sqrt(dx * dx + dy * dy) < 23) {
              enemy.health -= proj.damage;
              if (enemy.health <= 0) {
                setKillCount(c => c + 1);
                setScore(s => s + (mode === 'online' ? 150 : 100 * wave));
                onAddKill();
                spawnPowerUp(enemy.x, enemy.y);
              }
              return false;
            }
          }
        } else {
          // Enemy projectiles can hit player OR other enemies (in online mode)
          if (mode === 'online') {
            // Check if hits player
            const playerDx = proj.x - playerPosRef.current.x;
            const playerDy = proj.y - playerPosRef.current.y;
            if (Math.sqrt(playerDx * playerDx + playerDy * playerDy) < 25) {
              setHealth(h => {
                const newHealth = h - proj.damage;
                if (newHealth <= 0) {
                  setGameState('gameover');
                  onAddDeath();
                }
                return Math.max(0, newHealth);
              });
              return false;
            }

            // Check if hits other enemies
            for (let enemy of enemiesRef.current) {
              const dx = proj.x - enemy.x;
              const dy = proj.y - enemy.y;
              if (Math.sqrt(dx * dx + dy * dy) < 23) {
                enemy.health -= proj.damage;
                if (enemy.health <= 0) {
                  setScore(s => s + 50);
                  spawnPowerUp(enemy.x, enemy.y);
                }
                return false;
              }
            }
          } else {
            // Practice mode - only hits player
            const dx = proj.x - playerPosRef.current.x;
            const dy = proj.y - playerPosRef.current.y;
            if (Math.sqrt(dx * dx + dy * dy) < 25) {
              setHealth(h => {
                const newHealth = h - proj.damage;
                if (newHealth <= 0) {
                  setGameState('gameover');
                  onAddDeath();
                }
                return Math.max(0, newHealth);
              });
              return false;
            }
          }
        }

        // Remove if out of bounds
        return proj.x > 0 && proj.x < canvasSizeRef.current.width && proj.y > 0 && proj.y < canvasSizeRef.current.height;
      });

      // Update and draw power-ups
      powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
        const dx = playerPosRef.current.x - powerUp.x;
        const dy = playerPosRef.current.y - powerUp.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          switch (powerUp.type) {
            case 'health': setHealth(h => Math.min(player.maxHealth, h + 30)); break;
            case 'ammo': setAmmo(a => Math.min(player.weapon.maxAmmo, a + 10)); break;
            case 'damage': onAddCoins(50); break;
          }
          return false;
        }

        // Draw power-up
        const colors = { health: '#22c55e', speed: '#3b82f6', damage: '#f59e0b', ammo: '#8b5cf6' };
        const icons = { health: '❤️', speed: '⚡', damage: '💪', ammo: '🔫' };
        
        ctx.fillStyle = colors[powerUp.type];
        ctx.beginPath(); ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2); ctx.fill();
        ctx.font = '16px Arial';
        ctx.fillText(icons[powerUp.type], powerUp.x - 8, powerUp.y + 5);

        return true;
      });

      // Wave progression
      if (mode === 'practice' && killCount >= wave * 5) {
        setWave(w => w + 1);
        setKillCount(0);
      } else if (mode === 'online' && killCount >= 10) {
        setWave(w => w + 1);
        setKillCount(0);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, wave, player, spawnEnemy, spawnPowerUp, onAddKill, onAddDeath]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === 'r' && !reloading && ammo < player.weapon.maxAmmo) {
        setReloading(true);
        setTimeout(() => {
          setAmmo(player.weapon.maxAmmo);
          setReloading(false);
        }, player.weapon.reloadTime);
      }
      if (e.key === 'Escape') {
        setGameState(g => g === 'paused' ? 'playing' : 'paused');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [reloading, ammo, player.weapon]);

  // Handle mouse input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = () => {
      if (gameState !== 'playing' || reloading || ammo <= 0) return;

      const now = Date.now();
      if (now - lastShotRef.current >= player.weapon.fireRate) {
        const angle = Math.atan2(
          mouseRef.current.y - playerPosRef.current.y,
          mouseRef.current.x - playerPosRef.current.x
        );

        projectilesRef.current.push({
          id: Math.random().toString(),
          x: playerPosRef.current.x,
          y: playerPosRef.current.y,
          vx: Math.cos(angle) * 12,
          vy: Math.sin(angle) * 12,
          damage: player.weapon.damage,
          owner: 'player',
          color: player.currentSkin?.color === 'rainbow' ? '#ffffff' : (player.currentSkin?.color || '#60a5fa')
        });

        setAmmo(a => a - 1);
        lastShotRef.current = now;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState, reloading, ammo, player.weapon, player.currentSkin]);

  const handleRestart = () => {
    setGameState('playing');
    setHealth(player.maxHealth);
    setAmmo(player.weapon.ammo);
    setScore(0);
    setWave(1);
    setKillCount(0);
    enemiesRef.current = [];
    projectilesRef.current = [];
    powerUpsRef.current = [];
    playerPosRef.current = { x: 400, y: 300 };
    onAddCoins(Math.floor(score / 10));
  };

  const handleExit = () => {
    onAddCoins(Math.floor(score / 10));
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* HUD */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <NeonButton onClick={handleExit} color="#ef4444" size="sm">
              ✕ EXIT
            </NeonButton>
            <div className={`px-3 py-1 rounded-lg font-bold ${
              mode === 'online' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {mode === 'online' ? '🌐 ONLINE' : '🎯 PRACTICE'}
            </div>
            <div className="text-white font-bold">
              Wave: <span className="text-cyan-400">{wave}</span>
            </div>
            <div className="text-white font-bold">
              Score: <span className="text-yellow-400">{score.toLocaleString()}</span>
            </div>
          </div>
          <CoinDisplay coins={player.coins} />
        </div>

        {/* Canvas container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="bg-slate-900 cursor-crosshair"
            style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
          />

          {/* Health bar */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-white font-bold">❤️</span>
              <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(health / player.maxHealth) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-white font-bold">{health}/{player.maxHealth}</span>
            </div>
            
            {/* Ammo */}
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">🔫</span>
              <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(ammo / player.weapon.maxAmmo) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-white font-bold">{ammo}/{player.weapon.maxAmmo}</span>
              {reloading && (
                <span className="text-yellow-400 font-bold animate-pulse">RELOADING...</span>
              )}
            </div>
          </div>

          {/* Paused overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white mb-8">PAUSED</h2>
                <NeonButton onClick={() => setGameState('playing')} color="#22d3ee" size="lg">
                  RESUME
                </NeonButton>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-5xl font-black text-red-500 mb-4">GAME OVER</h2>
                <p className="text-2xl text-white mb-2">Final Score: {score.toLocaleString()}</p>
                <p className="text-xl text-yellow-400 mb-8">+{Math.floor(score / 10)} coins earned!</p>
                <div className="flex gap-4 justify-center">
                  <NeonButton onClick={handleRestart} color="#22c3ee" size="lg">
                    🔄 PLAY AGAIN
                  </NeonButton>
                  <NeonButton onClick={handleExit} color="#ef4444" size="lg">
                    ✕ EXIT
                  </NeonButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls info */}
        <div className="mt-4 text-center text-slate-400 text-sm">
          <p>WASD or Arrow Keys to move • Click to shoot • R to reload • ESC to pause</p>
        </div>
      </div>
    </div>
  );
};
