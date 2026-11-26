import { createEnemyDefForKind } from './gameData';
import {
  BloomBridgeDef,
  BossDef,
  EnemyDef,
  EnemyKind,
  FloatBubbleDef,
  ManaOrbDef,
  MovingPlatformDef,
  PendulumVineDef,
  PlatformDef,
  ScythePendulumDef,
  SlopeDef,
  SnapTrapDef,
  SporeCatapultDef,
  SporeJetDef,
  StageDefinition,
} from './types';

function makeW3Enemy(
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

function makeW3Orbs(
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

function emptyW3Stage(
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
// STAGE 3-1: 翠緑の摩天楼キャノピー (14,200px / 8区間 / 敵24体 / W3純新ギミック)
// ============================================================================
function buildStage3_1(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Canopy Gate + Bounce Step
    { id: '31_p1', x: 0, y: 370, w: 660, h: 160, style: 'jade' },
    { id: '31_bn1', x: 700, y: 360, w: 115, h: 18, style: 'emerald_bounce', bouncy: true },
    { id: '31_p2', x: 890, y: 240, w: 580, h: 28, style: 'vine_deck' },
    { id: '31_p2b', x: 1550, y: 325, w: 480, h: 205, style: 'jade' },

    // Sec 2: Dual Pendulum Vine Chasm
    { id: '31_p3', x: 2820, y: 335, w: 660, h: 195, style: 'jade' },
    { id: '31_up1', x: 2980, y: 225, w: 280, h: 16, style: 'vine_deck', oneWay: true },

    // Sec 3: Forward Sap Stream Conveyor Decks
    { id: '31_sap1', x: 3620, y: 345, w: 720, h: 28, style: 'sap_stream', streamVx: 135 },
    { id: '31_p4', x: 4460, y: 330, w: 680, h: 200, style: 'jade' },

    // Sec 4: Spore Catapult High-Tier Canopy
    { id: '31_p5', x: 5260, y: 350, w: 460, h: 180, style: 'jade' },
    { id: '31_hi1', x: 5880, y: 210, w: 640, h: 28, style: 'vine_deck' },
    { id: '31_p6', x: 6640, y: 320, w: 580, h: 210, style: 'jade' },

    // Sec 5: Reverse Sap Current Battle Deck
    { id: '31_sap2', x: 7340, y: 340, w: 760, h: 28, style: 'sap_stream', streamVx: -115 },
    { id: '31_p7', x: 8220, y: 320, w: 720, h: 210, style: 'jade' },

    // Sec 6: Float Bubble Crossing
    { id: '31_p8', x: 9940, y: 330, w: 680, h: 200, style: 'jade' },

    // Sec 7: Emerald Downhill Slope + Canopy Vine Launch
    { id: '31_p9', x: 11260, y: 365, w: 680, h: 165, style: 'jade' },

    // Sec 8: Hydra Finale & Stepped Goal Terrace
    { id: '31_p10a', x: 12660, y: 340, w: 620, h: 190, style: 'jade' },
    { id: '31_bn_end', x: 13360, y: 350, w: 110, h: 18, style: 'emerald_bounce', bouncy: true },
    { id: '31_p10b', x: 13540, y: 310, w: 660, h: 220, style: 'jade' },
    { id: '31_up2', x: 13040, y: 225, w: 280, h: 16, style: 'vine_deck', oneWay: true },
  ];

  const slopes: SlopeDef[] = [
    { id: '31_sl1', x1: 10620, y1: 300, x2: 11260, y2: 365, bottomY: 530 },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '31_pv1', cx: 2220, cy: 75, length: 165, maxAngle: 0.72, speed: 2.25, phase: 0 },
    { id: '31_pv2', cx: 2560, cy: 70, length: 165, maxAngle: 0.72, speed: 2.25, phase: 1.5 },
    { id: '31_pv3', cx: 12160, cy: 72, length: 165, maxAngle: 0.76, speed: 2.35, phase: 0.4 },
    { id: '31_pv4', cx: 12440, cy: 76, length: 160, maxAngle: 0.74, speed: 2.35, phase: 2.1 },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '31_fb1', x: 9120, y: 315, r: 25, ampX: 0, ampY: 16, speed: 1.6, phase: 0 },
    { id: '31_fb2', x: 9360, y: 280, r: 25, ampX: 0, ampY: 18, speed: 1.7, phase: 1.0 },
    { id: '31_fb3', x: 9600, y: 255, r: 25, ampX: 16, ampY: 14, speed: 1.7, phase: 2.0 },
    { id: '31_fb4', x: 9790, y: 295, r: 25, ampX: 0, ampY: 16, speed: 1.6, phase: 2.8 },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '31_cat1', x: 5610, y: 332, w: 46, h: 18, launchVx: 430, launchVy: -620 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('31e01', 'emerald_mantis', 340, 370, 140, 620),
    makeW3Enemy('31e02', 'prism_spore', 1120, 240, 920, 1420),
    makeW3Enemy('31e03', 'emerald_mantis', 1760, 325, 1580, 1990),
    makeW3Enemy('31e04', 'jade_sniper', 3120, 225, 2900, 3400),
    makeW3Enemy('31e05', 'prism_spore', 3920, 345, 3660, 4300),
    makeW3Enemy('31e06', 'bio_hydra', 4740, 330, 4500, 5080),
    makeW3Enemy('31e07', 'jade_sniper', 4940, 330, 4560, 5120),
    makeW3Enemy('31e08', 'emerald_mantis', 5460, 350, 5290, 5620),
    makeW3Enemy('31e09', 'chrono_vine', 6220, 210, 6200, 6240),
    makeW3Enemy('31e10', 'thorn_weaver', 6880, 320, 6680, 7180),
    makeW3Enemy('31e11', 'golem_knight', 7840, 340, 7420, 7980),
    makeW3Enemy('31e12', 'emerald_mantis', 8460, 320, 8250, 8880),
    makeW3Enemy('31e13', 'jade_sniper', 8740, 320, 8300, 8920),
    makeW3Enemy('31e14', 'prism_spore', 10220, 330, 9980, 10580),
    makeW3Enemy('31e15', 'emerald_mantis', 11520, 365, 11300, 11880),
    makeW3Enemy('31e16', 'bio_hydra', 12960, 340, 12700, 13220),
    makeW3Enemy('31e17', 'thorn_weaver', 13780, 310, 13580, 13940),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('31o1', 740, 185, 3, 45),
    ...makeW3Orbs('31o2', 2220, 200, 4, 110),
    ...makeW3Orbs('31o3', 3760, 295, 5, 100),
    ...makeW3Orbs('31o4', 9120, 230, 4, 220),
    ...makeW3Orbs('31o5', 10740, 255, 5, 90, 14),
    { id: '31_b1', x: 3120, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '31_b2', x: 6360, y: 160, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '31_b3', x: 13180, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const windRings = [
    { id: '31_wr1', x: 2390, y: 175, r: 22, launchVx: 430, launchVy: -240 },
    { id: '31_wr2', x: 5800, y: 185, r: 22, launchVx: 440, launchVy: -240 },
    { id: '31_wr3', x: 9480, y: 185, r: 22, launchVx: 450, launchVy: -240 },
    { id: '31_wr4', x: 12300, y: 185, r: 22, launchVx: 450, launchVy: -250 },
  ];

  return emptyW3Stage({
    id: '3-1',
    code: '3-1',
    title: '翠緑の摩天楼キャノピー',
    subtitle: 'Emerald Aero Rings, Pendulum Vines & Sap Streams (17 Enemies)',
    theme: 'emerald_canopy',
    width: 14200,
    goal: { x: 14000, y: 194, w: 54, h: 116 },
    platforms,
    slopes,
    pendulumVines,
    floatBubbles,
    sporeCatapults,
    windRings,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4520, y: 330 },
      { x: 9980, y: 330 },
    ],
    neonSigns: [
      { x: 100, y: 195, w: 220, h: 24, label: 'EMERALD AERO RINGS', color: '#34d399' },
      { x: 4500, y: 185, w: 220, h: 24, label: 'SPORE CATAPULT GROVE', color: '#10b981' },
      { x: 10000, y: 185, w: 220, h: 24, label: 'SAP RAPIDS DESCENT', color: '#6ee7b7' },
    ],
  });
}

