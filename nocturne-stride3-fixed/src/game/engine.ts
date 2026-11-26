import { sound } from './audio';
import { createEnemyDefForKind, DAMAGE_TABLE, EnemyPortraitKind } from './gameData';
import { createStage } from './levels';
import {
  BloomBridgeDef,
  BossDef,
  EnemyDef,
  FloatBubbleDef,
  GearPlatformDef,
  LotusPadDef,
  MagicMirrorDef,
  MovingPlatformDef,
  OrbitalPlatformDef,
  PendulumVineDef,
  PhaseWaterSwitchDef,
  PlatformDef,
  PollenPodDef,
  ScythePendulumDef,
  SlopeDef,
  SnapTrapDef,
  SpiralBloomDef,
  SporeCatapultDef,
  SporeJetDef,
  StageDefinition,
  ThunderRailDef,
} from './types';

export type StageRunStatus = 'PLAYING' | 'VICTORY' | 'GAME_OVER';

export interface HudSnapshot {
  stageId: string;
  stageCode: string;
  stageTitle: string;
  status: StageRunStatus;
  hp: number;
  maxHp: number;
  score: number;
  orbsCollected: number;
  totalOrbs: number;
  elapsedSec: number;
  enemiesDefeated: number;
  isSecretClear: boolean;
  boss: { name: string; hp: number; maxHp: number } | null;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  fromEnemy?: boolean;
  damage?: number;
  homing?: boolean;
  shockwave?: boolean;
  gravity?: number;
  bouncesLeft?: number;
  ricochetLeft?: number;
  iceMirroredFromId?: string;
  splitTimer?: number;
  splitDmg?: number;
  chillDuration?: number;
  boomerang?: { originX: number; originY: number; speed: number; elapsed: number; turned: boolean };
  pauseTimer?: number;
  pauseTargetX?: number;
  pauseTargetY?: number;
  pauseSpeed?: number;
  waveAmp?: number;
  waveFreq?: number;
  waveAge?: number;
  splitCount?: number;
  splitColor?: string;
  color?: string;
  trail: { x: number; y: number }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  glow?: boolean;
  ring?: boolean;
}

interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface TouchPoint {
  id: number;
  role: 'move' | 'action';
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
  history: { x: number; y: number; t: number }[];
  flickTriggered: boolean;
  swipeShotTriggered: boolean;
}

interface ActionRipple {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'tap' | 'swipe';
}

interface Building {
  x: number;
  w: number;
  h: number;
  layer: 1 | 2;
  spire: boolean;
  windows: { rx: number; ry: number; lit: boolean; warm: boolean }[];
}

const LOGICAL_HEIGHT = 450;
const FIXED_DT = 1 / 60;

const WALK_SPEED = 195;
const RUN_SPEED = 330;
const SLIDE_FLAT_SPEED = 390;
const SLIDE_SLOPE_MAX = 580;
const GROUND_ACCEL = 1480;
const GROUND_DECEL = 1750;
const SLIPPERY_DECEL = 420;
const SKID_DECEL = 2650;
const AIR_ACCEL = 1100;
const AIR_DECEL = 420;

const JUMP_VEL = -470;
const DOUBLE_JUMP_VEL = -430;
const STOMP_BOUNCE_LOW = -345;
const STOMP_BOUNCE_HIGH = -465;

const GRAVITY_UP = 1120;
const GRAVITY_APEX = 580;
const GRAVITY_DOWN = 1680;
const MAX_FALL = 680;

const NORMAL_W = 24;
const NORMAL_H = 36;
const SLIDE_H = 20;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onHudUpdate: (hud: HudSnapshot) => void;
  private onStageClearCallback?: (hud: HudSnapshot) => void;

  private stageId: string;
  private level: StageDefinition;
  private status: StageRunStatus = 'PLAYING';
  private pausedForPortrait = false;
  private active = true;

  private sandboxEnemy: EnemyPortraitKind | null = null;
  private godMode = false;
  private aiPaused = false;

  private rafId = 0;
  private lastTimestamp = 0;
  private accumulator = 0;
  private worldTime = 0;
  private runTime = 0;

  private viewW = 800;
  private viewH = LOGICAL_HEIGHT;

  private bubbleMotion = new WeakMap<FloatBubbleDef, { x: number; y: number; prevX: number; prevY: number }>();

  private player = {
    x: 80,
    y: 325,
    w: NORMAL_W,
    h: NORMAL_H,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    onGround: false,
    onSlope: null as SlopeDef | null,
    standingPlatform: null as MovingPlatformDef | null,
    sliding: false,
    slideTimer: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    jumpHeld: false,
    airJumpsLeft: 1,
    shootCooldown: 0,
    castTimer: 0,
    spinTimer: 0,
    invulnTimer: 0,
    scaleX: 1,
    scaleY: 1,
    runCycle: 0,
    blinkTimer: 2.5,
    scarfNodes: [] as { x: number; y: number }[],
    checkpointX: 80,
    checkpointY: 325,
    inGravityMode: null as 'updraft' | 'low_grav' | null,
    grindingRail: null as ThunderRailDef | null,
    standingGear: null as GearPlatformDef | null,
    grabbedVine: null as PendulumVineDef | null,
    vineCooldown: 0,
    standingBubble: null as FloatBubbleDef | null,
    standingStreamVx: 0,
    catapultCooldown: 0,
    standingLotus: null as LotusPadDef | null,
    standingOrbital: null as OrbitalPlatformDef | null,
    slipstreamTimer: 0,
    cavernLightTimer: 0,
    chillTimer: 0,
    standingIce: false,
  };

  private hp = 100;
  private maxHp = 100;
  private score = 0;
  private orbsCollected = 0;
  private orbCombo = 0;
  private orbComboTimer = 0;
  private enemiesDefeated = 0;
  private isSecretClear = false;

  private hitstopTimer = 0;
  private stompGraceTimer = 0;
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private camX = 0;
  private camY = 0;
  private stageMinCamY = -75;
  private stageMaxCamY = 0;
  private metroLightLevel = 0;
  private lightningAlpha = 0;
  private chronoSlowTimer = 0;
  private lightningScheduleTimer = 0;
  private activeLightningStrikes: {
    x: number;
    floorY: number;
    timer: number;
    warnDuration: number;
    strikeRadius: number;
    struck: boolean;
    strikeLife: number;
    color?: string;
    chillDuration?: number;
    damage?: number;
  }[] = [];
  private activeGroundSpikes: {
    x: number;
    floorY: number;
    timer: number;
    warnDuration: number;
    radius: number;
    erupted: boolean;
    life: number;
    damage: number;
    color?: string;
    chillDuration?: number;
  }[] = [];

  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private actionRipples: ActionRipple[] = [];
  private holoReveal: Record<string, number> = {};
  private rainDrops: { x: number; y: number; len: number; spd: number }[] = [];
  private libraryMotes: { x: number; y: number; r: number; spd: number; phase: number }[] = [];
  private snowFlakes: { x: number; y: number; r: number; spd: number; drift: number }[] = [];

  private bgStars: { x: number; y: number; r: number; twinkle: number }[] = [];
  private bgBuildings: Building[] = [];

  private keys = new Set<string>();
  private touches = new Map<number, TouchPoint>();
  private moveTouchId: number | null = null;
  private primaryActionTouchId: number | null = null;
  private lastRightTapTime = 0;
  private touchMoveAxis = 0;
  private lastHudPush = 0;

  constructor(
    canvas: HTMLCanvasElement,
    stageId: string,
    callbacks: {
      onHudUpdate: (hud: HudSnapshot) => void;
      onStageClear?: (hud: HudSnapshot) => void;
    },
    options?: {
      sandboxEnemy?: EnemyPortraitKind;
      godMode?: boolean;
      aiPaused?: boolean;
    }
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.onHudUpdate = callbacks.onHudUpdate;
    this.onStageClearCallback = callbacks.onStageClear;

    this.stageId = stageId;
    this.sandboxEnemy = options?.sandboxEnemy ?? null;
    this.godMode = Boolean(options?.godMode);
    this.aiPaused = Boolean(options?.aiPaused);

    this.level = this.sandboxEnemy
      ? this.buildSandboxStage(this.sandboxEnemy)
      : createStage(stageId);
    this.initBackground();
    this.initAtmosphere();
    this.resetPlayerToSpawn(true);
    this.handleResize();
    this.bindEvents();
    this.pushHud(true);
  }

  private buildSandboxStage(kind: EnemyPortraitKind): StageDefinition {
    const floorY = 370;
    const theme: StageDefinition['theme'] =
      kind === 'laser_emitter' || kind === 'mid_guardian' || kind === 'iron_goliath'
        ? 'fortress_alert'
        : kind === 'clockwork_core' || kind === 'volt_centurion'
          ? 'gear_fortress'
          : kind === 'thunder_kronos'
            ? 'thunder_airship'
            : kind === 'archmage' || kind === 'airship_cannon' || kind === 'overlord_core'
              ? 'airship_boss'
              : kind === 'verdant_warden' || kind === 'jade_chimera'
                ? 'verdant_fortress'
                : kind === 'emerald_emperor'
                  ? 'bio_spire_sky'
                  : kind === 'emerald_stalker' ||
                      kind === 'thorn_weaver' ||
                      kind === 'emerald_mantis' ||
                      kind === 'prism_spore' ||
                      kind === 'chrono_vine' ||
                      kind === 'bio_hydra' ||
                      kind === 'jade_sniper'
                    ? 'emerald_canopy'
                    : kind === 'frost_titan' ||
                        kind === 'frost_wraith' ||
                        kind === 'icicle_bat' ||
                        kind === 'glacier_golem' ||
                        kind === 'ice_skater' ||
                        kind === 'permafrost_wyrm'
                      ? 'frozen_harbor'
                      : kind === 'mirror_frost' || kind === 'cryo_turret'
                        ? 'cryo_prism_maze'
                        : kind === 'blizzard_fairy'
                          ? 'blizzard_gorge'
                          : kind === 'glacia_knight' || kind === 'cocytus_core'
                            ? 'glacial_fortress'
                            : kind === 'glacies_emperor'
                              ? 'frost_spire_citadel'
                              : kind === 'gear_roller' ||
                                  kind === 'spark_jelly' ||
                                  kind === 'laser_drone' ||
                                  kind === 'thunder_imp' ||
                                  kind === 'mirror_gear' ||
                                  kind === 'gravity_flipper' ||
                                  kind === 'magnet_crane'
                                ? 'golden_clocktower'
                                : 'neon_street';

    const floorStyle: PlatformDef['style'] =
      theme === 'fortress_alert'
        ? 'fortress'
        : theme === 'golden_clocktower' || theme === 'gear_fortress' || theme === 'thunder_airship'
          ? 'brass'
          : theme === 'emerald_canopy' || theme === 'verdant_fortress' || theme === 'bio_spire_sky'
            ? 'jade'
            : theme === 'glacial_fortress' || theme === 'frost_spire_citadel'
              ? 'cryo_metal'
              : theme === 'frozen_harbor' ||
                  theme === 'cryo_prism_maze' ||
                  theme === 'blizzard_gorge'
                ? 'ice_floor'
                : 'asphalt';

    const stage: StageDefinition = {
      id: 'SANDBOX',
      code: 'LAB',
      title: '敵キャラ挙動テストラボ',
      subtitle: 'Interactive Enemy AI & Damage Sandbox',
      theme,
      width: 920,
      spawn: { x: 110, y: 315 },
      goal: { x: 9999, y: 270, w: 60, h: 100 },
      platforms: [
        { id: 'sb_floor', x: 0, y: floorY, w: 920, h: 90, style: floorStyle },
        { id: 'sb_ceil', x: 0, y: 0, w: 920, h: 48, style: 'metal' },
        { id: 'sb_l_wall', x: 0, y: 48, w: 32, h: floorY - 48, style: 'metal' },
        { id: 'sb_r_wall', x: 888, y: 48, w: 32, h: floorY - 48, style: 'metal' },
        {
          id: 'sb_ledge_l',
          x: 130,
          y: 268,
          w: 150,
          h: 14,
          style: floorStyle === 'jade' ? 'vine_deck' : 'gantry',
          oneWay: true,
        },
        {
          id: 'sb_ledge_r',
          x: 640,
          y: 268,
          w: 150,
          h: 14,
          style: floorStyle === 'jade' ? 'vine_deck' : 'gantry',
          oneWay: true,
        },
      ],
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
      checkpoints: [{ x: 110, y: floorY }],
      neonSigns: [
        {
          x: 350,
          y: 82,
          w: 220,
          h: 28,
          label: 'ENEMY BEHAVIOR LAB',
          color:
            floorStyle === 'jade'
              ? '#34d399'
              : floorStyle === 'cryo_metal' || floorStyle === 'ice_floor'
                ? '#38bdf8'
                : '#38f2ff',
        },
      ],
    };

    if (kind === 'airship_cannon') {
      stage.cannons.push({
        id: 'sb_cannon',
        x: 690,
        y: floorY - 28,
        dir: -1,
        angle: -0.18,
        interval: 1.85,
        timer: 0.4,
      });
    } else if (kind === 'laser_emitter') {
      stage.lasers.push({
        id: 'sb_laser',
        cx: 560,
        cy: 252,
        length: 112,
        angle: 0,
        angularSpeed: 1.75,
      });
    } else if (
      kind === 'mid_guardian' ||
      kind === 'archmage' ||
      kind === 'overlord_core' ||
      kind === 'clockwork_core' ||
      kind === 'thunder_kronos' ||
      kind === 'iron_goliath' ||
      kind === 'volt_centurion' ||
      kind === 'emerald_stalker' ||
      kind === 'verdant_warden' ||
      kind === 'jade_chimera' ||
      kind === 'emerald_emperor' ||
      kind === 'frost_titan' ||
      kind === 'glacia_knight' ||
      kind === 'cocytus_core' ||
      kind === 'glacies_emperor'
    ) {
      const maxHp =
        kind === 'glacies_emperor' ? 18 : kind === 'overlord_core'
                  ? 16
                  : kind === 'emerald_emperor' || kind === 'cocytus_core'
                    ? 15
                    : kind === 'thunder_kronos'
                      ? 14
                      : kind === 'jade_chimera' || kind === 'glacia_knight'
                        ? 13
                        : kind === 'archmage' || kind === 'verdant_warden'
                          ? 11
                          : kind === 'clockwork_core' || kind === 'frost_titan'
                            ? 10
                            : kind === 'emerald_stalker'
                              ? 8
                              : kind === 'volt_centurion'
                                ? 7
                                : 6;
      const w =
        kind === 'cocytus_core'
          ? 72
          : kind === 'jade_chimera' || kind === 'glacies_emperor'
            ? 70
            : kind === 'emerald_emperor'
              ? 66
              : kind === 'clockwork_core' || kind === 'verdant_warden'
                ? 64
                : kind === 'thunder_kronos'
                  ? 60
                  : kind === 'overlord_core' || kind === 'frost_titan' || kind === 'glacia_knight'
                    ? 58
                    : kind === 'iron_goliath' || kind === 'volt_centurion' || kind === 'emerald_stalker'
                      ? 56
                      : 52;
      const h =
        kind === 'glacies_emperor'
          ? 76
          : kind === 'verdant_warden' || kind === 'emerald_emperor'
            ? 74
            : kind === 'frost_titan' || kind === 'glacia_knight'
              ? 72
              : kind === 'thunder_kronos' ||
                  kind === 'iron_goliath' ||
                  kind === 'volt_centurion' ||
                  kind === 'emerald_stalker' ||
                  kind === 'cocytus_core'
                ? 68
                : kind === 'jade_chimera'
                  ? 62
                  : 64;
      const grounded =
        kind === 'mid_guardian' ||
        kind === 'iron_goliath' ||
        kind === 'emerald_stalker' ||
        kind === 'verdant_warden' ||
        kind === 'frost_titan' ||
        kind === 'glacia_knight';
      stage.boss = {
        kind,
        x: 620,
        y: grounded ? floorY - h : 185,
        w,
        h,
        vx: 0,
        vy: 0,
        hp: maxHp,
        maxHp,
        facing: -1,
        arenaMinX: 48,
        arenaMaxX: 872,
        floorY,
        active: true,
        defeated: false,
        state:
          kind === 'verdant_warden'
            ? 'patrol'
            : kind === 'jade_chimera'
              ? 'glide'
              : kind === 'glacia_knight'
                ? 'guard'
                : kind === 'cocytus_core'
                  ? 'sweep'
                  : grounded
                    ? 'idle'
                    : 'hover',
        stateTimer: 1.0,
        stunTimer: 0,
        hitFlash: 0,
        phase: 1,
        clones: [],
      };
    } else {
      stage.enemies.push(createEnemyDefForKind(kind, 'sb_target', 580, floorY, 210, 845));
    }

    return stage;
  }

  private initBackground() {
    this.bgStars = [];
    for (let i = 0; i < 65; i++) {
      this.bgStars.push({
        x: Math.random() * 1800,
        y: Math.random() * 240,
        r: Math.random() * 1.4 + 0.4,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    this.bgBuildings = [];
    let bx = -100;
    while (bx < 2600) {
      const w = 54 + Math.floor(Math.random() * 68);
      const h = 130 + Math.floor(Math.random() * 175);
      const windows: Building['windows'] = [];
      const cols = Math.floor((w - 14) / 11);
      const rows = Math.floor((h - 24) / 14);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.28) {
            windows.push({ rx: 8 + c * 11, ry: 14 + r * 14, lit: true, warm: Math.random() < 0.42 });
          }
        }
      }
      this.bgBuildings.push({ x: bx, w, h, layer: 1, spire: Math.random() < 0.3, windows });
      bx += w + 8 + Math.floor(Math.random() * 24);
    }

    let mx = -120;
    while (mx < 3200) {
      const w = 68 + Math.floor(Math.random() * 88);
      const h = 95 + Math.floor(Math.random() * 145);
      const windows: Building['windows'] = [];
      const cols = Math.floor((w - 16) / 14);
      const rows = Math.floor((h - 24) / 16);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.34) {
            windows.push({ rx: 10 + c * 14, ry: 16 + r * 16, lit: true, warm: Math.random() < 0.5 });
          }
        }
      }
      this.bgBuildings.push({ x: mx, w, h, layer: 2, spire: Math.random() < 0.18, windows });
      mx += w + 14 + Math.floor(Math.random() * 38);
    }
  }

  private initAtmosphere() {
    this.rainDrops = [];
    if (this.level.theme === 'rainy_arcade') {
      for (let i = 0; i < 85; i++) {
        this.rainDrops.push({
          x: Math.random() * 1100,
          y: Math.random() * 450,
          len: 12 + Math.random() * 12,
          spd: 520 + Math.random() * 180,
        });
      }
    }

    this.libraryMotes = [];
    if (
      this.level.theme === 'arcane_library' ||
      this.level.theme === 'sky_hologram' ||
      this.level.theme === 'secret_vault'
    ) {
      for (let i = 0; i < 48; i++) {
        this.libraryMotes.push({
          x: Math.random() * 1100,
          y: Math.random() * 420,
          r: 2 + Math.random() * 2.5,
          spd: 14 + Math.random() * 24,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    this.snowFlakes = [];
    if (
      this.level.theme === 'frozen_harbor' ||
      this.level.theme === 'cryo_prism_maze' ||
      this.level.theme === 'blizzard_gorge' ||
      this.level.theme === 'glacial_fortress' ||
      this.level.theme === 'abyssal_trench' ||
      this.level.theme === 'frost_spire_citadel'
    ) {
      for (let i = 0; i < 60; i++) {
        this.snowFlakes.push({
          x: Math.random() * 1100,
          y: Math.random() * 450,
          r: 1.5 + Math.random() * 2.6,
          spd: 42 + Math.random() * 68,
          drift: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  public start() {
    this.lastTimestamp = performance.now();
    const loop = (now: number) => {
      const rawDt = Math.min(0.05, Math.max(0, (now - this.lastTimestamp) / 1000));
      this.lastTimestamp = now;

      if (this.active && !this.pausedForPortrait) {
        this.accumulator += rawDt;
        while (this.accumulator >= FIXED_DT) {
          this.fixedUpdate(FIXED_DT);
          this.accumulator -= FIXED_DT;
        }
        this.render();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public destroy() {
    this.active = false;
    cancelAnimationFrame(this.rafId);
    this.unbindEvents();
  }

  public setPortraitPaused(paused: boolean) {
    this.pausedForPortrait = paused;
    if (paused) this.clearAllInputs();
  }

  public loadStage(stageId: string) {
    this.sandboxEnemy = null;
    this.stageId = stageId;
    this.restartStage();
  }

  public spawnSandboxTarget(kind: EnemyPortraitKind) {
    this.sandboxEnemy = kind;
    this.restartStage();
  }

  public setGodMode(enabled: boolean) {
    this.godMode = enabled;
  }

  public setAiPaused(paused: boolean) {
    this.aiPaused = paused;
  }

  public resetHpOnly() {
    this.hp = this.maxHp;
    this.status = 'PLAYING';
    this.pushHud(true);
  }

  public restartStage() {
    sound.unlock();
    this.level = this.sandboxEnemy
      ? this.buildSandboxStage(this.sandboxEnemy)
      : createStage(this.stageId);
    this.initAtmosphere();
    this.hp = this.maxHp;
    this.score = 0;
    this.orbsCollected = 0;
    this.orbCombo = 0;
    this.orbComboTimer = 0;
    this.enemiesDefeated = 0;
    this.isSecretClear = false;
    this.runTime = 0;
    this.metroLightLevel = 0;
    this.lightningAlpha = 0;
    this.chronoSlowTimer = 0;
    this.lightningScheduleTimer = this.level.autoScrollSpeed ? 2.8 : 0.8;
    this.activeLightningStrikes = [];
    this.activeGroundSpikes = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.actionRipples = [];
    this.holoReveal = {};
    this.bubbleMotion = new WeakMap();
    this.hitstopTimer = 0;
    this.stompGraceTimer = 0;
    this.shakeTimer = 0;
    this.computeStageVerticalBounds();
    this.resetPlayerToSpawn(true);
    this.status = 'PLAYING';
    this.pushHud(true);
  }

  private resetPlayerToSpawn(fullReset: boolean) {
    const sx = fullReset ? this.level.spawn.x : this.player.checkpointX;
    const sy = fullReset ? this.level.spawn.y : this.player.checkpointY - NORMAL_H;
    this.player.x = sx;
    this.player.y = sy;
    this.player.w = NORMAL_W;
    this.player.h = NORMAL_H;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 1;
    this.player.onGround = false;
    this.player.onSlope = null;
    this.player.standingPlatform = null;
    this.player.sliding = false;
    this.player.slideTimer = 0;
    this.player.coyoteTimer = 0;
    this.player.jumpBufferTimer = 0;
    this.player.jumpHeld = false;
    this.player.airJumpsLeft = 1;
    this.player.shootCooldown = 0;
    this.player.castTimer = 0;
    this.player.spinTimer = 0;
    this.player.invulnTimer = fullReset ? 0 : 1.25;
    this.player.scaleX = 1;
    this.player.scaleY = 1;
    this.player.inGravityMode = null;
    this.player.grindingRail = null;
    this.player.standingGear = null;
    this.player.grabbedVine = null;
    this.player.vineCooldown = 0;
    this.player.standingBubble = null;
    this.player.standingStreamVx = 0;
    this.player.catapultCooldown = 0;
    this.player.standingLotus = null;
    this.player.standingOrbital = null;
    this.player.slipstreamTimer = 0;
    this.player.cavernLightTimer = 0;
    this.player.chillTimer = 0;
    this.player.standingIce = false;

    if (fullReset) {
      this.player.checkpointX = this.level.spawn.x;
      this.player.checkpointY = this.level.spawn.y;
    }

    this.player.scarfNodes = [];
    for (let i = 0; i < 6; i++) {
      this.player.scarfNodes.push({ x: sx + 8 - i * 6, y: sy + 16 });
    }

    this.camX = Math.max(0, Math.min(this.level.width - this.viewW, sx - this.viewW * 0.3));
    this.camY = this.level.verticalClimb
      ? Math.min(0, sy - 255)
      : this.level.verticalDescent
        ? Math.max(-780, Math.min(540, sy - 195))
        : Math.min(this.stageMaxCamY, Math.max(this.stageMinCamY, sy - 245));
  }

  private computeStageVerticalBounds() {
    let minContentY = 0;
    let maxContentY = LOGICAL_HEIGHT;
    for (const p of this.level.platforms) {
      minContentY = Math.min(minContentY, p.y - 48);
      maxContentY = Math.max(maxContentY, p.y + 80);
    }
    for (const sl of this.level.slopes) {
      minContentY = Math.min(minContentY, sl.y1 - 48, sl.y2 - 48);
      maxContentY = Math.max(maxContentY, Math.max(sl.y1, sl.y2) + 80);
    }
    for (const mp of this.level.movingPlatforms) {
      minContentY = Math.min(minContentY, mp.startY - 48, mp.endY - 48);
      maxContentY = Math.max(maxContentY, mp.startY + 48, mp.endY + 48);
    }
    for (const o of this.level.orbs) {
      minContentY = Math.min(minContentY, o.y - 48);
      maxContentY = Math.max(maxContentY, o.y + 40);
    }
    if (this.level.secretGoal) {
      minContentY = Math.min(minContentY, this.level.secretGoal.y - 60);
      maxContentY = Math.max(maxContentY, this.level.secretGoal.y + this.level.secretGoal.h + 40);
    }
    if (this.level.boss) {
      minContentY = Math.min(minContentY, this.level.boss.floorY - 340);
      maxContentY = Math.max(maxContentY, this.level.boss.floorY + 60);
    }
    this.stageMinCamY = Math.min(-75, Math.max(-440, minContentY));
    this.stageMaxCamY = Math.max(0, Math.min(340, maxContentY - LOGICAL_HEIGHT));
  }

  private clearAllInputs() {
    this.keys.clear();
    this.touches.clear();
    this.moveTouchId = null;
    this.primaryActionTouchId = null;
    this.touchMoveAxis = 0;
    this.player.jumpHeld = false;
  }

  // -------------------- Event Binding --------------------

  private onResize = () => this.handleResize();

  private handleResize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const cssW = Math.max(320, rect ? rect.width : window.innerWidth);
    const cssH = Math.max(200, rect ? rect.height : window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    this.viewH = LOGICAL_HEIGHT;
    this.viewW = Math.max(520, (cssW / cssH) * LOGICAL_HEIGHT);

    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    sound.unlock();

    if (e.code === 'KeyR') {
      this.restartStage();
      return;
    }

    if (this.status !== 'PLAYING') {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (this.status === 'GAME_OVER') this.restartStage();
      }
      return;
    }

    const wasDown = this.keys.has(e.code);
    this.keys.add(e.code);

    if (!wasDown) {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyX') {
        this.pressJump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.triggerSlide();
      }
      if (e.code === 'KeyZ' || e.code === 'KeyJ' || e.code === 'KeyK' || e.code === 'Enter') {
        this.fireArcaneBolt();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyX') {
      const stillHeld =
        this.keys.has('Space') ||
        this.keys.has('ArrowUp') ||
        this.keys.has('KeyW') ||
        this.keys.has('KeyX');
      if (!stillHeld && this.primaryActionTouchId === null) {
        this.releaseJump();
      }
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.target !== this.canvas) return;
    e.preventDefault();
    sound.unlock();
    if (this.status !== 'PLAYING' || this.pausedForPortrait) return;

    const now = performance.now();
    const halfW = window.innerWidth * 0.5;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const isLeft = t.clientX < halfW;

      if (isLeft && this.moveTouchId === null) {
        this.moveTouchId = t.identifier;
        this.touches.set(t.identifier, {
          id: t.identifier,
          role: 'move',
          originX: t.clientX,
          originY: t.clientY,
          currentX: t.clientX,
          currentY: t.clientY,
          history: [{ x: t.clientX, y: t.clientY, t: now }],
          flickTriggered: false,
          swipeShotTriggered: false,
        });
      } else {
        const tp: TouchPoint = {
          id: t.identifier,
          role: 'action',
          originX: t.clientX,
          originY: t.clientY,
          currentX: t.clientX,
          currentY: t.clientY,
          history: [{ x: t.clientX, y: t.clientY, t: now }],
          flickTriggered: false,
          swipeShotTriggered: false,
        };
        this.touches.set(t.identifier, tp);

        const lx = this.screenToLogicalX(t.clientX);
        const ly = this.screenToLogicalY(t.clientY);

        if (this.primaryActionTouchId !== null) {
          this.fireArcaneBolt();
          this.actionRipples.push({ x: lx, y: ly, life: 0.25, maxLife: 0.25, color: '#38f2ff', kind: 'swipe' });
        } else {
          this.primaryActionTouchId = t.identifier;
          this.pressJump();
          this.actionRipples.push({ x: lx, y: ly, life: 0.24, maxLife: 0.24, color: '#38bdf8', kind: 'tap' });

          if (now - this.lastRightTapTime < 265) {
            this.fireArcaneBolt();
            this.actionRipples.push({ x: lx, y: ly, life: 0.28, maxLife: 0.28, color: '#7dd3fc', kind: 'swipe' });
            this.lastRightTapTime = 0;
          } else {
            this.lastRightTapTime = now;
          }
        }
      }
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.target !== this.canvas) return;
    e.preventDefault();
    if (this.status !== 'PLAYING' || this.pausedForPortrait) return;

    const now = performance.now();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const tp = this.touches.get(t.identifier);
      if (!tp) continue;

      tp.currentX = t.clientX;
      tp.currentY = t.clientY;
      tp.history.push({ x: t.clientX, y: t.clientY, t: now });
      while (tp.history.length > 1 && now - tp.history[0].t > 140) {
        tp.history.shift();
      }

      if (tp.role === 'move') {
        const dx = tp.currentX - tp.originX;
        const deadzone = 7;
        const maxRadius = 60;
        const followRadius = 80;

        if (Math.abs(dx) > followRadius) {
          tp.originX = tp.currentX - Math.sign(dx) * followRadius;
        }

        const clampedDx = tp.currentX - tp.originX;
        if (Math.abs(clampedDx) <= deadzone) {
          this.touchMoveAxis = 0;
        } else {
          const mag = Math.min(1, (Math.abs(clampedDx) - deadzone) / (maxRadius - deadzone));
          this.touchMoveAxis = mag * Math.sign(clampedDx);
        }

        const oldest = tp.history[0];
        const dtMs = Math.max(1, now - oldest.t);
        const flickDy = tp.currentY - oldest.y;
        const flickDx = Math.abs(tp.currentX - oldest.x);
        const velY = flickDy / dtMs;

        if (!tp.flickTriggered && flickDy > 28 && velY > 0.28 && flickDy > flickDx * 0.9) {
          tp.flickTriggered = true;
          this.triggerSlide();
        } else if (tp.flickTriggered && flickDy < -12) {
          tp.flickTriggered = false;
        }
      } else if (tp.role === 'action') {
        const oldest = tp.history[0];
        const dtMs = Math.max(1, now - oldest.t);
        const swipeDx = tp.currentX - oldest.x;
        const swipeDy = Math.abs(tp.currentY - oldest.y);
        const velX = swipeDx / dtMs;

        if (!tp.swipeShotTriggered && swipeDx > 24 && velX > 0.24 && swipeDx > swipeDy * 1.1) {
          tp.swipeShotTriggered = true;
          this.fireArcaneBolt();
          this.actionRipples.push({
            x: this.screenToLogicalX(tp.currentX),
            y: this.screenToLogicalY(tp.currentY),
            life: 0.28,
            maxLife: 0.28,
            color: '#38f2ff',
            kind: 'swipe',
          });
        }
      }
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.target !== this.canvas) return;
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const tp = this.touches.get(t.identifier);
      if (!tp) continue;

      if (tp.id === this.moveTouchId) {
        this.moveTouchId = null;
        this.touchMoveAxis = 0;
      }
      if (tp.id === this.primaryActionTouchId) {
        this.primaryActionTouchId = null;
        this.releaseJump();
      }
      this.touches.delete(t.identifier);
    }
  };

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  private unbindEvents() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
  }

  private screenToLogicalX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    return ((clientX - rect.left) / Math.max(1, rect.width)) * this.viewW;
  }

  private screenToLogicalY(clientY: number): number {
    const rect = this.canvas.getBoundingClientRect();
    return ((clientY - rect.top) / Math.max(1, rect.height)) * this.viewH;
  }

  // -------------------- Player Actions --------------------

  private pressJump() {
    this.player.jumpBufferTimer = 0.13;
    this.player.jumpHeld = true;
  }

  private releaseJump() {
    this.player.jumpHeld = false;
    if (this.player.vy < -150) {
      this.player.vy *= 0.48;
    }
  }

  private triggerSlide() {
    if (this.player.sliding) {
      this.player.slideTimer = Math.max(this.player.slideTimer, 0.34);
      return;
    }
    this.player.sliding = true;
    this.player.slideTimer = this.level.slippery ? 0.56 : 0.42;

    const diff = this.player.h - SLIDE_H;
    this.player.y += diff;
    this.player.h = SLIDE_H;

    const dir =
      Math.abs(this.player.vx) > 25 ? (Math.sign(this.player.vx) as 1 | -1) : this.player.facing;
    this.player.facing = dir;
    const minBurst = this.level.slippery ? SLIDE_FLAT_SPEED + 75 : SLIDE_FLAT_SPEED;
    if (Math.abs(this.player.vx) < minBurst) {
      this.player.vx = dir * minBurst;
    }

    this.player.scaleX = 1.24;
    this.player.scaleY = 0.72;
    sound.playSlide();
    this.spawnParticles(this.player.x + this.player.w * 0.5, this.player.y + this.player.h, 8, {
      color: '#38bdf8',
      speedMin: 40,
      speedMax: 130,
      angleMin: Math.PI * 0.85,
      angleMax: Math.PI * 1.15,
      size: 3,
      life: 0.28,
      gravity: 120,
      glow: true,
    });
  }

  private endSlideIfClear() {
    if (!this.player.sliding) return;
    const standY = this.player.y - (NORMAL_H - SLIDE_H);
    const testBox = { x: this.player.x + 2, y: standY, w: this.player.w - 4, h: NORMAL_H - SLIDE_H };
    for (const p of this.level.platforms) {
      if (p.oneWay) continue;
      if (p.switchGroup && !this.isSwitchGroupActive(p.switchGroup)) continue;
      if (p.style === 'vanish_holo' && p.vanishState === 'gone') continue;
      if (this.rectsOverlap(testBox.x, testBox.y, testBox.w, testBox.h, p.x, p.y, p.w, p.h)) {
        return;
      }
    }
    this.player.y = standY;
    this.player.h = NORMAL_H;
    this.player.sliding = false;
  }

  private fireArcaneBolt() {
    if (this.player.shootCooldown > 0) return;
    this.player.shootCooldown = 0.23;
    this.player.castTimer = 0.16;

    const dir = this.player.facing;
    const spawnX = this.player.x + (dir > 0 ? this.player.w + 4 : -4);
    const spawnY = this.player.y + this.player.h * 0.44;

    this.projectiles.push({
      x: spawnX,
      y: spawnY,
      vx: dir * 680,
      vy: 0,
      r: 6,
      life: 1.05,
      trail: [],
    });

    this.addShake(2.2, 0.09);
    sound.playShoot();

    this.spawnParticles(spawnX, spawnY, 9, {
      color: '#38f2ff',
      speedMin: 60,
      speedMax: 210,
      angleMin: dir > 0 ? -0.6 : Math.PI - 0.6,
      angleMax: dir > 0 ? 0.6 : Math.PI + 0.6,
      size: 3.2,
      life: 0.22,
      gravity: 0,
      glow: true,
    });
  }

  // -------------------- Fixed Update --------------------

  private fixedUpdate(dt: number) {
    this.worldTime += dt;

    if (this.level.theme === 'airship_boss' || this.level.theme === 'thunder_airship' || this.level.theme === 'thunder_highway') {
      if (this.lightningAlpha > 0) this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.2);
      else if (Math.random() < (this.level.theme === 'thunder_airship' ? 0.007 : 0.004)) this.lightningAlpha = 0.28;
    }

    if (this.status !== 'PLAYING') {
      this.updateParticles(dt);
      this.updateScarf(dt);
      return;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateShake(dt);
      return;
    }

    this.runTime += dt;
    this.updateShake(dt);

    if (this.chronoSlowTimer > 0) {
      this.chronoSlowTimer = Math.max(0, this.chronoSlowTimer - dt);
    }
    for (const sw of this.level.switches) {
      if (sw.chrono && sw.cooldown && sw.cooldown > 0) {
        sw.cooldown -= dt;
        if (sw.cooldown <= 0) {
          sw.cooldown = 0;
          sw.activated = false;
        }
      }
    }
    const worldDt = this.chronoSlowTimer > 0 ? dt * 0.35 : dt;

    if (this.orbComboTimer > 0) {
      this.orbComboTimer -= dt;
      if (this.orbComboTimer <= 0) this.orbCombo = 0;
    }

    // Smooth metro lighting transition
    const anyLightSwitch = this.level.switches.some((s) => s.lightZone && s.activated);
    if (anyLightSwitch && this.metroLightLevel < 1) {
      this.metroLightLevel = Math.min(1, this.metroLightLevel + dt * 2.2);
    }

    if (this.player.slipstreamTimer > 0) this.player.slipstreamTimer = Math.max(0, this.player.slipstreamTimer - dt);
    if (this.player.cavernLightTimer > 0) this.player.cavernLightTimer = Math.max(0, this.player.cavernLightTimer - dt);
    if (this.player.chillTimer > 0) this.player.chillTimer = Math.max(0, this.player.chillTimer - dt);

    this.updateMovingPlatforms(worldDt);
    this.updateOrbitalPlatforms(worldDt);
    this.updateLotusPads(dt);
    this.updateGears(worldDt);
    this.updateVanishPlatforms(worldDt);
    this.updateCrumbleIce(worldDt);
    this.updateFloatBubbles(worldDt);
    this.updateBloomBridges(worldDt);
    this.updateSpiralBlooms(worldDt);
    this.updateMirrors(dt);
    this.updatePlayer(dt);
    this.updateSignatureGimmicks(dt, worldDt);
    if (!this.aiPaused) {
      this.updateHazards(worldDt);
      this.updateLightningStrikes(worldDt, dt);
      this.updateGroundSpikes(worldDt, dt);
      this.updateCannons(worldDt);
      this.updateProjectiles(dt, worldDt);
      this.updateEnemies(worldDt);
      this.updateBoss(worldDt);
    } else {
      // Still allow player shots against paused targets for testing!
      this.updateProjectiles(dt, dt);
    }
    this.updateOrbs(dt);
    this.updateCheckpoints();
    if (!this.sandboxEnemy) {
      this.updateGoal();
    }
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.updateActionRipples(dt);
    this.updateHoloReveals(dt);
    this.updateAtmosphere(dt);
    this.updateCamera(dt);

    if (this.worldTime - this.lastHudPush > 0.08) {
      this.pushHud(false);
    }
  }

  private updateGears(dt: number) {
    for (const g of this.level.gears) {
      g.angle += g.rotSpeed * dt;
    }
  }

  private updateAtmosphere(dt: number) {
    for (const r of this.rainDrops) {
      r.x -= r.spd * 0.25 * dt;
      r.y += r.spd * dt;
      if (r.y > LOGICAL_HEIGHT) {
        r.y = -20;
        r.x = Math.random() * (this.viewW + 200);
      }
      if (r.x < -40) r.x += this.viewW + 180;
    }
    for (const m of this.libraryMotes) {
      m.y -= m.spd * dt;
      m.phase += dt * 2;
      if (m.y < -15) {
        m.y = LOGICAL_HEIGHT + 10;
        m.x = Math.random() * this.viewW;
      }
    }
    const blz = this.level.blizzardConfig;
    let galeVx = 0;
    if (blz) {
      const cyc = blz.cyclePeriod || 6.0;
      const cycleIdx = Math.floor(this.worldTime / cyc);
      const t = this.worldTime - cycleIdx * cyc;
      if (t < blz.activeDuration) {
        galeVx = (cycleIdx % 2 === 0 ? 1 : -1) * 380;
      }
    }
    for (const sf of this.snowFlakes) {
      sf.drift += dt * 2.2;
      if (this.level.underwaterStage) {
        sf.y -= sf.spd * 0.75 * dt;
        sf.x += Math.sin(sf.drift) * 14 * dt;
        if (sf.y < -10) {
          sf.y = LOGICAL_HEIGHT + 10;
          sf.x = Math.random() * (this.viewW + 100);
        }
      } else {
        sf.y += sf.spd * dt;
        sf.x += (galeVx !== 0 ? galeVx : Math.sin(sf.drift) * 24 - 18) * dt;
        if (sf.y > LOGICAL_HEIGHT + 10) {
          sf.y = -10;
          sf.x = Math.random() * (this.viewW + 140);
        }
      }
      if (sf.x < -30) sf.x += this.viewW + 60;
      if (sf.x > this.viewW + 30) sf.x -= this.viewW + 60;
    }
  }

  private updateMovingPlatforms(dt: number) {
    for (const mp of this.level.movingPlatforms) {
      mp.prevX = mp.x;
      mp.prevY = mp.y;
      mp.phase += mp.speed * dt;
      const t = (Math.sin(mp.phase) + 1) * 0.5;
      mp.x = mp.startX + (mp.endX - mp.startX) * t;
      mp.y = mp.startY + (mp.endY - mp.startY) * t;
      mp.vx = (mp.x - mp.prevX) / Math.max(0.0001, dt);
      mp.vy = (mp.y - mp.prevY) / Math.max(0.0001, dt);
    }
  }

  private updateOrbitalPlatforms(dt: number) {
    for (const op of this.level.orbitalPlatforms ?? []) {
      op.prevX = op.x;
      op.prevY = op.y;
      op.angle += op.speed * dt;
      op.x = op.cx + Math.cos(op.angle) * op.rx - op.w * 0.5;
      op.y = op.cy + Math.sin(op.angle) * op.ry - op.h * 0.5;
    }
  }

  private updateLotusPads(dt: number) {
    for (const lp of this.level.lotusPads ?? []) {
      lp.prevY = lp.y + (lp.sinkOffset ?? 0);
      const maxSink = lp.maxSink ?? 24;
      const standing = this.player.onGround && this.player.standingLotus === lp;
      if (standing) {
        lp.sinkOffset = Math.min(maxSink, (lp.sinkOffset ?? 0) + 42 * dt);
      } else {
        lp.sinkOffset = Math.max(0, (lp.sinkOffset ?? 0) - 56 * dt);
      }
    }
  }

  private activateSpiralBloom(sb: SpiralBloomDef) {
    const first = !sb.active;
    sb.active = true;
    sb.timer = sb.duration || 8.5;
    if (first) {
      sound.playSwitchActivate();
      this.addFloatingText(sb.triggerX, sb.triggerY - 18, 'SPIRAL BLOOM!', '#6ee7b7');
    }
    this.spawnParticles(sb.triggerX, sb.triggerY, 14, {
      color: '#6ee7b7',
      speedMin: 50,
      speedMax: 160,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 3,
      life: 0.35,
      gravity: 40,
      glow: true,
    });
  }

  private updateSpiralBlooms(dt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;
    for (const sb of this.level.spiralBlooms ?? []) {
      if (sb.active) {
        sb.timer = (sb.timer ?? 0) - dt;
        if ((sb.timer ?? 0) <= 0) {
          sb.active = false;
          sb.timer = 0;
        }
      } else if (Math.hypot(pcx - sb.triggerX, pcy - sb.triggerY) < 30) {
        this.activateSpiralBloom(sb);
      }
    }
  }

  private triggerPollenPod(pod: PollenPodDef) {
    if (pod.popped) return;
    pod.popped = true;
    pod.respawnTimer = 4.2;
    sound.playExplosion();
    this.addShake(4.5, 0.14);
    this.particles.push({
      x: pod.x,
      y: pod.y,
      vx: 0,
      vy: 0,
      size: 24,
      color: '#6ee7b7',
      alpha: 1,
      life: 0.38,
      maxLife: 0.38,
      gravity: 0,
      glow: true,
      ring: true,
    });
    this.spawnParticles(pod.x, pod.y, 18, {
      color: '#fde047',
      speedMin: 70,
      speedMax: 220,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 3.2,
      life: 0.38,
      gravity: 90,
      glow: true,
    });
    for (const en of this.level.enemies) {
      if (!en.alive) continue;
      if (Math.hypot(en.x + en.w * 0.5 - pod.x, en.y + en.h * 0.5 - pod.y) <= 195) {
        this.damageEnemy(en, 2, 'blast');
      }
    }
    const p = this.player;
    if (Math.hypot(p.x + p.w * 0.5 - pod.x, p.y + p.h * 0.5 - pod.y) <= 115) {
      this.endSlideIfClear();
      p.vy = -425;
      p.onGround = false;
      p.airJumpsLeft = 1;
    }
    this.addFloatingText(pod.x, pod.y - 18, 'POLLEN BURST!', '#a7f3d0');
  }

  private updateSignatureGimmicks(dt: number, worldDt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;

    // 1-1 Neon Turbo Boost Pads (amplified visual shockwave & spark burst)
    for (const bp of this.level.boostPads ?? []) {
      if (this.rectsOverlap(p.x, p.y, p.w, p.h, bp.x, bp.y - 6, bp.w, bp.h + 8)) {
        const dir = Math.sign(bp.boostVx) || 1;
        if (Math.abs(p.vx) < Math.abs(bp.boostVx) || Math.sign(p.vx) !== dir) {
          p.vx = bp.boostVx;
          if (bp.boostVy) {
            this.endSlideIfClear();
            p.vy = bp.boostVy;
            p.onGround = false;
          }
          p.facing = dir as 1 | -1;
          p.airJumpsLeft = 1;
          sound.playSlide();
          this.addShake(2.2, 0.08);
          this.particles.push({
            x: bp.x + bp.w * 0.5,
            y: bp.y,
            vx: 0,
            vy: 0,
            size: 16,
            color: '#38f2ff',
            alpha: 0.95,
            life: 0.28,
            maxLife: 0.28,
            gravity: 0,
            glow: true,
            ring: true,
          });
          this.spawnParticles(pcx, p.y + p.h, 12, {
            color: '#38f2ff',
            speedMin: 80,
            speedMax: 220,
            angleMin: dir > 0 ? Math.PI * 0.75 : -0.35,
            angleMax: dir > 0 ? Math.PI * 1.25 : 0.35,
            size: 3.1,
            life: 0.28,
            gravity: 60,
            glow: true,
          });
        }
      }
    }

    // 2-1 Chrono Chime Speed Rings
    for (const cr of this.level.chimeRings ?? []) {
      if (cr.cooldown && cr.cooldown > 0) cr.cooldown = Math.max(0, cr.cooldown - dt);
      if ((!cr.cooldown || cr.cooldown <= 0) && Math.hypot(pcx - cr.x, pcy - cr.y) <= cr.r + 16) {
        cr.cooldown = 0.65;
        this.endSlideIfClear();
        p.grindingRail = null;
        p.vx = cr.boostVx;
        p.vy = cr.boostVy;
        p.onGround = false;
        p.airJumpsLeft = 1;
        p.facing = cr.boostVx >= 0 ? 1 : -1;
        this.score += 150;
        sound.playSwitchActivate();
        this.addFloatingText(cr.x, cr.y - 18, 'CHIME RUSH +150', '#fde047');
        this.spawnParticles(cr.x, cr.y, 14, {
          color: '#fde047',
          speedMin: 60,
          speedMax: 200,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 3.0,
          life: 0.3,
          gravity: 40,
          glow: true,
        });
      }
    }

    // 3-1 Emerald Aero Wind Rings
    for (const wr of this.level.windRings ?? []) {
      if (wr.cooldown && wr.cooldown > 0) wr.cooldown = Math.max(0, wr.cooldown - dt);
      if ((!wr.cooldown || wr.cooldown <= 0) && Math.hypot(pcx - wr.x, pcy - wr.y) <= wr.r + 16) {
        wr.cooldown = 0.6;
        this.endSlideIfClear();
        p.grabbedVine = null;
        p.vx = wr.launchVx;
        p.vy = wr.launchVy;
        p.onGround = false;
        p.airJumpsLeft = 1;
        p.facing = wr.launchVx >= 0 ? 1 : -1;
        this.score += 120;
        sound.playJump(true);
        this.addFloatingText(wr.x, wr.y - 18, 'AERO BOOST +120', '#6ee7b7');
        this.spawnParticles(wr.x, wr.y, 14, {
          color: '#34d399',
          speedMin: 60,
          speedMax: 190,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 3.0,
          life: 0.32,
          gravity: 30,
          glow: true,
        });
      }
    }

    // 3-2 Resonant Pollen Pods
    for (const pod of this.level.pollenPods ?? []) {
      if (pod.popped) {
        pod.respawnTimer = (pod.respawnTimer ?? 0) - worldDt;
        if ((pod.respawnTimer ?? 0) <= 0) {
          pod.popped = false;
          pod.respawnTimer = 0;
        }
      } else if (Math.hypot(pcx - pod.x, pcy - pod.y) <= pod.r + 15) {
        this.triggerPollenPod(pod);
      }
    }

    // 3-4 Bioluminescent Spore Lanterns
    for (const gl of this.level.glowLanterns ?? []) {
      if (gl.litTimer && gl.litTimer > 0) {
        gl.litTimer = Math.max(0, gl.litTimer - dt);
      }
      if (Math.hypot(pcx - gl.x, pcy - gl.y) <= gl.r + 18 && (!gl.litTimer || gl.litTimer < 5.5)) {
        const fresh = !gl.litTimer || gl.litTimer <= 0;
        gl.litTimer = 8.0;
        this.player.cavernLightTimer = Math.max(this.player.cavernLightTimer, 6.5);
        if (fresh) {
          sound.playSwitchActivate();
          this.score += 150;
          this.addFloatingText(gl.x, gl.y - 18, 'SPORE LANTERN +150', '#a7f3d0');
          this.spawnParticles(gl.x, gl.y, 12, {
            color: '#6ee7b7',
            speedMin: 40,
            speedMax: 140,
            angleMin: 0,
            angleMax: Math.PI * 2,
            size: 2.8,
            life: 0.34,
            gravity: -20,
            glow: true,
          });
        }
      }
    }

    // 3-6 Emerald Slipstream Leaf Gates
    for (const sg of this.level.slipstreamGates ?? []) {
      if (sg.cooldown && sg.cooldown > 0) sg.cooldown = Math.max(0, sg.cooldown - dt);
      if (
        (!sg.cooldown || sg.cooldown <= 0) &&
        this.rectsOverlap(p.x, p.y, p.w, p.h, sg.x - 14, sg.y, 28, sg.h)
      ) {
        sg.cooldown = 1.4;
        p.slipstreamTimer = 2.2;
        p.vx = Math.max(p.vx, 430);
        p.airJumpsLeft = 1;
        this.score += 150;
        sound.playSwitchActivate();
        this.addFloatingText(sg.x, sg.y - 12, 'SLIPSTREAM +150', '#6ee7b7');
        this.spawnParticles(sg.x, pcy, 14, {
          color: '#34d399',
          speedMin: 80,
          speedMax: 220,
          angleMin: -0.6,
          angleMax: 0.6,
          size: 3.0,
          life: 0.3,
          gravity: 20,
          glow: true,
        });
      }
    }

    // 3-BOSS Sanctuary Gale Columns
    for (const gu of this.level.sanctuaryGusts ?? []) {
      const cyc = gu.cyclePeriod || 4.0;
      const t = (((this.worldTime + gu.phase) % cyc) + cyc) % cyc;
      const active = t >= cyc - gu.activeDuration;
      if (active && this.rectsOverlap(p.x, p.y, p.w, p.h, gu.x, gu.y, gu.w, gu.h)) {
        p.vy = Math.min(p.vy, gu.liftVy);
        p.vy = Math.max(-440, p.vy - 920 * dt);
        p.airJumpsLeft = 1;
        if (Math.random() < 0.35) {
          this.spawnParticles(pcx + (Math.random() - 0.5) * 18, p.y + p.h, 1, {
            color: '#a7f3d0',
            speedMin: 40,
            speedMax: 120,
            angleMin: -Math.PI * 0.6,
            angleMax: -Math.PI * 0.4,
            size: 2.5,
            life: 0.25,
            gravity: -60,
            glow: true,
          });
        }
      }
    }

    // 4-2 Cryo Bumpers (Directional radial freeze-spring launch)
    for (const cb of this.level.cryoBumpers ?? []) {
      if (cb.cooldown && cb.cooldown > 0) cb.cooldown = Math.max(0, cb.cooldown - dt);
      if ((!cb.cooldown || cb.cooldown <= 0) && Math.hypot(pcx - cb.x, pcy - cb.y) <= cb.r + 16) {
        const dx = pcx - cb.x;
        const dy = pcy - cb.y;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        this.endSlideIfClear();
        p.grindingRail = null;
        p.grabbedVine = null;
        p.onGround = false;
        p.vx = nx * cb.launchSpeed * 0.85;
        p.vy = Math.min(-340, ny * cb.launchSpeed);
        p.airJumpsLeft = 1;
        cb.cooldown = 0.28;
        p.scaleX = 0.78;
        p.scaleY = 1.24;
        this.score += 50;
        sound.playJump(true);
        this.addFloatingText(cb.x, cb.y - 16, 'CRYO BOUNCE!', '#7dd3fc');
        this.spawnParticles(cb.x, cb.y, 14, {
          color: '#7dd3fc',
          speedMin: 60,
          speedMax: 195,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 3.0,
          life: 0.3,
          gravity: 50,
          glow: true,
        });
      }
    }

    // 4-4 Cryo Geysers (Upward ice steam columns)
    for (const cg of this.level.cryoGeysers ?? []) {
      const cyc = cg.cyclePeriod || 4.0;
      const t = (((this.worldTime + cg.phase) % cyc) + cyc) % cyc;
      const active = t >= cyc - cg.activeDuration;
      if (active && this.rectsOverlap(p.x, p.y, p.w, p.h, cg.x, cg.y - cg.maxHeight, cg.w, cg.maxHeight)) {
        this.endSlideIfClear();
        p.onGround = false;
        p.vy = Math.max(-440, Math.min(p.vy - 920 * dt, -340));
        p.airJumpsLeft = 1;
        if (Math.random() < 0.35) {
          this.spawnParticles(pcx + (Math.random() - 0.5) * 16, p.y + p.h, 1, {
            color: '#bae6fd',
            speedMin: 40,
            speedMax: 130,
            angleMin: -Math.PI * 0.6,
            angleMax: -Math.PI * 0.4,
            size: 2.5,
            life: 0.25,
            gravity: -60,
            glow: true,
          });
        }
      }
    }

    // 4-FORT1 / 4-FORT2 Phase Water Switches (touch activation)
    for (const pw of this.level.phaseWaterSwitches ?? []) {
      if (pw.cooldown && pw.cooldown > 0) pw.cooldown = Math.max(0, pw.cooldown - dt);
      if ((!pw.cooldown || pw.cooldown <= 0) && Math.hypot(pcx - pw.x, pcy - pw.y) <= pw.r + 18) {
        this.togglePhaseWater(pw);
      }
    }

    // 4-5 Cryo Lanterns (Dark ocean trench glow)
    for (const cl of this.level.cryoLanterns ?? []) {
      if (cl.litTimer && cl.litTimer > 0) {
        cl.litTimer = Math.max(0, cl.litTimer - dt);
      }
      if (Math.hypot(pcx - cl.x, pcy - cl.y) <= cl.r + 18 && (!cl.litTimer || cl.litTimer < 5.5)) {
        const fresh = !cl.litTimer || cl.litTimer <= 0;
        cl.litTimer = 8.0;
        this.player.cavernLightTimer = Math.max(this.player.cavernLightTimer, 6.5);
        if (fresh) {
          sound.playSwitchActivate();
          this.score += 150;
          this.addFloatingText(cl.x, cl.y - 18, 'CRYO LANTERN +150', '#7dd3fc');
          this.spawnParticles(cl.x, cl.y, 12, {
            color: '#38bdf8',
            speedMin: 40,
            speedMax: 140,
            angleMin: 0,
            angleMax: Math.PI * 2,
            size: 2.8,
            life: 0.34,
            gravity: -20,
            glow: true,
          });
        }
      }
    }

    // Snap scarf nodes so scarf doesn't stretch across the entire map!
    for (let i = 0; i < this.player.scarfNodes.length; i++) {
      this.player.scarfNodes[i].x = this.player.x + 12 - i * 4;
      this.player.scarfNodes[i].y = this.player.y + 16;
    }

    this.spawnParticles(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5, 18, {
      color: target.color,
      speedMin: 50,
      speedMax: 210,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 3.6,
      life: 0.4,
      gravity: 0,
      glow: true,
    });
  }

  private getKeyboardMoveAxis(): number {
    let axis = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) axis -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) axis += 1;
    return axis;
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
    if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dt;
    if (p.shootCooldown > 0) p.shootCooldown -= dt;
    if (p.castTimer > 0) p.castTimer -= dt;
    if (p.spinTimer > 0) p.spinTimer -= dt;
    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (this.stompGraceTimer > 0) this.stompGraceTimer -= dt;
    if (p.vineCooldown > 0) p.vineCooldown -= dt;
    if (p.catapultCooldown > 0) p.catapultCooldown -= dt;

    p.blinkTimer -= dt;
    if (p.blinkTimer < -0.11) p.blinkTimer = 2.4 + Math.random() * 2.8;

    // Gravity Zones check (Arcane Library)
    p.inGravityMode = null;
    for (const gz of this.level.gravityZones) {
      if (this.rectsOverlap(p.x, p.y, p.w, p.h, gz.x, gz.y, gz.w, gz.h)) {
        p.inGravityMode = gz.mode;
        break;
      }
    }

    if (p.onGround && p.standingPlatform) {
      p.x += p.standingPlatform.x - p.standingPlatform.prevX;
      p.y += p.standingPlatform.y - p.standingPlatform.prevY;
    }
    if (p.onGround && p.standingOrbital) {
      p.x += p.standingOrbital.x - p.standingOrbital.prevX;
      p.y += p.standingOrbital.y - p.standingOrbital.prevY;
    }
    if (p.onGround && p.standingLotus) {
      const currLotusY = p.standingLotus.y + (p.standingLotus.sinkOffset ?? 0);
      p.y += currLotusY - (p.standingLotus.prevY ?? currLotusY);
    }
    if (p.onGround && p.standingBubble && !p.standingBubble.popped) {
      const bPos = this.getFloatBubblePos(p.standingBubble);
      p.x += bPos.dx;
      p.y += bPos.dy;
    }

    // Spore Catapult Launcher (W3)
    if (p.catapultCooldown <= 0) {
      for (const cat of this.level.sporeCatapults) {
        if (this.rectsOverlap(p.x, p.y, p.w, p.h, cat.x, cat.y - 4, cat.w, cat.h + 6)) {
          this.endSlideIfClear();
          p.grindingRail = null;
          p.grabbedVine = null;
          p.standingBubble = null;
          p.standingPlatform = null;
          p.standingGear = null;
          p.onGround = false;
          p.vx = cat.launchVx;
          p.vy = cat.launchVy;
          p.y = cat.y - p.h - 4;
          p.airJumpsLeft = 1;
          p.catapultCooldown = 0.28;
          p.scaleX = 0.74;
          p.scaleY = 1.32;
          p.facing = cat.launchVx >= 0 ? 1 : -1;
          sound.playJump(true);
          this.spawnParticles(cat.x + cat.w * 0.5, cat.y, 16, {
            color: '#6ee7b7',
            speedMin: 60,
            speedMax: 210,
            angleMin: -Math.PI,
            angleMax: 0,
            size: 3.2,
            life: 0.34,
            gravity: 120,
            glow: true,
          });
          break;
        }
      }
    }

    // Pendulum Vine Swing (W3)
    if (p.grabbedVine) {
      const v = p.grabbedVine;
      const ang = Math.sin(this.worldTime * v.speed + v.phase) * v.maxAngle;
      const tipX = v.cx + Math.sin(ang) * v.length;
      const tipY = v.cy + Math.cos(ang) * v.length;
      const swingVx = Math.cos(ang) * v.maxAngle * v.speed * v.length * 0.74;
      const kbAxisVine = this.getKeyboardMoveAxis();
      const moveAxisVine = Math.abs(this.touchMoveAxis) > 0.01 ? this.touchMoveAxis : kbAxisVine;

      p.x = tipX - p.w * 0.5;
      p.y = tipY - p.h * 0.42;
      p.vx = swingVx;
      p.vy = 0;
      p.onGround = false;
      p.airJumpsLeft = 1;
      p.facing = Math.abs(moveAxisVine) > 0.15 ? (moveAxisVine > 0 ? 1 : -1) : swingVx >= 0 ? 1 : -1;

      if (p.jumpBufferTimer > 0) {
        p.grabbedVine = null;
        p.vineCooldown = 0.34;
        p.jumpBufferTimer = 0;
        p.vy = JUMP_VEL * 1.05;
        p.vx = Math.max(-440, Math.min(440, swingVx + moveAxisVine * 185));
        p.scaleX = 0.78;
        p.scaleY = 1.26;
        sound.playJump(false);
        this.spawnParticles(tipX, tipY, 8, {
          color: '#34d399',
          speedMin: 40,
          speedMax: 130,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 2.8,
          life: 0.25,
          gravity: 80,
          glow: true,
        });
      }

      if (p.x + p.w > this.level.width) {
        p.x = this.level.width - p.w;
        p.grabbedVine = null;
      }
      p.scaleX += (1 - p.scaleX) * Math.min(1, 16 * dt);
      p.scaleY += (1 - p.scaleY) * Math.min(1, 16 * dt);
      this.updateScarf(dt);
      return;
    }

    // Grab Pendulum Vine mid-air or jumping
    if (!p.grindingRail && p.vineCooldown <= 0) {
      const pcxV = p.x + p.w * 0.5;
      const pcyV = p.y + p.h * 0.5;
      for (const v of this.level.pendulumVines) {
        const ang = Math.sin(this.worldTime * v.speed + v.phase) * v.maxAngle;
        const tipX = v.cx + Math.sin(ang) * v.length;
        const tipY = v.cy + Math.cos(ang) * v.length;
        if (Math.hypot(pcxV - tipX, pcyV - tipY) < 36) {
          this.endSlideIfClear();
          p.grabbedVine = v;
          p.onGround = false;
          p.standingPlatform = null;
          p.standingBubble = null;
          p.standingGear = null;
          p.airJumpsLeft = 1;
          p.jumpBufferTimer = 0;
          sound.playSwitchActivate();
          p.scaleX = 0.86;
          p.scaleY = 1.18;
          this.updateScarf(dt);
          return;
        }
      }
    }

    // Thunder Rail Grind mode (W2)
    if (p.grindingRail) {
      const rail = p.grindingRail;
      const rdx = rail.x2 - rail.x1;
      const rdy = rail.y2 - rail.y1;
      const rLen = Math.hypot(rdx, rdy) || 1;
      const ux = rdx / rLen;
      const uy = rdy / rLen;

      const pcx = p.x + p.w * 0.5 + ux * rail.speed * dt;
      const t = (pcx - rail.x1) / (rail.x2 - rail.x1 || 1);
      p.vx = ux * rail.speed;
      p.vy = uy * rail.speed;
      p.facing = ux >= 0 ? 1 : -1;
      p.onGround = true;
      p.coyoteTimer = 0.12;
      p.airJumpsLeft = 1;
      p.runCycle += dt * 16;

      if (Math.random() < 0.75) {
        this.spawnParticles(pcx, p.y + p.h, 2, {
          color: '#fde047',
          speedMin: 40,
          speedMax: 130,
          angleMin: Math.PI * 0.75,
          angleMax: Math.PI * 1.25,
          size: 2.6,
          life: 0.22,
          gravity: 220,
          glow: true,
        });
      }

      if (p.jumpBufferTimer > 0) {
        p.grindingRail = null;
        p.vy = JUMP_VEL;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.airJumpsLeft = 1;
        p.scaleX = 0.78;
        p.scaleY = 1.26;
        sound.playJump(false);
      } else if (t < 0 || t > 1) {
        p.grindingRail = null;
        p.onGround = false;
        p.vy = uy * rail.speed - 90;
      } else {
        p.x = pcx - p.w * 0.5;
        p.y = rail.y1 + rdy * t - p.h;
      }

      if (this.level.autoScrollSpeed) {
        if (this.level.scrollCrush && p.x < this.camX + 6) {
          if (p.invulnTimer <= 0) {
            this.damagePlayer(false, 1, DAMAGE_TABLE.scroll_crush);
          }
          p.grindingRail = null;
          p.x = this.camX + 32;
          p.vx = this.level.autoScrollSpeed + 160;
        } else if (p.x + p.w > this.camX + this.viewW - 10) {
          p.x = this.camX + this.viewW - 10 - p.w;
          p.grindingRail = null;
        }
      }
      if (p.x + p.w > this.level.width) {
        p.x = this.level.width - p.w;
        p.grindingRail = null;
      }
      p.scaleX += (1 - p.scaleX) * Math.min(1, 16 * dt);
      p.scaleY += (1 - p.scaleY) * Math.min(1, 16 * dt);
      this.updateScarf(dt);
      return;
    }

    let gearCarryVx = 0;
    if (p.onGround && p.standingGear) {
      gearCarryVx = p.standingGear.rotSpeed * p.standingGear.r * 0.72;
      p.x += gearCarryVx * dt;
    }
    if (p.onGround && p.standingStreamVx !== 0) {
      p.x += p.standingStreamVx * dt;
    }

    const kbAxis = this.getKeyboardMoveAxis();
    const moveAxis = Math.abs(this.touchMoveAxis) > 0.01 ? this.touchMoveAxis : kbAxis;
    const isKeyboard = Math.abs(kbAxis) > 0.01 && Math.abs(this.touchMoveAxis) < 0.01;

    const isSlippery = Boolean(this.level.slippery || p.standingIce);
    const inLiquidWater =
      Boolean(this.level.underwaterStage) ||
      this.level.platforms.some(
        (plat) =>
          plat.style === 'freeze_water' &&
          plat.waterState === 'liquid' &&
          this.rectsOverlap(p.x, p.y, p.w, p.h, plat.x, plat.y, plat.w, plat.h)
      );

    // 4-3 / 4-BOSS Blizzard Periodic Gale Wind (blocked if sheltered by windbreak wall)
    const blz = this.level.blizzardConfig;
    if (blz) {
      const cyc = blz.cyclePeriod || 6.0;
      const cycleIdx = Math.floor(this.worldTime / cyc);
      const t = this.worldTime - cycleIdx * cyc;
      if (t < blz.activeDuration) {
        const dir = cycleIdx % 2 === 0 ? 1 : -1;
        const pcxB = p.x + p.w * 0.5;
        const sheltered = this.level.platforms.some(
          (wb) =>
            wb.windbreak &&
            !(p.y + p.h < wb.y || p.y > wb.y + wb.h) &&
            (dir > 0
              ? wb.x + wb.w <= pcxB && pcxB - (wb.x + wb.w) <= 240
              : wb.x >= pcxB && wb.x - pcxB <= 240)
        );
        if (!sheltered) {
          p.x += dir * blz.windVx * (p.onGround ? 0.72 : 1.0) * dt;
        }
      }
    }

    if (p.sliding) {
      p.slideTimer -= dt;
      if (p.onSlope) {
        const slope = p.onSlope;
        const angle = Math.atan2(slope.y2 - slope.y1, slope.x2 - slope.x1);
        p.vx += Math.sin(angle) * 980 * dt;
        p.vx = Math.max(-SLIDE_SLOPE_MAX, Math.min(SLIDE_SLOPE_MAX, p.vx));
        if (Math.sign(p.vx) === Math.sign(slope.y2 - slope.y1)) {
          p.slideTimer = Math.max(p.slideTimer, 0.14);
        }
        if (Math.random() < 0.55) {
          this.spawnParticles(p.x + p.w * 0.4, p.y + p.h, 1, {
            color: '#38f2ff',
            speedMin: 30,
            speedMax: 110,
            angleMin: Math.PI * 0.9,
            angleMax: Math.PI * 1.35,
            size: 2.6,
            life: 0.24,
            gravity: 220,
            glow: true,
          });
        }
      } else {
        const slideKeep = isSlippery ? 0.58 : 0.28;
        p.vx *= Math.pow(slideKeep, dt);
        if (p.onGround && Math.random() < 0.35) {
          this.spawnParticles(p.x + p.w * 0.5, p.y + p.h, 1, {
            color: isSlippery ? '#7dd3fc' : '#94a3b8',
            speedMin: 20,
            speedMax: 65,
            angleMin: Math.PI * 0.8,
            angleMax: Math.PI * 1.2,
            size: 2.5,
            life: 0.22,
            gravity: 60,
          });
        }
      }

      const holdingDown = this.keys.has('ArrowDown') || this.keys.has('KeyS');
      if (p.slideTimer <= 0 && !holdingDown) {
        this.endSlideIfClear();
      }
    }

    if (!p.sliding || Math.abs(moveAxis) > 0.25) {
      let targetSpeed = 0;
      const chillMul = p.chillTimer > 0 ? 0.58 : 1.0;
      const waterMul = inLiquidWater ? 0.78 : 1.0;
      const effRunSpeed = (p.slipstreamTimer > 0 ? RUN_SPEED * 1.28 : RUN_SPEED) * chillMul * waterMul;
      if (Math.abs(moveAxis) > 0.01) {
        if (isKeyboard) {
          targetSpeed = moveAxis * effRunSpeed;
        } else {
          const mag = Math.abs(moveAxis);
          const speed =
            (mag < 0.45
              ? WALK_SPEED * (mag / 0.45)
              : WALK_SPEED + ((mag - 0.45) / 0.55) * (RUN_SPEED - WALK_SPEED)) *
            chillMul *
            waterMul;
          targetSpeed = Math.sign(moveAxis) * speed;
        }
        if (gearCarryVx !== 0 && Math.sign(moveAxis) === Math.sign(gearCarryVx)) {
          targetSpeed += Math.sign(moveAxis) * Math.min(115, Math.abs(gearCarryVx) * 0.65);
        }
        if (!p.sliding) p.facing = Math.sign(moveAxis) as 1 | -1;
      }

      if (!p.sliding) {
        const accel = p.onGround ? (isSlippery ? 1120 : GROUND_ACCEL) : AIR_ACCEL;
        const decel = p.onGround ? (isSlippery ? 260 : GROUND_DECEL) : AIR_DECEL;
        const reversing = targetSpeed !== 0 && p.vx !== 0 && Math.sign(targetSpeed) !== Math.sign(p.vx);

        if (targetSpeed !== 0) {
          const rate = reversing && p.onGround ? (isSlippery ? 1180 : SKID_DECEL) : accel;
          if (p.vx < targetSpeed) p.vx = Math.min(targetSpeed, p.vx + rate * dt);
          else if (p.vx > targetSpeed) p.vx = Math.max(targetSpeed, p.vx - rate * dt);
        } else {
          if (p.vx > 0) p.vx = Math.max(0, p.vx - decel * dt);
          else if (p.vx < 0) p.vx = Math.min(0, p.vx + decel * dt);
        }
      }
    }

    if (p.jumpBufferTimer > 0) {
      if (inLiquidWater) {
        this.endSlideIfClear();
        p.vy = -305;
        p.onGround = false;
        p.standingPlatform = null;
        p.standingGear = null;
        p.jumpBufferTimer = 0;
        p.airJumpsLeft = 1;
        p.scaleX = 0.84;
        p.scaleY = 1.18;
        sound.playJump(false);
        this.spawnParticles(p.x + p.w * 0.5, p.y + p.h * 0.6, 5, {
          color: '#7dd3fc',
          speedMin: 30,
          speedMax: 90,
          angleMin: -Math.PI * 0.85,
          angleMax: -Math.PI * 0.15,
          size: 2.8,
          life: 0.3,
          gravity: -40,
          glow: true,
        });
      } else if (p.coyoteTimer > 0) {
        this.endSlideIfClear();
        const lotusBoost =
          p.standingLotus && (p.standingLotus.sinkOffset ?? 0) > 6
            ? 1 + Math.min(1, (p.standingLotus.sinkOffset ?? 0) / (p.standingLotus.maxSink ?? 24)) * 0.34
            : 1;
        p.vy = JUMP_VEL * lotusBoost;
        p.onGround = false;
        p.onSlope = null;
        p.standingPlatform = null;
        p.standingLotus = null;
        p.standingOrbital = null;
        p.standingGear = null;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.airJumpsLeft = 1;
        p.scaleX = 0.78;
        p.scaleY = 1.26;
        sound.playJump(false);
        this.spawnParticles(p.x + p.w * 0.5, p.y + p.h, 7, {
          color: '#94a3b8',
          speedMin: 35,
          speedMax: 110,
          angleMin: -Math.PI * 0.9,
          angleMax: -Math.PI * 0.1,
          size: 3,
          life: 0.25,
          gravity: 140,
        });
      } else if (p.airJumpsLeft > 0) {
        this.endSlideIfClear();
        p.vy = DOUBLE_JUMP_VEL;
        p.airJumpsLeft = 0;
        p.jumpBufferTimer = 0;
        p.spinTimer = 0.3;
        p.scaleX = 0.82;
        p.scaleY = 1.22;
        sound.playJump(true);
        this.particles.push({
          x: p.x + p.w * 0.5,
          y: p.y + p.h,
          vx: 0,
          vy: 15,
          size: 10,
          color: '#38f2ff',
          alpha: 0.95,
          life: 0.28,
          maxLife: 0.28,
          gravity: 0,
          glow: true,
          ring: true,
        });
        this.spawnParticles(p.x + p.w * 0.5, p.y + p.h, 10, {
          color: '#38f2ff',
          speedMin: 65,
          speedMax: 170,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 2.8,
          life: 0.32,
          gravity: 80,
          glow: true,
        });
      }
    }

    // Variable Jump + Gravity Zones + Swim Water
    let grav = GRAVITY_DOWN;
    if (p.vy < 0) {
      grav = Math.abs(p.vy) < 85 && p.jumpHeld ? GRAVITY_APEX : GRAVITY_UP;
    } else if (Math.abs(p.vy) < 75 && p.jumpHeld) {
      grav = GRAVITY_APEX;
    }

    if (p.inGravityMode === 'low_grav') {
      grav *= 0.54;
    } else if (p.inGravityMode === 'updraft') {
      p.vy -= 1420 * dt;
      p.vy = Math.max(-340, p.vy);
      grav *= 0.45;
      p.airJumpsLeft = 1;
    }
    if (inLiquidWater) {
      grav *= 0.36;
    }

    const maxFall = inLiquidWater ? 215 : p.inGravityMode === 'low_grav' ? 380 : MAX_FALL;
    p.vy = Math.min(maxFall, p.vy + grav * dt);

    const wasOnGround = p.onGround;
    const preLandingVy = p.vy;

    p.x += p.vx * dt;
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    if (this.level.autoScrollSpeed) {
      if (this.level.scrollCrush) {
        if (p.x < this.camX + 6) {
          if (p.invulnTimer <= 0) {
            this.damagePlayer(false, 1, DAMAGE_TABLE.scroll_crush);
          }
          p.x = this.camX + 34;
          p.vx = this.level.autoScrollSpeed + 170;
          p.vy = Math.min(p.vy, -220);
        }
        if (p.x + p.w > this.camX + this.viewW - 10) {
          p.x = this.camX + this.viewW - 10 - p.w;
          if (p.vx > 0) p.vx = Math.min(p.vx, this.level.autoScrollSpeed);
        }
      } else if (p.x < this.camX + 10) {
        p.x = this.camX + 10;
        p.vx = Math.max(p.vx, this.level.autoScrollSpeed);
      }
    }
    if (this.level.boss && this.level.boss.active && !this.level.boss.defeated) {
      const b = this.level.boss;
      if (p.x < b.arenaMinX) {
        p.x = b.arenaMinX;
        if (p.vx < 0) p.vx = 0;
      }
      if (p.x + p.w > b.arenaMaxX) {
        p.x = b.arenaMaxX - p.w;
        if (p.vx > 0) p.vx = 0;
      }
    }
    if (p.x + p.w > this.level.width) {
      p.x = this.level.width - p.w;
      p.vx = 0;
    }
    this.resolveHorizontalCollisions();

    const prevBottom = p.y + p.h;
    const prevStandingGear = p.standingGear;
    p.y += p.vy * dt;
    p.onGround = false;
    p.onSlope = null;
    p.standingPlatform = null;
    p.standingGear = null;
    p.standingBubble = null;
    p.standingLotus = null;
    p.standingOrbital = null;
    p.standingStreamVx = 0;
    p.standingIce = false;

    this.resolveVerticalCollisions(prevBottom, wasOnGround, prevStandingGear);

    if (!wasOnGround && p.onGround && preLandingVy > 110) {
      const intensity = Math.min(1, preLandingVy / 550);
      p.scaleX = 1 + 0.26 * intensity;
      p.scaleY = 1 - 0.24 * intensity;
      sound.playLand(intensity);
      this.spawnParticles(p.x + p.w * 0.5, p.y + p.h, 6 + Math.floor(intensity * 4), {
        color: '#94a3b8',
        speedMin: 30,
        speedMax: 110,
        angleMin: -Math.PI * 0.92,
        angleMax: -Math.PI * 0.08,
        size: 2.8,
        life: 0.24,
        gravity: 160,
      });
    }

    if (p.onGround) {
      p.coyoteTimer = 0.11;
      p.airJumpsLeft = 1;
    }

    p.scaleX += (1 - p.scaleX) * Math.min(1, 16 * dt);
    p.scaleY += (1 - p.scaleY) * Math.min(1, 16 * dt);

    if (p.onGround && !p.sliding && Math.abs(p.vx) > 15) {
      p.runCycle += (Math.abs(p.vx) / 42) * dt;
    } else if (p.onGround) {
      p.runCycle = 0;
    }

    this.updateScarf(dt);

    const deathY =
      this.level.deathY ??
      (this.level.verticalClimb
        ? Math.min(LOGICAL_HEIGHT + 90, p.checkpointY + 260)
        : this.level.verticalDescent
          ? Math.max(1060, p.checkpointY + 340)
          : Math.max(LOGICAL_HEIGHT + 90, this.stageMaxCamY + LOGICAL_HEIGHT + 70));
    if (p.y > deathY) {
      this.damagePlayer(true, -1, DAMAGE_TABLE.pitfall);
    }
  }

  private resolveHorizontalCollisions() {
    const p = this.player;
    const solids: { x: number; y: number; w: number; h: number }[] = [];

    for (const plat of this.level.platforms) {
      if (plat.oneWay) continue;
      if (plat.switchGroup && !this.isSwitchGroupActive(plat.switchGroup)) continue;
      if (plat.style === 'vanish_holo' && plat.vanishState === 'gone') continue;
      if (plat.style === 'crumble_ice' && plat.crumbleState === 'gone') continue;
      if (plat.style === 'freeze_water' && plat.waterState === 'liquid') continue;
      solids.push(plat);
    }
    for (const sb of this.level.sealBlocks) {
      if (!sb.broken) solids.push(sb);
    }
    for (const cl of this.level.crystalLocks ?? []) {
      if (!cl.unlocked) {
        solids.push({ x: cl.barrierX, y: cl.barrierY, w: cl.barrierW, h: cl.barrierH });
      }
    }

    for (const s of solids) {
      if (this.rectsOverlap(p.x, p.y, p.w, p.h - 10, s.x, s.y, s.w, s.h)) {
        if (p.vx > 0) {
          p.x = s.x - p.w;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = s.x + s.w;
          p.vx = 0;
        }
      }
    }
  }

  private resolveVerticalCollisions(
    prevBottom: number,
    wasOnGround: boolean,
    prevStandingGear: GearPlatformDef | null
  ) {
    const p = this.player;

    const cx = p.x + p.w * 0.5;
    for (const slope of this.level.slopes) {
      if (cx >= slope.x1 - 4 && cx <= slope.x2 + 4) {
        const clampedX = Math.max(slope.x1, Math.min(slope.x2, cx));
        const t = (clampedX - slope.x1) / (slope.x2 - slope.x1);
        const surfaceY = slope.y1 + t * (slope.y2 - slope.y1);

        const snapTolerance = wasOnGround ? 15 : 8;
        if (p.vy >= 0 && p.y + p.h >= surfaceY - snapTolerance && prevBottom <= surfaceY + 18) {
          p.y = surfaceY - p.h;
          p.vy = 0;
          p.onGround = true;
          p.onSlope = slope;
          return;
        }
      }
    }

    // Thunder Rails (Grind on descent)
    if (p.vy >= 0 && !p.grindingRail) {
      for (const rail of this.level.rails) {
        const minRx = Math.min(rail.x1, rail.x2);
        const maxRx = Math.max(rail.x1, rail.x2);
        if (cx >= minRx - 4 && cx <= maxRx + 4) {
          const t = (cx - rail.x1) / (rail.x2 - rail.x1 || 1);
          const clampedT = Math.max(0, Math.min(1, t));
          const railY = rail.y1 + (rail.y2 - rail.y1) * clampedT;
          if (p.y + p.h >= railY - 8 && prevBottom <= railY + 14) {
            this.endSlideIfClear();
            p.grindingRail = rail;
            p.y = railY - p.h;
            p.vy = 0;
            p.onGround = true;
            p.airJumpsLeft = 1;
            sound.playSwitchActivate();
            return;
          }
        }
      }
    }

    // Rotating Gear Rim Surfaces (W2) — wide foot contact + anti-fall-through depenetration
    for (const g of this.level.gears) {
      const effR = g.r + g.toothDepth * 0.55;
      const rawDx = cx - g.cx;
      const footHalf = p.w * 0.34;
      const clampedDx = Math.abs(rawDx) <= footHalf ? 0 : rawDx - Math.sign(rawDx) * footHalf;
      if (Math.abs(clampedDx) <= effR * 0.99) {
        const surfaceY = g.cy - Math.sqrt(Math.max(0, effR * effR - clampedDx * clampedDx));
        const snapTol = prevStandingGear === g ? 28 : wasOnGround ? 20 : 12;
        const catchDepth = prevStandingGear === g ? 40 : 36;
        if (
          p.vy >= 0 &&
          p.y + p.h >= surfaceY - snapTol &&
          (prevBottom <= surfaceY + catchDepth || prevBottom <= g.cy + 16)
        ) {
          p.y = surfaceY - p.h;
          p.vy = 0;
          p.onGround = true;
          p.standingGear = g;
          return;
        }
      }
    }

    const checkPlatform = (
      rx: number,
      ry: number,
      rw: number,
      rh: number,
      oneWay: boolean,
      mp?: MovingPlatformDef,
      onLandPlat?: () => void
    ) => {
      if (!this.rectsOverlap(p.x, p.y, p.w, p.h, rx, ry, rw, rh)) return;

      if (oneWay) {
        if (p.vy >= 0 && prevBottom <= ry + 10) {
          p.y = ry - p.h;
          p.vy = 0;
          p.onGround = true;
          if (mp) p.standingPlatform = mp;
          if (onLandPlat) onLandPlat();
        }
      } else {
        if (p.vy >= 0 && prevBottom <= ry + 14) {
          p.y = ry - p.h;
          p.vy = 0;
          p.onGround = true;
          if (mp) p.standingPlatform = mp;
          if (onLandPlat) onLandPlat();
        } else if (p.vy < 0 && p.y < ry + rh && p.y + p.h > ry + rh) {
          p.y = ry + rh;
          p.vy = 0;
        }
      }
    };

    for (const plat of this.level.platforms) {
      if (plat.switchGroup && !this.isSwitchGroupActive(plat.switchGroup)) continue;
      if (plat.style === 'vanish_holo' && plat.vanishState === 'gone') continue;
      if (plat.style === 'crumble_ice' && plat.crumbleState === 'gone') continue;
      if (plat.style === 'freeze_water' && plat.waterState === 'liquid') continue;
      checkPlatform(plat.x, plat.y, plat.w, plat.h, Boolean(plat.oneWay), undefined, () => {
        if (plat.style === 'ice_floor' || (plat.style === 'freeze_water' && plat.waterState === 'ice')) {
          p.standingIce = true;
        }
        if (plat.bouncy || plat.style === 'emerald_bounce') {
          this.endSlideIfClear();
          p.vy = p.jumpHeld ? (-705) : (-625);
          p.onGround = false;
          p.airJumpsLeft = 1;
          p.scaleX = 0.78;
          p.scaleY = 1.28;
          sound.playJump(true);
          this.spawnParticles(p.x + p.w * 0.5, plat.y, 14, {
            color: '#34d399',
            speedMin: 45,
            speedMax: 185,
            angleMin: -Math.PI,
            angleMax: 0,
            size: 3.2,
            life: 0.32,
            gravity: 160,
            glow: true,
          });
        } else if (plat.style === 'sap_stream' || plat.style === 'brass_conveyor') {
          p.standingStreamVx = plat.streamVx ?? 0;
        } else if (plat.style === 'vanish_holo' && plat.vanishState === 'solid') {
          plat.vanishState = 'warning';
          plat.vanishTimer = 0.88;
        } else if (plat.style === 'crumble_ice' && plat.crumbleState !== 'cracking') {
          plat.crumbleState = 'cracking';
          plat.crumbleTimer = 0.50;
        }
      });
    }

    for (const lp of this.level.lotusPads ?? []) {
      const ly = lp.y + (lp.sinkOffset ?? 0);
      checkPlatform(lp.x, ly, lp.w, lp.h, true, undefined, () => {
        p.standingLotus = lp;
      });
    }

    for (const op of this.level.orbitalPlatforms ?? []) {
      checkPlatform(op.x, op.y, op.w, op.h, true, undefined, () => {
        p.standingOrbital = op;
      });
    }

    for (const sb of this.level.spiralBlooms ?? []) {
      if (!sb.active) continue;
      for (let k = 0; k < sb.stepsCount; k++) {
        const sx = sb.triggerX + sb.stepOffsetX * (k + 1);
        const sy = sb.triggerY - sb.stepRiseY * (k + 1);
        checkPlatform(sx, sy, sb.stepW, 14, true);
      }
    }

    for (const fb of this.level.floatBubbles) {
      if (fb.popped) continue;
      const bPos = this.getFloatBubblePos(fb);
      checkPlatform(bPos.x - fb.r * 0.9, bPos.y - fb.r, fb.r * 1.8, 16, true, undefined, () => {
        p.standingBubble = fb;
        p.airJumpsLeft = 1;
      });
    }

    for (const bb of this.level.bloomBridges) {
      if (!bb.active) continue;
      checkPlatform(bb.bridgeX, bb.bridgeY, bb.bridgeW, bb.bridgeH, true);
    }

    for (const mp of this.level.movingPlatforms) {
      checkPlatform(mp.x, mp.y, mp.w, mp.h, true, mp);
    }

    for (const sb of this.level.sealBlocks) {
      if (!sb.broken) {
        checkPlatform(sb.x, sb.y, sb.w, sb.h, false);
      }
    }
    for (const cl of this.level.crystalLocks ?? []) {
      if (!cl.unlocked) {
        checkPlatform(cl.barrierX, cl.barrierY, cl.barrierW, cl.barrierH, false);
      }
    }
  }

  private isPointInGear(px: number, py: number, g: GearPlatformDef): boolean {
    const dx = px - g.cx;
    const dy = py - g.cy;
    const dist = Math.hypot(dx, dy);
    if (dist > g.r + g.toothDepth) return false;
    if (dist <= g.r) return true;
    const ang = Math.atan2(dy, dx) - g.angle;
    const sector = (((ang / (Math.PI * 2)) * g.teeth) % 1 + 1) % 1;
    return sector < 0.5;
  }

  private isBeamLaserActive(bl: StageDefinition['beamLasers'][number]): boolean {
    if (bl.activeDuration >= bl.cyclePeriod - 0.01) return true;
    const t = (((this.worldTime + bl.phase) % bl.cyclePeriod) + bl.cyclePeriod) % bl.cyclePeriod;
    return t < bl.activeDuration;
  }

  private computeBeamEnd(bl: StageDefinition['beamLasers'][number]): {
    endX: number;
    endY: number;
    blockedByGear: boolean;
  } {
    const step = 6;
    for (let d = step; d <= bl.maxLength; d += step) {
      const sx = bl.x1 + bl.dirX * d;
      const sy = bl.y1 + bl.dirY * d;
      if (bl.occludable) {
        for (const g of this.level.gears) {
          if (this.isPointInGear(sx, sy, g)) {
            return { endX: sx, endY: sy, blockedByGear: true };
          }
        }
      }
    }
    return {
      endX: bl.x1 + bl.dirX * bl.maxLength,
      endY: bl.y1 + bl.dirY * bl.maxLength,
      blockedByGear: false,
    };
  }

  private getPlatformShockState(plat: PlatformDef): 'safe' | 'warn' | 'shock' {
    if (plat.style !== 'shock_bridge') return 'safe';
    const cycle = plat.shockCycle ?? 2.8;
    const duty = plat.shockDuty ?? 0.36;
    const phase = plat.shockPhase ?? 0;
    const t = (((this.worldTime + phase) % cycle) + cycle) % cycle / cycle;
    if (t >= 1 - duty) return 'shock';
    if (t >= 1 - duty - 0.16) return 'warn';
    return 'safe';
  }

  private findGroundY(x: number, refY = 370): number {
    let bestY = this.level.verticalClimb || this.level.verticalDescent ? refY + 20 : 370;
    let found = false;
    for (const plat of this.level.platforms) {
      if (plat.switchGroup && !this.isSwitchGroupActive(plat.switchGroup)) continue;
      if (plat.style === 'vanish_holo' && plat.vanishState === 'gone') continue;
      if (plat.style === 'crumble_ice' && plat.crumbleState === 'gone') continue;
      if (plat.style === 'freeze_water' && plat.waterState === 'liquid') continue;
      if (!this.level.verticalClimb && !this.level.verticalDescent && plat.y < 140) continue;
      if (this.level.verticalClimb && (plat.y < refY - 120 || plat.y > refY + 260)) continue;
      if (this.level.verticalDescent && (plat.y < refY - 60 || plat.y > refY + 420)) continue;
      if (x >= plat.x && x <= plat.x + plat.w) {
        if (!found || plat.y < bestY) {
          bestY = plat.y;
          found = true;
        }
      }
    }
    return bestY;
  }

  private updateLightningStrikes(worldDt: number, realDt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const cfg = this.level.lightningHazard;
    if (cfg && (!this.level.boss || !this.level.boss.active)) {
      const waitAutoScrollStart = Boolean(this.level.autoScrollSpeed && (this.runTime < 2.8 || pcx < 520));
      if (!waitAutoScrollStart) {
        this.lightningScheduleTimer -= worldDt;
        if (this.lightningScheduleTimer <= 0) {
          this.lightningScheduleTimer = cfg.interval;
          const lead = p.vx * 0.25 + (this.level.autoScrollSpeed ?? 0) * 0.35;
          const minSafeX = this.level.autoScrollSpeed ? Math.max(540, this.camX + 44) : this.camX + 44;
          const tx = Math.max(
            minSafeX,
            Math.min(this.level.width - 60, pcx + lead + (Math.random() - 0.5) * 96)
          );
          this.activeLightningStrikes.push({
            x: tx,
            floorY: this.findGroundY(tx, p.y + p.h),
            timer: cfg.warnDuration,
            warnDuration: cfg.warnDuration,
            strikeRadius: cfg.strikeRadius,
            struck: false,
            strikeLife: 0.32,
          });
          sound.playWarn();
        }
      }
    }

    for (let i = this.activeLightningStrikes.length - 1; i >= 0; i--) {
      const st = this.activeLightningStrikes[i];
      if (!st.struck) {
        st.timer -= worldDt;
        const warnCol = st.color ?? '#fde047';
        if (st.timer < 0.45 && Math.random() < 0.45) {
          this.spawnParticles(st.x, st.floorY - 6, 1, {
            color: warnCol,
            speedMin: 20,
            speedMax: 80,
            angleMin: -Math.PI,
            angleMax: 0,
            size: 2.3,
            life: 0.16,
            gravity: 100,
            glow: true,
          });
        }
        if (st.timer <= 0) {
          st.struck = true;
          this.lightningAlpha = Math.max(this.lightningAlpha, st.color ? 0.18 : 0.32);
          this.addShake(6.5, 0.22);
          sound.playExplosion();
          this.spawnParticles(st.x, st.floorY - 12, 18, {
            color: st.color ?? '#fef08a',
            speedMin: 60,
            speedMax: 240,
            angleMin: -Math.PI,
            angleMax: 0,
            size: 3.4,
            life: 0.36,
            gravity: 220,
            glow: true,
          });
          if (
            p.invulnTimer <= 0 &&
            Math.abs(pcx - st.x) < st.strikeRadius + p.w * 0.38 &&
            p.y + p.h > st.floorY - 380 &&
            p.y <= st.floorY + 16
          ) {
            if (st.chillDuration) {
              p.chillTimer = Math.max(p.chillTimer, st.chillDuration);
            }
            this.damagePlayer(
              false,
              Math.sign(pcx - st.x) || -p.facing,
              st.damage ?? DAMAGE_TABLE.lightning_strike
            );
          }
        }
      } else {
        st.strikeLife -= realDt;
        if (st.strikeLife <= 0) {
          this.activeLightningStrikes.splice(i, 1);
        }
      }
    }
  }

  private updateGroundSpikes(worldDt: number, realDt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    for (let i = this.activeGroundSpikes.length - 1; i >= 0; i--) {
      const sp = this.activeGroundSpikes[i];
      const spColor = sp.color ?? '#4ade80';
      if (!sp.erupted) {
        sp.timer -= worldDt;
        if (sp.timer < 0.4 && Math.random() < 0.4) {
          this.spawnParticles(sp.x, sp.floorY - 4, 1, {
            color: spColor,
            speedMin: 20,
            speedMax: 70,
            angleMin: -Math.PI,
            angleMax: 0,
            size: 2.2,
            life: 0.16,
            gravity: 120,
            glow: true,
          });
        }
        if (sp.timer <= 0) {
          sp.erupted = true;
          sound.playShieldClang();
          this.addShake(4.2, 0.14);
          this.spawnParticles(sp.x, sp.floorY - 24, 14, {
            color: sp.color ?? '#34d399',
            speedMin: 50,
            speedMax: 190,
            angleMin: -Math.PI * 0.85,
            angleMax: -Math.PI * 0.15,
            size: 3.2,
            life: 0.34,
            gravity: 260,
            glow: true,
          });
          if (
            p.invulnTimer <= 0 &&
            Math.abs(pcx - sp.x) < sp.radius + p.w * 0.32 &&
            p.y + p.h > sp.floorY - 115 &&
            p.y <= sp.floorY + 14
          ) {
            if (sp.chillDuration) {
              p.chillTimer = Math.max(p.chillTimer, sp.chillDuration);
            }
            this.damagePlayer(false, Math.sign(pcx - sp.x) || -p.facing, sp.damage);
          }
        }
      } else {
        sp.life -= realDt;
        if (sp.life <= 0) {
          this.activeGroundSpikes.splice(i, 1);
        }
      }
    }
  }

  private updateHazards(dt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;

    const activeBoss = this.level.boss;
    const bossLocked = Boolean(activeBoss && activeBoss.active && !activeBoss.defeated);
    const outsideArena = (hx: number, pad = 16) =>
      bossLocked && activeBoss ? hx < activeBoss.arenaMinX - pad || hx > activeBoss.arenaMaxX + pad : false;

    // Electric hanging cables (metro_dark)
    for (const c of this.level.cables) {
      if (outsideArena(c.x)) continue;
      c.phase += dt * 3;
      const tipX = c.x + Math.sin(c.phase * 0.7) * 8;
      const tipY = c.y + c.length;
      if (p.invulnTimer <= 0 && Math.hypot(pcx - tipX, pcy - tipY) < 18) {
        this.damagePlayer(false, Math.sign(pcx - tipX) || -1, DAMAGE_TABLE.cable_shock);
      }
    }

    // Spikes (Fortress)
    for (const sp of this.level.spikes) {
      if (outsideArena(sp.x + sp.w * 0.5, sp.w + 16)) continue;
      if (
        p.invulnTimer <= 0 &&
        this.rectsOverlap(p.x + 3, p.y + 3, p.w - 6, p.h - 4, sp.x + 2, sp.y + 4, sp.w - 4, sp.h - 4)
      ) {
        this.damagePlayer(false, -p.facing, DAMAGE_TABLE.spike_trap);
      }
    }

    // Rotating Lasers (Fortress)
    for (const las of this.level.lasers) {
      if (outsideArena(las.cx, las.length + 12)) continue;
      las.angle += las.angularSpeed * dt;
      if (p.invulnTimer <= 0) {
        const ex1 = las.cx + Math.cos(las.angle) * las.length;
        const ey1 = las.cy + Math.sin(las.angle) * las.length;
        const ex2 = las.cx - Math.cos(las.angle) * las.length;
        const ey2 = las.cy - Math.sin(las.angle) * las.length;
        if (this.distToSegment(pcx, pcy, ex1, ey1, ex2, ey2) < 12) {
          this.damagePlayer(false, Math.sign(pcx - las.cx) || -1, DAMAGE_TABLE.rotating_laser);
        }
      }
    }

    // Gear-Occludable Beam Lasers (World 2)
    for (const bl of this.level.beamLasers) {
      if (outsideArena(bl.x1, bl.maxLength + 12)) continue;
      if (Math.abs(bl.x1 - pcx) > 950) continue;
      if (!this.isBeamLaserActive(bl)) continue;
      const end = this.computeBeamEnd(bl);
      if (p.invulnTimer <= 0 && this.distToSegment(pcx, pcy, bl.x1, bl.y1, end.endX, end.endY) < 12) {
        this.damagePlayer(false, Math.sign(pcx - bl.x1) || -p.facing, DAMAGE_TABLE.beam_laser);
      }
      if (end.blockedByGear && Math.abs(end.endX - pcx) < 600 && Math.random() < 0.35) {
        this.spawnParticles(end.endX, end.endY, 1, {
          color: '#fde047',
          speedMin: 35,
          speedMax: 110,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 2.3,
          life: 0.16,
          gravity: 160,
          glow: true,
        });
      }
    }

    // Electrified Shock Bridges (World 2)
    if (p.invulnTimer <= 0) {
      for (const plat of this.level.platforms) {
        if (plat.style !== 'shock_bridge') continue;
        if (this.getPlatformShockState(plat) !== 'shock') continue;
        if (this.rectsOverlap(p.x + 2, p.y + 4, p.w - 4, p.h, plat.x, plat.y - 4, plat.w, plat.h + 4)) {
          this.damagePlayer(false, -p.facing, DAMAGE_TABLE.shock_platform);
          break;
        }
      }
    }

    // Snap Jaw Botanical Traps (World 3)
    for (const st of this.level.snapTraps) {
      const cyc = st.cyclePeriod || 2.8;
      const t = (((this.worldTime + st.phase) % cyc) + cyc) % cyc;
      if (
        t >= cyc - st.snapDuration &&
        p.invulnTimer <= 0 &&
        this.rectsOverlap(p.x + 2, p.y + 3, p.w - 4, p.h - 3, st.x + 2, st.y + 2, st.w - 4, st.h - 2)
      ) {
        this.damagePlayer(false, -p.facing, DAMAGE_TABLE.snap_trap);
      }
    }

    // Periodic Spore Gas Jets (World 3)
    for (const sj of this.level.sporeJets) {
      if (outsideArena(sj.x, sj.range + 16)) continue;
      const cyc = sj.cyclePeriod || 3.0;
      const t = (((this.worldTime + sj.phase) % cyc) + cyc) % cyc;
      if (t >= cyc - sj.activeDuration && p.invulnTimer <= 0) {
        const r = this.getSporeJetRect(sj);
        if (this.rectsOverlap(p.x + 2, p.y + 2, p.w - 4, p.h - 2, r.x, r.y, r.w, r.h)) {
          this.damagePlayer(false, -p.facing, DAMAGE_TABLE.spore_jet);
        }
      }
    }

    // Swinging Jade Scythe Pendulums (World 3)
    for (const sc of this.level.scythePendulums) {
      if (outsideArena(sc.cx, sc.length + 12)) continue;
      if (Math.abs(sc.cx - pcx) > 420) continue;
      const ang = Math.sin(this.worldTime * sc.speed + sc.phase) * sc.maxAngle;
      const bx = sc.cx + Math.sin(ang) * sc.length;
      const by = sc.cy + Math.cos(ang) * sc.length;
      if (p.invulnTimer <= 0 && Math.hypot(pcx - bx, pcy - by) < 26) {
        this.damagePlayer(false, Math.sign(pcx - bx) || -p.facing, DAMAGE_TABLE.scythe_pendulum);
      }
    }

    // Fortress Thorn Pistons (3-FORT1)
    for (const tp of this.level.thornPistons ?? []) {
      if (outsideArena(tp.x + tp.w * 0.5, tp.w + 12)) continue;
      const cyc = tp.cyclePeriod || 2.8;
      const t = (((this.worldTime + tp.phase) % cyc) + cyc) % cyc;
      const dropNorm =
        t < cyc * 0.35
          ? 0
          : t < cyc * 0.52
            ? (t - cyc * 0.35) / (cyc * 0.17)
            : t < cyc * 0.72
              ? 1
              : 1 - (t - cyc * 0.72) / (cyc * 0.28);
      tp.currentDrop = Math.max(0, Math.min(1, dropNorm)) * tp.maxDrop;
      if (
        tp.currentDrop > 14 &&
        p.invulnTimer <= 0 &&
        this.rectsOverlap(p.x + 2, p.y + 2, p.w - 4, p.h - 2, tp.x + 3, tp.baseY, tp.w - 6, tp.currentDrop)
      ) {
        this.damagePlayer(false, Math.sign(pcx - (tp.x + tp.w * 0.5)) || -p.facing, DAMAGE_TABLE.thorn_piston);
      }
    }

    // World 4 Freeze Beams (periodic cryobeam that slows player)
    for (const fb of this.level.freezeBeams ?? []) {
      if (outsideArena((fb.x1 + fb.x2) * 0.5, Math.abs(fb.x2 - fb.x1) * 0.5 + 16)) continue;
      const cyc = fb.cyclePeriod || 3.4;
      const t = (((this.worldTime + fb.phase) % cyc) + cyc) % cyc;
      if (t >= cyc - fb.activeDuration && p.invulnTimer <= 0) {
        if (this.distToSegment(pcx, pcy, fb.x1, fb.y1, fb.x2, fb.y2) < 12) {
          p.chillTimer = Math.max(p.chillTimer, 2.4);
          this.damagePlayer(false, Math.sign(pcx - fb.x1) || -p.facing, DAMAGE_TABLE.freeze_beam);
        }
      }
    }

    // World 4 Falling Icicles (Ceiling hazards)
    for (const ic of this.level.fallingIcicles ?? []) {
      if (ic.broken) {
        ic.respawnTimer = (ic.respawnTimer ?? 0) - dt;
        if ((ic.respawnTimer ?? 0) <= 0) {
          ic.broken = false;
          ic.falling = false;
          ic.warnTimer = 0;
          ic.currY = ic.topY;
        }
        continue;
      }
      if (ic.currY === undefined) ic.currY = ic.topY;
      if (ic.falling) {
        ic.currY += 540 * dt;
        const floorY = this.findGroundY(ic.x, ic.topY + 40);
        if (
          p.invulnTimer <= 0 &&
          this.rectsOverlap(p.x + 2, p.y + 2, p.w - 4, p.h - 2, ic.x - 9, ic.currY, 18, 32)
        ) {
          p.chillTimer = Math.max(p.chillTimer, 1.6);
          this.damagePlayer(false, Math.sign(pcx - ic.x) || -p.facing, DAMAGE_TABLE.falling_icicle);
          ic.broken = true;
          ic.falling = false;
          ic.respawnTimer = 3.5;
          continue;
        }
        if (ic.currY + 32 >= floorY) {
          ic.broken = true;
          ic.falling = false;
          ic.respawnTimer = 3.5;
          this.spawnParticles(ic.x, floorY - 4, 8, {
            color: '#bae6fd',
            speedMin: 40,
            speedMax: 150,
            angleMin: -Math.PI,
            angleMax: 0,
            size: 2.8,
            life: 0.28,
            gravity: 220,
            glow: true,
          });
        }
      } else if ((ic.warnTimer ?? 0) > 0) {
        ic.warnTimer! -= dt;
        if ((ic.warnTimer ?? 0) <= 0) {
          ic.falling = true;
          sound.playWarn();
        }
      } else if (
        Math.abs(pcx - ic.x) < ic.triggerRange &&
        pcy >= ic.topY &&
        pcy <= ic.topY + 420
      ) {
        ic.warnTimer = 0.65;
      }
    }

    // World 4 Ice Pendulums
    for (const ip of this.level.icePendulums ?? []) {
      if (Math.abs(ip.cx - pcx) > 420) continue;
      const ang = Math.sin(this.worldTime * ip.speed + ip.phase) * ip.maxAngle;
      const bx = ip.cx + Math.sin(ang) * ip.length;
      const by = ip.cy + Math.cos(ang) * ip.length;
      if (p.invulnTimer <= 0 && Math.hypot(pcx - bx, pcy - by) < 26) {
        this.damagePlayer(false, Math.sign(pcx - bx) || -p.facing, DAMAGE_TABLE.ice_pendulum);
      }
    }

    // World 4 Frost Mines (4-5 / 4-FORT2)
    for (const fm of this.level.frostMines ?? []) {
      if (fm.cooldown && fm.cooldown > 0) {
        fm.cooldown = Math.max(0, fm.cooldown - dt);
        continue;
      }
      if (fm.armed) {
        fm.fuseTimer = (fm.fuseTimer ?? 0) - dt;
        if ((fm.fuseTimer ?? 0) <= 0) {
          fm.armed = false;
          fm.cooldown = 3.8;
          sound.playExplosion();
          this.addShake(4.8, 0.16);
          this.particles.push({
            x: fm.x,
            y: fm.y,
            vx: 0,
            vy: 0,
            size: 22,
            color: '#7dd3fc',
            alpha: 1,
            life: 0.36,
            maxLife: 0.36,
            gravity: 0,
            glow: true,
            ring: true,
          });
          this.spawnParticles(fm.x, fm.y, 16, {
            color: '#bae6fd',
            speedMin: 60,
            speedMax: 210,
            angleMin: 0,
            angleMax: Math.PI * 2,
            size: 3.2,
            life: 0.36,
            gravity: 60,
            glow: true,
          });
          if (p.invulnTimer <= 0 && Math.hypot(pcx - fm.x, pcy - fm.y) <= 86) {
            p.chillTimer = Math.max(p.chillTimer, 2.4);
            this.damagePlayer(false, Math.sign(pcx - fm.x) || -p.facing, DAMAGE_TABLE.frost_mine);
          }
        }
      } else if (Math.hypot(pcx - fm.x, pcy - fm.y) <= fm.r + 36) {
        fm.armed = true;
        fm.fuseTimer = 0.62;
        sound.playWarn();
      }
    }

 can shoot down homing orbs!
        if (!hit && b.homing) {
          for (let j = this.projectiles.length - 1; j >= 0; j--) {
            if (i === j) continue;
            const other = this.projectiles[j];
            if (other && !other.fromEnemy && Math.hypot(other.x - b.x, other.y - b.y) < other.r + b.r + 4) {
              hit = true;
              other.life = 0;
              this.spawnParticles(b.x, b.y, 8, {
                color: '#38f2ff',
                speedMin: 40,
                speedMax: 140,
                angleMin: 0,
                angleMax: Math.PI * 2,
                size: 2.5,
                life: 0.24,
                gravity: 0,
                glow: true,
              });
              break;
            }
          }
        }
        if (hit) this.projectiles.splice(i, 1);
        continue;
      }

      // ---- Player Projectile Hits ----

      // Ice Mirrors (W4 4-3 / 4-BOSS horizontal bolt reflection)
      if (!hit) {
        for (const im of this.level.iceMirrors ?? []) {
          if (b.iceMirroredFromId === im.id) continue;
          if (this.circleRectOverlap(b.x, b.y, b.r + 3, im.x, im.y, im.w, im.h)) {
            b.vx = -b.vx;
            b.x = b.vx < 0 ? im.x - b.r - 2 : im.x + im.w + b.r + 2;
            b.iceMirroredFromId = im.id;
            b.life = Math.max(b.life, 1.45);
            b.color = '#bae6fd';
            sound.playShieldClang();
            this.spawnParticles(b.x, b.y, 7, {
              color: '#bae6fd',
              speedMin: 40,
              speedMax: 140,
              angleMin: 0,
              angleMax: Math.PI * 2,
              size: 2.5,
              life: 0.24,
              gravity: 0,
              glow: true,
            });
            break;
          }
        }
      }

      // Magic Mirrors (Stage 1-5)
      if (!hit) {
        for (const m of this.level.mirrors) {
          if (this.circleRectOverlap(b.x, b.y, b.r + 3, m.x, m.y, m.w, m.h)) {
            hit = true;
            this.warpThroughMirror(m);
            break;
          }
        }
      }

      // Seal Blocks
      if (!hit) {
        for (const sb of this.level.sealBlocks) {
          if (sb.broken) continue;
          if (this.circleRectOverlap(b.x, b.y, b.r + 2, sb.x, sb.y, sb.w, sb.h)) {
            sb.hp -= 1;
            hit = true;
            if (sb.hp <= 0) {
              this.shatterSealBlock(sb.x, sb.y, sb.w, sb.h, sb);
            }
            break;
          }
        }
      }

      // Magic Switches (including Chrono Slow-Mo Switches in W2)
      if (!hit) {
        for (const sw of this.level.switches) {
          if (Math.hypot(b.x - sw.x, b.y - sw.y) <= b.r + sw.r + 4) {
            hit = true;
            if (sw.chrono) {
              if (!sw.cooldown || sw.cooldown <= 0) {
                sw.activated = true;
                sw.cooldown = 6.5;
                this.chronoSlowTimer = 4.5;
                this.score += 300;
                this.hitstopTimer = 0.045;
                this.addShake(4.2, 0.16);
                sound.playSwitchActivate();
                this.addFloatingText(sw.x, sw.y - 18, 'CHRONO SLOW 4.5s', '#fde047');
                this.particles.push({
                  x: sw.x,
                  y: sw.y,
                  vx: 0,
                  vy: 0,
                  size: 18,
                  color: '#fde047',
                  alpha: 1,
                  life: 0.45,
                  maxLife: 0.45,
                  gravity: 0,
                  glow: true,
                  ring: true,
                });
              }
            } else if (!sw.activated) {
              sw.activated = true;
              this.score += 300;
              this.hitstopTimer = 0.05;
              this.addShake(4.2, 0.16);
              sound.playSwitchActivate();
              this.addFloatingText(sw.x, sw.y - 18, sw.lightZone ? 'LIGHTS ON +300' : 'BRIDGE OPEN +300', '#38f2ff');
              for (const plat of this.level.platforms) {
                if (plat.switchGroup === sw.group) this.holoReveal[plat.id] = 0.01;
              }
              this.particles.push({
                x: sw.x,
                y: sw.y,
                vx: 0,
                vy: 0,
                size: 16,
                color: '#38f2ff',
                alpha: 1,
                life: 0.45,
                maxLife: 0.45,
                gravity: 0,
                glow: true,
                ring: true,
              });
            }
            break;
          }
        }
      }

      // Bloom Bridge Buds (World 3)
      if (!hit) {
        for (const bb of this.level.bloomBridges) {
          if (Math.hypot(b.x - bb.triggerX, b.y - bb.triggerY) <= b.r + 22) {
            hit = true;
            this.activateBloomBridge(bb);
            break;
          }
        }
      }

      // 3-2 Resonant Pollen Pods
      if (!hit) {
        for (const pod of this.level.pollenPods ?? []) {
          if (!pod.popped && Math.hypot(b.x - pod.x, b.y - pod.y) <= b.r + pod.r + 6) {
            hit = true;
            this.triggerPollenPod(pod);
            break;
          }
        }
      }

      // 3-4 Glow Lanterns
      if (!hit) {
        for (const gl of this.level.glowLanterns ?? []) {
          if (Math.hypot(b.x - gl.x, b.y - gl.y) <= b.r + gl.r + 8) {
            hit = true;
            const fresh = !gl.litTimer || gl.litTimer <= 0;
            gl.litTimer = 8.0;
            this.player.cavernLightTimer = Math.max(this.player.cavernLightTimer, 6.5);
            sound.playSwitchActivate();
            if (fresh) {
              this.score += 150;
              this.addFloatingText(gl.x, gl.y - 16, 'LANTERN LIT +150', '#a7f3d0');
            }
            break;
          }
        }
      }

      // 3-FORT2 Twin Crystal Lock Barriers
      if (!hit) {
        for (const cl of this.level.crystalLocks ?? []) {
          if (!cl.unlocked && Math.hypot(b.x - cl.crystalX, b.y - cl.crystalY) <= b.r + 20) {
            hit = true;
            cl.unlocked = true;
            sound.playExplosion();
            this.addShake(4.2, 0.14);
            this.score += 250;
            this.addFloatingText(cl.barrierX + cl.barrierW * 0.5, cl.barrierY - 12, 'PRISM UNLOCKED +250', '#6ee7b7');
            this.spawnParticles(cl.crystalX, cl.crystalY, 14, {
              color: '#34d399',
              speedMin: 50,
              speedMax: 180,
              angleMin: 0,
              angleMax: Math.PI * 2,
              size: 3.2,
              life: 0.34,
              gravity: 100,
              glow: true,
            });
            break;
          }
        }
      }

      // 3-7 Spiral Bloom Triggers
      if (!hit) {
        for (const sb of this.level.spiralBlooms ?? []) {
          if (Math.hypot(b.x - sb.triggerX, b.y - sb.triggerY) <= b.r + 20) {
            hit = true;
            this.activateSpiralBloom(sb);
            break;
          }
        }
      }

      // W4 Phase Water Switches & Cryo Lanterns
      if (!hit) {
        for (const pw of this.level.phaseWaterSwitches ?? []) {
          if ((!pw.cooldown || pw.cooldown <= 0) && Math.hypot(b.x - pw.x, b.y - pw.y) <= b.r + pw.r + 8) {
            hit = true;
            this.togglePhaseWater(pw);
            break;
          }
        }
      }
      if (!hit) {
        for (const cl of this.level.cryoLanterns ?? []) {
          if (Math.hypot(b.x - cl.x, b.y - cl.y) <= b.r + cl.r + 8) {
            hit = true;
            const fresh = !cl.litTimer || cl.litTimer <= 0;
            cl.litTimer = 8.0;
            this.player.cavernLightTimer = Math.max(this.player.cavernLightTimer, 6.5);
            sound.playSwitchActivate();
            if (fresh) {
              this.score += 150;
              this.addFloatingText(cl.x, cl.y - 16, 'CRYO LANTERN +150', '#7dd3fc');
            }
            break;
          }
        }
      }

      // Enemies
      if (!hit) {
        for (const en of this.level.enemies) {
          if (!en.alive) continue;
          if (this.circleRectOverlap(b.x, b.y, b.r + 2, en.x, en.y, en.w, en.h)) {
            hit = true;

            // Prism Reflector reflects frontal bolts back at the player!
            if (en.kind === 'prism_reflector') {
              const hitFromFront = Math.sign(b.vx) !== en.facing;
              if (hitFromFront) {
                sound.playShieldClang();
                this.projectiles.push({
                  x: b.x,
                  y: b.y,
                  vx: -b.vx * 0.72,
                  vy: 0,
                  r: 6,
                  life: 1.6,
                  fromEnemy: true,
                  damage: DAMAGE_TABLE.prism_reflector_beam,
                  color: '#67e8f9',
                  trail: [],
                });
                this.addFloatingText(en.x + en.w * 0.5, en.y - 8, 'REFLECT!', '#67e8f9');
                break;
              }
            }

            if (en.kind === 'mirror_gear') {
              en.chargeState = 'warn';
              en.chargeTimer = 1.9;
              en.invulnMode = false;
              this.damageEnemy(en, 1, 'shot');
              if (en.alive) {
                this.addFloatingText(en.x + en.w * 0.5, en.y - 10, 'BOOST PAD!', '#fde047');
              }
              break;
            }

            // Mirror Frost reflects frontal bolts as cryo shots!
            if (en.kind === 'mirror_frost' && Math.sign(b.vx) !== en.facing) {
              sound.playShieldClang();
              this.projectiles.push({
                x: b.x,
                y: b.y,
                vx: -b.vx * 0.78,
                vy: 0,
                r: 6,
                life: 1.65,
                fromEnemy: true,
                damage: DAMAGE_TABLE.mirror_frost,
                chillDuration: 1.6,
                color: '#93c5fd',
                trail: [],
              });
              this.addFloatingText(en.x + en.w * 0.5, en.y - 8, 'ICE REFLECT!', '#93c5fd');
              break;
            }

, Glacier Golem, Invuln enemies, or Aegis shield rotation
            const aegisBlocked =
              en.kind === 'aegis_drone' && Math.abs(Math.cos(this.worldTime * 3.8)) > 0.45;
            if (
              en.invulnMode ||
              aegisBlocked ||
              ((en.kind === 'shield_trooper' || en.kind === 'glacier_golem') &&
                Math.sign(b.vx) !== en.facing)
            ) {
              sound.playShieldClang();
              this.spawnParticles(b.x, b.y, 8, {
                color: en.kind === 'glacier_golem' ? '#7dd3fc' : '#fbbf24',
                speedMin: 60,
                speedMax: 160,
                angleMin: 0,
                angleMax: Math.PI * 2,
                size: 2.6,
                life: 0.22,
                gravity: 160,
                glow: true,
              });
              this.addFloatingText(
                en.x + en.w * 0.5,
                en.y - 8,
                en.kind === 'glacier_golem' ? 'ICE GUARD' : en.invulnMode ? 'ARMOR' : 'GUARD',
                en.kind === 'glacier_golem' ? '#7dd3fc' : '#fbbf24'
              );
              break;
            }

            if (en.kind === 'bomb_walker') {
              this.primeBombWalker(en);
              break;
            }

            this.damageEnemy(en, 1, 'shot');
            break;
          }
        }
      }

      // Boss
      if (!hit && this.level.boss && this.level.boss.active && !this.level.boss.defeated) {
        const boss = this.level.boss;
        if (this.circleRectOverlap(b.x, b.y, b.r + 2, boss.x, boss.y, boss.w, boss.h)) {
          hit = true;
          if (
            boss.kind === 'mid_guardian' ||
            (boss.kind === 'glacia_knight' && boss.state === 'guard')
          ) {
            const hitFromFront = Math.sign(b.vx) !== boss.facing;
            if (hitFromFront && boss.stunTimer <= 0) {
              sound.playShieldClang();
              this.spawnParticles(b.x, b.y, 10, {
                color: boss.kind === 'glacia_knight' ? '#7dd3fc' : '#fbbf24',
                speedMin: 70,
                speedMax: 180,
                angleMin: 0,
                angleMax: Math.PI * 2,
                size: 3,
                life: 0.24,
                gravity: 160,
                glow: true,
              });
              this.addFloatingText(
                boss.x + boss.w * 0.5,
                boss.y - 10,
                boss.kind === 'glacia_knight' ? 'CRYSTAL SHIELD' : 'SHIELDED',
                boss.kind === 'glacia_knight' ? '#7dd3fc' : '#fbbf24'
              );
            } else {
              this.damageBoss(boss, 1);
            }
          } else {
            this.damageBoss(boss, 1);
          }
        }
      }

      // Solid Walls
      if (!hit) {
        for (const plat of this.level.platforms) {
          if (plat.oneWay) continue;
          if (plat.switchGroup && !this.isSwitchGroupActive(plat.switchGroup)) continue;
          if (plat.style === 'vanish_holo' && plat.vanishState === 'gone') continue;
          if (plat.style === 'crumble_ice' && plat.crumbleState === 'gone') continue;
          if (plat.style === 'freeze_water' && plat.waterState === 'liquid') continue;
          if (this.circleRectOverlap(b.x, b.y, b.r, plat.x, plat.y, plat.w, plat.h)) {
            hit = true;
            this.spawnParticles(b.x, b.y, 6, {
              color: '#38f2ff',
              speedMin: 40,
              speedMax: 120,
              angleMin: 0,
              angleMax: Math.PI * 2,
              size: 2.4,
              life: 0.2,
              gravity: 80,
              glow: true,
            });
            break;
          }
        }
      }

      if (hit) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private shatterSealBlock(x: number, y: number, w: number, h: number, sb: { broken: boolean }) {
    sb.broken = true;
    this.score += 150;
    this.hitstopTimer = 0.045;
    this.addShake(4.6, 0.14);
    sound.playCrystalBreak();
    this.addFloatingText(x + w * 0.5, y, '+150', '#c084fc');
    this.spawnParticles(x + w * 0.5, y + h * 0.5, 18, {
      color: '#c084fc',
      speedMin: 70,
      speedMax: 250,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 4,
      life: 0.45,
      gravity: 360,
      glow: true,
    });
  }

  private primeBombWalker(en: EnemyDef) {
    if (!en.primed) {
      en.primed = true;
      en.fuseTimer = 1.05;
      en.vx = 0;
      sound.playWarn();
      this.addFloatingText(en.x + en.w * 0.5, en.y - 8, 'PRIMED!', '#fb7185');
    }
  }

  private detonateBombWalker(en: EnemyDef) {
    en.alive = false;
    this.enemiesDefeated += 1;
    this.score += 200;
    this.hitstopTimer = 0.055;
    this.addShake(7.5, 0.24);
    sound.playExplosion();

    const cx = en.x + en.w * 0.5;
    const cy = en.y + en.h * 0.5;

    this.particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      size: 16,
      color: '#f97316',
      alpha: 1,
      life: 0.35,
      maxLife: 0.35,
      gravity: 0,
      glow: true,
      ring: true,
    });
    this.spawnParticles(cx, cy, 26, {
      color: '#f97316',
      speedMin: 80,
      speedMax: 300,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 4.4,
      life: 0.48,
      gravity: 260,
      glow: true,
    });

    // Blast nearby Seal Blocks
    for (const sb of this.level.sealBlocks) {
      if (!sb.broken && Math.hypot(sb.x + sb.w * 0.5 - cx, sb.y + sb.h * 0.5 - cy) <= 135) {
        this.shatterSealBlock(sb.x, sb.y, sb.w, sb.h, sb);
      }
    }

    // Blast nearby Enemies
    for (const other of this.level.enemies) {
      if (!other.alive || other.id === en.id) continue;
      if (Math.hypot(other.x + other.w * 0.5 - cx, other.y + other.h * 0.5 - cy) <= 135) {
        this.damageEnemy(other, 3, 'blast');
      }
    }

    // Hurt player if right inside blast
    const pcx = this.player.x + this.player.w * 0.5;
    const pcy = this.player.y + this.player.h * 0.5;
    if (this.player.invulnTimer <= 0 && Math.hypot(pcx - cx, pcy - cy) <= 68) {
      this.damagePlayer(false, Math.sign(pcx - cx) || -1, DAMAGE_TABLE.bomb_walker_blast);
    }
  }

  private damageEnemy(en: EnemyDef, dmg: number, source: 'shot' | 'stomp' | 'slide' | 'blast') {
    en.hp -= dmg;
    en.hitFlash = 0.12;
    if (en.hp > 0) {
      sound.playShieldClang();
      this.spawnParticles(en.x + en.w * 0.5, en.y + en.h * 0.5, 6, {
        color: '#38f2ff',
        speedMin: 40,
        speedMax: 140,
        angleMin: 0,
        angleMax: Math.PI * 2,
        size: 2.5,
        life: 0.22,
        gravity: 100,
        glow: true,
      });
      return;
    }

    en.alive = false;
    this.enemiesDefeated += 1;
    const pts = source === 'stomp' ? 250 : source === 'slide' ? 250 : 200;
    this.score += pts;
    this.hitstopTimer = 0.045;
    this.addShake(4.2, 0.13);
    sound.playStomp();
    this.addFloatingText(
      en.x + en.w * 0.5,
      en.y,
      source === 'slide' ? `SLIDE +${pts}` : source === 'stomp' ? `STOMP +${pts}` : `+${pts}`,
      source === 'stomp' ? '#fbbf24' : '#38f2ff'
    );

    this.spawnParticles(en.x + en.w * 0.5, en.y + en.h * 0.5, 18, {
      color: en.kind === 'slime_glitch' ? '#c084fc' : '#f59e0b',
      speedMin: 70,
      speedMax: 240,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 3.5,
      life: 0.42,
      gravity: 280,
      glow: true,
    });

    // Slime Glitch splits into 2 mini slimes!
    if (en.kind === 'slime_glitch' && !en.isMini) {
      const m1 = makeMiniSlime(`${en.id}_m1`, en.x - 4, en.y + 4, -1, en.minX, en.maxX);
      const m2 = makeMiniSlime(`${en.id}_m2`, en.x + 12, en.y + 4, 1, en.minX, en.maxX);
      this.level.enemies.push(m1, m2);
    }

    // Cluster Mine scatters 4 diagonal fragment projectiles on detonation!
    if (en.kind === 'cluster_mine') {
      const ecx = en.x + en.w * 0.5;
      const ecy = en.y + en.h * 0.5;
      for (const ang of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
        this.projectiles.push({
          x: ecx,
          y: ecy,
          vx: Math.cos(ang) * 235,
          vy: Math.sin(ang) * 235,
          r: 5,
          life: 1.35,
          fromEnemy: true,
          damage: DAMAGE_TABLE.cluster_mine_frag,
          color: '#f87171',
          trail: [],
        });
      }
    }
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;

    const activeBoss = this.level.boss;
    const bossLocked = Boolean(activeBoss && activeBoss.active && !activeBoss.defeated);

    for (let i = 0; i < this.level.enemies.length; i++) {
      const en = this.level.enemies[i];
      if (!en.alive) continue;
      if (en.hitFlash && en.hitFlash > 0) en.hitFlash -= dt;

      if (bossLocked && activeBoss && (en.x + en.w < activeBoss.arenaMinX - 6 || en.x > activeBoss.arenaMaxX + 6)) {
        continue;
      }
      if (Math.abs(en.x - pcx) > 900) continue;

      switch (en.kind) {
        case 'patrol_drone': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          en.phase += dt * 3.4;
          en.y = en.baseY + Math.sin(en.phase) * 4.5;
          break;
        }
        case 'hopping_bot': {
          en.phase += dt;
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          en.vy += 980 * dt;
          en.y += en.vy * dt;
          if (en.y >= en.baseY) {
            en.y = en.baseY;
            en.vy = 0;
            if (en.phase > 1.05) {
              en.vy = -310;
              en.phase = 0;
            }
          }
          break;
        }
        case 'shield_trooper': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          break;
        }
        case 'sniper_turret': {
          const dist = Math.hypot(pcx - (en.x + en.w * 0.5), pcy - (en.y + en.h * 0.5));
          en.facing = pcx >= en.x ? 1 : -1;
          if (dist < 420) {
            en.aimTimer = (en.aimTimer ?? 0) + dt;
            if (en.aimTimer >= 1.35) {
              en.aimTimer = 0;
              const cx = en.x + en.w * 0.5;
              const cy = en.y + en.h * 0.5;
              const ang = Math.atan2(pcy - cy, pcx - cx);
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang) * 430,
                vy: Math.sin(ang) * 430,
                r: 5,
                life: 1.5,
                fromEnemy: true,
                damage: DAMAGE_TABLE.sniper_turret_shot,
                color: '#f43f5e',
                trail: [],
              });
            }
          } else {
            en.aimTimer = 0;
          }
          break;
        }
        case 'slime_glitch': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          if (en.y < en.baseY || en.vy !== 0) {
            en.vy += 880 * dt;
            en.y += en.vy * dt;
            if (en.y >= en.baseY) {
              en.y = en.baseY;
              en.vy = 0;
            }
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          break;
        }
        case 'ghost_wisp': {
          en.phase += dt * 2.8;
          const dist = Math.hypot(pcx - en.x, pcy - en.y);
          if (dist < 270) {
            en.x += Math.sign(pcx - en.x) * 48 * dt;
            en.baseY += Math.sign(pcy - en.baseY) * 34 * dt;
            en.facing = pcx >= en.x ? 1 : -1;
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
          }
          en.y = en.baseY + Math.sin(en.phase) * 18;
          break;
        }
        case 'bulldozer_mech': {
          if (en.chargeState === 'patrol') {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            const alignedY = Math.abs(pcy - (en.y + en.h * 0.5)) < 48;
            const alignedX = Math.abs(pcx - en.x) < 330;
            if (alignedY && alignedX) {
              en.chargeState = 'warn';
              en.chargeTimer = 0.42;
              en.facing = pcx >= en.x ? 1 : -1;
              sound.playWarn();
            }
          } else if (en.chargeState === 'warn') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'charge';
              en.chargeTimer = 0.85;
            }
          } else if (en.chargeState === 'charge') {
            en.x += en.facing * 275 * dt;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x));
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0 || en.x <= en.minX || en.x >= en.maxX - en.w) {
              en.chargeState = 'recover';
              en.chargeTimer = 0.65;
            }
          } else {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) en.chargeState = 'patrol';
          }
          break;
        }
        case 'bomb_walker': {
          if (en.primed) {
            en.fuseTimer = (en.fuseTimer ?? 0) - dt;
            if ((en.fuseTimer ?? 0) <= 0) {
              this.detonateBombWalker(en);
              continue;
            }
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
          }
          break;
        }
        case 'arcane_caster': {
          en.facing = pcx >= en.x ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.5) - dt;
          const dist = Math.hypot(pcx - en.x, pcy - en.y);
          if (dist < 420 && (en.fireCooldown ?? 0) <= 0) {
            en.fireCooldown = 2.1;
            const cx = en.x + en.w * 0.5 + en.facing * 14;
            const cy = en.y + 12;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 235,
              vy: Math.sin(ang) * 235,
              r: 6,
              life: 2.2,
              fromEnemy: true,
              damage: DAMAGE_TABLE.arcane_caster_bolt,
              color: '#c084fc',
              trail: [],
            });
          }
          break;
        }
        case 'neon_bat': {
          const cx = en.x + en.w * 0.5;
          if (en.chargeState === 'patrol') {
            en.y = en.anchorY ?? en.baseY;
            if (Math.abs(pcx - cx) < 220 && pcy > en.y) {
              en.chargeState = 'charge';
              en.chargeTimer = 0;
              en.vx = Math.sign(pcx - cx || -1) * 185;
              en.facing = en.vx >= 0 ? 1 : -1;
            }
          } else if (en.chargeState === 'charge') {
            en.chargeTimer = (en.chargeTimer ?? 0) + dt;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x + en.vx * dt));
            en.y = (en.anchorY ?? 62) + Math.sin(en.chargeTimer * Math.PI * 0.9) * 220;
            if (en.chargeTimer >= 1.1) {
              en.y = en.anchorY ?? 62;
              en.chargeState = 'recover';
              en.chargeTimer = 1.2;
            }
          } else {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) en.chargeState = 'patrol';
          }
          break;
        }
        case 'skate_courier': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          break;
        }
        case 'riot_baton': {
          const distX = pcx - (en.x + en.w * 0.5);
          if (Math.abs(distX) < 140 && Math.abs(pcy - (en.y + en.h * 0.5)) < 46) {
            en.facing = distX >= 0 ? 1 : -1;
            en.x += en.facing * 175 * dt;
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
          }
          en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x));
          break;
        }
        case 'volt_jelly': {
          en.phase += dt * 2.6;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase) * 18;
          en.fireCooldown = (en.fireCooldown ?? 1.5) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 420) {
            en.fireCooldown = 2.4;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            for (const ang of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang) * 175,
                vy: Math.sin(ang) * 175,
                r: 5,
                life: 1.4,
                fromEnemy: true,
                damage: DAMAGE_TABLE.volt_jelly_spark,
                color: '#facc15',
                trail: [],
              });
            }
          }
          break;
        }
        case 'rail_spider': {
          if (en.chargeState === 'patrol') {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            if (Math.abs(pcx - (en.x + en.w * 0.5)) < 48 && pcy > en.y) {
              en.chargeState = 'charge';
              en.vy = 20;
            }
          } else if (en.chargeState === 'charge') {
            en.vy += 1100 * dt;
            en.y += en.vy * dt;
            if (en.y >= 370 - en.h) {
              en.y = 370 - en.h;
              en.vy = 0;
              en.chargeState = 'recover';
              en.chargeTimer = 0.8;
            }
          } else {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.y -= 210 * dt;
              if (en.y <= (en.anchorY ?? 54)) {
                en.y = en.anchorY ?? 54;
                en.chargeState = 'patrol';
              }
            }
          }
          break;
        }
        case 'magnet_orb': {
          en.phase += dt * 2.2;
          const ax = en.anchorX ?? (en.minX + en.maxX) * 0.5;
          const ay = en.anchorY ?? en.baseY;
          en.x = Math.max(en.minX, Math.min(en.maxX - en.w, ax + Math.sin(en.phase) * 95));
          en.y = ay + Math.sin(en.phase * 2) * 32;
          const dist = Math.hypot(pcx - en.x, pcy - en.y);
          if (Math.sin(en.phase * 1.5) > 0.35 && dist < 240 && dist > 30) {
            p.vx += Math.sign(en.x - pcx) * 260 * dt;
          }
          break;
        }
        case 'prism_reflector':
        case 'cryo_slime': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          if (en.kind === 'cryo_slime') {
            en.phase += dt * 4;
            en.y = en.baseY - Math.abs(Math.sin(en.phase)) * 12;
          }
          break;
        }
        case 'mortar_crab': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = pcx >= en.x ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.4) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 460) {
            en.fireCooldown = 2.3;
            const cx = en.x + en.w * 0.5;
            this.projectiles.push({
              x: cx,
              y: en.y,
              vx: Math.max(-240, Math.min(240, (pcx - cx) * 0.85)),
              vy: -360,
              r: 6,
              life: 2.2,
              fromEnemy: true,
              damage: DAMAGE_TABLE.mortar_crab_shell,
              gravity: 560,
              color: '#fb923c',
              trail: [],
            });
          }
          break;
        }
        case 'stealth_ninja': {
          en.phase += dt * 2.5;
          en.customAlpha = 0.22 + 0.78 * Math.pow(0.5 + 0.5 * Math.sin(en.phase), 3);
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = pcx >= en.x ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.2) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && (en.customAlpha ?? 1) > 0.72 && Math.hypot(pcx - en.x, pcy - en.y) < 400) {
            en.fireCooldown = 1.9;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + 12;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 340,
              vy: Math.sin(ang) * 340,
              r: 4.5,
              life: 1.5,
              fromEnemy: true,
              damage: DAMAGE_TABLE.stealth_ninja_shuriken,
              color: '#818cf8',
              trail: [],
            });
          }
          break;
        }
        case 'saw_wheel': {
          en.phase += dt * 14;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          break;
        }
        case 'holo_decoy': {
          en.phase += dt * 16;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          en.subTimer = (en.subTimer ?? 2.2) - dt;
          if ((en.subTimer ?? 0) <= 0) {
            en.subTimer = 2.4;
            const mid = (en.minX + en.maxX) * 0.5;
            en.x = en.x < mid ? en.maxX - en.w - 20 : en.minX + 20;
            this.spawnParticles(en.x + en.w * 0.5, en.y + en.h * 0.5, 8, {
              color: '#38bdf8',
              speedMin: 30,
              speedMax: 120,
              angleMin: 0,
              angleMax: Math.PI * 2,
              size: 2.5,
              life: 0.25,
              gravity: 0,
              glow: true,
            });
          }
          break;
        }
        case 'arc_pylon': {
          en.fireCooldown = (en.fireCooldown ?? 1.4) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 420) {
            en.fireCooldown = 1.9;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + 12;
            for (const dir of [-1, 1]) {
              this.projectiles.push({
                x: cx + dir * 10,
                y: cy,
                vx: dir * 270,
                vy: 0,
                r: 5.5,
                life: 1.4,
                fromEnemy: true,
                damage: DAMAGE_TABLE.arc_pylon_zap,
                color: '#22d3ee',
                trail: [],
              });
            }
          }
          break;
        }
        case 'grimoire_mimic': {
          const dist = Math.hypot(pcx - en.x, pcy - en.y);
          if (en.chargeState === 'patrol') {
            en.phase += dt * 2.5;
            en.y = en.baseY + Math.sin(en.phase) * 8;
            if (dist < 220) {
              en.chargeState = 'charge';
              en.vy = -210;
              sound.playWarn();
            }
          } else {
            en.facing = pcx >= en.x ? 1 : -1;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x + en.facing * 135 * dt));
            en.vy += 820 * dt;
            en.y += en.vy * dt;
            if (en.y >= 370 - en.h) {
              en.y = 370 - en.h;
              en.vy = -270;
            }
          }
          break;
        }
        case 'rune_sentinel': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.8) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 450) {
            en.fireCooldown = 2.4;
            for (const dir of [-1, 1]) {
              this.projectiles.push({
                x: en.x + en.w * 0.5 + dir * 12,
                y: en.y + en.h - 10,
                vx: dir * 230,
                vy: 0,
                r: 7,
                life: 1.5,
                fromEnemy: true,
                damage: DAMAGE_TABLE.rune_sentinel_wave,
                shockwave: true,
                color: '#34d399',
                trail: [],
              });
            }
          }
          break;
        }
        case 'mirror_wraith': {
          en.phase += dt * 3;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase) * 14;
          en.subTimer = (en.subTimer ?? 2.0) - dt;
          if ((en.subTimer ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 260) {
            en.subTimer = 2.5;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, pcx - p.facing * 72));
            en.facing = p.facing;
          }
          break;
        }
        case 'chrono_pendulum': {
          en.phase += dt * 2.5;
          const ax = en.anchorX ?? 560;
          const ay = en.anchorY ?? 48;
          const swingAng = Math.sin(en.phase) * 1.08;
          const len = 175;
          en.x = ax + Math.sin(swingAng) * len - en.w * 0.5;
          en.y = ay + Math.cos(swingAng) * len - en.h * 0.5;
          break;
        }
        case 'gravity_imp': {
          en.phase += dt * 3;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase * 2) * 20;
          en.fireCooldown = (en.fireCooldown ?? 1.6) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 420) {
            en.fireCooldown = 2.2;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 210,
              vy: Math.sin(ang) * 210,
              r: 6,
              life: 2.0,
              fromEnemy: true,
              damage: DAMAGE_TABLE.gravity_imp_orb,
              color: '#a78bfa',
              trail: [],
            });
          }
          break;
        }
        case 'ink_specter': {
          en.phase += dt * 2.6;
          en.facing = pcx >= en.x ? 1 : -1;
          en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x - en.facing * 35 * dt));
          en.y = en.baseY + Math.sin(en.phase) * 14;
          en.fireCooldown = (en.fireCooldown ?? 1.3) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 450) {
            en.fireCooldown = 2.0;
            const cx = en.x + en.w * 0.5;
            this.projectiles.push({
              x: cx,
              y: en.y + 10,
              vx: en.facing * 200,
              vy: -240,
              r: 5.5,
              life: 1.9,
              fromEnemy: true,
              damage: DAMAGE_TABLE.ink_specter_blob,
              gravity: 480,
              color: '#6366f1',
              trail: [],
            });
          }
          break;
        }
        case 'star_weaver': {
          en.phase += dt * 2.0;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.cos(en.phase) * 18;
          en.fireCooldown = (en.fireCooldown ?? 1.8) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 460) {
            en.fireCooldown = 2.4;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            const baseAng = Math.atan2(pcy - cy, pcx - cx);
            for (const off of [-0.26, 0, 0.26]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(baseAng + off) * 220,
                vy: Math.sin(baseAng + off) * 220,
                r: 5,
                life: 2.0,
                fromEnemy: true,
                damage: DAMAGE_TABLE.star_weaver_lance,
                color: '#fde047',
                trail: [],
              });
            }
          }
          break;
        }
        case 'golem_knight': {
          const distX = pcx - (en.x + en.w * 0.5);
          if (Math.abs(distX) < 160 && Math.abs(pcy - (en.y + en.h * 0.5)) < 50) {
            en.facing = distX >= 0 ? 1 : -1;
            en.x += en.facing * 125 * dt;
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
          }
          en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x));
          break;
        }
        case 'mana_leech': {
          const dist = Math.hypot(pcx - en.x, pcy - en.y);
          if (dist < 260) {
            const ang = Math.atan2(pcy - (en.y + en.h * 0.5), pcx - (en.x + en.w * 0.5));
            en.x += Math.cos(ang) * 130 * dt;
            en.y += Math.sin(ang) * 110 * dt;
            en.facing = Math.cos(ang) >= 0 ? 1 : -1;
          } else {
            en.phase += dt * 3;
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.y = en.baseY + Math.sin(en.phase) * 14;
            en.facing = en.vx >= 0 ? 1 : -1;
          }
          break;
        }
        case 'sigil_bomber': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.2) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.abs(pcx - (en.x + en.w * 0.5)) < 130) {
            en.fireCooldown = 1.9;
            this.projectiles.push({
              x: en.x + en.w * 0.5,
              y: en.y + en.h,
              vx: 0,
              vy: 40,
              r: 7,
              life: 1.6,
              fromEnemy: true,
              damage: DAMAGE_TABLE.sigil_bomber_mine,
              gravity: 320,
              color: '#f97316',
              trail: [],
            });
          }
          break;
        }
        case 'void_eye': {
          en.phase += dt;
          const open = (en.phase % 3.5) < 2.0;
          en.invulnMode = !open;
          en.facing = pcx >= en.x ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.4) - dt;
          if (open && (en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 430) {
            en.fireCooldown = 1.3;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 320,
              vy: Math.sin(ang) * 320,
              r: 5.5,
              life: 1.6,
              fromEnemy: true,
              damage: DAMAGE_TABLE.void_eye_beam,
              color: '#f43f5e',
              trail: [],
            });
          }
          break;
        }
        case 'flame_thruster': {
          en.chargeTimer = (en.chargeTimer ?? 1.2) - dt;
          if (en.chargeState === 'patrol') {
            en.x += en.vx * dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'charge';
              en.chargeTimer = 0.7;
              en.facing = pcx >= en.x ? 1 : -1;
            }
          } else {
            en.x += en.facing * 250 * dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'patrol';
              en.chargeTimer = 1.3;
            }
          }
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
            en.facing = 1;
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
            en.facing = -1;
          }
          break;
        }
        case 'jet_trooper': {
          en.phase += dt * 3;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = pcx >= en.x ? 1 : -1;
          en.y = en.baseY + Math.sin(en.phase) * 24;
          en.fireCooldown = (en.fireCooldown ?? 1.3) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 420) {
            en.fireCooldown = 1.65;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 260,
              vy: Math.sin(ang) * 260,
              r: 4.5,
              life: 1.8,
              fromEnemy: true,
              damage: DAMAGE_TABLE.jet_trooper_burst,
              color: '#38bdf8',
              trail: [],
            });
          }
          break;
        }
        case 'railgun_mech': {
          en.facing = pcx >= en.x ? 1 : -1;
          if (Math.hypot(pcx - en.x, pcy - en.y) < 480) {
            en.aimTimer = (en.aimTimer ?? 0) + dt;
            if (en.aimTimer >= 1.65) {
              en.aimTimer = 0;
              this.projectiles.push({
                x: en.x + en.w * 0.5 + en.facing * 18,
                y: en.y + 14,
                vx: en.facing * 640,
                vy: 0,
                r: 6,
                life: 1.2,
                fromEnemy: true,
                damage: DAMAGE_TABLE.railgun_mech_shot,
                color: '#22d3ee',
                trail: [],
              });
            }
          } else {
            en.aimTimer = 0;
          }
          break;
        }
        case 'aegis_drone': {
          en.phase += dt * 3;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase) * 10;
          en.facing = en.vx >= 0 ? 1 : -1;
          break;
        }
        case 'cluster_mine': {
          en.phase += dt * 4;
          en.y = en.baseY + Math.sin(en.phase) * 8;
          if (Math.hypot(pcx - (en.x + en.w * 0.5), pcy - (en.y + en.h * 0.5)) < 68) {
            this.damageEnemy(en, 10, 'blast');
            continue;
          }
          break;
        }
        case 'vortex_fan': {
          en.subTimer = (en.subTimer ?? 0) + dt;
          const blowingOut = Math.sin(en.subTimer * 1.4) >= 0;
          const d = pcx - (en.x + en.w * 0.5);
          if (Math.abs(d) < 340 && Math.abs(pcy - (en.y + en.h * 0.5)) < 90) {
            const dir = blowingOut ? Math.sign(d || -1) : -Math.sign(d || -1);
            p.vx += dir * 320 * dt;
          }
          break;
        }
        case 'plasma_hound': {
          if (en.chargeState === 'patrol') {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            if (Math.abs(pcx - en.x) < 200 && Math.abs(pcy - en.y) < 60) {
              en.chargeState = 'charge';
              en.facing = pcx >= en.x ? 1 : -1;
              en.vy = -290;
              en.vx = en.facing * 230;
            }
          } else {
            en.vy += 940 * dt;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x + en.vx * dt));
            en.y += en.vy * dt;
            if (en.y >= en.baseY) {
              en.y = en.baseY;
              en.vy = 0;
              en.vx = en.facing * 95;
              en.chargeState = 'patrol';
            }
          }
          break;
        }
        case 'drill_mole': {
          en.chargeTimer = (en.chargeTimer ?? 1.4) - dt;
          if (en.chargeState === 'patrol') {
            en.y = en.baseY + 14; // Partially submerged
            en.x += Math.sign(pcx - (en.x + en.w * 0.5) || -1) * 75 * dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'charge';
              en.vy = -340;
            }
          } else {
            en.vy += 920 * dt;
            en.y += en.vy * dt;
            if (en.y >= en.baseY) {
              en.y = en.baseY;
              en.vy = 0;
              en.chargeState = 'patrol';
              en.chargeTimer = 1.4;
            }
          }
          en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x));
          break;
        }
        case 'tesla_walker': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = pcx >= en.x ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.6) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 420) {
            en.fireCooldown = 2.0;
            const cx = en.x + en.w * 0.5;
            this.projectiles.push({
              x: cx,
              y: en.y + 4,
              vx: en.facing * 210,
              vy: -220,
              r: 6.5,
              life: 2.0,
              fromEnemy: true,
              damage: DAMAGE_TABLE.tesla_walker_arc,
              gravity: 420,
              color: '#38f2ff',
              trail: [],
            });
          }
          break;
        }
        case 'phantom_knight': {
          en.chargeTimer = (en.chargeTimer ?? 1.2) - dt;
          if (en.chargeState === 'patrol') {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            if ((en.chargeTimer ?? 0) <= 0 && Math.abs(pcx - en.x) < 280) {
              en.chargeState = 'charge';
              en.chargeTimer = 0.55;
              en.facing = pcx >= en.x ? 1 : -1;
            }
          } else {
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x + en.facing * 310 * dt));
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'patrol';
              en.chargeTimer = 1.4;
            }
          }
          break;
        }
        case 'bio_spore': {
          en.phase += dt * 2.1;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase) * 14;
          en.fireCooldown = (en.fireCooldown ?? 2.0) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 380) {
            en.fireCooldown = 2.6;
            this.projectiles.push({
              x: en.x + en.w * 0.5,
              y: en.y + en.h,
              vx: (Math.random() - 0.5) * 90,
              vy: 75,
              r: 5.5,
              life: 2.5,
              fromEnemy: true,
              damage: DAMAGE_TABLE.bio_spore_cloud,
              color: '#4ade80',
              trail: [],
            });
          }
          break;
        }
        case 'omega_drone': {
          en.phase += dt * 3;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase) * 18;
          en.facing = pcx >= en.x ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.4) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - en.x, pcy - en.y) < 460) {
            en.fireCooldown = 1.55;
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            for (const off of [-0.14, 0.14]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang + off) * 320,
                vy: Math.sin(ang + off) * 320,
                r: 5.5,
                life: 1.8,
                fromEnemy: true,
                damage: DAMAGE_TABLE.omega_drone_laser,
                color: '#f43f5e',
                trail: [],
              });
            }
          }
          break;
        }
        case 'gear_roller': {
          const near = Math.abs(pcx - (en.x + en.w * 0.5)) < 220;
          const mult = near ? 1.35 : 1.0;
          en.x += en.vx * mult * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          en.phase += dt * 7.5 * en.facing;
          break;
        }
        case 'spark_jelly': {
          en.phase += dt * 2.4;
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.y = en.baseY + Math.sin(en.phase) * 20;
          en.facing = en.vx >= 0 ? 1 : -1;
          en.invulnMode = Math.sin(en.phase * 0.95) > 0.2;
          break;
        }
        case 'laser_drone': {
          en.phase += dt * 2.5;
          en.y = en.baseY + Math.sin(en.phase) * 8;
          en.fireCooldown = (en.fireCooldown ?? 2.2) - dt;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          const dist = Math.hypot(pcx - cx, pcy - cy);
          if ((en.aimTimer ?? 0) > 0) {
            en.aimTimer = (en.aimTimer ?? 0) - dt;
            en.facing = pcx >= cx ? 1 : -1;
            if ((en.aimTimer ?? 0) <= 0) {
              const ang = Math.atan2(pcy - cy, pcx - cx);
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang) * 380,
                vy: Math.sin(ang) * 380,
                r: 5.5,
                life: 1.75,
                fromEnemy: true,
                damage: DAMAGE_TABLE.laser_drone_beam,
                color: '#facc15',
                trail: [],
              });
              en.fireCooldown = 2.2;
            }
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            if ((en.fireCooldown ?? 0) <= 0 && dist < 440) {
              en.aimTimer = 0.58;
            }
          }
          break;
        }
        case 'thunder_imp': {
          en.phase += dt * 3.8;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.cos(en.phase) * 18;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = pcx >= cx ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.9) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 420) {
            en.fireCooldown = 1.95;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 255,
              vy: Math.sin(ang) * 255,
              r: 6,
              life: 2.0,
              fromEnemy: true,
              damage: DAMAGE_TABLE.thunder_imp_bolt,
              color: '#fde047',
              trail: [],
            });
          }
          break;
        }
        case 'spring_bumper': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          if (en.subTimer && en.subTimer > 0) en.subTimer = Math.max(0, en.subTimer - dt);
          break;
        }
        case 'magnet_crane': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          en.subTimer = ((en.subTimer ?? 0) + dt) % 2.9;
          const cx = en.x + en.w * 0.5;
          const inColumn = Math.abs(pcx - cx) <= 38 && pcy >= en.y + en.h && pcy <= en.y + en.h + 195;
          if (inColumn) {
            if (en.subTimer < 1.55) {
              // Attract / Lift beam pulls player upward gently
              p.vy = Math.max(-360, p.vy - 1520 * dt);
              p.onGround = false;
              p.airJumpsLeft = 1;
              p.vx += Math.sign(cx - pcx) * 240 * dt;
            } else if (en.subTimer >= 2.05) {
              // Repel shock slam!
              p.vy = Math.max(p.vy, 430);
              if (p.invulnTimer <= 0) {
                this.damagePlayer(false, Math.sign(pcx - cx) || -1, DAMAGE_TABLE.magnet_crane);
              }
            }
          }
          break;
        }
        case 'mirror_gear': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          en.phase += dt * (en.chargeState === 'warn' ? 2.2 : 5.4);
          if (en.chargeState === 'warn') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'patrol';
              en.chargeTimer = 0;
            }
          }
          break;
        }
        case 'tether_spark': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          en.phase += dt * 3.1;
          const ux = en.x + en.w * 0.5;
          const uy = en.y + en.h * 0.5;
          const swingAng = Math.sin(en.phase) * 0.72;
          const cableLen = 84;
          const bx = ux + Math.sin(swingAng) * cableLen;
          const by = uy + Math.cos(swingAng) * cableLen;
          if (
            p.invulnTimer <= 0 &&
            (this.distToSegment(pcx, pcy, ux, uy, bx, by) < 11 || Math.hypot(pcx - bx, pcy - by) < 16)
          ) {
            this.damagePlayer(false, Math.sign(pcx - bx) || -p.facing, DAMAGE_TABLE.tether_spark_wire);
          }
          break;
        }
        case 'gravity_flipper': {
          en.phase += dt * 2.5;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          en.y = en.baseY + Math.sin(en.phase) * 14;
          en.subTimer = ((en.subTimer ?? 0) + dt) % 2.6;
          if (en.subTimer >= 2.0) {
            const cx = en.x + en.w * 0.5;
            const cy = en.y + en.h * 0.5;
            if (Math.hypot(pcx - cx, pcy - cy) <= 175) {
              p.vy = Math.min(p.vy, -320);
              p.onGround = false;
              p.airJumpsLeft = 1;
            }
          }
          break;
        }
        case 'dash_rammer': {
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          if (en.chargeState === 'patrol') {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            if (Math.abs(pcy - cy) < 52 && Math.abs(pcx - cx) < 380) {
              en.chargeState = 'warn';
              en.chargeTimer = 0.52;
              en.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
            }
          } else if (en.chargeState === 'warn') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'charge';
              en.chargeTimer = 1.65;
            }
          } else if (en.chargeState === 'charge') {
            en.x += en.facing * 425 * dt;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x));
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0 || en.x <= en.minX || en.x >= en.maxX - en.w) {
              en.chargeState = 'recover';
              en.chargeTimer = 0.68;
            }
          } else {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) en.chargeState = 'patrol';
          }
          break;
        }
        case 'thorn_weaver': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = pcx >= cx ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.8) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 470) {
            en.fireCooldown = 2.25;
            en.subTimer = ((en.subTimer ?? 0) + 1) % 2;
            if (en.subTimer === 0) {
              for (const spd of [165, 235, 305]) {
                this.projectiles.push({
                  x: cx,
                  y: en.y + 8,
                  vx: en.facing * spd,
                  vy: -245,
                  r: 6,
                  life: 3.1,
                  fromEnemy: true,
                  gravity: 760,
                  bouncesLeft: 2,
                  damage: DAMAGE_TABLE.thorn_weaver_seed,
                  color: '#34d399',
                  trail: [],
                });
              }
            } else {
              this.projectiles.push({
                x: cx + en.facing * 12,
                y: en.y + en.h - 9,
                vx: en.facing * 265,
                vy: 0,
                r: 7,
                life: 2.1,
                fromEnemy: true,
                shockwave: true,
                damage: DAMAGE_TABLE.thorn_weaver_seed,
                color: '#10b981',
                trail: [],
              });
            }
          }
          break;
        }
        case 'emerald_mantis': {
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          if (en.chargeState === 'warn') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'charge';
              en.vy = -425;
              en.vx = en.facing * 270;
            }
          } else if (en.chargeState === 'charge') {
            en.vy += 980 * dt;
            en.x += en.vx * dt;
            en.y += en.vy * dt;
            en.x = Math.max(en.minX, Math.min(en.maxX - en.w, en.x));
            if (en.y >= en.baseY) {
              en.y = en.baseY;
              en.vy = 0;
              en.vx = en.facing * 76;
              en.chargeState = 'recover';
              en.chargeTimer = 0.85;
              for (const dir of [-1, 1]) {
                this.projectiles.push({
                  x: en.x + en.w * 0.5 + dir * 10,
                  y: en.y + en.h - 10,
                  vx: dir * 245,
                  vy: 0,
                  r: 7,
                  life: 1.5,
                  fromEnemy: true,
                  shockwave: true,
                  damage: DAMAGE_TABLE.emerald_mantis_slash,
                  color: '#10b981',
                  trail: [],
                });
              }
            }
          } else if (en.chargeState === 'recover') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'patrol';
            }
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) {
              en.x = en.minX;
              en.vx = Math.abs(en.vx);
            } else if (en.x + en.w >= en.maxX) {
              en.x = en.maxX - en.w;
              en.vx = -Math.abs(en.vx);
            }
            en.facing = en.vx >= 0 ? 1 : -1;
            if (Math.abs(pcx - cx) < 340 && Math.abs(pcy - cy) < 150) {
              en.chargeState = 'warn';
              en.chargeTimer = 0.44;
              en.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
            }
          }
          break;
        }
        case 'prism_spore': {
          en.phase += dt * 2.4;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          en.y = en.baseY + Math.sin(en.phase) * 20;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.fireCooldown = (en.fireCooldown ?? 1.9) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 460) {
            en.fireCooldown = 2.1;
            for (let k = 0; k < 4; k++) {
              const a = en.phase * 0.8 + (k * Math.PI) / 2;
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(a) * 195,
                vy: Math.sin(a) * 195,
                r: 5.5,
                life: 2.3,
                fromEnemy: true,
                damage: DAMAGE_TABLE.prism_spore_bolt,
                color: '#6ee7b7',
                trail: [],
              });
            }
          }
          break;
        }
        case 'chrono_vine': {
          en.phase += dt * 3.0;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = pcx >= cx ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.7) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 420) {
            en.fireCooldown = 2.45;
            const tx = Math.max(en.minX - 240, Math.min(en.maxX + 240, pcx));
            this.activeGroundSpikes.push({
              x: tx,
              floorY: this.findGroundY(tx, p.y + p.h),
              timer: 1.1,
              warnDuration: 1.1,
              radius: 22,
              erupted: false,
              life: 0.42,
              damage: DAMAGE_TABLE.chrono_vine_spike,
            });
            sound.playWarn();
          }
          break;
        }
        case 'bio_hydra': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = pcx >= cx ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.6) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 460) {
            en.fireCooldown = 1.95;
            en.subTimer = ((en.subTimer ?? 0) + 1) % 2;
            if (en.subTimer === 0) {
              const ang = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.36, 0, 0.36]) {
                this.projectiles.push({
                  x: cx,
                  y: en.y + 12,
                  vx: Math.cos(ang + off) * 225,
                  vy: Math.sin(ang + off) * 225,
                  r: 6,
                  life: 2.2,
                  fromEnemy: true,
                  damage: DAMAGE_TABLE.bio_hydra_wave,
                  color: '#4ade80',
                  trail: [],
                });
              }
            } else {
              this.projectiles.push({
                x: cx + en.facing * 14,
                y: en.y + en.h - 10,
                vx: en.facing * 270,
                vy: 0,
                r: 8,
                life: 2.0,
                fromEnemy: true,
                shockwave: true,
                damage: DAMAGE_TABLE.bio_hydra_wave,
                color: '#22c55e',
                trail: [],
              });
            }
          }
          break;
        }
        case 'jade_sniper': {
          en.phase += dt * 2.2;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          const dist = Math.hypot(pcx - cx, pcy - cy);
          en.fireCooldown = (en.fireCooldown ?? 1.2) - dt;
          if ((en.aimTimer ?? 0) > 0) {
            en.aimTimer! -= dt;
            en.facing = pcx >= cx ? 1 : -1;
            if ((en.aimTimer ?? 0) <= 0) {
              const ang = Math.atan2(pcy - cy, pcx - cx);
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang) * 395,
                vy: Math.sin(ang) * 395,
                r: 5.5,
                life: 2.4,
                fromEnemy: true,
                ricochetLeft: 2,
                damage: DAMAGE_TABLE.jade_sniper_beam,
                color: '#a7f3d0',
                trail: [],
              });
              en.fireCooldown = 2.35;
            }
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.y = en.baseY + Math.sin(en.phase) * 10;
            en.facing = en.vx >= 0 ? 1 : -1;
            if ((en.fireCooldown ?? 0) <= 0 && dist < 480) {
              en.aimTimer = 1.05;
            }
          }
          break;
        }
        case 'frost_wraith': {
          en.phase += dt * 2.3;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.y = en.baseY + Math.sin(en.phase) * 18;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = pcx >= cx ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.8) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 470) {
            en.fireCooldown = 2.35;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 185,
              vy: Math.sin(ang) * 185,
              r: 6.5,
              life: 2.2,
              fromEnemy: true,
              splitTimer: 0.65,
              splitDmg: DAMAGE_TABLE.frost_wraith_shard,
              chillDuration: 1.5,
              damage: DAMAGE_TABLE.frost_wraith_shard,
              color: '#7dd3fc',
              trail: [],
            });
          }
          break;
        }
        case 'icicle_bat': {
          en.phase += dt * 4.5;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          if (en.chargeState === 'charge') {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            en.y = en.baseY + 46 + Math.sin(en.phase) * 14;
            en.fireCooldown = (en.fireCooldown ?? 1.4) - dt;
            if ((en.fireCooldown ?? 0) <= 0 && Math.abs(pcx - cx) < 280) {
              en.fireCooldown = 1.9;
              this.projectiles.push({
                x: cx,
                y: en.y + en.h,
                vx: (pcx - cx) * 0.35,
                vy: 235,
                r: 5,
                life: 2.1,
                fromEnemy: true,
                chillDuration: 1.4,
                damage: DAMAGE_TABLE.icicle_bat_crystal,
                color: '#bae6fd',
                trail: [],
              });
            }
          } else if (Math.abs(pcx - cx) < 260 && pcy > en.y - 30) {
            en.chargeState = 'charge';
            en.facing = pcx >= cx ? 1 : -1;
            en.vx = en.facing * 125;
            en.fireCooldown = 0.85;
          }
          break;
        }
        case 'glacier_golem': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = Math.abs(pcx - cx) < 280 ? (pcx >= cx ? 1 : -1) : en.vx >= 0 ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.9) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 420) {
            en.fireCooldown = 2.45;
            this.projectiles.push({
              x: cx + en.facing * 12,
              y: en.y + 8,
              vx: en.facing * 205,
              vy: -260,
              r: 7.5,
              life: 2.8,
              fromEnemy: true,
              gravity: 680,
              chillDuration: 1.6,
              damage: DAMAGE_TABLE.glacier_golem_boulder,
              color: '#38bdf8',
              trail: [],
            });
          }
          break;
        }
        case 'cryo_turret': {
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          const dist = Math.hypot(pcx - cx, pcy - cy);
          en.facing = pcx >= cx ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 1.5) - dt;
          if ((en.aimTimer ?? 0) > 0) {
            en.aimTimer! -= dt;
            if ((en.aimTimer ?? 0) <= 0) {
              en.fireCooldown = 2.2;
              const baseAng = en.phase;
              en.phase += Math.PI / 4;
              for (let k = 0; k < 4; k++) {
                const a = baseAng + (k * Math.PI) / 2;
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(a) * 215,
                  vy: Math.sin(a) * 215,
                  r: 5.5,
                  life: 2.3,
                  fromEnemy: true,
                  chillDuration: 1.6,
                  damage: DAMAGE_TABLE.cryo_turret_nova,
                  color: '#7dd3fc',
                  trail: [],
                });
              }
            }
          } else if ((en.fireCooldown ?? 0) <= 0 && dist < 440) {
            en.aimTimer = 0.55;
          }
          break;
        }
        case 'blizzard_fairy': {
          en.phase += dt * 2.6;
          en.x += en.vx * dt;
          if (en.x <= en.minX) en.vx = Math.abs(en.vx);
          else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
          en.facing = en.vx >= 0 ? 1 : -1;
          en.y = en.baseY + Math.sin(en.phase) * 16;
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.fireCooldown = (en.fireCooldown ?? 1.8) - dt;
          if ((en.fireCooldown ?? 0) <= 0 && Math.hypot(pcx - cx, pcy - cy) < 430) {
            en.fireCooldown = 2.4;
            for (let k = 0; k < 6; k++) {
              const a = en.phase + (k * Math.PI) / 3;
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(a) * 185,
                vy: Math.sin(a) * 185,
                r: 5,
                life: 2.2,
                fromEnemy: true,
                chillDuration: 2.0,
                damage: DAMAGE_TABLE.blizzard_fairy_aura,
                color: '#e0f2fe',
                trail: [],
              });
            }
          }
          break;
        }
        case 'ice_skater': {
          en.phase += dt * 6;
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          en.facing = en.vx >= 0 ? 1 : -1;
          break;
        }
        case 'mirror_frost': {
          en.x += en.vx * dt;
          if (en.x <= en.minX) {
            en.x = en.minX;
            en.vx = Math.abs(en.vx);
          } else if (en.x + en.w >= en.maxX) {
            en.x = en.maxX - en.w;
            en.vx = -Math.abs(en.vx);
          }
          const cx = en.x + en.w * 0.5;
          const cy = en.y + en.h * 0.5;
          en.facing = en.vx >= 0 ? 1 : -1;
          en.fireCooldown = (en.fireCooldown ?? 2.0) - dt;
          if (
            (en.fireCooldown ?? 0) <= 0 &&
            Math.sign(pcx - cx) === en.facing &&
            Math.abs(pcx - cx) < 340 &&
            Math.abs(pcy - cy) < 75
          ) {
            en.fireCooldown = 2.2;
            this.projectiles.push({
              x: cx + en.facing * 12,
              y: cy,
              vx: en.facing * 265,
              vy: 0,
              r: 5.5,
              life: 1.9,
              fromEnemy: true,
              chillDuration: 1.4,
              damage: DAMAGE_TABLE.mirror_frost,
              color: '#bae6fd',
              trail: [],
            });
          }
          break;
        }
        case 'permafrost_wyrm': {
          const cx = en.x + en.w * 0.5;
          if (en.chargeState === 'warn') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if (Math.random() < 0.4) {
              this.spawnParticles(cx + (Math.random() - 0.5) * 18, en.baseY + en.h, 1, {
                color: '#7dd3fc',
                speedMin: 30,
                speedMax: 85,
                angleMin: -Math.PI * 0.8,
                angleMax: -Math.PI * 0.2,
                size: 2.5,
                life: 0.24,
                gravity: 160,
                glow: true,
              });
            }
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'charge';
              en.vy = -345;
              en.y = en.baseY;
              sound.playExplosion();
              for (const ang of [-2.4, -1.9, -1.25, -0.75]) {
                this.projectiles.push({
                  x: cx,
                  y: en.y + 4,
                  vx: Math.cos(ang) * 210,
                  vy: Math.sin(ang) * 210,
                  r: 5.5,
                  life: 2.2,
                  fromEnemy: true,
                  gravity: 420,
                  chillDuration: 1.5,
                  damage: DAMAGE_TABLE.permafrost_wyrm_shard,
                  color: '#38bdf8',
                  trail: [],
                });
              }
            }
          } else if (en.chargeState === 'charge') {
            en.vy += 860 * dt;
            en.y += en.vy * dt;
            if (en.y >= en.baseY + 10) {
              en.y = en.baseY + 10;
              en.vy = 0;
              en.chargeState = 'recover';
              en.chargeTimer = 1.6;
            }
          } else if (en.chargeState === 'recover') {
            en.chargeTimer = (en.chargeTimer ?? 0) - dt;
            if ((en.chargeTimer ?? 0) <= 0) {
              en.chargeState = 'patrol';
            }
          } else {
            en.x += en.vx * dt;
            if (en.x <= en.minX) en.vx = Math.abs(en.vx);
            else if (en.x + en.w >= en.maxX) en.vx = -Math.abs(en.vx);
            en.facing = en.vx >= 0 ? 1 : -1;
            en.y = en.baseY + 10;
            if (Math.abs(pcx - cx) < 195 && Math.abs(pcy - en.baseY) < 140) {
              en.chargeState = 'warn';
              en.chargeTimer = 0.55;
              sound.playWarn();
            }
          }
          break;
        }
          const knockDir = Math.sign(pcx - (en.x + en.w * 0.5)) || -p.facing;
          this.damagePlayer(false, knockDir, contactDmg);
          if (en.kind === 'spring_bumper') {
            p.vx = knockDir * 355;
            p.vy = -210;
          }
        }
      }
    }
  }

  private updateBoss(dt: number) {
    const boss = this.level.boss;
    if (!boss || boss.defeated) return;

    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;

    if (!boss.active) {
      if (p.x >= boss.arenaMinX + 45) {
        boss.active = true;
        // Purge any stray external enemy shots / off-arena telegraphs when boss lock engages
        for (const pr of this.projectiles) {
          if (pr.fromEnemy && (pr.x < boss.arenaMinX - 8 || pr.x > boss.arenaMaxX + 8)) {
            pr.life = -1;
            pr.damage = 0;
          }
        }
        this.activeLightningStrikes = this.activeLightningStrikes.filter(
          (st) => st.x >= boss.arenaMinX - 8 && st.x <= boss.arenaMaxX + 8
        );
        this.activeGroundSpikes = this.activeGroundSpikes.filter(
          (sp) => sp.x >= boss.arenaMinX - 8 && sp.x <= boss.arenaMaxX + 8
        );
        this.addShake(4, 0.14);
        sound.playWarn();
        this.addFloatingText(boss.arenaMinX + (boss.arenaMaxX - boss.arenaMinX) * 0.5, 110, 'ARENA LOCKED', '#f43f5e');
        this.pushHud(true);
      }
      return;
    }

    if (boss.hitFlash > 0) boss.hitFlash -= dt;
    if (boss.stunTimer > 0) boss.stunTimer -= dt;

    if (boss.kind === 'mid_guardian') {
      // W1 Mid-Boss: Heavy Shield Guardian (Non-warp, wall-to-wall shield bash + bouncing iron buckler)
      boss.stateTimer -= dt;

      if (boss.stunTimer > 0) {
        // Stunned with shield dropped
      } else if (boss.state === 'idle') {
        boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
        boss.x += boss.facing * 56 * dt;
        if (boss.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.35) {
            boss.state = 'leap';
            boss.vy = -450;
            boss.vx = boss.facing * 195;
            boss.stateTimer = 1.2;
          } else if (roll < 0.68) {
            boss.state = 'charge_warn';
            boss.stateTimer = 0.45;
            boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
            sound.playWarn();
          } else {
            boss.state = 'shoot';
            boss.stateTimer = 0.6;
            // Unique Bouncing Shield Buckler Disc
            this.projectiles.push({
              x: boss.x + (boss.facing > 0 ? boss.w + 4 : -4),
              y: boss.y + 24,
              vx: boss.facing * 265,
              vy: -190,
              r: 8,
              life: 3.8,
              fromEnemy: true,
              gravity: 660,
              bouncesLeft: 3,
              damage: DAMAGE_TABLE.mid_guardian_shot,
              color: '#fbbf24',
              trail: [],
            });
          }
        }
      } else if (boss.state === 'charge_warn') {
        boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'charge';
          boss.stateTimer = 4.0;
          boss.vx = boss.facing * 350;
          this.addShake(3.8, 0.12);
          sound.playExplosion();
        }
      } else if (boss.state === 'charge') {
        boss.x += boss.vx * dt;
        if (
          (boss.vx < 0 && boss.x <= boss.arenaMinX + 12) ||
          (boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 12) ||
          boss.stateTimer <= 0
        ) {
          boss.vx = 0;
          boss.state = 'idle';
          boss.stateTimer = 1.05;
        }
      } else if (boss.state === 'leap') {
        boss.vy += 1100 * dt;
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;
        if (boss.y + boss.h >= boss.floorY) {
          boss.y = boss.floorY - boss.h;
          boss.vy = 0;
          boss.vx = 0;
          this.addShake(5.5, 0.16);
          sound.playLand(1);
          boss.state = 'idle';
          boss.stateTimer = 1.1;
        }
      } else if (boss.state === 'shoot') {
        if (boss.stateTimer <= 0) {
          boss.state = 'idle';
          boss.stateTimer = 1.05;
        }
      }

      boss.x = Math.max(boss.arenaMinX, Math.min(boss.arenaMaxX - boss.w, boss.x));
    } else if (boss.kind === 'overlord_core') {
      // Prototype Boss: 星幽機皇・オーヴァーロード (Sin-Wave Cosmic Ribbons + Meteor Cross, Zero Warp)
      boss.phase = boss.hp <= 6 ? 3 : boss.hp <= 11 ? 2 : 1;
      boss.stateTimer -= dt;
      boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;

      if (boss.state === 'hover') {
        const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;
        const targetX = midX + Math.sin(this.worldTime * 1.4) * 235;
        const targetY = 148 + Math.sin(this.worldTime * 2.7) * 34;
        boss.x += (targetX - boss.x) * Math.min(1, 4.2 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.5 * dt);

        if (boss.stateTimer <= 0) {
          const cx = boss.x + boss.w * 0.5;
          const cy = boss.y + boss.h * 0.5;
          if (Math.random() < 0.42) {
            // Diagonal Meteor Cross (4 beams launched cleanly from hovering crest)
            for (const a of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 0.12, Math.PI * 0.88]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(a) * 285,
                vy: Math.sin(a) * 285,
                r: 8,
                life: 3.4,
                fromEnemy: true,
                ricochetLeft: 1,
                damage: DAMAGE_TABLE.overlord_core_slam,
                color: '#f43f5e',
                trail: [],
              });
            }
            this.addShake(4.2, 0.14);
            sound.playExplosion();
            boss.stateTimer = 1.45;
          } else {
            const baseAng = Math.atan2(pcy - cy, pcx - cx);
            for (const off of [-0.42, -0.14, 0.14, 0.42]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(baseAng + off) * 255,
                vy: Math.sin(baseAng + off) * 255,
                r: 6.5,
                life: 4.0,
                fromEnemy: true,
                waveAmp: 95,
                waveFreq: 10,
                damage: DAMAGE_TABLE.overlord_core_spread,
                color: '#38f2ff',
                trail: [],
              });
            }
            if (boss.phase >= 2) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(baseAng) * 180,
                vy: Math.sin(baseAng) * 180,
                r: 8,
                life: 4.8,
                fromEnemy: true,
                homing: true,
                damage: DAMAGE_TABLE.archmage_homing_orb,
                color: '#f43f5e',
                trail: [],
              });
            }
            boss.stateTimer = boss.phase === 3 ? 1.15 : 1.45;
          }
        }
      } else {
        boss.state = 'hover';
        boss.stateTimer = 1.2;
      }
    } else if (boss.kind === 'clockwork_core') {
      // W2 Mid-Boss: クロックワーク・コア (Signature 4-Beam Brass Cross + Chrono-Paused Pendulum Gears)
      boss.phase = boss.hp <= 5 ? 2 : 1;
      boss.stateTimer -= dt;
      boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;

      if (boss.state === 'hover') {
        const targetX = midX + Math.sin(this.worldTime * 1.45) * 235;
        const targetY = 175 + Math.sin(this.worldTime * 2.6) * 32;
        boss.x += (targetX - boss.x) * Math.min(1, 4.2 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.5 * dt);
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.44) {
            boss.state = 'laser_spin';
            boss.stateTimer = 2.4;
          } else if (r < 0.78) {
            // Unique Chrono-Paused Gears: pause mid-air with dashed sightline, then snap toward player!
            const cx = boss.x + boss.w * 0.5;
            const cy = boss.y + boss.h * 0.5;
            const count = boss.phase === 2 ? 4 : 3;
            for (let k = 0; k < count; k++) {
              const a = (k * Math.PI * 2) / count + 0.35;
              this.projectiles.push({
                x: cx + Math.cos(a) * 68,
                y: cy + Math.sin(a) * 68,
                vx: 0,
                vy: 0,
                r: 7.5,
                life: 3.4,
                fromEnemy: true,
                pauseTimer: 0.68 + k * 0.14,
                pauseTargetX: pcx,
                pauseTargetY: pcy,
                pauseSpeed: 315,
                damage: DAMAGE_TABLE.clockwork_core_gear,
                color: '#facc15',
                trail: [],
              });
            }
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 14, 'CHRONO PENDULUM!', '#fde047');
            boss.stateTimer = boss.phase === 2 ? 1.55 : 1.8;
          } else {
            const cx = boss.x + boss.w * 0.5;
            const cy = boss.y + boss.h * 0.5;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            for (const off of [-0.22, 0.22]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang + off) * 255,
                vy: Math.sin(ang + off) * 255,
                r: 7,
                life: 4.2,
                fromEnemy: true,
                bouncesLeft: 1,
                damage: DAMAGE_TABLE.clockwork_core_gear,
                color: '#facc15',
                trail: [],
              });
            }
            boss.stateTimer = boss.phase === 2 ? 1.15 : 1.45;
          }
        }
      } else if (boss.state === 'laser_spin') {
        const sweepX = midX + Math.sin(this.worldTime * 1.35) * 205;
        const sweepY = boss.floorY - 144 + Math.cos(this.worldTime * 2.1) * 22;
        boss.x += (sweepX - boss.x) * Math.min(1, 5.0 * dt);
        boss.y += (sweepY - boss.y) * Math.min(1, 5.0 * dt);
        const cx = boss.x + boss.w * 0.5;
        const cy = boss.y + boss.h * 0.5;
        const spinBase = this.worldTime * (boss.phase === 2 ? 1.5 : 1.15);
        if (p.invulnTimer <= 0) {
          for (let k = 0; k < 4; k++) {
            const a = spinBase + (k * Math.PI) / 2;
            const lx = cx + Math.cos(a) * 195;
            const ly = cy + Math.sin(a) * 195;
            if (this.distToSegment(pcx, pcy, cx, cy, lx, ly) < 11) {
              this.damagePlayer(false, Math.sign(pcx - cx) || -1, DAMAGE_TABLE.clockwork_core_laser);
              break;
            }
          }
        }
        if (boss.stateTimer <= 0) {
          boss.state = 'hover';
          boss.stateTimer = 1.35;
        }
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'thunder_kronos') {
      // W2 Final Boss: 雷帝サンダー・クロノス (14 HP / 3 Distinct Forms / ZERO WARP + Full Wall-to-Wall Blitz Completion)
      const prevPhase = boss.phase;
      boss.phase = boss.hp <= 4 ? 3 : boss.hp <= 9 ? 2 : 1;
      if (boss.phase !== prevPhase) {
        this.addFloatingText(
          boss.x + boss.w * 0.5,
          boss.y - 22,
          boss.phase === 2 ? 'FORM II: OVERDRIVE BLITZ!' : 'FORM III: STORM TEMPEST!',
          boss.phase === 3 ? '#fb7185' : '#fde047'
        );
        sound.playWarn();
      }
      boss.stateTimer -= dt;
      if (boss.state !== 'blitz_dash') {
        boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
      }

      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const funnelCount = boss.phase === 3 ? 4 : boss.phase === 2 ? 3 : 2;
      boss.clones = [];
      for (let k = 0; k < funnelCount; k++) {
        const ang = this.worldTime * (1.9 + boss.phase * 0.35) + (k * Math.PI * 2) / funnelCount;
        boss.clones.push({
          x: cx + Math.cos(ang) * 92,
          y: cy + Math.sin(ang) * 58,
          alpha: 0.95,
        });
      }

      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;

      if (boss.state === 'hover') {
        const targetX = midX + Math.sin(this.worldTime * (1.05 + boss.phase * 0.14)) * 240;
        const targetY = boss.floorY - 200 + Math.sin(this.worldTime * 2.5) * 22;
        boss.x += (targetX - boss.x) * Math.min(1, 4.0 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.4 * dt);

        if (boss.stateTimer <= 0) {
          const roll = Math.random();
          if (boss.phase === 1) {
            if (roll < 0.36) {
              for (const offX of [0, (Math.random() < 0.5 ? -1 : 1) * 165]) {
                const lx = Math.max(boss.arenaMinX + 40, Math.min(boss.arenaMaxX - 40, pcx + offX));
                this.activeLightningStrikes.push({
                  x: lx,
                  floorY: boss.floorY,
                  timer: 1.55,
                  warnDuration: 1.55,
                  strikeRadius: 24,
                  struck: false,
                  strikeLife: 0.32,
                });
              }
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'THUNDER JUDGMENT!', '#fde047');
              boss.stateTimer = 2.0;
            } else if (roll < 0.68) {
              const baseAng = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.2, 0.2]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(baseAng + off) * 215,
                  vy: Math.sin(baseAng + off) * 215,
                  r: 7,
                  life: 4.5,
                  fromEnemy: true,
                  damage: DAMAGE_TABLE.thunder_kronos_bolt,
                  color: '#fde047',
                  trail: [],
                });
              }
              boss.stateTimer = 1.8;
            } else {
              for (const fn of boss.clones) {
                const fAng = Math.atan2(pcy - fn.y, pcx - fn.x);
                this.projectiles.push({
                  x: fn.x,
                  y: fn.y,
                  vx: Math.cos(fAng) * 185,
                  vy: Math.sin(fAng) * 185,
                  r: 6,
                  life: 4.8,
                  fromEnemy: true,
                  damage: DAMAGE_TABLE.thunder_kronos_funnel,
                  color: '#f59e0b',
                  trail: [],
                });
              }
              boss.stateTimer = 1.85;
            }
          } else if (boss.phase === 2) {
            if (roll < 0.42) {
              boss.state = 'blitz_warn';
              boss.stateTimer = 0.88;
              boss.comboLeft = 0;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'BLITZ RAIL LOCK!', '#facc15');
            } else if (roll < 0.74) {
              boss.state = 'slam_prep';
              boss.stateTimer = 0.55;
            } else {
              const baseAng = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.22, 0.22]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(baseAng + off) * 225,
                  vy: Math.sin(baseAng + off) * 225,
                  r: 7,
                  life: 4.5,
                  fromEnemy: true,
                  damage: DAMAGE_TABLE.thunder_kronos_bolt,
                  color: '#fde047',
                  trail: [],
                });
              }
              boss.stateTimer = 1.55;
            }
          } else {
            if (roll < 0.38) {
              boss.state = 'tempest_sweep';
              boss.stateTimer = 2.45;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 18, 'TEMPEST TWIN SWEEP!', '#fb7185');
            } else if (roll < 0.68) {
              for (let k = -1; k <= 1; k++) {
                const lx = Math.max(boss.arenaMinX + 44, Math.min(boss.arenaMaxX - 44, pcx + k * 145));
                this.activeLightningStrikes.push({
                  x: lx,
                  floorY: boss.floorY,
                  timer: 1.25 + Math.abs(k) * 0.28,
                  warnDuration: 1.55,
                  strikeRadius: 24,
                  struck: false,
                  strikeLife: 0.32,
                });
              }
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'STORM CASCADE!', '#fde047');
              boss.stateTimer = 1.85;
            } else {
              boss.state = 'blitz_warn';
              boss.stateTimer = 0.78;
              boss.comboLeft = 1;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'DOUBLE BLITZ LOCK!', '#fb7185');
            }
          }
        }
      } else if (boss.state === 'blitz_warn') {
        const targetY = Math.max(boss.floorY - 220, Math.min(boss.floorY - boss.h - 24, pcy - boss.h * 0.5));
        boss.y += Math.max(-220 * dt, Math.min(220 * dt, targetY - boss.y));
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'blitz_dash';
          boss.stateTimer = 4.0;
          boss.comboLeft = boss.phase === 3 ? 1 : 0;
          boss.vx = boss.facing * 485;
          this.addShake(4.5, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'blitz_dash') {
        boss.x += boss.vx * dt;
        if (Math.random() < 0.85) {
          this.spawnParticles(cx, cy, 2, {
            color: '#fde047',
            speedMin: 40,
            speedMax: 140,
            angleMin: 0,
            angleMax: Math.PI * 2,
            size: 3,
            life: 0.24,
            gravity: 0,
            glow: true,
          });
        }
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 24;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 24;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 26 : boss.arenaMaxX - boss.w - 26;
            boss.vx = -boss.vx;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            this.addShake(4.5, 0.14);
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.state = 'hover';
            boss.stateTimer = boss.phase === 3 ? 1.45 : 1.55;
          }
        }
      } else if (boss.state === 'tempest_sweep') {
        boss.x += (midX - boss.x) * Math.min(1, 3.2 * dt);
        boss.y += (boss.floorY - 165 - boss.y) * Math.min(1, 3.5 * dt);
        const sweepBase = this.worldTime * 0.95;
        if (p.invulnTimer <= 0) {
          for (let k = 0; k < 2; k++) {
            const a = sweepBase + k * Math.PI;
            const lx = cx + Math.cos(a) * 480;
            const ly = cy + Math.sin(a) * 480;
            if (this.distToSegment(pcx, pcy, cx, cy, lx, ly) < 11) {
              this.damagePlayer(false, Math.sign(pcx - cx) || -1, DAMAGE_TABLE.thunder_kronos_sweep);
              break;
            }
          }
        }
        if (boss.stateTimer <= 0) {
          boss.state = 'hover';
          boss.stateTimer = 1.55;
        }
      } else if (boss.state === 'slam_prep') {
        boss.y += 420 * dt;
        if (boss.y + boss.h >= boss.floorY) {
          boss.y = boss.floorY - boss.h;
          this.addShake(7.0, 0.2);
          sound.playExplosion();
          for (const dir of [-1, 1]) {
            this.projectiles.push({
              x: boss.x + boss.w * 0.5 + dir * 24,
              y: boss.floorY - 12,
              vx: dir * 255,
              vy: 0,
              r: 9,
              life: 4.0,
              fromEnemy: true,
              damage: DAMAGE_TABLE.thunder_kronos_slam,
              shockwave: true,
              color: '#facc15',
              trail: [],
            });
          }
          boss.state = 'hover';
          boss.stateTimer = 1.65;
        }
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'archmage') {
      // W1 Final Boss: 魔導機神・アークメイジ (Pure Bullet-Hell Mage: Homing Orbs, Arcane Rings & Twin Illusion Clones — No Ground Slam)
      boss.phase = boss.hp <= 4 ? 3 : boss.hp <= 7 ? 2 : 1;
      boss.stateTimer -= dt;
      boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;

      if (boss.state === 'hover') {
        const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;
        const targetX = midX + Math.sin(this.worldTime * 1.15) * 195;
        const targetY = boss.floorY - 160 + Math.sin(this.worldTime * 2.5) * 24;
        boss.x += (targetX - boss.x) * Math.min(1, 4.0 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.5 * dt);

        if (boss.stateTimer <= 0) {
          const cx = boss.x + boss.w * 0.5;
          const cy = boss.y + boss.h * 0.5;
          const ang = Math.atan2(pcy - cy, pcx - cx);
          if (boss.phase >= 2 && Math.random() < 0.44) {
            // Expanding 6-Orb Arcane Pulse Ring (distinct from physical boss shockwaves)
            for (let k = 0; k < 6; k++) {
              const a = this.worldTime * 0.7 + (k * Math.PI) / 3;
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(a) * 195,
                vy: Math.sin(a) * 195,
                r: 7,
                life: 3.8,
                fromEnemy: true,
                damage: DAMAGE_TABLE.archmage_shockwave,
                color: '#c084fc',
                trail: [],
              });
            }
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 14, 'ARCANE RING!', '#c084fc');
            boss.stateTimer = 1.55;
          } else {
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 175,
              vy: Math.sin(ang) * 175,
              r: 7.5,
              life: 4.8,
              fromEnemy: true,
              damage: DAMAGE_TABLE.archmage_homing_orb,
              homing: true,
              color: '#c084fc',
              trail: [],
            });
            const fanAngles = boss.phase === 1 && Math.random() < 0.55 ? [-0.24, 0, 0.24] : [-0.28, 0.28];
            for (const off of fanAngles) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang + off) * 255,
                vy: Math.sin(ang + off) * 255,
                r: 6,
                life: 4.0,
                fromEnemy: true,
                damage: DAMAGE_TABLE.archmage_spread_bolt,
                color: '#38f2ff',
                trail: [],
              });
            }
            if (boss.phase === 3) {
              for (const cl of boss.clones) {
                const cAng = Math.atan2(pcy - cl.y, pcx - cl.x);
                this.projectiles.push({
                  x: cl.x,
                  y: cl.y,
                  vx: Math.cos(cAng) * 225,
                  vy: Math.sin(cAng) * 225,
                  r: 6,
                  life: 4.5,
                  fromEnemy: true,
                  damage: DAMAGE_TABLE.archmage_clone_bolt,
                  color: '#f43f5e',
                  trail: [],
                });
              }
            }
            boss.stateTimer = boss.phase === 3 ? 1.35 : boss.phase === 2 ? 1.5 : 1.65;
          }
        }
      } else {
        boss.state = 'hover';
        boss.stateTimer = 1.25;
      }

      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));

      if (boss.phase === 3) {
        boss.clones = [
          { x: boss.arenaMinX + 60, y: boss.floorY - 188 + Math.sin(this.worldTime * 2.4) * 16, alpha: 0.6 },
          { x: boss.arenaMaxX - 80, y: boss.floorY - 188 - Math.sin(this.worldTime * 2.4) * 16, alpha: 0.6 },
        ];
      } else {
        boss.clones = [];
      }
    } else if (boss.kind === 'iron_goliath') {
      // W1 Roaming Encounter Mini-Boss (3 Distinct Encounter Variants — Never Cloned!)
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const variant = boss.variant ?? 1;
      if (boss.state === 'idle') {
        boss.y = boss.floorY - boss.h;
        boss.facing = pcx >= cx ? 1 : -1;
        boss.x += boss.facing * (variant === 3 ? 82 : 64) * dt;
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (variant === 2 && r < 0.45) {
            // Variant 2 Signature: Seismic Vault Slam
            boss.state = 'goliath_leap';
            boss.vy = -490;
            boss.vx = boss.facing * 235;
            boss.stateTimer = 2.0;
            sound.playWarn();
          } else if (r < 0.48) {
            boss.state = 'charge_warn';
            boss.stateTimer = 0.46;
            boss.comboLeft = variant === 3 ? 1 : 0;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
          } else if (variant === 3) {
            // Variant 3 Signature: Twin Horizontal Siege Shells (Upper + Lower)
            boss.stateTimer = 1.4;
            for (const sy of [boss.y + 10, boss.floorY - 18]) {
              this.projectiles.push({
                x: cx + boss.facing * 18,
                y: sy,
                vx: boss.facing * 315,
                vy: 0,
                r: 7.5,
                life: 2.6,
                fromEnemy: true,
                damage: DAMAGE_TABLE.iron_goliath_mortar,
                color: '#facc15',
                trail: [],
              });
            }
          } else {
            boss.stateTimer = 1.45;
            const arcs = variant === 2 ? [170, 275] : [145, 225, 305];
            for (const spd of arcs) {
              this.projectiles.push({
                x: cx,
                y: boss.y + 10,
                vx: boss.facing * spd,
                vy: -310,
                r: 7,
                life: 3.0,
                fromEnemy: true,
                gravity: 660,
                damage: DAMAGE_TABLE.iron_goliath_mortar,
                color: '#38bdf8',
                trail: [],
              });
            }
          }
        }
      } else if (boss.state === 'goliath_leap') {
        boss.vy += 1080 * dt;
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;
        if (boss.y + boss.h >= boss.floorY) {
          boss.y = boss.floorY - boss.h;
          boss.vy = 0;
          boss.vx = 0;
          this.addShake(5.5, 0.16);
          sound.playExplosion();
          for (const dir of [-1, 1]) {
            this.projectiles.push({
              x: cx + dir * 16,
              y: boss.floorY - 12,
              vx: dir * 285,
              vy: 0,
              r: 8,
              life: 2.4,
              fromEnemy: true,
              shockwave: true,
              damage: DAMAGE_TABLE.iron_goliath_mortar,
              color: '#38bdf8',
              trail: [],
            });
          }
          boss.state = 'idle';
          boss.stateTimer = 1.15;
        }
      } else if (boss.state === 'charge_warn') {
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'charge';
          boss.stateTimer = 4.0;
          boss.vx = boss.facing * (variant === 3 ? 455 : 420);
          this.addShake(4.2, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'charge') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 12;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 12;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if (hitLeft || hitRight) {
            this.addShake(5, 0.16);
            sound.playExplosion();
            this.projectiles.push({
              x: cx,
              y: boss.floorY - 12,
              vx: hitLeft ? 285 : -285,
              vy: 0,
              r: 8,
              life: 2.5,
              fromEnemy: true,
              shockwave: true,
              damage: DAMAGE_TABLE.iron_goliath_mortar,
              color: '#38bdf8',
              trail: [],
            });
            if ((boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
              boss.comboLeft = (boss.comboLeft ?? 1) - 1;
              boss.x = hitLeft ? boss.arenaMinX + 14 : boss.arenaMaxX - boss.w - 14;
              boss.vx = -boss.vx;
              boss.facing = boss.vx > 0 ? 1 : -1;
              boss.stateTimer = 4.0;
            } else {
              boss.vx = 0;
              boss.state = 'idle';
              boss.stateTimer = 1.15;
            }
          } else {
            boss.vx = 0;
            boss.state = 'idle';
            boss.stateTimer = 1.15;
          }
        }
      }
      boss.x = Math.max(boss.arenaMinX + 10, Math.min(boss.arenaMaxX - boss.w - 10, boss.x));
    } else if (boss.kind === 'volt_centurion') {
      // W2 Roaming Encounter Mini-Boss (3 Distinct Encounter Variants — Smooth non-warp flight)
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;
      const variant = boss.variant ?? 1;

      if (boss.state === 'volt_warn') {
        const targetY = Math.max(boss.floorY - 210, Math.min(boss.floorY - boss.h - 20, pcy - boss.h * 0.5));
        boss.y += Math.max(-210 * dt, Math.min(210 * dt, targetY - boss.y));
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'volt_dash';
          boss.stateTimer = 4.0;
          boss.vx = boss.facing * (variant === 3 ? 470 : 445);
          this.addShake(4, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'volt_dash') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 14;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 14;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 16 : boss.arenaMaxX - boss.w - 16;
            boss.vx = -boss.vx;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            sound.playShieldClang();
          } else {
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 320,
              vy: Math.sin(ang) * 320,
              r: 8.5,
              life: 2.4,
              fromEnemy: true,
              boomerang: { originX: cx, originY: cy, speed: 335, elapsed: 0, turned: false },
              damage: DAMAGE_TABLE.volt_centurion_disc,
              color: '#facc15',
              trail: [],
            });
            boss.vx = 0;
            boss.state = 'hover';
            boss.stateTimer = 1.35;
          }
        }
      } else {
        boss.facing = pcx >= cx ? 1 : -1;
        const targetX = midX + Math.sin(this.worldTime * (1.35 + variant * 0.15)) * 245;
        const targetY = boss.floorY - 175 + Math.sin(this.worldTime * 2.8) * 28;
        boss.x += (targetX - boss.x) * Math.min(1, 4.2 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.5 * dt);
        if (boss.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.35) {
            boss.state = 'volt_warn';
            boss.stateTimer = 0.56;
            boss.comboLeft = variant === 3 ? 1 : 0;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
          } else if (variant === 2 && roll < 0.72) {
            // Variant 2 Signature: Twin Thunder Pillar Strikes + X-Diagonal Spark
            const span = boss.arenaMaxX - boss.arenaMinX;
            for (const f of [0.28, 0.72]) {
              this.activeLightningStrikes.push({
                x: boss.arenaMinX + span * f,
                floorY: boss.floorY,
                timer: 0.95,
                warnDuration: 0.95,
                struck: false,
                strikeRadius: 24,
                strikeLife: 0.34,
                damage: DAMAGE_TABLE.volt_centurion_disc,
                color: '#fde047',
              });
            }
            boss.stateTimer = 1.55;
          } else if (variant === 3 && roll < 0.74) {
            // Variant 3 Signature: Paused 4-Capacitor Lock Volley
            for (let k = 0; k < 4; k++) {
              const a = (k * Math.PI) / 2 + 0.4;
              const px = cx + Math.cos(a) * 65;
              const py = cy + Math.sin(a) * 65;
              const aim = Math.atan2(pcy - py, pcx - px);
              this.projectiles.push({
                x: px,
                y: py,
                vx: Math.cos(aim) * 290,
                vy: Math.sin(aim) * 290,
                r: 6,
                life: 2.8,
                fromEnemy: true,
                pauseTimer: 0.65,
                damage: DAMAGE_TABLE.volt_centurion_disc,
                color: '#fef08a',
                trail: [],
              });
            }
            boss.stateTimer = 1.55;
          } else if (roll < 0.68) {
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 330,
              vy: Math.sin(ang) * 330,
              r: 9,
              life: 2.6,
              fromEnemy: true,
              boomerang: { originX: cx, originY: cy, speed: 340, elapsed: 0, turned: false },
              damage: DAMAGE_TABLE.volt_centurion_disc,
              color: '#facc15',
              trail: [],
            });
            boss.stateTimer = 1.45;
          } else {
            const ang = Math.atan2(pcy - cy, pcx - cx);
            for (const off of [-0.26, 0, 0.26]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang + off) * 255,
                vy: Math.sin(ang + off) * 255,
                r: 6,
                life: 3.4,
                fromEnemy: true,
                damage: DAMAGE_TABLE.volt_centurion_disc,
                color: '#fde047',
                trail: [],
              });
            }
            boss.stateTimer = 1.55;
          }
        }
      }
      boss.x = Math.max(boss.arenaMinX + 10, Math.min(boss.arenaMaxX - boss.w - 10, boss.x));
    } else if (boss.kind === 'emerald_stalker') {
      // W3 Roaming Encounter Mini-Boss (3 Distinct Variants: Standard / Vine Spikes / Boomerang Sickle)
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const variant = boss.variant ?? 1;
      if (boss.state === 'stalk_warn') {
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'stalk_charge';
          boss.stateTimer = 4.0;
          boss.vx = boss.facing * (variant === 3 ? 445 : 415);
          this.addShake(4, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'stalk_charge') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 12;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 12;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if (hitLeft || hitRight) {
            sound.playExplosion();
            this.addShake(4.2, 0.14);
            for (const dir of [-1, 1]) {
              this.projectiles.push({
                x: cx + dir * 12,
                y: boss.floorY - 11,
                vx: dir * 280,
                vy: 0,
                r: 7.5,
                life: 2.2,
                fromEnemy: true,
                shockwave: true,
                damage: DAMAGE_TABLE.emerald_stalker_spore,
                color: '#10b981',
                trail: [],
              });
            }
          }
          boss.vx = 0;
          boss.state = 'idle';
          boss.stateTimer = 1.25;
        }
      } else if (boss.state === 'leap') {
        boss.vy += 1080 * dt;
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;
        if (boss.y + boss.h >= boss.floorY) {
          boss.y = boss.floorY - boss.h;
          boss.vy = 0;
          boss.vx = 0;
          sound.playLand(1);
          this.addShake(4.5, 0.14);
          for (const dir of [-1, 1]) {
            this.projectiles.push({
              x: boss.x + boss.w * 0.5 + dir * 12,
              y: boss.floorY - 11,
              vx: dir * 280,
              vy: 0,
              r: 7.5,
              life: 2.2,
              fromEnemy: true,
              shockwave: true,
              damage: DAMAGE_TABLE.emerald_stalker_spore,
              color: '#10b981',
              trail: [],
            });
          }
          if (variant === 2) {
            for (const dir of [-1, 1]) {
              const sx = Math.max(boss.arenaMinX + 36, Math.min(boss.arenaMaxX - 36, boss.x + boss.w * 0.5 + dir * 115));
              this.activeGroundSpikes.push({
                x: sx,
                floorY: boss.floorY,
                timer: 0.72,
                warnDuration: 0.72,
                radius: 20,
                erupted: false,
                life: 0.42,
                damage: DAMAGE_TABLE.emerald_stalker_spore,
                color: '#4ade80',
              });
            }
          }
          boss.state = 'idle';
          boss.stateTimer = 1.25;
        }
      } else {
        boss.facing = pcx >= cx ? 1 : -1;
        boss.x += boss.facing * 88 * dt;
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.36) {
            boss.state = 'stalk_warn';
            boss.stateTimer = 0.46;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
          } else if (r < 0.68) {
            boss.state = 'leap';
            boss.vy = -460;
            boss.vx = boss.facing * 245;
          } else if (variant === 3) {
            boss.stateTimer = 1.4;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx,
              y: cy,
              vx: Math.cos(ang) * 335,
              vy: Math.sin(ang) * 335,
              r: 8.5,
              life: 2.6,
              fromEnemy: true,
              boomerang: { originX: cx, originY: cy, speed: 340, elapsed: 0, turned: false },
              damage: DAMAGE_TABLE.emerald_stalker_spore,
              color: '#6ee7b7',
              trail: [],
            });
          } else {
            boss.stateTimer = 1.35;
            for (const spd of [165, 255]) {
              this.projectiles.push({
                x: cx,
                y: boss.y + 12,
                vx: boss.facing * spd,
                vy: -260,
                r: 6.5,
                life: 3.0,
                fromEnemy: true,
                gravity: 700,
                bouncesLeft: 2,
                damage: DAMAGE_TABLE.emerald_stalker_spore,
                color: '#34d399',
                trail: [],
              });
            }
          }
        }
      }
      boss.x = Math.max(boss.arenaMinX + 10, Math.min(boss.arenaMaxX - boss.w - 10, boss.x));
    } else if (boss.kind === 'verdant_warden') {
      // 3-FORT1 Mid-Boss: ヴァーダント・ワーデン (11 HP, Zero Laser Clone! Uses 5-Pillar Rolling Vine Wave + Wall-to-Wall Whip Charge + Bouncing Emerald Bombs)
      boss.phase = boss.hp <= 5 ? 2 : 1;
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;

      if (boss.state === 'patrol') {
        boss.facing = pcx >= cx ? 1 : -1;
        boss.x += boss.facing * (boss.phase === 2 ? 98 : 76) * dt;
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.36) {
            // Sequential 5-Pillar Sanctuary Vine Wave sweeping across arena floor!
            const fromLeft = pcx >= (boss.arenaMinX + boss.arenaMaxX) * 0.5;
            const span = boss.arenaMaxX - boss.arenaMinX - 110;
            for (let k = 0; k < 5; k++) {
              const frac = k / 4;
              const sx = fromLeft ? boss.arenaMinX + 55 + span * frac : boss.arenaMaxX - 55 - span * frac;
              const delay = 0.68 + k * 0.24;
              this.activeGroundSpikes.push({
                x: sx,
                floorY: boss.floorY,
                timer: delay,
                warnDuration: delay,
                radius: 22,
                erupted: false,
                life: 0.44,
                damage: DAMAGE_TABLE.verdant_warden_laser,
                color: '#4ade80',
              });
            }
            sound.playWarn();
            this.addShake(4.8, 0.14);
            this.addFloatingText(cx, boss.y - 16, 'SANCTUARY VINE WAVE!', '#4ade80');
            boss.stateTimer = boss.phase === 2 ? 1.85 : 2.15;
          } else if (r < 0.66) {
            boss.state = 'warden_warn';
            boss.stateTimer = 0.5;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
          } else {
            for (const spd of [165, 240, 315]) {
              this.projectiles.push({
                x: cx,
                y: boss.y + 12,
                vx: boss.facing * spd,
                vy: -280,
                r: 7,
                life: 3.3,
                fromEnemy: true,
                gravity: 720,
                bouncesLeft: 2,
                damage: DAMAGE_TABLE.verdant_warden_bomb,
                color: '#34d399',
                trail: [],
              });
            }
            boss.stateTimer = boss.phase === 2 ? 1.3 : 1.6;
          }
        }
      } else if (boss.state === 'warden_warn') {
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'warden_charge';
          boss.stateTimer = 4.0;
          boss.vx = boss.facing * 405;
          this.addShake(4.8, 0.15);
          sound.playExplosion();
        }
      } else if (boss.state === 'warden_charge') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 24;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 24;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if (hitLeft || hitRight) {
            this.addShake(5.5, 0.16);
            sound.playExplosion();
            const throwDir = hitLeft ? 1 : -1;
            for (const spd of [185, 285]) {
              this.projectiles.push({
                x: cx,
                y: boss.y + 12,
                vx: throwDir * spd,
                vy: -290,
                r: 7,
                life: 3.3,
                fromEnemy: true,
                gravity: 720,
                bouncesLeft: 2,
                damage: DAMAGE_TABLE.verdant_warden_bomb,
                color: '#34d399',
                trail: [],
              });
            }
          }
          boss.vx = 0;
          boss.state = 'patrol';
          boss.stateTimer = 1.2;
        }
      } else {
        boss.state = 'patrol';
        boss.stateTimer = 1.1;
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'jade_chimera') {
      // 3-FORT2 Mid-Boss: ジェイド・キメラ (13 HP, Smooth Non-Warp Glide, Twin Wall-Ricochet Lasers, Wall-to-Wall Z-Dive + Rebound)
      boss.phase = boss.hp <= 6 ? 2 : 1;
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;

      if (boss.state === 'glide') {
        boss.facing = pcx >= cx ? 1 : -1;
        const targetX = midX + Math.sin(this.worldTime * (boss.phase === 2 ? 1.55 : 1.25)) * 280;
        const targetY = boss.floorY - 195 + Math.sin(this.worldTime * 2.6) * 34;
        boss.x += (targetX - boss.x) * Math.min(1, 4.2 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.4 * dt);
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.38) {
            boss.state = 'dive_warn';
            boss.stateTimer = 0.65;
            boss.comboLeft = boss.phase === 2 ? 1 : 0;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 14, 'CHIMERA Z-DIVE!', '#34d399');
          } else if (r < 0.72) {
            const ang = Math.atan2(pcy - cy, pcx - cx);
            for (const off of [-0.26, 0.26]) {
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang + off) * 345,
                vy: Math.sin(ang + off) * 345,
                r: 6.5,
                life: 2.8,
                fromEnemy: true,
                ricochetLeft: 2,
                damage: DAMAGE_TABLE.jade_chimera_beam,
                color: '#a7f3d0',
                trail: [],
              });
            }
            boss.stateTimer = boss.phase === 2 ? 1.35 : 1.65;
          } else {
            for (let k = 0; k < 5; k++) {
              const a = this.worldTime * 1.4 + (k * Math.PI * 2) / 5;
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: Math.cos(a) * 205,
                vy: Math.sin(a) * 205,
                r: 6.5,
                life: 3.4,
                fromEnemy: true,
                damage: DAMAGE_TABLE.jade_chimera_orb,
                color: '#34d399',
                trail: [],
              });
            }
            boss.stateTimer = boss.phase === 2 ? 1.3 : 1.55;
          }
        }
      } else if (boss.state === 'dive_warn') {
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'dive_dash';
          boss.stateTimer = 4.0;
          boss.comboLeft = boss.phase === 2 ? 1 : 0;
          const ang = Math.atan2(pcy - cy, pcx - cx);
          const dir = pcx >= cx ? 1 : -1;
          boss.vx = dir * Math.max(335, Math.abs(Math.cos(ang) * 445));
          boss.vy = Math.sin(ang) * 235;
          sound.playExplosion();
        }
      } else if (boss.state === 'dive_dash') {
        boss.x += boss.vx * dt;
        boss.y = Math.min(boss.floorY - boss.h - 14, Math.max(boss.floorY - 260, boss.y + boss.vy * dt));
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 20;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 20;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 22 : boss.arenaMaxX - boss.w - 22;
            const newDir = hitLeft ? 1 : -1;
            const ang = Math.atan2(pcy - cy, pcx - cx);
            boss.vx = newDir * Math.max(350, Math.abs(Math.cos(ang) * 455));
            boss.vy = Math.sin(ang) * 225;
            boss.facing = newDir;
            boss.stateTimer = 4.0;
            this.addShake(4.2, 0.14);
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.vy = 0;
            boss.state = 'glide';
            boss.stateTimer = 1.25;
          }
        }
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'emerald_emperor') {
      // 3-BOSS Final Boss: 翡翠皇・エメラルドエンペラー (15 HP, 3 Forms, Sovereign of Living Blossoms — Zero Sweep/Slam Clone!)
      const prevPhase = boss.phase;
      boss.phase = boss.hp <= 5 ? 3 : boss.hp <= 10 ? 2 : 1;
      if (boss.phase !== prevPhase) {
        this.addFloatingText(
          boss.x + boss.w * 0.5,
          boss.y - 22,
          boss.phase === 2 ? 'FORM II: LOTUS BLOOM!' : 'FORM III: SOVEREIGN MANDALA!',
          boss.phase === 3 ? '#6ee7b7' : '#34d399'
        );
        sound.playWarn();
      }
      boss.stateTimer -= dt;
      if (boss.state !== 'emperor_dash') {
        boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
      }

      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const lotusCount = boss.phase === 3 ? 4 : boss.phase === 2 ? 3 : 2;
      boss.clones = [];
      for (let k = 0; k < lotusCount; k++) {
        const ang = this.worldTime * (1.65 + boss.phase * 0.3) + (k * Math.PI * 2) / lotusCount;
        boss.clones.push({
          x: cx + Math.cos(ang) * 98,
          y: cy + Math.sin(ang) * 58,
          alpha: 0.95,
        });
      }

      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;

      if (boss.state === 'hover') {
        const targetX = midX + Math.sin(this.worldTime * (1.1 + boss.phase * 0.16)) * 245;
        const targetY = boss.floorY - 198 + Math.sin(this.worldTime * 2.4) * 24;
        boss.x += (targetX - boss.x) * Math.min(1, 4.0 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.4 * dt);

        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (boss.phase === 1) {
            if (r < 0.54) {
              // Signature Undulating Twin Petal Ribbons
              const ang = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.22, 0.22]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(ang + off) * 270,
                  vy: Math.sin(ang + off) * 270,
                  r: 7,
                  life: 3.4,
                  fromEnemy: true,
                  waveAmp: 120,
                  waveFreq: 10,
                  damage: DAMAGE_TABLE.emerald_emperor_lance,
                  color: '#a7f3d0',
                  trail: [],
                });
              }
              boss.stateTimer = 1.55;
            } else {
              // Ricochet Jade Spears
              const ang = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.3, 0.3]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(ang + off) * 320,
                  vy: Math.sin(ang + off) * 320,
                  r: 6.5,
                  life: 3.1,
                  fromEnemy: true,
                  ricochetLeft: 2,
                  damage: DAMAGE_TABLE.emerald_emperor_lance,
                  color: '#34d399',
                  trail: [],
                });
              }
              boss.stateTimer = 1.6;
            }
          } else if (boss.phase === 2) {
            if (r < 0.36) {
              // Signature Form 2: Lotus Cluster Seed Pods (Burst into 4 diagonal petals mid-air!)
              for (const dirVx of [-165, 0, 165]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: dirVx,
                  vy: -135,
                  r: 8.5,
                  life: 2.2,
                  fromEnemy: true,
                  gravity: 260,
                  splitTimer: 0.68,
                  splitCount: 4,
                  splitColor: '#6ee7b7',
                  splitDmg: DAMAGE_TABLE.emerald_emperor_spore,
                  damage: DAMAGE_TABLE.emerald_emperor_lance,
                  color: '#fde047',
                  trail: [],
                });
              }
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'LOTUS CLUSTER BLOOM!', '#6ee7b7');
              boss.stateTimer = 1.9;
            } else if (r < 0.66) {
              boss.state = 'emperor_warn';
              boss.stateTimer = 0.58;
              boss.comboLeft = 0;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'EMERALD IMPALE!', '#6ee7b7');
            } else {
              // Closing Sanctuary Thorn Eruption (4 inward-sweeping pillars)
              for (const offset of [-190, -75, 75, 190]) {
                const tx = Math.max(boss.arenaMinX + 45, Math.min(boss.arenaMaxX - 45, midX + 32 + offset));
                const delay = Math.abs(offset) > 120 ? 0.78 : 1.18;
                this.activeGroundSpikes.push({
                  x: tx,
                  floorY: boss.floorY,
                  timer: delay,
                  warnDuration: delay,
                  radius: 22,
                  erupted: false,
                  life: 0.42,
                  damage: DAMAGE_TABLE.emerald_emperor_slam,
                  color: '#34d399',
                });
              }
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'SANCTUARY THORNS!', '#4ade80');
              boss.stateTimer = 1.85;
            }
          } else {
            if (r < 0.34) {
              // Form 3 Signature: 8-Petal Blooming Mandala Vortex + Ribbon Volley
              for (let k = 0; k < 8; k++) {
                const a = this.worldTime * 1.4 + (k * Math.PI) / 4;
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(a) * 210,
                  vy: Math.sin(a) * 210,
                  r: 6.5,
                  life: 3.6,
                  fromEnemy: true,
                  waveAmp: 75,
                  waveFreq: 8,
                  damage: DAMAGE_TABLE.emerald_emperor_spore,
                  color: k % 2 === 0 ? '#a7f3d0' : '#34d399',
                  trail: [],
                });
              }
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 18, 'BLOSSOM MANDALA!', '#a7f3d0');
              boss.stateTimer = 1.65;
            } else if (r < 0.68) {
              boss.state = 'emperor_warn';
              boss.stateTimer = 0.52;
              boss.comboLeft = 1;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 18, 'SOVEREIGN DOUBLE RUSH!', '#a7f3d0');
            } else {
              // Lotus Bloom Turret Cross Barrage + Splitting Seed
              for (const fn of boss.clones) {
                const ang = Math.atan2(pcy - fn.y, pcx - fn.x);
                this.projectiles.push({
                  x: fn.x,
                  y: fn.y,
                  vx: Math.cos(ang) * 245,
                  vy: Math.sin(ang) * 245,
                  r: 6.5,
                  life: 3.4,
                  fromEnemy: true,
                  ricochetLeft: 1,
                  damage: DAMAGE_TABLE.emerald_emperor_lance,
                  color: '#6ee7b7',
                  trail: [],
                });
              }
              this.projectiles.push({
                x: cx,
                y: cy,
                vx: 0,
                vy: -140,
                r: 8.5,
                life: 2.0,
                fromEnemy: true,
                gravity: 220,
                splitTimer: 0.58,
                splitCount: 4,
                splitColor: '#a7f3d0',
                splitDmg: DAMAGE_TABLE.emerald_emperor_spore,
                damage: DAMAGE_TABLE.emerald_emperor_laser,
                color: '#fde047',
                trail: [],
              });
              boss.stateTimer = 1.55;
            }
          }
        }
      } else if (boss.state === 'emperor_warn') {
        const targetY = Math.max(boss.floorY - 225, Math.min(boss.floorY - boss.h - 24, pcy - boss.h * 0.5));
        boss.y += Math.max(-220 * dt, Math.min(220 * dt, targetY - boss.y));
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'emperor_dash';
          boss.stateTimer = 4.0;
          boss.comboLeft = boss.phase === 3 ? 1 : 0;
          boss.vx = boss.facing * 475;
          this.addShake(4.8, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'emperor_dash') {
        boss.x += boss.vx * dt;
        if (Math.floor(boss.stateTimer * 4) !== Math.floor((boss.stateTimer + dt) * 4)) {
          this.projectiles.push({
            x: cx,
            y: cy + 12,
            vx: 0,
            vy: 90,
            r: 6,
            life: 1.9,
            fromEnemy: true,
            gravity: 340,
            bouncesLeft: 1,
            damage: DAMAGE_TABLE.emerald_emperor_spore,
            color: '#34d399',
            trail: [],
          });
        }
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 24;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 24;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 26 : boss.arenaMaxX - boss.w - 26;
            boss.vx = -boss.vx;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            this.addShake(4.8, 0.14);
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.state = 'hover';
            boss.stateTimer = 1.45;
          }
        }
      } else {
        boss.state = 'hover';
        boss.stateTimer = 1.3;
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'frost_titan') {
      // W4 Encounters ENC_W4_1..3: フロスト・タイタン (3 Distinct Encounter Variants)
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const variant = boss.variant ?? 1;
      if (boss.state === 'idle') {
        boss.facing = pcx >= cx ? 1 : -1;
        boss.x += boss.facing * (variant === 3 ? 70 : 54) * dt;
        boss.y = boss.floorY - boss.h;
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.4) {
            boss.state = 'titan_warn';
            boss.stateTimer = 0.58;
            boss.comboLeft = variant === 3 ? 1 : 0;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 16, 'GLACIAL SLIDE!', '#7dd3fc');
          } else if (variant === 2 && r < 0.72) {
            // Variant 2 Signature: 3-Column Ceiling Cryo Strikes across arena!
            const span = boss.arenaMaxX - boss.arenaMinX - 100;
            for (let k = 0; k < 3; k++) {
              this.activeLightningStrikes.push({
                x: boss.arenaMinX + 50 + (k / 2) * span,
                floorY: boss.floorY,
                timer: 0.92 + k * 0.14,
                warnDuration: 0.92 + k * 0.14,
                struck: false,
                strikeRadius: 24,
                strikeLife: 0.34,
                color: '#bae6fd',
                chillDuration: 1.6,
                damage: DAMAGE_TABLE.frost_titan_wave,
              });
            }
            boss.stateTimer = 1.6;
          } else if (variant === 3 && r < 0.75) {
            // Variant 3 Signature: Paused 6-Shard Cryo Halo locking onto player!
            for (let k = 0; k < 6; k++) {
              const a = (k * Math.PI) / 3;
              const sx = cx + Math.cos(a) * 62;
              const sy = cy - 16 + Math.sin(a) * 62;
              const aim = Math.atan2(pcy - sy, pcx - sx);
              this.projectiles.push({
                x: sx,
                y: sy,
                vx: Math.cos(aim) * 280,
                vy: Math.sin(aim) * 280,
                r: 6.5,
                life: 2.9,
                fromEnemy: true,
                pauseTimer: 0.65,
                chillDuration: 1.5,
                damage: DAMAGE_TABLE.frost_titan_wave,
                color: '#e0f2fe',
                trail: [],
              });
            }
            boss.stateTimer = 1.65;
          } else if (r < 0.74) {
            for (const spd of [180, 250, 320]) {
              this.projectiles.push({
                x: cx + boss.facing * 16,
                y: boss.y + 12,
                vx: boss.facing * spd,
                vy: -310,
                r: 8,
                life: 3.1,
                fromEnemy: true,
                gravity: 660,
                chillDuration: 1.5,
                damage: DAMAGE_TABLE.frost_titan_wave,
                color: '#38bdf8',
                trail: [],
              });
            }
            boss.stateTimer = 1.6;
          } else {
            boss.state = 'titan_leap';
            boss.vy = -445;
            boss.vx = boss.facing * 165;
            boss.stateTimer = 2.0;
          }
        }
      } else if (boss.state === 'titan_warn') {
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'titan_charge';
          boss.vx = boss.facing * (variant === 3 ? 425 : 395);
          boss.stateTimer = 4.0;
          sound.playExplosion();
        }
      } else if (boss.state === 'titan_charge') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 20;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 20;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 22 : boss.arenaMaxX - boss.w - 22;
            boss.vx = -boss.vx;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.state = 'idle';
            boss.stateTimer = 1.15;
            this.addShake(4.2, 0.14);
          }
        }
      } else if (boss.state === 'titan_leap') {
        boss.vy += 940 * dt;
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;
        if (boss.y >= boss.floorY - boss.h) {
          boss.y = boss.floorY - boss.h;
          boss.vy = 0;
          boss.vx = 0;
          this.addShake(6.2, 0.18);
          sound.playExplosion();
          for (const dir of [-1, 1]) {
            this.projectiles.push({
              x: cx + dir * 20,
              y: boss.floorY - 10,
              vx: dir * 255,
              vy: 0,
              r: 8,
              life: 2.6,
              fromEnemy: true,
              shockwave: true,
              chillDuration: 1.4,
              damage: DAMAGE_TABLE.frost_titan_wave,
              color: '#7dd3fc',
              trail: [],
            });
            const gx = Math.max(boss.arenaMinX + 40, Math.min(boss.arenaMaxX - 40, cx + dir * 135));
            this.activeGroundSpikes.push({
              x: gx,
              floorY: boss.floorY,
              timer: 0.72,
              warnDuration: 0.72,
              radius: 22,
              erupted: false,
              life: 0.42,
              damage: DAMAGE_TABLE.frost_titan_wave,
              color: '#38bdf8',
              chillDuration: 1.6,
            });
          }
          boss.state = 'idle';
          boss.stateTimer = 1.3;
        }
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'glacia_knight') {
      // 4-FORT1 Mid-Boss: グラキア・ナイト (HP 13, 2 Phases — Wall-Clinging Cryo Lancer & Returning Halberd!)
      boss.phase = boss.hp <= 7 ? 2 : 1;
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;

      if (boss.state === 'guard') {
        boss.facing = pcx >= cx ? 1 : -1;
        boss.x += boss.facing * (boss.phase === 2 ? 78 : 56) * dt;
        boss.y = boss.floorY - boss.h;
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.46) {
            boss.state = 'warn';
            boss.stateTimer = 0.52;
            boss.comboLeft = boss.phase === 2 ? 1 : 0;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 16, 'WALL-CLING SKATE!', '#7dd3fc');
          } else {
            // Returning Frost Halberd Boomerang + Flanking Ice Lance
            const ang = Math.atan2(pcy - cy, pcx - cx);
            this.projectiles.push({
              x: cx + boss.facing * 16,
              y: cy,
              vx: Math.cos(ang) * 335,
              vy: Math.sin(ang) * 335,
              r: 9,
              life: 2.5,
              fromEnemy: true,
              boomerang: { originX: cx, originY: cy, speed: 345, elapsed: 0, turned: false },
              chillDuration: 1.7,
              damage: DAMAGE_TABLE.glacia_knight_lance,
              color: '#e0f2fe',
              trail: [],
            });
            if (boss.phase === 2) {
              for (const off of [-0.26, 0.26]) {
                this.projectiles.push({
                  x: cx + boss.facing * 16,
                  y: cy,
                  vx: Math.cos(ang + off) * 305,
                  vy: Math.sin(ang + off) * 305,
                  r: 6,
                  life: 2.6,
                  fromEnemy: true,
                  chillDuration: 1.4,
                  damage: DAMAGE_TABLE.glacia_knight_lance,
                  color: '#bae6fd',
                  trail: [],
                });
              }
            }
            boss.stateTimer = boss.phase === 2 ? 1.35 : 1.6;
          }
        }
      } else if (boss.state === 'warn') {
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'skate_rush';
          boss.vx = boss.facing * (boss.phase === 2 ? 455 : 405);
          boss.stateTimer = 4.0;
          sound.playExplosion();
        }
      } else if (boss.state === 'skate_rush') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 20;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 20;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          boss.x = hitLeft ? boss.arenaMinX + 20 : boss.arenaMaxX - boss.w - 20;
          boss.vx = 0;
          boss.facing = hitLeft ? 1 : -1;
          // Transition cleanly into Wall-Cling Launch Pose!
          boss.state = 'wall_cling';
          boss.stateTimer = 0.62;
          sound.playWarn();
          this.addFloatingText(cx, boss.y - 16, 'CRYO LANCE DIVE!', '#bae6fd');
        }
      } else if (boss.state === 'wall_cling') {
        // Climb up the arena wall & aim diagonally downward toward opposite floor
        boss.y += (boss.floorY - 190 - boss.y) * Math.min(1, 9.5 * dt);
        if (boss.stateTimer <= 0) {
          // Fan 3 ice spears from the wall perch before launching the diagonal dive
          const diveAng = Math.atan2(boss.floorY - 40 - cy, boss.facing * 380);
          for (const off of [-0.25, 0, 0.25]) {
            this.projectiles.push({
              x: cx + boss.facing * 12,
              y: cy,
              vx: Math.cos(diveAng + off) * 320,
              vy: Math.sin(diveAng + off) * 320,
              r: 6,
              life: 2.5,
              fromEnemy: true,
              chillDuration: 1.5,
              damage: DAMAGE_TABLE.glacia_knight_lance,
              color: '#bae6fd',
              trail: [],
            });
          }
          boss.state = 'wall_dive';
          boss.stateTimer = 2.4;
          boss.vx = boss.facing * 435;
          boss.vy = 215;
          sound.playExplosion();
        }
      } else if (boss.state === 'wall_dive') {
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;
        const hitFloor = boss.y >= boss.floorY - boss.h;
        const hitWall = (boss.vx < 0 && boss.x <= boss.arenaMinX + 20) || (boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 20);
        if (hitFloor || hitWall || boss.stateTimer <= 0) {
          boss.y = boss.floorY - boss.h;
          boss.vx = 0;
          boss.vy = 0;
          this.addShake(6.2, 0.18);
          sound.playExplosion();
          for (const dir of [-1, 1]) {
            this.projectiles.push({
              x: cx + dir * 20,
              y: boss.floorY - 10,
              vx: dir * 270,
              vy: 0,
              r: 8,
              life: 2.6,
              fromEnemy: true,
              shockwave: true,
              chillDuration: 1.5,
              damage: DAMAGE_TABLE.glacia_knight_lance,
              color: '#38bdf8',
              trail: [],
            });
          }
          boss.state = 'guard';
          boss.stateTimer = boss.phase === 2 ? 1.15 : 1.35;
        }
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'cocytus_core') {
      // 4-FORT2 Mid-Boss: コキュートス・コア (HP 15 — 6-Beam Hexagonal Cryo Star + Pause-Lock Ice Nova + Subzero Charge)
      boss.phase = boss.hp <= 8 ? 2 : 1;
      boss.stateTimer -= dt;
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;

      if (boss.state === 'sweep') {
        boss.facing = pcx >= cx ? 1 : -1;
        const targetX = midX + Math.sin(this.worldTime * (boss.phase === 2 ? 1.45 : 1.15)) * 270;
        const targetY = boss.floorY - 195 + Math.sin(this.worldTime * 2.5) * 30;
        boss.x += (targetX - boss.x) * Math.min(1, 4.0 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.2 * dt);
        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.36) {
            boss.state = 'star_spin';
            boss.stateTimer = 2.65;
            boss.vx = boss.facing * 155;
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 16, 'HEX CRYO STAR!', '#7dd3fc');
          } else if (r < 0.66) {
            boss.state = 'core_warn';
            boss.stateTimer = 0.58;
            boss.comboLeft = boss.phase === 2 ? 1 : 0;
            boss.facing = pcx >= cx ? 1 : -1;
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 16, 'COCYTUS CHARGE!', '#bae6fd');
          } else if (r < 0.84) {
            // Hexagonal Pause-Lock Cryo Crystal Ring snapping toward arena floor/player
            for (let k = 0; k < 6; k++) {
              const a = (k * Math.PI) / 3 + 0.25;
              const px = cx + Math.cos(a) * 82;
              const py = cy + Math.sin(a) * 82;
              this.projectiles.push({
                x: px,
                y: py,
                vx: 0,
                vy: 0,
                r: 7,
                life: 3.3,
                fromEnemy: true,
                pauseTimer: 0.66 + (k % 2) * 0.16,
                pauseTargetX: pcx + (k - 2.5) * 38,
                pauseTargetY: boss.floorY - 18,
                pauseSpeed: 295,
                chillDuration: 1.6,
                damage: DAMAGE_TABLE.cocytus_core_beam,
                color: '#bae6fd',
                trail: [],
              });
            }
            sound.playWarn();
            this.addFloatingText(cx, boss.y - 16, 'ABSOLUTE HEX NOVA!', '#e0f2fe');
            boss.stateTimer = boss.phase === 2 ? 1.65 : 1.9;
          } else {
            for (let k = -2; k <= 2; k++) {
              this.projectiles.push({
                x: cx + k * 58,
                y: boss.y + boss.h,
                vx: k * 34,
                vy: 145,
                r: 6.5,
                life: 2.8,
                fromEnemy: true,
                gravity: 340,
                chillDuration: 1.5,
                damage: DAMAGE_TABLE.cocytus_core_beam,
                color: '#7dd3fc',
                trail: [],
              });
            }
            boss.stateTimer = boss.phase === 2 ? 1.35 : 1.6;
          }
        }
      } else if (boss.state === 'star_spin') {
        boss.x += boss.vx * dt;
        if (boss.x <= boss.arenaMinX + 24) {
          boss.x = boss.arenaMinX + 24;
          boss.vx = Math.abs(boss.vx);
        } else if (boss.x >= boss.arenaMaxX - boss.w - 24) {
          boss.x = boss.arenaMaxX - boss.w - 24;
          boss.vx = -Math.abs(boss.vx);
        }
        boss.y += (boss.floorY - 185 - boss.y) * Math.min(1, 3.6 * dt);
        const spinBase = this.worldTime * (boss.phase === 2 ? 1.15 : 0.86);
        if (p.invulnTimer <= 0) {
          for (let k = 0; k < 6; k++) {
            const a = spinBase + (k * Math.PI) / 3;
            const lx = cx + Math.cos(a) * 215;
            const ly = cy + Math.sin(a) * 215;
            if (this.distToSegment(pcx, pcy, cx, cy, lx, ly) < 11) {
              p.chillTimer = Math.max(p.chillTimer, 2.0);
              this.damagePlayer(false, Math.sign(pcx - cx) || -1, DAMAGE_TABLE.cocytus_core_beam);
              break;
            }
          }
        }
        if (boss.stateTimer <= 0) {
          boss.state = 'sweep';
          boss.stateTimer = 1.45;
        }
      } else if (boss.state === 'core_warn') {
        const targetY = Math.max(boss.floorY - 220, Math.min(boss.floorY - boss.h - 20, pcy - boss.h * 0.5));
        boss.y += Math.max(-210 * dt, Math.min(210 * dt, targetY - boss.y));
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'core_dash';
          boss.vx = boss.facing * 455;
          boss.stateTimer = 4.0;
          this.addShake(4.8, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'core_dash') {
        boss.x += boss.vx * dt;
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 22;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 22;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 24 : boss.arenaMaxX - boss.w - 24;
            boss.vx = -boss.vx;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            this.addShake(4.8, 0.14);
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.state = 'sweep';
            boss.stateTimer = 1.35;
          }
        }
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    } else if (boss.kind === 'glacies_emperor') {
      // 4-BOSS Final Boss: 蒼氷王・グレイシアスエンペラー (HP 18, 3 Distinct Forms: Mirror Prisms -> 5-Column Sky Avalanche -> Converging Execution Ring + X-Crisscross Skate, ZERO WARP / ZERO Laser-Sweep Clone!)
      const prevPhase = boss.phase;
      boss.phase = boss.hp <= 6 ? 3 : boss.hp <= 12 ? 2 : 1;
      if (boss.phase !== prevPhase) {
        this.addFloatingText(
          boss.x + boss.w * 0.5,
          boss.y - 22,
          boss.phase === 2 ? 'FORM II: BLIZZARD AVALANCHE!' : 'FORM III: ABSOLUTE ZERO RING!',
          boss.phase === 3 ? '#e0f2fe' : '#38bdf8'
        );
        sound.playWarn();
      }
      boss.stateTimer -= dt;
      if (boss.state !== 'emperor_dash' && boss.state !== 'x_dash') {
        boss.facing = pcx >= boss.x + boss.w * 0.5 ? 1 : -1;
      }

      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      const midX = (boss.arenaMinX + boss.arenaMaxX - boss.w) * 0.5;
      // Render Mirror Prisms flanking high arena corners instead of spinning gears!
      boss.clones = [
        { x: boss.arenaMinX + 86, y: boss.floorY - 210 + Math.sin(this.worldTime * 2.1) * 18, alpha: 0.92 },
        { x: boss.arenaMaxX - 86, y: boss.floorY - 210 - Math.sin(this.worldTime * 2.1) * 18, alpha: 0.92 },
      ];

      if (boss.state === 'hover') {
        const targetX = midX + Math.sin(this.worldTime * (1.1 + boss.phase * 0.16)) * 255;
        const targetY = boss.floorY - 198 + Math.sin(this.worldTime * 2.4) * 24;
        boss.x += (targetX - boss.x) * Math.min(1, 4.0 * dt);
        boss.y += (targetY - boss.y) * Math.min(1, 4.4 * dt);

        if (boss.stateTimer <= 0) {
          const r = Math.random();
          if (boss.phase === 1) {
            if (r < 0.56) {
              // Mirror Prism Ricochet Ice Lances
              const ang = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.24, 0.24]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(ang + off) * 325,
                  vy: Math.sin(ang + off) * 325,
                  r: 6.5,
                  life: 3.1,
                  fromEnemy: true,
                  ricochetLeft: 2,
                  chillDuration: 1.6,
                  damage: DAMAGE_TABLE.glacies_emperor_lance,
                  color: '#bae6fd',
                  trail: [],
                });
              }
              for (const pr of boss.clones) {
                const pang = Math.atan2(pcy - pr.y, pcx - pr.x);
                this.projectiles.push({
                  x: pr.x,
                  y: pr.y,
                  vx: Math.cos(pang) * 270,
                  vy: Math.sin(pang) * 270,
                  r: 6,
                  life: 3.0,
                  fromEnemy: true,
                  ricochetLeft: 1,
                  chillDuration: 1.5,
                  damage: DAMAGE_TABLE.glacies_emperor_lance,
                  color: '#7dd3fc',
                  trail: [],
                });
              }
              boss.stateTimer = 1.65;
            } else {
              boss.state = 'emperor_warn';
              boss.stateTimer = 0.58;
              boss.comboLeft = 0;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'FROST WAKE SKATE!', '#7dd3fc');
            }
          } else if (boss.phase === 2) {
            if (r < 0.36) {
              // 5-Column Sky Avalanche Beams spaced cleanly across the arena
              const arenaW = boss.arenaMaxX - boss.arenaMinX;
              const jitter = (Math.random() - 0.5) * 50;
              for (let k = 0; k < 5; k++) {
                const lx = Math.max(
                  boss.arenaMinX + 44,
                  Math.min(boss.arenaMaxX - 44, boss.arenaMinX + 72 + ((arenaW - 144) * k) / 4 + jitter)
                );
                const delay = 1.05 + (k % 2) * 0.28;
                this.activeLightningStrikes.push({
                  x: lx,
                  floorY: boss.floorY,
                  timer: delay,
                  warnDuration: delay,
                  strikeRadius: 24,
                  struck: false,
                  strikeLife: 0.34,
                  color: '#7dd3fc',
                  chillDuration: 1.8,
                  damage: DAMAGE_TABLE.glacies_emperor_wave,
                });
              }
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, 'BLIZZARD AVALANCHE!', '#bae6fd');
              boss.stateTimer = 1.95;
            } else if (r < 0.68) {
              boss.state = 'emperor_warn';
              boss.stateTimer = 0.55;
              boss.comboLeft = 1;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 16, '2-LAP FROST WAKE!', '#38bdf8');
            } else {
              // Twin Boomerang Crescent Ice Scythes
              const ang = Math.atan2(pcy - cy, pcx - cx);
              for (const off of [-0.3, 0.3]) {
                this.projectiles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(ang + off) * 335,
                  vy: Math.sin(ang + off) * 335,
                  r: 8.5,
                  life: 2.7,
                  fromEnemy: true,
                  boomerang: { originX: cx, originY: cy, speed: 345, elapsed: 0, turned: false },
                  chillDuration: 1.6,
                  damage: DAMAGE_TABLE.glacies_emperor_beam,
                  color: '#e0f2fe',
                  trail: [],
                });
              }
              boss.stateTimer = 1.65;
            }
          } else {
            if (r < 0.38) {
              // Form 3 Signature: Converging Execution Crystal Ring around combat center!
              const ringX = Math.max(boss.arenaMinX + 165, Math.min(boss.arenaMaxX - 165, pcx));
              const ringY = boss.floorY - 125;
              for (let k = 0; k < 8; k++) {
                const a = (k * Math.PI) / 4;
                this.projectiles.push({
                  x: ringX + Math.cos(a) * 155,
                  y: ringY + Math.sin(a) * 155,
                  vx: 0,
                  vy: 0,
                  r: 7,
                  life: 3.2,
                  fromEnemy: true,
                  pauseTimer: 0.85,
                  pauseTargetX: ringX,
                  pauseTargetY: ringY,
                  pauseSpeed: 295,
                  chillDuration: 1.8,
                  damage: DAMAGE_TABLE.glacies_emperor_beam,
                  color: '#e0f2fe',
                  trail: [],
                });
              }
              sound.playWarn();
              this.addFloatingText(ringX, ringY - 90, 'ABSOLUTE ZERO RING!', '#e0f2fe');
              boss.stateTimer = 2.0;
            } else if (r < 0.72) {
              // Form 3 Signature: True X-Crisscross Aerial Skate (Smooth diagonal slashes across arena!)
              boss.state = 'x_warn';
              boss.stateTimer = 0.56;
              boss.comboLeft = 1;
              boss.facing = pcx >= cx ? 1 : -1;
              sound.playWarn();
              this.addFloatingText(cx, boss.y - 18, 'X-CRYO SLASH!', '#7dd3fc');
            } else {
              // Mirror Prism Cross Barrage
              for (const pr of boss.clones) {
                const ang = Math.atan2(pcy - pr.y, pcx - pr.x);
                for (const off of [-0.18, 0.18]) {
                  this.projectiles.push({
                    x: pr.x,
                    y: pr.y,
                    vx: Math.cos(ang + off) * 305,
                    vy: Math.sin(ang + off) * 305,
                    r: 6.5,
                    life: 3.1,
                    fromEnemy: true,
                    ricochetLeft: 2,
                    chillDuration: 1.5,
                    damage: DAMAGE_TABLE.glacies_emperor_lance,
                    color: '#bae6fd',
                    trail: [],
                  });
                }
              }
              boss.stateTimer = 1.6;
            }
          }
        }
      } else if (boss.state === 'emperor_warn') {
        const targetY = Math.max(boss.floorY - 225, Math.min(boss.floorY - boss.h - 24, pcy - boss.h * 0.5));
        boss.y += Math.max(-220 * dt, Math.min(220 * dt, targetY - boss.y));
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'emperor_dash';
          boss.stateTimer = 4.0;
          boss.comboLeft = boss.phase >= 2 ? 1 : 0;
          boss.vx = boss.facing * 485;
          this.addShake(4.8, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'emperor_dash') {
        boss.x += boss.vx * dt;
        // Leave telegraphed Frost Spikes along arena floor wake while skating!
        if (Math.floor(boss.stateTimer * 3.8) !== Math.floor((boss.stateTimer + dt) * 3.8)) {
          this.activeGroundSpikes.push({
            x: Math.max(boss.arenaMinX + 38, Math.min(boss.arenaMaxX - 38, cx)),
            floorY: boss.floorY,
            timer: 0.72,
            warnDuration: 0.72,
            radius: 20,
            erupted: false,
            life: 0.4,
            damage: DAMAGE_TABLE.glacies_emperor_wave,
            color: '#7dd3fc',
            chillDuration: 1.7,
          });
        }
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 24;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 24;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 26 : boss.arenaMaxX - boss.w - 26;
            boss.vx = -boss.vx;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            this.addShake(4.8, 0.14);
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.state = 'hover';
            boss.stateTimer = 1.4;
          }
        }
      } else if (boss.state === 'x_warn') {
        // Rise smoothly to upper corner level before slicing diagonally down-across!
        boss.y += (boss.floorY - 230 - boss.y) * Math.min(1, 6.5 * dt);
        boss.facing = pcx >= cx ? 1 : -1;
        if (boss.stateTimer <= 0) {
          boss.state = 'x_dash';
          boss.stateTimer = 4.0;
          boss.comboLeft = 1;
          boss.vx = boss.facing * 490;
          boss.vy = 165;
          this.addShake(5.0, 0.14);
          sound.playExplosion();
        }
      } else if (boss.state === 'x_dash') {
        boss.x += boss.vx * dt;
        boss.y = Math.max(boss.floorY - 255, Math.min(boss.floorY - boss.h, boss.y + boss.vy * dt));
        const hitLeft = boss.vx < 0 && boss.x <= boss.arenaMinX + 24;
        const hitRight = boss.vx > 0 && boss.x >= boss.arenaMaxX - boss.w - 24;
        if (hitLeft || hitRight || boss.stateTimer <= 0) {
          if ((hitLeft || hitRight) && (boss.comboLeft ?? 0) > 0 && boss.stateTimer > 0) {
            boss.comboLeft = (boss.comboLeft ?? 1) - 1;
            boss.x = hitLeft ? boss.arenaMinX + 26 : boss.arenaMaxX - boss.w - 26;
            boss.vx = -boss.vx;
            boss.vy = -170;
            boss.facing = boss.vx > 0 ? 1 : -1;
            boss.stateTimer = 4.0;
            this.addShake(5.0, 0.14);
            sound.playExplosion();
          } else {
            boss.vx = 0;
            boss.vy = 0;
            boss.state = 'hover';
            boss.stateTimer = 1.45;
          }
        }
      } else {
        boss.state = 'hover';
        boss.stateTimer = 1.3;
      }
      boss.x = Math.max(boss.arenaMinX + 20, Math.min(boss.arenaMaxX - boss.w - 20, boss.x));
    }

    // Player vs Boss collision (separate cleanly & grant stompGraceTimer to prevent self-damage!)
    if (this.rectsOverlap(p.x + 2, p.y + 2, p.w - 4, p.h - 2, boss.x + 2, boss.y + 2, boss.w - 4, boss.h - 4)) {
      const playerBottom = p.y + p.h;
      const prevBottom = playerBottom - Math.max(0, p.vy) * dt;
      if (p.vy >= 0 && prevBottom <= boss.y + boss.h * 0.54 + 16) {
        p.y = Math.min(p.y, boss.y - p.h - 2);
        p.vy = STOMP_BOUNCE_HIGH;
        p.airJumpsLeft = 1;
        p.scaleX = 1.25;
        p.scaleY = 0.76;
        this.stompGraceTimer = 0.34;
        if (boss.kind === 'mid_guardian') {
          boss.stunTimer = 2.4;
          this.damageBoss(boss, 1);
          this.addFloatingText(boss.x + boss.w * 0.5, boss.y - 14, 'GUARD BROKEN!', '#38f2ff');
        } else {
          this.damageBoss(boss, 2);
        }
      } else if (p.invulnTimer <= 0 && this.stompGraceTimer <= 0) {
        const bossDmg =
          boss.kind === 'overlord_core'
            ? DAMAGE_TABLE.overlord_core_contact
                      : boss.kind === 'glacies_emperor'
                        ? DAMAGE_TABLE.glacies_emperor_contact
                        : boss.kind === 'cocytus_core'
                          ? DAMAGE_TABLE.cocytus_core_contact
                          : boss.kind === 'glacia_knight'
                            ? DAMAGE_TABLE.glacia_knight_contact
                            : boss.kind === 'frost_titan'
                              ? DAMAGE_TABLE.frost_titan_contact
                              : boss.kind === 'emerald_emperor'
                                ? DAMAGE_TABLE.emerald_emperor_contact
                                : boss.kind === 'jade_chimera'
                                  ? DAMAGE_TABLE.jade_chimera_contact
                                  : boss.kind === 'verdant_warden'
                                    ? DAMAGE_TABLE.verdant_warden_contact
                                    : boss.kind === 'emerald_stalker'
                                      ? DAMAGE_TABLE.emerald_stalker_contact
                                      : boss.kind === 'volt_centurion'
                                        ? DAMAGE_TABLE.volt_centurion_contact
                                        : boss.kind === 'iron_goliath'
                                          ? DAMAGE_TABLE.iron_goliath_contact
                                          : boss.kind === 'thunder_kronos'
                                            ? boss.state === 'blitz_dash'
                                              ? DAMAGE_TABLE.thunder_kronos_blitz
                                              : DAMAGE_TABLE.thunder_kronos_contact
                                            : boss.kind === 'clockwork_core'
                                              ? DAMAGE_TABLE.clockwork_core_contact
                                              : boss.kind === 'archmage'
                                                ? DAMAGE_TABLE.archmage_contact
                                                : DAMAGE_TABLE.mid_guardian_contact;
        this.damagePlayer(false, Math.sign(pcx - (boss.x + boss.w * 0.5)) || -1, bossDmg);
      }
    }
  }

  private damageBoss(boss: BossDef, dmg: number) {
    boss.hp = Math.max(0, boss.hp - dmg);
    boss.hitFlash = 0.14;
    this.hitstopTimer = 0.05;
    this.addShake(5.5, 0.16);
    sound.playStomp();
    const isGold = boss.kind === 'clockwork_core' || boss.kind === 'thunder_kronos' || boss.kind === 'volt_centurion';
    const isEmerald =
      boss.kind === 'emerald_stalker' ||
      boss.kind === 'verdant_warden' ||
      boss.kind === 'jade_chimera' ||
      boss.kind === 'emerald_emperor';
    const isIce =
      boss.kind === 'frost_titan' ||
      boss.kind === 'glacia_knight' ||
      boss.kind === 'cocytus_core' ||
      boss.kind === 'glacies_emperor';
    const hitCol = isIce ? '#7dd3fc' : isEmerald ? '#34d399' : isGold ? '#fde047' : '#38f2ff';
    this.spawnParticles(boss.x + boss.w * 0.5, boss.y + boss.h * 0.5, 16, {
      color: hitCol,
      speedMin: 60,
      speedMax: 220,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 3.4,
      life: 0.38,
      gravity: 120,
      glow: true,
    });
    this.pushHud(true);

    if (boss.hp <= 0) {
      boss.defeated = true;
      boss.clones = [];
      this.activeLightningStrikes = [];
      this.activeGroundSpikes = [];
      this.score +=
        boss.kind === 'glacies_emperor'
              ? 3200
              : boss.kind === 'emerald_emperor'
                ? 3000
                : boss.kind === 'thunder_kronos'
                  ? 2500
                  : boss.kind === 'archmage'
                    ? 2000
                    : boss.kind === 'jade_chimera' || boss.kind === 'cocytus_core'
                      ? 1800
                      : boss.kind === 'clockwork_core' || boss.kind === 'verdant_warden' || boss.kind === 'glacia_knight'
                        ? 1500
                        : 1200;
      this.hitstopTimer = 0.09;
      this.addShake(9, 0.35);
      sound.playExplosion();
      this.addFloatingText(boss.x + boss.w * 0.5, boss.y - 12, 'BOSS DEFEATED!', '#34d399');
      this.spawnParticles(boss.x + boss.w * 0.5, boss.y + boss.h * 0.5, 42, {
        color: isIce ? '#bae6fd' : isEmerald ? '#34d399' : isGold ? '#facc15' : '#38f2ff',
        speedMin: 80,
        speedMax: 320,
        angleMin: 0,
        angleMax: Math.PI * 2,
        size: 4.5,
        life: 0.75,
        gravity: 160,
        glow: true,
      });
      // Reveal & sparkle post-boss recovery orbs (e.g. encounter stage healing orbs)
      let hasUnlockedOrb = false;
      for (const orb of this.level.orbs) {
        if (orb.afterBoss && !orb.collected) {
          hasUnlockedOrb = true;
          this.spawnParticles(orb.x, orb.y, 12, {
            color: '#fbbf24',
            speedMin: 35,
            speedMax: 125,
            angleMin: 0,
            angleMax: Math.PI * 2,
            size: 3,
            life: 0.48,
            gravity: 40,
            glow: true,
          });
        }
      }
      if (hasUnlockedOrb) {
        this.addFloatingText(this.player.x + this.player.w * 0.5, this.player.y - 26, 'RECOVERY ORBS UNLOCKED!', '#fbbf24');
      }
      // Mark active enemy projectiles expired safely (never replace array mid-iteration!)
      for (const pr of this.projectiles) {
        if (pr.fromEnemy) {
          pr.life = -1;
          pr.damage = 0;
        }
      }
      for (const bx of [boss.arenaMinX, boss.arenaMaxX]) {
        this.spawnParticles(bx, boss.floorY - 120, 14, {
          color: isIce ? '#38bdf8' : isEmerald ? '#34d399' : isGold ? '#facc15' : boss.kind === 'archmage' ? '#c084fc' : '#f43f5e',
          speedMin: 50,
          speedMax: 180,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 3.5,
          life: 0.55,
          gravity: 120,
          glow: true,
        });
      }
      this.pushHud(true);
    }
  }

  private damagePlayer(fromPit: boolean, knockDir = -1, amount = 20) {
    sound.playHurt();
    this.addShake(6.5, 0.2);
    this.hitstopTimer = 0.045;

    if (this.godMode) {
      this.addFloatingText(
        this.player.x + this.player.w * 0.5,
        this.player.y - 12,
        `-${amount} HP (無敵)`,
        '#38f2ff'
      );
      this.spawnParticles(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5, 10, {
        color: '#38f2ff',
        speedMin: 40,
        speedMax: 160,
        angleMin: 0,
        angleMax: Math.PI * 2,
        size: 3,
        life: 0.3,
        gravity: 160,
        glow: true,
      });
      if (fromPit) {
        this.resetPlayerToSpawn(false);
      } else {
        this.player.invulnTimer = 0.75;
        this.player.vx = knockDir * 170;
        this.player.vy = -210;
        this.player.onGround = false;
      }
      this.pushHud(true);
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.addFloatingText(this.player.x + this.player.w * 0.5, this.player.y - 10, `-${amount} HP`, '#fb7185');

    this.spawnParticles(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5, 16, {
      color: '#f43f5e',
      speedMin: 60,
      speedMax: 220,
      angleMin: 0,
      angleMax: Math.PI * 2,
      size: 3.4,
      life: 0.42,
      gravity: 260,
      glow: true,
    });

    if (this.hp <= 0) {
      this.hp = 0;
      this.status = 'GAME_OVER';
      this.pushHud(true);
      return;
    }

    if (fromPit) {
      this.resetPlayerToSpawn(false);
    } else {
      this.player.invulnTimer = 1.4;
      this.player.vx = knockDir * 220;
      this.player.vy = -280;
      this.player.onGround = false;
      this.endSlideIfClear();
    }
    this.pushHud(true);
  }

  private updateOrbs(dt: number) {
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;

    for (const orb of this.level.orbs) {
      if (orb.collected) continue;
      if (orb.afterBoss && this.level.boss && !this.level.boss.defeated) continue;
      orb.phase += dt * 3.8;
      const oy = orb.y + Math.sin(orb.phase) * 3;
      if (Math.hypot(pcx - orb.x, pcy - oy) < orb.r + 17) {
        orb.collected = true;
        this.orbsCollected += 1;
        this.score += orb.value;
        sound.playOrbCollect(this.orbCombo);
        this.orbCombo += 1;
        this.orbComboTimer = 1.4;
        if (orb.bonus && this.hp < this.maxHp) {
          const healed = Math.min(this.maxHp - this.hp, DAMAGE_TABLE.bonus_orb_heal);
          this.hp += healed;
          this.addFloatingText(orb.x, oy - 12, `HP +${healed}`, '#34d399');
        } else {
          this.addFloatingText(orb.x, oy - 10, `+${orb.value}`, orb.bonus ? '#fbbf24' : '#38f2ff');
        }
        this.spawnParticles(orb.x, oy, 9, {
          color: orb.bonus ? '#fbbf24' : '#38f2ff',
          speedMin: 40,
          speedMax: 150,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 3,
          life: 0.34,
          gravity: 40,
          glow: true,
        });
      }
    }
  }

  private updateCheckpoints() {
    const pcx = this.player.x + this.player.w * 0.5;
    const pBottom = this.player.y + this.player.h;
    for (const cp of this.level.checkpoints) {
      if (this.level.verticalClimb) {
        if (
          cp.y < this.player.checkpointY &&
          Math.abs(pcx - cp.x) <= 420 &&
          pBottom <= cp.y + 42 &&
          Math.abs(pBottom - cp.y) <= 220
        ) {
          this.player.checkpointX = cp.x;
          this.player.checkpointY = cp.y;
          this.addFloatingText(cp.x, cp.y - 36, 'CHECKPOINT!', '#fde047');
        }
      } else if (this.level.verticalDescent) {
        if (
          Math.abs(pcx - cp.x) <= 420 &&
          Math.abs(pBottom - cp.y) <= 180 &&
          (cp.y > this.player.checkpointY ||
            (cp.y >= 700 && this.player.checkpointY >= 700 && cp.x > this.player.checkpointX))
        ) {
          this.player.checkpointX = cp.x;
          this.player.checkpointY = cp.y;
          this.addFloatingText(cp.x, cp.y - 36, 'CHECKPOINT!', '#7dd3fc');
        }
      } else if (this.player.x >= cp.x && cp.x > this.player.checkpointX) {
        this.player.checkpointX = cp.x;
        this.player.checkpointY = cp.y;
      }
    }
  }

  private updateGoal() {
    if (this.level.boss && !this.level.boss.defeated) return; // Gate opens after boss defeat!

    const p = this.player;
    const check = (g: { x: number; y: number; w: number; h: number }, secret: boolean) => {
      if (this.rectsOverlap(p.x, p.y, p.w, p.h, g.x + 8, g.y, g.w - 16, g.h)) {
        this.status = 'VICTORY';
        this.isSecretClear = secret;
        this.score += secret ? 1500 : 1000;
        sound.playGoal();
        this.spawnParticles(g.x + g.w * 0.5, g.y + 40, 36, {
          color: secret ? '#fbbf24' : '#34d399',
          speedMin: 80,
          speedMax: 290,
          angleMin: 0,
          angleMax: Math.PI * 2,
          size: 4,
          life: 0.75,
          gravity: 160,
          glow: true,
        });
        const snap = this.buildHudSnapshot();
        this.onHudUpdate(snap);
        this.onStageClearCallback?.(snap);
        return true;
      }
      return false;
    };

    if (this.level.secretGoal && check(this.level.secretGoal, true)) return;
    check(this.level.goal, false);
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      if (pt.ring) {
        pt.size += 140 * dt;
      } else {
        pt.vy += pt.gravity * dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
      }
      pt.alpha = Math.max(0, pt.life / pt.maxLife);
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  private updateActionRipples(dt: number) {
    for (let i = this.actionRipples.length - 1; i >= 0; i--) {
      const r = this.actionRipples[i];
      r.life -= dt;
      if (r.life <= 0) this.actionRipples.splice(i, 1);
    }
  }

  private updateHoloReveals(dt: number) {
    for (const id of Object.keys(this.holoReveal)) {
      if (this.holoReveal[id] < 1) {
        this.holoReveal[id] = Math.min(1, this.holoReveal[id] + dt * 3.8);
      }
    }
  }

  private updateCamera(dt: number) {
    const p = this.player;
    const boss = this.level.boss;

    if (boss && boss.active && !boss.defeated) {
      const arenaMin = boss.arenaMinX - 24;
      const arenaMax = boss.arenaMaxX + 24;
      const arenaW = arenaMax - arenaMin;
      let targetX: number;
      if (this.viewW <= arenaW) {
        const lead = p.facing * 32 + p.vx * 0.1;
        const raw = p.x + p.w * 0.5 + lead - this.viewW * 0.5;
        targetX = Math.max(arenaMin, Math.min(arenaMax - this.viewW, raw));
      } else {
        targetX = arenaMin + (arenaW - this.viewW) * 0.5;
      }
      // Guarantee goal gate never enters viewport while boss is alive
      targetX = Math.min(targetX, this.level.goal.x - this.viewW - 80);
      this.camX += (targetX - this.camX) * Math.min(1, 8.0 * dt);
    } else if (this.level.autoScrollSpeed) {
      this.camX = Math.min(this.level.width - this.viewW, this.camX + this.level.autoScrollSpeed * dt);
    } else {
      const lead = p.facing * 55 + p.vx * 0.18;
      const targetX = p.x + p.w * 0.5 + lead - this.viewW * 0.38;
      let clampedTargetX = Math.max(0, Math.min(this.level.width - this.viewW, targetX));
      // Before boss fight triggers, also prevent peeking at the post-boss goal gate
      if (boss && !boss.defeated) {
        clampedTargetX = Math.min(clampedTargetX, this.level.goal.x - this.viewW - 80);
      }
      this.camX += (clampedTargetX - this.camX) * Math.min(1, 7.5 * dt);
    }

    let targetY = this.level.verticalClimb
      ? Math.min(0, p.y - 255)
      : this.level.verticalDescent
        ? Math.max(-780, Math.min(540, p.y - 195))
        : Math.min(this.stageMaxCamY, Math.max(this.stageMinCamY, p.y - 245));
    if (boss && boss.active && !boss.defeated) {
      targetY = this.level.verticalClimb || this.level.verticalDescent
        ? boss.floorY - 375
        : Math.min(this.stageMaxCamY, Math.max(this.stageMinCamY, boss.floorY - 375));
    }
    this.camY += (targetY - this.camY) * Math.min(1, 5.5 * dt);
  }

  private updateShake(dt: number) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) this.shakeIntensity = 0;
    }
  }

  private addShake(intensity: number, duration: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({ x, y, vy: -42, text, color, life: 0.72, maxLife: 0.72 });
  }

  private spawnParticles(
    x: number,
    y: number,
    count: number,
    opts: {
      color: string;
      speedMin: number;
      speedMax: number;
      angleMin: number;
      angleMax: number;
      size: number;
      life: number;
      gravity: number;
      glow?: boolean;
    }
  ) {
    for (let i = 0; i < count; i++) {
      const ang = opts.angleMin + Math.random() * (opts.angleMax - opts.angleMin);
      const spd = opts.speedMin + Math.random() * (opts.speedMax - opts.speedMin);
      const life = opts.life * (0.7 + Math.random() * 0.5);
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: opts.size * (0.7 + Math.random() * 0.6),
        color: opts.color,
        alpha: 1,
        life,
        maxLife: life,
        gravity: opts.gravity,
        glow: opts.glow,
      });
    }
  }

  private isSwitchGroupActive(group: string): boolean {
    return this.level.switches.some((s) => s.group === group && s.activated);
  }

  private rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private circleRectOverlap(cx: number, cy: number, cr: number, rx: number, ry: number, rw: number, rh: number) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= cr * cr;
  }

  private buildHudSnapshot(): HudSnapshot {
    const b = this.level.boss;
    return {
      stageId: this.level.id,
      stageCode: this.level.code,
      stageTitle: this.level.title,
      status: this.status,
      hp: this.hp,
      maxHp: this.maxHp,
      score: this.score,
      orbsCollected: this.orbsCollected,
      totalOrbs: this.level.orbs.length,
      elapsedSec: this.runTime,
      enemiesDefeated: this.enemiesDefeated,
      isSecretClear: this.isSecretClear,
      boss:
        b && b.active && !b.defeated
          ? {
              name:
                b.kind === 'overlord_core'
                  ? '星幽機皇・オーヴァーロード'
                  : b.kind === 'glacies_emperor'
                    ? '蒼氷王・グレイシアスエンペラー'
                    : b.kind === 'cocytus_core'
                      ? 'コキュートス・コア'
                      : b.kind === 'glacia_knight'
                        ? 'グラキア・ナイト'
                        : b.kind === 'frost_titan'
                          ? 'フロスト・タイタン'
                          : b.kind === 'emerald_emperor'
                            ? '翡翠皇・エメラルドエンペラー'
                            : b.kind === 'jade_chimera'
                              ? 'ジェイド・キメラ'
                              : b.kind === 'verdant_warden'
                                ? 'ヴァーダント・ワーデン'
                                : b.kind === 'emerald_stalker'
                                  ? 'エメラルド・ストーカー'
                                  : b.kind === 'volt_centurion'
                                    ? 'ヴォルト・センチュリオン'
                                    : b.kind === 'iron_goliath'
                                      ? 'アイアン・ゴライアス'
                                      : b.kind === 'thunder_kronos'
                                        ? '雷帝サンダー・クロノス'
                                        : b.kind === 'clockwork_core'
                                          ? 'クロックワーク・コア'
                                          : b.kind === 'archmage'
                                            ? '魔導機神・アークメイジ'
                                            : '重装シールド・ガーディアン',
              hp: b.hp,
              maxHp: b.maxHp,
            }
          : null,
    };
  }

  private pushHud(_force: boolean) {
    this.lastHudPush = this.worldTime;
    this.onHudUpdate(this.buildHudSnapshot());
  }

  // -------------------- Rendering --------------------

  private render() {
    const ctx = this.ctx;
    const scale = this.canvas.height / LOGICAL_HEIGHT;

    ctx.save();
    ctx.scale(scale, scale);

    this.renderThemeBackdrop();

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
    }

    ctx.save();
    ctx.translate(Math.round(-this.camX + shakeX), Math.round(-this.camY + shakeY));

    this.renderGravityZones();
    this.renderNeonSigns();
    this.renderSlopes();
    this.renderPlatforms();
    this.renderBloomBridges();
    this.renderSporeCatapults();
    this.renderMovingPlatforms();
    this.renderFloatBubbles();
    this.renderGears();
    this.renderRails();
    this.renderPendulumVines();
    this.renderSpikes();
    this.renderSnapTraps();
    this.renderSporeJets();
    this.renderScythePendulums();
    this.renderCables();
    this.renderLasers();
    this.renderBeamLasers();
    this.renderCannons();
    this.renderMirrors();
    this.renderSealBlocks();
    this.renderSwitches();
    this.renderSignatureGimmicks();
    this.renderGoalGates();
    this.renderOrbs();
    this.renderEnemies();
    this.renderBoss();
    this.renderPlayer();
    this.renderProjectiles();
    this.renderLightningStrikes();
    this.renderGroundSpikes();
    this.renderParticles();
    this.renderFloatingTexts();

    ctx.restore();

    // Left-edge Plasma Crush Wall on World 2 forced scroll (2-6)
    if (this.level.scrollCrush && this.level.autoScrollSpeed) {
      const grad = ctx.createLinearGradient(0, 0, 26, 0);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.72)');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 26, this.viewH);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let y = 0; y <= this.viewH; y += 18) {
        const jx = 4 + Math.sin(this.worldTime * 32 + y * 0.25) * 3;
        if (y === 0) ctx.moveTo(jx, y);
        else ctx.lineTo(jx, y);
      }
      ctx.stroke();
    }

    // Metro Dark Overlay with dynamic player lantern + lit switches
    if (this.level.ambientDarkness) {
      this.renderMetroDarkness();
    }

    // Rain foreground streaks (1-4)
    if (this.level.theme === 'rainy_arcade') {
      this.renderRain();
    }

    // World 4 Underwater Abyssal Depth Tint & Snow/Bubble Foreground
    if (this.level.underwaterStage) {
      ctx.fillStyle = 'rgba(8, 47, 73, 0.24)';
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }
    if (this.snowFlakes.length > 0) {
      ctx.save();
      for (const sf of this.snowFlakes) {
        if (this.level.underwaterStage) {
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.r + 0.8, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    if (this.level.blizzardConfig) {
      const blz = this.level.blizzardConfig;
      const cyc = blz.cyclePeriod || 6.0;
      const cycleIdx = Math.floor(this.worldTime / cyc);
      const t = this.worldTime - cycleIdx * cyc;
      if (t < blz.activeDuration) {
        const dir = cycleIdx % 2 === 0 ? 1 : -1;
        ctx.save();
        ctx.fillStyle = 'rgba(14, 116, 144, 0.14)';
        ctx.fillRect(0, 0, this.viewW, this.viewH);
        ctx.fillStyle = 'rgba(9, 14, 36, 0.78)';
        ctx.beginPath();
        ctx.roundRect(this.viewW * 0.5 - 88, 56, 176, 20, 6);
        ctx.fill();
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dir > 0 ? 'BLIZZARD GALE ▶▶' : '◀◀ BLIZZARD GALE', this.viewW * 0.5, 69);
        ctx.textAlign = 'left';
        ctx.restore();
      }
    }

    // Chrono Slow-Motion visual aura & countdown gauge
    if (this.chronoSlowTimer > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(0, 0, this.viewW, this.viewH);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, this.viewW - 4, this.viewH - 4);

      ctx.fillStyle = 'rgba(9, 14, 36, 0.78)';
      ctx.beginPath();
      ctx.roundRect(this.viewW * 0.5 - 88, 56, 176, 20, 6);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CHRONO SLOW ${this.chronoSlowTimer.toFixed(1)}s`, this.viewW * 0.5, 69);
      ctx.textAlign = 'left';
    }

    // Airship storm lightning flash
    if (this.lightningAlpha > 0) {
      const isGold = this.level.theme === 'thunder_airship' || this.level.theme === 'thunder_highway';
      ctx.fillStyle = isGold
        ? `rgba(254, 240, 138, ${this.lightningAlpha})`
        : `rgba(224, 242, 254, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }

    this.renderTouchFeedback();

    ctx.restore();
  }

  private renderThemeBackdrop() {
    const ctx = this.ctx;
    const theme = this.level.theme;
    const isW2 =
      theme === 'golden_clocktower' ||
      theme === 'gear_fortress' ||
      theme === 'thunder_highway' ||
      theme === 'thunder_airship';
    const isW3 =
      theme === 'emerald_canopy' ||
      theme === 'jade_labyrinth' ||
      theme === 'verdant_fortress' ||
      theme === 'bio_spire_sky';
    const isW4 =
      theme === 'frozen_harbor' ||
      theme === 'cryo_prism_maze' ||
      theme === 'blizzard_gorge' ||
      theme === 'glacial_fortress' ||
      theme === 'abyssal_trench' ||
      theme === 'frost_spire_citadel';
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.viewH);
    if (isW4) {
      // Ice moon & aurora ribbons
      if (!this.level.underwaterStage) {
        const orbX = this.viewW * 0.72 - (this.camX * 0.015) % 160;
        const orbY = 98;
        const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 90);
        orbGrad.addColorStop(0, 'rgba(224, 242, 254, 0.82)');
        orbGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.28)');
        orbGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orbX, orbY, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        for (let ax = 0; ax <= this.viewW; ax += 40) {
          const ay = 68 + Math.sin(ax * 0.012 + this.worldTime * 0.7) * 18;
          if (ax === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
        }
        ctx.stroke();
      } else {
        // Underwater sun caustic beams
        for (let cx = 60; cx < this.viewW; cx += 150) {
          const sway = Math.sin(this.worldTime * 0.9 + cx) * 18;
          const beam = ctx.createLinearGradient(cx + sway, 0, cx - sway, this.viewH);
          beam.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
          beam.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(cx + sway - 18, 0);
          ctx.lineTo(cx + sway + 18, 0);
          ctx.lineTo(cx - sway + 54, this.viewH);
          ctx.lineTo(cx - sway - 54, this.viewH);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Parallax jagged glacial spires
      for (let sx = (((-this.camX * 0.17) % 230) + 230) % 230 - 80; sx < this.viewW + 100; sx += 230) {
        ctx.fillStyle = theme === 'glacial_fortress' ? 'rgba(12, 74, 110, 0.42)' : 'rgba(56, 189, 248, 0.16)';
        ctx.beginPath();
        ctx.moveTo(sx - 38, this.viewH);
        ctx.lineTo(sx, 140);
        ctx.lineTo(sx + 38, this.viewH);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }

    if (isW3) {
      // Emerald Moon / Bio Core Sun
      const orbX = this.viewW * 0.74 - (this.camX * 0.015) % 160;
      const orbY = 104;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 85);
      orbGrad.addColorStop(0, 'rgba(167, 243, 208, 0.72)');
      orbGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
      orbGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 85, 0, Math.PI * 2);
      ctx.fill();

      // Parallax emerald crystal spires
      if (!this.level.aerialSky) {
        for (let sx = (((-this.camX * 0.18) % 240) + 240) % 240 - 80; sx < this.viewW + 100; sx += 240) {
          ctx.fillStyle = theme === 'verdant_fortress' ? 'rgba(6, 78, 59, 0.45)' : 'rgba(5, 150, 105, 0.22)';
          ctx.beginPath();
          ctx.moveTo(sx - 34, this.viewH);
          ctx.lineTo(sx, 145);
          ctx.lineTo(sx + 34, this.viewH);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Floating glowing bio-spores
      for (const m of this.libraryMotes) {
        const mx = ((m.x - this.camX * 0.24) % (this.viewW + 60) + this.viewW + 60) % (this.viewW + 60) - 30;
        ctx.fillStyle = 'rgba(110, 231, 183, 0.48)';
        ctx.beginPath();
        ctx.arc(mx + Math.sin(m.phase) * 9, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Emerald Canopy Cloud Sea for 3-7 & 3-BOSS vertical climb
      if (this.level.aerialSky) {
        const climbShift = this.level.verticalClimb ? Math.min(185, Math.max(0, -this.camY * 0.08)) : 0;
        for (const layer of [
          { y: 365 + climbShift, factor: 0.14, r: 58, step: 110, fill: 'rgba(6, 78, 59, 0.56)', edge: 'rgba(52, 211, 153, 0.26)' },
          { y: 405 + climbShift, factor: 0.26, r: 68, step: 96, fill: 'rgba(4, 47, 36, 0.78)', edge: 'rgba(110, 231, 183, 0.34)' },
        ]) {
          const offset = (((-this.camX * layer.factor - this.worldTime * 14) % layer.step) + layer.step) % layer.step - layer.step;
          ctx.fillStyle = layer.fill;
          ctx.beginPath();
          ctx.moveTo(-60, this.viewH);
          for (let cx = offset; cx < this.viewW + layer.step * 2; cx += layer.step) {
            ctx.arc(cx, layer.y, layer.r, Math.PI, 0, false);
          }
          ctx.lineTo(this.viewW + 120, this.viewH);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = layer.edge;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let cx = offset; cx < this.viewW + layer.step * 2; cx += layer.step) {
            ctx.arc(cx, layer.y, layer.r, Math.PI * 1.08, -Math.PI * 0.08, false);
          }
          ctx.stroke();
        }
      }
      return;
    }

    if (isW2) {
      // Dusk golden sun orb
      if (theme !== 'gear_fortress') {
        const sunX = this.viewW * 0.72 - (this.camX * 0.015) % 160;
        const sunY = 128;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 95);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
        sunGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 95, 0, Math.PI * 2);
        ctx.fill();
      }

      // Giant slow-rotating clockwork gear silhouettes in background parallax
      const bgGears = [
        { ox: 140, oy: 195, r: 92, teeth: 12, spd: 0.12 },
        { ox: 460, oy: 135, r: 120, teeth: 14, spd: -0.09 },
        { ox: 820, oy: 215, r: 82, teeth: 10, spd: 0.16 },
      ];
      for (const bg of bgGears) {
        const gx = (((bg.ox - this.camX * 0.12) % 1050) + 1050) % 1050 - 120;
        ctx.save();
        ctx.translate(gx, bg.oy);
        ctx.rotate(this.worldTime * bg.spd);
        ctx.strokeStyle = theme === 'gear_fortress' ? 'rgba(250, 204, 21, 0.11)' : 'rgba(251, 191, 36, 0.14)';
        ctx.fillStyle = theme === 'gear_fortress' ? 'rgba(18, 14, 5, 0.55)' : 'rgba(69, 32, 6, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < bg.teeth * 2; k++) {
          const ang = (k * Math.PI) / bg.teeth;
          const rad = k % 2 === 0 ? bg.r + 12 : bg.r;
          const x = Math.cos(ang) * rad;
          const y = Math.sin(ang) * rad;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, bg.r * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Distant transmission pylons & sagging power lines (skipped on aerial sky stages 2-7 / 2-BOSS)
      if (!this.level.aerialSky && (theme === 'golden_clocktower' || theme === 'thunder_highway')) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1.6;
        for (let px = (((-this.camX * 0.24) % 320) + 320) % 320 - 100; px < this.viewW + 120; px += 320) {
          ctx.beginPath();
          ctx.moveTo(px - 18, this.viewH);
          ctx.lineTo(px, 175);
          ctx.lineTo(px + 18, this.viewH);
          ctx.moveTo(px - 28, 205);
          ctx.lineTo(px + 28, 205);
          ctx.moveTo(px - 22, 240);
          ctx.lineTo(px + 22, 240);
          ctx.stroke();
        }
      }

      // Multi-layered golden storm cloud sea for high-altitude sky stages (2-7, 2-BOSS)
      if (this.level.aerialSky) {
        const climbShift = this.level.verticalClimb ? Math.min(175, Math.max(0, -this.camY * 0.08)) : 0;
        if (climbShift > 18) {
          const starAlpha = Math.min(0.65, (climbShift - 18) / 140);
          for (const s of this.bgStars) {
            const sx = (((s.x - this.camX * 0.03) % (this.viewW + 100)) + (this.viewW + 100)) % (this.viewW + 100) - 50;
            const sy = ((s.y - this.camY * 0.05) % 240 + 240) % 240;
            ctx.fillStyle = `rgba(254, 240, 138, ${(starAlpha * 0.55).toFixed(2)})`;
            ctx.fillRect(sx, sy, s.r, s.r);
          }
        }
        for (const layer of [
          { y: 365 + climbShift, factor: 0.14, r: 58, step: 110, fill: 'rgba(120, 53, 15, 0.52)', edge: 'rgba(251, 191, 36, 0.22)' },
          { y: 405 + climbShift, factor: 0.26, r: 68, step: 96, fill: 'rgba(69, 26, 3, 0.72)', edge: 'rgba(253, 224, 71, 0.28)' },
        ]) {
          const offset = (((-this.camX * layer.factor - this.worldTime * 14) % layer.step) + layer.step) % layer.step - layer.step;
          ctx.fillStyle = layer.fill;
          ctx.beginPath();
          ctx.moveTo(-60, this.viewH);
          for (let cx = offset; cx < this.viewW + layer.step * 2; cx += layer.step) {
            ctx.arc(cx, layer.y, layer.r, Math.PI, 0, false);
          }
          ctx.lineTo(this.viewW + 120, this.viewH);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = layer.edge;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let cx = offset; cx < this.viewW + layer.step * 2; cx += layer.step) {
            ctx.arc(cx, layer.y, layer.r, Math.PI * 1.08, -Math.PI * 0.08, false);
          }
          ctx.stroke();
        }
      }

      // Fortress caution hazard tint
      if (theme === 'gear_fortress') {
        const pulse = 0.05 + 0.05 * Math.sin(this.worldTime * 4);
        ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
        ctx.fillRect(0, 0, this.viewW, this.viewH);
      }

      // Distant storm lightning bolts on thunder themes
      if ((theme === 'thunder_highway' || theme === 'thunder_airship' || this.level.aerialSky) && this.lightningAlpha > 0.1) {
        ctx.strokeStyle = `rgba(254, 240, 138, ${Math.min(0.8, this.lightningAlpha * 2.2)})`;
        ctx.lineWidth = 2;
        const bx = this.viewW * 0.3 + Math.sin(this.worldTime * 9) * 140;
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx - 14, 70);
        ctx.lineTo(bx + 10, 120);
        ctx.lineTo(bx - 18, 210);
        ctx.stroke();
      }
      return;
    }

    // Stars & moon on outdoor W1 stages
    if (theme !== 'metro_dark' && theme !== 'fortress_alert') {
      const moonX = this.viewW * 0.76 - this.camX * 0.03;
      const moonY = 74;
      ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme === 'arcane_library' ? '#130b2e' : '#091025';
      ctx.beginPath();
      ctx.arc(moonX - 7, moonY - 3, 16, 0, Math.PI * 2);
      ctx.fill();

      for (const s of this.bgStars) {
        const sx =
          (((s.x - this.camX * 0.04) % (this.viewW + 120)) + (this.viewW + 120)) % (this.viewW + 120) - 60;
        const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(this.worldTime * 2.2 + s.twinkle));
        ctx.fillStyle = `rgba(224, 242, 254, ${alpha.toFixed(2)})`;
        ctx.fillRect(sx, s.y, s.r, s.r);
      }
    }

    // Parallax City Skyline (outdoor urban themes)
    if (['neon_street', 'sky_hologram', 'rainy_arcade', 'monorail_rush'].includes(theme)) {
      const speedMul = theme === 'monorail_rush' ? 2.4 : 1;
      this.renderSkylineLayer(1, 0.14 * speedMul, '#0b1226', '#1e293b');
      this.renderSkylineLayer(2, 0.3 * speedMul, '#101a34', '#263556');
    }

    // Fortress pulsing red alarm beacons
    if (theme === 'fortress_alert') {
      const pulse = 0.08 + 0.08 * Math.sin(this.worldTime * 4.5);
      ctx.fillStyle = `rgba(244, 63, 94, ${pulse})`;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }

    // Monorail speed streaks
    if (theme === 'monorail_rush') {
      ctx.strokeStyle = 'rgba(56, 242, 255, 0.18)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const sx = ((i * 190 - this.worldTime * 620) % (this.viewW + 200) + this.viewW + 200) % (this.viewW + 200) - 100;
        const sy = 50 + (i * 31) % 300;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 80, sy);
        ctx.stroke();
      }
    }

    // Floating Library motes / pages
    for (const m of this.libraryMotes) {
      const mx = ((m.x - this.camX * 0.25) % (this.viewW + 60) + this.viewW + 60) % (this.viewW + 60) - 30;
      ctx.fillStyle = theme === 'secret_vault' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(192, 132, 252, 0.42)';
      ctx.beginPath();
      ctx.arc(mx + Math.sin(m.phase) * 8, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderSkylineLayer(layer: 1 | 2, factor: number, bodyColor: string, edgeColor: string) {
    const ctx = this.ctx;
    const parallaxX = this.camX * factor;
    const baseY = this.viewH;

    for (const b of this.bgBuildings) {
      const screenX = ((b.x - parallaxX) % 2600 + 2600) % 2600 - 150;
      if (b.layer !== layer) continue;
      if (screenX + b.w < -40 || screenX > this.viewW + 40) continue;

      const topY = baseY - b.h;
      ctx.fillStyle = bodyColor;
      ctx.fillRect(screenX, topY, b.w, b.h);
      ctx.fillStyle = edgeColor;
      ctx.fillRect(screenX, topY, b.w, 2);

      for (const w of b.windows) {
        if (!w.lit) continue;
        ctx.fillStyle = w.warm ? 'rgba(251, 191, 36, 0.22)' : 'rgba(56, 189, 248, 0.20)';
        ctx.fillRect(screenX + w.rx, topY + w.ry, 5, 7);
      }
    }
  }

  private renderGravityZones() {
    const ctx = this.ctx;
    for (const gz of this.level.gravityZones) {
      if (gz.x + gz.w < this.camX - 40 || gz.x > this.camX + this.viewW + 40) continue;
      ctx.save();
      const isUp = gz.mode === 'updraft';
      ctx.fillStyle = isUp ? 'rgba(56, 242, 255, 0.09)' : 'rgba(192, 132, 252, 0.09)';
      ctx.fillRect(gz.x, gz.y, gz.w, gz.h);
      ctx.strokeStyle = isUp ? 'rgba(56, 242, 255, 0.35)' : 'rgba(192, 132, 252, 0.35)';
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(gz.x, gz.y, gz.w, gz.h);
      ctx.setLineDash([]);

      // Rising air/mana chevrons
      ctx.strokeStyle = isUp ? 'rgba(56, 242, 255, 0.45)' : 'rgba(192, 132, 252, 0.4)';
      ctx.lineWidth = 1.5;
      const offset = (this.worldTime * 75) % 44;
      for (let y = gz.y + gz.h - offset; y > gz.y + 15; y -= 44) {
        const cx = gz.x + gz.w * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - 10, y + 6);
        ctx.lineTo(cx, y);
        ctx.lineTo(cx + 10, y + 6);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderNeonSigns() {
    const ctx = this.ctx;
    for (const s of this.level.neonSigns) {
      if (s.x + s.w < this.camX - 60 || s.x > this.camX + this.viewW + 60) continue;
      ctx.save();
      ctx.fillStyle = 'rgba(10, 15, 32, 0.88)';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = s.color;
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, s.x + s.w * 0.5, s.y + s.h * 0.5 + 0.5);
      ctx.restore();
    }
  }

  private renderSlopes() {
    const ctx = this.ctx;
    for (const sl of this.level.slopes) {
      if (sl.x2 < this.camX - 60 || sl.x1 > this.camX + this.viewW + 60) continue;

      ctx.fillStyle = '#141b2c';
      ctx.beginPath();
      ctx.moveTo(sl.x1, sl.y1);
      ctx.lineTo(sl.x2, sl.y2);
      ctx.lineTo(sl.x2, sl.bottomY);
      ctx.lineTo(sl.x1, sl.bottomY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(sl.x1, sl.y1 + 4);
      ctx.lineTo(sl.x2, sl.y2 + 4);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sl.x1, sl.y1);
      ctx.lineTo(sl.x2, sl.y2);
      ctx.stroke();

      const len = Math.hypot(sl.x2 - sl.x1, sl.y2 - sl.y1);
      const ang = Math.atan2(sl.y2 - sl.y1, sl.x2 - sl.x1);
      const steps = Math.floor(len / 44);
      const offset = (this.worldTime * 48) % 44;

      ctx.save();
      ctx.translate(sl.x1, sl.y1);
      ctx.rotate(ang);
      ctx.strokeStyle = 'rgba(56, 242, 255, 0.55)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < steps; i++) {
        const cx = i * 44 + offset;
        if (cx > len - 12) continue;
        ctx.beginPath();
        ctx.moveTo(cx - 5, 11);
        ctx.lineTo(cx, 15);
        ctx.lineTo(cx - 5, 19);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderPlatforms() {
    const ctx = this.ctx;
    for (const p of this.level.platforms) {
      if (p.x + p.w < this.camX - 60 || p.x > this.camX + this.viewW + 60) continue;

      if (p.style === 'holo') {
        const active = !p.switchGroup || this.isSwitchGroupActive(p.switchGroup);
        if (!active) {
          ctx.save();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = 'rgba(56, 242, 255, 0.2)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.restore();
          continue;
        }
        const reveal = this.holoReveal[p.id] ?? 1;
        ctx.save();
        ctx.globalAlpha = reveal;
        ctx.fillStyle = 'rgba(14, 165, 233, 0.28)';
        ctx.fillRect(p.x, p.y, p.w * reveal, p.h);
        ctx.strokeStyle = '#38f2ff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(p.x, p.y, p.w * reveal, p.h);
        ctx.restore();
        continue;
      }

      if (p.style === 'vanish_holo') {
        if (p.vanishState === 'gone') {
          ctx.save();
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.restore();
          continue;
        }
        const warn = p.vanishState === 'warning';
        const flicker = warn && Math.floor(this.worldTime * 22) % 2 === 0;
        ctx.save();
        ctx.fillStyle = warn ? 'rgba(251, 191, 36, 0.32)' : 'rgba(56, 242, 255, 0.24)';
        ctx.strokeStyle = warn ? (flicker ? '#fef08a' : '#f59e0b') : '#38f2ff';
        ctx.lineWidth = 1.8;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.restore();
        continue;
      }

      if (p.style === 'train_car') {
        ctx.fillStyle = '#182238';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x, p.y, p.w, 4);
        // Train windows
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        for (let wx = p.x + 24; wx < p.x + p.w - 36; wx += 48) {
          ctx.fillRect(wx, p.y + 22, 26, 16);
        }
        continue;
      }

      if (p.style === 'library_shelf') {
        ctx.fillStyle = '#24173c';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(p.x, p.y, p.w, 3);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.fillRect(p.x + 8, p.y + 6, p.w - 16, 2);
        continue;
      }

      if (p.style === 'fortress') {
        ctx.fillStyle = '#1f121d';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#4c1d2e';
        ctx.fillRect(p.x, p.y, p.w, 4);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        continue;
      }

      if (p.style === 'brass') {
        ctx.fillStyle = '#291a06';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(p.x, p.y, p.w, 8);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(p.x, p.y, p.w, 2.5);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.38)';
        for (let rx = p.x + 14; rx < p.x + p.w - 10; rx += 36) {
          ctx.fillRect(rx, p.y + 13, 4, 4);
        }
      } else if (p.style === 'pylon') {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(p.x + 4, p.y + 2, 6, 4);
        ctx.fillRect(p.x + p.w - 10, p.y + 2, 6, 4);
      } else if (p.style === 'highway') {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(p.x, p.y, p.w, 9);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(p.x, p.y, p.w, 2.5);
        for (let lx = p.x + 16; lx < p.x + p.w - 22; lx += 38) {
          ctx.fillRect(lx, p.y + 13, 18, 2);
        }
      } else if (p.style === 'shock_bridge') {
        const st = this.getPlatformShockState(p);
        ctx.save();
        if (st === 'shock') {
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#713f12';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.beginPath();
          for (let sx = p.x + 4; sx < p.x + p.w - 4; sx += 14) {
            const sy = p.y - 3 + (Math.random() - 0.5) * 8;
            if (sx === p.x + 4) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        } else if (st === 'warn') {
          const blink = Math.floor(this.worldTime * 20) % 2 === 0;
          ctx.fillStyle = blink ? '#78350f' : '#27272a';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = blink ? '#fbbf24' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p.x, p.y, p.w, 3);
        }
        ctx.restore();
      } else if (p.style === 'asphalt') {
        ctx.fillStyle = '#131a2b';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = this.level.slippery ? '#1d324f' : '#252f45';
        ctx.fillRect(p.x, p.y, p.w, 12);
        ctx.fillStyle = this.level.slippery ? '#38bdf8' : '#475569';
        ctx.fillRect(p.x, p.y, p.w, 2);
      } else if (p.style === 'jade') {
        ctx.fillStyle = '#062c1e';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#0d543a';
        ctx.fillRect(p.x, p.y, p.w, 8);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(p.x, p.y, p.w, 2.5);
        ctx.fillStyle = 'rgba(110, 231, 183, 0.32)';
        for (let vx = p.x + 18; vx < p.x + p.w - 14; vx += 44) {
          ctx.fillRect(vx, p.y + 12, 8, 3);
        }
      } else if (p.style === 'vine_deck') {
        ctx.fillStyle = '#0a3a26';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(p.x + 4, p.y, p.w - 8, 2.5);
      } else if (p.style === 'emerald_bounce') {
        ctx.save();
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(p.x + 6, p.y - 3, p.w - 12, 4);
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 1.8;
        const mcx = p.x + p.w * 0.5;
        ctx.beginPath();
        ctx.moveTo(mcx - 10, p.y + 11);
        ctx.lineTo(mcx, p.y + 4);
        ctx.lineTo(mcx + 10, p.y + 11);
        ctx.stroke();
        ctx.restore();
      } else if (p.style === 'sap_stream') {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        const dir = Math.sign(p.streamVx ?? 1) || 1;
        const speed = Math.abs(p.streamVx ?? 120);
        const shift = ((this.worldTime * speed * dir) % 24 + 24) % 24;
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.x + 2, p.y, p.w - 4, p.h);
        ctx.clip();
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 2;
        for (let cx = p.x - 24 + shift; cx < p.x + p.w + 24; cx += 24) {
          const midY = p.y + p.h * 0.5;
          ctx.beginPath();
          ctx.moveTo(cx - 5 * dir, midY - 4);
          ctx.lineTo(cx + 4 * dir, midY);
          ctx.lineTo(cx - 5 * dir, midY + 4);
          ctx.stroke();
        }
        ctx.restore();
      } else if (p.style === 'brass_conveyor') {
        ctx.fillStyle = '#3b2407';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        const dir = Math.sign(p.streamVx ?? 1) || 1;
        const speed = Math.abs(p.streamVx ?? 120);
        const shift = ((this.worldTime * speed * dir) % 26 + 26) % 26;
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.x + 2, p.y, p.w - 4, p.h);
        ctx.clip();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.2;
        for (let cx = p.x - 26 + shift; cx < p.x + p.w + 26; cx += 26) {
          const midY = p.y + p.h * 0.5;
          ctx.beginPath();
          ctx.moveTo(cx - 6 * dir, midY - 4);
          ctx.lineTo(cx + 5 * dir, midY);
          ctx.lineTo(cx - 6 * dir, midY + 4);
          ctx.stroke();
        }
        ctx.restore();
      } else if (p.style === 'ice_floor') {
        ctx.fillStyle = '#0c2748';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(p.x, p.y, p.w, 8);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(p.x, p.y, p.w, 2.5);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
        for (let ix = p.x + 14; ix < p.x + p.w - 18; ix += 42) {
          ctx.fillRect(ix, p.y + 12, 14, 3);
        }
      } else if (p.style === 'crumble_ice') {
        if (p.crumbleState === 'gone') {
          ctx.save();
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.25)';
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.restore();
          continue;
        }
        const cracking = p.crumbleState === 'cracking';
        const shakeOff = cracking ? Math.sin(this.worldTime * 48) * 1.6 : 0;
        ctx.fillStyle = cracking ? '#164e63' : '#0e3c68';
        ctx.fillRect(p.x + shakeOff, p.y, p.w, p.h);
        ctx.strokeStyle = cracking ? '#fde047' : '#7dd3fc';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(p.x + shakeOff, p.y, p.w, p.h);
        if (cracking) {
          ctx.strokeStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(p.x + p.w * 0.25, p.y);
          ctx.lineTo(p.x + p.w * 0.35, p.y + p.h);
          ctx.moveTo(p.x + p.w * 0.65, p.y);
          ctx.lineTo(p.x + p.w * 0.58, p.y + p.h);
          ctx.stroke();
        }
      } else if (p.style === 'freeze_water') {
        if (p.waterState === 'liquid') {
          ctx.fillStyle = 'rgba(14, 165, 233, 0.24)';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
          ctx.setLineDash([5, 4]);
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(p.x + 4, p.y + 2, p.w - 8, 3);
        }
      } else if (p.style === 'cryo_metal') {
        ctx.fillStyle = '#0f1c36';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#1e3a66';
        ctx.fillRect(p.x, p.y, p.w, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x, p.y, p.w, 2.5);
      } else if (p.style === 'gantry') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
        for (let hx = p.x + 4; hx < p.x + p.w - 10; hx += 16) {
          ctx.fillRect(hx, p.y + p.h - 4, 8, 3);
        }
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(p.x, p.y, p.w, 2.5);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fillRect(p.x + 6, p.y + p.h - 4, p.w - 12, 2);
      }
      if (p.windbreak) {
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
        ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8);
      }
    }
  }

  private renderMovingPlatforms() {
    const ctx = this.ctx;
    for (const mp of this.level.movingPlatforms) {
      if (mp.x + mp.w < this.camX - 60 || mp.x > this.camX + this.viewW + 60) continue;
      ctx.fillStyle = '#1f293d';
      ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mp.x, mp.y, mp.w, mp.h);
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(mp.x + mp.w * 0.5 - 12, mp.y + 6, 24, 3);
    }
  }

  private renderGears() {
    const ctx = this.ctx;
    for (const g of this.level.gears) {
      if (g.cx + g.r + 30 < this.camX || g.cx - g.r - 30 > this.camX + this.viewW) continue;
      ctx.save();
      ctx.translate(g.cx, g.cy);
      ctx.rotate(g.angle);

      ctx.fillStyle = '#452306';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const totalPts = g.teeth * 2;
      for (let k = 0; k < totalPts; k++) {
        const ang = (k * Math.PI * 2) / totalPts;
        const rad = k % 2 === 0 ? g.r + g.toothDepth : g.r;
        const x = Math.cos(ang) * rad;
        const y = Math.sin(ang) * rad;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner spokes & glowing clockwork axle
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
        ctx.lineTo(Math.cos(a) * (g.r - 8), Math.sin(a) * (g.r - 8));
        ctx.stroke();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderRails() {
    const ctx = this.ctx;
    for (const rail of this.level.rails) {
      const minX = Math.min(rail.x1, rail.x2);
      const maxX = Math.max(rail.x1, rail.x2);
      if (maxX < this.camX - 40 || minX > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rail.x1, rail.y1);
      ctx.lineTo(rail.x2, rail.y2);
      ctx.stroke();

      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Endpoint pylon nodes
      ctx.fillStyle = '#f59e0b';
      for (const [ex, ey] of [
        [rail.x1, rail.y1],
        [rail.x2, rail.y2],
      ]) {
        ctx.beginPath();
        ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderSpikes() {
    const ctx = this.ctx;
    for (const sp of this.level.spikes) {
      if (sp.x + sp.w < this.camX - 40 || sp.x > this.camX + this.viewW + 40) continue;
      ctx.fillStyle = '#f43f5e';
      const count = Math.floor(sp.w / 14);
      const sw = sp.w / count;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(sp.x + i * sw, sp.y + sp.h);
        ctx.lineTo(sp.x + (i + 0.5) * sw, sp.y);
        ctx.lineTo(sp.x + (i + 1) * sw, sp.y + sp.h);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private renderCables() {
    const ctx = this.ctx;
    for (const c of this.level.cables) {
      if (c.x < this.camX - 40 || c.x > this.camX + this.viewW + 40) continue;
      const tipX = c.x + Math.sin(c.phase * 0.7) * 8;
      const tipY = c.y + c.length;
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.quadraticCurveTo(c.x, c.y + c.length * 0.5, tipX, tipY);
      ctx.stroke();

      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#7ef9ff';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4 + Math.sin(this.worldTime * 25) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderLasers() {
    const ctx = this.ctx;
    for (const las of this.level.lasers) {
      if (las.cx < this.camX - 120 || las.cx > this.camX + this.viewW + 120) continue;
      const ex1 = las.cx + Math.cos(las.angle) * las.length;
      const ey1 = las.cy + Math.sin(las.angle) * las.length;
      const ex2 = las.cx - Math.cos(las.angle) * las.length;
      const ey2 = las.cy - Math.sin(las.angle) * las.length;

      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex1, ey1);
      ctx.lineTo(ex2, ey2);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(las.cx, las.cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderBeamLasers() {
    const ctx = this.ctx;
    for (const bl of this.level.beamLasers) {
      if (bl.x1 + bl.maxLength < this.camX - 80 || bl.x1 - bl.maxLength > this.camX + this.viewW + 80) continue;
      const active = this.isBeamLaserActive(bl);
      ctx.save();
      if (active) {
        const end = this.computeBeamEnd(bl);
        ctx.strokeStyle = '#facc15';
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(bl.x1, bl.y1);
        ctx.lineTo(end.endX, end.endY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (end.blockedByGear) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(end.endX, end.endY, 6 + Math.sin(this.worldTime * 28) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const t = (((this.worldTime + bl.phase) % bl.cyclePeriod) + bl.cyclePeriod) % bl.cyclePeriod;
        const timeLeft = bl.cyclePeriod - t;
        const preWarn = bl.activeDuration < bl.cyclePeriod - 0.01 && timeLeft <= 0.58;
        ctx.setLineDash([5, 7]);
        ctx.strokeStyle = preWarn ? 'rgba(254, 240, 138, 0.78)' : 'rgba(250, 204, 21, 0.22)';
        ctx.lineWidth = preWarn ? 2.6 : 1.4;
        ctx.beginPath();
        ctx.moveTo(bl.x1, bl.y1);
        ctx.lineTo(bl.x1 + bl.dirX * bl.maxLength, bl.y1 + bl.dirY * bl.maxLength);
        ctx.stroke();
        if (preWarn) {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(bl.x1, bl.y1, 10 + Math.sin(this.worldTime * 34) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(bl.x1, bl.y1, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderPendulumVines() {
    const ctx = this.ctx;
    for (const v of this.level.pendulumVines) {
      if (v.cx + v.length < this.camX - 60 || v.cx - v.length > this.camX + this.viewW + 60) continue;
      const ang = Math.sin(this.worldTime * v.speed + v.phase) * v.maxAngle;
      const tipX = v.cx + Math.sin(ang) * v.length;
      const tipY = v.cy + Math.cos(ang) * v.length;

      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(v.cx, v.cy);
      ctx.quadraticCurveTo(
        v.cx + Math.sin(ang * 0.65) * v.length * 0.5,
        v.cy + Math.cos(ang * 0.65) * v.length * 0.5,
        tipX,
        tipY
      );
      ctx.stroke();

      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(v.cx, v.cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderFloatBubbles() {
    const ctx = this.ctx;
    for (const fb of this.level.floatBubbles) {
      if (fb.popped) continue;
      const pos = this.getFloatBubblePos(fb);
      if (pos.x + fb.r < this.camX - 50 || pos.x - fb.r > this.camX + this.viewW + 50) continue;
      const standRatio = Math.min(1, (fb.standTimer ?? 0) / 1.45);
      const jitterX = standRatio > 0.45 ? Math.sin(this.worldTime * 48) * 2.2 : 0;

      ctx.save();
      ctx.shadowColor = standRatio > 0.55 ? '#fbbf24' : '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillStyle = standRatio > 0.55 ? 'rgba(250, 204, 21, 0.25)' : 'rgba(52, 211, 153, 0.24)';
      ctx.strokeStyle = standRatio > 0.55 ? '#fde047' : '#6ee7b7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(pos.x + jitterX, pos.y, fb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(236, 253, 245, 0.72)';
      ctx.beginPath();
      ctx.arc(pos.x + jitterX - fb.r * 0.34, pos.y - fb.r * 0.34, Math.max(3, fb.r * 0.22), 0, Math.PI * 2);
      ctx.fill();

      if (standRatio > 0) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x + jitterX, pos.y, fb.r - 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - standRatio));
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderSporeCatapults() {
    const ctx = this.ctx;
    for (const cat of this.level.sporeCatapults) {
      if (cat.x + cat.w < this.camX - 50 || cat.x > this.camX + this.viewW + 50) continue;
      ctx.save();
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cat.x, cat.y, cat.w, cat.h, 6);
      ctx.fill();
      ctx.stroke();

      const ang = Math.atan2(cat.launchVy, cat.launchVx);
      const mcx = cat.x + cat.w * 0.5;
      const mcy = cat.y + cat.h * 0.5;
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(mcx - Math.cos(ang) * 8, mcy - Math.sin(ang) * 8);
      ctx.lineTo(mcx + Math.cos(ang) * 11, mcy + Math.sin(ang) * 11);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(mcx + Math.cos(ang) * 11, mcy + Math.sin(ang) * 11, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderSnapTraps() {
    const ctx = this.ctx;
    for (const st of this.level.snapTraps) {
      if (st.x + st.w < this.camX - 50 || st.x > this.camX + this.viewW + 50) continue;
      const cyc = st.cyclePeriod || 2.8;
      const t = (((this.worldTime + st.phase) % cyc) + cyc) % cyc;
      const snapped = t >= cyc - st.snapDuration;
      const preWarn = !snapped && t >= cyc - st.snapDuration - 0.5;

      ctx.save();
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = snapped ? '#fb7185' : preWarn ? '#fde047' : '#34d399';
      ctx.lineWidth = 2;
      ctx.fillRect(st.x, st.y + st.h - 6, st.w, 6);
      ctx.strokeRect(st.x, st.y + st.h - 6, st.w, 6);

      if (snapped) {
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#f43f5e';
        const teeth = Math.max(3, Math.floor(st.w / 11));
        const tw = st.w / teeth;
        for (let k = 0; k < teeth; k++) {
          ctx.beginPath();
          ctx.moveTo(st.x + k * tw, st.y + st.h - 4);
          ctx.lineTo(st.x + (k + 0.5) * tw, st.y);
          ctx.lineTo(st.x + (k + 1) * tw, st.y + st.h - 4);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        ctx.fillStyle = preWarn ? '#fde047' : '#6ee7b7';
        ctx.beginPath();
        ctx.arc(st.x + st.w * 0.5, st.y + st.h - 9, preWarn ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderSporeJets() {
    const ctx = this.ctx;
    for (const sj of this.level.sporeJets) {
      if (sj.x + sj.range < this.camX - 60 || sj.x - sj.range > this.camX + this.viewW + 60) continue;
      const cyc = sj.cyclePeriod || 3.0;
      const t = (((this.worldTime + sj.phase) % cyc) + cyc) % cyc;
      const active = t >= cyc - sj.activeDuration;
      const preWarn = !active && t >= cyc - sj.activeDuration - 0.52;
      const r = this.getSporeJetRect(sj);

      ctx.save();
      if (active) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 14;
        ctx.fillStyle = 'rgba(74, 222, 128, 0.55)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = '#bbf7d0';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      } else if (preWarn) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.78)';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = active ? '#bbf7d0' : '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sj.x, sj.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderBloomBridges() {
    const ctx = this.ctx;
    for (const bb of this.level.bloomBridges) {
      if (
        Math.max(bb.triggerX, bb.bridgeX + bb.bridgeW) < this.camX - 60 ||
        Math.min(bb.triggerX, bb.bridgeX) > this.camX + this.viewW + 60
      ) {
        continue;
      }
      ctx.save();
      // Bud trigger
      ctx.shadowColor = bb.active ? '#6ee7b7' : '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fillStyle = bb.active ? '#10b981' : '#065f46';
      ctx.strokeStyle = bb.active ? '#a7f3d0' : '#fde047';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(bb.triggerX, bb.triggerY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bridge surface
      if (bb.active) {
        const ratio = Math.max(0, Math.min(1, bb.timer / (bb.duration || 4)));
        ctx.globalAlpha = ratio < 0.25 ? 0.45 + 0.5 * Math.abs(Math.sin(this.worldTime * 24)) : 0.95;
        ctx.fillStyle = '#065f46';
        ctx.fillRect(bb.bridgeX, bb.bridgeY, bb.bridgeW, bb.bridgeH);
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2;
        ctx.strokeRect(bb.bridgeX, bb.bridgeY, bb.bridgeW, bb.bridgeH);
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(bb.bridgeX + 4, bb.bridgeY + 2, (bb.bridgeW - 8) * ratio, 3);
      } else {
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(bb.bridgeX, bb.bridgeY, bb.bridgeW, bb.bridgeH);
      }
      ctx.restore();
    }
  }

  private renderScythePendulums() {
    const ctx = this.ctx;
    for (const sc of this.level.scythePendulums) {
      if (sc.cx + sc.length < this.camX - 60 || sc.cx - sc.length > this.camX + this.viewW + 60) continue;
      const ang = Math.sin(this.worldTime * sc.speed + sc.phase) * sc.maxAngle;
      const bx = sc.cx + Math.sin(ang) * sc.length;
      const by = sc.cy + Math.cos(ang) * sc.length;

      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sc.cx, sc.cy);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sc.cx, sc.cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.translate(bx, by);
      ctx.rotate(-ang);
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 23, Math.PI * 0.15, Math.PI * 0.85, false);
      ctx.arc(0, -10, 20, Math.PI * 0.82, Math.PI * 0.18, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderLightningStrikes() {
    const ctx = this.ctx;
    for (const st of this.activeLightningStrikes) {
      if (st.x < this.camX - 80 || st.x > this.camX + this.viewW + 80) continue;
      ctx.save();
      const skyTopY = Math.min(0, this.camY - 30);
      const col = st.color ?? '#facc15';
      const isCrimson = col === '#f43f5e' || col === '#fb7185' || col === '#ef4444';
      const isIce = !isCrimson && Boolean(st.color);
      if (!st.struck) {
        const progress = 1 - Math.max(0, st.timer / st.warnDuration);
        const pulse = 0.35 + 0.55 * Math.abs(Math.sin(this.worldTime * (8 + progress * 20)));
        ctx.strokeStyle = isCrimson
          ? `rgba(251, 113, 133, ${pulse.toFixed(2)})`
          : isIce
            ? `rgba(125, 211, 252, ${pulse.toFixed(2)})`
            : `rgba(254, 240, 138, ${pulse.toFixed(2)})`;
        ctx.lineWidth = 2 + progress * 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(st.x, skyTopY);
        ctx.lineTo(st.x, st.floorY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = isCrimson
          ? `rgba(244, 63, 94, ${(0.24 + progress * 0.48).toFixed(2)})`
          : isIce
            ? `rgba(56, 189, 248, ${(0.22 + progress * 0.45).toFixed(2)})`
            : `rgba(250, 204, 21, ${(0.22 + progress * 0.45).toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(st.x, st.floorY, st.strikeRadius, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const alpha = Math.max(0, st.strikeLife / 0.32);
        ctx.globalAlpha = alpha;
        ctx.shadowColor = col;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = isCrimson ? '#ffe4e6' : isIce ? '#e0f2fe' : '#ffffff';
        ctx.lineWidth = isCrimson || isIce ? 10 : 8;
        ctx.beginPath();
        ctx.moveTo(st.x, skyTopY);
        let curY = skyTopY;
        while (curY < st.floorY) {
          curY += 32;
          ctx.lineTo(st.x + (Math.random() - 0.5) * (isIce || isCrimson ? 12 : 22), Math.min(st.floorY, curY));
        }
        ctx.stroke();
        ctx.strokeStyle = col;
        ctx.lineWidth = 15;
        ctx.globalAlpha = alpha * 0.38;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderGroundSpikes() {
    const ctx = this.ctx;
    for (const sp of this.activeGroundSpikes) {
      if (sp.x < this.camX - 80 || sp.x > this.camX + this.viewW + 80) continue;
      ctx.save();
      const isCrimson = sp.color === '#f43f5e' || sp.color === '#fb7185' || sp.color === '#ef4444';
      const isIce = sp.color === '#7dd3fc' || sp.color === '#38bdf8';
      if (!sp.erupted) {
        const progress = 1 - Math.max(0, sp.timer / sp.warnDuration);
        const pulse = 0.35 + 0.5 * Math.abs(Math.sin(this.worldTime * (9 + progress * 18)));
        ctx.strokeStyle = isCrimson
          ? `rgba(251, 113, 133, ${pulse.toFixed(2)})`
          : isIce
            ? `rgba(125, 211, 252, ${pulse.toFixed(2)})`
            : `rgba(74, 222, 128, ${pulse.toFixed(2)})`;
        ctx.lineWidth = 2 + progress * 3;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.floorY);
        ctx.lineTo(sp.x, sp.floorY - 120);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = isCrimson
          ? `rgba(244, 63, 94, ${(0.28 + progress * 0.45).toFixed(2)})`
          : isIce
            ? `rgba(56, 189, 248, ${(0.28 + progress * 0.45).toFixed(2)})`
            : `rgba(52, 211, 153, ${(0.28 + progress * 0.45).toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.floorY, sp.radius, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const alpha = Math.max(0, sp.life / 0.42);
        ctx.globalAlpha = alpha;
        ctx.shadowColor = isIce ? '#7dd3fc' : '#34d399';
        ctx.shadowBlur = 14;
        ctx.fillStyle = isCrimson ? '#be123c' : isIce ? '#0284c7' : '#10b981';
        ctx.strokeStyle = isCrimson ? '#fecdd3' : isIce ? '#e0f2fe' : '#a7f3d0';
        ctx.lineWidth = 2;
        for (const off of [-10, 0, 10]) {
          const h = off === 0 ? 112 : 76;
          ctx.beginPath();
          ctx.moveTo(sp.x + off - 7, sp.floorY);
          ctx.lineTo(sp.x + off, sp.floorY - h);
          ctx.lineTo(sp.x + off + 7, sp.floorY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  private renderCannons() {
    const ctx = this.ctx;
    for (const can of this.level.cannons) {
      if (can.x < this.camX - 60 || can.x > this.camX + this.viewW + 60) continue;
      ctx.save();
      ctx.translate(can.x, can.y + 14);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-12, 0, 24, 14);
      ctx.rotate(can.angle * can.dir);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.5;
      ctx.fillRect(can.dir > 0 ? -4 : -22, -10, 26, 16);
      ctx.strokeRect(can.dir > 0 ? -4 : -22, -10, 26, 16);
      ctx.restore();
    }
  }

  private renderMirrors() {
    const ctx = this.ctx;
    for (const m of this.level.mirrors) {
      if (m.x < this.camX - 60 || m.x > this.camX + this.viewW + 60) continue;
      ctx.save();
      ctx.shadowColor = m.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(m.x, m.y, m.w, m.h, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `${m.color}44`;
      ctx.beginPath();
      ctx.roundRect(m.x + 4, m.y + 5, m.w - 8, m.h - 10, 8);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderSealBlocks() {
    const ctx = this.ctx;
    for (const sb of this.level.sealBlocks) {
      if (sb.broken) continue;
      if (sb.x + sb.w < this.camX - 40 || sb.x > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.fillStyle = 'rgba(88, 28, 135, 0.55)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
      ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
      ctx.restore();
    }
  }

  private renderSwitches() {
    const ctx = this.ctx;
    for (const sw of this.level.switches) {
      if (sw.x < this.camX - 60 || sw.x > this.camX + this.viewW + 60) continue;
      ctx.save();
      ctx.translate(sw.x, sw.y);
      if (sw.chrono) {
        const cooling = Boolean(sw.cooldown && sw.cooldown > 0);
        const color = cooling ? '#fde047' : '#38f2ff';
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, sw.r + 4, 0, Math.PI * 2);
        ctx.stroke();
        // Clock hands
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -sw.r * 0.65);
        ctx.moveTo(0, 0);
        ctx.lineTo(sw.r * 0.45, 2);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      const color = sw.activated ? '#34d399' : '#38f2ff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.rotate(this.worldTime * (sw.activated ? 2.8 : 1.2));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, sw.r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = sw.activated ? '#6ee7b7' : '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(0, -sw.r * 0.8);
      ctx.lineTo(sw.r * 0.65, 0);
      ctx.lineTo(0, sw.r * 0.8);
      ctx.lineTo(-sw.r * 0.65, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  private renderGoalGates() {
    if (this.level.boss && !this.level.boss.defeated) return;
    const ctx = this.ctx;
    const p = this.player;
    const pcx = p.x + p.w * 0.5;
    const pcy = p.y + p.h * 0.5;
    const drawGate = (g: { x: number; y: number; w: number; h: number }, color: string, isSecret: boolean) => {
      if (g.x + g.w < this.camX - 80 || g.x > this.camX + this.viewW + 80) return;
      const nearSecret = !isSecret || Math.hypot(pcx - (g.x + g.w * 0.5), pcy - (g.y + g.h * 0.5)) < 240;
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(g.x, g.y, 8, g.h);
      ctx.fillRect(g.x + g.w - 8, g.y, 8, g.h);
      ctx.fillRect(g.x - 4, g.y - 8, g.w + 8, 12);

      ctx.fillStyle = `${color}55`;
      ctx.fillRect(g.x + 8, g.y + 4, g.w - 16, g.h - 4);

      const wave = Math.sin(this.worldTime * 4) * 3;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(g.x + g.w * 0.5, g.y - 38);
      ctx.lineTo(g.x + g.w * 0.5 + 32, g.y - 28 + wave);
      ctx.lineTo(g.x + g.w * 0.5, g.y - 18);
      ctx.closePath();
      ctx.fill();

      if (nearSecret) {
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isSecret ? '★ SECRET WARP' : 'GOAL', g.x + g.w * 0.5, g.y - 44);
      }
      ctx.restore();
    };

    drawGate(this.level.goal, '#34d399', false);
    if (this.level.secretGoal) drawGate(this.level.secretGoal, '#fbbf24', true);
  }

  private renderOrbs() {
    const ctx = this.ctx;
    for (const orb of this.level.orbs) {
      if (orb.collected) continue;
      if (orb.afterBoss && this.level.boss && !this.level.boss.defeated) continue;
      if (orb.x < this.camX - 30 || orb.x > this.camX + this.viewW + 30) continue;
      const oy = orb.y + Math.sin(orb.phase) * 3;
      const color = orb.bonus ? '#fbbf24' : '#38f2ff';
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(orb.x, oy, orb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(orb.x - 2, oy - 2, orb.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderEnemies() {
    const ctx = this.ctx;
    for (const en of this.level.enemies) {
      if (!en.alive) continue;
      if (en.x + en.w < this.camX - 60 || en.x > this.camX + this.viewW + 60) continue;

      const cx = en.x + en.w * 0.5;
      const cy = en.y + en.h * 0.5;
      const flash = (en.hitFlash ?? 0) > 0;

      ctx.save();
      switch (en.kind) {
        case 'patrol_drone': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(cx + en.facing * 6, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'hopping_bot': {
          ctx.fillStyle = flash ? '#ffffff' : '#0f766e';
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h - 5, 6);
          ctx.fill();
          ctx.stroke();
          // Spring legs
          ctx.strokeStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(cx - 5, en.y + en.h - 5);
          ctx.lineTo(cx - 5, en.y + en.h);
          ctx.moveTo(cx + 5, en.y + en.h - 5);
          ctx.lineTo(cx + 5, en.y + en.h);
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.fillRect(cx + en.facing * 4 - 2, en.y + 7, 5, 4);
          break;
        }
        case 'shield_trooper': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = '#94a3b8';
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 5);
          ctx.fill();
          ctx.stroke();
          // Glowing front energy shield!
          const sx = en.facing > 0 ? en.x + en.w + 2 : en.x - 6;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.fillRect(sx, en.y + 3, 4, en.h - 6);
          break;
        }
        case 'sniper_turret': {
          // Red targeting laser sight!
          if ((en.aimTimer ?? 0) > 0.25) {
            ctx.strokeStyle = `rgba(244, 63, 94, ${Math.min(0.85, (en.aimTimer ?? 0) * 0.7)})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5);
            ctx.stroke();
          }
          ctx.fillStyle = flash ? '#ffffff' : '#334155';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'slime_glitch': {
          const jitter = Math.sin(this.worldTime * 30 + en.x) * 1.5;
          ctx.fillStyle = flash ? '#ffffff' : '#9333ea';
          ctx.strokeStyle = '#e879f9';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx + jitter, en.y + en.h, en.w * 0.5, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#38f2ff';
          ctx.fillRect(cx - 5 + en.facing * 3, en.y + en.h - 9, 3, 3);
          ctx.fillRect(cx + 2 + en.facing * 3, en.y + en.h - 9, 3, 3);
          break;
        }
        case 'ghost_wisp': {
          ctx.shadowColor = '#38f2ff';
          ctx.shadowBlur = 12;
          ctx.fillStyle = flash ? '#ffffff' : 'rgba(56, 242, 255, 0.72)';
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(cx - 5 + en.facing * 2, cy - 2, 3, 4);
          ctx.fillRect(cx + 2 + en.facing * 2, cy - 2, 3, 4);
          break;
        }
        case 'bulldozer_mech': {
          ctx.fillStyle = flash ? '#ffffff' : '#b45309';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h - 4, 5);
          ctx.fill();
          ctx.stroke();
          // Dozer blade
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(en.facing > 0 ? en.x + en.w - 2 : en.x - 5, en.y + 6, 7, en.h - 10);
          if (en.chargeState === 'warn') {
            ctx.fillStyle = '#f43f5e';
            ctx.font = '700 14px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', cx, en.y - 8);
          }
          break;
        }
        case 'bomb_walker': {
          const blink = en.primed && Math.floor(this.worldTime * 18) % 2 === 0;
          ctx.fillStyle = blink ? '#f43f5e' : '#1e293b';
          ctx.strokeStyle = en.primed ? '#fb7185' : '#f97316';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.arc(cx, en.y - 2, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'arcane_caster': {
          ctx.fillStyle = flash ? '#ffffff' : '#3b0764';
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, en.y + en.h);
          ctx.lineTo(en.x, en.y + en.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
          ctx.beginPath();
          ctx.arc(cx + en.facing * 15, en.y + 14, 7, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'neon_bat': {
          const flap = Math.sin(this.worldTime * 18) * 5;
          ctx.fillStyle = flash ? '#ffffff' : '#ec4899';
          ctx.beginPath();
          ctx.moveTo(cx - 14, cy - flap);
          ctx.lineTo(cx, cy + 4);
          ctx.lineTo(cx + 14, cy - flap);
          ctx.lineTo(cx + 5, cy + 8);
          ctx.lineTo(cx - 5, cy + 8);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#38f2ff';
          ctx.fillRect(cx - 4, cy, 3, 3);
          ctx.fillRect(cx + 1, cy, 3, 3);
          break;
        }
        case 'skate_courier': {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(en.x - 2, en.y + en.h - 4, en.w + 4, 4);
          ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
          ctx.strokeStyle = '#38f2ff';
          ctx.lineWidth = 1.5;
          ctx.fillRect(en.x + 3, en.y, en.w - 6, en.h - 5);
          ctx.strokeRect(en.x + 3, en.y, en.w - 6, en.h - 5);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(cx + en.facing * 2, en.y + 5, 7, 4);
          break;
        }
        case 'riot_baton': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e3a8a';
          ctx.strokeStyle = '#60a5fa';
          ctx.fillRect(en.x + 2, en.y, en.w - 4, en.h);
          ctx.strokeRect(en.x + 2, en.y, en.w - 4, en.h);
          ctx.strokeStyle = '#38f2ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + en.facing * 18, cy - 10);
          ctx.stroke();
          break;
        }
        case 'volt_jelly': {
          ctx.fillStyle = flash ? '#ffffff' : 'rgba(250, 204, 21, 0.85)';
          ctx.beginPath();
          ctx.arc(cx, cy - 2, 12, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.8;
          for (const tx of [-7, 0, 7]) {
            ctx.beginPath();
            ctx.moveTo(cx + tx, cy - 2);
            ctx.lineTo(cx + tx + Math.sin(this.worldTime * 8 + tx) * 3, en.y + en.h);
            ctx.stroke();
          }
          break;
        }
        case 'rail_spider': {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 14, en.y + en.h);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + 14, en.y + en.h);
          ctx.stroke();
          ctx.fillStyle = flash ? '#ffffff' : '#3b0764';
          ctx.beginPath();
          ctx.arc(cx, cy, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(cx - 2, cy - 1, 4, 4);
          break;
        }
        case 'magnet_orb': {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI);
          ctx.stroke();
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx, cy, 12, Math.PI, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'prism_reflector': {
          ctx.fillStyle = flash ? '#ffffff' : '#0e7490';
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, cy);
          ctx.lineTo(cx, en.y + en.h);
          ctx.lineTo(en.x, cy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(en.facing > 0 ? en.x + en.w - 4 : en.x, en.y + 6, 4, en.h - 12);
          break;
        }
        case 'mortar_crab': {
          ctx.fillStyle = flash ? '#ffffff' : '#7c2d12';
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 3, en.w * 0.45, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(cx - 4, en.y, 8, 12);
          break;
        }
        case 'stealth_ninja': {
          ctx.globalAlpha = en.customAlpha ?? 0.4;
          ctx.fillStyle = flash ? '#ffffff' : '#1e1b4b';
          ctx.strokeStyle = '#818cf8';
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, en.y + en.h);
          ctx.lineTo(en.x, en.y + en.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#38f2ff';
          ctx.fillRect(cx + en.facing * 3 - 3, en.y + 8, 6, 3);
          break;
        }
        case 'saw_wheel': {
          ctx.translate(cx, cy);
          ctx.rotate(en.phase);
          ctx.fillStyle = '#be123c';
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let k = 0; k < 16; k++) {
            const ang = (k * Math.PI) / 8;
            const r = k % 2 === 0 ? 15 : 9;
            if (k === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
            else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'holo_decoy': {
          ctx.globalAlpha = 0.65 + 0.25 * Math.sin(en.phase);
          ctx.strokeStyle = '#38bdf8';
          ctx.setLineDash([3, 3]);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.strokeRect(en.x, en.y, en.w, en.h);
          ctx.setLineDash([]);
          break;
        }
        case 'cryo_slime': {
          ctx.fillStyle = flash ? '#ffffff' : '#2563eb';
          ctx.strokeStyle = '#93c5fd';
          ctx.beginPath();
          ctx.arc(cx, en.y + en.h, en.w * 0.5, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'arc_pylon': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = '#22d3ee';
          ctx.fillRect(en.x + 4, en.y + 8, en.w - 8, en.h - 8);
          ctx.strokeRect(en.x + 4, en.y + 8, en.w - 8, en.h - 8);
          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(cx, en.y + 7, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'grimoire_mimic': {
          ctx.fillStyle = flash ? '#ffffff' : '#78350f';
          ctx.strokeStyle = '#fbbf24';
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.strokeRect(en.x, en.y, en.w, en.h);
          if (en.chargeState === 'charge') {
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(cx, cy - 3, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'rune_sentinel': {
          ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.strokeRect(en.x, en.y, en.w, en.h);
          ctx.fillStyle = '#6ee7b7';
          ctx.fillRect(cx - 4, cy - 8, 8, 16);
          break;
        }
        case 'mirror_wraith': {
          ctx.fillStyle = flash ? '#ffffff' : 'rgba(226, 232, 240, 0.35)';
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#38f2ff';
          ctx.beginPath();
          ctx.arc(cx, cy - 4, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'chrono_pendulum': {
          const ax = en.anchorX ?? 560;
          const ay = en.anchorY ?? 48;
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.fillStyle = '#b45309';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'gravity_imp': {
          ctx.fillStyle = flash ? '#ffffff' : '#4c1d95';
          ctx.strokeStyle = '#a78bfa';
          ctx.beginPath();
          ctx.arc(cx, cy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx - 4, cy - 2, 3, 3);
          ctx.fillRect(cx + 2, cy - 2, 3, 3);
          break;
        }
        case 'ink_specter': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e1b4b';
          ctx.strokeStyle = '#6366f1';
          ctx.beginPath();
          ctx.arc(cx, cy - 3, 11, Math.PI, 0);
          ctx.lineTo(en.x + en.w, en.y + en.h);
          ctx.lineTo(en.x, en.y + en.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'star_weaver': {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1.6;
          ctx.fillStyle = flash ? '#ffffff' : 'rgba(250, 204, 21, 0.28)';
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#38f2ff';
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'golem_knight': {
          ctx.fillStyle = flash ? '#ffffff' : '#334155';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.strokeRect(en.x, en.y, en.w, en.h);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(en.x + 6, en.y + 8, en.w - 12, 4);
          break;
        }
        case 'mana_leech': {
          ctx.fillStyle = flash ? '#ffffff' : '#86198f';
          ctx.strokeStyle = '#e879f9';
          ctx.beginPath();
          ctx.ellipse(cx, cy, 13, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'sigil_bomber': {
          ctx.fillStyle = flash ? '#ffffff' : '#4c0519';
          ctx.strokeStyle = '#fb7185';
          ctx.beginPath();
          ctx.moveTo(en.x, cy);
          ctx.lineTo(cx, en.y);
          ctx.lineTo(en.x + en.w, cy);
          ctx.lineTo(cx, en.y + en.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'void_eye': {
          ctx.fillStyle = flash ? '#ffffff' : en.invulnMode ? '#334155' : '#1e1b4b';
          ctx.strokeStyle = en.invulnMode ? '#94a3b8' : '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 14, en.invulnMode ? 6 : 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (!en.invulnMode) {
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'flame_thruster': {
          ctx.fillStyle = flash ? '#ffffff' : '#7c2d12';
          ctx.strokeStyle = '#fb923c';
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.strokeRect(en.x, en.y, en.w, en.h);
          if (en.chargeState === 'charge') {
            ctx.fillStyle = '#fde047';
            ctx.fillRect(en.facing > 0 ? en.x - 10 : en.x + en.w, cy - 4, 10, 8);
          }
          break;
        }
        case 'jet_trooper': {
          ctx.fillStyle = flash ? '#ffffff' : '#0c4a6e';
          ctx.strokeStyle = '#38bdf8';
          ctx.fillRect(en.x + 3, en.y, en.w - 6, en.h);
          ctx.strokeRect(en.x + 3, en.y, en.w - 6, en.h);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(en.facing > 0 ? en.x - 2 : en.x + en.w - 3, en.y + 8, 5, 14);
          break;
        }
        case 'railgun_mech': {
          if ((en.aimTimer ?? 0) > 0.35) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${Math.min(0.9, (en.aimTimer ?? 0) * 0.55)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx, en.y + 14);
            ctx.lineTo(cx + en.facing * 520, en.y + 14);
            ctx.stroke();
          }
          ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.fillRect(en.x, en.y, en.w - 6, en.h);
          ctx.strokeRect(en.x, en.y, en.w - 6, en.h);
          ctx.fillStyle = '#38f2ff';
          ctx.fillRect(en.facing > 0 ? cx : en.x - 8, en.y + 11, 24, 6);
          break;
        }
        case 'aegis_drone': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          const rot = this.worldTime * 3.8;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 16, rot - 0.6, rot + 0.6);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, 16, rot + Math.PI - 0.6, rot + Math.PI + 0.6);
          ctx.stroke();
          break;
        }
        case 'cluster_mine': {
          ctx.fillStyle = flash ? '#ffffff' : '#450a0a';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(cx, cy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'vortex_fan': {
          ctx.fillStyle = flash ? '#ffffff' : '#134e4a';
          ctx.strokeStyle = '#2dd4bf';
          ctx.fillRect(en.x, en.y, en.w, en.h);
          ctx.strokeRect(en.x, en.y, en.w, en.h);
          ctx.translate(cx, cy);
          ctx.rotate(this.worldTime * 8);
          ctx.fillStyle = '#5eead4';
          ctx.fillRect(-10, -2, 20, 4);
          ctx.fillRect(-2, -10, 4, 20);
          break;
        }
        case 'plasma_hound': {
          ctx.fillStyle = flash ? '#ffffff' : '#3b0764';
          ctx.strokeStyle = '#c084fc';
          ctx.beginPath();
          ctx.roundRect(en.x, en.y + 4, en.w, en.h - 4, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#38f2ff';
          ctx.fillRect(en.facing > 0 ? en.x + en.w - 9 : en.x + 2, en.y + 2, 7, 6);
          break;
        }
        case 'drill_mole': {
          ctx.fillStyle = flash ? '#ffffff' : '#713f12';
          ctx.strokeStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(cx, en.y + en.h, 12, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(cx - 6, en.y + 10);
          ctx.lineTo(cx, en.y - 5);
          ctx.lineTo(cx + 6, en.y + 10);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'tesla_walker': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = '#38f2ff';
          ctx.fillRect(en.x + 3, en.y + 10, en.w - 6, en.h - 10);
          ctx.strokeRect(en.x + 3, en.y + 10, en.w - 6, en.h - 10);
          ctx.fillStyle = '#38f2ff';
          ctx.beginPath();
          ctx.arc(cx, en.y + 6, 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'phantom_knight': {
          ctx.fillStyle = flash ? '#ffffff' : '#2e1065';
          ctx.strokeStyle = '#a855f7';
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, en.y + en.h);
          ctx.lineTo(en.x, en.y + en.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + en.facing * 20, cy - 12);
          ctx.stroke();
          break;
        }
        case 'bio_spore': {
          ctx.fillStyle = flash ? '#ffffff' : '#14532d';
          ctx.strokeStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(cx, cy, 11, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#86efac';
          ctx.fillRect(cx - 2, cy, 4, 11);
          break;
        }
        case 'omega_drone': {
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(cx + en.facing * 6, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'gear_roller': {
          ctx.translate(cx, cy);
          ctx.rotate(en.phase);
          ctx.fillStyle = flash ? '#ffffff' : '#78350f';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          for (let k = 0; k < 12; k++) {
            const a = (k * Math.PI) / 6;
            const rad = k % 2 === 0 ? 15 : 10;
            if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
            else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'spark_jelly': {
          if (en.invulnMode) {
            ctx.shadowColor = '#fde047';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(cx, cy, 19, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = flash ? '#ffffff' : 'rgba(250, 204, 21, 0.88)';
          ctx.beginPath();
          ctx.arc(cx, cy - 2, 12, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.8;
          for (const tx of [-7, 0, 7]) {
            ctx.beginPath();
            ctx.moveTo(cx + tx, cy - 2);
            ctx.lineTo(cx + tx + Math.sin(this.worldTime * 11 + tx) * 4, en.y + en.h);
            ctx.stroke();
          }
          break;
        }
        case 'laser_drone': {
          if ((en.aimTimer ?? 0) > 0.1) {
            ctx.strokeStyle = `rgba(250, 204, 21, ${Math.min(0.9, (en.aimTimer ?? 0) * 1.4)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5);
            ctx.stroke();
          }
          ctx.fillStyle = flash ? '#ffffff' : '#1c1917';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(cx + en.facing * 5, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'thunder_imp': {
          ctx.fillStyle = flash ? '#ffffff' : '#451a03';
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, cy + 4);
          ctx.lineTo(cx, en.y + en.h);
          ctx.lineTo(en.x, cy + 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx - 4 + en.facing * 2, cy - 2, 3, 3);
          ctx.fillRect(cx + 2 + en.facing * 2, cy - 2, 3, 3);
          break;
        }
        case 'spring_bumper': {
          const squashed = en.subTimer && en.subTimer > 0 ? 5 : 0;
          ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.8;
          ctx.fillRect(en.x + 4, en.y + 8 + squashed, en.w - 8, en.h - 8 - squashed);
          ctx.strokeRect(en.x + 4, en.y + 8 + squashed, en.w - 8, en.h - 8 - squashed);
          ctx.fillStyle = '#6ee7b7';
          ctx.beginPath();
          ctx.roundRect(en.x, en.y + squashed, en.w, 8, 4);
          ctx.fill();
          break;
        }
        case 'magnet_crane': {
          const cycle = en.subTimer ?? 0;
          const beamTop = en.y + en.h;
          if (cycle < 1.55) {
            ctx.fillStyle = 'rgba(56, 242, 255, 0.16)';
            ctx.fillRect(cx - 28, beamTop, 56, 195);
            ctx.strokeStyle = 'rgba(56, 242, 255, 0.6)';
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(cx - 28, beamTop, 56, 195);
          } else if (cycle < 2.05) {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
            ctx.fillRect(cx - 28, beamTop, 56, 195);
          } else {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
            ctx.fillRect(cx - 28, beamTop, 56, 195);
            ctx.strokeStyle = '#fb7185';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 28, beamTop, 56, 195);
          }
          ctx.setLineDash([]);
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = cycle >= 2.05 ? '#f43f5e' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 6);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'mirror_gear': {
          const boostMode = en.chargeState === 'warn';
          ctx.translate(cx, cy);
          ctx.rotate(en.phase);
          ctx.fillStyle = flash ? '#ffffff' : boostMode ? '#713f12' : '#1e293b';
          ctx.strokeStyle = boostMode ? '#fef08a' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let k = 0; k < 12; k++) {
            const a = (k * Math.PI) / 6;
            const rad = k % 2 === 0 ? 16 : 11;
            if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
            else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = boostMode ? '#fde047' : '#fb7185';
          ctx.beginPath();
          ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'tether_spark': {
          const swingAng = Math.sin(en.phase) * 0.72;
          const cableLen = 84;
          const bx = cx + Math.sin(swingAng) * cableLen;
          const by = cy + Math.cos(swingAng) * cableLen;
          ctx.strokeStyle = '#fde047';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(bx, by);
          ctx.stroke();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(bx, by, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 6);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'gravity_flipper': {
          if ((en.subTimer ?? 0) >= 2.0) {
            const waveProg = ((en.subTimer ?? 2.0) - 2.0) / 0.6;
            ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - waveProg) * 0.85})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 24 + waveProg * 150, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = flash ? '#ffffff' : '#2e1065';
          ctx.strokeStyle = '#a78bfa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e9d5ff';
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'dash_rammer': {
          if (en.chargeState === 'warn') {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
            ctx.lineWidth = 2.4;
            ctx.setLineDash([7, 5]);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + en.facing * 260, cy);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.fillStyle = flash ? '#ffffff' : '#4c0519';
          ctx.strokeStyle = en.chargeState === 'charge' ? '#fde047' : '#fb7185';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(cx + en.facing * (en.w * 0.5 + 6), cy);
          ctx.lineTo(cx + en.facing * (en.w * 0.3), cy - 7);
          ctx.lineTo(cx + en.facing * (en.w * 0.3), cy + 7);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'thorn_weaver': {
          ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#a7f3d0';
          ctx.beginPath();
          ctx.arc(cx + en.facing * 5, cy - 2, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'emerald_mantis': {
          ctx.fillStyle = flash ? '#ffffff' : en.chargeState === 'warn' ? '#065f46' : '#052e16';
          ctx.strokeStyle = en.chargeState === 'warn' ? '#a7f3d0' : '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 6);
          ctx.fill();
          ctx.stroke();
          // Scythe arms
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(cx + en.facing * 6, cy);
          ctx.lineTo(cx + en.facing * 18, cy - 10);
          ctx.lineTo(cx + en.facing * 14, cy + 7);
          ctx.stroke();
          break;
        }
        case 'prism_spore': {
          ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          for (let k = 0; k < 3; k++) {
            const a = this.worldTime * 3.5 + (k * Math.PI * 2) / 3;
            ctx.fillStyle = '#a7f3d0';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'chrono_vine': {
          ctx.fillStyle = flash ? '#ffffff' : '#052e16';
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(cx, en.y + 8, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'bio_hydra': {
          ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#bef264';
          ctx.beginPath();
          ctx.arc(cx - 6, en.y + 9, 4, 0, Math.PI * 2);
          ctx.arc(cx + 6, en.y + 9, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'jade_sniper': {
          if ((en.aimTimer ?? 0) > 0) {
            ctx.strokeStyle = `rgba(110, 231, 183, ${Math.min(0.88, (1.1 - (en.aimTimer ?? 0)) * 0.9)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5);
            ctx.stroke();
          }
          ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, cy);
          ctx.lineTo(cx, en.y + en.h);
          ctx.lineTo(en.x, cy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'frost_wraith': {
          ctx.fillStyle = flash ? '#ffffff' : '#0c4a6e';
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, en.y);
          ctx.lineTo(en.x + en.w, cy);
          ctx.lineTo(cx, en.y + en.h);
          ctx.lineTo(en.x, cy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'icicle_bat': {
          const wing = Math.sin(en.phase * 2) * 5;
          ctx.fillStyle = flash ? '#ffffff' : '#0e3c68';
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy + 5);
          ctx.lineTo(en.x - 4, cy - 6 + wing);
          ctx.lineTo(cx, cy - 7);
          ctx.lineTo(en.x + en.w + 4, cy - 6 + wing);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(cx - 2, cy - 2, 4, 4);
          break;
        }
        case 'glacier_golem': {
          ctx.fillStyle = flash ? '#ffffff' : '#0f294a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(en.facing > 0 ? en.x + en.w - 3 : en.x - 3, en.y + 4, 6, en.h - 8);
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(cx + en.facing * 4 - 3, en.y + 9, 6, 4);
          break;
        }
        case 'cryo_turret': {
          ctx.fillStyle = flash ? '#ffffff' : '#164e63';
          ctx.strokeStyle = (en.aimTimer ?? 0) > 0 ? '#fde047' : '#7dd3fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, en.w * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'blizzard_fairy': {
          ctx.fillStyle = flash ? '#ffffff' : '#0284c7';
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(cx, cy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
          ctx.beginPath();
          ctx.ellipse(cx - 11, cy - 3, 7, 4, -0.4, 0, Math.PI * 2);
          ctx.ellipse(cx + 11, cy - 3, 7, 4, 0.4, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'ice_skater': {
          ctx.fillStyle = flash ? '#ffffff' : '#0c4a6e';
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h - 4, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(en.x + 2, en.y + en.h - 4, en.w - 4, 3);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(cx + en.facing * 5 - 2, en.y + 7, 5, 4);
          break;
        }
        case 'mirror_frost': {
          ctx.fillStyle = flash ? '#ffffff' : '#1e3a66';
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.w, en.h, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(en.facing > 0 ? en.x + en.w - 2 : en.x - 4, en.y + 2, 6, en.h - 4);
          break;
        }
        case 'permafrost_wyrm': {
          const burrowed = en.chargeState === 'patrol' || en.chargeState === 'recover';
          ctx.fillStyle = flash ? '#ffffff' : '#0c4a6e';
          ctx.strokeStyle = en.chargeState === 'warn' ? '#fde047' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x, burrowed ? en.baseY + en.h - 10 : en.y, en.w, burrowed ? 12 : en.h, 6);
          ctx.fill();
          ctx.stroke();
          break;
        }
      ctx.restore();
          break;
        }
      }
      ctx.restore();
    }
  }

  private renderBoss() {
    const boss = this.level.boss;
    if (!boss || boss.defeated) return;

    const ctx = this.ctx;
    const flash = boss.hitFlash > 0;

    ctx.save();
    if (boss.kind === 'mid_guardian') {
      ctx.fillStyle = flash ? '#ffffff' : '#271729';
      ctx.strokeStyle = boss.stunTimer > 0 ? '#38f2ff' : '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(boss.facing > 0 ? boss.x + 6 : boss.x + boss.w - 6, boss.y + 30, 6, 0, Math.PI * 2);
      ctx.fill();

      if (boss.stunTimer <= 0) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.fillRect(boss.facing > 0 ? boss.x + boss.w + 3 : boss.x - 9, boss.y + 6, 6, boss.h - 12);
      }
    } else if (boss.kind === 'clockwork_core') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'laser_spin') {
        const spinBase = this.worldTime * (boss.phase === 2 ? 1.55 : 1.15);
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 5;
        for (let k = 0; k < 4; k++) {
          const a = spinBase + (k * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * 195, cy + Math.sin(a) * 195);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.worldTime * 2.2);
      ctx.fillStyle = flash ? '#ffffff' : '#451a03';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8;
        const rad = k % 2 === 0 ? 36 : 26;
        if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'thunder_kronos') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;

      // Form 2/3 Blitz Rail Lock Sight Line
      if (boss.state === 'blitz_warn') {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 20, cy);
        ctx.lineTo(boss.arenaMaxX - 20, cy);
        ctx.stroke();
        ctx.restore();
      }

      // Form 3 Rotating Twin Thunder Sweep Beams
      if (boss.state === 'tempest_sweep') {
        const sweepBase = this.worldTime * 0.95;
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 5.5;
        for (let k = 0; k < 2; k++) {
          const a = sweepBase + k * Math.PI;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * 480, cy + Math.sin(a) * 480);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Orbiting Gear Funnels
      for (const fn of boss.clones) {
        ctx.save();
        ctx.translate(fn.x, fn.y);
        ctx.rotate(-this.worldTime * 4);
        ctx.fillStyle = '#451a03';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 10; k++) {
          const a = (k * Math.PI) / 5;
          const rad = k % 2 === 0 ? 15 : 10;
          if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.shadowColor = boss.phase === 3 ? '#fb7185' : '#facc15';
      ctx.shadowBlur = 18;
      ctx.fillStyle = flash ? '#ffffff' : boss.phase === 3 ? '#3b0712' : '#291504';
      ctx.strokeStyle = boss.phase === 3 ? '#fb7185' : boss.phase === 2 ? '#fb923c' : '#facc15';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 12);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.worldTime * (2.2 + boss.phase * 0.7));
      ctx.strokeStyle = boss.phase === 3 ? 'rgba(251, 113, 133, 0.85)' : 'rgba(254, 240, 138, 0.75)';
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'overlord_core') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 18;
      ctx.fillStyle = flash ? '#ffffff' : '#090d24';
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, boss.y - 4);
      ctx.lineTo(boss.x + boss.w + 4, cy);
      ctx.lineTo(cx, boss.y + boss.h + 4);
      ctx.lineTo(boss.x - 4, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-this.worldTime * 3);
      ctx.strokeStyle = '#f43f5e';
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'iron_goliath') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'charge_warn') {
        ctx.save();
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 12, cy);
        ctx.lineTo(boss.arenaMaxX - 12, cy);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = flash ? '#ffffff' : '#1e293b';
      ctx.strokeStyle = boss.state === 'charge' || boss.state === 'charge_warn' ? '#fb7185' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(cx + boss.facing * 8 - 6, cy - 10, 12, 6);
    } else if (boss.kind === 'volt_centurion') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'volt_warn') {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.6;
        ctx.setLineDash([9, 5]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 14, cy);
        ctx.lineTo(boss.arenaMaxX - 14, cy);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.fillStyle = flash ? '#ffffff' : '#3b2404';
      ctx.strokeStyle = boss.state === 'volt_warn' || boss.state === 'volt_dash' ? '#fef08a' : '#facc15';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, boss.y - 4);
      ctx.lineTo(boss.x + boss.w + 4, cy);
      ctx.lineTo(cx, boss.y + boss.h + 4);
      ctx.lineTo(boss.x - 4, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'emerald_stalker') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'stalk_warn') {
        ctx.save();
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 12, cy);
        ctx.lineTo(boss.arenaMaxX - 12, cy);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 14;
      ctx.fillStyle = flash ? '#ffffff' : '#052e16';
      ctx.strokeStyle = boss.state === 'stalk_warn' || boss.state === 'stalk_charge' ? '#fde047' : '#34d399';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(cx + boss.facing * 8, cy - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'verdant_warden') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'warden_warn') {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.8;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 24, cy);
        ctx.lineTo(boss.arenaMaxX - 24, cy);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
      ctx.fillStyle = flash ? '#ffffff' : '#064e3b';
      ctx.strokeStyle = boss.state === 'warden_warn' || boss.state === 'warden_charge' ? '#fde047' : boss.phase === 2 ? '#a7f3d0' : '#34d399';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'jade_chimera') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'dive_warn') {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.6;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 18;
      ctx.fillStyle = flash ? '#ffffff' : '#052e16';
      ctx.strokeStyle = boss.state === 'dive_warn' ? '#fde047' : '#34d399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(boss.x, cy);
      ctx.lineTo(cx - 12, boss.y);
      ctx.lineTo(cx + 12, boss.y);
      ctx.lineTo(boss.x + boss.w, cy);
      ctx.lineTo(cx + 14, boss.y + boss.h);
      ctx.lineTo(cx - 14, boss.y + boss.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(cx - 11, cy - 4, 5, 0, Math.PI * 2);
      ctx.arc(cx + 11, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'emerald_emperor') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'emperor_warn') {
        ctx.save();
        ctx.strokeStyle = '#a7f3d0';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 24, cy);
        ctx.lineTo(boss.arenaMaxX - 24, cy);
        ctx.stroke();
        ctx.restore();
      }
      // Blooming Lotus Pod Orbiters (distinct organic petals vs W2 clockwork gears)
      for (const fn of boss.clones) {
        ctx.save();
        ctx.translate(fn.x, fn.y);
        ctx.rotate(this.worldTime * 2.2);
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 1.8;
        for (let pIdx = 0; pIdx < 4; pIdx++) {
          ctx.save();
          ctx.rotate((pIdx * Math.PI) / 2);
          ctx.beginPath();
          ctx.ellipse(0, -8, 4.5, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.shadowColor = boss.phase === 3 ? '#6ee7b7' : '#34d399';
      ctx.shadowBlur = 20;
      ctx.fillStyle = flash ? '#ffffff' : boss.phase === 3 ? '#022c22' : '#064e3b';
      ctx.strokeStyle = boss.state === 'emperor_warn' ? '#fde047' : boss.phase === 3 ? '#a7f3d0' : '#34d399';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'frost_titan') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'titan_warn') {
        ctx.save();
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2.6;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 18, cy);
        ctx.lineTo(boss.arenaMaxX - 18, cy);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = flash ? '#ffffff' : '#0c2748';
      ctx.strokeStyle = boss.state === 'titan_warn' || boss.state === 'titan_charge' ? '#fde047' : '#7dd3fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(cx + boss.facing * 8 - 6, cy - 10, 12, 6);
    } else if (boss.kind === 'glacia_knight') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'warn') {
        ctx.save();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2.8;
        ctx.setLineDash([9, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 20, cy);
        ctx.lineTo(boss.arenaMaxX - 20, cy);
        ctx.stroke();
        ctx.restore();
      }
      if (boss.state === 'wall_cling') {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + boss.facing * 380, boss.floorY - 24);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 16;
      ctx.fillStyle = flash ? '#ffffff' : '#0b2244';
      ctx.strokeStyle = boss.phase === 2 ? '#e0f2fe' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 8);
      ctx.fill();
      ctx.stroke();
      if (boss.state === 'guard') {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
        ctx.fillRect(boss.facing > 0 ? boss.x + boss.w + 3 : boss.x - 9, boss.y + 6, 6, boss.h - 12);
      } else {
        // Cryo Lance Spear pointing forward in skate/wall-dive poses!
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + boss.facing * 38, cy + (boss.state === 'wall_dive' ? 14 : 0));
        ctx.stroke();
      }
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(cx + boss.facing * 6, cy - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'cocytus_core') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'star_spin') {
        const spinBase = this.worldTime * (boss.phase === 2 ? 1.15 : 0.86);
        ctx.save();
        ctx.strokeStyle = '#bae6fd';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4.5;
        for (let k = 0; k < 6; k++) {
          const a = spinBase + (k * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * 215, cy + Math.sin(a) * 215);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fillStyle = flash ? '#ffffff' : '#08203e';
      ctx.strokeStyle = boss.state === 'core_warn' ? '#fde047' : '#bae6fd';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, boss.y);
      ctx.lineTo(boss.x + boss.w, cy);
      ctx.lineTo(cx, boss.y + boss.h);
      ctx.lineTo(boss.x, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.kind === 'glacies_emperor') {
      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      if (boss.state === 'emperor_warn') {
        ctx.save();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(boss.arenaMinX + 24, cy);
        ctx.lineTo(boss.arenaMaxX - 24, cy);
        ctx.stroke();
        ctx.restore();
      }
      if (boss.state === 'x_warn') {
        ctx.save();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2.8;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(boss.facing > 0 ? boss.arenaMaxX - 24 : boss.arenaMinX + 24, boss.floorY - 26);
        ctx.stroke();
        ctx.restore();
      }
      // Hexagonal Cryo Mirror Prisms in Upper Corners
      for (const fn of boss.clones) {
        ctx.save();
        ctx.translate(fn.x, fn.y);
        ctx.fillStyle = '#082f49';
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3 + this.worldTime * 0.9;
          const rad = 16;
          if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 22;
      ctx.fillStyle = flash ? '#ffffff' : boss.phase === 3 ? '#082f49' : '#0c2748';
      ctx.strokeStyle = boss.phase === 3 ? '#e0f2fe' : '#7dd3fc';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {        if (boss.state === 'imperial_laser_warn' || boss.state === 'imperial_laser') {
          const baseRot = this.worldTime * 0.82;
          ctx.save();
          for (let k = 0; k < 4; k++) {
            const ang = baseRot + (k * Math.PI) / 2;
            const lx = cx + Math.cos(ang) * 230;
            const ly = cy + Math.sin(ang) * 230;
            if (boss.state === 'imperial_laser_warn') {
              ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
              ctx.lineWidth = 2.5;
              ctx.setLineDash([8, 6]);
            } else {
              ctx.strokeStyle = k % 2 === 0 ? '#f43f5e' : '#fde047';
              ctx.shadowColor = '#f43f5e';
              ctx.shadowBlur = 18;
              ctx.lineWidth = 8;
              ctx.setLineDash([]);
            }
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(lx, ly);
            ctx.stroke();
          }
          ctx.restore();
        }
        // Orbiting Imperial Blades
        for (const bl of boss.clones) {
          ctx.save();
          ctx.translate(bl.x, bl.y);
          ctx.rotate(this.worldTime * 3.5);
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(5, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.fillStyle = flash ? '#ffffff' : boss.phase === 3 ? '#2a040c' : '#3b0714';
        ctx.strokeStyle = boss.phase === 3 ? '#fde047' : '#fca5a5';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(cx, boss.y - 8);
        ctx.lineTo(boss.x + boss.w + 4, cy - 8);
        ctx.lineTo(boss.x + boss.w - 6, boss.y + boss.h);
        ctx.lineTo(boss.x + 6, boss.y + boss.h);
        ctx.lineTo(boss.x - 4, cy - 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (const cl of boss.clones) {
        ctx.save();
        ctx.globalAlpha = cl.alpha;
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = '#3b0764';
        ctx.beginPath();
        ctx.roundRect(cl.x - 18, cl.y - 24, 36, 48, 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      const cx = boss.x + boss.w * 0.5;
      const cy = boss.y + boss.h * 0.5;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 16;
      ctx.fillStyle = flash ? '#ffffff' : '#1e1038';
      ctx.strokeStyle = boss.phase === 3 ? '#f43f5e' : '#38f2ff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 12);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.worldTime * 2);
      ctx.strokeStyle = 'rgba(56, 242, 255, 0.6)';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Glowing arcane barrier walls isolating the Boss Arena during combat
    if (boss.active && !boss.defeated) {
      const pulse = 0.45 + 0.25 * Math.sin(this.worldTime * 6);
      const barColor =
        boss.kind === 'clockwork_core' || boss.kind === 'thunder_kronos' || boss.kind === 'volt_centurion'
          ? '#facc15'
          : boss.kind === 'verdant_warden' ||
              boss.kind === 'jade_chimera' ||
              boss.kind === 'emerald_emperor' ||
              boss.kind === 'emerald_stalker'
            ? '#34d399'
            : boss.kind === 'frost_titan' ||
                boss.kind === 'glacia_knight' ||
                boss.kind === 'cocytus_core' ||
                boss.kind === 'glacies_emperor'
              ? '#38bdf8'
              : boss.kind === 'archmage'
                ? '#c084fc'
                : '#f43f5e';
      for (const bx of [boss.arenaMinX, boss.arenaMaxX]) {
        ctx.save();
        ctx.strokeStyle = barColor;
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 14;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 4;
        const barTopY = boss.floorY - 450;
        ctx.beginPath();
        ctx.moveTo(bx, barTopY);
        ctx.lineTo(bx, boss.floorY);
        ctx.stroke();

        ctx.globalAlpha = pulse * 0.25;
        ctx.fillStyle = barColor;
        ctx.fillRect(bx - 3, barTopY, 6, 450);
        ctx.restore();
      }
    }
  }

  private renderPlayer() {
    const ctx = this.ctx;
    const p = this.player;
    if (p.invulnTimer > 0 && Math.floor(this.worldTime * 18) % 2 === 0) return;

    if (p.scarfNodes.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(p.scarfNodes[0].x, p.scarfNodes[0].y);
      for (let i = 1; i < p.scarfNodes.length; i++) ctx.lineTo(p.scarfNodes[i].x, p.scarfNodes[i].y);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.scarfNodes[1].x, p.scarfNodes[1].y);
      for (let i = 2; i < p.scarfNodes.length; i++) ctx.lineTo(p.scarfNodes[i].x, p.scarfNodes[i].y);
      ctx.stroke();
      ctx.restore();
    }

    const cx = p.x + p.w * 0.5;
    const bottomY = p.y + p.h;

    if (p.chillTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, bottomY - p.h * 0.5, 19, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(cx, bottomY);

    if (p.spinTimer > 0) {
      const progress = 1 - p.spinTimer / 0.3;
      ctx.translate(0, -p.h * 0.5);
      ctx.rotate(p.facing * progress * Math.PI * 2);
      ctx.translate(0, p.h * 0.5);
    }

    let lean = (p.vx / RUN_SPEED) * 0.14;
    if (p.onSlope) lean += Math.atan2(p.onSlope.y2 - p.onSlope.y1, p.onSlope.x2 - p.onSlope.x1) * 0.55;
    ctx.rotate(lean);
    ctx.scale(p.scaleX, p.scaleY);

    if (p.sliding) {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 15, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.facing * 8 - 3, -5, 8, 4);

      ctx.fillStyle = '#050814';
      ctx.beginPath();
      ctx.arc(p.facing * 4, -12, 7.5, 0, Math.PI * 2);
      ctx.fill();
      this.drawCyanEyes(ctx, p.facing * 6, -12, p.facing);
    } else {
      const stride = p.onGround ? Math.sin(p.runCycle) * 5.5 : 3.5;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6 + stride, -7, 6, 7);
      ctx.fillRect(1 - stride, -7, 6, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6 + stride, -2, 6, 2);
      ctx.fillRect(1 - stride, -2, 6, 2);

      ctx.fillStyle = '#151d30';
      ctx.strokeStyle = '#2d3b59';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-11, -7);
      ctx.lineTo(-9, -22);
      ctx.lineTo(9, -22);
      ctx.lineTo(11, -7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (p.castTimer > 0) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.facing > 0 ? 6 : -16, -20, 10, 5);
        ctx.fillStyle = '#38f2ff';
        ctx.beginPath();
        ctx.arc(p.facing * 16, -17.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#192238';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(0, -26, 12.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#141b2d';
      ctx.beginPath();
      ctx.moveTo(-p.facing * 6, -34);
      ctx.lineTo(-p.facing * 16, -27);
      ctx.lineTo(-p.facing * 9, -21);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#040711';
      ctx.beginPath();
      ctx.ellipse(p.facing * 2.5, -25.5, 8.2, 8.8, 0, 0, Math.PI * 2);
      ctx.fill();

      this.drawCyanEyes(ctx, p.facing * 3.5, -25.5, p.facing);
    }

    ctx.restore();
  }

  private drawCyanEyes(ctx: CanvasRenderingContext2D, cx: number, cy: number, facing: 1 | -1) {
    if (this.player.blinkTimer < 0) return;
    ctx.save();
    ctx.shadowColor = '#38f2ff';
    ctx.shadowBlur = 9;
    ctx.fillStyle = '#7ef9ff';
    const eyeOffset = facing * 1.4;
    ctx.beginPath();
    ctx.ellipse(cx - 2.6 + eyeOffset, cy, 1.8, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 2.6 + eyeOffset, cy, 1.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderProjectiles() {
    const ctx = this.ctx;
    for (const b of this.projectiles) {
      const col = b.color ?? (b.fromEnemy ? '#fb7185' : '#38f2ff');
      ctx.save();
      if (b.pauseTimer !== undefined && b.pauseTimer > 0 && b.pauseTargetX !== undefined && b.pauseTargetY !== undefined) {
        ctx.strokeStyle = `${col}88`;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.pauseTargetX, b.pauseTargetY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 4 + Math.sin(this.worldTime * 18) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (b.trail.length > 1) {
        ctx.strokeStyle = `${col}88`;
        ctx.lineWidth = b.shockwave ? 7 : 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) ctx.lineTo(b.trail[i].x, b.trail[i].y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.shadowColor = col;
      ctx.shadowBlur = 12;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderParticles() {
    const ctx = this.ctx;
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      if (pt.glow) {
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
      }
      if (pt.ring) {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, pt.size, pt.size * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderFloatingTexts() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  private renderSignatureGimmicks() {
    const ctx = this.ctx;

    // 1-1 Neon Turbo Pads
    for (const bp of this.level.boostPads ?? []) {
      if (bp.x + bp.w < this.camX - 40 || bp.x > this.camX + this.viewW + 40) continue;
      const dir = Math.sign(bp.boostVx) || 1;
      const shift = ((this.worldTime * 110 * dir) % 18 + 18) % 18;
      ctx.save();
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bp.x, bp.y, bp.w, bp.h);
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(bp.x, bp.y, bp.w, bp.h);
      ctx.beginPath();
      ctx.rect(bp.x + 2, bp.y, bp.w - 4, bp.h);
      ctx.clip();
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      for (let cx = bp.x - 18 + shift; cx < bp.x + bp.w + 18; cx += 18) {
        const my = bp.y + bp.h * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * dir, my - 3.5);
        ctx.lineTo(cx + 4 * dir, my);
        ctx.lineTo(cx - 5 * dir, my + 3.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2-1 Chrono Chime Speed Rings
    for (const cr of this.level.chimeRings ?? []) {
      if (cr.x + cr.r < this.camX - 40 || cr.x - cr.r > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = cr.cooldown && cr.cooldown > 0 ? '#fef08a' : '#facc15';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(cr.x, cr.y, cr.r * 0.65, cr.r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cr.x - 6, cr.y - 5);
      ctx.lineTo(cr.x + 7, cr.y);
      ctx.lineTo(cr.x - 6, cr.y + 5);
      ctx.stroke();
      ctx.restore();
    }

    // 3-1 Emerald Aero Wind Rings
    for (const wr of this.level.windRings ?? []) {
      if (wr.x + wr.r < this.camX - 40 || wr.x - wr.r > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(wr.x, wr.y, wr.r * 0.68, wr.r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(wr.x - 6, wr.y - 5);
      ctx.lineTo(wr.x + 8, wr.y);
      ctx.lineTo(wr.x - 6, wr.y + 5);
      ctx.stroke();
      ctx.restore();
    }

    // 3-2 Resonant Pollen Pods
    for (const pod of this.level.pollenPods ?? []) {
      if (pod.x + pod.r < this.camX - 40 || pod.x - pod.r > this.camX + this.viewW + 40) continue;
      ctx.save();
      if (pod.popped) {
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.32)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(pod.x, pod.y, pod.r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const pulse = 1 + Math.sin(this.worldTime * 6) * 0.08;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(pod.x, pod.y, pod.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(pod.x, pod.y, pod.r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3-3 Sinking Lotus Pads
    for (const lp of this.level.lotusPads ?? []) {
      if (lp.x + lp.w < this.camX - 40 || lp.x > this.camX + this.viewW + 40) continue;
      const ly = lp.y + (lp.sinkOffset ?? 0);
      ctx.save();
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(lp.x, ly, lp.w, lp.h, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(lp.x + 10, ly + 3, lp.w - 20, 3);
      ctx.restore();
    }

    // 3-FORT1 Fortress Thorn Pistons
    for (const tp of this.level.thornPistons ?? []) {
      if (tp.x + tp.w < this.camX - 40 || tp.x > this.camX + this.viewW + 40) continue;
      const drop = tp.currentDrop ?? 0;
      ctx.save();
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.fillRect(tp.x, tp.baseY, tp.w, Math.max(14, drop));
      ctx.strokeRect(tp.x, tp.baseY, tp.w, Math.max(14, drop));
      // Spike teeth along bottom edge
      const bot = tp.baseY + Math.max(14, drop);
      ctx.fillStyle = '#a7f3d0';
      for (let sx = tp.x + 4; sx < tp.x + tp.w - 4; sx += 12) {
        ctx.beginPath();
        ctx.moveTo(sx - 4, bot);
        ctx.lineTo(sx, bot + 8);
        ctx.lineTo(sx + 4, bot);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 3-4 Glow Lanterns
    for (const gl of this.level.glowLanterns ?? []) {
      if (gl.x + gl.r < this.camX - 40 || gl.x - gl.r > this.camX + this.viewW + 40) continue;
      const lit = (gl.litTimer ?? 0) > 0;
      ctx.save();
      ctx.shadowColor = lit ? '#a7f3d0' : '#34d399';
      ctx.shadowBlur = lit ? 18 : 8;
      ctx.fillStyle = lit ? '#34d399' : '#064e3b';
      ctx.strokeStyle = lit ? '#ecfdf5' : '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gl.x, gl.y, gl.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3-5 Orbital Platforms
    for (const op of this.level.orbitalPlatforms ?? []) {
      ctx.save();
      if (op.cx + op.rx >= this.camX - 40 && op.cx - op.rx <= this.camX + this.viewW + 40) {
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(op.cx, op.cy, op.rx, op.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(op.cx, op.cy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (op.x + op.w >= this.camX - 40 && op.x <= this.camX + this.viewW + 40) {
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 2;
        ctx.fillRect(op.x, op.y, op.w, op.h);
        ctx.strokeRect(op.x, op.y, op.w, op.h);
      }
      ctx.restore();
    }

    // 3-FORT2 Twin-Crystal Prism Barriers
    for (const cl of this.level.crystalLocks ?? []) {
      if (cl.unlocked) continue;
      ctx.save();
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cl.crystalX, cl.crystalY);
      ctx.lineTo(cl.barrierX + cl.barrierW * 0.5, cl.barrierY + cl.barrierH * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2.4;
      ctx.fillRect(cl.barrierX, cl.barrierY, cl.barrierW, cl.barrierH);
      ctx.strokeRect(cl.barrierX, cl.barrierY, cl.barrierW, cl.barrierH);

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(cl.crystalX, cl.crystalY - 14);
      ctx.lineTo(cl.crystalX + 12, cl.crystalY);
      ctx.lineTo(cl.crystalX, cl.crystalY + 14);
      ctx.lineTo(cl.crystalX - 12, cl.crystalY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3-6 Slipstream Leaf Gates
    for (const sg of this.level.slipstreamGates ?? []) {
      if (sg.x < this.camX - 40 || sg.x > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = sg.cooldown && sg.cooldown > 0 ? '#a7f3d0' : '#34d399';
      ctx.lineWidth = 3;
      ctx.strokeRect(sg.x - 10, sg.y, 20, sg.h);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
      ctx.fillRect(sg.x - 10, sg.y, 20, sg.h);
      ctx.restore();
    }

    // 3-7 Spiral Bloom Ascent Columns
    for (const sb of this.level.spiralBlooms ?? []) {
      ctx.save();
      ctx.shadowColor = '#6ee7b7';
      ctx.shadowBlur = 10;
      ctx.fillStyle = sb.active ? '#10b981' : '#065f46';
      ctx.strokeStyle = sb.active ? '#a7f3d0' : '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sb.triggerX, sb.triggerY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (sb.active) {
        const ratio = Math.max(0, Math.min(1, (sb.timer ?? 0) / (sb.duration || 8.5)));
        ctx.globalAlpha = ratio < 0.2 ? 0.5 + 0.5 * Math.abs(Math.sin(this.worldTime * 22)) : 0.95;
        for (let k = 0; k < sb.stepsCount; k++) {
          const sx = sb.triggerX + sb.stepOffsetX * (k + 1);
          const sy = sb.triggerY - sb.stepRiseY * (k + 1);
          ctx.fillStyle = '#065f46';
          ctx.fillRect(sx, sy, sb.stepW, 14);
          ctx.strokeStyle = '#6ee7b7';
          ctx.strokeRect(sx, sy, sb.stepW, 14);
        }
      }
      ctx.restore();
    }

    // 3-BOSS Sanctuary Gale Columns
    for (const gu of this.level.sanctuaryGusts ?? []) {
      if (gu.x + gu.w < this.camX - 40 || gu.x > this.camX + this.viewW + 40) continue;
      const cyc = gu.cyclePeriod || 4.0;
      const t = (((this.worldTime + gu.phase) % cyc) + cyc) % cyc;
      const active = t >= cyc - gu.activeDuration;
      ctx.save();
      ctx.fillStyle = active ? 'rgba(52, 211, 153, 0.22)' : 'rgba(52, 211, 153, 0.06)';
      ctx.fillRect(gu.x, gu.y, gu.w, gu.h);
      if (active) {
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.72)';
        ctx.lineWidth = 2;
        const shift = (this.worldTime * 190) % 36;
        for (let gy = gu.y + gu.h - shift; gy > gu.y; gy -= 36) {
          ctx.beginPath();
          ctx.moveTo(gu.x + 8, gy + 10);
          ctx.lineTo(gu.x + gu.w * 0.5, gy);
          ctx.lineTo(gu.x + gu.w - 8, gy + 10);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // World 4 Cryo Bumpers (4-2+)
    for (const cb of this.level.cryoBumpers ?? []) {
      if (cb.x + cb.r < this.camX - 40 || cb.x - cb.r > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = cb.cooldown && cb.cooldown > 0 ? 18 : 10;
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cb.x, cb.y, cb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(cb.x, cb.y, cb.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // World 4 Cryo Geysers (4-4+)
    for (const cg of this.level.cryoGeysers ?? []) {
      if (cg.x + cg.w < this.camX - 40 || cg.x > this.camX + this.viewW + 40) continue;
      const cyc = cg.cyclePeriod || 4.0;
      const t = (((this.worldTime + cg.phase) % cyc) + cyc) % cyc;
      const active = t >= cyc - cg.activeDuration;
      ctx.save();
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(cg.x, cg.y - 6, cg.w, 8);
      if (active) {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.25)';
        ctx.fillRect(cg.x, cg.y - cg.maxHeight, cg.w, cg.maxHeight);
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.72)';
        ctx.lineWidth = 1.8;
        const shift = (this.worldTime * 190) % 34;
        for (let gy = cg.y - shift; gy > cg.y - cg.maxHeight; gy -= 34) {
          ctx.beginPath();
          ctx.moveTo(cg.x + 6, gy + 8);
          ctx.lineTo(cg.x + cg.w * 0.5, gy);
          ctx.lineTo(cg.x + cg.w - 6, gy + 8);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // World 4 Freeze Beams
    for (const fb of this.level.freezeBeams ?? []) {
      const cyc = fb.cyclePeriod || 3.4;
      const t = (((this.worldTime + fb.phase) % cyc) + cyc) % cyc;
      const active = t >= cyc - fb.activeDuration;
      const warn = !active && t >= cyc - fb.activeDuration - 0.55;
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(fb.x1, fb.y1, 5, 0, Math.PI * 2);
      ctx.arc(fb.x2, fb.y2, 5, 0, Math.PI * 2);
      ctx.fill();
      if (active) {
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(fb.x1, fb.y1);
        ctx.lineTo(fb.x2, fb.y2);
        ctx.stroke();
      } else if (warn) {
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fb.x1, fb.y1);
        ctx.lineTo(fb.x2, fb.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // World 4 Falling Icicles
    for (const ic of this.level.fallingIcicles ?? []) {
      if (ic.broken) continue;
      const iy = ic.currY ?? ic.topY;
      const shake = (ic.warnTimer ?? 0) > 0 ? Math.sin(this.worldTime * 48) * 2.2 : 0;
      ctx.save();
      ctx.fillStyle = (ic.warnTimer ?? 0) > 0 ? '#e0f2fe' : '#7dd3fc';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(ic.x - 9 + shake, iy);
      ctx.lineTo(ic.x + 9 + shake, iy);
      ctx.lineTo(ic.x + shake, iy + 32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // World 4 Ice Pendulums
    for (const ip of this.level.icePendulums ?? []) {
      if (ip.cx < this.camX - 240 || ip.cx > this.camX + this.viewW + 240) continue;
      const ang = Math.sin(this.worldTime * ip.speed + ip.phase) * ip.maxAngle;
      const bx = ip.cx + Math.sin(ang) * ip.length;
      const by = ip.cy + Math.cos(ang) * ip.length;
      ctx.save();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ip.cx, ip.cy);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // World 4 Frost Mines
    for (const fm of this.level.frostMines ?? []) {
      if ((fm.cooldown && fm.cooldown > 0) || fm.x < this.camX - 40 || fm.x > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.fillStyle = fm.armed ? '#0284c7' : '#0c4a6e';
      ctx.strokeStyle = fm.armed && Math.floor(this.worldTime * 18) % 2 === 0 ? '#fde047' : '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fm.x, fm.y, fm.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // World 4 Phase Water Switches
    for (const pw of this.level.phaseWaterSwitches ?? []) {
      if (pw.x < this.camX - 40 || pw.x > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = pw.cooldown && pw.cooldown > 0 ? '#fde047' : '#bae6fd';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, pw.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(pw.x - 4, pw.y - 4, 8, 8);
      ctx.restore();
    }

    // World 4 Ice Mirrors (4-3 / 4-BOSS)
    for (const im of this.level.iceMirrors ?? []) {
      if (im.x + im.w < this.camX - 40 || im.x > this.camX + this.viewW + 40) continue;
      ctx.save();
      ctx.shadowColor = '#bae6fd';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.32)';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.4;
      ctx.fillRect(im.x, im.y, im.w, im.h);
      ctx.strokeRect(im.x, im.y, im.w, im.h);
      ctx.restore();
    }

    // World 4 Cryo Lanterns (4-5)
    for (const cl of this.level.cryoLanterns ?? []) {
      if (cl.x + cl.r < this.camX - 40 || cl.x - cl.r > this.camX + this.viewW + 40) continue;
      const lit = (cl.litTimer ?? 0) > 0;
      ctx.save();
      ctx.shadowColor = lit ? '#bae6fd' : '#38bdf8';
      ctx.shadowBlur = lit ? 18 : 8;
      ctx.fillStyle = lit ? '#38bdf8' : '#0c4a6e';
      ctx.strokeStyle = lit ? '#f0f9ff' : '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

  }

  private renderMetroDarkness() {
    const ctx = this.ctx;
    const lanternBoost = this.player.cavernLightTimer > 0 ? 115 : 0;
    const baseDark = (this.level.ambientDarkness ?? 0) * (1 - this.metroLightLevel * 0.72);
    if (baseDark <= 0.04) return;

    const px = this.player.x + this.player.w * 0.5 - this.camX;
    const py = this.player.y + this.player.h * 0.45 - this.camY;

    const grad = ctx.createRadialGradient(px, py, 35 + lanternBoost * 0.3, px, py, 240 + lanternBoost);
    grad.addColorStop(0, 'rgba(4, 7, 18, 0)');
    grad.addColorStop(0.55, `rgba(4, 7, 18, ${(baseDark * 0.55).toFixed(2)})`);
    grad.addColorStop(1, `rgba(4, 7, 18, ${baseDark.toFixed(2)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    // Glow Lantern Pools (3-4)
    for (const gl of this.level.glowLanterns ?? []) {
      if (!gl.litTimer || gl.litTimer <= 0) continue;
      const lx = gl.x - this.camX;
      const ly = gl.y - this.camY;
      if (lx < -180 || lx > this.viewW + 180) continue;
      const glow = ctx.createRadialGradient(lx, ly, 12, lx, ly, 165);
      glow.addColorStop(0, 'rgba(110, 231, 183, 0.24)');
      glow.addColorStop(1, 'rgba(110, 231, 183, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, ly, 165, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cryo Lantern Pools (4-5)
    for (const cl of this.level.cryoLanterns ?? []) {
      if (!cl.litTimer || cl.litTimer <= 0) continue;
      const lx = cl.x - this.camX;
      const ly = cl.y - this.camY;
      if (lx < -180 || lx > this.viewW + 180) continue;
      const glow = ctx.createRadialGradient(lx, ly, 12, lx, ly, 165);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, ly, 165, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderRain() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.34)';
    ctx.lineWidth = 1.2;
    for (const r of this.rainDrops) {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.len * 0.25, r.y + r.len);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderTouchFeedback() {
    const ctx = this.ctx;

    if (this.moveTouchId !== null) {
      const tp = this.touches.get(this.moveTouchId);
      if (tp) {
        const ox = this.screenToLogicalX(tp.originX);
        const oy = this.screenToLogicalY(tp.originY);
        const cx = this.screenToLogicalX(tp.currentX);
        const cy = this.screenToLogicalY(tp.currentY);

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 242, 255, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        ctx.translate(ox, oy);
        ctx.rotate(this.worldTime * 1.4);
        ctx.strokeStyle = 'rgba(56, 242, 255, 0.30)';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.5)';
        ctx.fillStyle = 'rgba(56, 242, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    for (const r of this.actionRipples) {
      const progress = 1 - r.life / r.maxLife;
      ctx.save();
      ctx.globalAlpha = (1 - progress) * 0.42;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 10 + progress * (r.kind === 'swipe' ? 28 : 20), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function makeMiniSlime(id: string, x: number, y: number, dir: -1 | 1, minX: number, maxX: number): EnemyDef {
  return {
    id,
    kind: 'slime_glitch',
    x,
    y,
    w: 18,
    h: 13,
    minX,
    maxX,
    vx: dir * 105,
    vy: -200,
    baseY: y + 3,
    facing: dir,
    hp: 1,
    alive: true,
    phase: 0,
    isMini: true,
  };
}
