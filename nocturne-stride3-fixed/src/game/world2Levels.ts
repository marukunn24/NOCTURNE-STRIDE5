import { createEnemyDefForKind } from './gameData';
import {
  BeamLaserDef,
  BossDef,
  CannonDef,
  EnemyDef,
  EnemyKind,
  GearPlatformDef,
  GravityZoneDef,
  MagicSwitchDef,
  ManaOrbDef,
  MovingPlatformDef,
  NeonSignDef,
  PlatformDef,
  RotatingLaserDef,
  SealBlockDef,
  SlopeDef,
  SpikeTrapDef,
  StageDefinition,
  ThunderRailDef,
} from './types';

function makeW2Enemy(
  id: string,
  kind: EnemyKind,
  x: number,
  floorY: number,
  minX: number,
  maxX: number,
  opts: Partial<EnemyDef> = {}
): EnemyDef {
  const en = createEnemyDefForKind(kind, id, x, floorY, minX, maxX);
  return { ...en, ...opts };
}

function makeW2Orbs(
  prefix: string,
  startX: number,
  y: number,
  count: number,
  stepX: number,
  stepY = 0,
  bonus = false
): ManaOrbDef[] {
  const arr: ManaOrbDef[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: `${prefix}_${i}`,
      x: startX + i * stepX,
      y: y + i * stepY,
      r: bonus ? 10 : 8,
      collected: false,
      value: bonus ? 300 : 100,
      bonus,
      phase: i * 0.45,
    });
  }
  return arr;
}

function emptyW2Stage(
  partial: Partial<StageDefinition> &
    Pick<StageDefinition, 'id' | 'code' | 'title' | 'subtitle' | 'theme' | 'width'>
): StageDefinition {
  return {
    spawn: { x: 70, y: 315 },
    goal: { x: partial.width - 190, y: 244, w: 54, h: 116 },
    platforms: [],
    slopes: [],
    movingPlatforms: [],
    sealBlocks: [],
    switches: [],
    gears: [],
    beamLasers: [],
    rails: [],
    cables: [],
    spikes: [],
    lasers: [],
    gravityZones: [],
    mirrors: [],
    cannons: [],
    pendulumVines: [],
    floatBubbles: [],
    sporeCatapults: [],
    snapTraps: [],
    sporeJets: [],
    bloomBridges: [],
    scythePendulums: [],
    enemies: [],
    orbs: [],
    checkpoints: [{ x: 70, y: 370 }],
    neonSigns: [],
    ...partial,
  };
}

// ============================================================================
// STAGE 2-1: 黄金の時計塔エントランス (14,200px / 8マイクロ区間・高密度アスレチック)
// ============================================================================
function buildStage2_1(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Intro Deck & Spring Bounce
    { id: '21_p1', x: 0, y: 370, w: 520, h: 160, style: 'brass' },
    { id: '21_p2', x: 640, y: 315, w: 320, h: 215, style: 'brass' },
    // Sec 2: Dual Gear Pit & Elevated Clockwork Deck
    { id: '21_p3', x: 1640, y: 345, w: 480, h: 185, style: 'brass' },
    { id: '21_up1', x: 1740, y: 245, w: 220, h: 16, style: 'pylon', oneWay: true },
    { id: '21_p3b', x: 2200, y: 315, w: 150, h: 16, style: 'pylon', oneWay: true },
    // Sec 3: Mirror Gear Boost Canyon & Slope Rush
    { id: '21_p4', x: 2420, y: 365, w: 520, h: 165, style: 'brass' },
    { id: '21_p4b', x: 3040, y: 335, w: 360, h: 195, style: 'pylon' },
    { id: '21_p5', x: 3540, y: 300, w: 380, h: 230, style: 'brass' },
    // Sec 4: Belltower Gear Staircase (No Floor Beneath Gears)
    { id: '21_p6', x: 4320, y: 355, w: 420, h: 175, style: 'brass' },
    { id: '21_p7', x: 5760, y: 325, w: 540, h: 205, style: 'brass' },
    // Sec 5: Over/Under Dash-Rammer Junction
    { id: '21_p8', x: 6460, y: 365, w: 640, h: 165, style: 'brass' },
    { id: '21_hi1', x: 6560, y: 252, w: 420, h: 16, style: 'pylon', oneWay: true },
    { id: '21_wall1', x: 6760, y: 300, w: 34, h: 65, style: 'fortress' },
    // Sec 6: High-Voltage Rail Chain + Gear Transfer
    { id: '21_p9', x: 7240, y: 345, w: 520, h: 185, style: 'pylon' },
    { id: '21_p10', x: 8660, y: 330, w: 480, h: 200, style: 'brass' },
    // Sec 7: Twin Gear Pendulum Crossing + Shock Step
    { id: '21_sh1', x: 9290, y: 315, w: 260, h: 22, style: 'shock_bridge', shockCycle: 3.1, shockDuty: 0.34, shockPhase: 0 },
    { id: '21_p11', x: 9700, y: 355, w: 560, h: 175, style: 'brass' },
    { id: '21_p12', x: 11260, y: 335, w: 540, h: 195, style: 'brass' },
    // Sec 8: Final Clockwork Ascent & Goal Terrace
    { id: '21_gan1', x: 11420, y: 275, w: 150, h: 26, style: 'gantry' },
    { id: '21_p12b', x: 11850, y: 300, w: 120, h: 16, style: 'pylon', oneWay: true },
    { id: '21_p13', x: 12020, y: 365, w: 580, h: 165, style: 'brass' },
    { id: '21_enda', x: 13260, y: 355, w: 430, h: 175, style: 'brass' },
    { id: '21_endb', x: 13775, y: 325, w: 425, h: 205, style: 'brass' },
  ];

  const gears: GearPlatformDef[] = [
    { id: '21_gr1', cx: 1120, cy: 335, r: 90, teeth: 10, toothDepth: 11, rotSpeed: 1.05, angle: 0 },
    { id: '21_gr2', cx: 1440, cy: 310, r: 92, teeth: 10, toothDepth: 11, rotSpeed: -1.1, angle: 0.5 },
    { id: '21_gr3', cx: 4920, cy: 340, r: 96, teeth: 10, toothDepth: 11, rotSpeed: 1.25, angle: 0.2 },
    { id: '21_gr4', cx: 5250, cy: 295, r: 96, teeth: 10, toothDepth: 11, rotSpeed: -1.25, angle: 0.8 },
    { id: '21_gr5', cx: 5560, cy: 325, r: 88, teeth: 10, toothDepth: 11, rotSpeed: 1.3, angle: 0 },
    { id: '21_gr6', cx: 10480, cy: 340, r: 102, teeth: 12, toothDepth: 12, rotSpeed: 1.35, angle: 0 },
    { id: '21_gr7', cx: 10840, cy: 300, r: 102, teeth: 12, toothDepth: 12, rotSpeed: -1.35, angle: 0.4 },
    { id: '21_gr7b', cx: 11100, cy: 325, r: 90, teeth: 10, toothDepth: 11, rotSpeed: 1.35, angle: 0.2 },
    { id: '21_gr8', cx: 12800, cy: 345, r: 94, teeth: 10, toothDepth: 11, rotSpeed: 1.4, angle: 0.1 },
    { id: '21_gr9', cx: 13080, cy: 325, r: 86, teeth: 10, toothDepth: 10, rotSpeed: -1.4, angle: 0.5 },
  ];

  const rails: ThunderRailDef[] = [
    { id: '21_r1', x1: 7780, y1: 295, x2: 8640, y2: 270, speed: 470 },
    { id: '21_r2', x1: 12440, y1: 265, x2: 12780, y2: 245, speed: 465 },
  ];

  const slopes: SlopeDef[] = [
    { id: '21_sl1', x1: 3920, y1: 300, x2: 4320, y2: 355, bottomY: 530 },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('21e1', 'spring_bumper', 420, 370, 260, 500),
    makeW2Enemy('21e2', 'gear_roller', 800, 315, 660, 940),
    makeW2Enemy('21e3', 'laser_drone', 1880, 345, 1680, 2080),
    makeW2Enemy('21e4', 'mirror_gear', 3180, 290, 3000, 3440),
    makeW2Enemy('21e5', 'dash_rammer', 2740, 365, 2460, 2920),
    makeW2Enemy('21e6', 'spark_jelly', 3720, 300, 3560, 3900),
    makeW2Enemy('21e7', 'gear_roller', 4540, 355, 4340, 4720),
    makeW2Enemy('21e8', 'tether_spark', 5980, 325, 5800, 6200),
    makeW2Enemy('21e9', 'dash_rammer', 6640, 365, 6480, 6750),
    makeW2Enemy('21e10', 'spring_bumper', 6940, 365, 6810, 7080),
    makeW2Enemy('21e11', 'thunder_imp', 8160, 285, 7820, 8540),
    makeW2Enemy('21e12', 'laser_drone', 8920, 330, 8680, 9100),
    makeW2Enemy('21e13', 'gravity_flipper', 9980, 355, 9740, 10220),
    makeW2Enemy('21e14', 'gear_roller', 11520, 335, 11280, 11780),
    makeW2Enemy('21e15', 'mirror_gear', 11920, 280, 11800, 12000),
    makeW2Enemy('21e16', 'dash_rammer', 12320, 365, 12060, 12580),
    makeW2Enemy('21e17', 'thunder_imp', 13480, 355, 13300, 13640),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('21o1', 1050, 210, 4, 45),
    ...makeW2Orbs('21o2', 4850, 200, 5, 48),
    ...makeW2Orbs('21o3', 7860, 248, 6, 95),
    ...makeW2Orbs('21o4', 10420, 195, 4, 48),
    { id: '21_b1', x: 5250, y: 170, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '21_b2', x: 8900, y: 265, r: 10, collected: false, value: 300, bonus: true, phase: 1.5 },
    { id: '21_b3', x: 11500, y: 235, r: 10, collected: false, value: 300, bonus: true, phase: 2.2 },
  ];

  const chimeRings = [
    { id: '21_cr1', x: 1280, y: 205, r: 22, boostVx: 470, boostVy: -250 },
    { id: '21_cr2', x: 5090, y: 185, r: 22, boostVx: 490, boostVy: -240 },
    { id: '21_cr3', x: 8960, y: 235, r: 22, boostVx: 480, boostVy: -260 },
    { id: '21_cr4', x: 10660, y: 195, r: 22, boostVx: 495, boostVy: -245 },
  ];

  return emptyW2Stage({
    id: '2-1',
    code: '2-1',
    title: '黄金の時計塔エントランス',
    subtitle: '8-Micro-Section Gear & Spring Ascent',
    theme: 'golden_clocktower',
    width: 14200,
    goal: { x: 13960, y: 209, w: 54, h: 116 },
    platforms,
    gears,
    rails,
    slopes,
    chimeRings,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4380, y: 355 },
      { x: 9760, y: 355 },
    ],
    neonSigns: [
      { x: 110, y: 195, w: 185, h: 24, label: 'CLOCKTOWER GATE', color: '#facc15' },
      { x: 4360, y: 185, w: 185, h: 24, label: 'BELL GEAR SHAFT', color: '#fbbf24' },
      { x: 9740, y: 190, w: 185, h: 24, label: 'SPRING & PENDULUM', color: '#fde047' },
    ],
  });
}