// ============================================================================
// STAGE 3-2: 翡翠の胞子バブルと開花橋の渓谷 (14,400px / 8区間 / 敵24体)
// ============================================================================
function buildStage3_2(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Entry + Bubble Valley
    { id: '32_p1', x: 0, y: 370, w: 620, h: 160, style: 'jade' },
    { id: '32_p2', x: 1280, y: 335, w: 620, h: 195, style: 'jade' },

    // Sec 2: First Bloom Bridge + Snap Jaw Terrace
    { id: '32_p3', x: 2340, y: 325, w: 680, h: 205, style: 'jade' },

    // Sec 3: Sap Current + Catapult Leap
    { id: '32_sap1', x: 3160, y: 345, w: 640, h: 28, style: 'sap_stream', streamVx: 140 },
    { id: '32_p4', x: 4040, y: 245, w: 800, h: 285, style: 'jade' },

    // Sec 4: Twin Bloom Bridge Canyon + Sniper Crossfire
    { id: '32_p5', x: 5620, y: 330, w: 680, h: 200, style: 'jade' },
    { id: '32_hi1', x: 5760, y: 220, w: 320, h: 16, style: 'vine_deck', oneWay: true },

    // Sec 5: Pendulum Vine & Snap Trap Gorge
    { id: '32_p6', x: 7160, y: 340, w: 720, h: 190, style: 'jade' },

    // Sec 6: Vertical Bubble Steps + Moving Vine Lift
    { id: '32_p7', x: 8740, y: 295, w: 660, h: 235, style: 'jade' },

    // Sec 7: Reverse Sap Runway + Bloom Bridge
    { id: '32_sap2', x: 9540, y: 335, w: 740, h: 28, style: 'sap_stream', streamVx: -120 },
    { id: '32_p8', x: 10940, y: 320, w: 640, h: 210, style: 'jade' },

    // Sec 8: Catapult Final Ascent & Stepped Goal Terrace
    { id: '32_p9', x: 11920, y: 255, w: 760, h: 28, style: 'vine_deck' },
    { id: '32_p10a', x: 13260, y: 340, w: 540, h: 190, style: 'jade' },
    { id: '32_p10b', x: 13900, y: 310, w: 500, h: 220, style: 'jade' },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: '32_mp1', x: 8420, y: 280, w: 130, h: 16, startX: 8360, startY: 320, endX: 8580, endY: 235, speed: 1.75, phase: 0, vx: 0, vy: 0, prevX: 8420, prevY: 280 },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '32_fb1', x: 760, y: 335, r: 24, ampX: 0, ampY: 16, speed: 1.7, phase: 0 },
    { id: '32_fb2', x: 960, y: 295, r: 24, ampX: 0, ampY: 16, speed: 1.8, phase: 1.1 },
    { id: '32_fb3', x: 1140, y: 325, r: 24, ampX: 0, ampY: 14, speed: 1.7, phase: 2.0 },
    { id: '32_fb4', x: 8040, y: 300, r: 24, ampX: 16, ampY: 16, speed: 1.75, phase: 0.4 },
    { id: '32_fb5', x: 8240, y: 255, r: 24, ampX: 0, ampY: 18, speed: 1.75, phase: 1.6 },
    { id: '32_fb6', x: 12840, y: 285, r: 25, ampX: 0, ampY: 16, speed: 1.7, phase: 0.3 },
    { id: '32_fb7', x: 13060, y: 315, r: 25, ampX: 0, ampY: 16, speed: 1.7, phase: 1.4 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '32_bb1', triggerX: 1860, triggerY: 270, bridgeX: 1960, bridgeY: 330, bridgeW: 320, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '32_bb2', triggerX: 4800, triggerY: 205, bridgeX: 4920, bridgeY: 275, bridgeW: 260, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '32_bb3', triggerX: 5220, triggerY: 235, bridgeX: 5270, bridgeY: 305, bridgeW: 270, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '32_bb4', triggerX: 10240, triggerY: 280, bridgeX: 10350, bridgeY: 330, bridgeW: 510, bridgeH: 18, duration: 6.0, timer: 0, active: false },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '32_pv1', cx: 6540, cy: 74, length: 165, maxAngle: 0.75, speed: 2.3, phase: 0.2 },
    { id: '32_pv2', cx: 6880, cy: 76, length: 165, maxAngle: 0.75, speed: 2.3, phase: 1.8 },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '32_cat1', x: 3730, y: 327, w: 46, h: 18, launchVx: 480, launchVy: -630 },
    { id: '32_cat2', x: 11500, y: 302, w: 46, h: 18, launchVx: 490, launchVy: -640 },
  ];

  const snapTraps: SnapTrapDef[] = [
    { id: '32_st1', x: 2560, y: 305, w: 38, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0 },
    { id: '32_st2', x: 5860, y: 310, w: 38, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 1.1 },
    { id: '32_st3', x: 7480, y: 320, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 0.6 },
    { id: '32_st4', x: 9880, y: 315, w: 38, h: 20, cyclePeriod: 2.9, snapDuration: 0.52, phase: 1.4 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('32e01', 'thorn_weaver', 420, 370, 180, 580),
    makeW3Enemy('32e02', 'jade_sniper', 1540, 335, 1320, 1840),
    makeW3Enemy('32e03', 'bio_hydra', 2860, 325, 2440, 2980),
    makeW3Enemy('32e04', 'emerald_mantis', 3420, 345, 3200, 3720),
    makeW3Enemy('32e05', 'thorn_weaver', 4460, 245, 4260, 4780),
    makeW3Enemy('32e06', 'jade_sniper', 4680, 245, 4300, 4800),
    makeW3Enemy('32e07', 'stealth_ninja', 5880, 220, 5780, 6060),
    makeW3Enemy('32e08', 'emerald_mantis', 6060, 330, 5660, 6260),
    makeW3Enemy('32e09', 'prism_spore', 7360, 340, 7200, 7820),
    makeW3Enemy('32e10', 'chrono_vine', 7680, 340, 7660, 7700),
    makeW3Enemy('32e11', 'thorn_weaver', 8980, 295, 8780, 9360),
    makeW3Enemy('32e12', 'golem_knight', 9760, 335, 9580, 10200),
    makeW3Enemy('32e13', 'emerald_mantis', 11160, 320, 10980, 11480),
    makeW3Enemy('32e14', 'bio_hydra', 12360, 255, 12160, 12640),
    makeW3Enemy('32e15', 'jade_sniper', 12520, 255, 12180, 12640),
    makeW3Enemy('32e16', 'emerald_mantis', 13480, 340, 13300, 13740),
    makeW3Enemy('32e17', 'bio_hydra', 14040, 310, 13920, 14140),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('32o1', 760, 270, 3, 190),
    ...makeW3Orbs('32o2', 2020, 280, 3, 95),
    ...makeW3Orbs('32o3', 4980, 225, 4, 135),
    ...makeW3Orbs('32o4', 10440, 275, 4, 110),
    { id: '32_b1', x: 5900, y: 170, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '32_b2', x: 8240, y: 195, r: 10, collected: false, value: 300, bonus: true, phase: 1.2 },
    { id: '32_b3', x: 12400, y: 195, r: 10, collected: false, value: 300, bonus: true, phase: 2.1 },
  ];

  const pollenPods = [
    { id: '32_pp1', x: 1640, y: 270, r: 16 },
    { id: '32_pp2', x: 2800, y: 265, r: 16 },
    { id: '32_pp3', x: 5980, y: 270, r: 16 },
    { id: '32_pp4', x: 9900, y: 275, r: 16 },
    { id: '32_pp5', x: 13840, y: 260, r: 16 },
  ];

  return emptyW3Stage({
    id: '3-2',
    code: '3-2',
    title: '翡翠の胞子バブルと開花橋の渓谷',
    subtitle: 'Resonant Pollen Pods, Float Bubbles & Bloom Bridges (17 Enemies)',
    theme: 'emerald_canopy',
    width: 14400,
    goal: { x: 14200, y: 194, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    floatBubbles,
    bloomBridges,
    pendulumVines,
    sporeCatapults,
    snapTraps,
    pollenPods,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4280, y: 245 },
      { x: 9600, y: 335 },
    ],
    neonSigns: [
      { x: 105, y: 195, w: 220, h: 24, label: 'RESONANT POLLEN PODS', color: '#34d399' },
      { x: 4280, y: 135, w: 230, h: 24, label: 'SHOOT BUDS TO BLOOM!', color: '#6ee7b7' },
      { x: 9600, y: 185, w: 220, h: 24, label: 'SAP STREAM OVERPASS', color: '#10b981' },
    ],
  });
}

// ============================================================================
// STAGE 3-3: 魔導植物園の樹液大温室 (14,600px / 8区間 / 敵25体)
// ============================================================================
function buildStage3_3(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Conservatory Entry & Jet Rhythm
    { id: '33_p1', x: 0, y: 370, w: 860, h: 160, style: 'jade' },
    { id: '33_p2', x: 980, y: 325, w: 720, h: 205, style: 'jade' },

    // Sec 2: Upward Catapult to Conservatory Upper Walkway
    { id: '33_hi1', x: 1980, y: 205, w: 640, h: 28, style: 'vine_deck' },
    { id: '33_p3', x: 2740, y: 310, w: 720, h: 220, style: 'jade' },

    // Sec 3: Bloom Bridge + Pendulum Vine Dome
    { id: '33_p4', x: 4680, y: 335, w: 740, h: 195, style: 'jade' },

    // Sec 4: Alternating Sap Currents + Horizontal Spore Jets
    { id: '33_sap1', x: 5540, y: 345, w: 680, h: 28, style: 'sap_stream', streamVx: 145 },
    { id: '33_sap2', x: 6340, y: 335, w: 680, h: 28, style: 'sap_stream', streamVx: -115 },

    // Sec 5: Float Bubble Conservatory Chasm + Star Weaver Sky
    { id: '33_p5', x: 8040, y: 315, w: 720, h: 215, style: 'jade' },

    // Sec 6: Snap Trap Nursery + Two-Tier Bloom Bridge
    { id: '33_p6', x: 8880, y: 340, w: 760, h: 190, style: 'jade' },
    { id: '33_p7', x: 10240, y: 290, w: 680, h: 240, style: 'jade' },

    // Sec 7: Long Slope Downhill + Catapult Vault
    { id: '33_p8', x: 11660, y: 365, w: 720, h: 165, style: 'jade' },

    // Sec 8: Double Hydra Greenhouse Gate (smooth autoScroll steps) + Secret Canopy Roof
    { id: '33_p9a', x: 12700, y: 335, w: 680, h: 195, style: 'jade' },
    { id: '33_p9b', x: 13470, y: 295, w: 480, h: 235, style: 'jade' },
    { id: '33_p9c', x: 14040, y: 335, w: 560, h: 195, style: 'jade' },
    { id: '33_up2', x: 13520, y: 185, w: 320, h: 16, style: 'vine_deck', oneWay: true },
    { id: '33_sec_step', x: 13880, y: 155, w: 120, h: 16, style: 'vine_deck', oneWay: true },
    { id: '33_sec_roof', x: 14040, y: 135, w: 440, h: 18, style: 'vine_deck', oneWay: true },
  ];

  const slopes: SlopeDef[] = [
    { id: '33_sl1', x1: 10920, y1: 290, x2: 11660, y2: 365, bottomY: 530 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '33_sj1', x: 540, y: 370, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.95, phase: 0 },
    { id: '33_sj2', x: 1320, y: 325, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.95, phase: 1.4 },
    { id: '33_sj3', x: 5060, y: 205, dir: 'down', range: 120, cyclePeriod: 3.1, activeDuration: 0.95, phase: 0.6 },
    { id: '33_sj4', x: 6680, y: 335, dir: 'up', range: 120, cyclePeriod: 2.9, activeDuration: 0.9, phase: 0.3 },
    { id: '33_sj5', x: 9240, y: 340, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.95, phase: 1.1 },
    { id: '33_sj6', x: 13280, y: 335, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.95, phase: 0.7 },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '33_cat1', x: 1630, y: 307, w: 46, h: 18, launchVx: 440, launchVy: -620 },
    { id: '33_cat2', x: 12300, y: 347, w: 46, h: 18, launchVx: 480, launchVy: -600 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '33_bb1', triggerX: 3380, triggerY: 255, bridgeX: 3500, bridgeY: 315, bridgeW: 340, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '33_bb2', triggerX: 9560, triggerY: 280, bridgeX: 9680, bridgeY: 320, bridgeW: 480, bridgeH: 18, duration: 5.8, timer: 0, active: false },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '33_pv1', cx: 4040, cy: 70, length: 165, maxAngle: 0.74, speed: 2.3, phase: 0 },
    { id: '33_pv2', cx: 4400, cy: 74, length: 165, maxAngle: 0.74, speed: 2.3, phase: 1.6 },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '33_fb1', x: 7200, y: 310, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0 },
    { id: '33_fb2', x: 7440, y: 270, r: 24, ampX: 0, ampY: 18, speed: 1.75, phase: 1.0 },
    { id: '33_fb3', x: 7680, y: 245, r: 24, ampX: 16, ampY: 14, speed: 1.8, phase: 1.9 },
    { id: '33_fb4', x: 7870, y: 290, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 2.7 },
  ];

  const snapTraps: SnapTrapDef[] = [
    { id: '33_st1', x: 2960, y: 290, w: 38, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0 },
    { id: '33_st2', x: 5860, y: 325, w: 38, h: 20, cyclePeriod: 2.9, snapDuration: 0.52, phase: 0.8 },
    { id: '33_st3', x: 8360, y: 295, w: 38, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 0.4 },
    { id: '33_st4', x: 11920, y: 345, w: 40, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 1.2 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('33e01', 'emerald_mantis', 340, 370, 140, 820),
    makeW3Enemy('33e02', 'prism_spore', 1160, 325, 1000, 1620),
    makeW3Enemy('33e03', 'chrono_vine', 1520, 325, 1500, 1540),
    makeW3Enemy('33e04', 'jade_sniper', 2280, 205, 2020, 2580),
    makeW3Enemy('33e05', 'emerald_mantis', 3180, 310, 2780, 3420),
    makeW3Enemy('33e06', 'bio_hydra', 4880, 335, 4720, 5360),
    makeW3Enemy('33e07', 'star_weaver', 5240, 335, 4800, 5400),
    makeW3Enemy('33e08', 'emerald_mantis', 5760, 345, 5580, 6160),
    makeW3Enemy('33e09', 'prism_spore', 6540, 335, 6380, 6960),
    makeW3Enemy('33e10', 'chrono_vine', 8220, 315, 8200, 8240),
    makeW3Enemy('33e11', 'bio_hydra', 8560, 315, 8100, 8720),
    makeW3Enemy('33e12', 'emerald_mantis', 9060, 340, 8920, 9560),
    makeW3Enemy('33e13', 'star_weaver', 10520, 290, 10280, 10860),
    makeW3Enemy('33e14', 'golem_knight', 11840, 365, 11700, 12260),
    makeW3Enemy('33e15', 'jade_sniper', 12140, 365, 11740, 12300),
    makeW3Enemy('33e16', 'bio_hydra', 13060, 335, 12780, 13320),
    makeW3Enemy('33e17', 'thorn_weaver', 13680, 185, 13540, 13820),
    makeW3Enemy('33e18', 'bio_hydra', 14220, 335, 14070, 14360),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('33o1', 3560, 265, 3, 95),
    ...makeW3Orbs('33o2', 7200, 225, 4, 210),
    ...makeW3Orbs('33o3', 11040, 240, 5, 110, 14),
    { id: '33_b1', x: 2300, y: 155, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '33_b2', x: 5220, y: 265, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '33_b3', x: 13680, y: 135, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const lotusPads = [
    { id: '33_lp1', x: 2600, y: 250, w: 120, h: 16, maxSink: 24 },
    { id: '33_lp2', x: 4220, y: 295, w: 120, h: 16, maxSink: 24 },
    { id: '33_lp3', x: 7520, y: 290, w: 120, h: 16, maxSink: 24 },
    { id: '33_lp4', x: 11480, y: 335, w: 120, h: 16, maxSink: 24 },
    { id: '33_lp5', x: 12520, y: 310, w: 120, h: 16, maxSink: 24 },
  ];

  const slipstreamGates = [
    { id: '33_sg1', x: 760, y: 270, h: 100 },
    { id: '33_sg2', x: 5400, y: 245, h: 100 },
    { id: '33_sg3', x: 8560, y: 215, h: 100 },
    { id: '33_sg4', x: 12120, y: 265, h: 100 },
  ];

  // Ensure smooth autoScroll continuity over catapult/chasm sections
  platforms.push(
    { id: '33_bridgeA', x: 3860, y: 315, w: 320, h: 24, style: 'vine_deck' },
    { id: '33_bridgeB', x: 7060, y: 315, w: 120, h: 20, style: 'emerald_bounce', bouncy: true }
  );

  return emptyW3Stage({
    id: '3-3',
    code: '3-3',
    title: '樹液激流・大温室エクスプレス',
    subtitle: 'W3 Auto-Scroll Conservatory, Sinking Lotus & Sap Rapids (18 Enemies)',
    theme: 'emerald_canopy',
    autoScrollSpeed: 168,
    scrollCrush: true,
    width: 14600,
    goal: { x: 14400, y: 219, w: 54, h: 116 },
    secretGoal: { x: 14380, y: 19, w: 54, h: 116 },
    platforms,
    slopes,
    sporeJets,
    sporeCatapults,
    bloomBridges,
    pendulumVines,
    floatBubbles,
    snapTraps,
    lotusPads,
    slipstreamGates,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4720, y: 335 },
      { x: 10280, y: 290 },
    ],
    neonSigns: [
      { x: 100, y: 195, w: 245, h: 24, label: 'SAP EXPRESS AUTO-SCROLL', color: '#34d399' },
      { x: 4720, y: 190, w: 230, h: 24, label: 'SINKING LOTUS BASINS', color: '#10b981' },
      { x: 10300, y: 170, w: 230, h: 24, label: 'VERDANT FORTRESS GATE', color: '#6ee7b7' },
    ],
  });
}

