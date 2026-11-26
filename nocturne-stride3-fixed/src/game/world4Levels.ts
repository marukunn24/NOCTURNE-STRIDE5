import { createEnemyDefForKind } from './gameData';
import {
  BossDef,
  CryoBumperDef,
  CryoGeyserDef,
  EnemyDef,
  EnemyKind,
  FallingIcicleDef,
  FreezeBeamDef,
  FrostMineDef,
  GlowLanternDef,
  IceMirrorDef,
  MagicSwitchDef,
  ManaOrbDef,
  MovingPlatformDef,
  PhaseWaterSwitchDef,
  PlatformDef,
  ScythePendulumDef,
  SlopeDef,
  StageDefinition,
} from './types';

function makeW4Enemy(
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

function makeW4Orbs(
  prefix: string,
  startX: number,
  y: number,
  count: number,
  stepX: number,
  stepY = 0,
  bonus = false,
  afterBoss = false
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
      afterBoss,
      phase: i * 0.45,
    });
  }
  return arr;
}

function emptyW4Stage(
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
    cryoBumpers: [],
    cryoGeysers: [],
    freezeBeams: [],
    fallingIcicles: [],
    icePendulums: [],
    frostMines: [],
    phaseWaterSwitches: [],
    iceMirrors: [],
    cryoLanterns: [],
    enemies: [],
    orbs: [],
    checkpoints: [{ x: 70, y: 370 }],
    neonSigns: [],
    ...partial,
  };
}

// ============================================================================
// STAGE 4-1: 蒼氷の港湾高速滑走＆氷坂空中ダイブ (14,200px / 20 Enemies)
// 大胆リニューアル：平坦氷床を廃止し、氷坂スプリント×氷バンパー跳躍×上下2層キャットウォーク×崩落氷橋を連続展開
// ============================================================================
function buildStage4_1(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Act 1: Harbor Pier Hopping & High-Speed Slope Launch (0..4100)
    { id: '41_p1', x: 0, y: 370, w: 460, h: 160, style: 'ice_floor' },
    { id: '41_p1b', x: 590, y: 325, w: 380, h: 205, style: 'ice_floor' },
    { id: '41_cr1', x: 1100, y: 290, w: 150, h: 20, style: 'crumble_ice' },
    { id: '41_p2', x: 1380, y: 270, w: 440, h: 260, style: 'ice_floor' },
    { id: '41_up0', x: 1450, y: 155, w: 280, h: 16, style: 'ice_floor', oneWay: true },
    { id: '41_p3', x: 1960, y: 230, w: 460, h: 300, style: 'ice_floor' },
    // Slope 1: 2420 -> 3220 (230 -> 370)
    { id: '41_p4', x: 3220, y: 370, w: 480, h: 160, style: 'ice_floor' },
    { id: '41_cr2', x: 3830, y: 335, w: 150, h: 20, style: 'crumble_ice' },

    // Act 2: Twin Tiered Harbor Gantry & Cryo Bumper Vaults (4100..9000)
    { id: '41_p5', x: 4100, y: 360, w: 480, h: 170, style: 'ice_floor' },
    { id: '41_hi1', x: 4220, y: 235, w: 340, h: 16, style: 'ice_floor', oneWay: true },
    { id: '41_hi2', x: 4720, y: 195, w: 360, h: 16, style: 'ice_floor', oneWay: true },
    { id: '41_lo1', x: 4740, y: 340, w: 440, h: 190, style: 'cryo_metal' },
    { id: '41_p6', x: 5340, y: 295, w: 440, h: 235, style: 'ice_floor' },
    { id: '41_cr3', x: 5920, y: 265, w: 145, h: 20, style: 'crumble_ice' },
    { id: '41_cr4', x: 6180, y: 240, w: 145, h: 20, style: 'crumble_ice' },
    { id: '41_p7', x: 6460, y: 245, w: 460, h: 285, style: 'ice_floor' },
    // Slope 2: 6920 -> 7780 (245 -> 375)
    { id: '41_p8', x: 7780, y: 375, w: 440, h: 155, style: 'ice_floor' },
    { id: '41_hi3', x: 8360, y: 270, w: 340, h: 16, style: 'ice_floor', oneWay: true },
    { id: '41_p9', x: 8560, y: 340, w: 460, h: 190, style: 'cryo_metal' },

    // Act 3: Icicle Pier Slalom -> Final Skate Ski-Jump (9000..14200)
    { id: '41_p10', x: 9160, y: 365, w: 460, h: 165, style: 'ice_floor' },
    { id: '41_cr5', x: 9760, y: 330, w: 150, h: 20, style: 'crumble_ice' },
    { id: '41_p11', x: 10040, y: 295, w: 480, h: 235, style: 'ice_floor' },
    { id: '41_up2', x: 10120, y: 175, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '41_p12', x: 10680, y: 255, w: 460, h: 275, style: 'ice_floor' },
    // Slope 3: 11140 -> 11960 (255 -> 365)
    { id: '41_p13', x: 11960, y: 365, w: 480, h: 165, style: 'ice_floor' },
    { id: '41_cr6', x: 12580, y: 325, w: 145, h: 20, style: 'crumble_ice' },
    { id: '41_p14', x: 12860, y: 290, w: 440, h: 240, style: 'cryo_metal' },
    { id: '41_end', x: 13460, y: 365, w: 740, h: 165, style: 'ice_floor' },
  ];

  const slopes: SlopeDef[] = [
    { id: '41_sl1', x1: 2420, y1: 230, x2: 3220, y2: 370, bottomY: 530 },
    { id: '41_sl2', x1: 6920, y1: 245, x2: 7780, y2: 375, bottomY: 530 },
    { id: '41_sl3', x1: 11140, y1: 255, x2: 11960, y2: 365, bottomY: 530 },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '41_cb1', x: 3560, y: 260, r: 22, launchSpeed: 500 },
    { id: '41_cb2', x: 5220, y: 220, r: 22, launchSpeed: 510 },
    { id: '41_cb3', x: 8380, y: 315, r: 22, launchSpeed: 505 },
    { id: '41_cb4', x: 12720, y: 245, r: 22, launchSpeed: 515 },
  ];

  const cryoGeysers: CryoGeyserDef[] = [
    { id: '41_cg1', x: 4600, y: 360, w: 54, maxHeight: 205, cyclePeriod: 3.4, activeDuration: 2.1, phase: 0 },
    { id: '41_cg2', x: 9660, y: 365, w: 54, maxHeight: 200, cyclePeriod: 3.3, activeDuration: 2.0, phase: 1.0 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '41_ic1', x: 780, topY: 45, triggerRange: 115 },
    { id: '41_ic2', x: 1620, topY: 45, triggerRange: 115 },
    { id: '41_ic3', x: 2740, topY: 45, triggerRange: 120 },
    { id: '41_ic4', x: 4960, topY: 45, triggerRange: 115 },
    { id: '41_ic5', x: 6680, topY: 45, triggerRange: 115 },
    { id: '41_ic6', x: 7340, topY: 45, triggerRange: 120 },
    { id: '41_ic7', x: 10280, topY: 45, triggerRange: 115 },
    { id: '41_ic8', x: 11560, topY: 45, triggerRange: 120 },
    { id: '41_ic9', x: 13080, topY: 45, triggerRange: 115 },
  ];

  const frostMines: FrostMineDef[] = [
    { id: '41_fm1', x: 3440, y: 358, r: 20 },
    { id: '41_fm2', x: 5560, y: 283, r: 20 },
    { id: '41_fm3', x: 8000, y: 363, r: 20 },
    { id: '41_fm4', x: 12220, y: 353, r: 20 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('41e01', 'ice_skater', 760, 325, 620, 940),
    makeW4Enemy('41e02', 'frost_wraith', 1580, 270, 1410, 1790),
    makeW4Enemy('41e03', 'icicle_bat', 1590, 155, 1470, 1710),
    makeW4Enemy('41e04', 'cryo_turret', 2180, 230, 2150, 2210),
    makeW4Enemy('41e05', 'ice_skater', 3420, 370, 3250, 3660),
    makeW4Enemy('41e06', 'glacier_golem', 4360, 360, 4140, 4540),
    makeW4Enemy('41e07', 'blizzard_fairy', 4880, 195, 4740, 5060),
    makeW4Enemy('41e08', 'permafrost_wyrm', 4940, 340, 4780, 5140),
    makeW4Enemy('41e09', 'mirror_frost', 5560, 295, 5380, 5740),
    makeW4Enemy('41e10', 'frost_wraith', 6680, 245, 6500, 6880),
    makeW4Enemy('41e11', 'ice_skater', 7980, 375, 7810, 8180),
    makeW4Enemy('41e12', 'icicle_bat', 8520, 270, 8380, 8680),
    makeW4Enemy('41e13', 'glacier_golem', 8780, 340, 8600, 8980),
    makeW4Enemy('41e14', 'cryo_turret', 9390, 365, 9360, 9420),
    makeW4Enemy('41e15', 'mirror_frost', 10280, 295, 10080, 10480),
    makeW4Enemy('41e16', 'blizzard_fairy', 10280, 175, 10140, 10420),
    makeW4Enemy('41e17', 'permafrost_wyrm', 10900, 255, 10720, 11100),
    makeW4Enemy('41e18', 'ice_skater', 12180, 365, 12000, 12400),
    makeW4Enemy('41e19', 'frost_wraith', 13080, 290, 12900, 13260),
    makeW4Enemy('41e20', 'glacier_golem', 13720, 365, 13500, 13920),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('41o1', 2520, 180, 5, 120, 20),
    ...makeW4Orbs('41o2', 7020, 195, 5, 130, 18),
    ...makeW4Orbs('41o3', 11240, 205, 5, 125, 16),
    { id: '41_b1', x: 1590, y: 105, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '41_b2', x: 4900, y: 145, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '41_b3', x: 10280, y: 125, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  return emptyW4Stage({
    id: '4-1',
    code: '4-1',
    title: '蒼氷の港湾高速滑走＆氷坂ダイブ',
    subtitle: 'Hyper-Friction Ice Slopes, Cryo Geysers & Icicle Slalom (20 Enemies)',
    theme: 'frozen_harbor',
    slippery: true,
    width: 14200,
    goal: { x: 14000, y: 249, w: 54, h: 116 },
    platforms,
    slopes,
    cryoBumpers,
    cryoGeysers,
    fallingIcicles,
    frostMines,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4160, y: 360 },
      { x: 9220, y: 365 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 235, h: 24, label: 'ICE SLIDE HYPER-BOOST', color: '#38bdf8' },
      { x: 4180, y: 175, w: 235, h: 24, label: 'DUAL HARBOR TIERS', color: '#7dd3fc' },
      { x: 9240, y: 185, w: 235, h: 24, label: 'ICICLE SKI-JUMP DASH', color: '#bae6fd' },
    ],
  });
}

