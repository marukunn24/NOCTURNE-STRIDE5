import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Heart,
  Map as MapIcon,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shield,
  ShieldOff,
  Sparkles,
  X,
} from 'lucide-react';
import { drawEnemyPortrait } from '../game/enemyPortrait';
import { GameEngine, HudSnapshot } from '../game/engine';
import { ENEMY_ENCYCLOPEDIA, EnemyDocEntry, EnemyPortraitKind } from '../game/gameData';
import {
  STAGE_LIST_META,
  WORLD_2_STAGE_LIST_META,
  WORLD_3_STAGE_LIST_META,
  WORLD_4_STAGE_LIST_META,
} from '../game/levels';

interface EnemyLabScreenProps {
  isPortrait: boolean;
  onBackToMap: () => void;
  onBackToTitle: () => void;
  onJumpStage: (stageId: string) => void;
}

type FilterCategory = 'ALL' | '通常敵' | '特殊敵' | 'ギミック' | 'ボス';

function EnemyThumb({ kind, size = 34 }: { kind: EnemyPortraitKind; size?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const scale = size / 56;
    drawEnemyPortrait(ctx, kind, size / 2, size / 2, scale);
  }, [kind, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} className="shrink-0" />;
}

const INITIAL_LAB_HUD: HudSnapshot = {
  stageId: 'SANDBOX',
  stageCode: 'LAB',
  stageTitle: '敵キャラ挙動テストラボ',
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

export function EnemyLabScreen({
  isPortrait,
  onBackToMap,
  onBackToTitle,
  onJumpStage,
}: EnemyLabScreenProps) {
  const [selectedKind, setSelectedKind] = useState<EnemyPortraitKind>('patrol_drone');
  const [godMode, setGodMode] = useState(true);
  const [aiPaused, setAiPaused] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [filterCat, setFilterCat] = useState<FilterCategory>('ALL');
  const [query, setQuery] = useState('');
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_LAB_HUD);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const activeEntry: EnemyDocEntry = useMemo(
    () => ENEMY_ENCYCLOPEDIA.find((e) => e.kind === selectedKind) ?? ENEMY_ENCYCLOPEDIA[0],
    [selectedKind]
  );

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENEMY_ENCYCLOPEDIA.filter((e) => {
      const catOk =
        filterCat === 'ALL'
          ? true
          : filterCat === 'ボス'
            ? e.category === '中ボス' || e.category === '大ボス'
            : e.category === filterCat;
      if (!catOk) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.behavior.toLowerCase().includes(q) ||
        e.kind.toLowerCase().includes(q)
      );
    });
  }, [filterCat, query]);

  // Initialize sandbox engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(
      canvas,
      'SANDBOX',
      { onHudUpdate: setHud },
      { sandboxEnemy: selectedKind, godMode, aiPaused }
    );
    engineRef.current = engine;
    engine.setPortraitPaused(window.innerHeight > window.innerWidth);
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setPortraitPaused(isPortrait);
  }, [isPortrait]);

  useEffect(() => {
    engineRef.current?.setGodMode(godMode);
  }, [godMode]);

  useEffect(() => {
    engineRef.current?.setAiPaused(aiPaused);
  }, [aiPaused]);

  const handleSelectEnemy = (kind: EnemyPortraitKind) => {
    setSelectedKind(kind);
    engineRef.current?.spawnSandboxTarget(kind);
  };

  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const hpBarColor =
    hpPct > 55
      ? 'from-cyan-400 to-sky-400'
      : hpPct > 25
        ? 'from-amber-400 to-orange-400'
        : 'from-rose-500 to-red-500';

  return (
    <div className="relative w-screen h-[100dvh] flex flex-col bg-[#060918] overflow-hidden select-none">
      {/* Top Control Bar */}
      <header className="shrink-0 z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#090f26]/95 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToMap}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600/60 text-xs font-medium text-slate-200 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>マップ</span>
          </button>

          <button
            type="button"
            onClick={onBackToTitle}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white hidden sm:inline-flex items-center cursor-pointer"
          >
            タイトル
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setStagePickerOpen((v) => !v)}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/50 text-xs font-medium text-indigo-200 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>全ステージ直行</span>
            </button>
            {stagePickerOpen && (
              <div className="absolute left-0 top-11 z-50 w-72 max-h-[75dvh] overflow-y-auto rounded-xl bg-[#090e24]/98 border border-slate-700/80 p-3 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-300">無条件ステージジャンプ（W1〜W4）</span>
                  <button
                    type="button"
                    onClick={() => setStagePickerOpen(false)}
                    className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] font-hud-mono text-cyan-300 mb-1">WORLD 1</div>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {STAGE_LIST_META.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStagePickerOpen(false);
                        onJumpStage(st.id);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-800/90 hover:bg-cyan-500/25 border border-slate-700 hover:border-cyan-400/60 text-[11px] font-hud-mono text-slate-100 truncate cursor-pointer"
                      title={st.name}
                    >
                      {st.code}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-hud-mono text-amber-300 mb-1">WORLD 2</div>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {WORLD_2_STAGE_LIST_META.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStagePickerOpen(false);
                        onJumpStage(st.id);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-amber-950/45 hover:bg-amber-500/25 border border-amber-700/50 hover:border-amber-400/70 text-[11px] font-hud-mono text-amber-100 truncate cursor-pointer"
                      title={st.name}
                    >
                      {st.code}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-hud-mono text-emerald-300 mb-1">WORLD 3</div>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {WORLD_3_STAGE_LIST_META.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStagePickerOpen(false);
                        onJumpStage(st.id);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-emerald-950/45 hover:bg-emerald-500/25 border border-emerald-700/50 hover:border-emerald-400/70 text-[11px] font-hud-mono text-emerald-100 truncate cursor-pointer"
                      title={st.name}
                    >
                      {st.code}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-hud-mono text-sky-300 mb-1">WORLD 4</div>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {WORLD_4_STAGE_LIST_META.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStagePickerOpen(false);
                        onJumpStage(st.id);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-sky-950/45 hover:bg-sky-500/25 border border-sky-700/50 hover:border-sky-400/70 text-[11px] font-hud-mono text-sky-100 truncate cursor-pointer"
                      title={st.name}
                    >
                      {st.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HP Readout */}
          <div className="flex items-center gap-1.5 bg-[#060a18]/90 border border-slate-700/60 rounded-lg px-2.5 py-1">
            <span className="font-hud-mono text-[11px] font-bold text-slate-300">HP</span>
            <div className="w-16 sm:w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-150 ${hpBarColor}`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <span className="font-hud-mono text-[11px] font-bold text-white">
              {hud.hp}/{hud.maxHp}
            </span>
            <button
              type="button"
              onClick={() => engineRef.current?.resetHpOnly()}
              className="ml-1 p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 cursor-pointer"
              title="HP全回復"
              aria-label="HP全回復"
            >
              <Heart className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center Boss HP if boss selected */}
        {hud.boss && (
          <div className="hidden md:flex items-center gap-2 bg-[#060a18]/90 border border-rose-500/40 rounded-lg px-3 py-1">
            <span className="text-[11px] font-semibold text-rose-300 truncate max-w-[140px]">
              {hud.boss.name}
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-150"
                style={{ width: `${(hud.boss.hp / hud.boss.maxHp) * 100}%` }}
              />
            </div>
            <span className="font-hud-mono text-[11px] text-rose-200">
              {hud.boss.hp}/{hud.boss.maxHp}
            </span>
          </div>
        )}

        {/* Right Sandbox Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGodMode((v) => !v)}
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              godMode
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            title="無敵ONでも被弾ダメージ数値(-XX HP)は画面に表示されます"
          >
            {godMode ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
            <span>無敵: {godMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAiPaused((v) => !v)}
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              aiPaused
                ? 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-cyan-400/50'
            }`}
          >
            {aiPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{aiPaused ? 'AI停止中' : 'AI稼働中'}</span>
          </button>

          <button
            type="button"
            onClick={() => engineRef.current?.spawnSandboxTarget(selectedKind)}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-medium text-cyan-200 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>再召喚</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
            title="敵解説カード表示切替"
          >
            {showInfo ? <Eye className="w-3.5 h-3.5 text-cyan-300" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">解説</span>
          </button>
        </div>
      </header>

      {/* Main Playable Sandbox Arena */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none"
          aria-label="Enemy Behavior Lab Canvas"
        />

        {/* Selected Enemy Live Spec Overlay Card */}
        {showInfo && (
          <aside className="pointer-events-none absolute top-2.5 left-2.5 z-10 w-[300px] sm:w-[340px] max-w-[calc(100vw-20px)] rounded-xl bg-[#070b1c]/82 backdrop-blur-md border border-slate-700/70 p-3 shadow-2xl text-xs">
            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-slate-900/90 border border-slate-700/60 p-1 shrink-0">
                <EnemyThumb kind={activeEntry.kind} size={42} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-hud-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    {activeEntry.code}
                  </span>
                  <span className="font-hud-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeEntry.category}
                  </span>
                  <span className="font-hud-mono text-[10px] text-emerald-300">
                    HP {activeEntry.hp}
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {activeEntry.name}
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-hud-mono bg-[#050814]/85 rounded-lg p-2 border border-slate-800/80">
              <div>
                <span className="text-slate-400">接触DMG: </span>
                <span className="text-rose-300 font-bold">-{activeEntry.contactDmg}</span>
              </div>
              <div>
                <span className="text-slate-400">攻撃DMG: </span>
                <span className="text-amber-300 font-bold">
                  {activeEntry.attackDmg !== null ? `-${activeEntry.attackDmg}` : 'なし'}
                </span>
              </div>
              <div className="col-span-2 text-slate-300 truncate">
                <span className="text-slate-400">攻撃/速度: </span>
                {activeEntry.attackLabel} · {activeEntry.speedInfo}
              </div>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-200">
              <span className="text-cyan-300 font-semibold">AI挙動: </span>
              {activeEntry.behavior}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-200/90">
              <span className="text-emerald-300 font-semibold">攻略: </span>
              {activeEntry.weakness}
            </p>
          </aside>
        )}

        {/* Quick Game Over Recover Overlay when GodMode is OFF */}
        {hud.status === 'GAME_OVER' && !isPortrait && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#050816]/65 backdrop-blur-xs">
            <div className="rounded-2xl bg-[#0b1126]/95 border border-rose-500/50 p-5 text-center shadow-2xl">
              <div className="text-lg font-bold text-rose-400">TEST HP DEPLETED</div>
              <p className="mt-1 text-xs text-slate-300">
                HPが0になりました（無敵ONにすると倒れずダメージ計測できます）
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => engineRef.current?.resetHpOnly()}
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  HP回復して続行
                </button>
                <button
                  type="button"
                  onClick={() => engineRef.current?.spawnSandboxTarget(selectedKind)}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  最初からやり直す
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Scrollable 50-Enemy Selector Strip */}
      <section className="shrink-0 z-20 bg-[#080d22]/96 border-t border-slate-700/70 px-3 pt-2 pb-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 flex-wrap">
            {(['ALL', '通常敵', '特殊敵', 'ギミック', 'ボス'] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                  filterCat === cat
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="ml-1 font-hud-mono text-[11px] text-slate-400">
              {filteredList.length} / {ENEMY_ENCYCLOPEDIA.length}種
            </span>
          </div>

          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="敵名 / EN番号検索..."
              className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {filteredList.map((entry) => {
            const active = entry.kind === selectedKind;
            return (
              <button
                key={entry.kind}
                type="button"
                onClick={() => handleSelectEnemy(entry.kind)}
                className={`shrink-0 flex items-center gap-2 rounded-xl px-2.5 py-1.5 border text-left transition-all cursor-pointer min-w-[162px] max-w-[190px] ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_14px_rgba(56,242,255,0.28)]'
                    : 'bg-slate-900/85 border-slate-700/70 hover:border-slate-500 hover:bg-slate-800/85'
                }`}
              >
                <EnemyThumb kind={entry.kind} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-hud-mono text-[10px] font-bold text-cyan-300">
                      {entry.code}
                    </span>
                    <span className="font-hud-mono text-[10px] text-rose-300">
                      -{entry.contactDmg}
                      {entry.attackDmg !== null ? `/-${entry.attackDmg}` : ''}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-white truncate">
                    {entry.name}
                  </div>
                </div>
              </button>
            );
          })}
          {filteredList.length === 0 && (
            <div className="py-2 px-3 text-xs text-slate-400">
              条件に一致する敵キャラクターが見つかりません
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
