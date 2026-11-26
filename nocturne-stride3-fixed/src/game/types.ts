export type GameScreen = 'TITLE' | 'WORLD_MAP' | 'STAGE' | 'ENEMY_LAB';

export type StageTheme =
  | 'neon_street'
  | 'metro_dark'
  | 'secret_vault'
  | 'sky_hologram'
  | 'fortress_alert'
  | 'rainy_arcade'
  | 'arcane_library'
  | 'monorail_rush'
  | 'airship_boss'
  | 'golden_clocktower'
  | 'gear_fortress'
  | 'thunder_highway'
  | 'thunder_airship'
  | 'emerald_canopy'
  | 'jade_labyrinth'
  | 'verdant_fortress'
  | 'bio_spire_sky'
  | 'frozen_harbor'
  | 'cryo_prism_maze'
  | 'blizzard_gorge'
  | 'glacial_fortress'
  | 'abyssal_trench'
  | 'frost_spire_citadel';

export type EnemyKind =
  | 'patrol_drone'
  | 'hopping_bot'
  | 'shield_trooper'
  | 'sniper_turret'
  | 'slime_glitch'
  | 'ghost_wisp'
  | 'bulldozer_mech'
  | 'bomb_walker'
  | 'arcane_caster'
  | 'neon_bat'
  | 'skate_courier'
  | 'riot_baton'
  | 'volt_jelly'
  | 'rail_spider'
  | 'magnet_orb'
  | 'prism_reflector'
  | 'mortar_crab'
  | 'stealth_ninja'
  | 'saw_wheel'
  | 'holo_decoy'
  | 'cryo_slime'
  | 'arc_pylon'
  | 'grimoire_mimic'
  | 'rune_sentinel'
  | 'mirror_wraith'
  | 'chrono_pendulum'
  | 'gravity_imp'
  | 'ink_specter'
  | 'star_weaver'
  | 'golem_knight'
  | 'mana_leech'
  | 'sigil_bomber'
  | 'void_eye'
  | 'flame_thruster'
  | 'jet_trooper'
  | 'railgun_mech'
  | 'aegis_drone'
  | 'cluster_mine'
  | 'vortex_fan'
  | 'plasma_hound'
  | 'drill_mole'
  | 'tesla_walker'
  | 'phantom_knight'
  | 'bio_spore'
  | 'omega_drone'
  | 'gear_roller'
  | 'spark_jelly'
  | 'laser_drone'
  | 'thunder_imp'
  | 'spring_bumper'
  | 'magnet_crane'
  | 'mirror_gear'
  | 'tether_spark'
  | 'gravity_flipper'
  | 'dash_rammer'
  | 'thorn_weaver'
  | 'emerald_mantis'
  | 'prism_spore'
  | 'chrono_vine'
  | 'bio_hydra'
  | 'jade_sniper'
  | 'frost_wraith'
  | 'icicle_bat'
  | 'glacier_golem'
  | 'cryo_turret'
  | 'blizzard_fairy'
  | 'ice_skater'
  | 'mirror_frost'
  | 'permafrost_wyrm';

export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  style:
    | 'asphalt'
    | 'metal'
    | 'gantry'
    | 'holo'
    | 'vanish_holo'
    | 'train_car'
    | 'library_shelf'
    | 'fortress'
    | 'brass'
    | 'pylon'
    | 'shock_bridge'
    | 'highway'
    | 'jade'
    | 'vine_deck'
    | 'emerald_bounce'
    | 'sap_stream'
    | 'brass_conveyor'
    | 'ice_floor'
    | 'crumble_ice'
    | 'freeze_water'
    | 'cryo_metal';
  oneWay?: boolean;
  bouncy?: boolean;
  streamVx?: number;
  switchGroup?: string;
  vanishState?: 'solid' | 'warning' | 'gone';
  vanishTimer?: number;
  shockCycle?: number;
  shockDuty?: number;
  shockPhase?: number;
  windbreak?: boolean;
  crumbleState?: 'solid' | 'cracking' | 'gone';
  crumbleTimer?: number;
  waterState?: 'liquid' | 'ice';
}

