import {
  BossDef,
  CannonDef,
  EnemyDef,
  EnemyKind,
  GravityZoneDef,
  HazardCableDef,
  MagicMirrorDef,
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
  WorldEdge,
  WorldMapEncounter,
  WorldNode,
} from './types';
import { buildEncounterStage, buildWorld2Stage } from './world2Levels';
import { buildWorld3Stage } from './world3Levels';
import { buildWorld4EncounterStage, buildWorld4Stage } from './world4Levels';

export const WORLD_X_OFFSETS: Record<1 | 2 | 3 | 4, number> = {
  1: 0,
  2: 1820,
  3: 3660,
  4: 5520,
};

export const WORLD_MAP_WIDTH = 7370;

export const WORLD_1_NODES: WorldNode[] = [
  { id: '1-1', stageId: '1-1', code: '1-1', name: 'ネオン大通りの序章', x: 105, y: 245, kind: 'stage', neighbors: ['w1_e1', 'w1_e3'] },
  { id: 'w1_e1', stageId: null, code: '◆', name: '夜霧の連絡通り', x: 195, y: 195, kind: 'empty', neighbors: ['1-1', 'w1_e2'], unlockAfter: '1-1' },
  { id: 'w1_e2', stageId: null, code: '◆', name: 'ネオン高架ジャンクション', x: 285, y: 145, kind: 'empty', neighbors: ['w1_e1', '1-2'], unlockAfter: '1-1' },
  { id: '1-2', stageId: '1-2', code: '1-2', name: '地下魔導メトロ', x: 380, y: 145, kind: 'stage', neighbors: ['w1_e2', 'w1_e5'] },
  { id: 'w1_e3', stageId: null, code: '◆', name: '摩天楼アプローチ', x: 195, y: 305, kind: 'empty', neighbors: ['1-1', 'w1_e4'], unlockAfter: '1-1' },
  { id: 'w1_e4', stageId: null, code: '◆', name: 'ガラス回廊前広場', x: 285, y: 355, kind: 'empty', neighbors: ['w1_e3', '1-3'], unlockAfter: '1-1' },
  { id: '1-3', stageId: '1-3', code: '1-3', name: 'ホログラム高層ビル群', x: 380, y: 355, kind: 'stage', neighbors: ['w1_e4', 'w1_e7'] },
  { id: 'w1_e5', stageId: null, code: '◆', name: '北側監視ゲート', x: 480, y: 155, kind: 'empty', neighbors: ['1-2', 'w1_e6'], unlockAfter: '1-2' },
  { id: 'w1_e6', stageId: null, code: '◆', name: '外郭チェックポイント', x: 575, y: 200, kind: 'empty', neighbors: ['w1_e5', '1-FORT'], unlockAfter: '1-2' },
  { id: 'w1_e7', stageId: null, code: '◆', name: '南側監視ゲート', x: 480, y: 345, kind: 'empty', neighbors: ['1-3', 'w1_e8'], unlockAfter: '1-3' },
  { id: 'w1_e8', stageId: null, code: '◆', name: '要塞外濠連絡橋', x: 575, y: 295, kind: 'empty', neighbors: ['w1_e7', '1-FORT'], unlockAfter: '1-3' },
  { id: '1-FORT', stageId: '1-FORT', code: '砦', name: '魔導警備ゲート', x: 680, y: 245, kind: 'fortress', neighbors: ['w1_e6', 'w1_e8', 'w1_e9'] },
  { id: 'w1_e9', stageId: null, code: '◆', name: '雨水運河通り', x: 780, y: 245, kind: 'empty', neighbors: ['1-FORT', 'w1_e10'], unlockAfter: '1-FORT' },
  { id: 'w1_e10', stageId: null, code: '◆', name: 'ネオン横丁入口', x: 870, y: 205, kind: 'empty', neighbors: ['w1_e9', '1-4'], unlockAfter: '1-FORT' },
  { id: '1-4', stageId: '1-4', code: '1-4', name: '雨のネオン商店街', x: 960, y: 245, kind: 'stage', neighbors: ['w1_e10', 'w1_e11', 'w1_e12'] },
  { id: 'w1_e11', stageId: null, code: '◆', name: '屋根裏の隠し階段', x: 1055, y: 150, kind: 'empty', neighbors: ['1-4', '1-S'], requiresSecret: true, unlockAfter: '1-4_S' },
  { id: '1-S', stageId: '1-S', code: '1-S', name: '地下秘密魔導庫', x: 1175, y: 105, kind: 'secret', neighbors: ['w1_e11', '1-6'], requiresSecret: true },
  { id: 'w1_e12', stageId: null, code: '◆', name: '星図書庫の橋渡し', x: 1095, y: 245, kind: 'empty', neighbors: ['1-4', '1-5'], unlockAfter: '1-4' },
  { id: '1-5', stageId: '1-5', code: '1-5', name: '浮遊する魔導図書館', x: 1235, y: 245, kind: 'stage', neighbors: ['w1_e12', 'w1_e13'] },
  { id: 'w1_e13', stageId: null, code: '◆', name: '高架モノレール駅', x: 1345, y: 295, kind: 'empty', neighbors: ['1-5', 'w1_e14'], unlockAfter: '1-5' },
  { id: 'w1_e14', stageId: null, code: '◆', name: '急行操車場ホーム', x: 1435, y: 250, kind: 'empty', neighbors: ['w1_e13', '1-6'], unlockAfter: '1-5' },
  { id: '1-6', stageId: '1-6', code: '1-6', name: '高速モノレール疾走', x: 1535, y: 245, kind: 'stage', neighbors: ['w1_e14', '1-S', 'w1_e15'] },
  { id: 'w1_e15', stageId: null, code: '◆', name: '飛行船発着デッキ', x: 1640, y: 245, kind: 'empty', neighbors: ['1-6', '1-BOSS'], unlockAfter: '1-6' },
  { id: '1-BOSS', stageId: '1-BOSS', code: 'BOSS', name: '電脳魔導飛行船', x: 1745, y: 245, kind: 'boss', neighbors: ['w1_e15'] },
];

export const WORLD_1_EDGES: WorldEdge[] = [
  { from: '1-1', to: 'w1_e1' },
  { from: 'w1_e1', to: 'w1_e2' },
  { from: 'w1_e2', to: '1-2' },
  { from: '1-1', to: 'w1_e3' },
  { from: 'w1_e3', to: 'w1_e4' },
  { from: 'w1_e4', to: '1-3' },
  { from: '1-2', to: 'w1_e5' },
  { from: 'w1_e5', to: 'w1_e6' },
  { from: 'w1_e6', to: '1-FORT' },
  { from: '1-3', to: 'w1_e7' },
  { from: 'w1_e7', to: 'w1_e8' },
  { from: 'w1_e8', to: '1-FORT' },
  { from: '1-FORT', to: 'w1_e9' },
  { from: 'w1_e9', to: 'w1_e10' },
  { from: 'w1_e10', to: '1-4' },
  { from: '1-4', to: 'w1_e11', secret: true },
  { from: 'w1_e11', to: '1-S', secret: true },
  { from: '1-S', to: '1-6', secret: true },
  { from: '1-4', to: 'w1_e12' },
  { from: 'w1_e12', to: '1-5' },
  { from: '1-5', to: 'w1_e13' },
  { from: 'w1_e13', to: 'w1_e14' },
  { from: 'w1_e14', to: '1-6' },
  { from: '1-6', to: 'w1_e15' },
  { from: 'w1_e15', to: '1-BOSS' },
];

export const WORLD_1_ENCOUNTERS: WorldMapEncounter[] = [
  {
    id: 'enc_w1_1',
    world: 1,
    stageId: 'ENC_W1_1',
    name: '鋼鉄ゴーレム防衛小隊',
    enemyKind: 'golem_knight',
    patrolNodeIds: ['w1_e1', 'w1_e2', 'w1_e3', 'w1_e4'],
    accentColor: '#38bdf8',
  },
  {
    id: 'enc_w1_2',
    world: 1,
    stageId: 'ENC_W1_2',
    name: 'ルーン守護騎士の遊撃隊',
    enemyKind: 'rune_sentinel',
    patrolNodeIds: ['w1_e9', 'w1_e10', 'w1_e12'],
    accentColor: '#a78bfa',
  },
  {
    id: 'enc_w1_3',
    world: 1,
    stageId: 'ENC_W1_3',
    name: '蒼影ファントム親衛隊',
    enemyKind: 'phantom_knight',
    patrolNodeIds: ['w1_e13', 'w1_e14', 'w1_e15'],
    accentColor: '#f43f5e',
  },
];

export const WORLD_2_NODES: WorldNode[] = [
  { id: '2-1', stageId: '2-1', code: '2-1', name: '黄金の時計塔エントランス', x: 100, y: 245, kind: 'stage', neighbors: ['w2_e1'] },
  { id: 'w2_e1', stageId: null, code: '◆', name: '夕暮れの歯車通り', x: 185, y: 200, kind: 'empty', neighbors: ['2-1', 'w2_e2'], unlockAfter: '2-1' },
  { id: 'w2_e2', stageId: null, code: '◆', name: '真鍮架線連絡橋', x: 265, y: 275, kind: 'empty', neighbors: ['w2_e1', '2-2'], unlockAfter: '2-1' },
  { id: '2-2', stageId: '2-2', code: '2-2', name: '時計塔＆サンダーレール', x: 350, y: 245, kind: 'stage', neighbors: ['w2_e2', 'w2_e3'] },
  { id: 'w2_e3', stageId: null, code: '◆', name: '時限駆動軸の橋', x: 435, y: 195, kind: 'empty', neighbors: ['2-2', 'w2_e4'], unlockAfter: '2-2' },
  { id: 'w2_e4', stageId: null, code: '◆', name: '機械要塞前哨基地', x: 520, y: 245, kind: 'empty', neighbors: ['w2_e3', '2-FORT'], unlockAfter: '2-2' },
  { id: '2-FORT', stageId: '2-FORT', code: '2-砦', name: '歯車とレーザーの機械要塞', x: 610, y: 245, kind: 'fortress', neighbors: ['w2_e4', 'w2_e5', 'w2_e7'] },
  { id: 'w2_e5', stageId: null, code: '◆', name: '北変電ルート', x: 705, y: 175, kind: 'empty', neighbors: ['2-FORT', 'w2_e6'], unlockAfter: '2-FORT' },
  { id: 'w2_e6', stageId: null, code: '◆', name: '歯車工業区入口', x: 795, y: 140, kind: 'empty', neighbors: ['w2_e5', '2-3'], unlockAfter: '2-FORT' },
  { id: '2-3', stageId: '2-3', code: '2-3', name: '高圧変電所と歯車工場', x: 890, y: 145, kind: 'stage', neighbors: ['w2_e6', 'w2_e9'] },
  { id: 'w2_e7', stageId: null, code: '◆', name: '南送電ルート', x: 705, y: 315, kind: 'empty', neighbors: ['2-FORT', 'w2_e8'], unlockAfter: '2-FORT' },
  { id: 'w2_e8', stageId: null, code: '◆', name: '鉄塔スカイデッキ', x: 795, y: 350, kind: 'empty', neighbors: ['w2_e7', '2-4'], unlockAfter: '2-FORT' },
  { id: '2-4', stageId: '2-4', code: '2-4', name: '琥珀の送電鉄塔スカイライン', x: 890, y: 345, kind: 'stage', neighbors: ['w2_e8', 'w2_e10'] },
  { id: 'w2_e9', stageId: null, code: '◆', name: '北部高圧合流点', x: 990, y: 185, kind: 'empty', neighbors: ['2-3', '2-5'], unlockAfter: '2-3' },
  { id: 'w2_e10', stageId: null, code: '◆', name: '南部鉄塔合流点', x: 990, y: 305, kind: 'empty', neighbors: ['2-4', '2-5'], unlockAfter: '2-4' },
  { id: '2-5', stageId: '2-5', code: '2-5', name: '高電圧スカイブリッジ地帯', x: 1085, y: 245, kind: 'stage', neighbors: ['w2_e9', 'w2_e10', 'w2_e11'] },
  { id: 'w2_e11', stageId: null, code: '◆', name: '嵐前線の連絡路', x: 1175, y: 195, kind: 'empty', neighbors: ['2-5', 'w2_e12'], unlockAfter: '2-5' },
  { id: 'w2_e12', stageId: null, code: '◆', name: '雷鳴高速料金所', x: 1265, y: 245, kind: 'empty', neighbors: ['w2_e11', '2-6'], unlockAfter: '2-5' },
  { id: '2-6', stageId: '2-6', code: '2-6', name: '雷鳴の強制スクロール道路', x: 1355, y: 245, kind: 'stage', neighbors: ['w2_e12', 'w2_e13'] },
  { id: 'w2_e13', stageId: null, code: '◆', name: '黄金雲海昇降ゲート', x: 1445, y: 290, kind: 'empty', neighbors: ['2-6', '2-7'], unlockAfter: '2-6' },
  { id: '2-7', stageId: '2-7', code: '2-7', name: '黄金嵐のスカイクラウド回廊', x: 1540, y: 245, kind: 'stage', neighbors: ['w2_e13', 'w2_e14'] },
  { id: 'w2_e14', stageId: null, code: '◆', name: '雷雲上空係留鎖', x: 1625, y: 195, kind: 'empty', neighbors: ['2-7', 'w2_e15'], unlockAfter: '2-7' },
  { id: 'w2_e15', stageId: null, code: '◆', name: '発電戦艦乗船甲板', x: 1685, y: 265, kind: 'empty', neighbors: ['w2_e14', '2-BOSS'], unlockAfter: '2-7' },
  { id: '2-BOSS', stageId: '2-BOSS', code: '2-BOSS', name: '雷帝の空中発電戦艦', x: 1755, y: 245, kind: 'boss', neighbors: ['w2_e15'] },
];