// ============================================================================
// STAGE 3-FORT1: 第一翠玉要塞・茨と翠鎌の関門 (14,000px / 敵21体 / ヴァーダント・ワーデン)
// ============================================================================
function buildStage3_Fort1(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Scythe Bastion Entry
    { id: '3f1_p1', x: 0, y: 370, w: 860, h: 160, style: 'fortress' },
    { id: '3f1_p2', x: 1000, y: 330, w: 720, h: 200, style: 'fortress' },

    // Sec 2: Twin Scythes & Snap Jaws Corridor
    { id: '3f1_p3', x: 1860, y: 340, w: 860, h: 190, style: 'fortress' },
    { id: '3f1_up1', x: 2140, y: 225, w: 280, h: 16, style: 'vine_deck', oneWay: true },

    // Sec 3: Bloom Bridge Abyss + Horizontal Jets
    { id: '3f1_p4', x: 3560, y: 325, w: 740, h: 205, style: 'fortress' },

    // Sec 4: Bubble & Scythe Pit
    { id: '3f1_p5', x: 5280, y: 335, w: 780, h: 195, style: 'fortress' },

    // Sec 5: Reverse Sap Gauntlet + Spore Jets
    { id: '3f1_sap1', x: 6180, y: 345, w: 760, h: 28, style: 'sap_stream', streamVx: -115 },
    { id: '3f1_p6', x: 7060, y: 315, w: 720, h: 215, style: 'fortress' },

    // Sec 6: Catapult Vault + Pendulum Vine Overpass
    { id: '3f1_hi1', x: 8060, y: 215, w: 600, h: 28, style: 'vine_deck' },
    { id: '3f1_p7', x: 9440, y: 330, w: 740, h: 200, style: 'fortress' },

    // Sec 7: Double Scythe Bastion Gate
    { id: '3f1_p8', x: 10320, y: 345, w: 880, h: 185, style: 'fortress' },
    { id: '3f1_p9', x: 11340, y: 345, w: 740, h: 185, style: 'fortress' },

    // Sec 8: Verdant Warden Arena (12220..13180) + Goal Deck
    { id: '3f1_arena', x: 12180, y: 365, w: 1820, h: 165, style: 'fortress' },
    { id: '3f1_ap1', x: 12360, y: 266, w: 140, h: 16, style: 'vine_deck', oneWay: true },
    { id: '3f1_ap2', x: 12900, y: 266, w: 140, h: 16, style: 'vine_deck', oneWay: true },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '3f1_sc1', cx: 640, cy: 50, length: 245, maxAngle: 0.72, speed: 2.35, phase: 0 },
    { id: '3f1_sc2', cx: 2140, cy: 50, length: 225, maxAngle: 0.75, speed: 2.45, phase: 0.8 },
    { id: '3f1_sc3', cx: 2460, cy: 50, length: 225, maxAngle: 0.75, speed: 2.45, phase: 2.3 },
    { id: '3f1_sc4', cx: 4780, cy: 50, length: 210, maxAngle: 0.78, speed: 2.4, phase: 0.3 },
    { id: '3f1_sc5', cx: 10640, cy: 50, length: 225, maxAngle: 0.78, speed: 2.55, phase: 0 },
    { id: '3f1_sc6', cx: 10940, cy: 50, length: 225, maxAngle: 0.78, speed: 2.55, phase: 1.5 },
  ];

  const snapTraps: SnapTrapDef[] = [
    { id: '3f1_st1', x: 1320, y: 310, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 0 },
    { id: '3f1_st2', x: 5620, y: 315, w: 40, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0.9 },
    { id: '3f1_st3', x: 6460, y: 325, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 0.4 },
    { id: '3f1_st4', x: 11660, y: 325, w: 40, h: 20, cyclePeriod: 2.6, snapDuration: 0.52, phase: 1.2 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '3f1_sj1', x: 3920, y: 325, dir: 'up', range: 130, cyclePeriod: 2.9, activeDuration: 0.95, phase: 0.2 },
    { id: '3f1_sj2', x: 6760, y: 345, dir: 'up', range: 130, cyclePeriod: 2.9, activeDuration: 0.95, phase: 1.3 },
    { id: '3f1_sj3', x: 9800, y: 330, dir: 'up', range: 130, cyclePeriod: 3.0, activeDuration: 0.95, phase: 0.5 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '3f1_bb1', triggerX: 2680, triggerY: 280, bridgeX: 2790, bridgeY: 325, bridgeW: 320, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '3f1_bb2', triggerX: 3060, triggerY: 270, bridgeX: 3180, bridgeY: 325, bridgeW: 310, bridgeH: 18, duration: 5.5, timer: 0, active: false },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '3f1_fb1', x: 4460, y: 305, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0 },
    { id: '3f1_fb2', x: 4700, y: 275, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 1.1 },
    { id: '3f1_fb3', x: 4940, y: 290, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 2.1 },
    { id: '3f1_fb4', x: 5120, y: 315, r: 24, ampX: 0, ampY: 14, speed: 1.75, phase: 2.8 },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '3f1_cat1', x: 7700, y: 297, w: 46, h: 18, launchVx: 360, launchVy: -615 },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '3f1_pv1', cx: 8880, cy: 70, length: 165, maxAngle: 0.74, speed: 2.35, phase: 0 },
    { id: '3f1_pv2', cx: 9200, cy: 74, length: 165, maxAngle: 0.74, speed: 2.35, phase: 1.5 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('3f1e01', 'emerald_mantis', 360, 370, 140, 820),
    makeW3Enemy('3f1e02', 'rune_sentinel', 1180, 330, 1030, 1660),
    makeW3Enemy('3f1e03', 'emerald_mantis', 2040, 340, 1900, 2680),
    makeW3Enemy('3f1e04', 'phantom_knight', 2360, 225, 2160, 2400),
    makeW3Enemy('3f1e05', 'bio_hydra', 3760, 325, 3600, 4240),
    makeW3Enemy('3f1e06', 'emerald_mantis', 5440, 335, 5320, 6000),
    makeW3Enemy('3f1e07', 'jade_sniper', 5840, 335, 5360, 6020),
    makeW3Enemy('3f1e08', 'phantom_knight', 6680, 345, 6240, 6900),
    makeW3Enemy('3f1e09', 'bio_hydra', 7300, 315, 7100, 7660),
    makeW3Enemy('3f1e10', 'thorn_weaver', 8280, 215, 8100, 8620),
    makeW3Enemy('3f1e11', 'rune_sentinel', 9640, 330, 9480, 10120),
    makeW3Enemy('3f1e12', 'bio_hydra', 10540, 345, 10360, 11140),
    makeW3Enemy('3f1e13', 'phantom_knight', 11040, 345, 10420, 11180),
    makeW3Enemy('3f1e14', 'emerald_mantis', 11520, 345, 11380, 12020),
    makeW3Enemy('3f1e15', 'jade_sniper', 11880, 345, 11420, 12040),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('3f1o1', 2840, 275, 4, 140),
    ...makeW3Orbs('3f1o2', 4460, 220, 4, 210),
    ...makeW3Orbs('3f1o3', 13360, 315, 5, 52, 0, true),
    { id: '3f1_b1', x: 2280, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '3f1_b2', x: 8360, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '3f1_b3', x: 11820, y: 295, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const thornPistons = [
    { id: '3f1_tp1', x: 1420, baseY: 85, w: 46, maxDrop: 210, cyclePeriod: 2.8, phase: 0 },
    { id: '3f1_tp2', x: 3820, baseY: 85, w: 46, maxDrop: 205, cyclePeriod: 2.7, phase: 0.9 },
    { id: '3f1_tp3', x: 5760, baseY: 85, w: 46, maxDrop: 215, cyclePeriod: 2.8, phase: 0.4 },
    { id: '3f1_tp4', x: 7420, baseY: 85, w: 46, maxDrop: 195, cyclePeriod: 2.7, phase: 1.3 },
    { id: '3f1_tp5', x: 11720, baseY: 85, w: 46, maxDrop: 220, cyclePeriod: 2.7, phase: 0.6 },
  ];

  const boss: BossDef = {
    kind: 'verdant_warden',
    x: 12940,
    y: 291,
    w: 64,
    h: 74,
    vx: 0,
    vy: 0,
    hp: 11,
    maxHp: 11,
    facing: -1,
    arenaMinX: 12220,
    arenaMaxX: 13180,
    floorY: 365,
    active: false,
    defeated: false,
    state: 'patrol',
    stateTimer: 1.2,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW3Stage({
    id: '3-FORT1',
    code: '3-砦1',
    title: '第一翠玉要塞・茨と翠鎌の関門',
    subtitle: 'Thorn Pistons, Scythe Pendulums & Verdant Warden (15 Enemies)',
    theme: 'verdant_fortress',
    width: 14000,
    goal: { x: 13800, y: 249, w: 54, h: 116 },
    platforms,
    scythePendulums,
    snapTraps,
    sporeJets,
    bloomBridges,
    floatBubbles,
    sporeCatapults,
    pendulumVines,
    thornPistons,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 3620, y: 325 },
      { x: 7120, y: 315 },
      { x: 11420, y: 345 },
    ],
    neonSigns: [
      { x: 110, y: 190, w: 230, h: 24, label: 'THORN PISTON CRUSHER', color: '#34d399' },
      { x: 3620, y: 180, w: 230, h: 24, label: 'SNAP JAW CORRIDOR', color: '#10b981' },
      { x: 11440, y: 185, w: 230, h: 24, label: 'WARDEN CHAMBER AHEAD', color: '#6ee7b7' },
    ],
    boss,
  });
}