export interface PendulumVineDef {
  id: string;
  cx: number;
  cy: number;
  length: number;
  maxAngle: number;
  speed: number;
  phase: number;
}

export interface FloatBubbleDef {
  id: string;
  x: number;
  y: number;
  r: number;
  ampX?: number;
  ampY?: number;
  speed?: number;
  phase: number;
  standTimer?: number;
  popped?: boolean;
  respawnTimer?: number;
}

export interface SporeCatapultDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  launchVx: number;
  launchVy: number;
}

export interface SnapTrapDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cyclePeriod: number;
  snapDuration: number;
  phase: number;
}

export interface SporeJetDef {
  id: string;
  x: number;
  y: number;
  dir: 'up' | 'down' | 'left' | 'right';
  range: number;
  cyclePeriod: number;
  activeDuration: number;
  phase: number;
}

export interface BloomBridgeDef {
  id: string;
  triggerX: number;
  triggerY: number;
  bridgeX: number;
  bridgeY: number;
  bridgeW: number;
  bridgeH: number;
  duration: number;
  timer: number;
  active: boolean;
}

export interface ScythePendulumDef {
  id: string;
  cx: number;
  cy: number;
  length: number;
  maxAngle: number;
  speed: number;
  phase: number;
}

export interface BoostPadDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  boostVx: number;
  boostVy?: number;
}

export interface ChimeRingDef {
  id: string;
  x: number;
  y: number;
  r: number;
  boostVx: number;
  boostVy: number;
  cooldown?: number;
}

export interface WindRingDef {
  id: string;
  x: number;
  y: number;
  r: number;
  launchVx: number;
  launchVy: number;
  cooldown?: number;
}

export interface PollenPodDef {
  id: string;
  x: number;
  y: number;
  r: number;
  popped?: boolean;
  respawnTimer?: number;
}

export interface LotusPadDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  maxSink?: number;
  sinkOffset?: number;
  prevY?: number;
}

export interface ThornPistonDef {
  id: string;
  x: number;
  baseY: number;
  w: number;
  maxDrop: number;
  cyclePeriod: number;
  phase: number;
  currentDrop?: number;
}

export interface GlowLanternDef {
  id: string;
  x: number;
  y: number;
  r: number;
  litTimer?: number;
}

export interface OrbitalPlatformDef {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  w: number;
  h: number;
  speed: number;
  angle: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export interface CrystalLockDef {
  id: string;
  crystalX: number;
  crystalY: number;
  barrierX: number;
  barrierY: number;
  barrierW: number;
  barrierH: number;
  unlocked?: boolean;
}

export interface SlipstreamGateDef {
  id: string;
  x: number;
  y: number;
  h: number;
  cooldown?: number;
}

export interface SpiralBloomDef {
  id: string;
  triggerX: number;
  triggerY: number;
  stepOffsetX: number;
  stepRiseY: number;
  stepW: number;
  stepsCount: number;
  duration: number;
  active?: boolean;
  timer?: number;
}

export interface SanctuaryGustDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  liftVy: number;
  cyclePeriod: number;
  activeDuration: number;
  phase: number;
}

export interface BlizzardConfigDef {
  cyclePeriod: number;
  activeDuration: number;
  windVx: number;
}

export interface CryoBumperDef {
  id: string;
  x: number;
  y: number;
  r: number;
  launchSpeed: number;
  cooldown?: number;
}

export interface CryoGeyserDef {
  id: string;
  x: number;
  y: number;
  w: number;
  maxHeight: number;
  cyclePeriod: number;
  activeDuration: number;
  phase: number;
}

export interface FreezeBeamDef {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cyclePeriod: number;
  activeDuration: number;
  phase: number;
}

export interface FallingIcicleDef {
  id: string;
  x: number;
  topY: number;
  triggerRange: number;
  warnTimer?: number;
  falling?: boolean;
  currY?: number;
  broken?: boolean;
  respawnTimer?: number;
}