// ============================================================================
// STAGE 2-2: 黄金の時計塔＆サンダーレールエリア (13,800px / 7細分化区間)
// ============================================================================
function buildStage2_2(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Entry + Magnet Crane Climb
    { id: '22_p1', x: 0, y: 370, w: 480, h: 160, style: 'brass' },
    { id: '22_p2', x: 580, y: 325, w: 320, h: 205, style: 'brass' },
    // Sec 2: Holo Switch + Interlocking Chrono Gears
    { id: '22_step0a', x: 1640, y: 295, w: 120, h: 16, style: 'pylon', oneWay: true },
    { id: '22_holo1', x: 1820, y: 285, w: 150, h: 14, style: 'holo', oneWay: true, switchGroup: '22_br1' },
    { id: '22_p3', x: 2100, y: 350, w: 460, h: 180, style: 'brass' },
    // Sec 3: Spinning Gear Cascade + Mirror Gear
    { id: '22_step0b', x: 3400, y: 315, w: 150, h: 16, style: 'pylon', oneWay: true },
    { id: '22_p4', x: 3640, y: 355, w: 480, h: 175, style: 'brass' },
    // Sec 4: 4-Stage Thunder Rail Network + Gravity Flippers
    { id: '22_py1', x: 4300, y: 325, w: 340, h: 205, style: 'pylon' },
    { id: '22_py2', x: 5620, y: 295, w: 300, h: 235, style: 'pylon' },
    { id: '22_py3', x: 6880, y: 335, w: 420, h: 195, style: 'pylon' },
    { id: '22_py4', x: 8380, y: 340, w: 460, h: 190, style: 'brass' },
    // Sec 5: Shock Bridge + Magnet Crane Vertical Bypass
    { id: '22_sh1', x: 8980, y: 310, w: 220, h: 22, style: 'shock_bridge', shockCycle: 2.8, shockDuty: 0.36, shockPhase: 0 },
    { id: '22_p5', x: 9360, y: 355, w: 540, h: 175, style: 'brass' },
    // Sec 6: Chrono-Slow Dual Gear Gauntlet
    { id: '22_step1', x: 10040, y: 285, w: 260, h: 16, style: 'pylon', oneWay: true },
    { id: '22_step2', x: 11180, y: 295, w: 140, h: 16, style: 'pylon', oneWay: true },
    { id: '22_p6', x: 11380, y: 340, w: 460, h: 190, style: 'brass' },
    // Sec 7: Rail-to-Gear Finale
    { id: '22_p7a', x: 12880, y: 350, w: 450, h: 180, style: 'brass' },
    { id: '22_p7b', x: 13415, y: 320, w: 385, h: 210, style: 'brass' },
  ];

  const gears: GearPlatformDef[] = [
    { id: '22_gr1', cx: 1120, cy: 330, r: 96, teeth: 10, toothDepth: 11, rotSpeed: 1.45, angle: 0 },
    { id: '22_gr2', cx: 1460, cy: 295, r: 96, teeth: 10, toothDepth: 11, rotSpeed: -1.45, angle: 0.3 },
    { id: '22_gr3', cx: 2820, cy: 340, r: 102, teeth: 12, toothDepth: 12, rotSpeed: 1.65, angle: 0 },
    { id: '22_gr4', cx: 3180, cy: 300, r: 102, teeth: 12, toothDepth: 12, rotSpeed: -1.65, angle: 0.7 },
    { id: '22_gr5', cx: 10620, cy: 310, r: 104, teeth: 12, toothDepth: 12, rotSpeed: 1.85, angle: 0 },
    { id: '22_gr6', cx: 11020, cy: 275, r: 104, teeth: 12, toothDepth: 12, rotSpeed: -1.85, angle: 0.5 },
    { id: '22_gr7', cx: 12520, cy: 335, r: 108, teeth: 12, toothDepth: 13, rotSpeed: 1.75, angle: 0 },
  ];

  const rails: ThunderRailDef[] = [
    { id: '22_rl1', x1: 4660, y1: 275, x2: 5580, y2: 245, speed: 490 },
    { id: '22_rl2', x1: 5940, y1: 255, x2: 6840, y2: 285, speed: 500 },
    { id: '22_rl3', x1: 7320, y1: 295, x2: 7820, y2: 215, speed: 485 },
    { id: '22_rl4', x1: 7880, y1: 230, x2: 8360, y2: 295, speed: 510 },
    { id: '22_rl5', x1: 11860, y1: 255, x2: 12360, y2: 270, speed: 495 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '22_sw_br', x: 840, y: 265, r: 14, group: '22_br1', activated: false },
    { id: '22_sw_ch1', x: 2460, y: 278, r: 15, group: 'chrono_1', activated: false, chrono: true },
    { id: '22_sw_ch2', x: 9780, y: 280, r: 15, group: 'chrono_2', activated: false, chrono: true },
  ];

  const beamLasers: BeamLaserDef[] = [
    { id: '22_bl1', x1: 2320, y1: 55, dirX: 0, dirY: 1, maxLength: 295, cyclePeriod: 3.9, activeDuration: 1.25, phase: 0, occludable: false },
    { id: '22_bl2', x1: 8600, y1: 55, dirX: 0, dirY: 1, maxLength: 285, cyclePeriod: 3.9, activeDuration: 1.25, phase: 1.4, occludable: false },
    { id: '22_bl3', x1: 11620, y1: 55, dirX: 0, dirY: 1, maxLength: 285, cyclePeriod: 3.9, activeDuration: 1.25, phase: 2.3, occludable: false },
  ];

  const lasers: RotatingLaserDef[] = [
    { id: '22_ls1', cx: 3180, cy: 300, length: 215, angle: 0, angularSpeed: 1.65 },
    { id: '22_ls2', cx: 11020, cy: 275, length: 215, angle: 1.1, angularSpeed: -1.75 },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('22e1', 'gear_roller', 340, 370, 180, 460),
    makeW2Enemy('22e2', 'magnet_crane', 740, 325, 620, 860),
    makeW2Enemy('22e3', 'mirror_gear', 2020, 295, 1880, 2140),
    makeW2Enemy('22e4', 'laser_drone', 2340, 350, 2140, 2520),
    makeW2Enemy('22e5', 'tether_spark', 3880, 355, 3680, 4080),
    makeW2Enemy('22e6', 'thunder_imp', 5120, 300, 4720, 5520),
    makeW2Enemy('22e7', 'gravity_flipper', 6380, 270, 6020, 6780),
    makeW2Enemy('22e8', 'tether_spark', 7100, 335, 6920, 7260),
    makeW2Enemy('22e9', 'thunder_imp', 8100, 280, 7700, 8340),
    makeW2Enemy('22e10', 'dash_rammer', 8600, 340, 8400, 8820),
    makeW2Enemy('22e11', 'spring_bumper', 9640, 355, 9400, 9860),
    makeW2Enemy('22e12', 'magnet_crane', 11620, 340, 11420, 11800),
    makeW2Enemy('22e13', 'spark_jelly', 12140, 290, 11920, 12360),
    makeW2Enemy('22e14', 'gear_roller', 13120, 350, 12940, 13290),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('22o1', 1050, 200, 4, 45),
    ...makeW2Orbs('22o2', 4780, 235, 8, 92),
    ...makeW2Orbs('22o3', 6060, 220, 7, 92),
    ...makeW2Orbs('22o4', 7420, 240, 5, 80, -14),
    ...makeW2Orbs('22o5', 10560, 185, 4, 48),
    { id: '22_b1', x: 5760, y: 245, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '22_b2', x: 8620, y: 295, r: 10, collected: false, value: 300, bonus: true, phase: 1.2 },
    { id: '22_b3', x: 12520, y: 205, r: 10, collected: false, value: 300, bonus: true, phase: 2.1 },
  ];

  return emptyW2Stage({
    id: '2-2',
    code: '2-2',
    title: '黄金の時計塔＆サンダーレールエリア',
    subtitle: '7-Section Clockwork Spires & High-Voltage Rail Grind',
    theme: 'golden_clocktower',
    width: 13800,
    goal: { x: 13560, y: 204, w: 54, h: 116 },
    platforms,
    gears,
    beamLasers,
    rails,
    switches,
    lasers,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4360, y: 325 },
      { x: 9420, y: 355 },
    ],
    neonSigns: [
      { x: 110, y: 195, w: 185, h: 24, label: 'CHRONO CLOCKTOWER', color: '#facc15' },
      { x: 4350, y: 165, w: 195, h: 24, label: 'THUNDER RAIL LINE', color: '#fde047' },
      { x: 9400, y: 185, w: 195, h: 24, label: 'TIME DILATION SPIRE', color: '#38f2ff' },
    ],
  });
}

