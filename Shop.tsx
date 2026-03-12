import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../types/game';
import { CoinDisplay } from '../components/CoinDisplay';
import { NeonButton } from '../components/NeonButton';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface OtherPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  weapon: any;
  skin: any;
  kills: number;
  deaths: number;
}

interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'speed' | 'damage' | 'ammo';
}

interface OnlineGameProps {
  player: Player;
  onBack: () => void;
}

export const OnlineGame = ({ player, onBack }: OnlineGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<'connecting' | 'playing' | 'disconnected'>('connecting');
  
  const [localPlayer, setLocalPlayer] = useState({
    x: 400,
    y: 300,
    health: 100,
    ammo: player.weapon.ammo,
    reloading: false
  });
  
  const [otherPlayers, setOtherPlayers] = useState<Map<string, OtherPlayer>>(new Map());
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [roomId] = useState('main');
  
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastShotRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const updateSentRef = useRef<number>(0);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 600;
  }, []);
  
  // Connect to server
  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setGameState('playing');
      
      // Join game
      socket.emit('join_game', {
        roomId,
        playerName: `Player${Math.floor(Math.random() * 9999)}`,
        weapon: player.weapon,
        skin: player.currentSkin
      });
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      setGameState('disconnected');
    });
    
    socket.on('connect_error', () => {
      setGameState('disconnected');
    });
    
    // Game events
    socket.on('game_joined', (data) => {
      console.log('Joined game:', data);
      if (data.gameState) {
        const playersMap = new Map();
        data.gameState.players.forEach((p: OtherPlayer) => {
          playersMap.set(p.id, p);
        });
        setOtherPlayers(playersMap);
        setProjectiles(data.gameState.projectiles || []);
        setPowerUps(data.gameState.powerUps || []);
      }
    });
    
    socket.on('player_joined', (newPlayer) => {
      setOtherPlayers(prev => new Map(prev).set(newPlayer.id, newPlayer));
    });
    
    socket.on('player_updated', (data) => {
      setOtherPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(data.playerId);
        if (player) {
          newMap.set(data.playerId, { ...player, ...data });
        }
        return newMap;
      });
    });
    
    socket.on('player_left', (data) => {
      setOtherPlayers(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.playerId);
        return newMap;
      });
    });
    
    socket.on('projectile_fired', (data) => {
      setProjectiles(prev => [...prev, data]);
    });
    
    socket.on('game_state', (state) => {
      const playersMap = new Map();
      state.players.forEach((p: OtherPlayer) => {
        playersMap.set(p.id, p);
      });
      setOtherPlayers(playersMap);
      setProjectiles(state.projectiles || []);
      setPowerUps(state.powerUps || []);
      
      // Update local player health from server
      const myPlayer = state.players.find((p: OtherPlayer) => p.id === socket.id);
      if (myPlayer) {
        setLocalPlayer(prev => ({ ...prev, health: myPlayer.health }));
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [player.weapon, player.currentSkin]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      
      // Update local player position
      const speed = 5;
      let newX = localPlayer.x;
      let newY = localPlayer.y;
      
      if (keysRef.current.has('w') || keysRef.current.has('ArrowUp')) newY -= speed;
      if (keysRef.current.has('s') || keysRef.current.has('ArrowDown')) newY += speed;
      if (keysRef.current.has('a') || keysRef.current.has('ArrowLeft')) newX -= speed;
      if (keysRef.current.has('d') || keysRef.current.has('ArrowRight')) newX += speed;
      
      // Clamp position
      newX = Math.max(20, Math.min(canvas.width - 20, newX));
      newY = Math.max(20, Math.min(canvas.height - 20, newY));
      
      setLocalPlayer(prev => ({ ...prev, x: newX, y: newY }));
      
      // Draw local player
      const skinColor = player.currentSkin?.color || '#60a5fa';
      const isRainbow = player.currentSkin?.color === 'rainbow';
      
      ctx.save();
      const angle = Math.atan2(mouseRef.current.y - localPlayer.y, mouseRef.current.x - localPlayer.x);
      ctx.translate(localPlayer.x, localPlayer.y);
      ctx.rotate(angle);
      
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
      
      // Draw name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', localPlayer.x, localPlayer.y - 30);
      
      // Draw other players
      otherPlayers.forEach((otherPlayer) => {
        const otherSkinColor = otherPlayer.skin?.color || '#f97316';
        const otherIsRainbow = otherPlayer.skin?.color === 'rainbow';
        
        ctx.save();
        ctx.translate(otherPlayer.x, otherPlayer.y);
        
        const otherGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        if (otherIsRainbow) {
          otherGradient.addColorStop(0, '#ff0000');
          otherGradient.addColorStop(1, '#ff00ff');
        } else {
          otherGradient.addColorStop(0, otherSkinColor);
          otherGradient.addColorStop(1, `${otherSkinColor}40`);
        }
        ctx.fillStyle = otherGradient;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        
        // Health bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(otherPlayer.x - 25, otherPlayer.y - 30, 50, 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(otherPlayer.x - 25, otherPlayer.y - 30, 50 * (otherPlayer.health / otherPlayer.maxHealth), 6);
        
        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(otherPlayer.name, otherPlayer.x, otherPlayer.y - 35);
      });
      
      // Draw projectiles
      projectiles.forEach((proj) => {
        ctx.fillStyle = proj.color;
        ctx.beginPath(); ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      // Draw power-ups
      const powerUpColors = { health: '#22c55e', speed: '#3b82f6', damage: '#f59e0b', ammo: '#8b5cf6' };
      const powerUpIcons = { health: '❤️', speed: '⚡', damage: '💪', ammo: '🔫' };
      
      powerUps.forEach((powerUp) => {
        ctx.fillStyle = powerUpColors[powerUp.type];
        ctx.beginPath(); ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2); ctx.fill();
        ctx.font = '16px Arial';
        ctx.fillText(powerUpIcons[powerUp.type], powerUp.x - 8, powerUp.y + 5);
      });
      
      // Send update to server (throttled)
      const now = Date.now();
      if (now - updateSentRef.current > 16) {
        socketRef.current?.emit('player_update', {
          x: localPlayer.x,
          y: localPlayer.y
        });
        updateSentRef.current = now;
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, localPlayer, otherPlayers, projectiles, powerUps, player.currentSkin, player.weapon]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === 'r' && !localPlayer.reloading && localPlayer.ammo < player.weapon.maxAmmo) {
        setLocalPlayer(prev => ({ ...prev, reloading: true }));
        setTimeout(() => {
          setLocalPlayer(prev => ({ ...prev, reloading: false, ammo: player.weapon.maxAmmo }));
        }, player.weapon.reloadTime);
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
  }, [localPlayer.reloading, localPlayer.ammo, player.weapon]);
  
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
      if (gameState !== 'playing' || localPlayer.reloading || localPlayer.ammo <= 0) return;
      
      const now = Date.now();
      if (now - lastShotRef.current >= player.weapon.fireRate) {
        const angle = Math.atan2(
          mouseRef.current.y - localPlayer.y,
          mouseRef.current.x - localPlayer.x
        );
        
        socketRef.current?.emit('player_shoot', {
          x: localPlayer.x,
          y: localPlayer.y,
          vx: Math.cos(angle) * 12,
          vy: Math.sin(angle) * 12,
          damage: player.weapon.damage,
          color: player.currentSkin?.color === 'rainbow' ? '#ffffff' : (player.currentSkin?.color || '#60a5fa')
        });
        
        setLocalPlayer(prev => ({ ...prev, ammo: prev.ammo - 1 }));
        lastShotRef.current = now;
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState, localPlayer.reloading, localPlayer.ammo, localPlayer.x, localPlayer.y, player.weapon, player.currentSkin]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* HUD */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <NeonButton onClick={onBack} color="#ef4444" size="sm">
              ✕ EXIT
            </NeonButton>
            <div className={`px-3 py-1 rounded-lg font-bold ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {connected ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </div>
            <div className="text-white font-bold">
              Players: <span className="text-cyan-400">{otherPlayers.size + 1}</span>
            </div>
          </div>
          <CoinDisplay coins={player.coins} />
        </div>
        
        {/* Canvas */}
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
                  animate={{ width: `${(localPlayer.health / 100) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-white font-bold">{localPlayer.health}/100</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">🔫</span>
              <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(localPlayer.ammo / player.weapon.maxAmmo) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-white font-bold">{localPlayer.ammo}/{player.weapon.maxAmmo}</span>
              {localPlayer.reloading && (
                <span className="text-yellow-400 font-bold animate-pulse">RELOADING...</span>
              )}
            </div>
          </div>
          
          {/* Connection status */}
          {gameState === 'connecting' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-spin">⏳</div>
                <h2 className="text-2xl font-bold text-white">Connecting to server...</h2>
              </div>
            </div>
          )}
          
          {gameState === 'disconnected' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-bold text-red-500 mb-4">Disconnected</h2>
                <p className="text-slate-400 mb-6">Could not connect to the game server</p>
                <NeonButton onClick={onBack} color="#ef4444" size="lg">
                  Return to Menu
                </NeonButton>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-slate-400 text-sm">
          <p>WASD to move • Click to shoot • R to reload</p>
        </div>
      </div>
    </div>
  );
};