// ============================================================================
// STAGE 3-4: 翡翠地下樹海・蛍光の胞子洞窟 (14,200px / 暗闇 / 敵24体)
// ============================================================================
function buildStage3_4(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Lantern Sap Entry
    { id: '34_p1', x: 0, y: 370, w: 640, h: 160, style: 'jade' },
    { id: '34_sap1', x: 760, y: 345, w: 680, h: 28, style: 'sap_stream', streamVx: 130 },

    // Sec 2: Dark Cavern Vine Swing over Abyss
    { id: '34_p2', x: 2240, y: 330, w: 680, h: 200, style: 'jade' },

    // Sec 3: Glowing Spore Jet Corridor
    { id: '34_p3', x: 3060, y: 345, w: 780, h: 185, style: 'jade' },
    { id: '34_hi1', x: 3300, y: 230, w: 300, h: 16, style: 'vine_deck', oneWay: true },

    // Sec 4: Subterranean Bubble Lake
    { id: '34_p4', x: 4840, y: 325, w: 700, h: 205, style: 'jade' },

    // Sec 5: Dark Bloom Bridge + Snap Jaws
    { id: '34_p5', x: 6320, y: 330, w: 720, h: 200, style: 'jade' },

    // Sec 6: Deep Cavern Reverse Sap + Catapult Ceiling Vault
    { id: '34_sap2', x: 7180, y: 345, w: 680, h: 28, style: 'sap_stream', streamVx: -110 },
    { id: '34_hi2', x: 8140, y: 205, w: 740, h: 28, style: 'vine_deck' },

    // Sec 7: Scythe Cavern + Pendulum Vine Exit
    { id: '34_p6', x: 9660, y: 335, w: 800, h: 195, style: 'jade' },
    { id: '34_p7', x: 10600, y: 315, w: 720, h: 215, style: 'jade' },

    // Sec 8: Dark Hydra Finale Terraces
    { id: '34_p8a', x: 12160, y: 340, w: 780, h: 190, style: 'jade' },
    { id: '34_p8b', x: 13050, y: 295, w: 500, h: 235, style: 'jade' },
    { id: '34_p8c', x: 13660, y: 340, w: 540, h: 190, style: 'jade' },
    { id: '34_up2', x: 13080, y: 185, w: 320, h: 16, style: 'vine_deck', oneWay: true },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '34_pv1', cx: 1680, cy: 74, length: 165, maxAngle: 0.72, speed: 2.25, phase: 0 },
    { id: '34_pv2', cx: 2000, cy: 76, length: 165, maxAngle: 0.72, speed: 2.25, phase: 1.5 },
    { id: '34_pv3', cx: 9160, cy: 72, length: 165, maxAngle: 0.74, speed: 2.3, phase: 0.4 },
    { id: '34_pv4', cx: 9440, cy: 74, length: 160, maxAngle: 0.74, speed: 2.3, phase: 1.9 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '34_sj1', x: 2560, y: 330, dir: 'up', range: 120, cyclePeriod: 3.1, activeDuration: 0.95, phase: 0 },
    { id: '34_sj2', x: 3440, y: 345, dir: 'up', range: 120, cyclePeriod: 3.0, activeDuration: 0.95, phase: 1.2 },
    { id: '34_sj3', x: 6680, y: 330, dir: 'up', range: 125, cyclePeriod: 2.9, activeDuration: 0.95, phase: 0.4 },
    { id: '34_sj4', x: 10940, y: 315, dir: 'up', range: 120, cyclePeriod: 3.0, activeDuration: 0.95, phase: 1.1 },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '34_fb1', x: 4000, y: 315, r: 24, ampX: 0, ampY: 16, speed: 1.7, phase: 0 },
    { id: '34_fb2', x: 4220, y: 280, r: 24, ampX: 0, ampY: 18, speed: 1.75, phase: 1.0 },
    { id: '34_fb3', x: 4440, y: 260, r: 24, ampX: 14, ampY: 14, speed: 1.75, phase: 1.9 },
    { id: '34_fb4', x: 4650, y: 300, r: 24, ampX: 0, ampY: 16, speed: 1.7, phase: 2.7 },
    { id: '34_fb5', x: 11520, y: 300, r: 24, ampX: 0, ampY: 16, speed: 1.7, phase: 0.2 },
    { id: '34_fb6', x: 11750, y: 280, r: 24, ampX: 0, ampY: 16, speed: 1.7, phase: 1.3 },
    { id: '34_fb7', x: 11970, y: 315, r: 24, ampX: 0, ampY: 14, speed: 1.7, phase: 2.3 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '34_bb1', triggerX: 5480, triggerY: 270, bridgeX: 5590, bridgeY: 325, bridgeW: 320, bridgeH: 18, duration: 5.8, timer: 0, active: false },
    { id: '34_bb2', triggerX: 5900, triggerY: 265, bridgeX: 5960, bridgeY: 325, bridgeW: 300, bridgeH: 18, duration: 5.8, timer: 0, active: false },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '34_cat1', x: 7780, y: 327, w: 46, h: 18, launchVx: 460, launchVy: -640 },
  ];

  const snapTraps: SnapTrapDef[] = [
    { id: '34_st1', x: 6460, y: 310, w: 38, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0 },
    { id: '34_st2', x: 7420, y: 325, w: 38, h: 20, cyclePeriod: 2.9, snapDuration: 0.52, phase: 1.0 },
    { id: '34_st3', x: 10040, y: 315, w: 40, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0.5 },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '34_sc1', cx: 9980, cy: 52, length: 225, maxAngle: 0.74, speed: 2.4, phase: 0.4 },
    { id: '34_sc2', cx: 12660, cy: 52, length: 225, maxAngle: 0.74, speed: 2.45, phase: 1.6 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('34e01', 'emerald_mantis', 340, 370, 140, 600),
    makeW3Enemy('34e02', 'ghost_wisp', 980, 345, 780, 1380),
    makeW3Enemy('34e03', 'drill_mole', 1240, 345, 800, 1400),
    makeW3Enemy('34e04', 'jade_sniper', 2440, 330, 2280, 2860),
    makeW3Enemy('34e05', 'chrono_vine', 2740, 330, 2720, 2760),
    makeW3Enemy('34e06', 'emerald_mantis', 3260, 345, 3100, 3780),
    makeW3Enemy('34e07', 'bio_hydra', 5060, 325, 4880, 5480),
    makeW3Enemy('34e08', 'drill_mole', 6540, 330, 6360, 6980),
    makeW3Enemy('34e09', 'jade_sniper', 6860, 330, 6400, 7000),
    makeW3Enemy('34e10', 'emerald_mantis', 7360, 345, 7220, 7740),
    makeW3Enemy('34e11', 'prism_spore', 8460, 205, 8300, 8820),
    makeW3Enemy('34e12', 'chrono_vine', 9840, 335, 9820, 9860),
    makeW3Enemy('34e13', 'bio_hydra', 10220, 335, 9720, 10420),
    makeW3Enemy('34e14', 'emerald_mantis', 10820, 315, 10640, 11260),
    makeW3Enemy('34e15', 'ghost_wisp', 12440, 340, 12200, 12880),
    makeW3Enemy('34e16', 'bio_hydra', 13280, 295, 13090, 13500),
    makeW3Enemy('34e17', 'thorn_weaver', 13820, 340, 13700, 13980),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('34o1', 880, 285, 4, 120),
    ...makeW3Orbs('34o2', 4000, 230, 4, 210),
    ...makeW3Orbs('34o3', 5620, 265, 4, 150),
    { id: '34_b1', x: 3440, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '34_b2', x: 8560, y: 155, r: 10, collected: false, value: 300, bonus: true, phase: 1.1 },
    { id: '34_b3', x: 13220, y: 135, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const glowLanterns = [
    { id: '34_gl1', x: 520, y: 300, r: 12 },
    { id: '34_gl2', x: 2420, y: 265, r: 12 },
    { id: '34_gl3', x: 3450, y: 175, r: 12 },
    { id: '34_gl4', x: 6600, y: 265, r: 12 },
    { id: '34_gl5', x: 8520, y: 155, r: 12 },
    { id: '34_gl6', x: 12540, y: 270, r: 12 },
  ];

  return emptyW3Stage({
    id: '3-4',
    code: '3-4',
    title: '翡翠地下樹海・蛍光の胞子洞窟',
    subtitle: 'Glow Spore Lanterns, Bioluminescent Cavern & Sap Rapids (17 Enemies)',
    theme: 'jade_labyrinth',
    ambientDarkness: 0.72,
    width: 14200,
    goal: { x: 14000, y: 224, w: 54, h: 116 },
    platforms,
    pendulumVines,
    sporeJets,
    floatBubbles,
    bloomBridges,
    sporeCatapults,
    snapTraps,
    scythePendulums,
    glowLanterns,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4880, y: 325 },
      { x: 9720, y: 335 },
    ],
    neonSigns: [
      { x: 105, y: 195, w: 230, h: 24, label: 'GLOW SPORE LANTERNS', color: '#34d399' },
      { x: 4880, y: 185, w: 230, h: 24, label: 'GLOW BLOOM ABYSS', color: '#6ee7b7' },
      { x: 9740, y: 185, w: 230, h: 24, label: 'DEEP SAP PASSAGE', color: '#10b981' },
    ],
  });
}