export const WORLD_2_EDGES: WorldEdge[] = [
  { from: '2-1', to: 'w2_e1' },
  { from: 'w2_e1', to: 'w2_e2' },
  { from: 'w2_e2', to: '2-2' },
  { from: '2-2', to: 'w2_e3' },
  { from: 'w2_e3', to: 'w2_e4' },
  { from: 'w2_e4', to: '2-FORT' },
  { from: '2-FORT', to: 'w2_e5' },
  { from: 'w2_e5', to: 'w2_e6' },
  { from: 'w2_e6', to: '2-3' },
  { from: '2-FORT', to: 'w2_e7' },
  { from: 'w2_e7', to: 'w2_e8' },
  { from: 'w2_e8', to: '2-4' },
  { from: '2-3', to: 'w2_e9' },
  { from: 'w2_e9', to: '2-5' },
  { from: '2-4', to: 'w2_e10' },
  { from: 'w2_e10', to: '2-5' },
  { from: '2-5', to: 'w2_e11' },
  { from: 'w2_e11', to: 'w2_e12' },
  { from: 'w2_e12', to: '2-6' },
  { from: '2-6', to: 'w2_e13' },
  { from: 'w2_e13', to: '2-7' },
  { from: '2-7', to: 'w2_e14' },
  { from: 'w2_e14', to: 'w2_e15' },
  { from: 'w2_e15', to: '2-BOSS' },
];

export const WORLD_2_ENCOUNTERS: WorldMapEncounter[] = [
  {
    id: 'enc_w2_1',
    world: 2,
    stageId: 'ENC_W2_1',
    name: '黄金歯車ローラー暴走隊',
    enemyKind: 'gear_roller',
    patrolNodeIds: ['w2_e1', 'w2_e2', 'w2_e3', 'w2_e4'],
    accentColor: '#facc15',
  },
  {
    id: 'enc_w2_2',
    world: 2,
    stageId: 'ENC_W2_2',
    name: '電撃振子テザー警戒網',
    enemyKind: 'tether_spark',
    patrolNodeIds: ['w2_e5', 'w2_e7', 'w2_e9', 'w2_e10'],
    accentColor: '#f59e0b',
  },
  {
    id: 'enc_w2_3',
    world: 2,
    stageId: 'ENC_W2_3',
    name: '突撃電光ラマー特攻中隊',
    enemyKind: 'dash_rammer',
    patrolNodeIds: ['w2_e11', 'w2_e12', 'w2_e13', 'w2_e14'],
    accentColor: '#fb7185',
  },
];

export const WORLD_3_NODES: WorldNode[] = [
  { id: 'w3_start', stageId: null, code: '◆', name: '翠緑樹海ゲート', x: 80, y: 245, kind: 'empty', neighbors: ['w3_e1', 'w3_e2'], unlockAfter: '2-BOSS' },
  { id: 'w3_e1', stageId: null, code: '◆', name: '上層キャノピー連絡橋', x: 170, y: 165, kind: 'empty', neighbors: ['w3_start', '3-1'], unlockAfter: '2-BOSS' },
  { id: '3-1', stageId: '3-1', code: '3-1', name: '翠緑の摩天楼キャノピー', x: 275, y: 145, kind: 'stage', neighbors: ['w3_e1', 'w3_e3'] },
  { id: 'w3_e2', stageId: null, code: '◆', name: '翡翠歯車アプローチ', x: 170, y: 325, kind: 'empty', neighbors: ['w3_start', '3-2'], unlockAfter: '2-BOSS' },
  { id: '3-2', stageId: '3-2', code: '3-2', name: '翡翠の立体ギア迷宮', x: 275, y: 345, kind: 'stage', neighbors: ['w3_e2', 'w3_e4'] },
  { id: 'w3_e3', stageId: null, code: '◆', name: '北樹冠合流デッキ', x: 380, y: 175, kind: 'empty', neighbors: ['3-1', '3-3'], unlockAfter: '3-1' },
  { id: 'w3_e4', stageId: null, code: '◆', name: '南迷宮合流デッキ', x: 380, y: 315, kind: 'empty', neighbors: ['3-2', '3-3'], unlockAfter: '3-2' },
  { id: '3-3', stageId: '3-3', code: '3-3', name: '樹液激流・大温室エクスプレス', x: 485, y: 245, kind: 'stage', neighbors: ['w3_e3', 'w3_e4', 'w3_e5'] },
  { id: 'w3_e5', stageId: null, code: '◆', name: '第一翠玉要塞前濠', x: 585, y: 245, kind: 'empty', neighbors: ['3-3', '3-FORT1'], unlockAfter: '3-3' },
  { id: '3-FORT1', stageId: '3-FORT1', code: '3-砦1', name: '第一翠玉要塞・茨の門', x: 685, y: 245, kind: 'fortress', neighbors: ['w3_e5', 'w3_e6', 'w3_e7'] },
  { id: 'w3_e6', stageId: null, code: '◆', name: '地下樹海トンネル口', x: 785, y: 165, kind: 'empty', neighbors: ['3-FORT1', '3-4'], unlockAfter: '3-FORT1' },
  { id: '3-4', stageId: '3-4', code: '3-4', name: '翡翠地下樹海・蛍光の胞子洞窟', x: 895, y: 145, kind: 'stage', neighbors: ['w3_e6', 'w3_e8'] },
  { id: 'w3_e7', stageId: null, code: '◆', name: '天空庭園アプローチ', x: 785, y: 325, kind: 'empty', neighbors: ['3-FORT1', '3-5'], unlockAfter: '3-FORT1' },
  { id: '3-5', stageId: '3-5', code: '3-5', name: 'エメラルド浮遊胞子の空中庭園', x: 895, y: 345, kind: 'stage', neighbors: ['w3_e7', 'w3_e9'] },
  { id: 'w3_e8', stageId: null, code: '◆', name: '北地下連絡ゲート', x: 1005, y: 175, kind: 'empty', neighbors: ['3-4', '3-FORT2'], unlockAfter: '3-4' },
  { id: 'w3_e9', stageId: null, code: '◆', name: '南庭園連絡ゲート', x: 1005, y: 315, kind: 'empty', neighbors: ['3-5', '3-FORT2'], unlockAfter: '3-5' },
  { id: '3-FORT2', stageId: '3-FORT2', code: '3-砦2', name: '第二翠玉要塞・双晶の狂花炉心', x: 1110, y: 245, kind: 'fortress', neighbors: ['w3_e8', 'w3_e9', 'w3_e10'] },
  { id: 'w3_e10', stageId: null, code: '◆', name: '高層樹冠ダイブ台', x: 1210, y: 195, kind: 'empty', neighbors: ['3-FORT2', 'w3_e11'], unlockAfter: '3-FORT2' },
  { id: 'w3_e11', stageId: null, code: '◆', name: '深層根脈トンネル入口', x: 1305, y: 245, kind: 'empty', neighbors: ['w3_e10', '3-6'], unlockAfter: '3-FORT2' },
  { id: '3-6', stageId: '3-6', code: '3-6', name: '蒼翠の樹冠ダイブ＆深層根脈', x: 1400, y: 245, kind: 'stage', neighbors: ['w3_e11', 'w3_e12'] },
  { id: 'w3_e12', stageId: null, code: '◆', name: '上下複層樹冠回廊口', x: 1490, y: 290, kind: 'empty', neighbors: ['3-6', '3-7'], unlockAfter: '3-6' },
  { id: '3-7', stageId: '3-7', code: '3-7', name: '翡翠樹冠・上下複層スパイラル', x: 1580, y: 245, kind: 'stage', neighbors: ['w3_e12', 'w3_e13'] },
  { id: 'w3_e13', stageId: null, code: '◆', name: '翡翠宮殿外廊前庭', x: 1655, y: 190, kind: 'empty', neighbors: ['3-7', 'w3_e14'], unlockAfter: '3-7' },
  { id: 'w3_e14', stageId: null, code: '◆', name: '翠帝玉座の間正門', x: 1710, y: 265, kind: 'empty', neighbors: ['w3_e13', '3-BOSS'], unlockAfter: '3-7' },
  { id: '3-BOSS', stageId: '3-BOSS', code: '3-城', name: '翡翠宮殿の聖域回廊＆翠帝玉座', x: 1780, y: 245, kind: 'boss', neighbors: ['w3_e14'] },
];

export const WORLD_3_EDGES: WorldEdge[] = [
  { from: 'w3_start', to: 'w3_e1' },
  { from: 'w3_e1', to: '3-1' },
  { from: 'w3_start', to: 'w3_e2' },
  { from: 'w3_e2', to: '3-2' },
  { from: '3-1', to: 'w3_e3' },
  { from: 'w3_e3', to: '3-3' },
  { from: '3-2', to: 'w3_e4' },
  { from: 'w3_e4', to: '3-3' },
  { from: '3-3', to: 'w3_e5' },
  { from: 'w3_e5', to: '3-FORT1' },
  { from: '3-FORT1', to: 'w3_e6' },
  { from: 'w3_e6', to: '3-4' },
  { from: '3-FORT1', to: 'w3_e7' },
  { from: 'w3_e7', to: '3-5' },
  { from: '3-4', to: 'w3_e8' },
  { from: 'w3_e8', to: '3-FORT2' },
  { from: '3-5', to: 'w3_e9' },
  { from: 'w3_e9', to: '3-FORT2' },
  { from: '3-FORT2', to: 'w3_e10' },
  { from: 'w3_e10', to: 'w3_e11' },
  { from: 'w3_e11', to: '3-6' },
  { from: '3-6', to: 'w3_e12' },
  { from: 'w3_e12', to: '3-7' },
  { from: '3-7', to: 'w3_e13' },
  { from: 'w3_e13', to: 'w3_e14' },
  { from: 'w3_e14', to: '3-BOSS' },
];

export const WORLD_3_ENCOUNTERS: WorldMapEncounter[] = [
  {
    id: 'enc_w3_1',
    world: 3,
    stageId: 'ENC_W3_1',
    name: '翠玉の奇襲者ストーカー',
    enemyKind: 'emerald_mantis',
    patrolNodeIds: ['w3_e1', 'w3_e2', 'w3_e3', 'w3_e4'],
    accentColor: '#34d399',
  },
  {
    id: 'enc_w3_2',
    world: 3,
    stageId: 'ENC_W3_2',
    name: '胞子迷宮のストーカー隊',
    enemyKind: 'jade_sniper',
    patrolNodeIds: ['w3_e5', 'w3_e6', 'w3_e7', 'w3_e8', 'w3_e9'],
    accentColor: '#10b981',
  },
  {
    id: 'enc_w3_3',
    world: 3,
    stageId: 'ENC_W3_3',
    name: 'ヒュドラ護衛ストーカー決戦',
    enemyKind: 'bio_hydra',
    patrolNodeIds: ['w3_e10', 'w3_e11', 'w3_e12', 'w3_e13'],
    accentColor: '#6ee7b7',
  },
];

export const WORLD_4_NODES: WorldNode[] = [
  { id: 'w4_start', stageId: null, code: '◆', name: '蒼氷境界の霧港ゲート', x: 75, y: 245, kind: 'empty', neighbors: ['w4_e1'], unlockAfter: '3-BOSS' },
  { id: 'w4_e1', stageId: null, code: '◆', name: '流氷防波堤アプローチ', x: 145, y: 195, kind: 'empty', neighbors: ['w4_start', '4-1'], unlockAfter: '3-BOSS' },
  { id: '4-1', stageId: '4-1', code: '4-1', name: '蒼氷の港湾高速滑走', x: 225, y: 245, kind: 'stage', neighbors: ['w4_e1', 'w4_e2'] },
  { id: 'w4_e2', stageId: null, code: '◆', name: '氷結晶の崖通り', x: 315, y: 300, kind: 'empty', neighbors: ['4-1', '4-2'], unlockAfter: '4-1' },
  { id: '4-2', stageId: '4-2', code: '4-2', name: '崩落クリスタル氷棚迷宮', x: 405, y: 245, kind: 'stage', neighbors: ['w4_e2', 'w4_e3'] },
  { id: 'w4_e3', stageId: null, code: '◆', name: '氷鏡回廊入口', x: 495, y: 190, kind: 'empty', neighbors: ['4-2', '4-3'], unlockAfter: '4-2' },
  { id: '4-3', stageId: '4-3', code: '4-3', name: '鏡面氷晶と反射レーザー', x: 585, y: 245, kind: 'stage', neighbors: ['w4_e3', 'w4_e4'] },
  { id: 'w4_e4', stageId: null, code: '◆', name: '第一蒼氷要塞外濠', x: 675, y: 245, kind: 'empty', neighbors: ['4-3', '4-FORT1'], unlockAfter: '4-3' },
  { id: '4-FORT1', stageId: '4-FORT1', code: '4-砦1', name: '第一蒼氷要塞・絶対零度門', x: 775, y: 245, kind: 'fortress', neighbors: ['w4_e4', 'w4_e5', 'w4_e6'] },
  { id: 'w4_e5', stageId: null, code: '◆', name: '深海氷溝ダイブ口', x: 875, y: 160, kind: 'empty', neighbors: ['4-FORT1', '4-4'], unlockAfter: '4-FORT1' },
  { id: '4-4', stageId: '4-4', code: '4-4', name: '深海氷溝・氷水相転移ダイブ', x: 985, y: 140, kind: 'stage', neighbors: ['w4_e5', 'w4_e7'] },
  { id: 'w4_e6', stageId: null, code: '◆', name: '極寒ブリザード峰口', x: 875, y: 330, kind: 'empty', neighbors: ['4-FORT1', '4-5'], unlockAfter: '4-FORT1' },
  { id: '4-5', stageId: '4-5', code: '4-5', name: '極寒ブリザード渓谷＆間欠泉', x: 985, y: 350, kind: 'stage', neighbors: ['w4_e6', 'w4_e8'] },
  { id: 'w4_e7', stageId: null, code: '◆', name: '北部氷壁合流デッキ', x: 1095, y: 175, kind: 'empty', neighbors: ['4-4', '4-6'], unlockAfter: '4-4' },
  { id: 'w4_e8', stageId: null, code: '◆', name: '南部雪風合流デッキ', x: 1095, y: 315, kind: 'empty', neighbors: ['4-5', '4-6'], unlockAfter: '4-5' },
  { id: '4-6', stageId: '4-6', code: '4-6', name: '絶対零度の氷柱強制高速降下', x: 1200, y: 245, kind: 'stage', neighbors: ['w4_e7', 'w4_e8', 'w4_e9'] },
  { id: 'w4_e9', stageId: null, code: '◆', name: '氷底コキュートス前哨', x: 1295, y: 195, kind: 'empty', neighbors: ['4-6', 'w4_e10'], unlockAfter: '4-6' },
  { id: 'w4_e10', stageId: null, code: '◆', name: '冷凍炉心検問橋', x: 1380, y: 245, kind: 'empty', neighbors: ['w4_e9', '4-FORT2'], unlockAfter: '4-6' },
  { id: '4-FORT2', stageId: '4-FORT2', code: '4-砦2', name: '第二蒼氷要塞・冷凍炉心', x: 1475, y: 245, kind: 'fortress', neighbors: ['w4_e10', 'w4_e11'] },
  { id: 'w4_e11', stageId: null, code: '◆', name: '王城凍結大橋', x: 1570, y: 200, kind: 'empty', neighbors: ['4-FORT2', 'w4_e12'], unlockAfter: '4-FORT2' },
  { id: 'w4_e12', stageId: null, code: '◆', name: '絶対零度玉座正門', x: 1665, y: 265, kind: 'empty', neighbors: ['w4_e11', '4-BOSS'], unlockAfter: '4-FORT2' },
  { id: '4-BOSS', stageId: '4-BOSS', code: '4-城', name: '蒼氷王城・終焉の氷帝玉座', x: 1770, y: 245, kind: 'boss', neighbors: ['w4_e12'] },
];