export interface FrostMineDef {
  id: string;
  x: number;
  y: number;
  r: number;
  armed?: boolean;
  fuseTimer?: number;
  cooldown?: number;
}

export interface PhaseWaterSwitchDef {
  id: string;
  x: number;
  y: number;
  r: number;
  cooldown?: number;
}

export interface IceMirrorDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SlopeDef {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bottomY: number;
}

export interface MovingPlatformDef {
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

export interface SealBlockDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  broken: boolean;
  hitFlash: number;
}

export interface MagicSwitchDef {
  id: string;
  x: number;
  y: number;
  r: number;
  group: string;
  activated: boolean;
  lightZone?: boolean; // Lights up dark metro sector
  chrono?: boolean; // Triggers temporary Chrono Slow-Motion field
  cooldown?: number;
}

export interface GearPlatformDef {
  id: string;
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  toothDepth: number;
  rotSpeed: number; // radians/sec (+ clockwise, - counter-clockwise)
  angle: number;
}

export interface BeamLaserDef {
  id: string;
  x1: number;
  y1: number;
  dirX: number;
  dirY: number;
  maxLength: number;
  cyclePeriod: number;
  activeDuration: number;
  phase: number;
  occludable?: boolean; // Can be blocked physically by rotating gears/teeth
}

export interface ThunderRailDef {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  speed: number;
}

export interface LightningHazardConfig {
  interval: number;
  warnDuration: number;
  strikeRadius: number;
}

export interface HazardCableDef {
  id: string;
  x: number;
  y: number;
  length: number;
  phase: number;
}

export interface SpikeTrapDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RotatingLaserDef {
  id: string;
  cx: number;
  cy: number;
  length: number;
  angle: number;
  angularSpeed: number;
}

export interface GravityZoneDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mode: 'updraft' | 'low_grav';
}

export interface MagicMirrorDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  targetMirrorId: string;
  color: string;
  cooldown: number;
}

export interface CannonDef {
  id: string;
  x: number;
  y: number;
  dir: -1 | 1;
  angle: number;
  interval: number;
  timer: number;
}

export interface EnemyDef {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  w: number;
  h: number;
  minX: number;
  maxX: number;
  vx: number;
  vy: number;
  baseY: number;
  facing: -1 | 1;
  hp: number;
  alive: boolean;
  phase: number;
  // Specific AI fields
  mount?: 'ceiling' | 'wall-left' | 'wall-right';
  isMini?: boolean;
  aimTimer?: number;
  chargeState?: 'patrol' | 'warn' | 'charge' | 'recover';
  chargeTimer?: number;
  primed?: boolean;
  fuseTimer?: number;
  fireCooldown?: number;
  hitFlash?: number;
  anchorX?: number;
  anchorY?: number;
  subTimer?: number;
  invulnMode?: boolean;
  customAlpha?: number;
}

export interface ManaOrbDef {
  id: string;
  x: number;
  y: number;
  r: number;
  collected: boolean;
  value: number;
  bonus?: boolean;
  afterBoss?: boolean;
  phase: number;
}

export interface NeonSignDef {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
}

export interface BossDef {
  kind:
    | 'mid_guardian'
    | 'archmage'
    | 'overlord_core'
    | 'clockwork_core'
    | 'thunder_kronos'
    | 'iron_goliath'
    | 'volt_centurion'
    | 'emerald_stalker'
    | 'verdant_warden'
    | 'jade_chimera'
    | 'emerald_emperor'
    | 'frost_titan'
    | 'glacia_knight'
    | 'cocytus_core'
    | 'glacies_emperor';
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  facing: -1 | 1;
  arenaMinX: number;
  arenaMaxX: number;
  floorY: number;
  active: boolean;
  defeated: boolean;
  state: string;
  stateTimer: number;
  stunTimer: number;
  hitFlash: number;
  phase: number;
  clones: { x: number; y: number; alpha: number }[];
  comboLeft?: number;
  comboDir?: -1 | 1;
  variant?: 1 | 2 | 3;
}