// ============================================================================
// STAGE 3-5: エメラルド浮遊胞子と大鎌の空中庭園 (14,400px / 8区間 / 敵24体)
// ============================================================================
function buildStage3_5(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Garden Entry + Multi-Bubble Ascent
    { id: '35_p1', x: 0, y: 370, w: 640, h: 160, style: 'jade' },
    { id: '35_p2', x: 1380, y: 245, w: 620, h: 28, style: 'vine_deck' },

    // Sec 2: Dual-Route Bloom Bridge Garden
    { id: '35_p3', x: 2660, y: 315, w: 680, h: 215, style: 'jade' },

    // Sec 3: Catapult -> Vine -> Bubble Aerial Chain
    { id: '35_p4', x: 4640, y: 315, w: 760, h: 215, style: 'jade' },

    // Sec 4: Scythe Garden + Sap Terrace
    { id: '35_sap1', x: 5540, y: 335, w: 740, h: 28, style: 'sap_stream', streamVx: 135 },
    { id: '35_p5', x: 6420, y: 300, w: 720, h: 230, style: 'jade' },

    // Sec 5: Floating Bubble Stairway + Sniper Galleries
    { id: '35_p6', x: 8060, y: 270, w: 680, h: 260, style: 'jade' },

    // Sec 6: Moving Garden Lift + Twin Bloom Bridges
    { id: '35_p7', x: 9660, y: 325, w: 720, h: 205, style: 'jade' },

    // Sec 7: Reverse Sap Runway + Scythe Gate
    { id: '35_sap2', x: 10520, y: 335, w: 780, h: 28, style: 'sap_stream', streamVx: -115 },
    { id: '35_p8', x: 11440, y: 315, w: 640, h: 215, style: 'jade' },

    // Sec 8: Catapult Summit Garden & Stepped Finale
    { id: '35_p9', x: 12360, y: 215, w: 860, h: 28, style: 'vine_deck' },
    { id: '35_p10a', x: 13380, y: 335, w: 500, h: 195, style: 'jade' },
    { id: '35_p10b', x: 13990, y: 300, w: 410, h: 230, style: 'jade' },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '35_fb1', x: 800, y: 330, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0 },
    { id: '35_fb2', x: 1000, y: 285, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 1.1 },
    { id: '35_fb3', x: 1200, y: 255, r: 24, ampX: 0, ampY: 14, speed: 1.75, phase: 2.0 },
    { id: '35_fb4', x: 4160, y: 270, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0.4 },
    { id: '35_fb5', x: 4400, y: 295, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 1.5 },
    { id: '35_fb6', x: 7340, y: 280, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0.2 },
    { id: '35_fb7', x: 7580, y: 250, r: 24, ampX: 16, ampY: 14, speed: 1.8, phase: 1.2 },
    { id: '35_fb8', x: 7840, y: 265, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 2.2 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '35_bb1', triggerX: 1960, triggerY: 195, bridgeX: 2070, bridgeY: 255, bridgeW: 260, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '35_bb2', triggerX: 2320, triggerY: 230, bridgeX: 2360, bridgeY: 290, bridgeW: 250, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '35_bb3', triggerX: 8980, triggerY: 240, bridgeX: 9080, bridgeY: 295, bridgeW: 500, bridgeH: 18, duration: 6.0, timer: 0, active: false },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: '35_mp1', x: 8820, y: 275, w: 130, h: 16, startX: 8780, startY: 300, endX: 8960, endY: 240, speed: 1.75, phase: 0, vx: 0, vy: 0, prevX: 8820, prevY: 275 },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '35_cat1', x: 3250, y: 297, w: 46, h: 18, launchVx: 460, launchVy: -610 },
    { id: '35_cat2', x: 11980, y: 297, w: 46, h: 18, launchVx: 480, launchVy: -640 },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '35_pv1', cx: 3740, cy: 74, length: 165, maxAngle: 0.75, speed: 2.35, phase: 0 },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '35_sc1', cx: 5900, cy: 52, length: 225, maxAngle: 0.74, speed: 2.4, phase: 0 },
    { id: '35_sc2', cx: 10940, cy: 52, length: 225, maxAngle: 0.76, speed: 2.45, phase: 1.1 },
    { id: '35_sc3', cx: 13720, cy: 52, length: 225, maxAngle: 0.74, speed: 2.4, phase: 0.5 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '35_sj1', x: 6760, y: 300, dir: 'up', range: 120, cyclePeriod: 3.0, activeDuration: 0.95, phase: 0.3 },
    { id: '35_sj2', x: 10020, y: 325, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.95, phase: 1.2 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('35e01', 'emerald_mantis', 360, 370, 140, 600),
    makeW3Enemy('35e02', 'thorn_weaver', 1620, 245, 1420, 1960),
    makeW3Enemy('35e03', 'prism_spore', 2920, 315, 2700, 3260),
    makeW3Enemy('35e04', 'bio_hydra', 4940, 315, 4760, 5340),
    makeW3Enemy('35e05', 'jade_sniper', 5240, 315, 4800, 5360),
    makeW3Enemy('35e06', 'emerald_mantis', 5740, 335, 5580, 6220),
    makeW3Enemy('35e07', 'star_weaver', 6120, 335, 5600, 6240),
    makeW3Enemy('35e08', 'chrono_vine', 6680, 300, 6660, 6700),
    makeW3Enemy('35e09', 'jade_sniper', 8280, 270, 8100, 8680),
    makeW3Enemy('35e10', 'emerald_mantis', 9860, 325, 9700, 10320),
    makeW3Enemy('35e11', 'bio_hydra', 10180, 325, 9740, 10340),
    makeW3Enemy('35e12', 'golem_knight', 10760, 335, 10560, 11240),
    makeW3Enemy('35e13', 'thorn_weaver', 11640, 315, 11480, 12020),
    makeW3Enemy('35e14', 'star_weaver', 12860, 215, 12680, 13160),
    makeW3Enemy('35e15', 'bio_hydra', 13080, 215, 12720, 13180),
    makeW3Enemy('35e16', 'emerald_mantis', 13560, 335, 13420, 13840),
    makeW3Enemy('35e17', 'jade_sniper', 14120, 300, 14020, 14170),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('35o1', 800, 250, 3, 200),
    ...makeW3Orbs('35o2', 2140, 215, 4, 115),
    ...makeW3Orbs('35o3', 7340, 195, 4, 180),
    { id: '35_b1', x: 1680, y: 185, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '35_b2', x: 6960, y: 225, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '35_b3', x: 12940, y: 155, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const orbitalPlatforms = [
    { id: '35_op1', cx: 2360, cy: 265, rx: 85, ry: 48, w: 110, h: 16, speed: 1.65, angle: 0, x: 2445, y: 265, prevX: 2445, prevY: 265 },
    { id: '35_op2', cx: 4380, cy: 255, rx: 90, ry: 52, w: 110, h: 16, speed: -1.65, angle: 1.2, x: 4380, y: 255, prevX: 4380, prevY: 255 },
    { id: '35_op3', cx: 7600, cy: 240, rx: 95, ry: 55, w: 110, h: 16, speed: 1.75, angle: 0.5, x: 7600, y: 240, prevX: 7600, prevY: 240 },
    { id: '35_op4', cx: 9280, cy: 260, rx: 90, ry: 50, w: 110, h: 16, speed: -1.7, angle: 2.1, x: 9280, y: 260, prevX: 9280, prevY: 260 },
    { id: '35_op5', cx: 12220, cy: 235, rx: 85, ry: 48, w: 110, h: 16, speed: 1.75, angle: 0, x: 12220, y: 235, prevX: 12220, prevY: 235 },
  ];

  return emptyW3Stage({
    id: '3-5',
    code: '3-5',
    title: 'エメラルド浮遊胞子と大鎌の空中庭園',
    subtitle: 'Orbital Jade Discs, Bubble Bridges & Catapults (17 Enemies)',
    theme: 'emerald_canopy',
    width: 14400,
    goal: { x: 14200, y: 184, w: 54, h: 116 },
    platforms,
    floatBubbles,
    bloomBridges,
    movingPlatforms,
    orbitalPlatforms,
    sporeCatapults,
    pendulumVines,
    scythePendulums,
    sporeJets,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4760, y: 315 },
      { x: 9700, y: 325 },
    ],
    neonSigns: [
      { x: 100, y: 195, w: 230, h: 24, label: 'ORBITAL JADE DISCS', color: '#34d399' },
      { x: 4780, y: 180, w: 230, h: 24, label: 'AERIAL CATAPULT CHAIN', color: '#6ee7b7' },
      { x: 9720, y: 185, w: 230, h: 24, label: 'FORT II APPROACH', color: '#10b981' },
    ],
  });
}

