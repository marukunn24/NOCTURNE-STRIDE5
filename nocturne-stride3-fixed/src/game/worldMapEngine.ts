import { sound } from './audio';
import { drawEnemyPortrait } from './enemyPortrait';
import {
  ALL_WORLD_ENCOUNTERS,
  UNIFIED_WORLD_EDGES,
  UNIFIED_WORLD_NODES,
  WORLD_MAP_WIDTH,
  WORLD_X_OFFSETS,
} from './levels';
import { StageProgress, WorldEdge, WorldMapEncounter, WorldNode } from './types';

export interface MapSelectionInfo {
  node: WorldNode;
  unlocked: boolean;
  cleared: boolean;
  activeEncounter: WorldMapEncounter | null;
}

const WORLD_PALETTES: Record<
  1 | 2 | 3 | 4,
  {
    bgTop: string;
    bgMid: string;
    bgBot: string;
    accent: string;
    grid: string;
    title: string;
  }
> = {
  1: {
    bgTop: '#050816',
    bgMid: '#0b132b',
    bgBot: '#131f40',
    accent: '#38bdf8',
    grid: 'rgba(56, 189, 248, 0.07)',
    title: 'WORLD 1 // NEON METROPOLIS',
  },
  2: {
    bgTop: '#160c03',
    bgMid: '#3b1e06',
    bgBot: '#6b380b',
    accent: '#facc15',
    grid: 'rgba(250, 204, 21, 0.08)',
    title: 'WORLD 2 // GOLDEN CLOCKTOWER',
  },
  3: {
    bgTop: '#03150e',
    bgMid: '#073120',
    bgBot: '#0e5236',
    accent: '#34d399',
    grid: 'rgba(52, 211, 153, 0.08)',
    title: 'WORLD 3 // EMERALD CANOPY',
  },
  4: {
    bgTop: '#020b1d',
    bgMid: '#072245',
    bgBot: '#0e4170',
    accent: '#7dd3fc',
    grid: 'rgba(125, 211, 252, 0.1)',
    title: 'WORLD 4 // CRYOGENIC CITADEL',
  },
};