export const WORLD_4_EDGES: WorldEdge[] = [
  { from: 'w4_start', to: 'w4_e1' },
  { from: 'w4_e1', to: '4-1' },
  { from: '4-1', to: 'w4_e2' },
  { from: 'w4_e2', to: '4-2' },
  { from: '4-2', to: 'w4_e3' },
  { from: 'w4_e3', to: '4-3' },
  { from: '4-3', to: 'w4_e4' },
  { from: 'w4_e4', to: '4-FORT1' },
  { from: '4-FORT1', to: 'w4_e5' },
  { from: 'w4_e5', to: '4-4' },
  { from: '4-FORT1', to: 'w4_e6' },
  { from: 'w4_e6', to: '4-5' },
  { from: '4-4', to: 'w4_e7' },
  { from: 'w4_e7', to: '4-6' },
  { from: '4-5', to: 'w4_e8' },
  { from: 'w4_e8', to: '4-6' },
  { from: '4-6', to: 'w4_e9' },
  { from: 'w4_e9', to: 'w4_e10' },
  { from: 'w4_e10', to: '4-FORT2' },
  { from: '4-FORT2', to: 'w4_e11' },
  { from: 'w4_e11', to: 'w4_e12' },
  { from: 'w4_e12', to: '4-BOSS' },
];

export const WORLD_4_ENCOUNTERS: WorldMapEncounter[] = [
  {
    id: 'enc_w4_1',
    world: 4,
    stageId: 'ENC_W4_1',
    name: '蒼氷タイタン強襲戦団',
    enemyKind: 'ice_skater',
    patrolNodeIds: ['w4_e1', 'w4_e2', 'w4_e3', 'w4_e4'],
    accentColor: '#38bdf8',
  },
  {
    id: 'enc_w4_2',
    world: 4,
    stageId: 'ENC_W4_2',
    name: '鏡面氷晶タイタン防衛隊',
    enemyKind: 'mirror_frost',
    patrolNodeIds: ['w4_e5', 'w4_e6', 'w4_e7', 'w4_e8'],
    accentColor: '#7dd3fc',
  },
  {
    id: 'enc_w4_3',
    world: 4,
    stageId: 'ENC_W4_3',
    name: '極寒タイタン親衛遊撃隊',
    enemyKind: 'glacier_golem',
    patrolNodeIds: ['w4_e9', 'w4_e10', 'w4_e11', 'w4_e12'],
    accentColor: '#bae6fd',
  },
];

export const SECRET_WARP_EDGES: WorldEdge[] = [
  { from: '1-3', to: '2-2', secret: true, isSecretWarp: true, unlockAfter: '1-3_S', warpLabel: 'WARP→2-2' },
  { from: '1-S', to: '2-1', secret: true, isSecretWarp: true, unlockAfter: '1-S', warpLabel: 'WARP→2-1' },
  { from: '2-3', to: '3-1', secret: true, isSecretWarp: true, unlockAfter: '2-3_S', warpLabel: 'WARP→3-1' },
  { from: '2-5', to: '3-4', secret: true, isSecretWarp: true, unlockAfter: '2-5_S', warpLabel: 'WARP→3-4' },
  { from: '3-3', to: '4-1', secret: true, isSecretWarp: true, unlockAfter: '3-3_S', warpLabel: 'WARP→4-1' },
  { from: '3-6', to: '4-4', secret: true, isSecretWarp: true, unlockAfter: '3-6_S', warpLabel: 'WARP→4-4' },
];

export const UNIFIED_WORLD_EDGES: WorldEdge[] = [
  ...WORLD_1_EDGES,
  { from: '1-BOSS', to: '2-1' },
  ...WORLD_2_EDGES,
  { from: '2-BOSS', to: 'w3_start' },
  ...WORLD_3_EDGES,
  { from: '3-BOSS', to: 'w4_start' },
  ...WORLD_4_EDGES,
  ...SECRET_WARP_EDGES,
];

export const UNIFIED_WORLD_NODES: WorldNode[] = (() => {
  const raw: WorldNode[] = [
    ...WORLD_1_NODES.map((n) => ({ ...n, world: 1 as const, x: n.x + WORLD_X_OFFSETS[1], neighbors: [...n.neighbors] })),
    ...WORLD_2_NODES.map((n) => ({ ...n, world: 2 as const, x: n.x + WORLD_X_OFFSETS[2], neighbors: [...n.neighbors] })),
    ...WORLD_3_NODES.map((n) => ({ ...n, world: 3 as const, x: n.x + WORLD_X_OFFSETS[3], neighbors: [...n.neighbors] })),
    ...WORLD_4_NODES.map((n) => ({ ...n, world: 4 as const, x: n.x + WORLD_X_OFFSETS[4], neighbors: [...n.neighbors] })),
  ];
  const byId = new Map(raw.map((n) => [n.id, n]));
  for (const e of UNIFIED_WORLD_EDGES) {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (a && b) {
      if (!a.neighbors.includes(e.to)) a.neighbors.push(e.to);
      if (!b.neighbors.includes(e.from)) b.neighbors.push(e.from);
    }
  }
  return raw;
})();

export const ALL_WORLD_ENCOUNTERS: WorldMapEncounter[] = [
  ...WORLD_1_ENCOUNTERS,
  ...WORLD_2_ENCOUNTERS,
  ...WORLD_3_ENCOUNTERS,
  ...WORLD_4_ENCOUNTERS,
];

export const STAGE_LIST_META = WORLD_1_NODES.filter((n) => n.stageId !== null).map((n) => ({
  id: n.id,
  code: n.code,
  name: n.name,
  kind: n.kind,
  world: 1 as const,
}));

export const WORLD_2_STAGE_LIST_META = WORLD_2_NODES.filter((n) => n.stageId !== null).map((n) => ({
  id: n.id,
  code: n.code,
  name: n.name,
  kind: n.kind,
  world: 2 as const,
}));

export const WORLD_3_STAGE_LIST_META = WORLD_3_NODES.filter((n) => n.stageId !== null).map((n) => ({
  id: n.id,
  code: n.code,
  name: n.name,
  kind: n.kind,
  world: 3 as const,
}));

export const WORLD_4_STAGE_LIST_META = WORLD_4_NODES.filter((n) => n.stageId !== null).map((n) => ({
  id: n.id,
  code: n.code,
  name: n.name,
  kind: n.kind,
  world: 4 as const,
}));

export const ALL_STAGE_LIST_META = [
  ...STAGE_LIST_META,
  ...WORLD_2_STAGE_LIST_META,
  ...WORLD_3_STAGE_LIST_META,
  ...WORLD_4_STAGE_LIST_META,
];

function makeEnemy(
  id: string,
  kind: EnemyKind,
  x: number,
  y: number,
  minX: number,
  maxX: number,
  opts: Partial<EnemyDef> = {}
): EnemyDef {
  const defaults: Partial<Record<EnemyKind, { w: number; h: number; vx: number; hp: number }>> = {
    patrol_drone: { w: 30, h: 24, vx: 75, hp: 1 },
    hopping_bot: { w: 26, h: 26, vx: 68, hp: 1 },
    shield_trooper: { w: 28, h: 36, vx: 50, hp: 2 },
    sniper_turret: { w: 26, h: 26, vx: 0, hp: 1 },
    slime_glitch: { w: 30, h: 20, vx: 60, hp: 1 },
    ghost_wisp: { w: 26, h: 26, vx: 44, hp: 1 },
    bulldozer_mech: { w: 40, h: 32, vx: 46, hp: 2 },
    bomb_walker: { w: 26, h: 26, vx: 54, hp: 1 },
    arcane_caster: { w: 26, h: 34, vx: 0, hp: 2 },
  };
  const d = defaults[kind] ?? { w: 28, h: 28, vx: 60, hp: 1 };
  return {
    id,
    kind,
    x,
    y,
    w: opts.w ?? d.w,
    h: opts.h ?? d.h,
    minX,
    maxX,
    vx: opts.vx ?? d.vx,
    vy: opts.vy ?? 0,
    baseY: y,
    facing: opts.facing ?? -1,
    hp: opts.hp ?? d.hp,
    alive: true,
    phase: opts.phase ?? Math.random() * Math.PI * 2,
    mount: opts.mount,
    isMini: opts.isMini,
    aimTimer: 0,
    chargeState: 'patrol',
    chargeTimer: 0,
    primed: false,
    fuseTimer: 0,
    fireCooldown: opts.fireCooldown ?? 1.2 + Math.random(),
    hitFlash: 0,
  };
}