// ============================================================================
// STAGE 2-FORT: 歯車とレーザーの機械要塞 (13,200px / 抜本改修版)
// ・歯車の下に地面を置かない純粋な連続歯車アスレチック（落下＝リトライ）
// ・全ビームレーザーは歯車を貫通(occludable: false)・歯車から離して配置
// ・レーザー点滅の消灯時間を大幅に延長（約2.75秒消灯＋0.58秒点灯前予兆）
// ============================================================================
function buildStage2_Fort(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Entry Bastion & First Gear Chasm (NO ground beneath gears!)
    { id: '2f_p1', x: 0, y: 375, w: 680, h: 155, style: 'fortress' },
    // (680..1760 is OPEN PIT spanned by gears!)
    { id: '2f_p2', x: 1760, y: 365, w: 520, h: 165, style: 'fortress' },
    // Sec 2: Penetrating Long-Off Laser Corridor (spaced away from gears)
    { id: '2f_gan1', x: 2010, y: 300, w: 140, h: 24, style: 'gantry' },
    { id: '2f_p3', x: 2460, y: 365, w: 620, h: 165, style: 'fortress' },
    // Sec 3: Multi-Gear Elevator Pit + Mirror Boost
    // (3080..4180 is OPEN PIT spanned by gears!)
    { id: '2f_p4', x: 4180, y: 350, w: 540, h: 180, style: 'fortress' },
    // Sec 4: High-Clearance Gear Rim Gauntlet + Horizontal Sweeps
    // (4720..6260 is OPEN PIT spanned by 4 giant gears!)
    { id: '2f_p5', x: 6260, y: 360, w: 640, h: 170, style: 'fortress' },
    // Sec 5: Shock Bridge + Magnet Crane + Penetrating Laser Gate
    { id: '2f_sh1', x: 7060, y: 335, w: 230, h: 22, style: 'shock_bridge', shockCycle: 2.9, shockDuty: 0.36, shockPhase: 0 },
    { id: '2f_p6', x: 7450, y: 360, w: 680, h: 170, style: 'fortress' },
    // Sec 6: Final 3-Gear Pit Crossing & Chrono Bastion
    // (8130..9260 is OPEN PIT spanned by 3 gears!)
    { id: '2f_p7', x: 9260, y: 365, w: 660, h: 165, style: 'fortress' },
    { id: '2f_up2', x: 9440, y: 268, w: 210, h: 16, style: 'pylon', oneWay: true },
    // Sec 7: Laser Gate Final Approach
    { id: '2f_p8', x: 10080, y: 365, w: 580, h: 165, style: 'fortress' },
    // Sec 8: Mid-Boss Arena (10800..11820) + Victory Hall
    { id: '2f_arena', x: 10800, y: 375, w: 2400, h: 155, style: 'fortress' },
    { id: '2f_ap1', x: 10970, y: 278, w: 130, h: 16, style: 'pylon', oneWay: true },
    { id: '2f_ap2', x: 11520, y: 278, w: 130, h: 16, style: 'pylon', oneWay: true },
  ];

  const gears: GearPlatformDef[] = [
    // Pit 1 (680..1760): 3 interlocking gears
    { id: '2f_gr1', cx: 900, cy: 335, r: 96, teeth: 10, toothDepth: 12, rotSpeed: 1.15, angle: 0 },
    { id: '2f_gr2', cx: 1220, cy: 300, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.2, angle: 0.4 },
    { id: '2f_gr3', cx: 1540, cy: 330, r: 94, teeth: 10, toothDepth: 12, rotSpeed: 1.25, angle: 0.2 },
    // Pit 2 (3080..4180): 3 gears climbing up
    { id: '2f_gr4', cx: 3300, cy: 345, r: 96, teeth: 10, toothDepth: 12, rotSpeed: 1.3, angle: 0 },
    { id: '2f_gr5', cx: 3630, cy: 295, r: 98, teeth: 12, toothDepth: 12, rotSpeed: -1.35, angle: 0.5 },
    { id: '2f_gr6', cx: 3960, cy: 325, r: 94, teeth: 10, toothDepth: 12, rotSpeed: 1.3, angle: 0.1 },
    // Pit 3 (4720..6260): 4 giant perimeter gears!
    { id: '2f_gr7', cx: 4960, cy: 340, r: 106, teeth: 12, toothDepth: 13, rotSpeed: 1.25, angle: 0 },
    { id: '2f_gr8', cx: 5320, cy: 300, r: 108, teeth: 12, toothDepth: 13, rotSpeed: -1.25, angle: 0.6 },
    { id: '2f_gr9', cx: 5680, cy: 335, r: 104, teeth: 12, toothDepth: 13, rotSpeed: 1.3, angle: 0.2 },
    { id: '2f_gr10', cx: 6020, cy: 305, r: 98, teeth: 10, toothDepth: 12, rotSpeed: -1.3, angle: 0.7 },
    // Pit 4 (8130..9260): 3 high-speed Chrono gears
    { id: '2f_gr11', cx: 8360, cy: 340, r: 102, teeth: 12, toothDepth: 13, rotSpeed: 1.5, angle: 0 },
    { id: '2f_gr12', cx: 8700, cy: 295, r: 104, teeth: 12, toothDepth: 13, rotSpeed: -1.5, angle: 0.5 },
    { id: '2f_gr13', cx: 9040, cy: 335, r: 98, teeth: 10, toothDepth: 12, rotSpeed: 1.5, angle: 0.3 },
  ];

  // All lasers penetrate gears (occludable: false), are positioned away from gears, and stay OFF for ~2.75s!
  const beamLasers: BeamLaserDef[] = [
    // Over platform 2f_p3 (clear of all gears)
    { id: '2f_bl1', x1: 2630, y1: 55, dirX: 0, dirY: 1, maxLength: 310, cyclePeriod: 4.1, activeDuration: 1.35, phase: 0, occludable: false },
    { id: '2f_bl2', x1: 2860, y1: 55, dirX: 0, dirY: 1, maxLength: 310, cyclePeriod: 4.1, activeDuration: 1.35, phase: 2.0, occludable: false },
    // Over platform 2f_p4
    { id: '2f_bl3', x1: 4440, y1: 55, dirX: 0, dirY: 1, maxLength: 295, cyclePeriod: 4.2, activeDuration: 1.35, phase: 0.8, occludable: false },
    // High horizontal sweep well above Pit 3 gears (gears top is ~180..220; laser at y=130 gives generous clearance)
    { id: '2f_bl4', x1: 5000, y1: 128, dirX: 1, dirY: 0, maxLength: 1020, cyclePeriod: 4.2, activeDuration: 1.35, phase: 1.4, occludable: false },
    // Over platform 2f_p5 & 2f_p6 (spaced far from gears)
    { id: '2f_bl5', x1: 6560, y1: 55, dirX: 0, dirY: 1, maxLength: 305, cyclePeriod: 4.1, activeDuration: 1.35, phase: 0.3, occludable: false },
    { id: '2f_bl6', x1: 7780, y1: 55, dirX: 0, dirY: 1, maxLength: 305, cyclePeriod: 4.1, activeDuration: 1.35, phase: 2.2, occludable: false },
    // Over platform 2f_p7 & 2f_p8
    { id: '2f_bl7', x1: 9680, y1: 55, dirX: 0, dirY: 1, maxLength: 310, cyclePeriod: 4.2, activeDuration: 1.35, phase: 0.9, occludable: false },
    { id: '2f_bl8', x1: 10340, y1: 55, dirX: 0, dirY: 1, maxLength: 310, cyclePeriod: 4.2, activeDuration: 1.35, phase: 2.8, occludable: false },
  ];

  const spikes: SpikeTrapDef[] = [
    { x: 2730, y: 351, w: 80, h: 14 },
    { x: 6720, y: 346, w: 90, h: 14 },
  ];

  const lasers: RotatingLaserDef[] = [
    { id: '2f_rl1', cx: 6440, cy: 275, length: 95, angle: 0, angularSpeed: 1.6 },
    { id: '2f_rl2', cx: 9800, cy: 275, length: 98, angle: 1.5, angularSpeed: -1.7 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '2f_ch1', x: 2920, y: 295, r: 15, group: '2f_chrono1', activated: false, chrono: true },
    { id: '2f_ch2', x: 7980, y: 290, r: 15, group: '2f_chrono2', activated: false, chrono: true },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('2fe1', 'gear_roller', 420, 375, 240, 640),
    makeW2Enemy('2fe2', 'mirror_gear', 1940, 290, 1800, 2220),
    makeW2Enemy('2fe3', 'laser_drone', 2680, 365, 2500, 3020),
    makeW2Enemy('2fe4', 'spring_bumper', 4520, 350, 4240, 4680),
    makeW2Enemy('2fe5', 'magnet_crane', 6600, 360, 6320, 6840),
    makeW2Enemy('2fe6', 'gear_roller', 7620, 360, 7480, 8040),
    makeW2Enemy('2fe7', 'dash_rammer', 9540, 365, 9300, 9880),
    makeW2Enemy('2fe8', 'omega_drone', 10340, 365, 10120, 10620),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('2fo1', 840, 195, 4, 48),
    ...makeW2Orbs('2fo2', 3240, 190, 4, 48),
    ...makeW2Orbs('2fo3', 4900, 190, 5, 52),
    ...makeW2Orbs('2fo4', 8320, 195, 4, 48),
    ...makeW2Orbs('2fo5', 12050, 335, 4, 48, 0, true),
    { id: '2f_b1', x: 3630, y: 155, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '2f_b2', x: 5320, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 1.1 },
    { id: '2f_b3', x: 9540, y: 225, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const boss: BossDef = {
    kind: 'clockwork_core',
    x: 11520,
    y: 190,
    w: 64,
    h: 64,
    vx: 0,
    vy: 0,
    hp: 10,
    maxHp: 10,
    facing: -1,
    arenaMinX: 10860,
    arenaMaxX: 11780,
    floorY: 375,
    active: false,
    defeated: false,
    state: 'hover',
    stateTimer: 1.1,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW2Stage({
    id: '2-FORT',
    code: '2-砦',
    title: '歯車とレーザーの機械要塞',
    subtitle: 'Gear-Chain Pitfalls, Penetrating Lasers & Clockwork Core',
    theme: 'gear_fortress',
    width: 13200,
    goal: { x: 12920, y: 259, w: 54, h: 116 },
    platforms,
    gears,
    beamLasers,
    spikes,
    lasers,
    switches,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 375 },
      { x: 4240, y: 350 },
      { x: 9320, y: 365 },
      { x: 10860, y: 375 },
    ],
    neonSigns: [
      { x: 120, y: 195, w: 195, h: 24, label: 'GEAR CHASM BASTION', color: '#facc15' },
      { x: 4220, y: 185, w: 205, h: 24, label: 'OUTER RIM CROSSING', color: '#fde047' },
      { x: 11180, y: 125, w: 205, h: 24, label: 'CLOCKWORK CORE BAY', color: '#f59e0b' },
    ],
    boss,
  });
}

