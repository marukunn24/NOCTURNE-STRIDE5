import fs from 'fs';

// Fix engine.ts
const enginePath = './src/game/engine.ts';
let engineContent = fs.readFileSync(enginePath, 'utf8');
const target1 = `      this.level.theme === 'secret_vault' ||
      this.level.theme ===
    ) {`;
const replacement1 = `      this.level.theme === 'secret_vault'
    ) {`;
if (engineContent.includes(target1)) {
  engineContent = engineContent.replace(target1, replacement1);
  fs.writeFileSync(enginePath, engineContent, 'utf8');
  console.log('Fixed engine.ts');
} else {
  console.log('Target1 not found in engine.ts');
}

// Fix enemyPortrait.ts
const portraitPath = './src/game/enemyPortrait.ts';
let portraitContent = fs.readFileSync(portraitPath, 'utf8');
const target2 = `    case 'glacies_emperor': {
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

}`;
const replacement2 = `    case 'glacies_emperor': {
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
}`;

if (portraitContent.includes(target2)) {
  portraitContent = portraitContent.replace(target2, replacement2);
  fs.writeFileSync(portraitPath, portraitContent, 'utf8');
  console.log('Fixed enemyPortrait.ts');
} else {
  console.log('Target2 not found in enemyPortrait.ts, trying fallback');
  if (portraitContent.trimEnd().endsWith('}')) {
    // Add restore and closing bracket
    portraitContent = portraitContent.trimEnd() + '\n  ctx.restore();\n}\n';
    fs.writeFileSync(portraitPath, portraitContent, 'utf8');
    console.log('Fixed enemyPortrait.ts with fallback');
  }
}