export class WorldMapEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onEnterStage: (stageId: string) => void;
  private onSelectionChange: (info: MapSelectionInfo) => void;

  private worldId: 1 | 2 | 3 | 4 = 1;
  private progress: Record<string, StageProgress> = {};
  private devUnlockAll = false;
  private pausedForPortrait = false;

  private currentNodeId = '1-1';
  private avatarX = 105;
  private avatarY = 245;
  private moveQueue: string[] = [];
  private isMoving = false;
  private moveStartX = 105;
  private moveStartY = 245;
  private moveTargetX = 105;
  private moveTargetY = 245;
  private moveT = 0;

  private patrolIndices: Record<string, number> = {};
  private patrolTimer = 0;
  private encounterCooldown = 0;

  private rafId = 0;
  private lastTs = 0;
  private time = 0;

  private viewW = 800;
  private viewH = 450;
  private mapCamX = 0;
  private manualPanOffset = 0;
  private focusCamTargetX: number | null = null;

  // Touch & drag state
  private leftTouchId: number | null = null;
  private leftOriginX = 0;
  private leftOriginY = 0;
  private leftCurrX = 0;
  private leftCurrY = 0;
  private stepCooldown = 0;

  private mouseDragging = false;
  private mouseDragStartX = 0;
  private mouseMoved = false;

  private active = true;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: {
      onEnterStage: (stageId: string) => void;
      onSelectionChange: (info: MapSelectionInfo) => void;
    }
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;
    this.onEnterStage = callbacks.onEnterStage;
    this.onSelectionChange = callbacks.onSelectionChange;

    const startNode = this.getNode('1-1')!;
    this.avatarX = startNode.x;
    this.avatarY = startNode.y;

    this.handleResize();
    this.centerCameraOnAvatar(true);
    this.bindEvents();
    this.emitSelection();
  }

  public setState(opts: {
    progress: Record<string, StageProgress>;
    devUnlockAll: boolean;
    worldId?: 1 | 2 | 3 | 4;
    currentNodeId?: string;
    active: boolean;
  }) {
    const wasActive = this.active;
    this.progress = opts.progress;
    this.devUnlockAll = opts.devUnlockAll;
    this.active = opts.active;
    if (!wasActive && opts.active) {
      this.encounterCooldown = 2.0;
    }

    const targetWorld = opts.worldId ?? this.worldId;
    this.worldId = targetWorld;

    const preferredId = opts.currentNodeId;
    const preferredNode = preferredId ? this.getNode(preferredId) : undefined;
    if (preferredNode && preferredNode.id !== this.currentNodeId) {
      this.currentNodeId = preferredNode.id;
      this.avatarX = preferredNode.x;
      this.avatarY = preferredNode.y;
      this.moveQueue = [];
      this.isMoving = false;
      this.manualPanOffset = 0;
      this.focusCamTargetX = null;
      this.centerCameraOnAvatar(true);
    } else if (!this.getNode(this.currentNodeId)) {
      const first = UNIFIED_WORLD_NODES[0];
      this.currentNodeId = first.id;
      this.avatarX = first.x;
      this.avatarY = first.y;
      this.moveQueue = [];
      this.isMoving = false;
      this.manualPanOffset = 0;
      this.focusCamTargetX = null;
      this.centerCameraOnAvatar(true);
    }
    this.emitSelection();
  }

  /**
   * Smoothly pans the unified map camera to center on the chosen world without breaking avatar state.
   */
  public focusWorld(world: 1 | 2 | 3 | 4) {
    this.worldId = world;
    const spanCenter =
      WORLD_X_OFFSETS[world] + 900;
    const maxCam = Math.max(0, WORLD_MAP_WIDTH - this.viewW);
    this.focusCamTargetX = Math.max(0, Math.min(maxCam, spanCenter - this.viewW * 0.5));
    this.manualPanOffset = this.focusCamTargetX - Math.max(0, Math.min(maxCam, this.avatarX - this.viewW * 0.48));
  }

  public setPortraitPaused(p: boolean) {
    this.pausedForPortrait = p;
  }

  public jumpToNode(nodeId: string) {
    const n = this.getNode(nodeId);
    if (!n) return;
    this.currentNodeId = n.id;
    this.avatarX = n.x;
    this.avatarY = n.y;
    this.worldId = n.world ?? 1;
    this.moveQueue = [];
    this.isMoving = false;
    this.manualPanOffset = 0;
    this.focusCamTargetX = null;
    this.emitSelection();
    this.checkEncounterAtCurrentNode(true);
  }

  public enterSelected() {
    const enc = this.getEncounterAtNode(this.currentNodeId);
    if (enc) {
      sound.playMapSelect();
      this.onEnterStage(enc.stageId);
      return;
    }
    const n = this.getNode(this.currentNodeId);
    if (!n || !n.stageId) return;
    if (!this.isNodeUnlocked(n.id)) return;
    sound.playMapSelect();
    this.onEnterStage(n.stageId);
  }

  public start() {
    this.lastTs = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - this.lastTs) / 1000));
      this.lastTs = now;
      if (this.active && !this.pausedForPortrait) {
        this.update(dt);
        this.render();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public destroy() {
    cancelAnimationFrame(this.rafId);
    this.unbindEvents();
  }

  private getEncounterNodeId(enc: WorldMapEncounter): string {
    const idx = this.patrolIndices[enc.id] ?? 0;
    return enc.patrolNodeIds[idx % enc.patrolNodeIds.length];
  }

  private getEncounterAtNode(nodeId: string): WorldMapEncounter | null {
    for (const enc of ALL_WORLD_ENCOUNTERS) {
      if (this.progress[enc.stageId]?.cleared) continue;
      if (this.getEncounterNodeId(enc) === nodeId) {
        return enc;
      }
    }
    return null;
  }

  private checkEncounterAtCurrentNode(ignoreCooldown = false) {
    if (!this.active) return;
    if (!ignoreCooldown && this.encounterCooldown > 0) return;
    const enc = this.getEncounterAtNode(this.currentNodeId);
    if (enc) {
      sound.playMapSelect();
      this.encounterCooldown = 1.5;
      this.onEnterStage(enc.stageId);
    }
  }

  private getNode(id: string): WorldNode | undefined {
    return UNIFIED_WORLD_NODES.find((n) => n.id === id);
  }

  private isConditionMet(cond?: string): boolean {
    if (!cond || cond === 'START') return true;
    if (cond.includes('|')) {
      return cond.split('|').some((c) => this.isConditionMet(c));
    }
    if (cond.endsWith('_S')) {
      const base = cond.slice(0, -2);
      return Boolean(this.progress[base]?.secretCleared);
    }
    return Boolean(this.progress[cond]?.cleared);
  }

  private isSecretWarpOpen(edge: WorldEdge): boolean {
    if (this.devUnlockAll) return true;
    if (edge.unlockAfter) return this.isConditionMet(edge.unlockAfter);
    if (edge.secret) return Boolean(this.progress['1-4']?.secretCleared);
    return true;
  }

  public isNodeUnlocked(nodeId: string): boolean {
    if (this.devUnlockAll) return true;

    const node = this.getNode(nodeId);
    if (node && node.kind === 'empty') {
      return this.isConditionMet(node.unlockAfter);
    }

    const cleared = (id: string) => Boolean(this.progress[id]?.cleared);
    const secret = (id: string) => Boolean(this.progress[id]?.secretCleared);

    // World 1
    if (nodeId === '1-1') return true;
    if (nodeId === '1-2' || nodeId === '1-3') return cleared('1-1');
    if (nodeId === '1-FORT') return cleared('1-2') || cleared('1-3');
    if (nodeId === '1-4') return cleared('1-FORT');
    if (nodeId === '1-S') return secret('1-4');
    if (nodeId === '1-5') return cleared('1-4');
    if (nodeId === '1-6') return cleared('1-5') || cleared('1-S');
    if (nodeId === '1-BOSS') return cleared('1-6');

    // World 2 (reachable via 1-BOSS OR 1-3/1-S secret warps)
    if (nodeId === '2-1') return cleared('1-BOSS') || cleared('1-S');
    if (nodeId === '2-2') return cleared('2-1') || secret('1-3');
    if (nodeId === '2-FORT') return cleared('2-2');
    if (nodeId === '2-3' || nodeId === '2-4') return cleared('2-FORT');
    if (nodeId === '2-5') return cleared('2-3') || cleared('2-4');
    if (nodeId === '2-6') return cleared('2-5');
    if (nodeId === '2-7') return cleared('2-6');
    if (nodeId === '2-BOSS') return cleared('2-7');

    // World 3 (reachable via 2-BOSS OR 2-3/2-5 secret warps)
    if (nodeId === '3-1') return cleared('2-BOSS') || secret('2-3');
    if (nodeId === '3-2') return cleared('2-BOSS');
    if (nodeId === '3-3') return cleared('3-1') || cleared('3-2');
    if (nodeId === '3-FORT1') return cleared('3-3');
    if (nodeId === '3-4') return cleared('3-FORT1') || secret('2-5');
    if (nodeId === '3-5') return cleared('3-FORT1');
    if (nodeId === '3-FORT2') return cleared('3-4') || cleared('3-5');
    if (nodeId === '3-6') return cleared('3-FORT2');
    if (nodeId === '3-7') return cleared('3-6');
    if (nodeId === '3-BOSS') return cleared('3-7');

    // World 4 (reachable via 3-BOSS OR 3-3/3-6 secret warps)
    if (nodeId === '4-1') return cleared('3-BOSS') || secret('3-3');
    if (nodeId === '4-2') return cleared('4-1');
    if (nodeId === '4-3') return cleared('4-2');
    if (nodeId === '4-FORT1') return cleared('4-3');
    if (nodeId === '4-4') return cleared('4-FORT1') || secret('3-6');
    if (nodeId === '4-5') return cleared('4-FORT1');
    if (nodeId === '4-6') return cleared('4-4') || cleared('4-5');
    if (nodeId === '4-FORT2') return cleared('4-6');
    if (nodeId === '4-BOSS') return cleared('4-FORT2');

    return false;
  }

  private isEdgeOpen(fromId: string, toId: string): boolean {
    const edge = UNIFIED_WORLD_EDGES.find(
      (e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );
    if (!edge) return false;
    if (edge.secret && !this.isSecretWarpOpen(edge)) return false;
    return this.isNodeUnlocked(fromId) && this.isNodeUnlocked(toId);
  }

  private stepTowardDirection(dx: number, dy: number) {
    if (this.isMoving || this.stepCooldown > 0) return;
    const curr = this.getNode(this.currentNodeId);
    if (!curr) return;

    const mag = Math.hypot(dx, dy);
    if (mag < 0.2) return;
    const ndx = dx / mag;
    const ndy = dy / mag;

    let bestNeighbor: WorldNode | null = null;
    let bestDot = 0.2;

    for (const nid of curr.neighbors) {
      if (!this.isEdgeOpen(curr.id, nid)) continue;
      const nb = this.getNode(nid);
      if (!nb) continue;
      const vx = nb.x - curr.x;
      const vy = nb.y - curr.y;
      const dist = Math.hypot(vx, vy) || 1;
      const dot = (vx / dist) * ndx + (vy / dist) * ndy;
      if (dot > bestDot) {
        bestDot = dot;
        bestNeighbor = nb;
      }
    }

    if (bestNeighbor) {
      this.manualPanOffset = 0;
      this.focusCamTargetX = null;
      this.enqueuePath([bestNeighbor.id]);
      this.stepCooldown = 0.2;
    }
  }

  private findPath(startId: string, targetId: string): string[] | null {
    if (startId === targetId) return [];
    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const last = path[path.length - 1];
      const node = this.getNode(last);
      if (!node) continue;

      for (const nb of node.neighbors) {
        if (visited.has(nb)) continue;
        if (!this.isEdgeOpen(last, nb)) continue;
        const nextPath = [...path, nb];
        if (nb === targetId) return nextPath.slice(1);
        visited.add(nb);
        queue.push(nextPath);
      }
    }
    return null;
  }

  private enqueuePath(nodeIds: string[]) {
    if (nodeIds.length === 0) return;
    this.moveQueue = nodeIds;
    this.startNextSegment();
  }

  private startNextSegment() {
    const nextId = this.moveQueue.shift();
    if (!nextId) {
      this.isMoving = false;
      this.emitSelection();
      this.checkEncounterAtCurrentNode();
      return;
    }
    const target = this.getNode(nextId);
    if (!target) {
      this.isMoving = false;
      return;
    }
    this.isMoving = true;
    this.moveStartX = this.avatarX;
    this.moveStartY = this.avatarY;
    this.moveTargetX = target.x;
    this.moveTargetY = target.y;
    this.moveT = 0;
    this.currentNodeId = target.id;
    this.worldId = target.world ?? 1;
    sound.playMapStep();
    this.emitSelection();
  }

  private emitSelection() {
    const node = this.getNode(this.currentNodeId) ?? UNIFIED_WORLD_NODES[0];
    this.onSelectionChange({
      node,
      unlocked: this.isNodeUnlocked(node.id),
      cleared: Boolean(this.progress[node.id]?.cleared),
      activeEncounter: this.getEncounterAtNode(node.id),
    });
  }

  private centerCameraOnAvatar(instant = false, dt = 0.016) {
    const maxCam = Math.max(0, WORLD_MAP_WIDTH - this.viewW);
    const desired =
      this.focusCamTargetX !== null
        ? this.focusCamTargetX
        : Math.max(0, Math.min(maxCam, this.avatarX - this.viewW * 0.48 + this.manualPanOffset));
    const target = Math.max(0, Math.min(maxCam, desired));
    if (instant) {
      this.mapCamX = target;
    } else {
      this.mapCamX += (target - this.mapCamX) * Math.min(1, 7.5 * dt);
    }
  }

  private update(dt: number) {
    this.time += dt;
    if (this.stepCooldown > 0) this.stepCooldown -= dt;
    if (this.encounterCooldown > 0) this.encounterCooldown -= dt;

    this.patrolTimer += dt;
    if (this.patrolTimer >= 2.2) {
      this.patrolTimer = 0;
      for (const enc of ALL_WORLD_ENCOUNTERS) {
        if (this.progress[enc.stageId]?.cleared) continue;
        this.patrolIndices[enc.id] =
          ((this.patrolIndices[enc.id] ?? 0) + 1) % enc.patrolNodeIds.length;
      }
      this.emitSelection();
      if (!this.isMoving) {
        this.checkEncounterAtCurrentNode();
      }
    }

    if (this.leftTouchId !== null && !this.isMoving) {
      const dx = this.leftCurrX - this.leftOriginX;
      const dy = this.leftCurrY - this.leftOriginY;
      if (Math.hypot(dx, dy) > 20) {
        this.stepTowardDirection(dx, dy);
      }
    }

    if (this.isMoving) {
      const dist = Math.hypot(this.moveTargetX - this.moveStartX, this.moveTargetY - this.moveStartY);
      const speed = dist > 500 ? 1150 : 380;
      this.moveT += (speed / Math.max(40, dist)) * dt;
      if (this.moveT >= 1) {
        this.avatarX = this.moveTargetX;
        this.avatarY = this.moveTargetY;
        const hitMid = this.getEncounterAtNode(this.currentNodeId);
        if (hitMid && this.encounterCooldown <= 0) {
          this.moveQueue = [];
          this.isMoving = false;
          this.emitSelection();
          this.checkEncounterAtCurrentNode();
          return;
        }
        this.startNextSegment();
      } else {
        const ease = 1 - Math.pow(1 - this.moveT, 2);
        this.avatarX = this.moveStartX + (this.moveTargetX - this.moveStartX) * ease;
        this.avatarY = this.moveStartY + (this.moveTargetY - this.moveStartY) * ease;
      }
    }

    this.centerCameraOnAvatar(false, dt);
  }

  // -------------------- Events --------------------

  private onResize = () => this.handleResize();

  private handleResize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const cssW = Math.max(320, rect ? rect.width : window.innerWidth);
    const cssH = Math.max(200, rect ? rect.height : window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    this.viewH = 450;
    this.viewW = Math.max(520, (cssW / cssH) * 450);

    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.active || this.pausedForPortrait) return;
    sound.unlock();

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      e.preventDefault();
      this.stepTowardDirection(-1, 0);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      this.stepTowardDirection(1, 0);
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.stepTowardDirection(0, -1);
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      this.stepTowardDirection(0, 1);
    } else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') {
      e.preventDefault();
      this.enterSelected();
    }
  };

  private screenToMap(clientX: number, clientY: number): { mx: number; my: number } {
    const rect = this.canvas.getBoundingClientRect();
    const lx = ((clientX - rect.left) / Math.max(1, rect.width)) * this.viewW;
    const ly = ((clientY - rect.top) / Math.max(1, rect.height)) * this.viewH;
    return { mx: lx + this.mapCamX, my: ly };
  }

  private tryTapNode(clientX: number, clientY: number): boolean {
    const { mx, my } = this.screenToMap(clientX, clientY);
    for (const node of UNIFIED_WORLD_NODES) {
      if (node.requiresSecret && !this.devUnlockAll && !this.progress['1-4']?.secretCleared) continue;
      if (Math.hypot(mx - node.x, my - node.y) <= 34) {
        if (!this.isNodeUnlocked(node.id)) return true;
        this.manualPanOffset = 0;
        this.focusCamTargetX = null;
        if (node.id === this.currentNodeId && !this.isMoving) {
          this.enterSelected();
          return true;
        }
        const path = this.findPath(this.currentNodeId, node.id);
        if (path) {
          this.enqueuePath(path);
        } else {
          this.jumpToNode(node.id);
        }
        return true;
      }
    }
    return false;
  }

  private onMouseDown = (e: MouseEvent) => {
    if (!this.active || e.target !== this.canvas || this.pausedForPortrait) return;
    sound.unlock();
    this.mouseDragging = true;
    this.mouseDragStartX = e.clientX;
    this.mouseMoved = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.mouseDragging) return;
    const dx = e.clientX - this.mouseDragStartX;
    if (Math.abs(dx) > 5) this.mouseMoved = true;
    if (this.mouseMoved) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.viewW / Math.max(1, rect.width);
      this.focusCamTargetX = null;
      this.manualPanOffset -= dx * scaleX;
      this.manualPanOffset = Math.max(-WORLD_MAP_WIDTH, Math.min(WORLD_MAP_WIDTH, this.manualPanOffset));
      this.mouseDragStartX = e.clientX;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (!this.mouseDragging) return;
    this.mouseDragging = false;
    if (!this.mouseMoved) {
      this.tryTapNode(e.clientX, e.clientY);
    }
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.active || this.pausedForPortrait) return;
    this.focusCamTargetX = null;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    this.manualPanOffset += delta * 0.85;
    this.manualPanOffset = Math.max(-WORLD_MAP_WIDTH, Math.min(WORLD_MAP_WIDTH, this.manualPanOffset));
  };

  private onTouchStart = (e: TouchEvent) => {
    if (!this.active || e.target !== this.canvas || this.pausedForPortrait) return;
    e.preventDefault();
    sound.unlock();

    const halfW = window.innerWidth * 0.5;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (this.tryTapNode(t.clientX, t.clientY)) continue;
      if (t.clientX < halfW && this.leftTouchId === null) {
        this.leftTouchId = t.identifier;
        this.leftOriginX = t.clientX;
        this.leftOriginY = t.clientY;
        this.leftCurrX = t.clientX;
        this.leftCurrY = t.clientY;
      } else if (t.clientX >= halfW) {
        this.enterSelected();
      }
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.active || e.target !== this.canvas || this.pausedForPortrait) return;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.leftTouchId) {
        this.leftCurrX = t.clientX;
        this.leftCurrY = t.clientY;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.target !== this.canvas) return;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.leftTouchId) {
        this.leftTouchId = null;
      }
    }
  };

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: true });
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  private unbindEvents() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
  }

  // -------------------- Rendering --------------------

  private getViewCenterWorld(): 1 | 2 | 3 | 4 {
    const cx = this.mapCamX + this.viewW * 0.5;
    if (cx >= WORLD_X_OFFSETS[4] - 80) return 4;
    if (cx >= WORLD_X_OFFSETS[3] - 80) return 3;
    if (cx >= WORLD_X_OFFSETS[2] - 80) return 2;
    return 1;
  }

  private render() {
    const ctx = this.ctx;
    const scale = this.canvas.height / 450;

    ctx.save();
    ctx.scale(scale, scale);

    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, this.viewW, 450);

    ctx.save();
    ctx.translate(Math.round(-this.mapCamX), 0);

    this.renderUnifiedBiomeBackdrop();
    this.renderDistrictDecor();
    this.renderEdges();
    this.renderNodes();
    this.renderEncounters();
    this.renderAvatar();

    ctx.restore();

    const viewWorld = this.getViewCenterWorld();
    const pal = WORLD_PALETTES[viewWorld];
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.55;
    ctx.font = '700 13px "JetBrains Mono", monospace';
    if (this.mapCamX > 16) ctx.fillText('◀', 14, 225);
    if (this.mapCamX < WORLD_MAP_WIDTH - this.viewW - 16) ctx.fillText('▶', this.viewW - 24, 225);
    ctx.globalAlpha = 1;

    if (this.leftTouchId !== null) {
      const rect = this.canvas.getBoundingClientRect();
      const ox = ((this.leftOriginX - rect.left) / Math.max(1, rect.width)) * this.viewW;
      const oy = ((this.leftOriginY - rect.top) / Math.max(1, rect.height)) * this.viewH;
      const cx = ((this.leftCurrX - rect.left) / Math.max(1, rect.width)) * this.viewW;
      const cy = ((this.leftCurrY - rect.top) / Math.max(1, rect.height)) * this.viewH;

      ctx.save();
      ctx.strokeStyle = pal.accent;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(ox, oy, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private renderUnifiedBiomeBackdrop() {
    const ctx = this.ctx;
    const spans: { w: 1 | 2 | 3 | 4; x0: number; x1: number }[] = [
      { w: 1, x0: 0, x1: WORLD_X_OFFSETS[2] },
      { w: 2, x0: WORLD_X_OFFSETS[2], x1: WORLD_X_OFFSETS[3] },
      { w: 3, x0: WORLD_X_OFFSETS[3], x1: WORLD_X_OFFSETS[4] },
      { w: 4, x0: WORLD_X_OFFSETS[4], x1: WORLD_MAP_WIDTH },
    ];

    for (const sp of spans) {
      if (sp.x1 < this.mapCamX - 180 || sp.x0 > this.mapCamX + this.viewW + 180) continue;
      const pal = WORLD_PALETTES[sp.w];
      const bg = ctx.createLinearGradient(0, 0, 0, 450);
      bg.addColorStop(0, pal.bgTop);
      bg.addColorStop(0.55, pal.bgMid);
      bg.addColorStop(1, pal.bgBot);
      ctx.fillStyle = bg;
      ctx.fillRect(sp.x0, 0, sp.x1 - sp.x0, 450);

      // Subtle blueprint grid per world zone
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      const gx0 = Math.max(sp.x0, Math.floor((this.mapCamX - 44) / 44) * 44);
      const gx1 = Math.min(sp.x1, this.mapCamX + this.viewW + 44);
      for (let gx = gx0; gx <= gx1; gx += 44) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 450);
        ctx.stroke();
      }
      for (let gy = 0; gy < 450; gy += 44) {
        ctx.beginPath();
        ctx.moveTo(gx0, gy);
        ctx.lineTo(gx1, gy);
        ctx.stroke();
      }

      // Soft horizon transition divider & subtle zone caption
      if (sp.w > 1) {
        const seam = ctx.createLinearGradient(sp.x0 - 110, 0, sp.x0 + 110, 0);
        const prevPal = WORLD_PALETTES[(sp.w - 1) as 1 | 2 | 3 | 4];
        seam.addColorStop(0, `${prevPal.bgMid}00`);
        seam.addColorStop(0.5, 'rgba(6, 9, 24, 0.72)');
        seam.addColorStop(1, `${pal.bgMid}00`);
        ctx.fillStyle = seam;
        ctx.fillRect(sp.x0 - 110, 0, 220, 450);
      }

      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.32;
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(pal.title, sp.x0 + 36, 76);
      ctx.globalAlpha = 1;
    }
  }

  private renderDistrictDecor() {
    const ctx = this.ctx;
    const visMin = this.mapCamX - 240;
    const visMax = this.mapCamX + this.viewW + 240;

    // --- W1: Neon Metropolis (offset 0) ---
    if (visMax >= 0 && visMin <= WORLD_X_OFFSETS[2] + 100) {
      const ox = WORLD_X_OFFSETS[1];
      ctx.save();
      ctx.translate(ox, 0);
      const w1Regions = [
        { x: 250, y: 245, rx: 195, ry: 135, color: 'rgba(14, 165, 233, 0.08)' },
        { x: 725, y: 245, rx: 120, ry: 85, color: 'rgba(244, 63, 94, 0.08)' },
        { x: 1235, y: 245, rx: 175, ry: 85, color: 'rgba(168, 85, 247, 0.08)' },
        { x: 1585, y: 245, rx: 165, ry: 105, color: 'rgba(56, 242, 255, 0.08)' },
      ];
      for (const r of w1Regions) {
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      ctx.translate(1235, 245);
      ctx.rotate(this.time * 0.4);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.24)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const shipBob = Math.sin(this.time * 2.2) * 5;
      ctx.save();
      ctx.translate(1735, 182 + shipBob);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-36, 0);
      ctx.lineTo(36, 0);
      ctx.lineTo(24, 16);
      ctx.lineTo(-26, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    // --- W2: Golden Clocktower (offset 1820) ---
    if (visMax >= WORLD_X_OFFSETS[2] - 100 && visMin <= WORLD_X_OFFSETS[3] + 100) {
      const ox = WORLD_X_OFFSETS[2];
      ctx.save();
      ctx.translate(ox, 0);
      for (const [gx, gy, gr, spd] of [
        [295, 245, 48, 0.45],
        [470, 245, 56, -0.5],
        [1190, 245, 44, 0.6],
      ] as [number, number, number, number][]) {
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(this.time * spd);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let k = 0; k < 16; k++) {
          const a = (k * Math.PI) / 8;
          const rad = k % 2 === 0 ? gr + 6 : gr;
          if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      const shipBob = Math.sin(this.time * 2.4) * 5;
      ctx.save();
      ctx.translate(1745, 178 + shipBob);
      ctx.fillStyle = '#291704';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.lineTo(40, 0);
      ctx.lineTo(26, 17);
      ctx.lineTo(-28, 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    // --- W3: Emerald Canopy (offset 3660) ---
    if (visMax >= WORLD_X_OFFSETS[3] - 100 && visMin <= WORLD_X_OFFSETS[4] + 100) {
      const ox = WORLD_X_OFFSETS[3];
      ctx.save();
      ctx.translate(ox, 0);
      for (const [rx, ry, rad, spd] of [
        [685, 245, 50, 0.45],
        [1110, 245, 52, -0.45],
      ] as [number, number, number, number][]) {
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(this.time * spd);
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const spireBob = Math.sin(this.time * 2.1) * 5;
      ctx.save();
      ctx.translate(1775, 174 + spireBob);
      ctx.fillStyle = '#052e16';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(28, 4);
      ctx.lineTo(18, 22);
      ctx.lineTo(-18, 22);
      ctx.lineTo(-28, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    // --- W4: Cryogenic Citadel (offset 5520) ---
    if (visMax >= WORLD_X_OFFSETS[4] - 100 && visMin <= WORLD_MAP_WIDTH + 100) {
      const ox = WORLD_X_OFFSETS[4];
      ctx.save();
      ctx.translate(ox, 0);
      for (const [rx, ry, rad, spd] of [
        [775, 245, 50, 0.42],
        [1475, 245, 54, -0.42],
      ] as [number, number, number, number][]) {
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(this.time * spd);
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3;
          if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      const castleBob = Math.sin(this.time * 2.0) * 5;
      ctx.save();
      ctx.translate(1765, 174 + castleBob);
      ctx.fillStyle = '#082f49';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(24, -4);
      ctx.lineTo(30, 18);
      ctx.lineTo(-30, 18);
      ctx.lineTo(-24, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

  }

  private renderEdges() {
    const ctx = this.ctx;
    for (const edge of UNIFIED_WORLD_EDGES) {
      if (edge.secret && !this.isSecretWarpOpen(edge)) continue;
      const a = this.getNode(edge.from);
      const b = this.getNode(edge.to);
      if (!a || !b) continue;

      const minEx = Math.min(a.x, b.x);
      const maxEx = Math.max(a.x, b.x);
      if (maxEx < this.mapCamX - 200 || minEx > this.mapCamX + this.viewW + 200) continue;

      const open = this.isEdgeOpen(a.id, b.id);
      const w = b.world ?? a.world ?? 1;
      const activeColor = WORLD_PALETTES[w].accent;

      ctx.save();
      if (edge.isSecretWarp || edge.secret) {
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = open ? '#fbbf24' : 'rgba(251, 191, 36, 0.32)';
        ctx.lineWidth = open ? 3.5 : 2.5;
        if (open) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
        }
        const midX = (a.x + b.x) * 0.5;
        const arcOffset = edge.isSecretWarp ? (a.y > 245 ? 115 : -118) : -40;
        const cpY = Math.min(410, Math.max(46, Math.min(a.y, b.y) + arcOffset));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(midX, cpY, b.x, b.y);
        ctx.stroke();

        if (open) {
          const t = (this.time * 0.42) % 1;
          const u = 1 - t;
          const px = u * u * a.x + 2 * u * t * midX + t * t * b.x;
          const py = u * u * a.y + 2 * u * t * cpY + t * t * b.y;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }

        if (edge.warpLabel) {
          const labelX = midX;
          const labelY = 0.25 * a.y + 0.5 * cpY + 0.25 * b.y;
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(24, 14, 4, 0.92)';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(labelX - 38, labelY - 10, 76, 18, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fde68a';
          ctx.font = '700 8.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.warpLabel, labelX, labelY - 0.5);
        }
      } else {
        ctx.strokeStyle = open ? activeColor : 'rgba(100, 116, 139, 0.35)';
        ctx.lineWidth = open ? 4 : 3;
        if (open) {
          ctx.shadowColor = activeColor;
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (open) {
          const t = (this.time * 0.55) % 1;
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  private renderNodes() {
    const ctx = this.ctx;
    const secret1SOpen = this.devUnlockAll || Boolean(this.progress['1-4']?.secretCleared);

    for (const node of UNIFIED_WORLD_NODES) {
      if (node.x < this.mapCamX - 90 || node.x > this.mapCamX + this.viewW + 90) continue;
      if (node.requiresSecret && !secret1SOpen) continue;

      const unlocked = this.isNodeUnlocked(node.id);
      const cleared = Boolean(this.progress[node.id]?.cleared);
      const secretCleared = Boolean(this.progress[node.id]?.secretCleared);
      const selected = this.currentNodeId === node.id;
      const w = node.world ?? 1;
      const accent = WORLD_PALETTES[w].accent;

      ctx.save();
      ctx.translate(node.x, node.y);

      if (node.kind === 'empty') {
        if (selected) {
          const pulse = 18 + Math.sin(this.time * 5) * 2.5;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = unlocked ? WORLD_PALETTES[w].bgMid : '#0f172a';
        ctx.strokeStyle = unlocked ? accent : '#475569';
        ctx.lineWidth = selected ? 2.2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        continue;
      }

      if (selected) {
        const pulse = 25 + Math.sin(this.time * 5) * 3;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      const r = node.kind === 'boss' || node.kind === 'fortress' ? 21 : 17;
      let fill = '#0f172a';
      let stroke = '#475569';
      if (unlocked) {
        if (w === 5) {
          if (node.kind === 'fortress') {
            fill = '#500724';
            stroke = '#fb7185';
          } else if (node.kind === 'boss') {
            fill = '#4c0519';
            stroke = '#fda4af';
          } else {
            fill = '#2d0611';
            stroke = cleared ? '#fecdd3' : '#f43f5e';
          }
        } else if (w === 4) {
          if (node.kind === 'fortress') {
            fill = '#0c4a6e';
            stroke = '#38bdf8';
          } else if (node.kind === 'boss') {
            fill = '#082f49';
            stroke = '#e0f2fe';
          } else {
            fill = '#0a2540';
            stroke = cleared ? '#bae6fd' : '#7dd3fc';
          }
        } else if (w === 3) {
          if (node.kind === 'fortress') {
            fill = '#022c22';
            stroke = '#10b981';
          } else if (node.kind === 'boss') {
            fill = '#064e3b';
            stroke = '#6ee7b7';
          } else {
            fill = '#052e16';
            stroke = cleared ? '#a7f3d0' : '#34d399';
          }
        } else if (w === 2) {
          if (node.kind === 'fortress') {
            fill = '#3b2404';
            stroke = '#f59e0b';
          } else if (node.kind === 'boss') {
            fill = '#451a03';
            stroke = '#fde047';
          } else {
            fill = '#291806';
            stroke = cleared ? '#34d399' : '#facc15';
          }
        } else {
          if (node.kind === 'fortress') {
            fill = '#3b0d1e';
            stroke = '#f43f5e';
          } else if (node.kind === 'boss') {
            fill = '#2e1065';
            stroke = '#c084fc';
          } else if (node.kind === 'secret') {
            fill = '#422006';
            stroke = '#fbbf24';
          } else {
            fill = '#0c1f3f';
            stroke = cleared ? '#34d399' : '#38bdf8';
          }
        }
      }

      if (unlocked) {
        ctx.shadowColor = stroke;
        ctx.shadowBlur = selected ? 14 : 7;
      }

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = selected ? 2.6 : 1.8;

      if (node.kind === 'fortress' || node.kind === 'boss') {
        ctx.beginPath();
        ctx.roundRect(-r, -r, r * 2, r * 2, 7);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.fillStyle = unlocked ? '#f8fafc' : '#64748b';
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.code, 0, 0.5);

      if (cleared) {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(r - 2, -r + 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(r - 4.5, -r + 2);
        ctx.lineTo(r - 2.2, -r + 4.3);
        ctx.lineTo(r + 1.2, -r - 0.5);
        ctx.stroke();
      }

      if (secretCleared) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-r + 2, -r + 2, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#422006';
        ctx.font = '700 8px "JetBrains Mono", monospace';
        ctx.fillText('★', -r + 2, -r + 2.5);
      }

      ctx.restore();
    }
  }

  private renderEncounters() {
    const ctx = this.ctx;
    for (const enc of ALL_WORLD_ENCOUNTERS) {
      if (this.progress[enc.stageId]?.cleared) continue;
      const nodeId = this.getEncounterNodeId(enc);
      const node = this.getNode(nodeId);
      if (!node) continue;
      if (node.x < this.mapCamX - 90 || node.x > this.mapCamX + this.viewW + 90) continue;

      const bob = Math.sin(this.time * 4.5 + node.x) * 3;
      const ex = node.x;
      const ey = node.y - 24 + bob;

      ctx.save();
      ctx.strokeStyle = enc.accentColor;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.5 + 0.35 * Math.sin(this.time * 6);
      ctx.beginPath();
      ctx.arc(node.x, node.y, 17, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#090e24';
      ctx.strokeStyle = enc.accentColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = enc.accentColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ex, ey, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      drawEnemyPortrait(ctx, enc.enemyKind, ex, ey, 0.36);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BATTLE', ex, ey - 18);
      ctx.restore();
    }
  }

  private renderAvatar() {
    const ctx = this.ctx;
    const bob = Math.sin(this.time * 6) * 2;
    const ax = this.avatarX;
    const ay = this.avatarY - 26 + bob;

    ctx.save();
    ctx.translate(ax, ay);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 26 - bob, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.quadraticCurveTo(-12, 3 + Math.sin(this.time * 10) * 3, -17, 7);
    ctx.stroke();

    ctx.fillStyle = '#151d30';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-7, 13);
    ctx.lineTo(-5, 2);
    ctx.lineTo(5, 2);
    ctx.lineTo(7, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#192238';
    ctx.beginPath();
    ctx.arc(0, -3, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#040711';
    ctx.beginPath();
    ctx.arc(1.5, -2.5, 6.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#38f2ff';
    ctx.shadowBlur = 7;
    ctx.fillStyle = '#7ef9ff';
    ctx.beginPath();
    ctx.arc(-0.5, -2.5, 1.5, 0, Math.PI * 2);
    ctx.arc(3.8, -2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