// ============================================================================
// STAGE 2-3: 高圧変電所と歯車工場 (12,900px / 7細分化区間)
// ============================================================================
function buildStage2_3(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Dual Shock Bridges
    { id: '23_p1', x: 0, y: 370, w: 560, h: 160, style: 'pylon' },
    { id: '23_sh1', x: 680, y: 345, w: 220, h: 22, style: 'shock_bridge', shockCycle: 3.0, shockDuty: 0.34, shockPhase: 0 },
    { id: '23_sh2', x: 980, y: 315, w: 220, h: 22, style: 'shock_bridge', shockCycle: 3.0, shockDuty: 0.34, shockPhase: 1.5 },
    // Sec 2: Foundry Tunnel + Tether Corridor (Voltaic Brass Conveyors)
    { id: '23_p2', x: 1320, y: 355, w: 720, h: 175, style: 'brass_conveyor', streamVx: 145 },
    { id: '23_tun', x: 1580, y: 298, w: 220, h: 26, style: 'gantry' },
    // Sec 3: Moving Lift + Twin Gear Conveyor Pit
    { id: '23_p3', x: 3180, y: 365, w: 580, h: 165, style: 'brass_conveyor', streamVx: -130 },
    // Sec 4: Shock Step + Magnet Crane Lift Bay
    { id: '23_sh3', x: 3920, y: 340, w: 220, h: 22, style: 'shock_bridge', shockCycle: 2.8, shockDuty: 0.36, shockPhase: 0.6 },
    { id: '23_p4', x: 4300, y: 355, w: 720, h: 175, style: 'pylon' },
    { id: '23_seal1', x: 4680, y: 280, w: 42, h: 75, style: 'fortress' },
    // Sec 5: Thunder Rail Foundry Crossing
    { id: '23_p5', x: 6180, y: 345, w: 660, h: 185, style: 'brass_conveyor', streamVx: 165 },
    { id: '23_tun2', x: 6420, y: 285, w: 200, h: 26, style: 'gantry' },
    // Sec 6: Alternating Shock Stairs & Chrono Switch
    { id: '23_sh4', x: 7020, y: 315, w: 220, h: 22, style: 'shock_bridge', shockCycle: 2.7, shockDuty: 0.36, shockPhase: 0 },
    { id: '23_sh5', x: 7360, y: 285, w: 220, h: 22, style: 'shock_bridge', shockCycle: 2.7, shockDuty: 0.36, shockPhase: 1.35 },
    { id: '23_p6', x: 7740, y: 340, w: 680, h: 190, style: 'pylon' },
    { id: '23_p7', x: 8580, y: 355, w: 620, h: 175, style: 'brass_conveyor', streamVx: -140 },
    // Sec 7: Gear Chain Finale & Stepped Rammer Deck
    { id: '23_p8', x: 10340, y: 340, w: 620, h: 190, style: 'pylon' },
    { id: '23_hi_loft', x: 7860, y: 205, w: 260, h: 16, style: 'brass', oneWay: true },
    { id: '23_p9a', x: 11880, y: 355, w: 460, h: 175, style: 'brass_conveyor', streamVx: 155 },
    { id: '23_p9b', x: 12440, y: 315, w: 460, h: 215, style: 'pylon' },
    // Secret Upper Clockwork Loft -> Secret Goal (skip to W3)
    { id: '23_sec_st1', x: 12210, y: 255, w: 110, h: 16, style: 'brass', oneWay: true },
    { id: '23_sec_st2', x: 12410, y: 195, w: 120, h: 16, style: 'brass', oneWay: true },
    { id: '23_sec_deck', x: 12560, y: 145, w: 240, h: 18, style: 'brass', oneWay: true },
  ];

  const gears: GearPlatformDef[] = [
    { id: '23_gr1', cx: 2480, cy: 340, r: 98, teeth: 10, toothDepth: 12, rotSpeed: 1.4, angle: 0 },
    { id: '23_gr2', cx: 2840, cy: 315, r: 102, teeth: 10, toothDepth: 12, rotSpeed: -1.45, angle: 0.5 },
    { id: '23_gr3', cx: 9540, cy: 335, r: 104, teeth: 12, toothDepth: 13, rotSpeed: 1.6, angle: 0 },
    { id: '23_gr4', cx: 9920, cy: 300, r: 104, teeth: 12, toothDepth: 13, rotSpeed: -1.6, angle: 0.4 },
    { id: '23_gr5', cx: 11260, cy: 330, r: 102, teeth: 12, toothDepth: 12, rotSpeed: 1.65, angle: 0 },
    { id: '23_gr6', cx: 11600, cy: 300, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.65, angle: 0.5 },
  ];

  const rails: ThunderRailDef[] = [
    { id: '23_rl1', x1: 5060, y1: 270, x2: 6140, y2: 280, speed: 495 },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: '23_mp1', x: 2140, y: 310, w: 105, h: 16, startX: 2100, startY: 330, endX: 2270, endY: 265, speed: 1.8, phase: 0, vx: 0, vy: 0, prevX: 2140, prevY: 310 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: '23_sb1', x: 4680, y: 210, w: 42, h: 70, hp: 3, broken: false, hitFlash: 0 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '23_ch1', x: 8220, y: 280, r: 15, group: '23_chrono', activated: false, chrono: true },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('23e1', 'spark_jelly', 320, 320, 180, 520),
    makeW2Enemy('23e2', 'dash_rammer', 1520, 355, 1340, 1980),
    makeW2Enemy('23e3', 'tether_spark', 1840, 355, 1480, 1980),
    makeW2Enemy('23e4', 'thunder_imp', 2680, 290, 2380, 3080),
    makeW2Enemy('23e5', 'railgun_mech', 3480, 365, 3240, 3700),
    makeW2Enemy('23e6', 'magnet_crane', 4520, 355, 4340, 4640),
    makeW2Enemy('23e7', 'spark_jelly', 4880, 305, 4740, 4980),
    makeW2Enemy('23e8', 'thunder_imp', 5620, 260, 5140, 6080),
    makeW2Enemy('23e9', 'gear_roller', 6480, 345, 6220, 6800),
    makeW2Enemy('23e10', 'spring_bumper', 7960, 340, 7780, 8200),
    makeW2Enemy('23e11', 'laser_drone', 8860, 355, 8620, 9160),
    makeW2Enemy('23e12', 'mirror_gear', 10620, 290, 10400, 10880),
    makeW2Enemy('23e13', 'dash_rammer', 12100, 355, 11920, 12300),
    makeW2Enemy('23e14', 'gear_roller', 12540, 315, 12460, 12620),
    makeW2Enemy('23e15', 'thunder_imp', 12600, 110, 12540, 12740),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('23o1', 730, 305, 3, 55),
    ...makeW2Orbs('23o2', 5200, 238, 7, 110),
    ...makeW2Orbs('23o3', 7060, 268, 3, 55),
    ...makeW2Orbs('23o4', 9480, 195, 4, 48),
    { id: '23_b1', x: 2840, y: 185, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '23_b2', x: 7460, y: 245, r: 10, collected: false, value: 300, bonus: true, phase: 1.5 },
    { id: '23_b3', x: 11260, y: 190, r: 10, collected: false, value: 300, bonus: true, phase: 2.2 },
    { id: '23_b4', x: 12610, y: 115, r: 10, collected: false, value: 300, bonus: true, phase: 0.7 },
  ];

  return emptyW2Stage({
    id: '2-3',
    code: '2-3',
    title: '高圧変電所と歯車工場',
    subtitle: '7-Section Amber Substation & Voltaic Foundry',
    theme: 'golden_clocktower',
    width: 12900,
    goal: { x: 12660, y: 199, w: 54, h: 116 },
    secretGoal: { x: 12680, y: 29, w: 54, h: 116 },
    platforms,
    gears,
    rails,
    movingPlatforms,
    sealBlocks,
    switches,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4360, y: 355 },
      { x: 8640, y: 355 },
    ],
    neonSigns: [
      { x: 110, y: 195, w: 195, h: 24, label: 'VOLT SUBSTATION', color: '#fde047' },
      { x: 4350, y: 190, w: 195, h: 24, label: 'PULSE CONVEYOR', color: '#facc15' },
    ],
  });
}

// ============================================================================
// STAGE 2-4: 琥珀の送電鉄塔スカイライン (13,100px / 8細分化区間)
// ============================================================================
function buildStage2_4(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '24_t1', x: 0, y: 365, w: 540, h: 165, style: 'pylon' },
    { id: '24_t2', x: 1320, y: 325, w: 460, h: 205, style: 'pylon' },
    { id: '24_t3', x: 2580, y: 295, w: 460, h: 235, style: 'pylon' },
    { id: '24_t4', x: 3940, y: 350, w: 620, h: 180, style: 'pylon' },
    { id: '24_t5', x: 5460, y: 320, w: 540, h: 210, style: 'pylon' },
    { id: '24_t6', x: 6880, y: 355, w: 680, h: 175, style: 'pylon' },
    { id: '24_t7', x: 8680, y: 310, w: 540, h: 220, style: 'pylon' },
    { id: '24_t8', x: 10180, y: 340, w: 580, h: 190, style: 'pylon' },
    { id: '24_t9a', x: 11840, y: 355, w: 540, h: 175, style: 'pylon' },
    { id: '24_t9b', x: 12620, y: 315, w: 480, h: 215, style: 'pylon' },
  ];

  const gears: GearPlatformDef[] = [
    { id: '24_gr1', cx: 3480, cy: 320, r: 98, teeth: 10, toothDepth: 12, rotSpeed: 1.5, angle: 0 },
    { id: '24_gr2', cx: 11380, cy: 335, r: 102, teeth: 12, toothDepth: 12, rotSpeed: -1.55, angle: 0.4 },
  ];

  const rails: ThunderRailDef[] = [
    { id: '24_rl1', x1: 560, y1: 315, x2: 1300, y2: 270, speed: 495 },
    { id: '24_rl2', x1: 1800, y1: 270, x2: 2560, y2: 245, speed: 505 },
    { id: '24_rl3', x1: 3060, y1: 245, x2: 3340, y2: 255, speed: 500 },
    { id: '24_rl4', x1: 4580, y1: 295, x2: 5440, y2: 265, speed: 505 },
    { id: '24_rl5', x1: 6020, y1: 265, x2: 6860, y2: 300, speed: 515 },
    { id: '24_rl6', x1: 7580, y1: 300, x2: 8120, y2: 215, speed: 495 },
    { id: '24_rl7', x1: 8180, y1: 225, x2: 8660, y2: 265, speed: 510 },
    { id: '24_rl8', x1: 9240, y1: 265, x2: 10160, y2: 285, speed: 520 },
    { id: '24_rl9', x1: 10780, y1: 285, x2: 11220, y2: 275, speed: 510 },
    { id: '24_rl10', x1: 12390, y1: 305, x2: 12610, y2: 265, speed: 515 },
  ];

  const gravityZones: GravityZoneDef[] = [
    { id: '24_up1', x: 4160, y: 120, w: 170, h: 230, mode: 'updraft' },
    { id: '24_up2', x: 7160, y: 120, w: 170, h: 235, mode: 'updraft' },
  ];

  const lasers: RotatingLaserDef[] = [
    { id: '24_ls1', cx: 6440, cy: 275, length: 96, angle: 0, angularSpeed: 1.9 },
    { id: '24_ls2', cx: 9700, cy: 265, length: 98, angle: 1.2, angularSpeed: -2.0 },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('24e1', 'thunder_imp', 940, 290, 680, 1220),
    makeW2Enemy('24e2', 'laser_drone', 1550, 325, 1360, 1740),
    makeW2Enemy('24e3', 'tether_spark', 2180, 260, 1880, 2480),
    makeW2Enemy('24e4', 'spark_jelly', 2800, 295, 2620, 3000),
    makeW2Enemy('24e5', 'gravity_flipper', 3760, 310, 3600, 3920),
    makeW2Enemy('24e6', 'jet_trooper', 4260, 350, 4000, 4520),
    makeW2Enemy('24e7', 'thunder_imp', 5040, 285, 4700, 5380),
    makeW2Enemy('24e8', 'mirror_gear', 5720, 320, 5500, 5940),
    makeW2Enemy('24e9', 'tether_spark', 7340, 310, 7000, 7520),
    makeW2Enemy('24e10', 'thunder_imp', 8920, 310, 8720, 9160),
    makeW2Enemy('24e11', 'gravity_flipper', 9700, 245, 9340, 10040),
    makeW2Enemy('24e12', 'laser_drone', 10480, 340, 10240, 10720),
    makeW2Enemy('24e13', 'dash_rammer', 12100, 355, 11880, 12340),
    makeW2Enemy('24e14', 'gear_roller', 12740, 315, 12650, 12830),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('24o1', 680, 280, 6, 100, -6),
    ...makeW2Orbs('24o2', 4740, 245, 6, 105, 4),
    ...makeW2Orbs('24o3', 9360, 235, 7, 105),
    { id: '24_b1', x: 4245, y: 155, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '24_b2', x: 7245, y: 155, r: 10, collected: false, value: 300, bonus: true, phase: 1.4 },
    { id: '24_b3', x: 10480, y: 280, r: 10, collected: false, value: 300, bonus: true, phase: 2.3 },
  ];

  return emptyW2Stage({
    id: '2-4',
    code: '2-4',
    title: '琥珀の送電鉄塔スカイライン',
    subtitle: '8-Section Golden Pylon Aerial Skyline',
    theme: 'golden_clocktower',
    width: 13100,
    goal: { x: 12860, y: 199, w: 54, h: 116 },
    platforms,
    gears,
    rails,
    gravityZones,
    lasers,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 365 },
      { x: 4000, y: 350 },
      { x: 6960, y: 355 },
    ],
    neonSigns: [
      { x: 110, y: 190, w: 195, h: 24, label: 'AMBER PYLON ROUTE', color: '#fbbf24' },
      { x: 3980, y: 165, w: 195, h: 24, label: 'UPDRAFT TOWER 04', color: '#38f2ff' },
    ],
  });
}

