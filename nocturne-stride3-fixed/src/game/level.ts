export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  style: 'asphalt' | 'metal' | 'gantry' | 'holo';
  oneWay?: boolean;
  switchGroup?: string;
}

export interface Slope {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bottomY: number;
}

export interface MovingPlatform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  phase: number;
  vx: number;
  vy: number;
  prevX: number;
  prevY: number;
}

export interface SealBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  broken: boolean;
  hitFlash: number;
}

export interface MagicSwitch {
  id: string;
  x: number;
  y: number;
  r: number;
  group: string;
  activated: boolean;
  pulse: number;
}

export interface DroneEnemy {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minX: number;
  maxX: number;
  vx: number;
  baseY: number;
  alive: boolean;
  bobPhase: number;
}

export interface ManaOrb {
  id: string;
  x: number;
  y: number;
  r: number;
  collected: boolean;
  value: number;
  bonus?: boolean;
  phase: number;
}

export interface NeonSign {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
}

export interface Checkpoint {
  x: number;
  y: number;
}

export interface LevelData {
  width: number;
  spawn: { x: number; y: number };
  goal: { x: number; y: number; w: number; h: number };
  platforms: Platform[];
  slopes: Slope[];
  movingPlatforms: MovingPlatform[];
  sealBlocks: SealBlock[];
  switches: MagicSwitch[];
  drones: DroneEnemy[];
  orbs: ManaOrb[];
  checkpoints: Checkpoint[];
  neonSigns: NeonSign[];
}