function makeOrbRow(
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

function emptyStage(
  partial: Partial<StageDefinition> &
    Pick<StageDefinition, 'id' | 'code' | 'title' | 'subtitle' | 'theme' | 'width'>
): StageDefinition {
  return {
    spawn: { x: 70, y: 320 },
    goal: { x: partial.width - 180, y: 244, w: 54, h: 116 },
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
// STAGE 1-1: ネオン大通りの序章 (13,400px / 完全非反復3区間構成)
// ============================================================================
function buildStage1_1(): StageDefinition {
  const platforms: PlatformDef[] = [
    // --- ZONE 1 (0..4300): 深夜大通り（基本ラン・ガントリースライド・坂道ボウリング） ---
    { id: 'z1_g1', x: 0, y: 370, w: 660, h: 160, style: 'asphalt' },
    { id: 'z1_gan1', x: 270, y: 312, w: 130, h: 28, style: 'gantry' },
    { id: 'z1_p1', x: 490, y: 296, w: 100, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_p2', x: 640, y: 252, w: 110, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_g2', x: 760, y: 370, w: 540, h: 160, style: 'asphalt' },
    { id: 'z1_box', x: 960, y: 315, w: 72, h: 55, style: 'metal' },
    { id: 'z1_step', x: 1300, y: 305, w: 100, h: 225, style: 'asphalt' },
    { id: 'z1_deck', x: 1400, y: 235, w: 140, h: 295, style: 'asphalt' },
    { id: 'z1_run', x: 2040, y: 390, w: 460, h: 140, style: 'asphalt' },
    { id: 'z1_plazaA', x: 3100, y: 355, w: 620, h: 175, style: 'asphalt' },
    { id: 'z1_over', x: 3340, y: 258, w: 280, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_sky_hi', x: 3360, y: 176, w: 240, h: 16, style: 'gantry', oneWay: true },
    { id: 'z1_plazaB', x: 3800, y: 325, w: 500, h: 205, style: 'asphalt' },
    { id: 'z1_gan2', x: 3840, y: 267, w: 160, h: 28, style: 'gantry' },

    // --- ZONE 2 (4300..8850): 高架ジャンクション（上下2層分岐＋2段階ホロスイッチ橋） ---
    { id: 'z2_g1a', x: 4300, y: 370, w: 820, h: 160, style: 'asphalt' },
    { id: 'z2_g1b', x: 5200, y: 370, w: 440, h: 160, style: 'asphalt' },
    { id: 'z2_g1c', x: 5730, y: 330, w: 470, h: 200, style: 'asphalt' },
    { id: 'z2_up1', x: 4520, y: 290, w: 120, h: 16, style: 'metal', oneWay: true },
    { id: 'z2_up2', x: 4720, y: 228, w: 420, h: 18, style: 'gantry' },
    { id: 'z2_up3', x: 5250, y: 228, w: 460, h: 18, style: 'gantry' },
    { id: 'z2_wall', x: 5210, y: 305, w: 34, h: 65, style: 'fortress' },
    { id: 'z2_g2', x: 6290, y: 350, w: 620, h: 180, style: 'asphalt' },
    // 2-stage Holo-bridge across wide highway gap
    { id: 'z2_h1', x: 6965, y: 336, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'z2_brA' },
    { id: 'z2_h2', x: 7115, y: 300, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'z2_brA' },
    { id: 'z2_mid', x: 7275, y: 330, w: 390, h: 200, style: 'asphalt' },
    { id: 'z2_h3', x: 7725, y: 310, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'z2_brB' },
    { id: 'z2_h4', x: 7875, y: 274, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'z2_brB' },
    { id: 'z2_h5', x: 8025, y: 316, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'z2_brB' },
    { id: 'z2_g3', x: 8175, y: 350, w: 675, h: 180, style: 'asphalt' },

    // --- ZONE 3 (8850..13400): ツインタワー連絡路（階段テラス＋2段加速坂＋連続移動足場） ---
    { id: 'z3_t1', x: 8850, y: 310, w: 280, h: 220, style: 'asphalt' },
    { id: 'z3_t2', x: 9210, y: 255, w: 260, h: 275, style: 'asphalt' },
    { id: 'z3_t3', x: 9540, y: 195, w: 220, h: 335, style: 'asphalt' },
    { id: 'z3_mid', x: 10180, y: 310, w: 200, h: 220, style: 'asphalt' },
    { id: 'z3_run', x: 10780, y: 395, w: 520, h: 135, style: 'asphalt' },
    // Plaza after moving platforms
    { id: 'z3_end1', x: 12280, y: 365, w: 620, h: 165, style: 'asphalt' },
    { id: 'z3_end2', x: 12985, y: 330, w: 415, h: 200, style: 'asphalt' },
    { id: 'z3_gan3', x: 12550, y: 307, w: 190, h: 28, style: 'gantry' },
    { id: 'z3_up', x: 12560, y: 215, w: 170, h: 16, style: 'metal', oneWay: true },
  ];

  const slopes: SlopeDef[] = [
    { id: 'z1_s1', x1: 1540, y1: 235, x2: 2040, y2: 390, bottomY: 530 },
    { id: 'z3_s1', x1: 9760, y1: 195, x2: 10180, y2: 310, bottomY: 530 },
    { id: 'z3_s2', x1: 10380, y1: 310, x2: 10780, y2: 395, bottomY: 530 },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: 'z1_m1', x: 2580, y: 355, w: 96, h: 16, startX: 2550, startY: 355, endX: 2730, endY: 355, speed: 1.5, phase: 0, vx: 0, vy: 0, prevX: 2580, prevY: 355 },
    { id: 'z1_m2', x: 2860, y: 325, w: 96, h: 16, startX: 2830, startY: 345, endX: 3000, endY: 290, speed: 1.45, phase: 1.3, vx: 0, vy: 0, prevX: 2860, prevY: 325 },
    // Zone 3 rhythmic aerial ferries
    { id: 'z3_m1', x: 11380, y: 355, w: 96, h: 16, startX: 11360, startY: 370, endX: 11520, endY: 295, speed: 1.65, phase: 0, vx: 0, vy: 0, prevX: 11380, prevY: 355 },
    { id: 'z3_m2', x: 11660, y: 280, w: 96, h: 16, startX: 11630, startY: 260, endX: 11820, endY: 335, speed: 1.7, phase: 1.6, vx: 0, vy: 0, prevX: 11660, prevY: 280 },
    { id: 'z3_m3', x: 11960, y: 325, w: 96, h: 16, startX: 11940, startY: 330, endX: 12140, endY: 330, speed: 1.8, phase: 0.7, vx: 0, vy: 0, prevX: 11960, prevY: 325 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: 'z2_sb1', x: 5040, y: 294, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'z2_sb2', x: 5040, y: 332, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'z3_sb1', x: 12840, y: 290, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'z3_sb2', x: 12840, y: 328, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: 'z2_swA', x: 6860, y: 266, r: 16, group: 'z2_brA', activated: false },
    { id: 'z2_swB', x: 7620, y: 248, r: 16, group: 'z2_brB', activated: false },
  ];

  const enemies: EnemyDef[] = [
    // Zone 1
    makeEnemy('z1_e1', 'patrol_drone', 840, 336, 780, 940),
    makeEnemy('z1_e2', 'hopping_bot', 1120, 344, 1050, 1270),
    makeEnemy('z1_e3', 'slime_glitch', 2080, 370, 2050, 2240),
    makeEnemy('z1_e4', 'patrol_drone', 2260, 355, 2150, 2450),
    makeEnemy('z1_e5', 'hopping_bot', 3450, 329, 3260, 3680),
    // Zone 2
    makeEnemy('z2_e1', 'shield_trooper', 4850, 334, 4720, 4990),
    makeEnemy('z2_e2', 'sniper_turret', 5550, 202, 5550, 5550),
    makeEnemy('z2_e3', 'patrol_drone', 5940, 290, 5770, 6150),
    makeEnemy('z2_e4', 'arcane_caster', 6680, 316, 6580, 6820),
    makeEnemy('z2_e5', 'hopping_bot', 7440, 304, 7310, 7590),
    makeEnemy('z2_e6', 'shield_trooper', 8420, 314, 8250, 8650),
    // Zone 3
    makeEnemy('z3_e1', 'patrol_drone', 8990, 275, 8880, 9100),
    makeEnemy('z3_e2', 'slime_glitch', 10840, 375, 10800, 11020),
    makeEnemy('z3_e3', 'hopping_bot', 11030, 369, 10940, 11260),
    makeEnemy('z3_e4', 'patrol_drone', 11140, 360, 10980, 11270),
    makeEnemy('z3_e5', 'arcane_caster', 12700, 331, 12550, 12800),
    makeEnemy('z3_e6', 'shield_trooper', 13060, 294, 13000, 13130),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('o_z1_1', 295, 348, 3, 36),
    ...makeOrbRow('o_z1_2', 1600, 232, 7, 62, 19),
    ...makeOrbRow('o_z1_3', 3390, 228, 4, 48),
    ...makeOrbRow('o_z2_1', 4810, 195, 5, 58),
    ...makeOrbRow('o_z2_2', 7010, 298, 2, 145, -34),
    ...makeOrbRow('o_z2_3', 7760, 275, 3, 150, -8),
    ...makeOrbRow('o_z3_1', 9810, 192, 6, 56, 15),
    ...makeOrbRow('o_z3_2', 10430, 305, 6, 56, 12),
    { id: 'ob_z2', x: 5480, y: 192, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'ob_z3', x: 12645, y: 185, r: 10, collected: false, value: 300, bonus: true, phase: 1.5 },
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 4360, y: 370 },
    { x: 8920, y: 310 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 280, y: 316, w: 112, h: 20, label: 'NIGHT AVENUE', color: '#38bdf8' },
    { x: 1410, y: 170, w: 120, h: 24, label: 'SLIDE RUSH', color: '#22d3ee' },
    { x: 4380, y: 215, w: 146, h: 24, label: 'JUNCTION 02', color: '#a78bfa' },
    { x: 9560, y: 132, w: 148, h: 24, label: 'TWIN TOWERS', color: '#38f2ff' },
    { x: 13140, y: 165, w: 124, h: 24, label: 'SECTOR GATE', color: '#34d399' },
  ];

  const boostPads = [
    { id: '11_bp1', x: 860, y: 362, w: 96, h: 10, boostVx: 535 },
    { id: '11_bp2', x: 3560, y: 347, w: 96, h: 10, boostVx: 545 },
    { id: '11_bp3', x: 4860, y: 220, w: 96, h: 10, boostVx: 550, boostVy: -185 },
    { id: '11_bp4', x: 10940, y: 387, w: 96, h: 10, boostVx: 555 },
    { id: '11_bp5', x: 12410, y: 357, w: 96, h: 10, boostVx: 540, boostVy: -175 },
  ];

  return emptyStage({
    id: '1-1',
    code: '1-1',
    title: 'ネオン大通りの序章',
    subtitle: '3-Zone Non-Repeating Neon Expressway',
    theme: 'neon_street',
    width: 13400,
    goal: { x: 13180, y: 214, w: 54, h: 116 },
    platforms,
    slopes,
    movingPlatforms,
    sealBlocks,
    switches,
    boostPads,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
  });
}

// ============================================================================
// STAGE 1-2: 地下魔導メトロ (12,400px / 停電ホーム→複線ピット→変電所コア)
// ============================================================================
function buildStage1_2(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: 'ceil_all', x: 0, y: 0, w: 12400, h: 64, style: 'fortress' },

    // --- ZONE 1 (0..4100): 停電ホーム ---
    { id: 'z1_g1a', x: 0, y: 370, w: 490, h: 160, style: 'asphalt' },
    { id: 'z1_g1b', x: 565, y: 345, w: 375, h: 185, style: 'asphalt' },
    { id: 'z1_gan', x: 260, y: 312, w: 150, h: 28, style: 'gantry' },
    { id: 'z1_h1', x: 995, y: 342, w: 100, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z1' },
    { id: 'z1_h2', x: 1150, y: 305, w: 100, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z1' },
    { id: 'z1_h3', x: 1305, y: 340, w: 100, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z1' },
    { id: 'z1_g2a', x: 1460, y: 370, w: 630, h: 160, style: 'asphalt' },
    { id: 'z1_g2b', x: 2175, y: 335, w: 505, h: 195, style: 'asphalt' },
    { id: 'z1_p1', x: 1960, y: 285, w: 130, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_mez', x: 2770, y: 295, w: 720, h: 235, style: 'asphalt' },
    { id: 'z1_g3', x: 3575, y: 370, w: 525, h: 160, style: 'asphalt' },

    // --- ZONE 2 (4100..8200): 保線ピット＆複線スイッチ迷路 ---
    { id: 'z2_g1a', x: 4100, y: 370, w: 820, h: 160, style: 'asphalt' },
    { id: 'z2_g1b', x: 5005, y: 345, w: 695, h: 185, style: 'asphalt' },
    { id: 'z2_up1', x: 4320, y: 292, w: 110, h: 16, style: 'metal', oneWay: true },
    { id: 'z2_cat', x: 4490, y: 222, w: 880, h: 18, style: 'gantry', oneWay: true },
    { id: 'z2_wall', x: 4860, y: 240, w: 40, h: 32, style: 'fortress' },
    // Moving maintenance lift + dual holo bridge
    { id: 'z2_j1', x: 6260, y: 345, w: 280, h: 185, style: 'asphalt' },
    { id: 'z2_h1', x: 6595, y: 330, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z2' },
    { id: 'z2_h2', x: 6750, y: 290, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z2' },
    { id: 'z2_h3', x: 6905, y: 330, w: 96, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z2' },
    { id: 'z2_g2a', x: 7060, y: 370, w: 520, h: 160, style: 'asphalt' },
    { id: 'z2_g2b', x: 7665, y: 350, w: 535, h: 180, style: 'asphalt' },

    // --- ZONE 3 (8200..12400): 変電所コア（高低差ブレーカー島＋高密度電線回廊） ---
    { id: 'z3_i1', x: 8200, y: 370, w: 440, h: 160, style: 'asphalt' },
    { id: 'z3_i2', x: 8740, y: 315, w: 360, h: 215, style: 'asphalt' },
    { id: 'z3_i3', x: 9200, y: 265, w: 320, h: 265, style: 'asphalt' },
    { id: 'z3_cat3', x: 8820, y: 185, w: 320, h: 16, style: 'gantry', oneWay: true },
    { id: 'z3_i4', x: 9620, y: 325, w: 420, h: 205, style: 'asphalt' },
    { id: 'z3_i5', x: 10140, y: 370, w: 680, h: 160, style: 'asphalt' },
    { id: 'z3_h1', x: 10885, y: 340, w: 105, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z3' },
    { id: 'z3_h2', x: 11045, y: 300, w: 105, h: 14, style: 'holo', oneWay: true, switchGroup: 'm_z3' },
    { id: 'z3_end1', x: 11210, y: 370, w: 610, h: 160, style: 'asphalt' },
    { id: 'z3_end2', x: 11905, y: 335, w: 495, h: 195, style: 'asphalt' },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: 'z2_lift', x: 5820, y: 350, w: 104, h: 16, startX: 5750, startY: 360, endX: 6120, endY: 320, speed: 1.5, phase: 0, vx: 0, vy: 0, prevX: 5820, prevY: 350 },
  ];

  const switches: MagicSwitchDef[] = [
    { id: 'sw_m1', x: 890, y: 250, r: 16, group: 'm_z1', activated: false, lightZone: true },
    { id: 'sw_m2', x: 6490, y: 262, r: 16, group: 'm_z2', activated: false, lightZone: true },
    { id: 'sw_m3', x: 10760, y: 278, r: 16, group: 'm_z3', activated: false, lightZone: true },
  ];

  const cables: HazardCableDef[] = [
    { id: 'cab1', x: 620, y: 64, length: 185, phase: 0.2 },
    { id: 'cab2', x: 1690, y: 64, length: 210, phase: 1.4 },
    { id: 'cab3', x: 2380, y: 64, length: 165, phase: 2.3 },
    { id: 'cab4', x: 3140, y: 64, length: 145, phase: 0.7 },
    { id: 'cab5', x: 4720, y: 64, length: 120, phase: 1.9 },
    { id: 'cab6', x: 5250, y: 64, length: 125, phase: 0.5 },
    { id: 'cab7', x: 7420, y: 64, length: 215, phase: 2.8 },
    { id: 'cab8', x: 8920, y: 64, length: 165, phase: 0.9 },
    { id: 'cab9', x: 9360, y: 64, length: 135, phase: 2.1 },
    { id: 'cab10', x: 9830, y: 64, length: 175, phase: 1.1 },
    { id: 'cab11', x: 10420, y: 64, length: 210, phase: 2.6 },
    { id: 'cab12', x: 11680, y: 64, length: 205, phase: 0.4 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: 'sb_m1', x: 4860, y: 272, w: 38, h: 32, hp: 1, broken: false, hitFlash: 0 },
    { id: 'sb_m2', x: 4860, y: 304, w: 38, h: 33, hp: 1, broken: false, hitFlash: 0 },
    { id: 'sb_m3', x: 4860, y: 337, w: 38, h: 33, hp: 1, broken: false, hitFlash: 0 },
  ];

  const enemies: EnemyDef[] = [
    // Zone 1
    makeEnemy('e1_1', 'slime_glitch', 730, 325, 600, 880),
    makeEnemy('e1_2', 'ghost_wisp', 1800, 240, 1620, 2180),
    makeEnemy('e1_3', 'slime_glitch', 2950, 275, 2810, 3260),
    makeEnemy('e1_4', 'patrol_drone', 3760, 332, 3610, 4020),
    // Zone 2
    makeEnemy('e2_1', 'sniper_turret', 4980, 64, 4980, 4980, { mount: 'ceiling' }),
    makeEnemy('e2_2', 'bomb_walker', 4760, 344, 4640, 4840),
    makeEnemy('e2_3', 'slime_glitch', 5340, 325, 5050, 5630),
    makeEnemy('e2_4', 'ghost_wisp', 7250, 235, 7100, 7560),
    makeEnemy('e2_5', 'patrol_drone', 7840, 314, 7700, 8120),
    // Zone 3
    makeEnemy('e3_1', 'ghost_wisp', 8520, 230, 8320, 8760),
    makeEnemy('e3_2', 'sniper_turret', 9780, 64, 9780, 9780, { mount: 'ceiling' }),
    makeEnemy('e3_3', 'slime_glitch', 10290, 350, 10180, 10680),
    makeEnemy('e3_4', 'ghost_wisp', 11520, 245, 11340, 11880),
    makeEnemy('e3_5', 'slime_glitch', 12010, 315, 11930, 12100),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('om_1', 285, 348, 3, 38),
    ...makeOrbRow('om_2', 1020, 308, 3, 155, -16),
    ...makeOrbRow('om_3', 4650, 190, 4, 75),
    ...makeOrbRow('om_4', 6630, 295, 3, 150, -14),
    ...makeOrbRow('om_5', 9260, 230, 4, 52),
    { id: 'ob_m1', x: 2025, y: 245, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'ob_m2', x: 5250, y: 185, r: 10, collected: false, value: 300, bonus: true, phase: 1 },
    { id: 'ob_m3', x: 10440, y: 290, r: 10, collected: false, value: 300, bonus: true, phase: 2 },
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 4160, y: 370 },
    { x: 8260, y: 370 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 120, y: 255, w: 132, h: 22, label: 'BLACKOUT LINE', color: '#38bdf8' },
    { x: 4180, y: 255, w: 140, h: 22, label: 'MAINTENANCE PIT', color: '#f59e0b' },
    { x: 8260, y: 255, w: 152, h: 22, label: 'SUBSTATION CORE', color: '#e879f9' },
  ];

  return emptyStage({
    id: '1-2',
    code: '1-2',
    title: '地下魔導メトロ',
    subtitle: 'Blackout Subway & Voltage Corridor',
    theme: 'metro_dark',
    ambientDarkness: 0.78,
    width: 12400,
    goal: { x: 12160, y: 219, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    switches,
    cables,
    sealBlocks,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
  });
}

// ============================================================================
// STAGE 1-3: ホログラム高層ビル群 (11,800px / 外壁上昇→空中橋＋内部縦坑→高空下降)
// ============================================================================
function buildStage1_3(): StageDefinition {
  const platforms: PlatformDef[] = [
    // --- ZONE 1 (0..3850): ガラスビル外壁上昇 ---
    { id: 'z1_g1', x: 0, y: 370, w: 420, h: 160, style: 'asphalt' },
    { id: 'z1_vh1', x: 470, y: 325, w: 90, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_vh2', x: 615, y: 270, w: 90, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_vh3', x: 760, y: 215, w: 90, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_vh4', x: 905, y: 165, w: 90, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_roof1', x: 1050, y: 160, w: 520, h: 370, style: 'asphalt' },
    { id: 'z1_wall', x: 1420, y: 72, w: 36, h: 88, style: 'fortress' },
    { id: 'z1_mid', x: 2060, y: 315, w: 660, h: 215, style: 'asphalt' },
    { id: 'z1_vh5', x: 2780, y: 275, w: 88, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_vh6', x: 2930, y: 235, w: 88, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_vh7', x: 3080, y: 290, w: 88, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z1_end', x: 3240, y: 350, w: 610, h: 180, style: 'asphalt' },

    // --- ZONE 2 (3850..7900): 空中スカイブリッジ＋内部ジグザグ登攀 ---
    { id: 'z2_g1', x: 3850, y: 350, w: 280, h: 180, style: 'asphalt' },
    { id: 'z2_vh1', x: 4440, y: 315, w: 86, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z2_vh2', x: 4860, y: 285, w: 86, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z2_vh3', x: 5280, y: 265, w: 86, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z2_shaftBaseA', x: 5560, y: 365, w: 650, h: 165, style: 'asphalt' },
    { id: 'z2_shaftBaseB', x: 6285, y: 330, w: 555, h: 200, style: 'asphalt' },
    // Inside-tower zigzag climb over central monolith wall
    { id: 'z2_led1', x: 6120, y: 295, w: 110, h: 14, style: 'metal', oneWay: true },
    { id: 'z2_led2', x: 6285, y: 230, w: 110, h: 14, style: 'metal', oneWay: true },
    { id: 'z2_led3', x: 6140, y: 165, w: 110, h: 14, style: 'metal', oneWay: true },
    { id: 'z2_led4', x: 6320, y: 120, w: 220, h: 14, style: 'metal', oneWay: true },
    { id: 'z2_monolith', x: 6560, y: 155, w: 56, h: 175, style: 'fortress' },
    { id: 'z2_g2a', x: 6930, y: 345, w: 490, h: 185, style: 'asphalt' },
    { id: 'z2_g2b', x: 7505, y: 325, w: 395, h: 205, style: 'asphalt' },

    // --- ZONE 3 (7900..11800): 超高層アンテナ群（高所下降＋エレベーター＋最終4連パッド） ---
    { id: 'z3_sp1', x: 7900, y: 175, w: 420, h: 355, style: 'asphalt' },
    { id: 'z3_step', x: 7840, y: 265, w: 80, h: 16, style: 'metal', oneWay: true },
    { id: 'z3_vh1', x: 8390, y: 210, w: 86, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_vh2', x: 8555, y: 265, w: 86, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_vh3', x: 8720, y: 325, w: 86, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_g1', x: 8885, y: 365, w: 360, h: 165, style: 'asphalt' },
    { id: 'z3_pent', x: 9600, y: 210, w: 680, h: 320, style: 'asphalt' },
    { id: 'z3_vh4', x: 10355, y: 225, w: 84, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_vh5', x: 10510, y: 260, w: 84, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_vh6', x: 10665, y: 295, w: 84, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_vh7', x: 10820, y: 325, w: 84, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z3_goal', x: 11020, y: 340, w: 780, h: 190, style: 'asphalt' },
    // Secret Upper Penthouse Sky-Alcove above Zone 2 Monolith -> Secret Goal (Warp to 2-2)
    { id: 'z2_sec_step', x: 6605, y: 38, w: 72, h: 14, style: 'vanish_holo', oneWay: true, vanishState: 'solid', vanishTimer: 0 },
    { id: 'z2_sec_loft', x: 6750, y: -4, w: 300, h: 18, style: 'gantry', oneWay: true },
    { id: 'z2_sec_ceil', x: 6750, y: -135, w: 220, h: 36, style: 'fortress' },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: 'z1_el1', x: 1640, y: 220, w: 96, h: 16, startX: 1640, startY: 165, endX: 1640, endY: 335, speed: 1.45, phase: 0, vx: 0, vy: 0, prevX: 1640, prevY: 220 },
    { id: 'z1_el2', x: 1850, y: 290, w: 96, h: 16, startX: 1850, startY: 335, endX: 1850, endY: 185, speed: 1.45, phase: 1.5, vx: 0, vy: 0, prevX: 1850, prevY: 290 },
    // Zone 2 horizontal sky-ferries between vanish pads
    { id: 'z2_m1', x: 4200, y: 330, w: 96, h: 16, startX: 4160, startY: 330, endX: 4320, endY: 330, speed: 1.55, phase: 0.4, vx: 0, vy: 0, prevX: 4200, prevY: 330 },
    { id: 'z2_m2', x: 4620, y: 298, w: 96, h: 16, startX: 4580, startY: 298, endX: 4740, endY: 298, speed: 1.6, phase: 1.8, vx: 0, vy: 0, prevX: 4620, prevY: 298 },
    { id: 'z2_m3', x: 5040, y: 275, w: 96, h: 16, startX: 5000, startY: 275, endX: 5160, endY: 275, speed: 1.65, phase: 0.9, vx: 0, vy: 0, prevX: 5040, prevY: 275 },
    // Zone 3 fast elevator up to penthouse
    { id: 'z3_el', x: 9340, y: 290, w: 106, h: 16, startX: 9340, startY: 365, endX: 9340, endY: 210, speed: 1.85, phase: 0, vx: 0, vy: 0, prevX: 9340, prevY: 290 },
  ];

  const enemies: EnemyDef[] = [
    // Zone 1
    makeEnemy('e1_1', 'ghost_wisp', 720, 180, 560, 960),
    makeEnemy('e1_2', 'sniper_turret', 1394, 102, 1394, 1394, { mount: 'wall-left' }),
    makeEnemy('e1_3', 'arcane_caster', 2380, 281, 2240, 2580),
    makeEnemy('e1_4', 'patrol_drone', 3520, 315, 3300, 3760),
    // Zone 2
    makeEnemy('e2_1', 'ghost_wisp', 4750, 190, 4450, 5180),
    makeEnemy('e2_2', 'patrol_drone', 5880, 330, 5660, 6080),
    makeEnemy('e2_3', 'arcane_caster', 6420, 296, 6320, 6520),
    makeEnemy('e2_4', 'ghost_wisp', 7380, 220, 7100, 7680),
    // Zone 3
    makeEnemy('e3_1', 'patrol_drone', 8080, 140, 7960, 8280),
    makeEnemy('e3_2', 'arcane_caster', 9900, 176, 9760, 10050),
    makeEnemy('e3_3', 'sniper_turret', 10210, 184, 10210, 10210),
    makeEnemy('e3_4', 'ghost_wisp', 10650, 195, 10380, 10960),
    makeEnemy('e3_sec', 'patrol_drone', 6860, -38, 6800, 6940),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('os_1', 495, 290, 4, 145, -55),
    ...makeOrbRow('os_2', 4470, 280, 3, 420, -25),
    ...makeOrbRow('os_3', 6160, 135, 3, 120, -25),
    ...makeOrbRow('os_4', 8420, 175, 3, 165, 55),
    ...makeOrbRow('os_5', 10390, 192, 4, 155, 34),
    { id: 'ob_s1', x: 1260, y: 122, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'ob_s2', x: 6430, y: 85, r: 10, collected: false, value: 300, bonus: true, phase: 1 },
    { id: 'ob_s3', x: 10080, y: 165, r: 10, collected: false, value: 300, bonus: true, phase: 2 },
    { id: 'ob_s4', x: 6910, y: -38, r: 10, collected: false, value: 300, bonus: true, phase: 0.8 },
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 3910, y: 350 },
    { x: 7600, y: 325 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 1080, y: 92, w: 140, h: 24, label: 'GLASS FACADE', color: '#38bdf8' },
    { x: 5580, y: 230, w: 146, h: 24, label: 'SKY SHAFT 02', color: '#a78bfa' },
    { x: 9640, y: 125, w: 152, h: 24, label: 'PENTHOUSE SPIRE', color: '#38f2ff' },
  ];

  const boostPads = [
    { id: '13_bp1', x: 1140, y: 152, w: 96, h: 10, boostVx: 520, boostVy: -150 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: '13_sec_sb1', x: 6772, y: -99, w: 34, h: 48, hp: 2, broken: false, hitFlash: 0 },
    { id: '13_sec_sb2', x: 6772, y: -51, w: 34, h: 47, hp: 2, broken: false, hitFlash: 0 },
  ];

  return emptyStage({
    id: '1-3',
    code: '1-3',
    title: 'ホログラム高層ビル群',
    subtitle: 'Skyline Ascent & Vanishing Spire',
    theme: 'sky_hologram',
    width: 11800,
    goal: { x: 11560, y: 224, w: 54, h: 116 },
    secretGoal: { x: 6975, y: -120, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    sealBlocks,
    boostPads,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
  });
}

// ============================================================================
// 中ボス砦: 魔導警備ゲート (10,600px / 検問所→重機格納庫→セキュリティ回廊→ボス隔離アリーナ)
// ============================================================================
function buildStageFort(): StageDefinition {
  const platforms: PlatformDef[] = [
    { id: 'ceil_all', x: 0, y: 0, w: 10600, h: 52, style: 'fortress' },

    // --- ZONE 1 (0..2950): 外郭検問所 ---
    { id: 'z1_g1', x: 0, y: 370, w: 720, h: 160, style: 'fortress' },
    { id: 'z1_trench', x: 720, y: 370, w: 480, h: 160, style: 'fortress' },
    { id: 'z1_br1', x: 760, y: 286, w: 130, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_br2', x: 980, y: 256, w: 140, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_g2', x: 1200, y: 370, w: 680, h: 160, style: 'fortress' },
    { id: 'z1_trench2', x: 1880, y: 370, w: 460, h: 160, style: 'fortress' },
    { id: 'z1_br3', x: 1990, y: 276, w: 220, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_g3', x: 2340, y: 370, w: 610, h: 160, style: 'fortress' },

    // --- ZONE 2 (2950..5900): 重機格納庫（ブルドーザー＆交差レーザー＋ボム金庫） ---
    { id: 'z2_g1a', x: 2950, y: 370, w: 710, h: 160, style: 'fortress' },
    { id: 'z2_g1b', x: 3745, y: 350, w: 685, h: 180, style: 'fortress' },
    { id: 'z2_cat1', x: 3320, y: 258, w: 280, h: 16, style: 'metal', oneWay: true },
    { id: 'z2_cat2', x: 3810, y: 258, w: 280, h: 16, style: 'metal', oneWay: true },
    { id: 'z2_pit', x: 4430, y: 370, w: 540, h: 160, style: 'fortress' },
    { id: 'z2_g2a', x: 4970, y: 370, w: 410, h: 160, style: 'fortress' },
    { id: 'z2_g2b', x: 5465, y: 345, w: 435, h: 185, style: 'fortress' },
    { id: 'z2_vault', x: 5340, y: 262, w: 230, h: 16, style: 'metal', oneWay: true },

    // --- ZONE 3 (5900..8700): 中枢セキュリティー回廊 ---
    { id: 'z3_g1', x: 5900, y: 370, w: 340, h: 160, style: 'fortress' },
    { id: 'z3_spikeFloorA', x: 6240, y: 370, w: 460, h: 160, style: 'fortress' },
    { id: 'z3_spikeFloorB', x: 6790, y: 370, w: 470, h: 160, style: 'fortress' },
    { id: 'z3_g2a', x: 7260, y: 370, w: 580, h: 160, style: 'fortress' },
    { id: 'z3_g2b', x: 7925, y: 345, w: 775, h: 185, style: 'fortress' },
    { id: 'z3_p1', x: 7650, y: 278, w: 160, h: 16, style: 'metal', oneWay: true },
    { id: 'z3_p2', x: 8060, y: 248, w: 160, h: 16, style: 'metal', oneWay: true },

    // --- BOSS ARENA (8700..9600) + VICTORY HALLWAY (9600..10600) ---
    { id: 'arena', x: 8700, y: 370, w: 1900, h: 160, style: 'fortress' },
    { id: 'arenaL', x: 8840, y: 275, w: 110, h: 16, style: 'metal', oneWay: true },
    { id: 'arenaR', x: 9280, y: 275, w: 110, h: 16, style: 'metal', oneWay: true },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: 'f_m1', x: 4520, y: 280, w: 105, h: 16, startX: 4470, startY: 295, endX: 4820, endY: 295, speed: 1.45, phase: 0, vx: 0, vy: 0, prevX: 4520, prevY: 280 },
    { id: 'f_m2', x: 6290, y: 295, w: 96, h: 16, startX: 6260, startY: 300, endX: 6490, endY: 255, speed: 1.55, phase: 0.4, vx: 0, vy: 0, prevX: 6290, prevY: 295 },
    { id: 'f_m3', x: 6640, y: 265, w: 96, h: 16, startX: 6600, startY: 255, endX: 6840, endY: 305, speed: 1.6, phase: 1.8, vx: 0, vy: 0, prevX: 6640, prevY: 265 },
    { id: 'f_m4', x: 6960, y: 285, w: 96, h: 16, startX: 6930, startY: 300, endX: 7160, endY: 270, speed: 1.65, phase: 0.9, vx: 0, vy: 0, prevX: 6960, prevY: 285 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: 'f_sb1', x: 5260, y: 294, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'f_sb2', x: 5260, y: 332, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
  ];

  const spikes: SpikeTrapDef[] = [
    { x: 740, y: 354, w: 440, h: 16 },
    { x: 1900, y: 354, w: 420, h: 16 },
    { x: 4450, y: 354, w: 500, h: 16 },
    { x: 6255, y: 354, w: 430, h: 16 },
    { x: 6805, y: 354, w: 440, h: 16 },
    { x: 7660, y: 354, w: 140, h: 16 },
  ];

  const lasers: RotatingLaserDef[] = [
    { id: 'fl_1', cx: 1510, cy: 265, length: 82, angle: 0, angularSpeed: 1.65 },
    { id: 'fl_2', cx: 2100, cy: 205, length: 76, angle: 1.2, angularSpeed: -1.8 },
    { id: 'fl_3', cx: 3480, cy: 190, length: 84, angle: 0.5, angularSpeed: 2.0 },
    { id: 'fl_4', cx: 3940, cy: 190, length: 84, angle: 2.1, angularSpeed: -2.0 },
    { id: 'fl_5', cx: 6540, cy: 215, length: 78, angle: 0.3, angularSpeed: 2.15 },
    { id: 'fl_6', cx: 6940, cy: 215, length: 78, angle: 1.7, angularSpeed: -2.2 },
    { id: 'fl_7', cx: 8140, cy: 195, length: 80, angle: 0.9, angularSpeed: 2.3 },
  ];

  const enemies: EnemyDef[] = [
    // Zone 1
    makeEnemy('fe1', 'shield_trooper', 540, 334, 420, 680),
    makeEnemy('fe2', 'sniper_turret', 1730, 52, 1730, 1730, { mount: 'ceiling' }),
    makeEnemy('fe3', 'shield_trooper', 2580, 334, 2400, 2860),
    // Zone 2
    makeEnemy('fe4', 'bulldozer_mech', 3250, 338, 3020, 3620),
    makeEnemy('fe5', 'bulldozer_mech', 4020, 318, 3780, 4340),
    makeEnemy('fe6', 'bomb_walker', 5140, 344, 5020, 5240),
    makeEnemy('fe7', 'sniper_turret', 5620, 52, 5620, 5620, { mount: 'ceiling' }),
    // Zone 3
    makeEnemy('fe8', 'shield_trooper', 7460, 334, 7320, 7620),
    makeEnemy('fe9', 'bulldozer_mech', 8040, 313, 7960, 8260),
    makeEnemy('fe10', 'sniper_turret', 8460, 52, 8460, 8460, { mount: 'ceiling' }),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('fo1', 790, 250, 3, 38),
    ...makeOrbRow('fo2', 2020, 242, 4, 48),
    ...makeOrbRow('fo3', 3390, 224, 4, 46),
    ...makeOrbRow('fo4', 6360, 210, 4, 180),
    ...makeOrbRow('fo_end', 9900, 335, 4, 52, 0, true),
    { id: 'f_ob1', x: 5450, y: 228, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'f_ob2', x: 8620, y: 305, r: 10, collected: false, value: 300, bonus: true, phase: 1.2 },
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 3010, y: 370 },
    { x: 5960, y: 370 },
    { x: 8740, y: 370 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 180, y: 205, w: 142, h: 24, label: 'SECURITY GATE', color: '#f43f5e' },
    { x: 3040, y: 205, w: 146, h: 24, label: 'ARMOR HANGAR', color: '#fb923c' },
    { x: 5960, y: 205, w: 152, h: 24, label: 'LASER CORRIDOR', color: '#fb7185' },
    { x: 9040, y: 125, w: 170, h: 24, label: 'GUARDIAN ARENA', color: '#fb7185' },
  ];

  const boss: BossDef = {
    kind: 'mid_guardian',
    x: 9380,
    y: 306,
    w: 48,
    h: 64,
    vx: 0,
    vy: 0,
    hp: 6,
    maxHp: 6,
    facing: -1,
    arenaMinX: 8750,
    arenaMaxX: 9540,
    floorY: 370,
    active: false,
    defeated: false,
    state: 'idle',
    stateTimer: 0.9,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyStage({
    id: '1-FORT',
    code: '砦',
    title: '魔導警備ゲート',
    subtitle: 'Fortress & Shield Guardian',
    theme: 'fortress_alert',
    width: 10600,
    goal: { x: 10340, y: 254, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    sealBlocks,
    spikes,
    lasers,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
    boss,
  });
}

// ============================================================================
// STAGE 1-4: 雨のネオン商店街 (12,600px / 滑り路面＋区間2上空に完全隠匿の秘密ゴール)
// ============================================================================
function buildStage1_4(): StageDefinition {
  const platforms: PlatformDef[] = [
    // --- ZONE 1 (0..4100): アーケード入口（ロングスライド＆雨の坂道） ---
    { id: 'z1_g1a', x: 0, y: 370, w: 640, h: 160, style: 'asphalt' },
    { id: 'z1_g1b', x: 720, y: 345, w: 460, h: 185, style: 'asphalt' },
    { id: 'z1_awn1', x: 340, y: 312, w: 180, h: 28, style: 'gantry' },
    { id: 'z1_awn2', x: 740, y: 287, w: 180, h: 28, style: 'gantry' },
    { id: 'z1_deck', x: 1260, y: 248, w: 150, h: 282, style: 'asphalt' },
    { id: 'z1_g2a', x: 1910, y: 385, w: 570, h: 145, style: 'asphalt' },
    { id: 'z1_g2b', x: 2565, y: 360, w: 425, h: 170, style: 'asphalt' },
    { id: 'z1_awn3', x: 2240, y: 327, w: 210, h: 28, style: 'gantry' },
    { id: 'z1_p1', x: 3080, y: 335, w: 130, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_p2', x: 3290, y: 295, w: 130, h: 16, style: 'metal', oneWay: true },
    { id: 'z1_g3', x: 3500, y: 370, w: 600, h: 160, style: 'asphalt' },

    // --- ZONE 2 (4100..8400): ネオン横丁（段差屋根＋秘密ゴール潜伏エリア） ---
    { id: 'z2_g1', x: 4100, y: 370, w: 720, h: 160, style: 'asphalt' },
    { id: 'z2_r1', x: 4900, y: 310, w: 540, h: 220, style: 'asphalt' },
    { id: 'z2_r2', x: 5520, y: 248, w: 580, h: 282, style: 'asphalt' },
    { id: 'z2_g2a', x: 6590, y: 370, w: 560, h: 160, style: 'asphalt' },
    { id: 'z2_g2b', x: 7235, y: 370, w: 720, h: 160, style: 'asphalt' },
    { id: 'z2_g2c', x: 8040, y: 335, w: 360, h: 195, style: 'asphalt' },
    { id: 'z2_awn1', x: 7260, y: 312, w: 260, h: 28, style: 'gantry' },
    // ULTRA-HIDDEN SECRET ROUTE ABOVE z2_awn1 (NO neon sign, NO orb clues!)
    { id: 'sec_step', x: 7420, y: 215, w: 68, h: 12, style: 'metal', oneWay: true },
    { id: 'sec_roof', x: 7520, y: 128, w: 380, h: 20, style: 'fortress' },
    { id: 'sec_ceil', x: 7520, y: 0, w: 280, h: 52, style: 'fortress' },

    // --- ZONE 3 (8400..12600): 雨水排水路＆夜の路面電車通り ---
    { id: 'z3_i1', x: 8400, y: 370, w: 460, h: 160, style: 'asphalt' },
    { id: 'z3_i2', x: 8960, y: 335, w: 340, h: 195, style: 'asphalt' },
    { id: 'z3_i3', x: 9400, y: 300, w: 340, h: 230, style: 'asphalt' },
    { id: 'z3_deck', x: 9840, y: 238, w: 180, h: 292, style: 'asphalt' },
    { id: 'z3_g2a', x: 10520, y: 375, w: 640, h: 155, style: 'asphalt' },
    { id: 'z3_g2b', x: 11245, y: 345, w: 680, h: 185, style: 'asphalt' },
    { id: 'z3_g2c', x: 12010, y: 325, w: 590, h: 205, style: 'asphalt' },
    { id: 'z3_awn1', x: 10960, y: 317, w: 180, h: 28, style: 'gantry' },
    { id: 'z3_awn2', x: 11320, y: 287, w: 180, h: 28, style: 'gantry' },
    { id: 'z3_awn3', x: 11680, y: 287, w: 180, h: 28, style: 'gantry' },
  ];

  const slopes: SlopeDef[] = [
    { id: 'r_s1', x1: 1410, y1: 248, x2: 1910, y2: 385, bottomY: 530 },
    { id: 'r_s2', x1: 6100, y1: 248, x2: 6590, y2: 370, bottomY: 530 },
    { id: 'r_s3', x1: 10020, y1: 238, x2: 10520, y2: 375, bottomY: 530 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: 'sec_sb1', x: 7545, y: 52, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'sec_sb2', x: 7545, y: 90, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
  ];

  const enemies: EnemyDef[] = [
    // Zone 1
    makeEnemy('re1', 'hopping_bot', 575, 344, 530, 625),
    makeEnemy('re2', 'shield_trooper', 1020, 309, 950, 1140),
    makeEnemy('re3', 'bulldozer_mech', 2060, 353, 1960, 2210),
    makeEnemy('re4', 'hopping_bot', 2740, 334, 2600, 2940),
    makeEnemy('re5', 'patrol_drone', 3760, 334, 3560, 4020),
    // Zone 2
    makeEnemy('re6', 'bulldozer_mech', 5120, 278, 4950, 5390),
    makeEnemy('re7', 'arcane_caster', 5860, 214, 5740, 6020),
    makeEnemy('re8', 'shield_trooper', 6940, 334, 6780, 7110),
    makeEnemy('re9', 'hopping_bot', 7760, 344, 7620, 7920),
    // Zone 3
    makeEnemy('re10', 'patrol_drone', 9110, 298, 8990, 9270),
    makeEnemy('re11', 'bulldozer_mech', 10720, 343, 10580, 10930),
    makeEnemy('re12', 'shield_trooper', 11560, 309, 11510, 11655),
    makeEnemy('re13', 'arcane_caster', 12130, 291, 12030, 12250),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('ro1', 370, 350, 4, 38),
    ...makeOrbRow('ro2', 1470, 242, 7, 60, 17),
    ...makeOrbRow('ro3', 2275, 365, 5, 36),
    ...makeOrbRow('ro4', 6155, 244, 7, 60, 15),
    ...makeOrbRow('ro5', 10075, 234, 7, 62, 18),
    ...makeOrbRow('ro6', 11000, 355, 4, 38),
    { id: 'r_ob1', x: 3355, y: 255, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'r_ob2', x: 8630, y: 330, r: 10, collected: false, value: 300, bonus: true, phase: 1.5 },
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 4160, y: 370 },
    { x: 8460, y: 370 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 360, y: 274, w: 140, h: 24, label: 'RAINY ARCADE', color: '#38bdf8' },
    { x: 2270, y: 289, w: 146, h: 24, label: 'CYBER BAZAAR', color: '#e879f9' },
    { x: 8480, y: 240, w: 142, h: 24, label: 'CANAL STREET', color: '#38bdf8' },
  ];

  return emptyStage({
    id: '1-4',
    code: '1-4',
    title: '雨のネオン商店街',
    subtitle: 'Slick Asphalt & Hidden Rooftop',
    theme: 'rainy_arcade',
    slippery: true,
    width: 12600,
    goal: { x: 12360, y: 209, w: 54, h: 116 },
    secretGoal: { x: 7825, y: 12, w: 54, h: 116 },
    platforms,
    slopes,
    sealBlocks,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
  });
}

// ============================================================================
// STAGE 1-S: 地下秘密魔導庫 (6,800px / 採掘坂道→浮遊宝物庫→3層黄金金庫)
// ============================================================================
function buildStage1_S(): StageDefinition {
  const platforms: PlatformDef[] = [
    // Zone 1 (0..2300)
    { id: 's_g1', x: 0, y: 370, w: 420, h: 160, style: 'asphalt' },
    { id: 's_dk1', x: 420, y: 240, w: 140, h: 290, style: 'asphalt' },
    { id: 's_g2a', x: 1080, y: 380, w: 500, h: 150, style: 'asphalt' },
    { id: 's_g2b', x: 1660, y: 350, w: 470, h: 180, style: 'asphalt' },
    { id: 's_sh1', x: 1280, y: 265, w: 240, h: 16, style: 'metal', oneWay: true },

    // Zone 2 (2300..4550)
    { id: 's_g3', x: 2220, y: 365, w: 280, h: 165, style: 'asphalt' },
    { id: 's_g4a', x: 3160, y: 355, w: 580, h: 175, style: 'asphalt' },
    { id: 's_g4b', x: 3820, y: 320, w: 520, h: 210, style: 'asphalt' },
    { id: 's_gan', x: 3420, y: 297, w: 260, h: 28, style: 'gantry' },
    { id: 's_top', x: 3440, y: 205, w: 220, h: 16, style: 'metal', oneWay: true },

    // Zone 3 (4550..6800)
    { id: 's_dk2', x: 4440, y: 230, w: 180, h: 300, style: 'asphalt' },
    { id: 's_g5a', x: 5140, y: 380, w: 450, h: 150, style: 'asphalt' },
    { id: 's_g5b', x: 5665, y: 355, w: 415, h: 175, style: 'asphalt' },
    { id: 's_tier1', x: 5340, y: 295, w: 240, h: 16, style: 'metal', oneWay: true },
    { id: 's_tier2', x: 5620, y: 225, w: 240, h: 16, style: 'metal', oneWay: true },
    { id: 's_goal', x: 6180, y: 360, w: 620, h: 170, style: 'asphalt' },
  ];

  const slopes: SlopeDef[] = [
    { id: 'ss_1', x1: 560, y1: 240, x2: 1080, y2: 380, bottomY: 530 },
    { id: 'ss_2', x1: 4620, y1: 230, x2: 5140, y2: 380, bottomY: 530 },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: 'sm_1', x: 2590, y: 335, w: 96, h: 16, startX: 2560, startY: 345, endX: 2770, endY: 295, speed: 1.55, phase: 0, vx: 0, vy: 0, prevX: 2590, prevY: 335 },
    { id: 'sm_2', x: 2910, y: 295, w: 96, h: 16, startX: 2880, startY: 285, endX: 3080, endY: 340, speed: 1.55, phase: 1.4, vx: 0, vy: 0, prevX: 2910, prevY: 295 },
  ];

  const sealBlocks: SealBlockDef[] = [
    { id: 'ssb1', x: 1320, y: 340, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'ssb2', x: 1360, y: 340, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'ssb3', x: 1400, y: 340, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'ssb4', x: 1440, y: 340, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'ssb5', x: 1340, y: 300, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
    { id: 'ssb6', x: 1420, y: 300, w: 36, h: 38, hp: 1, broken: false, hitFlash: 0 },
  ];

  const enemies: EnemyDef[] = [
    makeEnemy('se1', 'bomb_walker', 1200, 354, 1120, 1295),
    makeEnemy('se2', 'slime_glitch', 1840, 330, 1690, 2080),
    makeEnemy('se3', 'ghost_wisp', 3550, 175, 3260, 3840),
    makeEnemy('se4', 'slime_glitch', 4040, 300, 3850, 4280),
    makeEnemy('se5', 'slime_glitch', 5840, 335, 5700, 6030),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('so_1', 620, 230, 8, 55, 16, true),
    ...makeOrbRow('so_2', 1300, 232, 5, 48, 0, true),
    ...makeOrbRow('so_3', 3470, 175, 4, 48, 0, true),
    ...makeOrbRow('so_4', 4680, 222, 8, 55, 16, true),
    ...makeOrbRow('so_5', 5365, 265, 4, 52, 0, true),
    ...makeOrbRow('so_6', 5645, 195, 4, 52, 0, true),
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 2260, y: 365 },
    { x: 4500, y: 230 },
  ];

  return emptyStage({
    id: '1-S',
    code: '1-S',
    title: '地下秘密魔導庫',
    subtitle: 'Hidden Crystal Shortcut Vault',
    theme: 'secret_vault',
    width: 6800,
    goal: { x: 6580, y: 244, w: 54, h: 116 },
    platforms,
    slopes,
    movingPlatforms,
    sealBlocks,
    enemies,
    orbs,
    checkpoints,
    neonSigns: [{ x: 120, y: 245, w: 156, h: 24, label: 'TREASURE VAULT', color: '#fbbf24' }],
  });
}

// ============================================================================
// STAGE 1-5: 浮遊する魔導図書館 (11,600px / 上昇気流→無重力星図室→連続鏡回廊)
// ============================================================================
function buildStage1_5(): StageDefinition {
  const platforms: PlatformDef[] = [
    // --- ZONE 1 (0..3800): 大書庫エントランス（上昇気流＋シアン鏡ワープ） ---
    { id: 'z1_g1', x: 0, y: 370, w: 500, h: 160, style: 'library_shelf' },
    { id: 'z1_sh1', x: 615, y: 255, w: 140, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z1_sh2', x: 820, y: 165, w: 200, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z1_wall', x: 1090, y: 0, w: 48, h: 530, style: 'fortress' },
    { id: 'z1_g2a', x: 1220, y: 350, w: 400, h: 180, style: 'library_shelf' },
    { id: 'z1_g2b', x: 1705, y: 330, w: 535, h: 200, style: 'library_shelf' },
    { id: 'z1_sh3', x: 1640, y: 248, w: 170, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z1_sh4', x: 2390, y: 295, w: 160, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z1_sh5', x: 2740, y: 240, w: 160, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z1_g3', x: 3080, y: 365, w: 720, h: 165, style: 'library_shelf' },

    // --- ZONE 2 (3800..7800): 無重力星図室（大低重力ドーム＋縦紫鏡＋緑鏡） ---
    { id: 'z2_g1', x: 3800, y: 365, w: 320, h: 165, style: 'library_shelf' },
    { id: 'z2_f1', x: 4240, y: 315, w: 150, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z2_f2', x: 4540, y: 205, w: 160, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z2_f3', x: 4860, y: 275, w: 150, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z2_f4', x: 5180, y: 165, w: 160, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z2_f5', x: 5490, y: 255, w: 150, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z2_g2', x: 5760, y: 370, w: 480, h: 160, style: 'library_shelf' },
    // Upper floating sky-archive reached by Purple Mirror
    { id: 'z2_sky', x: 6320, y: 190, w: 660, h: 20, style: 'library_shelf' },
    { id: 'z2_wall', x: 7060, y: 0, w: 48, h: 530, style: 'fortress' },
    { id: 'z2_g3', x: 7190, y: 360, w: 610, h: 170, style: 'library_shelf' },

    // --- ZONE 3 (7800..11600): 禁書タワー最上階（2連上昇気流＋琥珀大奈落鏡ワープ） ---
    { id: 'z3_g1', x: 7800, y: 360, w: 360, h: 170, style: 'library_shelf' },
    { id: 'z3_sh1', x: 8320, y: 230, w: 170, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z3_mid', x: 8620, y: 345, w: 340, h: 185, style: 'library_shelf' },
    { id: 'z3_sh2', x: 9140, y: 215, w: 180, h: 18, style: 'library_shelf', oneWay: true },
    { id: 'z3_g2', x: 9440, y: 360, w: 720, h: 170, style: 'library_shelf' },
    { id: 'z3_wall', x: 10240, y: 0, w: 48, h: 530, style: 'fortress' },
    { id: 'z3_end1', x: 10440, y: 340, w: 600, h: 190, style: 'library_shelf' },
    { id: 'z3_end2', x: 11125, y: 310, w: 475, h: 220, style: 'library_shelf' },
    { id: 'z3_sh3', x: 10840, y: 245, w: 160, h: 18, style: 'library_shelf', oneWay: true },
  ];

  const gravityZones: GravityZoneDef[] = [
    { id: 'gz_1', x: 505, y: 110, w: 110, h: 320, mode: 'updraft' },
    { id: 'gz_2', x: 2290, y: 90, w: 740, h: 340, mode: 'low_grav' },
    { id: 'gz_3', x: 4160, y: 75, w: 1540, h: 365, mode: 'low_grav' },
    { id: 'gz_4', x: 8170, y: 100, w: 120, h: 330, mode: 'updraft' },
    { id: 'gz_5', x: 8970, y: 95, w: 120, h: 335, mode: 'updraft' },
  ];

  const mirrors: MagicMirrorDef[] = [
    { id: 'mirA1', x: 955, y: 97, w: 30, h: 66, targetMirrorId: 'mirA2', color: '#38f2ff', cooldown: 0 },
    { id: 'mirA2', x: 1275, y: 282, w: 30, h: 66, targetMirrorId: 'mirA1', color: '#38f2ff', cooldown: 0 },
    { id: 'mirB1', x: 6140, y: 302, w: 30, h: 66, targetMirrorId: 'mirB2', color: '#c084fc', cooldown: 0 },
    { id: 'mirB2', x: 6365, y: 122, w: 30, h: 66, targetMirrorId: 'mirB1', color: '#c084fc', cooldown: 0 },
    { id: 'mirC1', x: 6915, y: 122, w: 30, h: 66, targetMirrorId: 'mirC2', color: '#34d399', cooldown: 0 },
    { id: 'mirC2', x: 7255, y: 292, w: 30, h: 66, targetMirrorId: 'mirC1', color: '#34d399', cooldown: 0 },
    { id: 'mirD1', x: 10070, y: 292, w: 30, h: 66, targetMirrorId: 'mirD2', color: '#fbbf24', cooldown: 0 },
    { id: 'mirD2', x: 10510, y: 272, w: 30, h: 66, targetMirrorId: 'mirD1', color: '#fbbf24', cooldown: 0 },
  ];

  const enemies: EnemyDef[] = [
    makeEnemy('le1', 'arcane_caster', 360, 336, 280, 440),
    makeEnemy('le2', 'slime_glitch', 1940, 310, 1740, 2180),
    makeEnemy('le3', 'ghost_wisp', 2620, 150, 2340, 2960),
    makeEnemy('le4', 'ghost_wisp', 4680, 145, 4340, 5020),
    makeEnemy('le5', 'ghost_wisp', 5340, 155, 5060, 5620),
    makeEnemy('le6', 'arcane_caster', 6660, 156, 6500, 6820),
    makeEnemy('le7', 'ghost_wisp', 8520, 150, 8250, 8850),
    makeEnemy('le8', 'arcane_caster', 9740, 326, 9560, 9940),
    makeEnemy('le9', 'arcane_caster', 10910, 306, 10800, 11010),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('lo1', 540, 290, 3, 0, -55),
    ...makeOrbRow('lo2', 4280, 280, 4, 305, -28),
    ...makeOrbRow('lo3', 6540, 155, 4, 72),
    ...makeOrbRow('lo4', 8215, 290, 3, 0, -55),
    { id: 'l_ob1', x: 1720, y: 210, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'l_ob2', x: 5255, y: 128, r: 10, collected: false, value: 300, bonus: true, phase: 1 },
    { id: 'l_ob3', x: 10915, y: 208, r: 10, collected: false, value: 300, bonus: true, phase: 2 },
  ];

  const checkpoints = [
    { x: 70, y: 370 },
    { x: 3860, y: 365 },
    { x: 7860, y: 360 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 120, y: 225, w: 146, h: 24, label: 'GRAND LIBRARY', color: '#c084fc' },
    { x: 3850, y: 225, w: 148, h: 24, label: 'ZERO-G ATRIUM', color: '#38f2ff' },
    { x: 7850, y: 225, w: 152, h: 24, label: 'FORBIDDEN TOWER', color: '#fbbf24' },
  ];

  return emptyStage({
    id: '1-5',
    code: '1-5',
    title: '浮遊する魔導図書館',
    subtitle: 'Updrafts, Low-Gravity & Mirror Warps',
    theme: 'arcane_library',
    width: 11600,
    goal: { x: 11360, y: 194, w: 54, h: 116 },
    platforms,
    gravityZones,
    mirrors,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
  });
}

// ============================================================================
// STAGE 1-6: 高速モノレール屋根上疾走 (11,600px / 強制横スクロール136px/s 非反復車両構成)
// ============================================================================
function buildStage1_6(): StageDefinition {
  const platforms: PlatformDef[] = [
    // --- ZONE 1 (0..3850): 貨物車両区画 ---
    { id: 't_c1', x: 0, y: 350, w: 800, h: 180, style: 'train_car' },
    { id: 't_g1', x: 380, y: 292, w: 145, h: 26, style: 'gantry' },
    { id: 't_c2', x: 895, y: 332, w: 720, h: 198, style: 'train_car' },
    { id: 't_c3', x: 1710, y: 308, w: 860, h: 222, style: 'train_car' },
    { id: 't_g2', x: 2050, y: 250, w: 160, h: 26, style: 'gantry' },
    { id: 't_c4a', x: 2670, y: 345, w: 520, h: 185, style: 'train_car' },
    { id: 't_c4b', x: 3290, y: 325, w: 480, h: 205, style: 'train_car' },

    // --- ZONE 2 (3850..7750): 二階建て客車＆連結ギャップ連続地帯 ---
    { id: 't_c5', x: 3870, y: 345, w: 460, h: 185, style: 'train_car' },
    { id: 't_c6', x: 4430, y: 300, w: 410, h: 230, style: 'train_car' },
    { id: 't_c7', x: 4940, y: 270, w: 380, h: 260, style: 'train_car' },
    { id: 't_c8', x: 5420, y: 330, w: 470, h: 200, style: 'train_car' },
    { id: 't_g3', x: 5580, y: 272, w: 130, h: 26, style: 'gantry' },
    { id: 't_c9', x: 5995, y: 295, w: 450, h: 235, style: 'train_car' },
    { id: 't_c10', x: 6550, y: 345, w: 540, h: 185, style: 'train_car' },
    { id: 't_c11', x: 7190, y: 315, w: 520, h: 215, style: 'train_car' },

    // --- ZONE 3 (7750..11600): 先頭動力車スプリント＆終着駅 ---
    { id: 't_c12', x: 7810, y: 345, w: 840, h: 185, style: 'train_car' },
    { id: 't_g4', x: 8080, y: 287, w: 150, h: 26, style: 'gantry' },
    { id: 't_c13', x: 8755, y: 315, w: 720, h: 215, style: 'train_car' },
    { id: 't_g5', x: 9020, y: 257, w: 150, h: 26, style: 'gantry' },
    { id: 't_c14a', x: 9580, y: 345, w: 580, h: 185, style: 'train_car' },
    { id: 't_c14b', x: 10260, y: 320, w: 580, h: 210, style: 'train_car' },
    { id: 't_g6', x: 9920, y: 287, w: 160, h: 26, style: 'gantry' },
    { id: 'goalCar', x: 10945, y: 345, w: 655, h: 185, style: 'train_car' },
  ];

  const enemies: EnemyDef[] = [
    makeEnemy('te1', 'patrol_drone', 620, 312, 550, 760),
    makeEnemy('te2', 'hopping_bot', 1240, 306, 1020, 1520),
    makeEnemy('te3', 'patrol_drone', 2380, 272, 2240, 2530),
    makeEnemy('te4', 'shield_trooper', 3480, 289, 3330, 3700),
    makeEnemy('te5', 'hopping_bot', 4620, 274, 4470, 4790),
    makeEnemy('te6', 'patrol_drone', 5130, 234, 4980, 5280),
    makeEnemy('te7', 'shield_trooper', 6220, 259, 6040, 6400),
    makeEnemy('te8', 'hopping_bot', 6820, 319, 6610, 7030),
    makeEnemy('te9', 'patrol_drone', 8420, 308, 8260, 8610),
    makeEnemy('te10', 'shield_trooper', 9280, 279, 9200, 9430),
    makeEnemy('te11', 'bulldozer_mech', 10520, 288, 10300, 10790),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('to1', 405, 330, 3, 36),
    ...makeOrbRow('to2', 820, 285, 2, 42, -10),
    ...makeOrbRow('to3', 2080, 288, 3, 38),
    ...makeOrbRow('to4', 4345, 255, 2, 42, -12),
    ...makeOrbRow('to5', 5600, 310, 3, 38),
    ...makeOrbRow('to6', 8110, 325, 3, 38),
    ...makeOrbRow('to7', 9950, 325, 3, 40),
    { id: 't_ob1', x: 3560, y: 280, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 't_ob2', x: 7450, y: 270, r: 10, collected: false, value: 300, bonus: true, phase: 1.5 },
  ];

  const checkpoints = [
    { x: 110, y: 350 },
    { x: 3920, y: 345 },
    { x: 7860, y: 345 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 140, y: 205, w: 152, h: 24, label: 'CARGO EXPRESS', color: '#38bdf8' },
    { x: 3910, y: 205, w: 160, h: 24, label: 'DOUBLE DECKER', color: '#22d3ee' },
    { x: 7860, y: 205, w: 162, h: 24, label: 'HEAD LOCOMOTIVE', color: '#a78bfa' },
  ];

  return emptyStage({
    id: '1-6',
    code: '1-6',
    title: '高速モノレール屋根上疾走',
    subtitle: 'Auto-Scroll Express Train Roof',
    theme: 'monorail_rush',
    autoScrollSpeed: 136,
    width: 11600,
    spawn: { x: 110, y: 295 },
    goal: { x: 11360, y: 229, w: 54, h: 116 },
    platforms,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
  });
}

// ============================================================================
// 1-BOSS: 電脳魔導飛行船 (10,300px / 船首甲板→複層機関室→艦橋防衛線→アークメイジ隔離決戦)
// ============================================================================
function buildStageBoss(): StageDefinition {
  const platforms: PlatformDef[] = [
    // --- ZONE 1 (0..2850): 船首外舷甲板 ---
    { id: 'b_d1a', x: 0, y: 360, w: 480, h: 170, style: 'fortress' },
    { id: 'b_d1b', x: 555, y: 335, w: 365, h: 195, style: 'fortress' },
    { id: 'b_up1', x: 260, y: 272, w: 140, h: 16, style: 'metal', oneWay: true },
    { id: 'b_d2', x: 1020, y: 335, w: 840, h: 195, style: 'fortress' },
    { id: 'b_up2', x: 1320, y: 245, w: 160, h: 16, style: 'metal', oneWay: true },
    { id: 'b_d3', x: 1960, y: 360, w: 890, h: 170, style: 'fortress' },

    // --- ZONE 2 (2850..5750): 機関室上部・多重甲板＋移動クレーン ---
    { id: 'b_d4a', x: 2850, y: 365, w: 700, h: 165, style: 'fortress' },
    { id: 'b_d4b', x: 3635, y: 345, w: 565, h: 185, style: 'fortress' },
    { id: 'b_cat1', x: 3080, y: 238, w: 460, h: 16, style: 'metal', oneWay: true },
    { id: 'b_cat2', x: 3640, y: 238, w: 420, h: 16, style: 'metal', oneWay: true },
    { id: 'b_d5', x: 4920, y: 350, w: 830, h: 180, style: 'fortress' },

    // --- ZONE 3 (5750..8450): 艦橋直前防衛線 ---
    { id: 'b_d6', x: 5750, y: 320, w: 580, h: 210, style: 'fortress' },
    { id: 'b_d7', x: 6430, y: 280, w: 620, h: 250, style: 'fortress' },
    { id: 'b_d8a', x: 7150, y: 355, w: 590, h: 175, style: 'fortress' },
    { id: 'b_d8b', x: 7825, y: 335, w: 525, h: 195, style: 'fortress' },
    { id: 'b_up3', x: 7520, y: 258, w: 180, h: 16, style: 'metal', oneWay: true },

    // --- FLAGSHIP BOSS ARENA (8450..9320) + VICTORY DECK (9320..10300) ---
    { id: 'arena', x: 8450, y: 370, w: 1850, h: 160, style: 'fortress' },
    { id: 'ap1', x: 8580, y: 284, w: 130, h: 16, style: 'metal', oneWay: true },
    { id: 'ap2', x: 9030, y: 284, w: 130, h: 16, style: 'metal', oneWay: true },
  ];

  const movingPlatforms: MovingPlatformDef[] = [
    { id: 'bm_1', x: 4290, y: 310, w: 108, h: 16, startX: 4240, startY: 340, endX: 4480, endY: 275, speed: 1.45, phase: 0, vx: 0, vy: 0, prevX: 4290, prevY: 310 },
    { id: 'bm_2', x: 4620, y: 285, w: 108, h: 16, startX: 4580, startY: 270, endX: 4820, endY: 335, speed: 1.5, phase: 1.6, vx: 0, vy: 0, prevX: 4620, prevY: 285 },
  ];

  const cannons: CannonDef[] = [
    { id: 'bc1', x: 780, y: 307, dir: -1, angle: -0.18, interval: 2.3, timer: 0.8 },
    { id: 'bc2', x: 1740, y: 307, dir: -1, angle: -0.24, interval: 2.1, timer: 0.3 },
    { id: 'bc3', x: 2680, y: 332, dir: -1, angle: -0.16, interval: 2.0, timer: 1.2 },
    { id: 'bc4', x: 5560, y: 322, dir: -1, angle: -0.22, interval: 2.0, timer: 0.6 },
    { id: 'bc5', x: 6920, y: 252, dir: -1, angle: -0.15, interval: 1.95, timer: 1.1 },
    { id: 'bc6', x: 8160, y: 307, dir: -1, angle: -0.25, interval: 1.95, timer: 0.2 },
  ];

  const enemies: EnemyDef[] = [
    makeEnemy('be1', 'shield_trooper', 660, 299, 580, 740),
    makeEnemy('be2', 'bomb_walker', 1240, 309, 1080, 1520),
    makeEnemy('be3', 'patrol_drone', 2260, 322, 2060, 2520),
    makeEnemy('be4', 'shield_trooper', 3240, 329, 3000, 3500),
    makeEnemy('be5', 'sniper_turret', 3880, 212, 3880, 3880),
    makeEnemy('be6', 'arcane_caster', 5240, 316, 5040, 5440),
    makeEnemy('be7', 'bulldozer_mech', 5980, 288, 5810, 6260),
    makeEnemy('be8', 'arcane_caster', 6660, 246, 6500, 6820),
    makeEnemy('be9', 'bulldozer_mech', 7380, 323, 7200, 7680),
  ];

  const orbs: ManaOrbDef[] = [
    ...makeOrbRow('bo1', 290, 240, 3, 38),
    ...makeOrbRow('bo2', 1355, 214, 3, 42),
    ...makeOrbRow('bo3', 3210, 205, 4, 52),
    ...makeOrbRow('bo4', 7560, 224, 3, 45),
    ...makeOrbRow('o_end', 9640, 335, 4, 52, 0, true),
    { id: 'b_ob1', x: 2480, y: 315, r: 10, collected: false, value: 300, bonus: true, phase: 0 },
    { id: 'b_ob2', x: 5410, y: 305, r: 10, collected: false, value: 300, bonus: true, phase: 1 },
    { id: 'b_ob3', x: 8260, y: 295, r: 10, collected: false, value: 300, bonus: true, phase: 2 },
  ];

  const checkpoints = [
    { x: 70, y: 360 },
    { x: 2910, y: 365 },
    { x: 5810, y: 320 },
    { x: 8490, y: 370 },
  ];

  const neonSigns: NeonSignDef[] = [
    { x: 140, y: 205, w: 158, h: 24, label: 'AIRSHIP BOW DECK', color: '#a78bfa' },
    { x: 2920, y: 185, w: 162, h: 24, label: 'ENGINE UPPER DECK', color: '#38bdf8' },
    { x: 5810, y: 185, w: 166, h: 24, label: 'BRIDGE PERIMETER', color: '#f43f5e' },
    { x: 8790, y: 125, w: 176, h: 24, label: 'ARCHMAGE BRIDGE', color: '#38f2ff' },
  ];

  const boss: BossDef = {
    kind: 'archmage',
    x: 9080,
    y: 222,
    w: 44,
    h: 58,
    vx: 0,
    vy: 0,
    hp: 11,
    maxHp: 11,
    facing: -1,
    arenaMinX: 8490,
    arenaMaxX: 9290,
    floorY: 370,
    active: false,
    defeated: false,
    state: 'hover',
    stateTimer: 1.55,
    stunTimer: 0,
    hitFlash: 0,
    phase: 1,
    clones: [],
  };

  return emptyStage({
    id: '1-BOSS',
    code: 'BOSS',
    title: '電脳魔導飛行船',
    subtitle: 'Dreadnought Deck & Archmage Finale',
    theme: 'airship_boss',
    width: 10300,
    goal: { x: 10040, y: 254, w: 54, h: 116 },
    platforms,
    movingPlatforms,
    cannons,
    enemies,
    orbs,
    checkpoints,
    neonSigns,
    boss,
  });
}

export function createStage(stageId: string): StageDefinition {

  const encW4 = buildWorld4EncounterStage(stageId);
  if (encW4) return encW4;

  const enc = buildEncounterStage(stageId);
  if (enc) return enc;

  const w2 = buildWorld2Stage(stageId);
  if (w2) return w2;

  const w3 = buildWorld3Stage(stageId);
  if (w3) return w3;

  const w4 = buildWorld4Stage(stageId);
  if (w4) return w4;

  switch (stageId) {
    case '1-1':
      return buildStage1_1();
    case '1-2':
      return buildStage1_2();
    case '1-S':
      return buildStage1_S();
    case '1-3':
      return buildStage1_3();
    case '1-FORT':
      return buildStageFort();
    case '1-4':
      return buildStage1_4();
    case '1-5':
      return buildStage1_5();
    case '1-6':
      return buildStage1_6();
    case '1-BOSS':
      return buildStageBoss();
    default:
      return buildStage1_1();
  }
}