// ============================================================================
// STAGE 2-5: 高電圧スカイブリッジ＆帯電ブロック地帯 (13,500px / 7細分化区間)
// ============================================================================
function buildStage2_5(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Alternating Rhythm Shock Bridges + Spring Bounce
    { id: '25_p1', x: 0, y: 370, w: 560, h: 160, style: 'pylon' },
    { id: '25_sb1', x: 680, y: 345, w: 230, h: 24, style: 'shock_bridge', shockCycle: 3.1, shockDuty: 0.36, shockPhase: 0 },
    { id: '25_sb2', x: 1010, y: 320, w: 230, h: 24, style: 'shock_bridge', shockCycle: 3.1, shockDuty: 0.36, shockPhase: 1.55 },
    { id: '25_sb3', x: 1340, y: 345, w: 230, h: 24, style: 'shock_bridge', shockCycle: 3.1, shockDuty: 0.36, shockPhase: 0 },
    // Sec 2: Mid-Deck + Dual Gear Crossing + Upper Skywalk Detour
    { id: '25_p2', x: 1700, y: 355, w: 620, h: 175, style: 'pylon' },
    { id: '25_hi1', x: 1840, y: 225, w: 340, h: 16, style: 'brass', oneWay: true },
    { id: '25_p3', x: 3260, y: 355, w: 680, h: 175, style: 'pylon' },
    // Sec 3: Giant Updraft Shafts + Elevated Pulse Blocks
    { id: '25_p4', x: 4080, y: 380, w: 640, h: 150, style: 'pylon' },
    { id: '25_sb5', x: 4920, y: 215, w: 240, h: 24, style: 'shock_bridge', shockCycle: 2.9, shockDuty: 0.36, shockPhase: 0 },
    { id: '25_sb6', x: 5300, y: 185, w: 240, h: 24, style: 'shock_bridge', shockCycle: 2.9, shockDuty: 0.36, shockPhase: 1.45 },
    // Sec 4: Rail Dive + Gravity Flipper Bay
    { id: '25_p5', x: 5700, y: 270, w: 540, h: 260, style: 'pylon' },
    { id: '25_p6', x: 7240, y: 350, w: 680, h: 180, style: 'pylon' },
    // Sec 5: Double Pulse Bridge + Tether Sky-Walk
    { id: '25_sb7', x: 8160, y: 330, w: 220, h: 24, style: 'shock_bridge', shockCycle: 2.7, shockDuty: 0.38, shockPhase: 0 },
    { id: '25_sb8', x: 8500, y: 295, w: 220, h: 24, style: 'shock_bridge', shockCycle: 2.7, shockDuty: 0.38, shockPhase: 1.35 },
    { id: '25_p7', x: 8860, y: 345, w: 640, h: 185, style: 'pylon' },
    // Sec 6: Chrono Switch + Twin Shock + Gear Jump
    { id: '25_sb9', x: 9680, y: 315, w: 240, h: 24, style: 'shock_bridge', shockCycle: 2.6, shockDuty: 0.38, shockPhase: 0.4 },
    { id: '25_sb10', x: 10040, y: 280, w: 240, h: 24, style: 'shock_bridge', shockCycle: 2.6, shockDuty: 0.38, shockPhase: 1.7 },
    { id: '25_p8', x: 10440, y: 345, w: 660, h: 185, style: 'pylon' },
    // Sec 7: Updraft Climax & Shock-Bridge Finale + High Sky Secret Bridge
    { id: '25_p9a', x: 12080, y: 350, w: 540, h: 180, style: 'pylon' },
    { id: '25_sb11', x: 12720, y: 315, w: 220, h: 24, style: 'shock_bridge', shockCycle: 2.7, shockDuty: 0.36, shockPhase: 0.3 },
    { id: '25_p9b', x: 13040, y: 330, w: 460, h: 200, style: 'pylon' },
    { id: '25_sec_d1', x: 12060, y: 205, w: 260, h: 18, style: 'pylon', oneWay: true },
    { id: '25_sec_sb', x: 12440, y: 185, w: 220, h: 20, style: 'shock_bridge', shockCycle: 2.8, shockDuty: 0.34, shockPhase: 0.2 },
    { id: '25_sec_d2', x: 12780, y: 165, w: 560, h: 18, style: 'pylon', oneWay: true },
  ];

  const gears: GearPlatformDef[] = [
    { id: '25_gr1', cx: 2620, cy: 335, r: 98, teeth: 10, toothDepth: 12, rotSpeed: 1.45, angle: 0 },
    { id: '25_gr2', cx: 2980, cy: 300, r: 98, teeth: 10, toothDepth: 12, rotSpeed: -1.45, angle: 0.5 },
    { id: '25_gr3', cx: 11420, cy: 325, r: 102, teeth: 12, toothDepth: 12, rotSpeed: 1.65, angle: 0 },
  ];

  const gravityZones: GravityZoneDef[] = [
    { id: '25_up1', x: 4460, y: 95, w: 260, h: 285, mode: 'updraft' },
    { id: '25_up2', x: 7660, y: 95, w: 260, h: 255, mode: 'updraft' },
    { id: '25_up3', x: 11720, y: 110, w: 240, h: 310, mode: 'updraft' },
  ];

  const rails: ThunderRailDef[] = [
    { id: '25_rl1', x1: 6260, y1: 235, x2: 7200, y2: 295, speed: 505 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '25_ch1', x: 9340, y: 275, r: 15, group: '25_chrono', activated: false, chrono: true },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('25e1', 'spark_jelly', 360, 320, 200, 520),
    makeW2Enemy('25e2', 'spring_bumper', 1940, 355, 1740, 2240),
    makeW2Enemy('25e3', 'laser_drone', 2140, 355, 1800, 2280),
    makeW2Enemy('25e4', 'tesla_walker', 3600, 355, 3320, 3880),
    makeW2Enemy('25e5', 'thunder_imp', 5200, 175, 4900, 5600),
    makeW2Enemy('25e6', 'tether_spark', 5960, 230, 5740, 6200),
    makeW2Enemy('25e7', 'gravity_flipper', 6760, 250, 6400, 7120),
    makeW2Enemy('25e8', 'gear_roller', 9080, 345, 8900, 9440),
    makeW2Enemy('25e9', 'spring_bumper', 10720, 345, 10480, 11020),
    makeW2Enemy('25e10', 'spark_jelly', 10940, 310, 10600, 11060),
    makeW2Enemy('25e11', 'dash_rammer', 12300, 350, 12120, 12560),
    makeW2Enemy('25e12', 'omega_drone', 13160, 330, 13060, 13240),
    makeW2Enemy('25e13', 'spark_jelly', 12960, 125, 12800, 13180),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('25o1', 740, 305, 3, 55),
    ...makeW2Orbs('25o2', 2560, 200, 4, 48),
    ...makeW2Orbs('25o3', 6420, 210, 6, 95),
    ...makeW2Orbs('25o4', 9740, 275, 3, 55),
    { id: '25_b1', x: 5420, y: 145, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '25_b2', x: 7790, y: 145, r: 10, collected: false, value: 300, bonus: true, phase: 1.1 },
    { id: '25_b3', x: 11420, y: 185, r: 10, collected: false, value: 300, bonus: true, phase: 2.2 },
    { id: '25_b4', x: 12960, y: 125, r: 10, collected: false, value: 300, bonus: true, phase: 0.5 },
  ];

  return emptyW2Stage({
    id: '2-5',
    code: '2-5',
    title: '高電圧スカイブリッジ＆帯電ブロック地帯',
    subtitle: '7-Section Shock Bridges, Gears & Thunder Updrafts',
    theme: 'thunder_highway',
    width: 13500,
    goal: { x: 13260, y: 214, w: 54, h: 116 },
    secretGoal: { x: 13230, y: 49, w: 54, h: 116 },
    platforms,
    gears,
    gravityZones,
    rails,
    switches,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4140, y: 380 },
      { x: 8920, y: 345 },
    ],
    neonSigns: [
      { x: 110, y: 190, w: 205, h: 24, label: 'SHOCK PULSE BRIDGE', color: '#facc15' },
      { x: 4120, y: 180, w: 205, h: 24, label: 'THERMAL UPDRAFT BAY', color: '#38f2ff' },
    ],
  });
}