export interface StageDefinition {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  theme: StageTheme;
  width: number;
  spawn: { x: number; y: number };
  goal: { x: number; y: number; w: number; h: number };
  secretGoal?: { x: number; y: number; w: number; h: number };
  autoScrollSpeed?: number;
  scrollCrush?: boolean;
  aerialSky?: boolean;
  verticalClimb?: boolean;
  verticalDescent?: boolean;
  underwaterStage?: boolean;
  deathY?: number;
  lightningHazard?: LightningHazardConfig;
  slippery?: boolean;
  ambientDarkness?: number;
  platforms: PlatformDef[];
  slopes: SlopeDef[];
  movingPlatforms: MovingPlatformDef[];
  sealBlocks: SealBlockDef[];
  switches: MagicSwitchDef[];
  gears: GearPlatformDef[];
  beamLasers: BeamLaserDef[];
  rails: ThunderRailDef[];
  cables: HazardCableDef[];
  spikes: SpikeTrapDef[];
  lasers: RotatingLaserDef[];
  gravityZones: GravityZoneDef[];
  mirrors: MagicMirrorDef[];
  cannons: CannonDef[];
  pendulumVines: PendulumVineDef[];
  floatBubbles: FloatBubbleDef[];
  sporeCatapults: SporeCatapultDef[];
  snapTraps: SnapTrapDef[];
  sporeJets: SporeJetDef[];
  bloomBridges: BloomBridgeDef[];
  scythePendulums: ScythePendulumDef[];
  boostPads?: BoostPadDef[];
  chimeRings?: ChimeRingDef[];
  windRings?: WindRingDef[];
  pollenPods?: PollenPodDef[];
  lotusPads?: LotusPadDef[];
  thornPistons?: ThornPistonDef[];
  glowLanterns?: GlowLanternDef[];
  orbitalPlatforms?: OrbitalPlatformDef[];
  crystalLocks?: CrystalLockDef[];
  slipstreamGates?: SlipstreamGateDef[];
  spiralBlooms?: SpiralBloomDef[];
  sanctuaryGusts?: SanctuaryGustDef[];
  blizzardConfig?: BlizzardConfigDef;
  cryoBumpers?: CryoBumperDef[];
  cryoGeysers?: CryoGeyserDef[];
  freezeBeams?: FreezeBeamDef[];
  fallingIcicles?: FallingIcicleDef[];
  icePendulums?: ScythePendulumDef[];
  frostMines?: FrostMineDef[];
  phaseWaterSwitches?: PhaseWaterSwitchDef[];
  iceMirrors?: IceMirrorDef[];
  cryoLanterns?: GlowLanternDef[];
  enemies: EnemyDef[];
  orbs: ManaOrbDef[];
  checkpoints: { x: number; y: number }[];
  neonSigns: NeonSignDef[];
  boss?: BossDef;
}

export interface WorldNode {
  id: string;
  world?: 1 | 2 | 3 | 4;
  stageId: string | null;
  code: string;
  name: string;
  x: number; // Unified panoramic World Map X
  y: number; // Logical World Map Y (0..450)
  kind: 'stage' | 'fortress' | 'boss' | 'secret' | 'empty';
  neighbors: string[];
  requiresSecret?: boolean;
  unlockAfter?: string;
  unlockAnyCleared?: string[];
  warpLabel?: string;
}

export interface WorldEdge {
  from: string;
  to: string;
  secret?: boolean;
  isSecretWarp?: boolean;
  unlockAfter?: string;
  warpLabel?: string;
}

export interface WorldMapEncounter {
  id: string;
  world: 1 | 2 | 3 | 4 | 5;
  stageId: string;
  name: string;
  enemyKind: EnemyKind;
  patrolNodeIds: string[];
  accentColor: string;
}

export interface StageProgress {
  cleared: boolean;
  secretCleared?: boolean;
  bestScore: number;
  bestOrbs: number;
  totalOrbs: number;
}