// ============================================================================
// STAGE 3-FORT2: 第二翠玉要塞・双晶の狂花炉心 (14,400px / 敵22体 / ジェイド・キメラ)
// ============================================================================
function buildStage3_Fort2(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Sec 1: Twin-Scythe Outer Gate
    { id: '3f2_p1', x: 0, y: 370, w: 860, h: 160, style: 'fortress' },
    { id: '3f2_p2', x: 1000, y: 325, w: 720, h: 205, style: 'fortress' },

    // Sec 2: Reverse Sap Snap-Jaw Corridor
    { id: '3f2_sap1', x: 1860, y: 345, w: 820, h: 28, style: 'sap_stream', streamVx: -115 },
    { id: '3f2_p3', x: 2800, y: 315, w: 680, h: 215, style: 'fortress' },

    // Sec 3: Twin-Vine + Bubble Reactor Pit
    { id: '3f2_p4', x: 4860, y: 325, w: 760, h: 205, style: 'fortress' },

    // Sec 4: Dual Bloom Bridge + Spore Jets
    { id: '3f2_p5', x: 6480, y: 325, w: 760, h: 205, style: 'fortress' },
    { id: '3f2_hi1', x: 6680, y: 215, w: 340, h: 16, style: 'vine_deck', oneWay: true },

    // Sec 5: Forward Sap Catapult Launch -> Citadel Deck
    { id: '3f2_sap2', x: 7380, y: 345, w: 660, h: 28, style: 'sap_stream', streamVx: 145 },
    { id: '3f2_p6', x: 8320, y: 235, w: 780, h: 295, style: 'fortress' },

    // Sec 6: Triple Scythe & Snap Corridor
    { id: '3f2_p7a', x: 9240, y: 340, w: 440, h: 190, style: 'fortress' },
    { id: '3f2_p7b', x: 9760, y: 315, w: 420, h: 215, style: 'fortress' },

    // Sec 7: Final Bubble Bridge -> Chimera Chamber
    { id: '3f2_p8', x: 11180, y: 335, w: 760, h: 195, style: 'fortress' },

    // Sec 8: Jade Chimera Arena (12160..13140) + Goal
    { id: '3f2_arena', x: 12120, y: 365, w: 2280, h: 165, style: 'fortress' },
    { id: '3f2_ap1', x: 12300, y: 266, w: 140, h: 16, style: 'vine_deck', oneWay: true },
    { id: '3f2_ap2', x: 12840, y: 266, w: 140, h: 16, style: 'vine_deck', oneWay: true },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '3f2_sc1', cx: 640, cy: 50, length: 240, maxAngle: 0.76, speed: 2.45, phase: 0 },
    { id: '3f2_sc2', cx: 9520, cy: 50, length: 225, maxAngle: 0.78, speed: 2.55, phase: 0 },
    { id: '3f2_sc3', cx: 9800, cy: 50, length: 210, maxAngle: 0.78, speed: 2.55, phase: 1.4 },
    { id: '3f2_sc4', cx: 10060, cy: 50, length: 210, maxAngle: 0.78, speed: 2.55, phase: 2.8 },
  ];

  const snapTraps: SnapTrapDef[] = [
    { id: '3f2_st1', x: 2120, y: 325, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 0 },
    { id: '3f2_st2', x: 2440, y: 325, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 1.2 },
    { id: '3f2_st3', x: 6780, y: 305, w: 40, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0.4 },
    { id: '3f2_st4', x: 11520, y: 315, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 0.9 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '3f2_sj1', x: 1340, y: 325, dir: 'up', range: 125, cyclePeriod: 2.9, activeDuration: 0.95, phase: 0.4 },
    { id: '3f2_sj2', x: 5220, y: 325, dir: 'up', range: 125, cyclePeriod: 2.9, activeDuration: 0.95, phase: 1.1 },
    { id: '3f2_sj3', x: 8820, y: 235, dir: 'up', range: 120, cyclePeriod: 3.0, activeDuration: 0.95, phase: 0.2 },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '3f2_pv1', cx: 3680, cy: 74, length: 165, maxAngle: 0.74, speed: 2.35, phase: 0 },
    { id: '3f2_pv2', cx: 4000, cy: 74, length: 165, maxAngle: 0.74, speed: 2.35, phase: 1.5 },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '3f2_fb1', x: 4320, y: 295, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0 },
    { id: '3f2_fb2', x: 4540, y: 275, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 1.2 },
    { id: '3f2_fb3', x: 4720, y: 305, r: 24, ampX: 0, ampY: 14, speed: 1.75, phase: 2.2 },
    { id: '3f2_fb4', x: 10360, y: 315, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0.2 },
    { id: '3f2_fb5', x: 10600, y: 280, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 1.3 },
    { id: '3f2_fb6', x: 10860, y: 290, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 2.3 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '3f2_bb1', triggerX: 5560, triggerY: 265, bridgeX: 5670, bridgeY: 325, bridgeW: 340, bridgeH: 18, duration: 5.5, timer: 0, active: false },
    { id: '3f2_bb2', triggerX: 5980, triggerY: 265, bridgeX: 6070, bridgeY: 325, bridgeW: 330, bridgeH: 18, duration: 5.5, timer: 0, active: false },
  ];

  const sporeCatapults: SporeCatapultDef[] = [
    { id: '3f2_cat1', x: 7940, y: 327, w: 46, h: 18, launchVx: 470, launchVy: -630 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('3f2e01', 'emerald_mantis', 360, 370, 140, 820),
    makeW3Enemy('3f2e02', 'golem_knight', 1180, 325, 1040, 1660),
    makeW3Enemy('3f2e03', 'prism_spore', 2020, 345, 1900, 2640),
    makeW3Enemy('3f2e04', 'phantom_knight', 2360, 345, 1920, 2660),
    makeW3Enemy('3f2e05', 'bio_hydra', 3060, 315, 2840, 3420),
    makeW3Enemy('3f2e06', 'emerald_mantis', 5060, 325, 4900, 5560),
    makeW3Enemy('3f2e07', 'bio_hydra', 6660, 325, 6520, 7180),
    makeW3Enemy('3f2e08', 'phantom_knight', 6840, 215, 6700, 7000),
    makeW3Enemy('3f2e09', 'chrono_vine', 7060, 325, 7040, 7080),
    makeW3Enemy('3f2e10', 'emerald_mantis', 7580, 345, 7420, 7920),
    makeW3Enemy('3f2e11', 'prism_spore', 8660, 235, 8500, 9040),
    makeW3Enemy('3f2e12', 'golem_knight', 9440, 340, 9280, 9640),
    makeW3Enemy('3f2e13', 'bio_hydra', 9860, 315, 9780, 10080),
    makeW3Enemy('3f2e14', 'phantom_knight', 10040, 315, 9820, 10140),
    makeW3Enemy('3f2e15', 'emerald_mantis', 11380, 335, 11220, 11880),
    makeW3Enemy('3f2e16', 'jade_sniper', 11680, 335, 11260, 11900),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('3f2o1', 3680, 220, 4, 210),
    ...makeW3Orbs('3f2o2', 5740, 275, 4, 155),
    ...makeW3Orbs('3f2o3', 13360, 315, 5, 52, 0, true),
    { id: '3f2_b1', x: 6860, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '3f2_b2', x: 8740, y: 175, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '3f2_b3', x: 11760, y: 280, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const crystalLocks = [
    { id: '3f2_cl1', crystalX: 1380, crystalY: 215, barrierX: 1560, barrierY: 165, barrierW: 26, barrierH: 160, unlocked: false },
    { id: '3f2_cl2', crystalX: 5240, crystalY: 215, barrierX: 5460, barrierY: 165, barrierW: 26, barrierH: 160, unlocked: false },
    { id: '3f2_cl3', crystalX: 11540, crystalY: 225, barrierX: 11780, barrierY: 175, barrierW: 26, barrierH: 160, unlocked: false },
  ];

  const boss: BossDef = {
    kind: 'jade_chimera',
    x: 12900,
    y: 165,
    w: 70,
    h: 62,
    vx: 0,
    vy: 0,
    hp: 13,
    maxHp: 13,
    facing: -1,
    arenaMinX: 12160,
    arenaMaxX: 13140,
    floorY: 365,
    active: false,
    defeated: false,
    state: 'glide',
    stateTimer: 1.25,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW3Stage({
    id: '3-FORT2',
    code: '3-砦2',
    title: '第二翠玉要塞・双晶の狂花炉心',
    subtitle: 'Twin-Crystal Prism Barriers, Scythes & Jade Chimera (16 Enemies)',
    theme: 'verdant_fortress',
    width: 14400,
    goal: { x: 14200, y: 249, w: 54, h: 116 },
    platforms,
    scythePendulums,
    snapTraps,
    sporeJets,
    pendulumVines,
    floatBubbles,
    bloomBridges,
    sporeCatapults,
    crystalLocks,
    enemies,
    orbs,
    checkpoints: [
      { x: 70, y: 370 },
      { x: 4920, y: 325 },
      { x: 8520, y: 235 },
      { x: 11260, y: 335 },
    ],
    neonSigns: [
      { x: 110, y: 190, w: 235, h: 24, label: 'TWIN CRYSTAL BARRIERS', color: '#34d399' },
      { x: 4920, y: 185, w: 235, h: 24, label: 'BLOOM LOCK REACTOR', color: '#10b981' },
      { x: 11260, y: 185, w: 235, h: 24, label: 'CHIMERA SANCTUM', color: '#6ee7b7' },
    ],
    boss,
  });
}

// ============================================================================
// STAGE 3-6: 蒼翠の樹冠ダイブ＆深層根脈スプリント (下ステ verticalDescent: y -680 -> +780 -> x 6800)
// ============================================================================
function buildStage3_6(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Tier 0: High Sunlit Canopy Entry (y: -680)
    { id: '36_t0a', x: 0, y: -680, w: 720, h: 32, style: 'vine_deck' },
    { id: '36_t0b', x: 860, y: -560, w: 540, h: 28, style: 'vine_deck' },

    // Tier 1: Zigzag Drop Shelf (y: -380 -> -180)
    { id: '36_t1a', x: 1420, y: -380, w: 540, h: 28, style: 'jade' },
    { id: '36_t1b', x: 760, y: -200, w: 560, h: 28, style: 'vine_deck' },
    { id: '36_t1c', x: 240, y: -40, w: 500, h: 28, style: 'jade' },

    // Tier 2: Mid-Canopy Bubble Shaft (y: 120 -> 360)
    { id: '36_t2a', x: 900, y: 120, w: 520, h: 28, style: 'sap_stream', streamVx: 135 },
    { id: '36_t2b', x: 1580, y: 280, w: 520, h: 28, style: 'vine_deck' },
    { id: '36_t2c', x: 980, y: 470, w: 560, h: 28, style: 'jade' },

    // Tier 3: Deep Bioluminescent Root Basin (y: 640 -> 780)
    { id: '36_t3a', x: 1700, y: 630, w: 520, h: 30, style: 'jade' },
    { id: '36_r1a', x: 2260, y: 780, w: 480, h: 160, style: 'jade' },
    { id: '36_r1b', x: 2840, y: 745, w: 500, h: 195, style: 'jade' },

    // Tier 4: Root-Canal Leaf-Gate Sprint (x: 3460 -> 6800, y: 780) + Upper Secret Root Alcove
    { id: '36_sap_low', x: 3460, y: 760, w: 860, h: 28, style: 'sap_stream', streamVx: 170 },
    { id: '36_hi_root', x: 3560, y: 615, w: 460, h: 18, style: 'vine_deck', oneWay: true },
    { id: '36_r2', x: 4460, y: 740, w: 720, h: 180, style: 'jade' },
    { id: '36_bn_low', x: 5260, y: 750, w: 120, h: 18, style: 'emerald_bounce', bouncy: true },
    { id: '36_r3a', x: 5520, y: 780, w: 620, h: 160, style: 'jade' },
    { id: '36_r3b', x: 6240, y: 745, w: 560, h: 195, style: 'jade' },
    { id: '36_sec_1', x: 5560, y: 585, w: 260, h: 18, style: 'vine_deck', oneWay: true },
    { id: '36_sec_2', x: 5940, y: 545, w: 280, h: 18, style: 'vine_deck', oneWay: true },
    { id: '36_sec_3', x: 6320, y: 525, w: 380, h: 18, style: 'vine_deck', oneWay: true },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '36_fb1', x: 790, y: -620, r: 24, ampX: 0, ampY: 14, speed: 1.7, phase: 0 },
    { id: '36_fb2', x: 1390, y: -470, r: 24, ampX: 0, ampY: 14, speed: 1.7, phase: 0.9 },
    { id: '36_fb3', x: 810, y: 50, r: 24, ampX: 0, ampY: 14, speed: 1.7, phase: 1.6 },
    { id: '36_fb4', x: 1580, y: 550, r: 24, ampX: 0, ampY: 14, speed: 1.7, phase: 2.3 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '36_sj1', x: 1060, y: -560, dir: 'up', range: 110, cyclePeriod: 3.1, activeDuration: 0.9, phase: 0.1 },
    { id: '36_sj2', x: 520, y: -40, dir: 'up', range: 110, cyclePeriod: 3.1, activeDuration: 0.9, phase: 1.0 },
    { id: '36_sj3', x: 1240, y: 470, dir: 'up', range: 110, cyclePeriod: 3.0, activeDuration: 0.9, phase: 0.5 },
    { id: '36_sj4', x: 4780, y: 740, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.9, phase: 1.2 },
  ];

  const snapTraps: SnapTrapDef[] = [
    { id: '36_st1', x: 1620, y: -400, w: 38, h: 20, cyclePeriod: 2.9, snapDuration: 0.5, phase: 0 },
    { id: '36_st2', x: 1780, y: 260, w: 38, h: 20, cyclePeriod: 2.8, snapDuration: 0.5, phase: 0.8 },
    { id: '36_st3', x: 2980, y: 725, w: 40, h: 20, cyclePeriod: 2.8, snapDuration: 0.52, phase: 0.4 },
    { id: '36_st4', x: 5940, y: 760, w: 40, h: 20, cyclePeriod: 2.7, snapDuration: 0.52, phase: 1.1 },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '36_sc1', cx: 1100, cy: 270, length: 160, maxAngle: 0.72, speed: 2.25, phase: 0.2 },
    { id: '36_sc2', cx: 4860, cy: 500, length: 215, maxAngle: 0.74, speed: 2.35, phase: 0.9 },
  ];

  const slipstreamGates = [
    { id: '36_sg1', x: 2540, y: 680, h: 100 },
    { id: '36_sg2', x: 3780, y: 660, h: 100 },
    { id: '36_sg3', x: 5640, y: 680, h: 100 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('36e01', 'emerald_mantis', 420, -680, 200, 680),
    makeW3Enemy('36e02', 'prism_spore', 1120, -560, 900, 1340),
    makeW3Enemy('36e03', 'jade_sniper', 1680, -380, 1460, 1920),
    makeW3Enemy('36e04', 'emerald_mantis', 1020, -200, 800, 1280),
    makeW3Enemy('36e05', 'thorn_weaver', 460, -40, 270, 690),
    makeW3Enemy('36e06', 'prism_spore', 1140, 120, 940, 1380),
    makeW3Enemy('36e07', 'bio_hydra', 1840, 280, 1620, 2040),
    makeW3Enemy('36e08', 'emerald_mantis', 1240, 470, 1020, 1500),
    makeW3Enemy('36e09', 'chrono_vine', 1960, 630, 1940, 1980),
    makeW3Enemy('36e10', 'emerald_mantis', 3060, 745, 2870, 3300),
    makeW3Enemy('36e11', 'bio_hydra', 3920, 760, 3520, 4260),
    makeW3Enemy('36e12', 'jade_sniper', 4660, 740, 4500, 5120),
    makeW3Enemy('36e13', 'emerald_mantis', 5840, 780, 5580, 6080),
    makeW3Enemy('36e14', 'bio_hydra', 6400, 745, 6270, 6540),
    makeW3Enemy('36e15', 'jade_sniper', 6440, 525, 6360, 6540),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('36o1', 360, -725, 3, 95),
    ...makeW3Orbs('36o2', 1120, 65, 3, 100),
    ...makeW3Orbs('36o3', 3600, 705, 5, 135),
    { id: '36_b1', x: 1680, y: -435, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '36_b2', x: 1840, y: 225, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '36_b3', x: 4820, y: 685, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
    { id: '36_b4', x: 6080, y: 495, r: 10, collected: false, value: 300, bonus: true, phase: 0.8 },
  ];

  return emptyW3Stage({
    id: '3-6',
    code: '3-6',
    title: '蒼翠の樹冠ダイブ＆深層根脈スプリント',
    subtitle: 'Vertical Canopy Descent (y:-680→+780) & Root Slipstream Gates (15 Enemies)',
    theme: 'emerald_canopy',
    verticalDescent: true,
    spawn: { x: 120, y: -740 },
    width: 6800,
    goal: { x: 6600, y: 629, w: 54, h: 116 },
    secretGoal: { x: 6600, y: 409, w: 54, h: 116 },
    platforms,
    floatBubbles,
    sporeJets,
    snapTraps,
    scythePendulums,
    slipstreamGates,
    enemies,
    orbs,
    checkpoints: [
      { x: 120, y: -680 },
      { x: 1520, y: -380 },
      { x: 1020, y: 120 },
      { x: 1840, y: 630 },
      { x: 2420, y: 780 },
      { x: 4540, y: 740 },
    ],
    neonSigns: [
      { x: 140, y: -815, w: 235, h: 24, label: 'CANOPY PLUNGE DESCENT', color: '#34d399' },
      { x: 2320, y: 625, w: 235, h: 24, label: 'DEEP ROOT SLIPSTREAM', color: '#6ee7b7' },
    ],
  });
}

// ============================================================================
// STAGE 3-7: 翡翠樹冠・上下複層スパイラル回廊 (水平 15,600px / 二層分岐アスレチック / 15敵)
// ============================================================================
function buildStage3_7(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Act 1: Dual-Layer Split Entry (0..5200)
    { id: '37_p0', x: 0, y: 370, w: 820, h: 160, style: 'jade' },
    { id: '37_bn1', x: 640, y: 355, w: 120, h: 18, style: 'emerald_bounce', bouncy: true },
    // Upper Canopy Branch 1
    { id: '37_hi1a', x: 1080, y: 165, w: 380, h: 26, style: 'vine_deck' },
    { id: '37_hi1b', x: 1535, y: 145, w: 485, h: 26, style: 'vine_deck' },
    { id: '37_hi2', x: 2420, y: 150, w: 860, h: 26, style: 'vine_deck' },
    // Lower Armored Root Branch 1
    { id: '37_lo1a', x: 960, y: 370, w: 480, h: 160, style: 'jade' },
    { id: '37_lo1b', x: 1520, y: 340, w: 520, h: 190, style: 'jade' },
    { id: '37_sap1', x: 2180, y: 360, w: 880, h: 28, style: 'sap_stream', streamVx: 135 },
    { id: '37_mid1a', x: 3420, y: 325, w: 460, h: 205, style: 'jade' },
    { id: '37_mid1b', x: 3960, y: 300, w: 420, h: 230, style: 'jade' },

    // Act 2: Spiral Bloom Crossover & Double-Deck Citadel (5200..10400)
    { id: '37_p2', x: 4540, y: 340, w: 680, h: 190, style: 'jade' },
    { id: '37_hi3a', x: 5620, y: 175, w: 520, h: 26, style: 'vine_deck' },
    { id: '37_hi3b', x: 6240, y: 155, w: 500, h: 26, style: 'vine_deck' },
    { id: '37_lo2a', x: 5480, y: 375, w: 580, h: 155, style: 'fortress' },
    { id: '37_lo2b', x: 6160, y: 345, w: 560, h: 185, style: 'fortress' },
    { id: '37_sap2', x: 6880, y: 345, w: 860, h: 28, style: 'sap_stream', streamVx: -115 },
    { id: '37_hi4', x: 7060, y: 165, w: 720, h: 26, style: 'vine_deck' },
    { id: '37_mid2a', x: 7920, y: 325, w: 560, h: 205, style: 'jade' },
    { id: '37_mid2b', x: 8580, y: 295, w: 520, h: 235, style: 'jade' },

    // Act 3: Final Emerald Gauntlet & Terrace Merge (10400..15600)
    { id: '37_p3', x: 9780, y: 340, w: 780, h: 190, style: 'jade' },
    { id: '37_hi5a', x: 11040, y: 165, w: 410, h: 26, style: 'vine_deck' },
    { id: '37_hi5b', x: 11525, y: 145, w: 495, h: 26, style: 'vine_deck' },
    { id: '37_lo3a', x: 10820, y: 370, w: 540, h: 160, style: 'fortress' },
    { id: '37_lo3b', x: 11460, y: 340, w: 540, h: 190, style: 'fortress' },
    { id: '37_bn2', x: 11960, y: 325, w: 115, h: 18, style: 'emerald_bounce', bouncy: true },
    { id: '37_p4a', x: 12260, y: 320, w: 480, h: 210, style: 'jade' },
    { id: '37_p4b', x: 12830, y: 295, w: 470, h: 235, style: 'jade' },
    { id: '37_enda', x: 13960, y: 335, w: 720, h: 195, style: 'jade' },
    { id: '37_endb', x: 14790, y: 300, w: 810, h: 230, style: 'jade' },
  ];

  const spiralBlooms = [
    { id: '37_sb1', triggerX: 1940, triggerY: 310, stepOffsetX: 110, stepRiseY: 50, stepW: 84, stepsCount: 3, duration: 9.0 },
    { id: '37_sb2', triggerX: 5080, triggerY: 285, stepOffsetX: 115, stepRiseY: 48, stepW: 84, stepsCount: 3, duration: 9.0 },
    { id: '37_sb3', triggerX: 10380, triggerY: 285, stepOffsetX: 115, stepRiseY: 50, stepW: 84, stepsCount: 3, duration: 9.0 },
  ];

  const pendulumVines: PendulumVineDef[] = [
    { id: '37_pv1', cx: 2180, cy: 50, length: 140, maxAngle: 0.72, speed: 2.3, phase: 0 },
    { id: '37_pv2', cx: 13580, cy: 65, length: 165, maxAngle: 0.74, speed: 2.35, phase: 1.0 },
  ];

  const floatBubbles: FloatBubbleDef[] = [
    { id: '37_fb1', x: 9220, y: 295, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 0 },
    { id: '37_fb2', x: 9440, y: 265, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 1.0 },
    { id: '37_fb3', x: 9640, y: 290, r: 24, ampX: 0, ampY: 16, speed: 1.75, phase: 2.0 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '37_bb1', triggerX: 4320, triggerY: 235, bridgeX: 4390, bridgeY: 300, bridgeW: 210, bridgeH: 18, duration: 6.0, timer: 0, active: false },
    { id: '37_bb2', triggerX: 13260, triggerY: 265, bridgeX: 13360, bridgeY: 320, bridgeW: 480, bridgeH: 18, duration: 6.5, timer: 0, active: false },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '37_sc1', cx: 6160, cy: 205, length: 145, maxAngle: 0.72, speed: 2.35, phase: 0.2 },
    { id: '37_sc2', cx: 11420, cy: 195, length: 150, maxAngle: 0.72, speed: 2.35, phase: 1.3 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '37_sj1', x: 1680, y: 340, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.9, phase: 0.3 },
    { id: '37_sj2', x: 8240, y: 325, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.9, phase: 1.2 },
    { id: '37_sj3', x: 14460, y: 335, dir: 'up', range: 125, cyclePeriod: 3.0, activeDuration: 0.9, phase: 0.7 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('37e01', 'emerald_mantis', 440, 370, 180, 760),
    makeW3Enemy('37e02', 'jade_sniper', 1760, 145, 1560, 1980),
    makeW3Enemy('37e03', 'bio_hydra', 1740, 340, 1550, 1990),
    makeW3Enemy('37e04', 'prism_spore', 2840, 150, 2460, 3220),
    makeW3Enemy('37e05', 'emerald_mantis', 4140, 300, 3990, 4320),
    makeW3Enemy('37e06', 'thorn_weaver', 6460, 155, 6270, 6690),
    makeW3Enemy('37e07', 'chrono_vine', 6360, 345, 6340, 6380),
    makeW3Enemy('37e08', 'bio_hydra', 7380, 345, 6940, 7680),
    makeW3Enemy('37e09', 'jade_sniper', 7420, 165, 7100, 7720),
    makeW3Enemy('37e10', 'emerald_mantis', 8780, 295, 8610, 9040),
    makeW3Enemy('37e11', 'prism_spore', 11720, 145, 11560, 11960),
    makeW3Enemy('37e12', 'bio_hydra', 11680, 340, 11490, 11940),
    makeW3Enemy('37e13', 'emerald_mantis', 12480, 320, 12300, 12700),
    makeW3Enemy('37e14', 'bio_hydra', 14280, 335, 14040, 14620),
    makeW3Enemy('37e15', 'jade_sniper', 15060, 300, 14830, 15320),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('37o1', 1260, 110, 4, 160),
    ...makeW3Orbs('37o2', 5880, 115, 4, 170),
    ...makeW3Orbs('37o3', 12520, 260, 4, 150),
    { id: '37_b1', x: 2820, y: 95, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '37_b2', x: 7420, y: 110, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '37_b3', x: 11720, y: 95, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  return emptyW3Stage({
    id: '3-7',
    code: '3-7',
    title: '翡翠樹冠・上下複層スパイラル回廊',
    subtitle: 'Horizontal 15,600px Dual-Layer Canopy/Root Gauntlet & Spiral Blooms (15 Enemies)',
    theme: 'emerald_canopy',
    width: 15600,
    goal: { x: 15400, y: 184, w: 54, h: 116 },
    platforms,
    spiralBlooms,
    pendulumVines,
    floatBubbles,
    bloomBridges,
    scythePendulums,
    sporeJets,
    enemies,
    orbs,
    checkpoints: [
      { x: 80, y: 370 },
      { x: 4620, y: 340 },
      { x: 9840, y: 340 },
      { x: 14040, y: 335 },
    ],
    neonSigns: [
      { x: 95, y: 195, w: 235, h: 24, label: 'UPPER CANOPY VS LOWER ROOT', color: '#34d399' },
      { x: 4620, y: 185, w: 230, h: 24, label: 'SPIRAL BLOOM CROSSOVER', color: '#6ee7b7' },
      { x: 14040, y: 185, w: 220, h: 24, label: 'ROYAL PALACE APPROACH', color: '#10b981' },
    ],
  });
}

// ============================================================================
// STAGE 3-BOSS: 翡翠宮殿の聖域回廊＆翠帝玉座の間 (水平 7,400px / 3大広間＋地上1040px決戦)
// ============================================================================
function buildStage3_Boss(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Hall 1: Outer Palace Sanctuary Gusts (0..2200)
    { id: '3b_h1a1', x: 0, y: 365, w: 460, h: 170, style: 'jade' },
    { id: '3b_h1a2', x: 540, y: 340, w: 400, h: 195, style: 'jade' },
    { id: '3b_sap1', x: 1060, y: 345, w: 840, h: 28, style: 'sap_stream', streamVx: 140 },
    { id: '3b_up1', x: 1320, y: 200, w: 420, h: 24, style: 'vine_deck' },

    // Hall 2: Crystal Barrier & Stepped Scythe Colonnade (2040..4800)
    { id: '3b_h2aa', x: 2040, y: 330, w: 560, h: 200, style: 'fortress' },
    { id: '3b_h2ab', x: 2700, y: 300, w: 560, h: 230, style: 'fortress' },
    { id: '3b_h2ba', x: 3780, y: 335, w: 540, h: 195, style: 'fortress' },
    { id: '3b_h2bb', x: 4420, y: 305, w: 480, h: 225, style: 'fortress' },

    // Hall 3: Emerald Throne Arena (5140..7400, floorY: 365)
    { id: '3b_arena', x: 5140, y: 365, w: 2260, h: 170, style: 'fortress' },
    { id: '3b_ap1', x: 5380, y: 258, w: 160, h: 16, style: 'vine_deck', oneWay: true },
    { id: '3b_ap2', x: 6000, y: 258, w: 160, h: 16, style: 'vine_deck', oneWay: true },
    { id: '3b_bn_ar', x: 5710, y: 350, w: 115, h: 16, style: 'emerald_bounce', bouncy: true },
  ];

  const sanctuaryGusts = [
    { id: '3b_gu1', x: 1160, y: 120, w: 72, h: 225, liftVy: -360, cyclePeriod: 3.8, activeDuration: 2.4, phase: 0 },
    { id: '3b_gu2', x: 2460, y: 120, w: 72, h: 210, liftVy: -360, cyclePeriod: 3.8, activeDuration: 2.4, phase: 1.0 },
    { id: '3b_gu3', x: 5270, y: 155, w: 68, h: 210, liftVy: -355, cyclePeriod: 4.0, activeDuration: 2.4, phase: 0.3 },
    { id: '3b_gu4', x: 6190, y: 155, w: 68, h: 210, liftVy: -355, cyclePeriod: 4.0, activeDuration: 2.4, phase: 2.1 },
  ];

  const bloomBridges: BloomBridgeDef[] = [
    { id: '3b_bb1', triggerX: 3180, triggerY: 235, bridgeX: 3320, bridgeY: 330, bridgeW: 410, bridgeH: 18, duration: 6.5, timer: 0, active: false },
  ];

  const scythePendulums: ScythePendulumDef[] = [
    { id: '3b_sc1', cx: 2840, cy: 52, length: 205, maxAngle: 0.74, speed: 2.35, phase: 0.2 },
    { id: '3b_sc2', cx: 4220, cy: 52, length: 215, maxAngle: 0.74, speed: 2.35, phase: 1.3 },
  ];

  const crystalLocks = [
    { id: '3b_cl1', crystalX: 2500, crystalY: 160, barrierX: 3060, barrierY: 135, barrierW: 26, barrierH: 165, unlocked: false },
  ];

  const spiralBlooms = [
    { id: '3b_sb1', triggerX: 4740, triggerY: 240, stepOffsetX: 115, stepRiseY: 28, stepW: 84, stepsCount: 3, duration: 9.0 },
  ];

  const sporeJets: SporeJetDef[] = [
    { id: '3b_sj1', x: 680, y: 340, dir: 'up', range: 120, cyclePeriod: 3.1, activeDuration: 0.9, phase: 0 },
    { id: '3b_sj2', x: 4060, y: 335, dir: 'up', range: 120, cyclePeriod: 3.1, activeDuration: 0.9, phase: 1.1 },
  ];

  const enemies: EnemyDef[] = [
    makeW3Enemy('3be01', 'emerald_mantis', 310, 365, 160, 420),
    makeW3Enemy('3be02', 'prism_spore', 1480, 200, 1340, 1700),
    makeW3Enemy('3be03', 'bio_hydra', 1520, 345, 1100, 1860),
    makeW3Enemy('3be04', 'rune_sentinel', 2380, 330, 2080, 2560),
    makeW3Enemy('3be05', 'jade_sniper', 2860, 300, 2740, 3020),
    makeW3Enemy('3be06', 'bio_hydra', 4020, 335, 3840, 4280),
    makeW3Enemy('3be07', 'phantom_knight', 4600, 305, 4450, 4840),
    makeW3Enemy('3be08', 'chrono_vine', 4800, 305, 4780, 4820),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeW3Orbs('3bo1', 1360, 145, 4, 110),
    ...makeW3Orbs('3bo2', 6480, 315, 5, 52, 0, true),
    { id: '3b_b1', x: 2500, y: 115, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: '3b_b2', x: 5450, y: 210, r: 10, collected: false, value: 300, bonus: true, phase: 1.0 },
    { id: '3b_b3', x: 6080, y: 210, r: 10, collected: false, value: 300, bonus: true, phase: 2.0 },
  ];

  const boss: BossDef = {
    kind: 'emerald_emperor',
    x: 6040,
    y: 235,
    w: 66,
    h: 74,
    vx: 0,
    vy: 0,
    hp: 15,
    maxHp: 15,
    facing: -1,
    arenaMinX: 5240,
    arenaMaxX: 6280,
    floorY: 365,
    active: false,
    defeated: false,
    state: 'hover',
    stateTimer: 1.35,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyW3Stage({
    id: '3-BOSS',
    code: '3-城',
    title: '翡翠宮殿の聖域回廊＆翠帝玉座の間',
    subtitle: 'Horizontal 7,400px Royal Palace March & Emerald Emperor (8 Guard Enemies / 15HP Boss)',
    theme: 'verdant_fortress',
    width: 7400,
    goal: { x: 7160, y: 249, w: 54, h: 116 },
    platforms,
    sanctuaryGusts,
    bloomBridges,
    scythePendulums,
    crystalLocks,
    spiralBlooms,
    sporeJets,
    enemies,
    orbs,
    checkpoints: [
      { x: 80, y: 365 },
      { x: 2100, y: 330 },
      { x: 3840, y: 335 },
      { x: 5200, y: 365 },
    ],
    neonSigns: [
      { x: 100, y: 185, w: 235, h: 24, label: 'EMERALD PALACE COLONNADE', color: '#6ee7b7' },
      { x: 2140, y: 175, w: 235, h: 24, label: 'SANCTUARY GALE & CRYSTAL LOCK', color: '#34d399' },
      { x: 5580, y: 135, w: 245, h: 24, label: 'EMERALD EMPEROR THRONE', color: '#a7f3d0' },
    ],
    boss,
  });
}

export function buildWorld3Stage(stageId: string): StageDefinition | null {
  switch (stageId) {
    case '3-1':
      return buildStage3_1();
    case '3-2':
      return buildStage3_2();
    case '3-3':
      return buildStage3_3();
    case '3-FORT1':
      return buildStage3_Fort1();
    case '3-4':
      return buildStage3_4();
    case '3-5':
      return buildStage3_5();
    case '3-FORT2':
      return buildStage3_Fort2();
    case '3-6':
      return buildStage3_6();
    case '3-7':
      return buildStage3_7();
    case '3-BOSS':
      return buildStage3_Boss();
    default:
      return null;
  }
}