// ============================================================================
// STAGE 2-6: 雷鳴の強制スクロール・ハイウェイ (14,600px / 開幕初見殺し防止対応)
// ============================================================================
function buildStage2_6(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Safe Intro Highway + Gantry Slide
    { id: '26_d1', x: 0, y: 370, w: 620, h: 160, style: 'highway' },
    { id: '26_d1b', x: 620, y: 340, w: 620, h: 190, style: 'highway' },
    { id: '26_gan1', x: 740, y: 282, w: 150, h: 28, style: 'gantry' },
    // Sec 2: Elevated Overpass & Gear Express Gap
    { id: '26_d2', x: 1400, y: 340, w: 660, h: 190, style: 'highway' },
    { id: '26_hi1', x: 1560, y: 250, w: 260, h: 16, style: 'pylon', oneWay: true },
    // Sec 3: Twin Gear Run + Slope Boost
    { id: '26_d3', x: 3060, y: 365, w: 740, h: 165, style: 'highway' },
    { id: '26_gan2', x: 3320, y: 308, w: 160, h: 28, style: 'gantry' },
    { id: '26_d4', x: 4280, y: 345, w: 680, h: 185, style: 'highway' },
    // Sec 4: Dual Thunder Rail Storm Overpass
    { id: '26_d5', x: 6020, y: 340, w: 640, h: 190, style: 'highway' },
    { id: '26_d6', x: 7680, y: 365, w: 860, h: 165, style: 'highway' },
    { id: '26_sh1', x: 8040, y: 268, w: 240, h: 22, style: 'shock_bridge', shockCycle: 2.8, shockDuty: 0.34, shockPhase: 0 },
    // Sec 5: Shock-Gap Highway + Dash Rammer Guard
    { id: '26_sh2', x: 8740, y: 330, w: 230, h: 22, style: 'shock_bridge', shockCycle: 2.8, shockDuty: 0.35, shockPhase: 1.2 },
    { id: '26_d7', x: 9160, y: 350, w: 820, h: 180, style: 'highway' },
    { id: '26_gan3', x: 9440, y: 292, w: 170, h: 28, style: 'gantry' },
    // Sec 6: Gear-Rail Combo Sprint
    { id: '26_d8', x: 11100, y: 365, w: 780, h: 165, style: 'highway' },
    // Sec 7: Lightning Climax Highway + Stepped Final Deck
    { id: '26_d9', x: 12120, y: 340, w: 840, h: 190, style: 'highway' },
    { id: '26_enda', x: 13220, y: 360, w: 620, h: 170, style: 'highway' },
    { id: '26_endb', x: 13930, y: 325, w: 670, h: 205, style: 'highway' },
  ];

  const gears: GearPlatformDef[] = [
    { id: '26_gr1', cx: 2340, cy: 335, r: 96, teeth: 10, toothDepth: 12, rotSpeed: 1.5, angle: 0 },
    { id: '26_gr2', cx: 2740, cy: 315, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.5, angle: 0.4 },
    { id: '26_gr3', cx: 10420, cy: 340, r: 100, teeth: 12, toothDepth: 12, rotSpeed: 1.65, angle: 0 },
    { id: '26_gr4', cx: 10800, cy: 325, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.65, angle: 0.5 },
  ];

  const slopes: SlopeDef[] = [
    { id: '26_sl1', x1: 3800, y1: 365, x2: 4280, y2: 345, bottomY: 530 },
  ];

  const rails: ThunderRailDef[] = [
    { id: '26_rl1', x1: 4980, y1: 295, x2: 5980, y2: 275, speed: 515 },
    { id: '26_rl2', x1: 6680, y1: 275, x2: 7640, y2: 295, speed: 520 },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('26e1', 'gear_roller', 1020, 340, 880, 1200),
    makeW2Enemy('26e2', 'laser_drone', 1720, 250, 1440, 1980),
    makeW2Enemy('26e3', 'dash_rammer', 3560, 365, 3160, 3760),
    makeW2Enemy('26e4', 'gear_roller', 4560, 345, 4320, 4900),
    makeW2Enemy('26e5', 'thunder_imp', 5500, 275, 5100, 5900),
    makeW2Enemy('26e6', 'tether_spark', 6340, 340, 6080, 6600),
    makeW2Enemy('26e7', 'thunder_imp', 7180, 275, 6800, 7560),
    makeW2Enemy('26e8', 'plasma_hound', 8120, 365, 7740, 8460),
    makeW2Enemy('26e9', 'spring_bumper', 9680, 350, 9220, 9920),
    makeW2Enemy('26e10', 'gear_roller', 11460, 365, 11160, 11820),
    makeW2Enemy('26e11', 'spark_jelly', 12520, 290, 12180, 12900),
    makeW2Enemy('26e12', 'dash_rammer', 13520, 360, 13280, 13800),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('26o1', 420, 330, 4, 52),
    ...makeW2Orbs('26o2', 5120, 250, 7, 110),
    ...makeW2Orbs('26o3', 6820, 250, 7, 110),
    ...makeW2Orbs('26o4', 10360, 195, 4, 48),
    { id: '26_b1', x: 1700, y: 215, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '26_b2', x: 6340, y: 295, r: 10, collected: false, value: 300, bonus: true, phase: 1.2 },
    { id: '26_b3', x: 12540, y: 255, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  return emptyW2Stage({
    id: '2-6',
    code: '2-6',
    title: '雷鳴の強制スクロール・ハイウェイ',
    subtitle: 'Stormfront Safe-Start Auto-Scroll Expressway',
    theme: 'thunder_highway',
    width: 14600,
    autoScrollSpeed: 172,
    scrollCrush: true,
    lightningHazard: { interval: 2.1, warnDuration: 1.45, strikeRadius: 26 },
    goal: { x: 14320, y: 209, w: 54, h: 116 },
    platforms,
    gears,
    slopes,
    rails,
    enemies,
    orbs,
    checkpoints: [
      { x: 90, y: 370 },
      { x: 4340, y: 345 },
      { x: 9220, y: 350 },
    ],
    neonSigns: [
      { x: 120, y: 185, w: 225, h: 24, label: 'STORM SCROLL HIGHWAY', color: '#fde047' },
      { x: 4320, y: 185, w: 225, h: 24, label: 'LIGHTNING RAIL EXPRESS', color: '#facc15' },
      { x: 9220, y: 185, w: 225, h: 24, label: 'FINAL THUNDER SPRINT', color: '#f59e0b' },
    ],
  });
}

// ============================================================================
// STAGE 2-7: 黄金嵐のスカイクラウド回廊（上ステ・垂直登攀 / y: 365 → -2020）
// ・verticalClimb: true + aerialSky: true で黄金雲海の上空を垂直に登るステージ
// ・昇降歯車チェーン＋斜上サンダーレール＋上昇気流チムニー＋貫通レーザー
// ============================================================================
function buildStage2_7(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Tier 1 (y: 365 -> -20)
    { id: '27_p0', x: 0, y: 365, w: 640, h: 34, style: 'brass' },
    { id: '27_p1', x: 420, y: 270, w: 230, h: 16, style: 'pylon', oneWay: true },
    { id: '27_p2', x: 690, y: 175, w: 240, h: 22, style: 'shock_bridge', shockCycle: 3.4, shockDuty: 0.24, shockPhase: 0 },
    { id: '27_p3', x: 1450, y: -20, w: 600, h: 32, style: 'brass' },

    // Tier 2 (y: -20 -> -480)
    { id: '27_up1', x: 1830, y: -115, w: 200, h: 16, style: 'pylon', oneWay: true },
    { id: '27_p4', x: 1440, y: -210, w: 360, h: 28, style: 'fortress' },
    { id: '27_sb2', x: 1120, y: -295, w: 240, h: 22, style: 'shock_bridge', shockCycle: 3.4, shockDuty: 0.24, shockPhase: 1.2 },
    { id: '27_p5', x: 740, y: -380, w: 300, h: 28, style: 'pylon' },
    { id: '27_p5b', x: 520, y: -435, w: 185, h: 16, style: 'pylon', oneWay: true },
    { id: '27_p6', x: 80, y: -480, w: 460, h: 32, style: 'brass' },

    // Tier 3 (y: -480 -> -980)
    { id: '27_p7', x: 1340, y: -740, w: 560, h: 32, style: 'fortress' },
    { id: '27_p8', x: 1600, y: -835, w: 220, h: 16, style: 'pylon', oneWay: true },
    { id: '27_p9', x: 520, y: -980, w: 540, h: 32, style: 'brass' },
    { id: '27_p9b', x: 240, y: -980, w: 290, h: 28, style: 'brass' },

    // Tier 4 (y: -980 -> -1520)
    { id: '27_p10', x: 480, y: -1150, w: 240, h: 16, style: 'pylon', oneWay: true },
    { id: '27_p11', x: 480, y: -1320, w: 450, h: 28, style: 'fortress' },
    { id: '27_sb3', x: 980, y: -1415, w: 230, h: 22, style: 'shock_bridge', shockCycle: 3.4, shockDuty: 0.24, shockPhase: 0.6 },
    { id: '27_p12', x: 1240, y: -1520, w: 540, h: 32, style: 'brass' },

    // Tier 5 Summit (y: -1520 -> -2020)
    { id: '27_p13', x: 460, y: -1730, w: 360, h: 30, style: 'pylon' },
    { id: '27_end', x: 1480, y: -2020, w: 780, h: 36, style: 'fortress' },
  ];

  const gears: GearPlatformDef[] = [
    { id: '27_gr1', cx: 1090, cy: 175, r: 96, teeth: 10, toothDepth: 12, rotSpeed: 1.25, angle: 0 },
    { id: '27_gr2', cx: 1310, cy: 80, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.25, angle: 0.4 },
    { id: '27_gr3', cx: 1420, cy: -845, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.3, angle: 0.2 },
    { id: '27_gr4', cx: 1170, cy: -905, r: 96, teeth: 10, toothDepth: 12, rotSpeed: 1.3, angle: 0.6 },
    { id: '27_gr5', cx: 1120, cy: -1525, r: 96, teeth: 10, toothDepth: 12, rotSpeed: -1.35, angle: 0 },
    { id: '27_gr6', cx: 870, cy: -1615, r: 96, teeth: 10, toothDepth: 12, rotSpeed: 1.35, angle: 0.5 },
  ];

  const beamLasers: BeamLaserDef[] = [
    { id: '27_bl1', x1: 1580, y1: -410, dirX: 0, dirY: 1, maxLength: 195, cyclePeriod: 4.8, activeDuration: 1.05, phase: 0, occludable: false },
    { id: '27_bl2', x1: 790, y1: -1465, dirX: 0, dirY: 1, maxLength: 140, cyclePeriod: 4.8, activeDuration: 1.05, phase: 1.8, occludable: false },
  ];

  const rails: ThunderRailDef[] = [
    { id: '27_rl1', x1: 490, y1: -530, x2: 1380, y2: -760, speed: 470 },
    { id: '27_rl2', x1: 790, y1: -1785, x2: 1560, y2: -2015, speed: 480 },
  ];

  const gravityZones: GravityZoneDef[] = [
    { id: '27_upz1', x: 470, y: -560, w: 200, h: 185, mode: 'updraft' },
    { id: '27_upz2', x: 250, y: -1350, w: 220, h: 375, mode: 'updraft' },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '27_ch1', x: 380, y: -540, r: 15, group: '27_chrono', activated: false, chrono: true },
    { id: '27_ch2', x: 1660, y: -1580, r: 15, group: '27_chrono2', activated: false, chrono: true },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('27e1', 'gear_roller', 340, 365, 160, 480),
    makeW2Enemy('27e3', 'dash_rammer', 1760, -20, 1520, 2000),
    makeW2Enemy('27e4', 'magnet_crane', 1620, -210, 1480, 1760),
    makeW2Enemy('27e6', 'tether_spark', 870, -380, 760, 1010),
    makeW2Enemy('27e8', 'gravity_flipper', 1600, -740, 1440, 1820),
    makeW2Enemy('27e10', 'spring_bumper', 640, -980, 560, 760),
    makeW2Enemy('27e11', 'dash_rammer', 900, -980, 760, 1020),
    makeW2Enemy('27e13', 'mirror_gear', 1480, -1520, 1300, 1700),
    makeW2Enemy('27e15', 'gear_roller', 1760, -2020, 1580, 1980),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('27o1', 735, 135, 3, 52),
    ...makeW2Orbs('27o2', 640, -615, 5, 135, -35),
    ...makeW2Orbs('27o3', 920, -1845, 5, 125, -35),
    { id: '27_b1', x: 1620, y: -335, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '27_b2', x: 365, y: -1240, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '27_b3', x: 1460, y: -1580, r: 10, collected: false, value: 300, bonus: true, phase: 1.8 },
    { id: '27_b4', x: 1860, y: -2075, r: 10, collected: false, value: 300, bonus: true, phase: 2.4 },
  ];

  return emptyW2Stage({
    id: '2-7',
    code: '2-7',
    title: '黄金嵐のスカイクラウド回廊',
    subtitle: 'Vertical Sky-Tower Ascent & Cloud Sea Tempest',
    theme: 'golden_clocktower',
    aerialSky: true,
    verticalClimb: true,
    width: 2400,
    lightningHazard: { interval: 3.6, warnDuration: 1.85, strikeRadius: 22 },
    goal: { x: 2100, y: -2136, w: 54, h: 116 },
    platforms,
    gears,
    beamLasers,
    rails,
    gravityZones,
    switches,
    enemies,
    orbs,
    checkpoints: [
      { x: 80, y: 365 },
      { x: 1580, y: -20 },
      { x: 340, y: -480 },
      { x: 1480, y: -740 },
      { x: 840, y: -980 },
      { x: 1360, y: -1520 },
      { x: 640, y: -1730 },
    ],
    neonSigns: [
      { x: 90, y: 185, w: 225, h: 24, label: 'CLIMB THE SKY TOWER', color: '#facc15' },
      { x: 120, y: -640, w: 205, h: 24, label: 'THUNDER RAIL ASCENT', color: '#fde047' },
      { x: 1580, y: -2185, w: 205, h: 24, label: 'CLOUD SUMMIT GATE', color: '#fde047' },
    ],
  });
}

