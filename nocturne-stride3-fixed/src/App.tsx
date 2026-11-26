import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bug,
  ChevronRight,
  Code2,
  Flag,
  Lock,
  Map as MapIcon,
  RotateCcw,
  Smartphone,
  Sparkles,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { EnemyLabScreen } from './components/EnemyLabScreen';
import { sound } from './game/audio';
import { GameEngine, HudSnapshot } from './game/engine';
import { ENEMY_ENCYCLOPEDIA } from './game/gameData';
import {
  SECRET_WARP_EDGES,
  STAGE_LIST_META,
  WORLD_1_NODES,
  WORLD_2_NODES,
  WORLD_2_STAGE_LIST_META,
  WORLD_3_NODES,
  WORLD_3_STAGE_LIST_META,
  WORLD_4_NODES,
  WORLD_4_STAGE_LIST_META,
} from './game/levels';
import { GameScreen, StageProgress } from './game/types';
import { MapSelectionInfo, WorldMapEngine } from './game/worldMapEngine';

const INITIAL_HUD: HudSnapshot = {
  stageId: '1-1',
  stageCode: '1-1',
  stageTitle: 'ネオン大通りの序章',
  status: 'PLAYING',
  hp: 100,
  maxHp: 100,
  score: 0,
  orbsCollected: 0,
  totalOrbs: 0,
  elapsedSec: 0,
  enemiesDefeated: 0,
  isSecretClear: false,
  boss: null,
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [currentWorld, setCurrentWorld] = useState<1 | 2 | 3 | 4>(1);
  const [currentStageId, setCurrentStageId] = useState<string>('1-1');
  const [progress, setProgress] = useState<Record<string, StageProgress>>({});
  const [devUnlockAll, setDevUnlockAll] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [lastMapNodeId, setLastMapNodeId] = useState<string>('1-1');

  const [mapSelection, setMapSelection] = useState<MapSelectionInfo>({
    node: WORLD_1_NODES[0],
    unlocked: true,
    cleared: false,
    activeEncounter: null,
  });
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [isPortrait, setIsPortrait] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );

  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapEngineRef = useRef<WorldMapEngine | null>(null);
  const stageEngineRef = useRef<GameEngine | null>(null);

  const handleMapSelectionChange = useCallback((info: MapSelectionInfo) => {
    setMapSelection(info);
    setLastMapNodeId(info.node.id);
  }, []);

  const handleStageClear = useCallback((snap: HudSnapshot) => {
    setProgress((prev) => {
      const old = prev[snap.stageId];
      return {
        ...prev,
        [snap.stageId]: {
          cleared: true,
          secretCleared: Boolean(old?.secretCleared || snap.isSecretClear),
          bestScore: Math.max(old?.bestScore ?? 0, snap.score),
          bestOrbs: Math.max(old?.bestOrbs ?? 0, snap.orbsCollected),
          totalOrbs: snap.totalOrbs,
        },
      };
    });
  }, []);

  const enterStage = useCallback((stageId: string) => {
    sound.unlock();
    const nextWorld: 1 | 2 | 3 | 4 =
      stageId.startsWith('4-') || stageId.startsWith('ENC_W4_')
        ? 4
        : stageId.startsWith('3-') || stageId.startsWith('ENC_W3_')
          ? 3
          : stageId.startsWith('2-') || stageId.startsWith('ENC_W2_')
            ? 2
            : 1;
    setCurrentWorld(nextWorld);
    setCurrentStageId(stageId);
    if (!stageId.startsWith('ENC_')) {
      setLastMapNodeId(stageId);
    }
    setDevOpen(false);
    setScreen('STAGE');
  }, []);

  const returnToMap = useCallback(() => {
    sound.unlock();
    setDevOpen(false);
    setCurrentWorld((prev) =>
      currentStageId.startsWith('4-') || currentStageId.startsWith('ENC_W4_')
        ? 4
        : currentStageId.startsWith('3-') || currentStageId.startsWith('ENC_W3_')
          ? 3
          : currentStageId.startsWith('2-') || currentStageId.startsWith('ENC_W2_')
            ? 2
            : currentStageId.startsWith('1-') || currentStageId.startsWith('ENC_W1_')
              ? 1
              : prev
    );
    setScreen('WORLD_MAP');
  }, [currentStageId]);

  const switchWorld = useCallback((world: 1 | 2 | 3 | 4) => {
    sound.unlock();
    setCurrentWorld(world);
    if (screen === 'WORLD_MAP' && mapEngineRef.current) {
      mapEngineRef.current.focusWorld(world);
      return;
    }
    const defaultNode =
      world === 4 ? '4-1' : world === 3 ? '3-1' : world === 2 ? '2-1' : '1-1';
    setLastMapNodeId(defaultNode);
    setCurrentStageId(defaultNode);
    setScreen('WORLD_MAP');
  }, [screen]);

  const advanceToWorld = useCallback((world: 2 | 3 | 4) => {
    sound.unlock();
    setCurrentWorld(world);
    const defaultNode =
      world === 4 ? '4-1' : world === 3 ? '3-1' : '2-1';
    setLastMapNodeId(defaultNode);
    setCurrentStageId(defaultNode);
    setScreen('WORLD_MAP');
  }, []);

  const startWithW1Cleared = useCallback(() => {
    sound.unlock();
    const w1AllCleared: Record<string, StageProgress> = {};
    for (const id of ['1-1', '1-2', '1-3', '1-FORT', '1-4', '1-S', '1-5', '1-6', '1-BOSS']) {
      w1AllCleared[id] = {
        cleared: true,
        secretCleared: id === '1-4',
        bestScore: 3000,
        bestOrbs: 15,
        totalOrbs: 15,
      };
    }
    setDevUnlockAll(false);
    setProgress(w1AllCleared);
    setCurrentWorld(2);
    setLastMapNodeId('2-1');
    setCurrentStageId('2-1');
    setDevOpen(false);
    setScreen('WORLD_MAP');
  }, []);

  const startWithW2Cleared = useCallback(() => {
    sound.unlock();
    const clearedMap: Record<string, StageProgress> = {};
    for (const id of [
      '1-1', '1-2', '1-3', '1-FORT', '1-4', '1-S', '1-5', '1-6', '1-BOSS',
      '2-1', '2-2', '2-FORT', '2-3', '2-4', '2-5', '2-6', '2-7', '2-BOSS',
    ]) {
      clearedMap[id] = {
        cleared: true,
        secretCleared: id === '1-4',
        bestScore: 3200,
        bestOrbs: 15,
        totalOrbs: 15,
      };
    }
    setDevUnlockAll(false);
    setProgress(clearedMap);
    setCurrentWorld(3);
    setLastMapNodeId('3-1');
    setCurrentStageId('3-1');
    setDevOpen(false);
    setScreen('WORLD_MAP');
  }, []);

  const startWithW3Cleared = useCallback(() => {
    sound.unlock();
    const clearedMap: Record<string, StageProgress> = {};
    for (const id of [
      '1-1', '1-2', '1-3', '1-FORT', '1-4', '1-S', '1-5', '1-6', '1-BOSS',
      '2-1', '2-2', '2-FORT', '2-3', '2-4', '2-5', '2-6', '2-7', '2-BOSS',
      '3-1', '3-2', '3-3', '3-FORT1', '3-4', '3-5', '3-FORT2', '3-6', '3-7', '3-BOSS',
    ]) {
      clearedMap[id] = {
        cleared: true,
        secretCleared: id === '1-4',
        bestScore: 3600,
        bestOrbs: 16,
        totalOrbs: 16,
      };
    }
    setDevUnlockAll(false);
    setProgress(clearedMap);
    setCurrentWorld(4);
    setLastMapNodeId('4-1');
    setCurrentStageId('4-1');
    setDevOpen(false);
    setScreen('WORLD_MAP');
  }, []);

  const startWithW4Cleared = useCallback(() => {
    sound.unlock();
    const clearedMap: Record<string, StageProgress> = {};
    for (const id of [
      '1-1', '1-2', '1-3', '1-FORT', '1-4', '1-S', '1-5', '1-6', '1-BOSS',
      '2-1', '2-2', '2-FORT', '2-3', '2-4', '2-5', '2-6', '2-7', '2-BOSS',
      '3-1', '3-2', '3-3', '3-FORT1', '3-4', '3-5', '3-FORT2', '3-6', '3-7', '3-BOSS',
      '4-1', '4-2', '4-3', '4-FORT1', '4-4', '4-5', '4-6', '4-FORT2', '4-BOSS',
    ]) {
      clearedMap[id] = {
        cleared: true,
        secretCleared: id === '1-4',
        bestScore: 4000,
        bestOrbs: 16,
        totalOrbs: 16,
      };
    }
    setDevUnlockAll(false);
    setProgress(clearedMap);
    setCurrentWorld(4);
    setLastMapNodeId('4-BOSS');
    setCurrentStageId('4-BOSS');
    setDevOpen(false);
    setScreen('WORLD_MAP');
  }, []);

  const resetProgress = useCallback(() => {
    sound.unlock();
    setDevUnlockAll(false);
    setProgress({});
    setCurrentWorld(1);
    setLastMapNodeId('1-1');
    setCurrentStageId('1-1');
    setDevOpen(false);
    setScreen('WORLD_MAP');
  }, []);

  const openEnemyLab = useCallback(() => {
    sound.unlock();
    setDevOpen(false);
    setScreen('ENEMY_LAB');
  }, []);

  // Orientation lock monitoring
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      mapEngineRef.current?.setPortraitPaused(portrait);
      stageEngineRef.current?.setPortraitPaused(portrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // World Map Engine lifecycle
  useEffect(() => {
    if (screen !== 'WORLD_MAP' && screen !== 'TITLE') return;
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    const engine = new WorldMapEngine(canvas, {
      onEnterStage: enterStage,
      onSelectionChange: handleMapSelectionChange,
    });
    mapEngineRef.current = engine;
    engine.setPortraitPaused(window.innerHeight > window.innerWidth);
    engine.start();

    return () => {
      engine.destroy();
      mapEngineRef.current = null;
    };
  }, [screen, enterStage, handleMapSelectionChange]);

  // Keep World Map progress/active state synced
  useEffect(() => {
    mapEngineRef.current?.setState({
      progress,
      devUnlockAll,
      worldId: currentWorld,
      currentNodeId: lastMapNodeId,
      active: screen === 'WORLD_MAP',
    });
  }, [progress, devUnlockAll, currentWorld, lastMapNodeId, screen]);

  // Stage Engine lifecycle
  useEffect(() => {
    if (screen !== 'STAGE') return;
    const canvas = stageCanvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, currentStageId, {
      onHudUpdate: setHud,
      onStageClear: handleStageClear,
    });
    stageEngineRef.current = engine;
    engine.setPortraitPaused(window.innerHeight > window.innerWidth);
    engine.start();

    return () => {
      engine.destroy();
      stageEngineRef.current = null;
    };
  }, [screen, currentStageId, handleStageClear]);

  // Allow keyboard Enter/Space to start from Title.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen !== 'TITLE') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.unlock();
        setScreen('WORLD_MAP');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const cs = Math.floor((sec % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const totalScore = Object.values(progress).reduce((sum, p) => sum + p.bestScore, 0);
  const w1ClearedCount = WORLD_1_NODES.filter(
    (n) => n.stageId !== null && !n.requiresSecret && progress[n.id]?.cleared
  ).length;
  const w2StageNodes = WORLD_2_NODES.filter((n) => n.stageId !== null);
  const w2ClearedCount = w2StageNodes.filter((n) => progress[n.id]?.cleared).length;
  const world2Unlocked =
    devUnlockAll ||
    Boolean(progress['1-BOSS']?.cleared || progress['1-3']?.secretCleared || progress['1-S']?.cleared);
  const w3StageNodes = WORLD_3_NODES.filter((n) => n.stageId !== null);
  const w3ClearedCount = w3StageNodes.filter((n) => progress[n.id]?.cleared).length;
  const world3Unlocked =
    devUnlockAll ||
    Boolean(progress['2-BOSS']?.cleared || progress['2-3']?.secretCleared || progress['2-5']?.secretCleared);
  const w4StageNodes = WORLD_4_NODES.filter((n) => n.stageId !== null);
  const w4ClearedCount = w4StageNodes.filter((n) => progress[n.id]?.cleared).length;
  const world4Unlocked =
    devUnlockAll ||
    Boolean(progress['3-BOSS']?.cleared || progress['3-3']?.secretCleared || progress['3-6']?.secretCleared);
  const secretStageCleared = Boolean(progress['1-S']?.cleared);
  const secretWarpTarget = SECRET_WARP_EDGES.find((e) => e.from === hud.stageId)?.to ?? null;
  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const hpBarColor =
    hpPct > 55
      ? 'from-cyan-400 to-sky-400 shadow-[0_0_10px_rgba(56,242,255,0.45)]'
      : hpPct > 25
        ? 'from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.45)]'
        : 'from-rose-500 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.55)]';

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#060918] select-none">
      {/* WORLD MAP / TITLE VIEW */}
      {(screen === 'TITLE' || screen === 'WORLD_MAP') && (
        <>
          <canvas
            ref={mapCanvasRef}
            className="block w-full h-full touch-none"
            aria-label="World Overhead Map Canvas"
          />

          {screen === 'WORLD_MAP' && (
            <>
              {/* World Map Camera Focus */}
              <header className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 px-3 py-3 sm:px-6">
                <div className="pointer-events-auto flex items-center gap-1 bg-[#090e24]/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-1 shadow-lg overflow-x-auto max-w-[65vw]">
                  <button
                    type="button"
                    onClick={() => switchWorld(1)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                      currentWorld === 1
                        ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    W1 都市
                  </button>
                  <button
                    type="button"
                    disabled={!world2Unlocked}
                    onClick={() => switchWorld(2)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 transition-colors whitespace-nowrap ${
                      !world2Unlocked
                        ? 'text-slate-600 cursor-not-allowed'
                        : currentWorld === 2
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 cursor-pointer'
                          : 'text-slate-300 hover:text-amber-300 cursor-pointer'
                    }`}
                    title={world2Unlocked ? 'W2エリアへカメラ移動' : '1-BOSSまたは隠しワープで開放'}
                  >
                    {!world2Unlocked && <Lock className="w-3 h-3" />}
                    <span>W2 歯車</span>
                  </button>
                  <button
                    type="button"
                    disabled={!world3Unlocked}
                    onClick={() => switchWorld(3)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 transition-colors whitespace-nowrap ${
                      !world3Unlocked
                        ? 'text-slate-600 cursor-not-allowed'
                        : currentWorld === 3
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/60 cursor-pointer'
                          : 'text-slate-300 hover:text-emerald-300 cursor-pointer'
                    }`}
                    title={world3Unlocked ? 'W3エリアへカメラ移動' : '2-BOSSまたは隠しワープで開放'}
                  >
                    {!world3Unlocked && <Lock className="w-3 h-3" />}
                    <span>W3 樹海</span>
                  </button>
                  <button
                    type="button"
                    disabled={!world4Unlocked}
                    onClick={() => switchWorld(4)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 transition-colors whitespace-nowrap ${
                      !world4Unlocked
                        ? 'text-slate-600 cursor-not-allowed'
                        : currentWorld === 4
                          ? 'bg-sky-400/20 text-sky-200 border border-sky-400/60 cursor-pointer'
                          : 'text-slate-300 hover:text-sky-200 cursor-pointer'
                    }`}
                    title={world4Unlocked ? 'W4エリアへカメラ移動' : '3-BOSSまたは隠しワープで開放'}
                  >
                    {!world4Unlocked && <Lock className="w-3 h-3" />}
                    <span>W4 蒼氷</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 bg-[#090e24]/75 backdrop-blur-md border border-slate-700/50 rounded-xl px-3 py-2 text-xs font-hud-mono shadow-lg">
                    <span className="text-slate-400">CLEAR</span>
                    <span className="text-emerald-300 font-bold">
                      {currentWorld === 4
                        ? `${w4ClearedCount}/${w4StageNodes.length}`
                        : currentWorld === 3
                          ? `${w3ClearedCount}/${w3StageNodes.length}`
                          : currentWorld === 2
                            ? `${w2ClearedCount}/${w2StageNodes.length}`
                            : `${w1ClearedCount}/8${secretStageCleared ? '+S' : ''}`}
                    </span>
                    <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                    <span className="text-slate-400 hidden sm:inline">SCORE</span>
                    <span className="text-white font-bold hidden sm:inline">{String(totalScore).padStart(5, '0')}</span>
                  </div>
                </div>
              </header>

              {/* Selected Node Footer Card + Enter Stage Action */}
              <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-20 flex items-end justify-center px-4">
                <div className="pointer-events-auto flex items-center gap-4 bg-[#090e24]/82 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-hud-mono text-xs font-bold ${
                        mapSelection.activeEncounter ? 'text-rose-400' : 'text-cyan-300'
                      }`}
                    >
                      {mapSelection.node.code}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white leading-tight">
                        {mapSelection.activeEncounter
                          ? `${mapSelection.node.name}（${mapSelection.activeEncounter.name}）`
                          : mapSelection.node.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-hud-mono mt-0.5">
                        {mapSelection.activeEncounter
                          ? '徘徊エネミー遭遇中 · バトル開始でミニボス戦へ！'
                          : mapSelection.node.stageId === null
                            ? '中継区画 · ステージマスまたは敵アイコンへ移動してください'
                            : progress[mapSelection.node.id]?.cleared
                              ? `BEST ${progress[mapSelection.node.id].bestScore} · ORBS ${progress[mapSelection.node.id].bestOrbs}/${progress[mapSelection.node.id].totalOrbs}`
                              : '左スライド/矢印で移動 · マス直接タップ/右タップで突入'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      !mapSelection.unlocked ||
                      (!mapSelection.node.stageId && !mapSelection.activeEncounter)
                    }
                    onClick={() => mapEngineRef.current?.enterSelected()}
                    className={`min-h-[40px] px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed ${
                      mapSelection.activeEncounter
                        ? 'bg-rose-500 hover:bg-rose-400 active:scale-95 text-white'
                        : 'bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950'
                    }`}
                  >
                    <span>
                      {mapSelection.activeEncounter
                        ? '迎撃バトル'
                        : mapSelection.node.stageId
                          ? 'スタート'
                          : '通過区画'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prominent Corner Developer Debug Button */}
              <div className="fixed bottom-3 right-3 z-30">
                <button
                  type="button"
                  onClick={() => setDevOpen((v) => !v)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#090e24]/85 hover:bg-slate-800/95 border border-indigo-400/50 text-xs font-medium text-indigo-200 hover:text-cyan-300 flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
                  aria-label="開発者デバッグメニュー"
                >
                  <Bug className="w-4 h-4 text-indigo-300" />
                  <span>デバッグ</span>
                </button>
              </div>
            </>
          )}

          {/* TITLE OVERLAY */}
          {screen === 'TITLE' && !isPortrait && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#050816]/60 backdrop-blur-[3px] p-4">
              <div className="w-full max-w-xl rounded-2xl bg-[#0b1126]/92 border border-slate-700/60 p-6 shadow-2xl text-center">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  NOCTURNE STRIDE
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
                  ワールドマップ・複数ルート＆隠しワープ
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-left text-xs text-slate-300 bg-[#060a18]/75 border border-slate-800 rounded-xl p-3.5">
                  <div>
                    <div className="font-semibold text-cyan-300 mb-1">画面左半分（移動）</div>
                    <p className="leading-relaxed text-slate-400">
                      左右スライドで歩行〜ダッシュ
                      <br />
                      下フリックでスライディング
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-cyan-300 mb-1">画面右半分（アクション）</div>
                    <p className="leading-relaxed text-slate-400">
                      タップ長押しで可変／2段ジャンプ
                      <br />
                      右スワイプ・2本指・2連タップで魔導弾
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 font-hud-mono">
                  PC: ←/→ or A/D 移動 · ↓/S スライド · Space ジャンプ · Z/Enter 魔導弾
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDevOpen(true)}
                    className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/55 text-indigo-200 hover:text-cyan-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Bug className="w-4 h-4 text-indigo-300" />
                    <span>デバッグ（全開放・敵ラボ）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlock();
                      setScreen('WORLD_MAP');
                    }}
                    className="px-7 py-2.5 min-h-[44px] rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(56,242,255,0.35)] cursor-pointer"
                  >
                    ワールドマップへ
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* STAGE GAMEPLAY VIEW */}
      {screen === 'STAGE' && (
        <>
          <canvas
            ref={stageCanvasRef}
            className="block w-full h-full touch-none"
            aria-label="Stage Action Game Canvas"
          />

          {/* Minimal Stylish Stage HUD */}
          <header className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            {/* Top-Left: Stage, HP Gauge, Score & Orbs */}
            <div className="flex items-center gap-3 sm:gap-4 bg-[#090e24]/72 backdrop-blur-md border border-slate-700/45 rounded-xl px-3.5 py-2 shadow-lg">
              <span className="font-hud-mono text-xs font-bold text-cyan-300">{hud.stageCode}</span>
              <span className="h-3.5 w-px bg-slate-700/70" aria-hidden="true" />
              <div
                className="flex items-center gap-2"
                aria-label={`HP ${hud.hp} of ${hud.maxHp}`}
              >
                <span className="font-hud-mono text-[11px] font-bold text-slate-300">HP</span>
                <div className="w-20 sm:w-28 h-2.5 rounded-full bg-slate-800/95 border border-slate-700/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-200 ${hpBarColor}`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
                <span className="font-hud-mono text-xs font-bold text-white min-w-[52px] text-right">
                  {hud.hp}/{hud.maxHp}
                </span>
              </div>

              <span className="h-3.5 w-px bg-slate-700/70" aria-hidden="true" />

              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-hud-mono">
                <span className="text-white font-bold">{String(hud.score).padStart(5, '0')}</span>
                <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {hud.orbsCollected}/{hud.totalOrbs}
                </span>
              </div>
            </div>

            {/* Center Boss HP Bar (only active during Boss Battle) */}
            {hud.boss && (
              <div className="flex flex-col items-center bg-[#090e24]/80 backdrop-blur-md border border-rose-500/45 rounded-xl px-3.5 py-1.5 shadow-lg min-w-[155px] sm:min-w-[225px]">
                <div className="text-[11px] font-semibold text-rose-300 mb-1 truncate max-w-[210px]">
                  {hud.boss.name}
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-150"
                    style={{ width: `${(hud.boss.hp / hud.boss.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Top-Right: Debug, Map & Reset */}
            <div className="pointer-events-auto flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDevOpen((v) => !v)}
                className="min-h-[40px] px-3 py-2 flex items-center gap-1.5 rounded-xl bg-[#090e24]/75 hover:bg-indigo-950/90 active:scale-95 backdrop-blur-md border border-indigo-400/50 text-xs font-medium text-indigo-200 hover:text-cyan-300 transition-all shadow-lg cursor-pointer whitespace-nowrap"
                aria-label="デバッグメニュー"
              >
                <Bug className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">デバッグ</span>
              </button>
              <button
                type="button"
                onClick={returnToMap}
                className="min-h-[40px] px-3 py-2 flex items-center gap-1.5 rounded-xl bg-[#090e24]/70 hover:bg-slate-800/85 active:scale-95 backdrop-blur-md border border-slate-700/50 text-xs font-medium text-slate-200 hover:text-cyan-300 transition-all shadow-lg cursor-pointer whitespace-nowrap"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>マップ</span>
              </button>
              <button
                type="button"
                onClick={() => stageEngineRef.current?.restartStage()}
                className="min-h-[40px] px-3 py-2 flex items-center gap-1.5 rounded-xl bg-[#090e24]/70 hover:bg-slate-800/85 active:scale-95 backdrop-blur-md border border-slate-700/50 text-xs font-medium text-slate-200 hover:text-cyan-300 transition-all shadow-lg cursor-pointer whitespace-nowrap"
                aria-label="リセット"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>リセット</span>
              </button>
            </div>
          </header>

          {/* STAGE CLEAR OVERLAY */}
          {hud.status === 'VICTORY' && !isPortrait && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#050816]/65 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl bg-[#0b1126]/92 border border-emerald-400/40 p-6 shadow-2xl text-center">
                <h2 className="text-2xl font-bold text-emerald-300 tracking-tight">
                  {hud.stageId.startsWith('ENC_')
                    ? 'MINI-BOSS DEFEATED!'
                    : hud.stageId === '1-BOSS'
                      ? 'WORLD 1 COMPLETE!'
                      : hud.stageId === '2-BOSS'
                        ? 'WORLD 2 COMPLETE!'
                        : hud.stageId === '3-BOSS'
                          ? 'WORLD 3 COMPLETE!'
                          : hud.stageId === '4-BOSS'
                            ? 'WORLD 4 COMPLETE!'
                            : hud.isSecretClear
                                ? 'SECRET GOAL FOUND!'
                                : 'STAGE CLEAR'}
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  {hud.stageCode} · {hud.stageTitle}
                </p>
                {hud.stageId === '1-BOSS' && (
                  <p className="mt-1 text-xs text-amber-300 font-semibold">
                    新エリア「ワールド2：黄金の歯車と雷鳴の境界エリア」が開放されました！
                  </p>
                )}
                {hud.stageId === '2-BOSS' && (
                  <p className="mt-1 text-xs text-emerald-300 font-semibold">
                    新エリア「ワールド3：翡翠の樹海と結晶聖域」が開放されました！
                  </p>
                )}
                {hud.stageId === '3-BOSS' && (
                  <p className="mt-1 text-xs text-sky-300 font-semibold">
                    新エリア「ワールド4：蒼氷と絶対零度の王城」が開放されました！
                  </p>
                )}
                {hud.isSecretClear && (
                  <p className="mt-1 text-xs text-amber-300 font-medium">
                    {hud.stageId === '1-4'
                      ? 'ワールドマップに隠しルート「1-S（地下秘密魔導庫）」が出現しました！'
                      : secretWarpTarget
                        ? `シークレットワープ開通！「${secretWarpTarget}」へ直接スキップ可能になりました！`
                        : '隠しゴールを発見しました！'}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs font-hud-mono bg-[#060a18]/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-left text-slate-400">SCORE</div>
                  <div className="text-right text-white font-bold">{hud.score}</div>
                  <div className="text-left text-slate-400">MANA ORBS</div>
                  <div className="text-right text-cyan-300 font-bold">
                    {hud.orbsCollected} / {hud.totalOrbs}
                  </div>
                  <div className="text-left text-slate-400">DEFEATED</div>
                  <div className="text-right text-amber-300 font-bold">{hud.enemiesDefeated}</div>
                  <div className="text-left text-slate-400">TIME</div>
                  <div className="text-right text-emerald-300 font-bold">{formatTime(hud.elapsedSec)}</div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => stageEngineRef.current?.restartStage()}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    もう一度
                  </button>
                  <button
                    type="button"
                    onClick={returnToMap}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(52,211,153,0.35)] cursor-pointer"
                  >
                    ワールドマップへ
                  </button>
                  {hud.stageId === '1-BOSS' && (
                    <button
                      type="button"
                      onClick={() => advanceToWorld(2)}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] cursor-pointer"
                    >
                      ワールド2へ進む
                    </button>
                  )}
                  {hud.stageId === '2-BOSS' && (
                    <button
                      type="button"
                      onClick={() => advanceToWorld(3)}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(52,211,153,0.45)] cursor-pointer"
                    >
                      ワールド3へ進む
                    </button>
                  )}
                  {hud.stageId === '3-BOSS' && (
                    <button
                      type="button"
                      onClick={() => advanceToWorld(4)}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-sky-400 hover:bg-sky-300 active:scale-95 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(56,189,248,0.45)] cursor-pointer"
                    >
                      ワールド4へ進む
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {hud.status === 'GAME_OVER' && !isPortrait && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#050816]/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#0b1126]/92 border border-rose-500/40 p-6 shadow-2xl text-center">
                <h2 className="text-2xl font-bold text-rose-400 tracking-tight">GAME OVER</h2>
                <p className="mt-1.5 text-xs text-slate-300 font-hud-mono">
                  {hud.stageCode} · SCORE: {hud.score}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={returnToMap}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    マップへ
                  </button>
                  <button
                    type="button"
                    onClick={() => stageEngineRef.current?.restartStage()}
                    className="px-6 py-2.5 min-h-[44px] rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-bold text-sm transition-all cursor-pointer"
                  >
                    リトライ
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ENEMY BEHAVIOR VIEWER & TEST LAB */}
      {screen === 'ENEMY_LAB' && (
        <EnemyLabScreen
          isPortrait={isPortrait}
          onBackToMap={returnToMap}
          onBackToTitle={() => setScreen('TITLE')}
          onJumpStage={enterStage}
        />
      )}

      {/* Global Developer Debug Modal (accessible from Title, World Map, Stage) */}
      {devOpen && !isPortrait && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#040712]/70 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#090e24]/98 border border-indigo-400/50 p-4 sm:p-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-bold text-white">デバッグ・テストコントロール</span>
              </div>
              <button
                type="button"
                onClick={() => setDevOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDevUnlockAll((v) => !v)}
              className={`w-full mb-2 py-2.5 px-3 rounded-xl border text-left font-medium flex items-center justify-between cursor-pointer transition-colors ${
                devUnlockAll
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-cyan-300" />
                <span>全ステージ無条件開放</span>
              </span>
              <span className="font-hud-mono text-xs font-bold">
                {devUnlockAll ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={startWithW1Cleared}
                className="py-2 px-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>W1済</span>
              </button>
              <button
                type="button"
                onClick={startWithW2Cleared}
                className="py-2 px-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>W2済</span>
              </button>
              <button
                type="button"
                onClick={startWithW3Cleared}
                className="py-2 px-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>W3済</span>
              </button>
              <button
                type="button"
                onClick={startWithW4Cleared}
                className="py-2 px-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/60 text-rose-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>W4済</span>
              </button>
              <button
                type="button"
                onClick={resetProgress}
                className="col-span-2 sm:col-span-1 py-2 px-1.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-400/60 text-slate-300 hover:text-rose-200 font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>リセット</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openEnemyLab}
              className="w-full mb-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500/25 to-cyan-500/20 hover:from-indigo-500/35 hover:to-cyan-500/30 border border-cyan-400/60 text-white font-bold flex items-center justify-between cursor-pointer transition-all"
            >
              <span className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-cyan-300" />
                <span>敵キャラ挙動ビューア（全{ENEMY_ENCYCLOPEDIA.length}種ラボ）</span>
              </span>
              <ChevronRight className="w-4 h-4 text-cyan-300" />
            </button>

            <div className="mb-1 text-[11px] font-semibold text-cyan-300">
              WORLD 1 無条件ダイレクトジャンプ（クリア不要）
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {STAGE_LIST_META.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => enterStage(st.id)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800/85 hover:bg-cyan-500/25 border border-slate-700 hover:border-cyan-400/60 text-left cursor-pointer transition-colors"
                >
                  <div className="font-hud-mono text-[11px] font-bold text-cyan-300">{st.code}</div>
                  <div className="text-[10px] text-slate-300 truncate">{st.name}</div>
                </button>
              ))}
            </div>

            <div className="mb-1 text-[11px] font-semibold text-amber-300">
              WORLD 2 無条件ダイレクトジャンプ（クリア不要）
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {WORLD_2_STAGE_LIST_META.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => enterStage(st.id)}
                  className="py-1.5 px-2 rounded-lg bg-amber-950/35 hover:bg-amber-500/25 border border-amber-700/50 hover:border-amber-400/70 text-left cursor-pointer transition-colors"
                >
                  <div className="font-hud-mono text-[11px] font-bold text-amber-300">{st.code}</div>
                  <div className="text-[10px] text-amber-100/90 truncate">{st.name}</div>
                </button>
              ))}
            </div>

            <div className="mb-1 text-[11px] font-semibold text-emerald-300">
              WORLD 3 無条件ダイレクトジャンプ（クリア不要）
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {WORLD_3_STAGE_LIST_META.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => enterStage(st.id)}
                  className="py-1.5 px-2 rounded-lg bg-emerald-950/35 hover:bg-emerald-500/25 border border-emerald-700/50 hover:border-emerald-400/70 text-left cursor-pointer transition-colors"
                >
                  <div className="font-hud-mono text-[11px] font-bold text-emerald-300">{st.code}</div>
                  <div className="text-[10px] text-emerald-100/90 truncate">{st.name}</div>
                </button>
              ))}
            </div>

            <div className="mb-1 text-[11px] font-semibold text-sky-300">
              WORLD 4 無条件ダイレクトジャンプ（クリア不要）
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {WORLD_4_STAGE_LIST_META.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => enterStage(st.id)}
                  className="py-1.5 px-2 rounded-lg bg-sky-950/40 hover:bg-sky-500/25 border border-sky-700/50 hover:border-sky-400/70 text-left cursor-pointer transition-colors"
                >
                  <div className="font-hud-mono text-[11px] font-bold text-sky-300">{st.code}</div>
                  <div className="text-[10px] text-sky-100/90 truncate">{st.name}</div>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Portrait Orientation Guidance Overlay */}
      {isPortrait && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060918]/88 backdrop-blur-md px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-cyan-400/35 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(56,242,255,0.2)]">
            <Smartphone className="w-8 h-8 text-cyan-300 rotate-90 transition-transform" />
          </div>
          <p className="text-base font-semibold text-white leading-relaxed text-balance">
            横画面（ランドスケープ）にしてプレイしてください
          </p>
          <p className="mt-2 text-xs text-slate-400">
            端末を横向きに回転するとゲームが再開します
          </p>
        </div>
      )}
    </div>
  );
}
