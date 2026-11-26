import { EnemyPortraitKind } from './gameData';

/**
 * Draws a crisp, high-detail vector illustration of any enemy, gimmick, or boss
 * centered at (cx, cy) scaled by `scale`. Used by the Enemy Lab.
 */
export function drawEnemyPortrait(
  ctx: CanvasRenderingContext2D,
  kind: EnemyPortraitKind,
  cx: number,
  cy: number,
  scale = 1
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  switch (kind) {
    case 'patrol_drone': {
      ctx.fillStyle = 'rgba(251, 113, 133, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-15, -12, 30, 24, 7);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(0, -18);
      ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(5, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'hopping_bot': {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 7);
      ctx.lineTo(-9, 13);
      ctx.lineTo(-4, 16);
      ctx.moveTo(6, 7);
      ctx.lineTo(9, 13);
      ctx.lineTo(4, 16);
      ctx.stroke();
      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#5eead4';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-13, -13, 26, 20, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(2, -7, 7, 5);
      break;
    }
    case 'slime_glitch': {
      ctx.fillStyle = '#9333ea';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 10, 16, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 242, 255, 0.45)';
      ctx.fillRect(-13, 2, 10, 2);
      ctx.fillRect(4, -2, 8, 2);
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(-5, 0, 3.5, 3.5);
      ctx.fillRect(3, 0, 3.5, 3.5);
      break;
    }
    case 'shield_trooper': {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-14, -17, 26, 34, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-2, -11, 10, 4);
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.fillRect(14, -15, 5, 30);
      break;
    }
    case 'sniper_turret': {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 10);
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ghost_wisp': {
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(56, 242, 255, 0.82)';
      ctx.beginPath();
      ctx.arc(0, -2, 13, Math.PI, 0);
      ctx.lineTo(13, 12);
      ctx.lineTo(5, 7);
      ctx.lineTo(0, 13);
      ctx.lineTo(-5, 7);
      ctx.lineTo(-13, 12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, -4, 3.5, 4.5);
      ctx.fillRect(2, -4, 3.5, 4.5);
      break;
    }
    case 'bulldozer_mech': {
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, -14, 34, 26, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(14, -10, 7, 22);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-19, 11, 32, 6);
      ctx.fillStyle = '#f43f5e';
      ctx.font = '700 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', -3, -18);
      break;
    }
    case 'bomb_walker': {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(4, -18);
      ctx.stroke();
      ctx.fillStyle = '#fb923c';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(5, -19, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 1, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(4, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'arcane_caster': {
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-3, -17);
      ctx.lineTo(11, 16);
      ctx.lineTo(-17, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(15, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.arc(15, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'neon_bat': {
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-22, -4);
      ctx.lineTo(-8, -12);
      ctx.lineTo(0, -4);
      ctx.lineTo(8, -12);
      ctx.lineTo(22, -4);
      ctx.lineTo(10, 6);
      ctx.lineTo(0, 12);
      ctx.lineTo(-10, 6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, 1, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(-4, -1, 3, 3);
      ctx.fillRect(1, -1, 3, 3);
      break;
    }
    case 'skate_courier': {
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(-18, 12, 36, 4);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-10, -14, 20, 24, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(0, -9, 9, 4);
      break;
    }
    case 'riot_baton': {
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-12, -16, 22, 32, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#38f2ff';
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 9;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(21, -11);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(-2, -11, 10, 4);
      break;
    }
    case 'volt_jelly': {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -4, 14, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      for (const tx of [-9, -3, 3, 9]) {
        ctx.beginPath();
        ctx.moveTo(tx, -3);
        ctx.lineTo(tx + 2, 7);
        ctx.lineTo(tx - 2, 16);
        ctx.stroke();
      }
      break;
    }
    case 'rail_spider': {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 6, 0);
        ctx.lineTo(s * 16, -9);
        ctx.lineTo(s * 20, -17);
        ctx.moveTo(s * 8, 4);
        ctx.lineTo(s * 18, 4);
        ctx.lineTo(s * 21, 11);
        ctx.stroke();
      }
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'magnet_orb': {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0.3, Math.PI - 0.3);
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI + 0.3, Math.PI * 2 - 0.3);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'prism_reflector': {
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0e7490';
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(15, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-12, 12);
      ctx.lineTo(-12, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(8, -10, 4, 20);
      break;
    }
    case 'mortar_crab': {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2.2;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 10, 6);
        ctx.lineTo(s * 19, 10);
        ctx.lineTo(s * 17, 17);
        ctx.stroke();
      }
      ctx.fillStyle = '#7c2d12';
      ctx.strokeStyle = '#fb923c';
      ctx.beginPath();
      ctx.ellipse(0, 4, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.rotate(-0.7);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, -18, 9, 14);
      ctx.restore();
      break;
    }
    case 'stealth_ninja': {
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(12, 15);
      ctx.lineTo(-12, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(-4, -10, 3, 2.5);
      ctx.fillRect(2, -10, 3, 2.5);
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(14, -6);
      ctx.lineTo(22, -6);
      ctx.moveTo(18, -10);
      ctx.lineTo(18, -2);
      ctx.stroke();
      break;
    }
    case 'saw_wheel': {
      ctx.fillStyle = '#be123c';
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const teeth = 10;
      for (let i = 0; i < teeth * 2; i++) {
        const ang = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? 18 : 11;
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'holo_decoy': {
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([3, 3]);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.beginPath();
      ctx.roundRect(-11, -16, 22, 32, 8);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(-5, -8, 10, 2);
      ctx.fillRect(-7, 2, 14, 2);
      break;
    }
    case 'cryo_slime': {
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 10, 15, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-2, -13);
      ctx.lineTo(2, -4);
      ctx.lineTo(6, -11);
      ctx.lineTo(9, -3);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'arc_pylon': {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-7, -10, 14, 28);
      ctx.strokeRect(-7, -10, 14, 28);
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, -13, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'grimoire_mimic': {
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 28, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      for (let fx = -9; fx <= 9; fx += 6) {
        ctx.beginPath();
        ctx.moveTo(fx - 2, -2);
        ctx.lineTo(fx, 4);
        ctx.lineTo(fx + 2, -2);
        ctx.fill();
      }
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, -7, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rune_sentinel': {
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-15, -20, 30, 40, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(7, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-7, 0);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'mirror_wraith': {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.25)';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-12, -18, 24, 36, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(0, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chrono_pendulum': {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 4);
      ctx.stroke();
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(0, 3);
      ctx.moveTo(0, 10);
      ctx.lineTo(6, 10);
      ctx.stroke();
      break;
    }
    case 'gravity_imp': {
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 2, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c4b5fd';
      ctx.beginPath();
      ctx.moveTo(-8, -7);
      ctx.lineTo(-13, -17);
      ctx.lineTo(-3, -10);
      ctx.moveTo(8, -7);
      ctx.lineTo(13, -17);
      ctx.lineTo(3, -10);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-4, 0, 3, 3);
      ctx.fillRect(2, 0, 3, 3);
      break;
    }
    case 'ink_specter': {
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -3, 13, Math.PI, 0);
      ctx.lineTo(14, 15);
      ctx.lineTo(6, 9);
      ctx.lineTo(0, 16);
      ctx.lineTo(-6, 9);
      ctx.lineTo(-14, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.arc(-4, -3, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'star_weaver': {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 17 : 7;
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'golem_knight': {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-16, -20, 32, 40, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-8, -12, 16, 4);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-20, -10, 6, 18);
      ctx.fillRect(14, -10, 6, 18);
      break;
    }
    case 'mana_leech': {
      ctx.fillStyle = '#86198f';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(9, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sigil_bomber': {
      ctx.fillStyle = '#4c0519';
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-18, -4);
      ctx.lineTo(0, -14);
      ctx.lineTo(18, -4);
      ctx.lineTo(8, 8);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 12, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'void_eye': {
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'flame_thruster': {
      ctx.fillStyle = '#7c2d12';
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-14, -12, 28, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-14, -6);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-14, 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(5, -6, 6, 5);
      break;
    }
    case 'jet_trooper': {
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-10, -16, 20, 32, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-15, -6, 5, 16);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-15, 10, 4, 8);
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(1, -11, 8, 4);
      break;
    }
    case 'railgun_mech': {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -16, 28, 32, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(4, -7, 20, 6);
      ctx.fillRect(4, 2, 16, 4);
      break;
    }
    case 'aegis_drone': {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, -0.6, 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 18, Math.PI - 0.6, Math.PI + 0.6);
      ctx.stroke();
      break;
    }
    case 'cluster_mine': {
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
        ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
        ctx.stroke();
      }
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'vortex_fan': {
      ctx.fillStyle = '#134e4a';
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 36, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5eead4';
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2 + 0.3);
        ctx.fillRect(-3, -12, 6, 12);
        ctx.restore();
      }
      break;
    }
    case 'plasma_hound': {
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-16, -6, 30, 16, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.fillRect(6, -12, 11, 10);
      ctx.fillRect(-14, 10, 5, 8);
      ctx.fillRect(8, 10, 5, 8);
      break;
    }
    case 'drill_mole': {
      ctx.fillStyle = '#713f12';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 5, 13, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-7, -7);
      ctx.lineTo(0, -21);
      ctx.lineTo(7, -7);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'tesla_walker': {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-10, -4, 20, 20);
      ctx.strokeRect(-10, -4, 20, 20);
      ctx.fillStyle = '#38f2ff';
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -13, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'phantom_knight': {
      ctx.fillStyle = '#2e1065';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -21);
      ctx.lineTo(13, 17);
      ctx.lineTo(-13, 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(22, -13);
      ctx.stroke();
      break;
    }
    case 'bio_spore': {
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -3, 13, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(-5, -8, 3, 0, Math.PI * 2);
      ctx.arc(4, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-3, -3, 6, 16);
      break;
    }
    case 'omega_drone': {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-19, 0);
      ctx.lineTo(-8, -14);
      ctx.lineTo(8, -14);
      ctx.lineTo(19, 0);
      ctx.lineTo(8, 14);
      ctx.lineTo(-8, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'airship_cannon': {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-13, 5, 26, 12);
      ctx.save();
      ctx.rotate(-0.22);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.fillRect(-14, -9, 28, 16);
      ctx.strokeRect(-14, -9, 28, 16);
      ctx.restore();
      ctx.fillStyle = '#fb7185';
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(18, -5, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'laser_emitter': {
      ctx.strokeStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-22, -16);
      ctx.lineTo(22, 16);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mid_guardian': {
      ctx.fillStyle = '#271729';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-18, -22, 32, 44, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(-13, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.fillRect(16, -18, 6, 36);
      break;
    }
    case 'archmage': {
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#1e1038';
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-16, -21, 32, 42, 9);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(56, 242, 255, 0.8)';
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38f2ff';
      ctx.beginPath();
      ctx.arc(0, -3, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'overlord_core': {
      ctx.shadowColor = '#38f2ff';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#090d24';
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 24);
      ctx.lineTo(-22, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'gear_roller': {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.save();
        ctx.rotate(a);
        ctx.fillRect(-3.5, -20, 7, 6);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spark_jelly': {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#422006';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -3, 13, Math.PI, 0);
      ctx.lineTo(13, 5);
      ctx.lineTo(-13, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      for (const tx of [-7, 0, 7]) {
        ctx.beginPath();
        ctx.moveTo(tx, 5);
        ctx.lineTo(tx + 2, 11);
        ctx.lineTo(tx - 2, 16);
        ctx.stroke();
      }
      break;
    }
    case 'laser_drone': {
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(17, 0);
      ctx.lineTo(0, 13);
      ctx.lineTo(-17, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-17, 0);
      ctx.lineTo(-27, 4);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'thunder_imp': {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(-7, 7, 7, 0, Math.PI * 2);
      ctx.arc(0, 5, 9, 0, Math.PI * 2);
      ctx.arc(8, 7, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#451a03';
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-9, -15, 18, 18, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-3, -6, 2, 0, Math.PI * 2);
      ctx.arc(4, -6, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spring_bumper': {
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.fillRect(-13, -6, 26, 18);
      ctx.strokeRect(-13, -6, 26, 18);
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, 10);
      ctx.lineTo(9, 4);
      ctx.lineTo(-9, -2);
      ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.roundRect(-17, -14, 34, 9, 4);
      ctx.fill();
      break;
    }
    case 'magnet_crane': {
      ctx.fillStyle = 'rgba(56, 242, 255, 0.22)';
      ctx.fillRect(-11, 4, 22, 18);
      ctx.strokeStyle = '#38f2ff';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(-11, 4, 22, 18);
      ctx.setLineDash([]);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-17, -16, 34, 20, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7ef9ff';
      ctx.beginPath();
      ctx.arc(0, -6, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mirror_gear': {
      ctx.fillStyle = '#422006';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        const r = k % 2 === 0 ? 18 : 12;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tether_spark': {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(10, 14);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(10, 15, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 16, 5);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'gravity_flipper': {
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#2e1065';
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e9d5ff';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'dash_rammer': {
      ctx.fillStyle = '#4c0519';
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-17, -13, 30, 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(9, -8);
      ctx.lineTo(9, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(-10, -4, 6, 4);
      break;
    }
    case 'clockwork_core': {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#422006';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 4);
        ctx.fillRect(-4, -24, 8, 6);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(25, 0);
      ctx.moveTo(0, -25);
      ctx.lineTo(0, 25);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'thunder_kronos': {
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#271705';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-18, -22, 36, 44, 10);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-22, -14, 5, 0, Math.PI * 2);
      ctx.arc(22, -14, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(2, -14);
      ctx.lineTo(-6, 1);
      ctx.lineTo(1, 1);
      ctx.lineTo(-3, 14);
      ctx.lineTo(7, -2);
      ctx.lineTo(0, -2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'thorn_weaver': {
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 30, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-18, -6);
      ctx.lineTo(-22, -16);
      ctx.moveTo(18, -6);
      ctx.lineTo(22, -16);
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(-5, -3, 3, 0, Math.PI * 2);
      ctx.arc(5, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'emerald_mantis': {
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(13, 6);
      ctx.lineTo(-13, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(-22, -14);
      ctx.moveTo(10, -2);
      ctx.lineTo(22, -14);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-4, -8, 2.2, 0, Math.PI * 2);
      ctx.arc(4, -8, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'prism_spore': {
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(14, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      for (const a of [0, 2.1, 4.2]) {
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 20, Math.sin(a) * 20, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'chrono_vine': {
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.fillRect(-10, -4, 20, 22);
      ctx.strokeRect(-10, -4, 20, 22);
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, 14);
      ctx.quadraticCurveTo(-20, -4, -10, -16);
      ctx.moveTo(14, 14);
      ctx.quadraticCurveTo(20, -4, 10, -16);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -10, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'bio_hydra': {
      ctx.fillStyle = '#052e16';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -6, 32, 24, 6);
      ctx.fill();
      ctx.stroke();
      for (const hx of [-11, 11]) {
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(hx, -13, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.arc(hx, -14, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'jade_sniper': {
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-17, 0);
      ctx.lineTo(0, -14);
      ctx.lineTo(17, 0);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-17, 0);
      ctx.lineTo(-27, 8);
      ctx.lineTo(-14, 16);
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'iron_goliath': {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-20, -22, 40, 44, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-16, -26, 12, 8);
      ctx.fillRect(4, -26, 12, 8);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(-12, -8, 24, 6);
      break;
    }
    case 'volt_centurion': {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(19, 0);
      ctx.lineTo(0, 24);
      ctx.lineTo(-19, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'emerald_stalker': {
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -23);
      ctx.lineTo(18, 15);
      ctx.lineTo(0, 8);
      ctx.lineTo(-18, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(-5, -3, 3, 0, Math.PI * 2);
      ctx.arc(5, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'verdant_warden': {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#052e16';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-20, -22, 40, 44, 10);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-25, -14);
      ctx.lineTo(25, 14);
      ctx.moveTo(-25, 14);
      ctx.lineTo(25, -14);
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'jade_chimera': {
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-24, -14);
      ctx.lineTo(0, -4);
      ctx.lineTo(24, -14);
      ctx.lineTo(16, 18);
      ctx.lineTo(-16, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-10, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(10, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'emerald_emperor': {
      ctx.shadowColor = '#6ee7b7';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#022c22';
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(20, -6);
      ctx.lineTo(14, 22);
      ctx.lineTo(-14, 22);
      ctx.lineTo(-20, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(0, -4, 6.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'frost_wraith': {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(16, -2);
      ctx.lineTo(12, 18);
      ctx.lineTo(0, 12);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-16, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(-4, -5, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'icicle_bat': {
      ctx.fillStyle = '#0369a1';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(-22, -6);
      ctx.lineTo(-8, -14);
      ctx.lineTo(0, 16);
      ctx.lineTo(8, -14);
      ctx.lineTo(22, -6);
      ctx.lineTo(8, 2);
      ctx.lineTo(-8, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(-4, -5, 2.5, 2.5);
      ctx.fillRect(1.5, -5, 2.5, 2.5);
      break;
    }
    case 'glacier_golem': {
      ctx.fillStyle = '#1e3a5f';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-18, -20, 36, 40, 5);
      ctx.fill();
      ctx.stroke();
      // Frontal Ice Shield
      ctx.fillStyle = 'rgba(125,211,252,0.5)';
      ctx.strokeStyle = '#e0f2fe';
      ctx.fillRect(-23, -16, 7, 32);
      ctx.strokeRect(-23, -16, 7, 32);
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(-8, -10, 18, 5);
      break;
    }
    case 'cryo_turret': {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * 16;
        const py = Math.sin(a) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'blizzard_fairy': {
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(186,230,253,0.45)';
      ctx.beginPath();
      ctx.ellipse(-13, -3, 10, 6, -0.4, 0, Math.PI * 2);
      ctx.ellipse(13, -3, 10, 6, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'ice_skater': {
      ctx.fillStyle = '#0369a1';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -16);
      ctx.lineTo(12, -16);
      ctx.lineTo(8, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Skate blades
      ctx.strokeStyle = '#f0f9ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, 15);
      ctx.lineTo(18, 15);
      ctx.stroke();
      break;
    }
    case 'mirror_frost': {
      ctx.fillStyle = '#172554';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-12, -18, 24, 36, 6);
      ctx.fill();
      ctx.stroke();
      // Reflective Cyan Mirror Plate
      ctx.fillStyle = 'rgba(224,242,254,0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.fillRect(-19, -20, 6, 40);
      ctx.strokeRect(-19, -20, 6, 40);
      break;
    }
    case 'permafrost_wyrm': {
      ctx.fillStyle = '#075985';
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-16, 16);
      ctx.lineTo(-10, -14);
      ctx.lineTo(0, -22);
      ctx.lineTo(10, -14);
      ctx.lineTo(16, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f0f9ff';
      ctx.beginPath();
      ctx.arc(-4, -8, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -8, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'frost_titan': {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-20, -22, 40, 44, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(-13, -10, 26, 6);
      ctx.fillRect(-24, -18, 7, 14);
      ctx.fillRect(17, -18, 7, 14);
      break;
    }
    case 'glacia_knight': {
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(18, -6);
      ctx.lineTo(15, 22);
      ctx.lineTo(-15, 22);
      ctx.lineTo(-18, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(224,242,254,0.6)';
      ctx.fillRect(-23, -14, 7, 30);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(-7, -7, 14, 4);
      break;
    }
    case 'cocytus_core': {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#082f49';
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(24, 0);
      ctx.lineTo(0, 24);
      ctx.lineTo(-24, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'glacies_emperor': {
      ctx.shadowColor = '#bae6fd';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#082f49';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(20, -8);
      ctx.lineTo(14, 22);
      ctx.lineTo(-14, 22);
      ctx.lineTo(-20, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f0f9ff';
      ctx.beginPath();
      ctx.arc(0, -4, 6.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

}
  ctx.restore();
}