// ============================================================================
// STAGE 2-BOSS: 雷帝の空中発電戦艦（装甲船腹突入→中央炉心エレベーター→翼砲台→頂上艦橋決戦）
// ・2-7の雲海ジグザグ登りとは完全に異なる、戦艦内部の水平突破＋中央シャフト昇降構成
// ============================================================================
function buildStage2_Boss(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Act 1 (x: 0..2330, y: 365 -> 185): Armored Hangar Breach & Twin Route Hull
    { id: '2b_p0', x: 0, y: 365, w: 640, h: 36, style: 'fortress' },
    { id: '2b_p1', x: 710, y: 315, w: 320, h: 30, style: 'brass' },
    { id: '2b_p1b', x: 1120, y: 345, w: 460, h: 32, style: 'fortress' },
    { id: '2b_p1c', x: 1620, y: 255, w: 150, h: 16, style: 'pylon', oneWay: true },
    { id: '2b_p2', x: 1750, y: 185, w: 580, h: 32, style: 'fortress' },

    // Act 2 (x: 2040..2680, y: 185 -> -520): Twin Central Dynamo Elevator Shaft
    { id: '2b_shaft1', x: 2020, y: -120, w: 280, h: 28, style: 'brass' },
    { id: '2b_shaft2', x: 2060, y: -520, w: 460, h: 32, style: 'fortress' },

    // Act 3 (x: 680..2300, y: -520 -> -1085): Port-Wing Cannon Battery & Upper Express Rail
    { id: '2b_wstep', x: 1840, y: -610, w: 190, h: 16, style: 'pylon', oneWay: true },
    { id: '2b_wing1', x: 1220, y: -690, w: 620, h: 32, style: 'brass' },
    { id: '2b_sb1', x: 990, y: -770, w: 200, h: 22, style: 'shock_bridge', shockCycle: 3.4, shockDuty: 0.24, shockPhase: 0.2 },
    { id: '2b_wing2', x: 680, y: -850, w: 300, h: 30, style: 'fortress' },
    { id: '2b_upper', x: 1840, y: -1085, w: 480, h: 32, style: 'brass' },

    // Act 4 (x: 2420..5200, y: -1240): Summit Command Bridge Arena (2620..3600) + Stern Deck
    { id: '2b_arena', x: 2420, y: -1240, w: 2780, h: 42, style: 'fortress' },
    { id: '2b_ap1', x: 2740, y: -1336, w: 150, h: 16, style: 'pylon', oneWay: true },
    { id: '2b_ap2', x: 3320, y: -1336, w: 150, h: 16, style: 'pylon', oneWay: true },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    // Hull approach piston & Twin Central Dynamo Elevators
    {
      id: '2b_mv_hull',
      x: 1320,
      y: 250,
      w: 140,
      h: 16,
      startX: 1180,
      startY: 250,
      endX: 1520,
      endY: 250,
      speed: 1.35,
      phase: 0,
      vx: 0,
      vy: 0,
      prevX: 1320,
      prevY: 250,
    },
    {
      id: '2b_mv1',
      x: 2330,
      y: 155,
      w: 170,
      h: 18,
      startX: 2330,
      startY: 155,
      endX: 2330,
      endY: -115,
      speed: 0.95,
      phase: 0,
      vx: 0,
      vy: 0,
      prevX: 2330,
      prevY: 155,
    },
    {
      id: '2b_mv2',
      x: 2520,
      y: -245,
      w: 170,
      h: 18,
      startX: 2520,
      startY: -245,
      endX: 2520,
      endY: -515,
      speed: 0.95,
      phase: 1.2,
      vx: 0,
      vy: 0,
      prevX: 2520,
      prevY: -245,
    },
  ];

  const gears: GearPlatformDef[] = [
    { id: '2b_gr_hull', cx: 685, cy: 335, r: 62, teeth: 10, toothDepth: 10, rotSpeed: 1.3, angle: 0 },
    { id: '2b_gr_s1', cx: 2380, cy: -185, r: 78, teeth: 10, toothDepth: 11, rotSpeed: -1.25, angle: 0.3 },
    { id: '2b_gr_wing', cx: 1510, cy: -745, r: 76, teeth: 10, toothDepth: 10, rotSpeed: 1.25, angle: 0.5 },
  ];

  const beamLasers: BeamLaserDef[] = [
    // Hull laser occluded by gear or timed horizontal shaft lasers
    { id: '2b_bl_hull', x1: 480, y1: 270, dirX: 1, dirY: 0, maxLength: 360, cyclePeriod: 4.6, activeDuration: 1.1, phase: 0, occludable: true },
    { id: '2b_bl_s1', x1: 2150, y1: -20, dirX: 1, dirY: 0, maxLength: 420, cyclePeriod: 4.8, activeDuration: 1.05, phase: 0.3, occludable: false },
    { id: '2b_bl_s2', x1: 2680, y1: -360, dirX: -1, dirY: 0, maxLength: 420, cyclePeriod: 4.8, activeDuration: 1.05, phase: 2.3, occludable: false },
  ];

  const rails: ThunderRailDef[] = [
    { id: '2b_rl_hull', x1: 1015, y1: 272, x2: 1765, y2: 180, speed: 510 },
    { id: '2b_rl_wing', x1: 950, y1: -885, x2: 1865, y2: -1085, speed: 495 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '2b_ch1', x: 960, y: 215, r: 15, group: '2b_chrono', activated: false, chrono: true },
    { id: '2b_ch2', x: 2100, y: -175, r: 15, group: '2b_chrono2', activated: false, chrono: true },
  ];

  const gravityZones: GravityZoneDef[] = [
    { id: '2b_up_final', x: 2240, y: -1325, w: 200, h: 255, mode: 'updraft' },
  ];

  const cannons: CannonDef[] = [
    { id: '2bc1', x: 1520, y: 317, dir: -1, angle: -0.15, interval: 2.7, timer: 0.7 },
    { id: '2bc2', x: 1260, y: -718, dir: 1, angle: -0.16, interval: 2.8, timer: 0.9 },
  ];

  const enemies: EnemyDef[] = [
    makeW2Enemy('2be1', 'gear_roller', 380, 365, 190, 580),
    makeW2Enemy('2be2', 'laser_drone', 880, 315, 740, 1000),
    makeW2Enemy('2be3', 'dash_rammer', 1360, 345, 1140, 1550),
    makeW2Enemy('2be4', 'mirror_gear', 2020, 185, 1820, 2260),
    makeW2Enemy('2be5', 'tether_spark', 2240, -520, 2080, 2460),
    makeW2Enemy('2be6', 'spark_jelly', 1640, -690, 1360, 1800),
    makeW2Enemy('2be7', 'dash_rammer', 1400, -690, 1240, 1600),
    makeW2Enemy('2be8', 'gravity_flipper', 830, -850, 700, 960),
    makeW2Enemy('2be9', 'gear_roller', 2060, -1085, 1860, 2280),
    makeW2Enemy('2be10', 'thunder_imp', 2140, -1085, 1880, 2280),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW2Orbs('2bo1', 1140, 215, 5, 115, -16),
    ...makeW2Orbs('2bo2', 1100, -945, 5, 145, -35),
    ...makeW2Orbs('2bo3', 3860, -1282, 6, 56, 0, true),
    { id: '2b_b1', x: 1350, y: 295, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '2b_b2', x: 2150, y: -160, r: 10, collected: false, value: 300, bonus: true, phase: 0.7 },
    { id: '2b_b3', x: 1520, y: -735, r: 10, collected: false, value: 300, bonus: true, phase: 1.4 },
    { id: '2b_b4', x: 2560, y: -1282, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
    { id: '2b_b5', x: 2815, y: -1374, r: 10, collected: false, value: 300, bonus: true, phase: 2.5 },
    { id: '2b_b6', x: 3395, y: -1374, r: 10, collected: false, value: 300, bonus: true, phase: 3.1 },
  ];

  const boss: BossDef = {
    kind: 'thunder_kronos',
    x: 3300,
    y: -1425,
    w: 60,
    h: 68,
    vx: 0,
    vy: 0,
    hp: 14,
    maxHp: 14,
    facing: -1,
    arenaMinX: 2620,
    arenaMaxX: 3600,
    floorY: -1240,
    active: false,
    defeated: false,
    state: 'hover',
    stateTimer: 1.45,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
    comboLeft: 0,
  };

  return emptyW2Stage({
    id: '2-BOSS',
    code: '2-BOSS',
    title: '雷帝の空中発電戦艦',
    subtitle: 'Dreadnought Hangar, Dynamo Elevators & Thunder Kronos (14HP / 3 Forms)',
    theme: 'thunder_airship',
    aerialSky: true,
    verticalClimb: true,
    width: 5200,
    goal: { x: 4920, y: -1356, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    gears,
    beamLasers,
    rails,
    switches,
    gravityZones,
    cannons,
    enemies,
    orbs,
    checkpoints: [
      { x: 80, y: 365 },
      { x: 1840, y: 185 },
      { x: 2150, y: -120 },
      { x: 2220, y: -520 },
      { x: 820, y: -850 },
      { x: 1980, y: -1085 },
      { x: 2500, y: -1240 },
    ],
    neonSigns: [
      { x: 95, y: 185, w: 235, h: 24, label: 'BREACH DREADNOUGHT HULL', color: '#fde047' },
      { x: 2050, y: 40, w: 235, h: 24, label: 'CENTRAL DYNAMO ELEVATOR', color: '#facc15' },
      { x: 2980, y: -1495, w: 235, h: 24, label: 'SUMMIT KRONOS BRIDGE', color: '#f59e0b' },
    ],
    boss,
  });
}

// ============================================================================
// WORLD MAP ROAMING ENEMY MINI-BOSS ENCOUNTER STAGES (ENC_W1..3, NON-REUSED BOSSES)
// ============================================================================
export function buildEncounterStage(stageId: string): StageDefinition | null {
  if (!stageId.startsWith('ENC_')) return null;

  const isW2 = stageId.startsWith('ENC_W2_');
  const isW3 = stageId.startsWith('ENC_W3_');
  const floorStyle: PlatformDef['style'] = isW3 ? 'jade' : isW2 ? 'brass' : 'fortress';
  const stepStyle: PlatformDef['style'] = isW3 ? 'emerald_bounce' : isW2 ? 'pylon' : 'metal';

  const platforms: PlatformDef[] = [
    { id: 'enc_floor', x: 0, y: 370, w: 1550, h: 160, style: floorStyle },
    { id: 'enc_p1', x: 240, y: 270, w: 180, h: 16, style: stepStyle, oneWay: !isW3, bouncy: isW3 },
    { id: 'enc_p2', x: 640, y: 230, w: 200, h: 16, style: isW3 ? 'vine_deck' : stepStyle, oneWay: true },
    { id: 'enc_p3', x: 1000, y: 270, w: 180, h: 16, style: stepStyle, oneWay: !isW3, bouncy: isW3 },
  ];

  // Recovery items ONLY unlock & appear after defeating the encounter boss
  const orbs: ManaOrbDef[] = makeW2Orbs('enco_1', 670, 325, 3, 55, 0, true).map((o) => ({
    ...o,
    afterBoss: true,
  }));

  const createEncounterBoss = (kind: 'iron_goliath' | 'volt_centurion' | 'emerald_stalker', hp: number): BossDef => ({
    kind,
    x: 920,
    y: kind === 'volt_centurion' ? 210 : 302,
    w: 56,
    h: 68,
    vx: 0,
    vy: 0,
    hp,
    maxHp: hp,
    facing: -1,
    arenaMinX: 60,
    arenaMaxX: 1120,
    floorY: 370,
    active: true,
    defeated: false,
    state: kind === 'volt_centurion' ? 'hover' : 'idle',
    stateTimer: 0.9,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  });

  switch (stageId) {
    case 'ENC_W1_1':
      return emptyW2Stage({
        id: 'ENC_W1_1',
        code: '迎撃W1',
        title: '鋼鉄ゴライアス防衛小隊',
        subtitle: 'World 1 Roaming Mini-Boss Encounter',
        theme: 'fortress_alert',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew11_1', 'golem_knight', 520, 370, 240, 820),
          makeW2Enemy('ew11_2', 'shield_trooper', 760, 370, 420, 1020),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'IRON GOLIATH SQUAD', color: '#38bdf8' }],
        boss: createEncounterBoss('iron_goliath', 6),
      });
    case 'ENC_W1_2':
      return emptyW2Stage({
        id: 'ENC_W1_2',
        code: '迎撃W1',
        title: 'ルーン遊撃隊＆アイアン・ゴライアス',
        subtitle: 'World 1 Arcane Sentinel Ambush',
        theme: 'arcane_library',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew12_1', 'rune_sentinel', 540, 370, 260, 860),
          makeW2Enemy('ew12_2', 'arcane_caster', 740, 230, 650, 820),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'ARCANE GUARDIAN DUEL', color: '#a78bfa' }],
        boss: createEncounterBoss('iron_goliath', 7),
      });
    case 'ENC_W1_3':
      return emptyW2Stage({
        id: 'ENC_W1_3',
        code: '迎撃W1',
        title: '蒼影親衛隊＆ゴライアス重装型',
        subtitle: 'World 1 Phantom Knight Skirmish',
        theme: 'airship_boss',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew13_1', 'phantom_knight', 520, 370, 240, 840),
          makeW2Enemy('ew13_2', 'phantom_knight', 840, 370, 520, 1060),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'PHANTOM VANGUARD', color: '#f43f5e' }],
        boss: createEncounterBoss('iron_goliath', 7),
      });
    case 'ENC_W2_1':
      return emptyW2Stage({
        id: 'ENC_W2_1',
        code: '迎撃W2',
        title: 'ヴォルト・センチュリオン遊撃班',
        subtitle: 'World 2 Roaming Centurion Ambush',
        theme: 'golden_clocktower',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew21_1', 'gear_roller', 500, 370, 220, 840),
          makeW2Enemy('ew21_2', 'spring_bumper', 720, 370, 420, 980),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'VOLT CENTURION AMBUSH', color: '#facc15' }],
        boss: createEncounterBoss('volt_centurion', 7),
      });
    case 'ENC_W2_2':
      return emptyW2Stage({
        id: 'ENC_W2_2',
        code: '迎撃W2',
        title: '電撃振子＆センチュリオン警戒網',
        subtitle: 'World 2 Tether & Gravity Encounter',
        theme: 'gear_fortress',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew22_1', 'tether_spark', 520, 370, 260, 820),
          makeW2Enemy('ew22_2', 'gravity_flipper', 760, 370, 460, 1020),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'CENTURION SPARK GUARD', color: '#f59e0b' }],
        boss: createEncounterBoss('volt_centurion', 8),
      });
    case 'ENC_W2_3':
      return emptyW2Stage({
        id: 'ENC_W2_3',
        code: '迎撃W2',
        title: '突撃ラマー＆雷槍センチュリオン',
        subtitle: 'World 2 Blitz Rammer Squadron',
        theme: 'thunder_highway',
        aerialSky: true,
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew23_1', 'dash_rammer', 520, 370, 220, 840),
          makeW2Enemy('ew23_2', 'tether_spark', 660, 230, 480, 920),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'CENTURION BLITZ SQUAD', color: '#fb7185' }],
        boss: createEncounterBoss('volt_centurion', 8),
      });
    case 'ENC_W3_1':
      return emptyW2Stage({
        id: 'ENC_W3_1',
        code: '迎撃W3',
        title: '翠玉の奇襲者ストーカー',
        subtitle: 'World 3 Roaming Emerald Stalker',
        theme: 'emerald_canopy',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew31_1', 'emerald_mantis', 520, 370, 240, 840),
          makeW2Enemy('ew31_2', 'prism_spore', 740, 350, 480, 980),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'EMERALD STALKER HUNT', color: '#34d399' }],
        boss: createEncounterBoss('emerald_stalker', 8),
      });
    case 'ENC_W3_2':
      return emptyW2Stage({
        id: 'ENC_W3_2',
        code: '迎撃W3',
        title: '胞子迷宮のストーカー隊',
        subtitle: 'World 3 Spore & Sniper Encounter',
        theme: 'jade_labyrinth',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew32_1', 'thorn_weaver', 520, 370, 240, 840),
          makeW2Enemy('ew32_2', 'jade_sniper', 760, 330, 500, 1020),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'JADE LABYRINTH DUEL', color: '#10b981' }],
        boss: createEncounterBoss('emerald_stalker', 9),
      });
    case 'ENC_W3_3':
      return emptyW2Stage({
        id: 'ENC_W3_3',
        code: '迎撃W3',
        title: 'ヒュドラ護衛ストーカー決戦',
        subtitle: 'World 3 Hydra Vanguard Ambush',
        theme: 'verdant_fortress',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW2Enemy('ew33_1', 'bio_hydra', 520, 370, 240, 860),
          makeW2Enemy('ew33_2', 'chrono_vine', 820, 370, 800, 840),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 220, h: 24, label: 'VERDANT VANGUARD', color: '#6ee7b7' }],
        boss: createEncounterBoss('emerald_stalker', 9),
      });
    default:
      return null;
  }
}

export function buildWorld2Stage(stageId: string): StageDefinition | null {
  switch (stageId) {
    case '2-1':
      return buildStage2_1();
    case '2-2':
      return buildStage2_2();
    case '2-FORT':
      return buildStage2_Fort();
    case '2-3':
      return buildStage2_3();
    case '2-4':
      return buildStage2_4();
    case '2-5':
      return buildStage2_5();
    case '2-6':
      return buildStage2_6();
    case '2-7':
      return buildStage2_7();
    case '2-BOSS':
      return buildStage2_Boss();
    default:
      return null;
  }
}