// ============================================================================
// STAGE 4-2: 崩落クリスタル氷棚迷宮 (13,900px / 20 Enemies)
// 連続ピンボール・クラッシュアイス鎖＋2段空中ハイスピード跳躍＋落氷柱の緊張感！
// ============================================================================
function buildStage4_2(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '42_p1', x: 0, y: 370, w: 440, h: 160, style: 'ice_floor' },
    // Sec 1: Triple Crumble Chain + High Perch
    { id: '42_cr1', x: 560, y: 340, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_cr2', x: 820, y: 305, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_cr3', x: 1080, y: 270, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p2', x: 1350, y: 295, w: 460, h: 235, style: 'ice_floor' },
    { id: '42_hi0', x: 1420, y: 175, w: 300, h: 16, style: 'ice_floor', oneWay: true },

    // Sec 2: Dual Pinball Vault -> Narrow Cryo Ledges
    { id: '42_cr4', x: 1940, y: 280, w: 135, h: 20, style: 'crumble_ice' },
    { id: '42_p3', x: 2680, y: 255, w: 460, h: 275, style: 'ice_floor' },
    { id: '42_cr5', x: 3280, y: 295, w: 135, h: 20, style: 'crumble_ice' },
    { id: '42_cr6', x: 3530, y: 275, w: 135, h: 20, style: 'crumble_ice' },
    { id: '42_cr7', x: 3780, y: 255, w: 135, h: 20, style: 'crumble_ice' },
    { id: '42_p4', x: 4050, y: 335, w: 480, h: 195, style: 'ice_floor' },

    // Sec 3: Crumble Stairs into Double Pinball Gorge (4670..6500)
    { id: '42_cr8', x: 4670, y: 310, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p4b', x: 4950, y: 300, w: 420, h: 230, style: 'cryo_metal' },
    { id: '42_cr9', x: 6180, y: 260, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p5', x: 6460, y: 305, w: 480, h: 225, style: 'ice_floor' },
    { id: '42_hi0b', x: 6540, y: 185, w: 320, h: 16, style: 'ice_floor', oneWay: true },

    // Sec 4: Upper / Lower Crumble Crystal Split (7080..8800)
    { id: '42_hi1', x: 7090, y: 195, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_hi2', x: 7350, y: 180, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_hi3', x: 7610, y: 195, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_lo1', x: 7090, y: 345, w: 145, h: 20, style: 'crumble_ice' },
    { id: '42_lo2', x: 7360, y: 345, w: 145, h: 20, style: 'crumble_ice' },
    { id: '42_lo3', x: 7620, y: 345, w: 145, h: 20, style: 'crumble_ice' },
    { id: '42_p6', x: 7900, y: 315, w: 480, h: 215, style: 'ice_floor' },

    // Sec 5: Freeze Beam + Crumble Rhythm -> Bumper Finale (8500..13900)
    { id: '42_cr10', x: 8520, y: 305, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p7', x: 8800, y: 335, w: 500, h: 195, style: 'ice_floor' },
    { id: '42_cr11', x: 9440, y: 310, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p7b', x: 9720, y: 295, w: 440, h: 235, style: 'cryo_metal' },
    { id: '42_cr12', x: 10940, y: 270, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p8', x: 11220, y: 315, w: 480, h: 215, style: 'ice_floor' },
    { id: '42_cr13', x: 11840, y: 295, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_cr14', x: 12100, y: 275, w: 140, h: 20, style: 'crumble_ice' },
    { id: '42_p9', x: 12380, y: 310, w: 460, h: 220, style: 'ice_floor' },
    { id: '42_cr15', x: 12980, y: 325, w: 145, h: 20, style: 'crumble_ice' },
    { id: '42_end', x: 13260, y: 340, w: 640, h: 190, style: 'ice_floor' },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '42_cb1', x: 2240, y: 245, r: 24, launchSpeed: 545 },
    { id: '42_cb2', x: 2480, y: 220, r: 24, launchSpeed: 545 },
    { id: '42_cb3', x: 5600, y: 255, r: 24, launchSpeed: 545 },
    { id: '42_cb4', x: 5900, y: 235, r: 24, launchSpeed: 545 },
    { id: '42_cb5', x: 10380, y: 255, r: 24, launchSpeed: 550 },
    { id: '42_cb6', x: 10660, y: 235, r: 24, launchSpeed: 550 },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '42_fb1', x1: 3590, y1: 80, x2: 3590, y2: 275, cyclePeriod: 3.1, activeDuration: 1.35, phase: 0 },
    { id: '42_fb2', x1: 8140, y1: 90, x2: 8140, y2: 315, cyclePeriod: 3.1, activeDuration: 1.35, phase: 1.0 },
    { id: '42_fb3', x1: 11460, y1: 90, x2: 11460, y2: 315, cyclePeriod: 3.0, activeDuration: 1.35, phase: 0.4 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '42_ic1', x: 1620, topY: 45, triggerRange: 110 },
    { id: '42_ic2', x: 4280, topY: 45, triggerRange: 110 },
    { id: '42_ic3', x: 6720, topY: 45, triggerRange: 110 },
    { id: '42_ic4', x: 9080, topY: 45, triggerRange: 110 },
    { id: '42_ic5', x: 12640, topY: 45, triggerRange: 110 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('42e01', 'icicle_bat', 290, 370, 160, 410),
    makeW4Enemy('42e02', 'frost_wraith', 1580, 295, 1390, 1770),
    makeW4Enemy('42e03', 'blizzard_fairy', 1570, 175, 1440, 1700),
    makeW4Enemy('42e04', 'ice_skater', 2910, 255, 2720, 3100),
    makeW4Enemy('42e05', 'mirror_frost', 4290, 335, 4090, 4490),
    makeW4Enemy('42e06', 'glacier_golem', 5150, 300, 4990, 5330),
    makeW4Enemy('42e07', 'cryo_turret', 6640, 305, 6610, 6670),
    makeW4Enemy('42e08', 'frost_wraith', 6780, 305, 6500, 6900),
    makeW4Enemy('42e09', 'icicle_bat', 6700, 185, 6560, 6840),
    makeW4Enemy('42e10', 'blizzard_fairy', 7420, 180, 7280, 7680),
    makeW4Enemy('42e11', 'glacier_golem', 8100, 315, 7940, 8340),
    makeW4Enemy('42e12', 'mirror_frost', 8980, 335, 8840, 9260),
    makeW4Enemy('42e13', 'permafrost_wyrm', 9940, 295, 9760, 10120),
    makeW4Enemy('42e14', 'icicle_bat', 11380, 315, 11260, 11660),
    makeW4Enemy('42e15', 'frost_wraith', 11540, 315, 11260, 11660),
    makeW4Enemy('42e16', 'ice_skater', 12580, 310, 12420, 12800),
    makeW4Enemy('42e17', 'glacier_golem', 13440, 340, 13300, 13720),
    makeW4Enemy('42e18', 'blizzard_fairy', 13580, 340, 13320, 13780),
    makeW4Enemy('42e19', 'cryo_turret', 9940, 295, 9910, 9970),
    makeW4Enemy('42e20', 'mirror_frost', 2920, 255, 2720, 3100),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('42o1', 610, 290, 3, 260, -35),
    ...makeW4Orbs('42o2', 5620, 180, 3, 140),
    ...makeW4Orbs('42o3', 10380, 180, 3, 140),
    { id: '42_b1', x: 1570, y: 125, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '42_b2', x: 7420, y: 130, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '42_b3', x: 11910, y: 235, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  return emptyW4Stage({
    id: '4-2',
    code: '4-2',
    title: '崩落クリスタル氷棚迷宮',
    subtitle: '0.50s Crumble Ice Chains, Freeze Beams & 4-Way Cryo Bumpers (20 Enemies)',
    theme: 'cryo_prism_maze',
    width: 13900,
    goal: { x: 13700, y: 224, w: 54, h: 116 },
    platforms,
    cryoBumpers,
    freezeBeams,
    fallingIcicles,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4110, y: 335 },
      { x: 8860, y: 335 },
    ],
    neonSigns: [
      { x: 90, y: 195, w: 235, h: 24, label: 'ICE SHATTERS IN 0.50S', color: '#7dd3fc' },
      { x: 4130, y: 185, w: 235, h: 24, label: 'CRYO PINBALL CHASM', color: '#38bdf8' },
      { x: 8880, y: 185, w: 235, h: 24, label: 'BEAM & SHATTER SPRINT', color: '#bae6fd' },
    ],
  });
}

// ============================================================================
// STAGE 4-3: 鏡面氷晶と反射パズル回廊 (14,400px / 20 Enemies)
// 真の「氷鏡跳弾パズル」化：壁で遮蔽されたスイッチ裏の氷鏡を狙撃＋冷凍光線織網＋凍結バンパー
// ============================================================================
function buildStage4_3(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '43_p1', x: 0, y: 370, w: 460, h: 160, style: 'ice_floor' },
    { id: '43_cr0', x: 600, y: 345, w: 145, h: 20, style: 'crumble_ice' },
    // Puzzle Chamber 1: Switch shielded from direct shot by baffle pillar 43_sh1 -> bounce off mirror 43_im1!
    { id: '43_p2', x: 880, y: 335, w: 480, h: 195, style: 'cryo_metal' },
    { id: '43_sh1', x: 1080, y: 185, w: 32, h: 85, style: 'cryo_metal' },
    { id: '43_p2b', x: 1500, y: 315, w: 440, h: 215, style: 'ice_floor' },
    { id: '43_br0', x: 1970, y: 315, w: 210, h: 18, style: 'holo', switchGroup: 'g43_1' },
    { id: '43_p3', x: 2210, y: 315, w: 480, h: 215, style: 'ice_floor' },

    // Freeze Beam Crossfire + Elevated OneWay Mirrors (2820..5200)
    { id: '43_p4', x: 2830, y: 340, w: 480, h: 190, style: 'cryo_metal' },
    { id: '43_up1', x: 2920, y: 215, w: 340, h: 16, style: 'ice_floor', oneWay: true },
    { id: '43_cr1', x: 3450, y: 300, w: 150, h: 20, style: 'crumble_ice' },
    { id: '43_p4b', x: 3740, y: 315, w: 480, h: 215, style: 'cryo_metal' },
    { id: '43_p5', x: 4360, y: 300, w: 520, h: 230, style: 'ice_floor' },

    // Puzzle Chamber 2: Moving lift + Ice Mirror Bank Shot Bridge (5020..7600)
    { id: '43_p6', x: 5020, y: 335, w: 480, h: 195, style: 'cryo_metal' },
    { id: '43_sh2', x: 5640, y: 175, w: 32, h: 90, style: 'cryo_metal' },
    { id: '43_p6b', x: 5620, y: 335, w: 440, h: 195, style: 'cryo_metal' },
    { id: '43_br1', x: 6100, y: 325, w: 380, h: 18, style: 'holo', switchGroup: 'g43_2' },
    { id: '43_p7', x: 6520, y: 315, w: 500, h: 215, style: 'ice_floor' },
    { id: '43_hi2', x: 7160, y: 225, w: 360, h: 16, style: 'ice_floor', oneWay: true },
    { id: '43_p7b', x: 7180, y: 345, w: 480, h: 185, style: 'cryo_metal' },

    // Mirror Frost Gauntlet + Twin Freeze Beams (7800..10400)
    { id: '43_p8', x: 7800, y: 330, w: 480, h: 200, style: 'cryo_metal' },
    { id: '43_cr2', x: 8420, y: 295, w: 150, h: 20, style: 'crumble_ice' },
    { id: '43_p8b', x: 8710, y: 315, w: 480, h: 215, style: 'ice_floor' },
    { id: '43_p9', x: 9330, y: 300, w: 520, h: 230, style: 'cryo_metal' },
    { id: '43_br2', x: 9890, y: 310, w: 280, h: 18, style: 'holo', switchGroup: 'g43_3' },

    // Cryo Bumper & Mirror Maze Finale (10210..14400)
    { id: '43_p10', x: 10210, y: 330, w: 480, h: 200, style: 'cryo_metal' },
    { id: '43_cr3', x: 11420, y: 270, w: 145, h: 20, style: 'crumble_ice' },
    { id: '43_p11', x: 11700, y: 315, w: 500, h: 215, style: 'ice_floor' },
    { id: '43_hi3', x: 12360, y: 220, w: 340, h: 16, style: 'ice_floor', oneWay: true },
    { id: '43_hi_mid', x: 4440, y: 175, w: 360, h: 16, style: 'ice_floor', oneWay: true },
    { id: '43_p12', x: 12340, y: 345, w: 500, h: 185, style: 'cryo_metal' },
    { id: '43_cr4', x: 12980, y: 320, w: 145, h: 20, style: 'crumble_ice' },
    { id: '43_p13', x: 13260, y: 345, w: 480, h: 185, style: 'ice_floor' },
    { id: '43_cr5', x: 13840, y: 315, w: 130, h: 20, style: 'crumble_ice' },
    { id: '43_end', x: 14050, y: 310, w: 350, h: 220, style: 'ice_floor' },
    // Secret Upper Prism Sky-Gallery -> Secret Goal
    { id: '43_sec_1', x: 12840, y: 190, w: 240, h: 16, style: 'crumble_ice', oneWay: true },
    { id: '43_sec_2', x: 13240, y: 165, w: 320, h: 18, style: 'ice_floor', oneWay: true },
    { id: '43_sec_3', x: 13720, y: 145, w: 560, h: 18, style: 'cryo_metal', oneWay: true },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: '43_mp1', x: 10820, y: 280, w: 110, h: 18, startX: 10820, startY: 280, endX: 11200, endY: 245, speed: 105, phase: 0, vx: 0, vy: 0, prevX: 10820, prevY: 280 },
  ];

  const iceMirrors: IceMirrorDef[] = [
    { id: '43_im1', x: 1580, y: 155, w: 20, h: 98 },
    { id: '43_im2', x: 5980, y: 160, w: 20, h: 98 },
    { id: '43_im3', x: 9760, y: 150, w: 20, h: 98 },
  ];

  const switches: MagicSwitchDef[] = [
    // Reachable either by shooting mirror from elevated step OR direct bank shot
    { id: '43_sw1', x: 1200, y: 205, r: 17, group: 'g43_1', activated: false },
    { id: '43_sw2', x: 5750, y: 205, r: 17, group: 'g43_2', activated: false },
    { id: '43_sw3', x: 9520, y: 195, r: 17, group: 'g43_3', activated: false },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '43_fb1', x1: 3080, y1: 95, x2: 3080, y2: 340, cyclePeriod: 3.1, activeDuration: 1.4, phase: 0 },
    { id: '43_fb2', x1: 3980, y1: 95, x2: 3980, y2: 315, cyclePeriod: 3.1, activeDuration: 1.4, phase: 1.2 },
    { id: '43_fb3', x1: 6780, y1: 95, x2: 6780, y2: 315, cyclePeriod: 3.0, activeDuration: 1.4, phase: 0.4 },
    { id: '43_fb4', x1: 8040, y1: 95, x2: 8040, y2: 330, cyclePeriod: 3.0, activeDuration: 1.4, phase: 1.5 },
    { id: '43_fb5', x1: 11960, y1: 95, x2: 11960, y2: 315, cyclePeriod: 2.9, activeDuration: 1.35, phase: 0.7 },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '43_cb1', x: 10840, y: 255, r: 24, launchSpeed: 525 },
    { id: '43_cb2', x: 11180, y: 240, r: 24, launchSpeed: 525 },
  ];

  const cryoGeysers: CryoGeyserDef[] = [
    { id: '43_cg1', x: 5520, y: 380, w: 52, maxHeight: 225, cyclePeriod: 3.2, activeDuration: 2.0, phase: 0 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('43e01', 'mirror_frost', 260, 370, 160, 420),
    makeW4Enemy('43e02', 'frost_wraith', 1120, 335, 920, 1320),
    makeW4Enemy('43e03', 'cryo_turret', 1720, 315, 1690, 1750),
    makeW4Enemy('43e04', 'icicle_bat', 2440, 315, 2260, 2640),
    makeW4Enemy('43e05', 'ice_skater', 3060, 340, 2870, 3270),
    makeW4Enemy('43e06', 'blizzard_fairy', 3080, 215, 2940, 3220),
    makeW4Enemy('43e07', 'mirror_frost', 3980, 315, 3780, 4180),
    makeW4Enemy('43e08', 'glacier_golem', 4620, 300, 4400, 4840),
    makeW4Enemy('43e09', 'cryo_turret', 5240, 335, 5210, 5270),
    makeW4Enemy('43e10', 'frost_wraith', 5840, 335, 5660, 6020),
    makeW4Enemy('43e11', 'glacier_golem', 6760, 315, 6560, 6980),
    makeW4Enemy('43e12', 'blizzard_fairy', 7340, 225, 7180, 7500),
    makeW4Enemy('43e13', 'permafrost_wyrm', 7420, 345, 7220, 7620),
    makeW4Enemy('43e14', 'mirror_frost', 8040, 330, 7840, 8240),
    makeW4Enemy('43e15', 'ice_skater', 8950, 315, 8750, 9150),
    makeW4Enemy('43e16', 'icicle_bat', 9580, 300, 9380, 9800),
    makeW4Enemy('43e17', 'frost_wraith', 10440, 330, 10250, 10650),
    makeW4Enemy('43e18', 'mirror_frost', 11940, 315, 11740, 12160),
    makeW4Enemy('43e19', 'blizzard_fairy', 12520, 220, 12380, 12660),
    makeW4Enemy('43e20', 'glacier_golem', 13540, 345, 13300, 13700),
    makeW4Enemy('43e21', 'mirror_frost', 13960, 145, 13800, 14120),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('43o1', 1240, 260, 4, 145),
    ...makeW4Orbs('43o2', 6120, 270, 4, 95),
    ...makeW4Orbs('43o3', 10840, 185, 4, 140),
    { id: '43_b1', x: 3090, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '43_b2', x: 7340, y: 170, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '43_b3', x: 12520, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
    { id: '43_b4', x: 13400, y: 115, r: 10, collected: false, value: 300, bonus: true, phase: 0.4 },
  ];

  return emptyW4Stage({
    id: '4-3',
    code: '4-3',
    title: '鏡面氷晶と反射パズル回廊',
    subtitle: 'Ice Mirror Ricochet Locks, One-Way Tiers & Freeze Beams (21 Enemies)',
    theme: 'cryo_prism_maze',
    width: 14400,
    goal: { x: 14200, y: 194, w: 54, h: 116 },
    secretGoal: { x: 14180, y: 29, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    iceMirrors,
    switches,
    freezeBeams,
    cryoBumpers,
    cryoGeysers,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4420, y: 300 },
      { x: 9400, y: 300 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 245, h: 24, label: 'ICE MIRROR RICOCHET SWITCH', color: '#38bdf8' },
      { x: 4440, y: 175, w: 235, h: 24, label: 'FREEZE BEAM WEAVE', color: '#7dd3fc' },
      { x: 9420, y: 175, w: 235, h: 24, label: 'PRISM CITADEL SPRINT', color: '#e0f2fe' },
    ],
  });
}

// ============================================================================
// STAGE 4-FORT1: 第一蒼氷要塞・絶対零度装甲門 (13,800px / 19 Enemies + Glacia Knight 13HP)
// 氷刃振子×感応凍雷×崩落氷橋×上下交差防衛陣＋ワープ無し騎乗決戦ボス
// ============================================================================
function buildStage4_Fort1(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '4f1_p1', x: 0, y: 370, w: 460, h: 160, style: 'cryo_metal' },
    { id: '4f1_cr0', x: 600, y: 345, w: 140, h: 20, style: 'crumble_ice' },
    { id: '4f1_p2', x: 880, y: 335, w: 480, h: 195, style: 'cryo_metal' },
    { id: '4f1_p2b', x: 1500, y: 305, w: 420, h: 225, style: 'cryo_metal' },
    { id: '4f1_cr1', x: 2040, y: 315, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f1_p3', x: 2320, y: 340, w: 500, h: 190, style: 'cryo_metal' },
    { id: '4f1_up1', x: 2440, y: 215, w: 340, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f1_p3b', x: 2960, y: 320, w: 460, h: 210, style: 'cryo_metal' },

    { id: '4f1_p4', x: 3560, y: 300, w: 500, h: 230, style: 'cryo_metal' },
    { id: '4f1_cr1b', x: 4200, y: 315, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f1_p5', x: 4480, y: 340, w: 500, h: 190, style: 'cryo_metal' },
    { id: '4f1_p5b', x: 5140, y: 310, w: 480, h: 220, style: 'cryo_metal' },
    { id: '4f1_up2', x: 5220, y: 190, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f1_p6', x: 5780, y: 315, w: 500, h: 215, style: 'cryo_metal' },

    // Crumble + Pendulum Fortress Pit (6420..8800)
    { id: '4f1_cr2', x: 6420, y: 310, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f1_cr3', x: 6700, y: 295, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f1_p7', x: 6980, y: 330, w: 500, h: 200, style: 'cryo_metal' },
    { id: '4f1_p7b', x: 7640, y: 300, w: 480, h: 230, style: 'cryo_metal' },
    { id: '4f1_cr4', x: 8260, y: 315, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f1_p8', x: 8560, y: 340, w: 520, h: 190, style: 'cryo_metal' },

    // Final Fortress Corridor (9220..11200)
    { id: '4f1_p8b', x: 9240, y: 305, w: 480, h: 225, style: 'cryo_metal' },
    { id: '4f1_up3', x: 9320, y: 185, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f1_p9', x: 9880, y: 325, w: 520, h: 205, style: 'cryo_metal' },
    { id: '4f1_p9b', x: 10540, y: 300, w: 560, h: 230, style: 'cryo_metal' },

    // Boss Arena: Glacia Knight (11520..12540, floorY: 365)
    { id: '4f1_arena', x: 11380, y: 365, w: 2420, h: 165, style: 'cryo_metal' },
    { id: '4f1_ap1', x: 11640, y: 258, w: 155, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f1_ap2', x: 12220, y: 258, w: 155, h: 16, style: 'ice_floor', oneWay: true },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '4f1_cb1', x: 1960, y: 240, r: 22, launchSpeed: 500 },
    { id: '4f1_cb2', x: 7540, y: 245, r: 22, launchSpeed: 515 },
  ];

  const icePendulums: ScythePendulumDef[] = [
    { id: '4f1_ip1', cx: 1120, cy: 48, length: 215, maxAngle: 0.74, speed: 2.35, phase: 0 },
    { id: '4f1_ip2', cx: 3820, cy: 48, length: 210, maxAngle: 0.76, speed: 2.45, phase: 0.8 },
    { id: '4f1_ip3', cx: 6040, cy: 48, length: 215, maxAngle: 0.76, speed: 2.45, phase: 1.5 },
    { id: '4f1_ip4', cx: 8820, cy: 48, length: 225, maxAngle: 0.78, speed: 2.5, phase: 0.4 },
    { id: '4f1_ip5', cx: 10140, cy: 48, length: 220, maxAngle: 0.78, speed: 2.5, phase: 1.8 },
  ];

  const frostMines: FrostMineDef[] = [
    { id: '4f1_fm1', x: 320, y: 358, r: 22 },
    { id: '4f1_fm2', x: 2660, y: 328, r: 22 },
    { id: '4f1_fm3', x: 4740, y: 328, r: 22 },
    { id: '4f1_fm4', x: 7240, y: 318, r: 22 },
    { id: '4f1_fm5', x: 10840, y: 288, r: 22 },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '4f1_fb1', x1: 3180, y1: 100, x2: 3180, y2: 320, cyclePeriod: 3.1, activeDuration: 1.4, phase: 0 },
    { id: '4f1_fb2', x1: 5380, y1: 100, x2: 5380, y2: 310, cyclePeriod: 3.1, activeDuration: 1.4, phase: 1.1 },
    { id: '4f1_fb3', x1: 7880, y1: 100, x2: 7880, y2: 300, cyclePeriod: 3.0, activeDuration: 1.4, phase: 0.5 },
    { id: '4f1_fb4', x1: 9520, y1: 95, x2: 9520, y2: 305, cyclePeriod: 3.0, activeDuration: 1.4, phase: 1.4 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '4f1_ic1', x: 1700, topY: 45, triggerRange: 110 },
    { id: '4f1_ic2', x: 4860, topY: 45, triggerRange: 110 },
    { id: '4f1_ic3', x: 7180, topY: 45, triggerRange: 110 },
    { id: '4f1_ic4', x: 10080, topY: 45, triggerRange: 110 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('4f1e01', 'glacier_golem', 280, 370, 160, 420),
    makeW4Enemy('4f1e02', 'frost_wraith', 1120, 335, 920, 1320),
    makeW4Enemy('4f1e03', 'ice_skater', 1710, 305, 1540, 1880),
    makeW4Enemy('4f1e04', 'mirror_frost', 2560, 340, 2360, 2780),
    makeW4Enemy('4f1e05', 'icicle_bat', 2600, 215, 2460, 2740),
    makeW4Enemy('4f1e06', 'cryo_turret', 3180, 320, 3150, 3210),
    makeW4Enemy('4f1e07', 'ice_skater', 3800, 300, 3600, 4020),
    makeW4Enemy('4f1e08', 'glacier_golem', 4740, 340, 4520, 4940),
    makeW4Enemy('4f1e09', 'blizzard_fairy', 5380, 190, 5240, 5520),
    makeW4Enemy('4f1e10', 'permafrost_wyrm', 5380, 310, 5180, 5580),
    makeW4Enemy('4f1e11', 'cryo_turret', 6020, 315, 5990, 6050),
    makeW4Enemy('4f1e12', 'mirror_frost', 7220, 330, 7020, 7440),
    makeW4Enemy('4f1e13', 'frost_wraith', 7860, 300, 7680, 8080),
    makeW4Enemy('4f1e14', 'glacier_golem', 8820, 340, 8600, 9040),
    makeW4Enemy('4f1e15', 'icicle_bat', 9480, 185, 9340, 9620),
    makeW4Enemy('4f1e16', 'ice_skater', 9480, 305, 9280, 9680),
    makeW4Enemy('4f1e17', 'mirror_frost', 10120, 325, 9920, 10360),
    makeW4Enemy('4f1e18', 'frost_wraith', 10740, 300, 10580, 10960),
    makeW4Enemy('4f1e19', 'glacier_golem', 10920, 300, 10620, 11060),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('4f1o1', 2480, 170, 3, 110),
    ...makeW4Orbs('4f1o2', 6460, 245, 3, 140),
    ...makeW4Orbs('4f1o3', 12780, 315, 5, 54, 0, true, true),
    { id: '4f1_b1', x: 2610, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '4f1_b2', x: 6770, y: 240, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '4f1_b3', x: 11720, y: 210, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const boss: BossDef = {
    kind: 'glacia_knight',
    x: 12300,
    y: 285,
    w: 58,
    h: 72,
    vx: 0,
    vy: 0,
    hp: 13,
    maxHp: 13,
    facing: -1,
    arenaMinX: 11520,
    arenaMaxX: 12540,
    floorY: 365,
    active: false,
    defeated: false,
    state: 'guard',
    stateTimer: 1.25,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW4Stage({
    id: '4-FORT1',
    code: '4-砦1',
    title: '第一蒼氷要塞・絶対零度装甲門',
    subtitle: 'Ice Blade Pendulums, Frost Mines, Freeze Beams & Glacia Knight (19 Enemies)',
    theme: 'glacial_fortress',
    width: 13800,
    goal: { x: 13580, y: 249, w: 54, h: 116 },
    platforms,
    cryoBumpers,
    icePendulums,
    frostMines,
    freezeBeams,
    fallingIcicles,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4540, y: 340 },
      { x: 8620, y: 340 },
      { x: 11420, y: 365 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 235, h: 24, label: 'ICE BLADE PENDULUMS', color: '#38bdf8' },
      { x: 4560, y: 185, w: 235, h: 24, label: 'PROXIMITY FROST MINES', color: '#7dd3fc' },
      { x: 11760, y: 145, w: 235, h: 24, label: 'GLACIA KNIGHT DUEL', color: '#bae6fd' },
    ],
    boss,
  });
}

// ============================================================================
// STAGE 4-4: 深海氷溝・氷水相転移ダイブ (13,800px / 20 Enemies / 分岐A)
// 真の深海立体探索：水⇔氷相転移スイッチで上層歩行と深海遊泳を動的に切り替えて突破
// ============================================================================
function buildStage4_4(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '44_p1', x: 0, y: 370, w: 480, h: 160, style: 'cryo_metal' },
    // Basin 1: Dual water tiers
    { id: '44_fw1', x: 560, y: 315, w: 560, h: 34, style: 'freeze_water', waterState: 'ice' },
    { id: '44_lo0', x: 640, y: 425, w: 460, h: 105, style: 'ice_floor' },
    { id: '44_p2', x: 1220, y: 340, w: 480, h: 190, style: 'ice_floor' },
    { id: '44_up1', x: 1840, y: 205, w: 480, h: 24, style: 'ice_floor' },
    { id: '44_fw2', x: 1820, y: 360, w: 580, h: 34, style: 'freeze_water', waterState: 'liquid' },
    { id: '44_p3', x: 2520, y: 325, w: 500, h: 205, style: 'cryo_metal' },
    { id: '44_cr1', x: 3160, y: 295, w: 150, h: 20, style: 'crumble_ice' },
    { id: '44_p3b', x: 3460, y: 330, w: 480, h: 200, style: 'ice_floor' },

    // Abyssal Swim Trench 2 (4080..6500)
    { id: '44_fw3', x: 4080, y: 275, w: 660, h: 34, style: 'freeze_water', waterState: 'ice' },
    { id: '44_lo1', x: 4100, y: 420, w: 660, h: 110, style: 'ice_floor' },
    { id: '44_p4', x: 4880, y: 335, w: 480, h: 195, style: 'cryo_metal' },
    { id: '44_p4b', x: 5500, y: 295, w: 480, h: 235, style: 'ice_floor' },

    // Cryo Geyser & Mirror Underwater Vault (6120..9200)
    { id: '44_p5', x: 6140, y: 350, w: 500, h: 180, style: 'ice_floor' },
    { id: '44_hi2', x: 6780, y: 215, w: 420, h: 16, style: 'ice_floor', oneWay: true },
    { id: '44_p5b', x: 6800, y: 350, w: 460, h: 180, style: 'cryo_metal' },
    { id: '44_fw4', x: 7400, y: 295, w: 680, h: 34, style: 'freeze_water', waterState: 'liquid' },
    { id: '44_p6', x: 8220, y: 330, w: 520, h: 200, style: 'cryo_metal' },

    // Deep Abyssal Chambers -> Final Climb Out (8880..13800)
    { id: '44_fw5', x: 8880, y: 265, w: 680, h: 34, style: 'freeze_water', waterState: 'ice' },
    { id: '44_lo2', x: 8920, y: 410, w: 620, h: 120, style: 'ice_floor' },
    { id: '44_p7', x: 9700, y: 335, w: 500, h: 195, style: 'ice_floor' },
    { id: '44_p7b', x: 10360, y: 300, w: 480, h: 230, style: 'cryo_metal' },
    { id: '44_fw6', x: 10980, y: 305, w: 620, h: 34, style: 'freeze_water', waterState: 'liquid' },
    { id: '44_p8', x: 11740, y: 315, w: 500, h: 215, style: 'cryo_metal' },
    { id: '44_cr2', x: 12380, y: 290, w: 150, h: 20, style: 'crumble_ice' },
    { id: '44_p9', x: 12660, y: 340, w: 520, h: 190, style: 'ice_floor' },
    { id: '44_end', x: 13310, y: 310, w: 490, h: 220, style: 'ice_floor' },
  ];

  const phaseWaterSwitches: PhaseWaterSwitchDef[] = [
    { id: '44_pws1', x: 1060, y: 225, r: 17 },
    { id: '44_pws2', x: 4000, y: 215, r: 17 },
    { id: '44_pws3', x: 7340, y: 225, r: 17 },
    { id: '44_pws4', x: 8820, y: 205, r: 17 },
    { id: '44_pws5', x: 10920, y: 220, r: 17 },
  ];

  const cryoLanterns: GlowLanternDef[] = [
    { id: '44_cl1', x: 420, y: 255, r: 16 },
    { id: '44_cl2', x: 2060, y: 150, r: 16 },
    { id: '44_cl3', x: 4440, y: 335, r: 16 },
    { id: '44_cl4', x: 6420, y: 240, r: 16 },
    { id: '44_cl5', x: 9220, y: 330, r: 16 },
    { id: '44_cl6', x: 11960, y: 230, r: 16 },
  ];

  const cryoGeysers: CryoGeyserDef[] = [
    { id: '44_cg1', x: 6540, y: 350, w: 58, maxHeight: 220, cyclePeriod: 3.3, activeDuration: 2.0, phase: 0 },
    { id: '44_cg2', x: 11660, y: 400, w: 58, maxHeight: 230, cyclePeriod: 3.3, activeDuration: 2.0, phase: 1.1 },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '44_fb1', x1: 5720, y1: 110, x2: 5720, y2: 295, cyclePeriod: 3.1, activeDuration: 1.4, phase: 0 },
    { id: '44_fb2', x1: 10580, y1: 110, x2: 10580, y2: 300, cyclePeriod: 3.0, activeDuration: 1.4, phase: 0.9 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('44e01', 'frost_wraith', 320, 370, 160, 450),
    makeW4Enemy('44e02', 'ice_skater', 840, 315, 600, 1080),
    makeW4Enemy('44e03', 'icicle_bat', 1460, 340, 1260, 1660),
    makeW4Enemy('44e04', 'blizzard_fairy', 2080, 205, 1880, 2280),
    makeW4Enemy('44e05', 'glacier_golem', 2780, 325, 2560, 2980),
    makeW4Enemy('44e06', 'mirror_frost', 3700, 330, 3500, 3900),
    makeW4Enemy('44e07', 'permafrost_wyrm', 4420, 420, 4160, 4720),
    makeW4Enemy('44e08', 'cryo_turret', 5120, 335, 5090, 5150),
    makeW4Enemy('44e09', 'frost_wraith', 5720, 295, 5540, 5940),
    makeW4Enemy('44e10', 'icicle_bat', 6380, 350, 6180, 6600),
    makeW4Enemy('44e11', 'blizzard_fairy', 6980, 215, 6820, 7160),
    makeW4Enemy('44e12', 'glacier_golem', 7040, 350, 6840, 7220),
    makeW4Enemy('44e13', 'mirror_frost', 8480, 330, 8260, 8700),
    makeW4Enemy('44e14', 'blizzard_fairy', 9220, 265, 8920, 9520),
    makeW4Enemy('44e15', 'permafrost_wyrm', 9220, 410, 8960, 9500),
    makeW4Enemy('44e16', 'ice_skater', 9960, 335, 9740, 10160),
    makeW4Enemy('44e17', 'cryo_turret', 10580, 300, 10550, 10610),
    makeW4Enemy('44e18', 'glacier_golem', 11980, 315, 11780, 12200),
    makeW4Enemy('44e19', 'frost_wraith', 12900, 340, 12720, 13140),
    makeW4Enemy('44e20', 'mirror_frost', 13440, 310, 13340, 13560),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('44o1', 680, 225, 4, 115),
    ...makeW4Orbs('44o2', 4220, 365, 4, 145),
    ...makeW4Orbs('44o3', 9020, 195, 4, 135),
    { id: '44_b1', x: 2080, y: 140, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '44_b2', x: 4440, y: 375, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '44_b3', x: 7740, y: 215, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  return emptyW4Stage({
    id: '4-4',
    code: '4-4',
    title: '深海氷溝・氷水相転移ダイブ',
    subtitle: 'Underwater Swim Physics, Phase Water Freeze Switches & Freeze Beams (20 Enemies)',
    theme: 'abyssal_trench',
    underwaterStage: true,
    ambientDarkness: 0.72,
    width: 13800,
    goal: { x: 13600, y: 194, w: 54, h: 116 },
    platforms,
    phaseWaterSwitches,
    cryoLanterns,
    cryoGeysers,
    freezeBeams,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4940, y: 335 },
      { x: 9760, y: 335 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 245, h: 24, label: 'JUMP TO SWIM UNDERWATER', color: '#38bdf8' },
      { x: 4960, y: 185, w: 245, h: 24, label: 'SHOOT SWITCH: ICE <-> WATER', color: '#7dd3fc' },
      { x: 9780, y: 185, w: 235, h: 24, label: 'ABYSSAL SURFACE EXIT', color: '#bae6fd' },
    ],
  });
}

// ============================================================================
// STAGE 4-5: 極寒ブリザード渓谷と氷結間欠泉 (13,900px / 20 Enemies / 分岐B)
// 猛吹雪×防風モノリス庇護×間欠泉ロケット×空中断崖バンパー大跳躍
// ============================================================================
function buildStage4_5(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '45_p1', x: 0, y: 370, w: 480, h: 160, style: 'ice_floor' },
    { id: '45_wb1', x: 380, y: 220, w: 46, h: 150, style: 'cryo_metal', windbreak: true },
    { id: '45_cr0', x: 620, y: 345, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_p2', x: 900, y: 335, w: 480, h: 195, style: 'ice_floor' },
    { id: '45_wb2', x: 1140, y: 190, w: 46, h: 145, style: 'cryo_metal', windbreak: true },
    { id: '45_p2b', x: 1520, y: 315, w: 440, h: 215, style: 'ice_floor' },

    // Cryo Geyser Needle Chasm
    { id: '45_cr1', x: 2080, y: 305, w: 140, h: 20, style: 'crumble_ice' },
    { id: '45_p3', x: 2480, y: 235, w: 520, h: 295, style: 'ice_floor' },
    { id: '45_wb3', x: 2740, y: 95, w: 46, h: 140, style: 'cryo_metal', windbreak: true },
    { id: '45_p4', x: 3160, y: 335, w: 500, h: 195, style: 'ice_floor' },
    { id: '45_cr1b', x: 3800, y: 315, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_p4b', x: 4080, y: 325, w: 460, h: 205, style: 'cryo_metal' },

    // Blizzard Canyon Bumpers + Geysers
    { id: '45_p5', x: 4680, y: 320, w: 460, h: 210, style: 'ice_floor' },
    { id: '45_wb4', x: 4920, y: 180, w: 46, h: 140, style: 'cryo_metal', windbreak: true },
    { id: '45_cr2', x: 5280, y: 290, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_p6', x: 6040, y: 335, w: 520, h: 195, style: 'ice_floor' },
    { id: '45_wb5', x: 6320, y: 190, w: 46, h: 145, style: 'cryo_metal', windbreak: true },

    // Double Geyser Sky Peak & Windbreak Steps
    { id: '45_p7', x: 6720, y: 350, w: 500, h: 180, style: 'ice_floor' },
    { id: '45_hi1', x: 7580, y: 185, w: 520, h: 26, style: 'ice_floor' },
    { id: '45_lo1', x: 7620, y: 345, w: 460, h: 185, style: 'cryo_metal' },
    { id: '45_p8', x: 8260, y: 325, w: 520, h: 205, style: 'ice_floor' },
    { id: '45_wb6', x: 8560, y: 185, w: 46, h: 140, style: 'cryo_metal', windbreak: true },
    { id: '45_p8b', x: 8940, y: 300, w: 460, h: 230, style: 'ice_floor' },

    // Final Gale Gorge & Goal Shelter
    { id: '45_cr3', x: 9560, y: 310, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_p9', x: 9840, y: 330, w: 500, h: 200, style: 'ice_floor' },
    { id: '45_wb7', x: 10120, y: 190, w: 46, h: 140, style: 'cryo_metal', windbreak: true },
    { id: '45_cr4', x: 10480, y: 300, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_p9b', x: 10760, y: 315, w: 480, h: 215, style: 'cryo_metal' },
    { id: '45_cr5', x: 11380, y: 295, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_p10', x: 11680, y: 315, w: 500, h: 215, style: 'ice_floor' },
    { id: '45_end', x: 12340, y: 345, w: 1560, h: 185, style: 'ice_floor' },
  ];

  // Keep end platform crisp (<560px chunks by placing a pit/crumble before goal)
  platforms[platforms.length - 1] = { id: '45_p11', x: 12340, y: 345, w: 480, h: 185, style: 'ice_floor' };
  platforms.push(
    { id: '45_cr6', x: 12960, y: 325, w: 145, h: 20, style: 'crumble_ice' },
    { id: '45_end', x: 13240, y: 345, w: 660, h: 185, style: 'ice_floor' },
    { id: '45_hi_ridge', x: 3200, y: 185, w: 380, h: 16, style: 'cryo_metal', windbreak: true, oneWay: true },
    { id: '45_sec_1', x: 12860, y: 175, w: 260, h: 18, style: 'ice_floor', oneWay: true },
    { id: '45_sec_2', x: 13240, y: 145, w: 540, h: 18, style: 'cryo_metal', windbreak: true, oneWay: true }
  );

  const cryoGeysers: CryoGeyserDef[] = [
    { id: '45_cg1', x: 2290, y: 420, w: 62, maxHeight: 265, cyclePeriod: 3.2, activeDuration: 2.0, phase: 0 },
    { id: '45_cg2', x: 7320, y: 350, w: 62, maxHeight: 250, cyclePeriod: 3.2, activeDuration: 2.0, phase: 0.7 },
    { id: '45_cg3', x: 11520, y: 420, w: 62, maxHeight: 255, cyclePeriod: 3.2, activeDuration: 2.0, phase: 1.3 },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '45_cb1', x: 5580, y: 250, r: 24, launchSpeed: 535 },
    { id: '45_cb2', x: 5820, y: 240, r: 24, launchSpeed: 535 },
    { id: '45_sec_cb', x: 12720, y: 255, r: 24, launchSpeed: 540 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '45_ic1', x: 3440, topY: 45, triggerRange: 110 },
    { id: '45_ic2', x: 6440, topY: 45, triggerRange: 110 },
    { id: '45_ic3', x: 10200, topY: 45, triggerRange: 110 },
    { id: '45_ic4', x: 12620, topY: 45, triggerRange: 110 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('45e01', 'blizzard_fairy', 260, 370, 140, 360),
    makeW4Enemy('45e02', 'ice_skater', 1020, 335, 920, 1120),
    makeW4Enemy('45e03', 'frost_wraith', 1740, 315, 1560, 1920),
    makeW4Enemy('45e04', 'mirror_frost', 2620, 235, 2500, 2720),
    makeW4Enemy('45e05', 'glacier_golem', 3420, 335, 3200, 3620),
    makeW4Enemy('45e06', 'cryo_turret', 4300, 325, 4270, 4330),
    makeW4Enemy('45e07', 'blizzard_fairy', 4800, 320, 4700, 4900),
    makeW4Enemy('45e08', 'permafrost_wyrm', 6180, 335, 6060, 6300),
    makeW4Enemy('45e09', 'cryo_turret', 6980, 350, 6950, 7010),
    makeW4Enemy('45e10', 'frost_wraith', 7840, 185, 7620, 8060),
    makeW4Enemy('45e11', 'ice_skater', 7840, 345, 7660, 8040),
    makeW4Enemy('45e12', 'mirror_frost', 8420, 325, 8290, 8540),
    makeW4Enemy('45e13', 'icicle_bat', 9180, 300, 8980, 9360),
    makeW4Enemy('45e14', 'glacier_golem', 9980, 330, 9870, 10100),
    makeW4Enemy('45e15', 'frost_wraith', 10980, 315, 10800, 11200),
    makeW4Enemy('45e16', 'ice_skater', 11920, 315, 11720, 12140),
    makeW4Enemy('45e17', 'glacier_golem', 12580, 345, 12380, 12780),
    makeW4Enemy('45e18', 'blizzard_fairy', 13440, 345, 13280, 13640),
    makeW4Enemy('45e19', 'cryo_turret', 13580, 345, 13550, 13610),
    makeW4Enemy('45e20', 'permafrost_wyrm', 8720, 325, 8620, 8760),
    makeW4Enemy('45e21', 'blizzard_fairy', 13460, 145, 13300, 13620),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('45o1', 2280, 195, 3, 120),
    ...makeW4Orbs('45o2', 5540, 185, 3, 140),
    ...makeW4Orbs('45o3', 7680, 125, 4, 110),
    { id: '45_b1', x: 2620, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '45_b2', x: 7860, y: 120, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '45_b3', x: 11940, y: 235, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
    { id: '45_b4', x: 13000, y: 115, r: 10, collected: false, value: 300, bonus: true, phase: 0.6 },
  ];

  return emptyW4Stage({
    id: '4-5',
    code: '4-5',
    title: '極寒ブリザード渓谷と氷結間欠泉',
    subtitle: 'Alternating Blizzard Crosswinds, Windbreak Monoliths & Cryo Geysers (21 Enemies)',
    theme: 'blizzard_gorge',
    blizzardConfig: { cyclePeriod: 5.4, activeDuration: 2.6, windVx: 145 },
    width: 13900,
    goal: { x: 13700, y: 229, w: 54, h: 116 },
    secretGoal: { x: 13680, y: 29, w: 54, h: 116 },
    platforms,
    cryoGeysers,
    cryoBumpers,
    fallingIcicles,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4740, y: 320 },
      { x: 9000, y: 300 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 245, h: 24, label: 'SHELTER BEHIND WINDBREAKS', color: '#38bdf8' },
      { x: 4760, y: 185, w: 235, h: 24, label: 'CRYO GEYSER LAUNCH', color: '#7dd3fc' },
      { x: 9020, y: 175, w: 235, h: 24, label: 'BLIZZARD PEAK SPRINT', color: '#bae6fd' },
    ],
  });
}

// ============================================================================
// STAGE 4-6: 絶対零度の氷柱強制高速降下 (下ステ verticalDescent: y -680 -> +780 -> x 7000 / 18 Enemies)
// 大胆強化：縦穴降下に氷刃振子・崩落足場・ピンボールバンパー・凍気間欠泉を加え、底部も疾走アスレチック化
// ============================================================================
function buildStage4_6(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Tier 0: Glacial Summit Chute (-680)
    { id: '46_t0a', x: 0, y: -680, w: 540, h: 30, style: 'ice_floor' },
    { id: '46_cr1', x: 680, y: -560, w: 155, h: 20, style: 'crumble_ice' },
    { id: '46_t0b', x: 980, y: -440, w: 500, h: 28, style: 'ice_floor' },

    // Tier 1: Zigzag Ice Slide Descent (-240 -> +120)
    { id: '46_t1a', x: 440, y: -220, w: 520, h: 28, style: 'ice_floor' },
    { id: '46_cr2', x: 200, y: -50, w: 155, h: 20, style: 'crumble_ice' },
    { id: '46_t1b', x: 500, y: 120, w: 540, h: 28, style: 'ice_floor' },

    // Tier 2: Pinball Drop Shaft (+320 -> +580)
    { id: '46_t2a', x: 1220, y: 310, w: 520, h: 28, style: 'cryo_metal' },
    { id: '46_t2b', x: 880, y: 560, w: 540, h: 28, style: 'ice_floor' },

    // Tier 3: Sub-Zero Trench Ice Skate Gauntlet (+780, x: 1580 -> 7000)
    { id: '46_r1', x: 1580, y: 780, w: 520, h: 160, style: 'ice_floor' },
    { id: '46_cr3', x: 2240, y: 755, w: 150, h: 20, style: 'crumble_ice' },
    { id: '46_r1b', x: 2530, y: 745, w: 480, h: 195, style: 'ice_floor' },
    { id: '46_cr4', x: 3160, y: 730, w: 150, h: 20, style: 'crumble_ice' },
    { id: '46_r2', x: 3460, y: 760, w: 520, h: 180, style: 'cryo_metal' },
    { id: '46_hi1', x: 4120, y: 635, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '46_r2b', x: 4100, y: 710, w: 480, h: 230, style: 'ice_floor' },
    // Slope 4580 -> 5300 (710 -> 780)
    { id: '46_r3', x: 5300, y: 780, w: 500, h: 160, style: 'ice_floor' },
    { id: '46_cr5', x: 5940, y: 750, w: 150, h: 20, style: 'crumble_ice' },
    { id: '46_end', x: 6220, y: 780, w: 780, h: 160, style: 'ice_floor' },
  ];

  const slopes: SlopeDef[] = [
    { id: '46_sl1', x1: 4580, y1: 710, x2: 5300, y2: 780, bottomY: 940 },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '46_cb1', x: 1000, y: -330, r: 22, launchSpeed: 505 },
    { id: '46_cb2', x: 1140, y: 215, r: 22, launchSpeed: 515 },
    { id: '46_cb3', x: 1520, y: 670, r: 22, launchSpeed: 520 },
    { id: '46_cb4', x: 3320, y: 690, r: 22, launchSpeed: 525 },
  ];

  const icePendulums: ScythePendulumDef[] = [
    { id: '46_ip1', cx: 2770, cy: 480, length: 205, maxAngle: 0.72, speed: 2.35, phase: 0 },
    { id: '46_ip2', cx: 5540, cy: 500, length: 205, maxAngle: 0.72, speed: 2.4, phase: 1.0 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '46_ic1', x: 1220, topY: -690, triggerRange: 110 },
    { id: '46_ic2', x: 700, topY: -470, triggerRange: 110 },
    { id: '46_ic3', x: 1960, topY: 490, triggerRange: 115 },
    { id: '46_ic4', x: 3720, topY: 470, triggerRange: 115 },
    { id: '46_ic5', x: 6420, topY: 490, triggerRange: 115 },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '46_fb1', x1: 1480, y1: 140, x2: 1480, y2: 310, cyclePeriod: 3.1, activeDuration: 1.4, phase: 0 },
    { id: '46_fb2', x1: 3720, y1: 550, x2: 3720, y2: 760, cyclePeriod: 3.1, activeDuration: 1.4, phase: 1.0 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('46e01', 'ice_skater', 340, -680, 180, 500),
    makeW4Enemy('46e02', 'frost_wraith', 1200, -440, 1020, 1440),
    makeW4Enemy('46e03', 'icicle_bat', 700, -220, 480, 920),
    makeW4Enemy('46e04', 'blizzard_fairy', 760, 120, 540, 1000),
    makeW4Enemy('46e05', 'mirror_frost', 1480, 310, 1260, 1700),
    makeW4Enemy('46e06', 'cryo_turret', 1140, 560, 1110, 1170),
    makeW4Enemy('46e07', 'frost_wraith', 1020, 560, 920, 1380),
    makeW4Enemy('46e08', 'ice_skater', 1840, 780, 1620, 2060),
    makeW4Enemy('46e09', 'glacier_golem', 2760, 745, 2570, 2970),
    makeW4Enemy('46e10', 'mirror_frost', 3720, 760, 3500, 3940),
    makeW4Enemy('46e11', 'blizzard_fairy', 4280, 635, 4140, 4420),
    makeW4Enemy('46e12', 'permafrost_wyrm', 4320, 710, 4140, 4540),
    makeW4Enemy('46e13', 'cryo_turret', 5540, 780, 5510, 5570),
    makeW4Enemy('46e14', 'ice_skater', 5640, 780, 5340, 5760),
    makeW4Enemy('46e15', 'icicle_bat', 6420, 780, 6260, 6680),
    makeW4Enemy('46e16', 'frost_wraith', 6580, 780, 6260, 6720),
    makeW4Enemy('46e17', 'glacier_golem', 480, -220, 460, 920),
    makeW4Enemy('46e18', 'permafrost_wyrm', 1240, -440, 1020, 1440),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('46o1', 280, -730, 3, 85),
    ...makeW4Orbs('46o2', 640, 65, 3, 105),
    ...makeW4Orbs('46o3', 4680, 660, 5, 110, 15),
    { id: '46_b1', x: 700, y: -275, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '46_b2', x: 4280, y: 585, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '46_b3', x: 6015, y: 690, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  return emptyW4Stage({
    id: '4-6',
    code: '4-6',
    title: '絶対零度の氷柱強制高速降下',
    subtitle: 'Vertical Glacial Chute Plunge (y:-680→+780) & Sub-Zero Sprint (18 Enemies)',
    theme: 'blizzard_gorge',
    verticalDescent: true,
    slippery: true,
    spawn: { x: 120, y: -740 },
    width: 7000,
    goal: { x: 6800, y: 664, w: 54, h: 116 },
    platforms,
    slopes,
    cryoBumpers,
    icePendulums,
    fallingIcicles,
    freezeBeams,
    enemies,
    orbs,
    checkpoints: [
      { x: 120, y: -680 },
      { x: 1180, y: -440 },
      { x: 740, y: 120 },
      { x: 1120, y: 560 },
      { x: 1740, y: 780 },
      { x: 3620, y: 760 },
    ],
    neonSigns: [
      { x: 120, y: -815, w: 235, h: 24, label: 'SUB-ZERO CHUTE PLUNGE', color: '#38bdf8' },
      { x: 1700, y: 625, w: 235, h: 24, label: 'DEEP GLACIAL SKATE RUN', color: '#bae6fd' },
    ],
  });
}

// ============================================================================
// STAGE 4-FORT2: 第二蒼氷要塞・コキュートス冷凍炉心 (14,400px / 20 Enemies + Cocytus Core 15HP)
// W4集大成の要塞：氷鏡・凍結水・崩落足場・ピンボール・振子・凍気地雷を一切出し惜しみせず連結
// ============================================================================
function buildStage4_Fort2(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: '4f2_p1', x: 0, y: 370, w: 460, h: 160, style: 'cryo_metal' },
    { id: '4f2_cr1', x: 600, y: 340, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f2_cr2', x: 880, y: 315, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f2_p2', x: 1160, y: 325, w: 480, h: 205, style: 'cryo_metal' },
    { id: '4f2_p2b', x: 1780, y: 295, w: 480, h: 235, style: 'cryo_metal' },
    { id: '4f2_p3', x: 2400, y: 340, w: 500, h: 190, style: 'cryo_metal' },
    { id: '4f2_up1', x: 2520, y: 215, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f2_p3b', x: 3060, y: 325, w: 480, h: 205, style: 'cryo_metal' },
    { id: '4f2_cr3', x: 3680, y: 300, w: 145, h: 20, style: 'crumble_ice' },

    // Pinball Vault into Reactor Mid Sanctuary (3960..6900)
    { id: '4f2_p4', x: 4620, y: 325, w: 500, h: 205, style: 'cryo_metal' },
    { id: '4f2_p4b', x: 5260, y: 295, w: 460, h: 235, style: 'cryo_metal' },
    { id: '4f2_p5', x: 5860, y: 340, w: 520, h: 190, style: 'cryo_metal' },
    { id: '4f2_up2', x: 5980, y: 215, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f2_p5b', x: 6520, y: 315, w: 440, h: 215, style: 'cryo_metal' },

    // Phase Water Freeze Bridge & Mirror Gate (7080..10200)
    { id: '4f2_fw1', x: 7080, y: 315, w: 560, h: 32, style: 'freeze_water', waterState: 'ice' },
    { id: '4f2_p6', x: 7780, y: 330, w: 520, h: 200, style: 'cryo_metal' },
    { id: '4f2_p6b', x: 8440, y: 305, w: 460, h: 225, style: 'cryo_metal' },
    { id: '4f2_cr4', x: 9040, y: 300, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4f2_p7', x: 9320, y: 340, w: 500, h: 190, style: 'cryo_metal' },
    { id: '4f2_p7b', x: 9960, y: 315, w: 480, h: 215, style: 'cryo_metal' },
    { id: '4f2_p8', x: 10580, y: 330, w: 520, h: 200, style: 'cryo_metal' },
    { id: '4f2_p8b', x: 11240, y: 310, w: 520, h: 220, style: 'cryo_metal' },

    // Boss Arena: Cocytus Core (12160..13180, floorY: 365)
    { id: '4f2_arena', x: 11960, y: 365, w: 2440, h: 165, style: 'cryo_metal' },
    { id: '4f2_ap1', x: 12300, y: 256, w: 160, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4f2_ap2', x: 12880, y: 256, w: 160, h: 16, style: 'ice_floor', oneWay: true },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '4f2_cb1', x: 4060, y: 255, r: 24, launchSpeed: 545 },
    { id: '4f2_cb2', x: 4340, y: 235, r: 24, launchSpeed: 545 },
  ];

  const icePendulums: ScythePendulumDef[] = [
    { id: '4f2_ip1', cx: 2020, cy: 48, length: 215, maxAngle: 0.76, speed: 2.45, phase: 0 },
    { id: '4f2_ip2', cx: 6120, cy: 48, length: 225, maxAngle: 0.78, speed: 2.5, phase: 0.7 },
    { id: '4f2_ip3', cx: 9580, cy: 48, length: 225, maxAngle: 0.78, speed: 2.5, phase: 1.4 },
    { id: '4f2_ip4', cx: 11480, cy: 48, length: 225, maxAngle: 0.78, speed: 2.55, phase: 0.2 },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '4f2_fb1', x1: 3280, y1: 100, x2: 3280, y2: 325, cyclePeriod: 3.0, activeDuration: 1.4, phase: 0 },
    { id: '4f2_fb2', x1: 5480, y1: 95, x2: 5480, y2: 295, cyclePeriod: 3.0, activeDuration: 1.4, phase: 1.2 },
    { id: '4f2_fb3', x1: 8040, y1: 100, x2: 8040, y2: 330, cyclePeriod: 3.0, activeDuration: 1.4, phase: 0.6 },
    { id: '4f2_fb4', x1: 10840, y1: 100, x2: 10840, y2: 330, cyclePeriod: 2.9, activeDuration: 1.4, phase: 1.5 },
  ];

  const frostMines: FrostMineDef[] = [
    { id: '4f2_fm1', x: 300, y: 358, r: 22 },
    { id: '4f2_fm2', x: 2660, y: 328, r: 22 },
    { id: '4f2_fm3', x: 6720, y: 303, r: 22 },
    { id: '4f2_fm4', x: 8660, y: 293, r: 22 },
    { id: '4f2_fm5', x: 11380, y: 298, r: 22 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '4f2_ic1', x: 1420, topY: 45, triggerRange: 110 },
    { id: '4f2_ic2', x: 4860, topY: 45, triggerRange: 110 },
    { id: '4f2_ic3', x: 7880, topY: 45, triggerRange: 110 },
    { id: '4f2_ic4', x: 10180, topY: 45, triggerRange: 110 },
  ];

  const phaseWaterSwitches: PhaseWaterSwitchDef[] = [
    { id: '4f2_pws1', x: 6960, y: 215, r: 17 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('4f2e01', 'glacier_golem', 280, 370, 160, 420),
    makeW4Enemy('4f2e02', 'frost_wraith', 1400, 325, 1200, 1600),
    makeW4Enemy('4f2e03', 'ice_skater', 2000, 295, 1820, 2220),
    makeW4Enemy('4f2e04', 'mirror_frost', 2660, 340, 2440, 2860),
    makeW4Enemy('4f2e05', 'icicle_bat', 2680, 215, 2540, 2820),
    makeW4Enemy('4f2e06', 'cryo_turret', 3300, 325, 3270, 3330),
    makeW4Enemy('4f2e07', 'blizzard_fairy', 4860, 325, 4660, 5080),
    makeW4Enemy('4f2e08', 'permafrost_wyrm', 5480, 295, 5300, 5680),
    makeW4Enemy('4f2e09', 'glacier_golem', 6120, 340, 5900, 6340),
    makeW4Enemy('4f2e10', 'frost_wraith', 6140, 215, 6000, 6280),
    makeW4Enemy('4f2e11', 'ice_skater', 6740, 315, 6560, 6920),
    makeW4Enemy('4f2e12', 'mirror_frost', 7360, 315, 7120, 7600),
    makeW4Enemy('4f2e13', 'blizzard_fairy', 8040, 330, 7820, 8260),
    makeW4Enemy('4f2e14', 'cryo_turret', 8660, 305, 8630, 8690),
    makeW4Enemy('4f2e15', 'glacier_golem', 9560, 340, 9360, 9780),
    makeW4Enemy('4f2e16', 'mirror_frost', 10200, 315, 10000, 10400),
    makeW4Enemy('4f2e17', 'permafrost_wyrm', 10840, 330, 10620, 11060),
    makeW4Enemy('4f2e18', 'frost_wraith', 11480, 310, 11280, 11700),
    makeW4Enemy('4f2e19', 'ice_skater', 11520, 310, 11280, 11720),
    makeW4Enemy('4f2e20', 'icicle_bat', 10180, 315, 10000, 10380),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('4f2o1', 4060, 175, 3, 130),
    ...makeW4Orbs('4f2o2', 7140, 240, 4, 135),
    ...makeW4Orbs('4f2o3', 13380, 315, 5, 54, 0, true, true),
    { id: '4f2_b1', x: 2680, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '4f2_b2', x: 7360, y: 205, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '4f2_b3', x: 12360, y: 205, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const boss: BossDef = {
    kind: 'cocytus_core',
    x: 12960,
    y: 175,
    w: 72,
    h: 68,
    vx: 0,
    vy: 0,
    hp: 15,
    maxHp: 15,
    facing: -1,
    arenaMinX: 12160,
    arenaMaxX: 13180,
    floorY: 365,
    active: false,
    defeated: false,
    state: 'sweep',
    stateTimer: 1.3,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW4Stage({
    id: '4-FORT2',
    code: '4-砦2',
    title: '第二蒼氷要塞・コキュートス冷凍炉心',
    subtitle: 'Sub-Zero Composite Gauntlet & Cocytus Core (20 Enemies / 15HP Boss)',
    theme: 'glacial_fortress',
    width: 14400,
    goal: { x: 14200, y: 249, w: 54, h: 116 },
    platforms,
    cryoBumpers,
    icePendulums,
    freezeBeams,
    frostMines,
    fallingIcicles,
    phaseWaterSwitches,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4680, y: 325 },
      { x: 9380, y: 340 },
      { x: 12020, y: 365 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 235, h: 24, label: 'CRYO COMPOSITE FORTRESS', color: '#38bdf8' },
      { x: 4700, y: 185, w: 235, h: 24, label: 'FREEZE REACTOR CONDUIT', color: '#7dd3fc' },
      { x: 12480, y: 145, w: 235, h: 24, label: 'COCYTUS CORE CHAMBER', color: '#e0f2fe' },
    ],
    boss,
  });
}

// ============================================================================
// STAGE 4-BOSS: 蒼氷王城・終焉の氷帝玉座 (水平 7,800px / 12 Guard Enemies + 氷帝グレイシス 18HP)
// 濃密王城行軍（鏡面跳ね橋→防風崩落橋→バンパー大跳躍→凍気地雷回廊）＋最終立体玉座決戦
// ============================================================================
function buildStage4_Boss(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Act 1: Mirror Gate & Ice Skate Promenade (0..2400)
    { id: '4b_p1', x: 0, y: 370, w: 520, h: 160, style: 'ice_floor' },
    { id: '4b_sh1', x: 640, y: 185, w: 30, h: 85, style: 'cryo_metal' },
    { id: '4b_p1b', x: 600, y: 345, w: 520, h: 185, style: 'cryo_metal' },
    { id: '4b_br1', x: 1160, y: 345, w: 320, h: 20, style: 'holo', switchGroup: 'g4b_1' },
    { id: '4b_p2', x: 1520, y: 330, w: 520, h: 200, style: 'cryo_metal' },
    { id: '4b_hi1', x: 1620, y: 205, w: 320, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4b_p2b', x: 2140, y: 320, w: 360, h: 210, style: 'cryo_metal' },

    // Act 2: Crumble Ice & Blizzard Citadel Bridge (2400..5280)
    { id: '4b_wb1', x: 2260, y: 180, w: 46, h: 140, style: 'cryo_metal', windbreak: true },
    { id: '4b_cr1', x: 2630, y: 305, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4b_cr2', x: 2900, y: 285, w: 145, h: 20, style: 'crumble_ice' },
    { id: '4b_p3', x: 3180, y: 320, w: 500, h: 210, style: 'cryo_metal' },
    { id: '4b_wb2', x: 3480, y: 180, w: 46, h: 140, style: 'cryo_metal', windbreak: true },
    { id: '4b_p3b', x: 3820, y: 300, w: 400, h: 230, style: 'cryo_metal' },
    { id: '4b_p4', x: 4680, y: 335, w: 560, h: 195, style: 'ice_floor' },
    { id: '4b_hi2', x: 4780, y: 210, w: 320, h: 16, style: 'ice_floor', oneWay: true },

    // Act 3: Glacies Throne Arena (arenaMinX: 5480, arenaMaxX: 6600, floorY: 365 -> 7800)
    { id: '4b_arena', x: 5380, y: 365, w: 2420, h: 170, style: 'cryo_metal' },
    { id: '4b_ap1', x: 5640, y: 256, w: 165, h: 16, style: 'ice_floor', oneWay: true },
    { id: '4b_ap2', x: 6280, y: 256, w: 165, h: 16, style: 'ice_floor', oneWay: true },
  ];

  const iceMirrors: IceMirrorDef[] = [
    { id: '4b_im1', x: 960, y: 155, w: 20, h: 98 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: '4b_sw1', x: 750, y: 205, r: 17, group: 'g4b_1', activated: false },
  ];

  const cryoBumpers: CryoBumperDef[] = [
    { id: '4b_cb1', x: 4440, y: 245, r: 24, launchSpeed: 540 },
    { id: '4b_cb2', x: 5980, y: 325, r: 20, launchSpeed: 470 },
  ];

  const cryoGeysers: CryoGeyserDef[] = [
    { id: '4b_cg1', x: 5540, y: 365, w: 56, maxHeight: 205, cyclePeriod: 4.0, activeDuration: 2.3, phase: 0 },
    { id: '4b_cg2', x: 6500, y: 365, w: 56, maxHeight: 205, cyclePeriod: 4.0, activeDuration: 2.3, phase: 2.0 },
  ];

  const icePendulums: ScythePendulumDef[] = [
    { id: '4b_ip1', cx: 1780, cy: 48, length: 215, maxAngle: 0.74, speed: 2.4, phase: 0 },
    { id: '4b_ip2', cx: 3440, cy: 48, length: 215, maxAngle: 0.74, speed: 2.4, phase: 1.1 },
  ];

  const freezeBeams: FreezeBeamDef[] = [
    { id: '4b_fb1', x1: 4020, y1: 100, x2: 4020, y2: 300, cyclePeriod: 3.0, activeDuration: 1.35, phase: 0.3 },
  ];

  const fallingIcicles: FallingIcicleDef[] = [
    { id: '4b_ic1', x: 1640, topY: 45, triggerRange: 110 },
    { id: '4b_ic2', x: 4920, topY: 45, triggerRange: 110 },
  ];

  const frostMines: FrostMineDef[] = [
    { id: '4b_fm1', x: 360, y: 358, r: 22 },
    { id: '4b_fm2', x: 3600, y: 308, r: 22 },
    { id: '4b_fm3', x: 5060, y: 323, r: 22 },
  ];

  const enemies: EnemyDef[] = [
    makeW4Enemy('4be01', 'ice_skater', 300, 370, 160, 480),
    makeW4Enemy('4be02', 'frost_wraith', 840, 345, 680, 1080),
    makeW4Enemy('4be03', 'mirror_frost', 1780, 330, 1560, 2000),
    makeW4Enemy('4be04', 'blizzard_fairy', 1780, 205, 1640, 1920),
    makeW4Enemy('4be05', 'cryo_turret', 2340, 320, 2310, 2370),
    makeW4Enemy('4be06', 'glacier_golem', 3320, 320, 3200, 3460),
    makeW4Enemy('4be07', 'permafrost_wyrm', 3980, 300, 3860, 4180),
    makeW4Enemy('4be08', 'icicle_bat', 4020, 300, 3860, 4180),
    makeW4Enemy('4be09', 'blizzard_fairy', 4940, 210, 4800, 5080),
    makeW4Enemy('4be10', 'mirror_frost', 4880, 335, 4720, 5020),
    makeW4Enemy('4be11', 'cryo_turret', 5140, 335, 5110, 5170),
    makeW4Enemy('4be12', 'ice_skater', 880, 345, 640, 1080),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW4Orbs('4bo1', 1200, 285, 3, 105),
    ...makeW4Orbs('4bo2', 6860, 315, 5, 52, 0, true),
    { id: '4b_b1', x: 4440, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '4b_b2', x: 5720, y: 205, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '4b_b3', x: 6360, y: 205, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const boss: BossDef = {
    kind: 'glacies_emperor',
    x: 6360,
    y: 235,
    w: 70,
    h: 76,
    vx: 0,
    vy: 0,
    hp: 18,
    maxHp: 18,
    facing: -1,
    arenaMinX: 5480,
    arenaMaxX: 6600,
    floorY: 365,
    active: false,
    defeated: false,
    state: 'hover',
    stateTimer: 1.3,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW4Stage({
    id: '4-BOSS',
    code: '4-城',
    title: '蒼氷王城・終焉の氷帝玉座',
    subtitle: 'Grand Citadel March & Absolute-Zero Emperor Glacies (12 Guard Enemies / 18HP Boss)',
    theme: 'frost_spire_citadel',
    blizzardConfig: { cyclePeriod: 6.2, activeDuration: 2.3, windVx: 110 },
    width: 7800,
    goal: { x: 7560, y: 249, w: 54, h: 116 },
    platforms,
    iceMirrors,
    switches,
    cryoBumpers,
    cryoGeysers,
    icePendulums,
    freezeBeams,
    fallingIcicles,
    frostMines,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 3240, y: 320 },
      { x: 5420, y: 365 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 235, h: 24, label: 'ICE MIRROR CITADEL GATE', color: '#38bdf8' },
      { x: 3260, y: 175, w: 235, h: 24, label: 'BLIZZARD GUARD CORRIDOR', color: '#7dd3fc' },
      { x: 5820, y: 135, w: 255, h: 24, label: 'GLACIES EMPEROR THRONE', color: '#e0f2fe' },
    ],
    boss,
  });
}

// ============================================================================
// WORLD 4 ROAMING ENCOUNTERS (Dedicated Frost Titan Mini-Boss, Zero Fortress Reuse)
// ============================================================================
export function buildWorld4EncounterStage(stageId: string): StageDefinition | null {
  const platforms: PlatformDef[] = [
    { id: 'w4enc_floor', x: 0, y: 370, w: 1550, h: 160, style: 'cryo_metal' },
    { id: 'w4enc_l', x: 210, y: 255, w: 160, h: 16, style: 'ice_floor', oneWay: true },
    { id: 'w4enc_m', x: 690, y: 210, w: 170, h: 16, style: 'ice_floor', oneWay: true },
    { id: 'w4enc_r', x: 1160, y: 255, w: 160, h: 16, style: 'ice_floor', oneWay: true },
  ];

  const orbs = makeW4Orbs('w4enc_heal', 1120, 320, 3, 52, 0, true, true);

  const mkBoss = (hp: number): BossDef => ({
    kind: 'frost_titan',
    x: 1080,
    y: 288,
    w: 58,
    h: 72,
    vx: 0,
    vy: 0,
    hp,
    maxHp: hp,
    facing: -1,
    arenaMinX: 110,
    arenaMaxX: 1280,
    floorY: 370,
    active: true,
    defeated: false,
    state: 'idle',
    stateTimer: 1.0,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  });

  switch (stageId) {
    case 'ENC_W4_1':
      return emptyW4Stage({
        id: 'ENC_W4_1',
        code: '迎撃W4',
        title: '蒼氷タイタン強襲戦団',
        subtitle: 'World 4 Roaming Frost Titan Vanguard',
        theme: 'frozen_harbor',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        enemies: [
          makeW4Enemy('ew41_1', 'ice_skater', 480, 370, 220, 860),
          makeW4Enemy('ew41_2', 'frost_wraith', 760, 210, 700, 840),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 230, h: 24, label: 'FROST TITAN VANGUARD', color: '#38bdf8' }],
        boss: mkBoss(9),
      });
    case 'ENC_W4_2':
      return emptyW4Stage({
        id: 'ENC_W4_2',
        code: '迎撃W4',
        title: '鏡面氷晶タイタン防衛隊',
        subtitle: 'World 4 Roaming Cryo Prism Ambush',
        theme: 'cryo_prism_maze',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        cryoBumpers: [{ id: 'w4enc2_cb', x: 775, y: 315, r: 20, launchSpeed: 470 }],
        enemies: [
          makeW4Enemy('ew42_1', 'mirror_frost', 520, 370, 240, 860),
          makeW4Enemy('ew42_2', 'blizzard_fairy', 760, 210, 700, 840),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 230, h: 24, label: 'CRYO MIRROR DUEL', color: '#7dd3fc' }],
        boss: mkBoss(10),
      });
    case 'ENC_W4_3':
      return emptyW4Stage({
        id: 'ENC_W4_3',
        code: '迎撃W4',
        title: '極寒タイタン親衛遊撃隊',
        subtitle: 'World 4 Blizzard Citadel Skirmish',
        theme: 'glacial_fortress',
        width: 1550,
        goal: { x: 1350, y: 254, w: 54, h: 116 },
        platforms,
        fallingIcicles: [{ id: 'w4enc3_ic', x: 775, topY: 45, triggerRange: 105 }],
        enemies: [
          makeW4Enemy('ew43_1', 'glacier_golem', 520, 370, 240, 860),
          makeW4Enemy('ew43_2', 'icicle_bat', 760, 210, 700, 840),
        ],
        orbs,
        neonSigns: [{ x: 460, y: 110, w: 230, h: 24, label: 'BLIZZARD ELITE SQUAD', color: '#bae6fd' }],
        boss: mkBoss(10),
      });
    default:
      return null;
  }
}

export function buildWorld4Stage(stageId: string): StageDefinition | null {
  switch (stageId) {
    case '4-1':
      return buildStage4_1();
    case '4-2':
      return buildStage4_2();
    case '4-3':
      return buildStage4_3();
    case '4-FORT1':
      return buildStage4_Fort1();
    case '4-4':
      return buildStage4_4();
    case '4-5':
      return buildStage4_5();
    case '4-6':
      return buildStage4_6();
    case '4-FORT2':
      return buildStage4_Fort2();
    case '4-BOSS':
      return buildStage4_Boss();
    default:
      return null;
  }
}