export function createTestLevel(): LevelData {
  const platforms: Platform[] = [
    // Zone 1: Starting Rooftop Street (0 - 560)
    { id: 'g1', x: 0, y: 370, w: 560, h: 140, style: 'asphalt' },
    // Low overhead gantry beam — slide underneath (clearance = 30px) or jump over!
    { id: 'gantry1', x: 280, y: 312, w: 120, h: 28, style: 'gantry' },
    // Stepped platforms
    { id: 'p1', x: 455, y: 300, w: 92, h: 16, style: 'metal', oneWay: true },
    { id: 'p2', x: 580, y: 255, w: 105, h: 16, style: 'metal', oneWay: true },

    // Zone 1B: Second Street & High Step (685 - 1180)
    { id: 'g2', x: 685, y: 370, w: 495, h: 140, style: 'asphalt' },
    { id: 'box1', x: 825, y: 318, w: 74, h: 52, style: 'metal' },
    { id: 'p3', x: 960, y: 268, w: 96, h: 16, style: 'metal', oneWay: true },

    // Zone 2: Slope Ascent & High Launch Deck (1180 - 1450)
    { id: 'step1', x: 1180, y: 315, w: 115, h: 195, style: 'asphalt' },
    { id: 'deck1', x: 1295, y: 245, w: 155, h: 265, style: 'asphalt' },

    // Slope runs from (1450, 245) to (1890, 390)
    // Slope Runout
    { id: 'runout1', x: 1890, y: 390, w: 130, h: 120, style: 'asphalt' },

    // Zone 3: Seal Block Chamber & Magic Switch Chasm (2630 - 3060)
    { id: 'g3', x: 2630, y: 350, w: 440, h: 160, style: 'asphalt' },
    // Upper gantry ceiling over Seal Block wall
    { id: 'gantry2', x: 2810, y: 205, w: 150, h: 26, style: 'gantry' },
    // Alcove ceiling & shelf
    { id: 'p4', x: 2925, y: 278, w: 80, h: 14, style: 'metal', oneWay: true },

    // Summoned Holo Platforms (activated by Magic Switch 'bridgeA')
    { id: 'holo1', x: 3125, y: 340, w: 90, h: 14, style: 'holo', oneWay: true, switchGroup: 'bridgeA' },
    { id: 'holo2', x: 3255, y: 306, w: 90, h: 14, style: 'holo', oneWay: true, switchGroup: 'bridgeA' },
    { id: 'holo3', x: 3385, y: 326, w: 90, h: 14, style: 'holo', oneWay: true, switchGroup: 'bridgeA' },

    // Zone 4: Drone Arena & Vertical Ascent (3510 - 4580)
    { id: 'g4', x: 3510, y: 350, w: 630, h: 160, style: 'asphalt' },
    { id: 'p5', x: 3770, y: 258, w: 145, h: 16, style: 'metal', oneWay: true },
    { id: 'p6', x: 3970, y: 215, w: 110, h: 16, style: 'metal', oneWay: true },

    // Gap (4140 - 4255), then step up to final high ramp
    { id: 'g5', x: 4255, y: 330, w: 145, h: 180, style: 'asphalt' },
    { id: 'p7', x: 4330, y: 276, w: 68, h: 14, style: 'metal', oneWay: true },
    { id: 'deck2', x: 4400, y: 246, w: 185, h: 264, style: 'asphalt' },

    // Final Slope runs from (4585, 246) to (4835, 360)
    // Zone 5: Goal Plaza
    { id: 'goalPlaza', x: 4835, y: 360, w: 480, h: 150, style: 'asphalt' },
  ];

  const slopes: Slope[] = [
    { id: 'slope1', x1: 1450, y1: 245, x2: 1890, y2: 390, bottomY: 510 },
    { id: 'slope2', x1: 4585, y1: 246, x2: 4835, y2: 360, bottomY: 510 },
  ];

  const movingPlatforms: MovingPlatform[] = [
    {
      id: 'mp1',
      x: 2080,
      y: 345,
      w: 96,
      h: 16,
      startX: 2050,
      startY: 345,
      endX: 2205,
      endY: 345,
      speed: 1.45,
      phase: 0,
      vx: 0,
      vy: 0,
      prevX: 2080,
      prevY: 345,
    },
    {
      id: 'mp2',
      x: 2295,
      y: 280,
      w: 96,
      h: 16,
      startX: 2295,
      startY: 340,
      endX: 2295,
      endY: 225,
      speed: 1.55,
      phase: 1.1,
      vx: 0,
      vy: 0,
      prevX: 2295,
      prevY: 280,
    },
    {
      id: 'mp3',
      x: 2465,
      y: 270,
      w: 96,
      h: 16,
      startX: 2435,
      startY: 270,
      endX: 2565,
      endY: 315,
      speed: 1.4,
      phase: 2.2,
      vx: 0,
      vy: 0,
      prevX: 2465,
      prevY: 270,
    },
  ];

  const sealBlocks: SealBlock[] = [
    // Stack blocking the path under gantry2
    { id: 'sb1', x: 2845, y: 235, w: 36, h: 36, hp: 1, broken: false, hitFlash: 0 },
    { id: 'sb2', x: 2845, y: 273, w: 36, h: 36, hp: 1, broken: false, hitFlash: 0 },
    { id: 'sb3', x: 2845, y: 311, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    // Bonus seal crystal guarding upper shelf orbs
    { id: 'sb4', x: 2925, y: 238, w: 36, h: 36, hp: 1, broken: false, hitFlash: 0 },
    // Seal block on Drone Arena high ledge
    { id: 'sb5', x: 3995, y: 175, w: 36, h: 36, hp: 1, broken: false, hitFlash: 0 },
  ];

  const switches: MagicSwitch[] = [
    { id: 'sw1', x: 3145, y: 262, r: 16, group: 'bridgeA', activated: false, pulse: 0 },
  ];

  const drones: DroneEnemy[] = [
    { id: 'd1', x: 780, y: 334, w: 30, h: 24, minX: 720, maxX: 805, vx: 62, baseY: 334, alive: true, bobPhase: 0 },
    { id: 'd2', x: 3680, y: 314, w: 30, h: 24, minX: 3580, maxX: 3820, vx: 82, baseY: 314, alive: true, bobPhase: 1.2 },
    { id: 'd3', x: 3860, y: 222, w: 30, h: 24, minX: 3780, maxX: 3900, vx: -74, baseY: 222, alive: true, bobPhase: 2.5 },
    { id: 'd4', x: 3960, y: 314, w: 30, h: 24, minX: 3880, maxX: 4110, vx: 92, baseY: 314, alive: true, bobPhase: 0.7 },
    { id: 'd5', x: 4480, y: 210, w: 30, h: 24, minX: 4415, maxX: 4565, vx: 80, baseY: 210, alive: true, bobPhase: 1.9 },
  ];

  const orbs: ManaOrb[] = [
    // Zone 1 under gantry (slide reward!)
    { id: 'o1', x: 305, y: 352, r: 8, collected: false, value: 100, phase: 0.1 },
    { id: 'o2', x: 340, y: 352, r: 8, collected: false, value: 100, phase: 0.5 },
    { id: 'o3', x: 375, y: 352, r: 8, collected: false, value: 100, phase: 0.9 },
    // Over platforms & pit
    { id: 'o4', x: 500, y: 274, r: 8, collected: false, value: 100, phase: 1.3 },
    { id: 'o5', x: 632, y: 224, r: 8, collected: false, value: 100, phase: 1.7 },
    { id: 'o6', x: 1008, y: 234, r: 8, collected: false, value: 100, phase: 2.1 },
    // Slope 1 downhill trail
    { id: 'o7', x: 1500, y: 238, r: 8, collected: false, value: 100, phase: 0.2 },
    { id: 'o8', x: 1560, y: 258, r: 8, collected: false, value: 100, phase: 0.6 },
    { id: 'o9', x: 1620, y: 278, r: 8, collected: false, value: 100, phase: 1.0 },
    { id: 'o10', x: 1680, y: 298, r: 8, collected: false, value: 100, phase: 1.4 },
    { id: 'o11', x: 1740, y: 318, r: 8, collected: false, value: 100, phase: 1.8 },
    { id: 'o12', x: 1800, y: 338, r: 8, collected: false, value: 100, phase: 2.2 },
    { id: 'o13', x: 1860, y: 358, r: 8, collected: false, value: 100, phase: 2.6 },
    // Moving platforms
    { id: 'o14', x: 2130, y: 295, r: 8, collected: false, value: 100, phase: 0.4 },
    { id: 'o15', x: 2342, y: 220, r: 8, collected: false, value: 100, phase: 0.8 },
    { id: 'o16', x: 2510, y: 232, r: 8, collected: false, value: 100, phase: 1.2 },
    // Bonus orbs behind Seal Blocks
    { id: 'o17', x: 2978, y: 250, r: 10, collected: false, value: 300, bonus: true, phase: 0.0 },
    { id: 'o18', x: 2978, y: 322, r: 8, collected: false, value: 100, phase: 0.7 },
    // Bridge orbs
    { id: 'o19', x: 3170, y: 310, r: 8, collected: false, value: 100, phase: 1.1 },
    { id: 'o20', x: 3300, y: 276, r: 8, collected: false, value: 100, phase: 1.5 },
    { id: 'o21', x: 3430, y: 296, r: 8, collected: false, value: 100, phase: 1.9 },
    // Drone arena high bonus
    { id: 'o22', x: 4050, y: 182, r: 10, collected: false, value: 300, bonus: true, phase: 0.3 },
    // Final slope trail
    { id: 'o23', x: 4630, y: 240, r: 8, collected: false, value: 100, phase: 0.4 },
    { id: 'o24', x: 4685, y: 266, r: 8, collected: false, value: 100, phase: 0.8 },
    { id: 'o25', x: 4740, y: 292, r: 8, collected: false, value: 100, phase: 1.2 },
    { id: 'o26', x: 4795, y: 318, r: 8, collected: false, value: 100, phase: 1.6 },
  ];

  const checkpoints: Checkpoint[] = [
    { x: 90, y: 370 },
    { x: 1320, y: 245 },
    { x: 2675, y: 350 },
    { x: 3550, y: 350 },
    { x: 4440, y: 246 },
  ];

  const neonSigns: NeonSign[] = [
    { x: 286, y: 316, w: 108, h: 20, label: 'UNDERPASS 07', color: '#38bdf8' },
    { x: 1315, y: 175, w: 112, h: 26, label: 'DOWNHILL', color: '#22d3ee' },
    { x: 2816, y: 208, w: 138, h: 20, label: 'SEALED SECTOR', color: '#a78bfa' },
    { x: 3530, y: 268, w: 110, h: 24, label: 'SECTOR-09', color: '#f59e0b' },
    { x: 4980, y: 215, w: 120, h: 26, label: 'TRANSIT GATE', color: '#34d399' },
  ];

  return {
    width: 5315,
    spawn: { x: 80, y: 325 },
    goal: { x: 5040, y: 244, w: 54, h: 116 },
    platforms,
    slopes,
    movingPlatforms,
    sealBlocks,
    switches,
    drones,
    orbs,
    checkpoints,
    neonSigns,
  };
}
