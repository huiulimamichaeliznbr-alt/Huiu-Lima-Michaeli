import { AspectRatio } from '../types';
import { detectThemeFromPrompt, IMAGE_THEMES, ImageCategoryTheme } from './instantPrompts';

interface SynthesizerPrompt {
  id: number;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  mood: string;
}

// Map aspect ratio to canvas dimensions (optimized for instant rendering performance & high visual fidelity)
function getDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case '9:16':
      return { width: 540, height: 960 }; // Flagship vertical format
    case '16:9':
      return { width: 960, height: 540 };
    case '4:3':
      return { width: 720, height: 540 };
    case '1:1':
    default:
      return { width: 640, height: 640 };
  }
}

// Pseudo-random seeded generator
function createRng(seed: number) {
  let s = Math.abs(seed) || 12345;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectThemePalette(theme: ImageCategoryTheme, rng: () => number): string[] {
  const matched = IMAGE_THEMES.find((t) => t.id === theme) || IMAGE_THEMES[0];
  const list = matched.palettes;
  const idx = Math.floor(rng() * list.length);
  return list[idx];
}

export async function synthesizeArtwork(
  item: SynthesizerPrompt,
  aspectRatio: AspectRatio,
  globalStyle: string
): Promise<{ imageUrl: string; width: number; height: number; sizeBytes: number }> {
  const { width, height } = getDimensions(aspectRatio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto de desenho.');
  }

  const seed = stringToSeed(`${item.prompt}-${item.id}-${globalStyle}`);
  const rng = createRng(seed);
  const theme = detectThemeFromPrompt(item.prompt, globalStyle);
  const colors = selectThemePalette(theme, rng);

  const isAmoled = theme === 'amoled' || globalStyle.toLowerCase().includes('amoled');

  // 1. Background Fill
  if (isAmoled) {
    // True pitch black for AMOLED screens
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, colors[0]);
    bgGrad.addColorStop(0.5, colors[1]);
    bgGrad.addColorStop(1, colors[0]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Specialized Thematic Graphics
  switch (theme) {
    case 'carros': {
      // Highway asphalt road in perspective
      const roadHorizon = height * 0.55;
      const roadGrad = ctx.createLinearGradient(0, roadHorizon, 0, height);
      roadGrad.addColorStop(0, '#09090b');
      roadGrad.addColorStop(1, '#18181b');
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(width * 0.35, roadHorizon);
      ctx.lineTo(width * 0.65, roadHorizon);
      ctx.lineTo(width * 0.95, height);
      ctx.lineTo(width * 0.05, height);
      ctx.closePath();
      ctx.fill();

      // Neon speed light streaks along the road
      const streakColor = colors[2] || '#f43f5e';
      ctx.strokeStyle = streakColor;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const sx = width * (0.15 + rng() * 0.7);
        ctx.beginPath();
        ctx.moveTo(sx, roadHorizon + rng() * 50);
        ctx.lineTo(sx + (sx - width / 2) * 1.5, height);
        ctx.stroke();
      }

      // Sleek Supercar Silhouette
      const carY = height * 0.72;
      const carW = width * 0.7;
      const carH = height * 0.12;
      const carX = (width - carW) / 2;

      // Car body
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(carX + carW * 0.1, carY);
      ctx.lineTo(carX + carW * 0.3, carY - carH * 0.7);
      ctx.lineTo(carX + carW * 0.7, carY - carH * 0.7);
      ctx.lineTo(carX + carW * 0.9, carY);
      ctx.lineTo(carX + carW, carY + carH * 0.4);
      ctx.lineTo(carX, carY + carH * 0.4);
      ctx.closePath();
      ctx.fill();

      // Glowing aerodynamic spoiler & roofline
      ctx.strokeStyle = colors[3] || '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Headlights / Taillights glows
      const glowGradL = ctx.createRadialGradient(carX + carW * 0.18, carY + 8, 2, carX + carW * 0.18, carY + 8, 45);
      glowGradL.addColorStop(0, colors[3] || '#ffffff');
      glowGradL.addColorStop(0.4, `${colors[2] || '#f43f5e'}99`);
      glowGradL.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradL;
      ctx.beginPath();
      ctx.arc(carX + carW * 0.18, carY + 8, 45, 0, Math.PI * 2);
      ctx.fill();

      const glowGradR = ctx.createRadialGradient(carX + carW * 0.82, carY + 8, 2, carX + carW * 0.82, carY + 8, 45);
      glowGradR.addColorStop(0, colors[3] || '#ffffff');
      glowGradR.addColorStop(0.4, `${colors[2] || '#f43f5e'}99`);
      glowGradR.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradR;
      ctx.beginPath();
      ctx.arc(carX + carW * 0.82, carY + 8, 45, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric rain/light droplets
      for (let p = 0; p < 40; p++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(rng() * width, rng() * height, 1.5, 8 + rng() * 12);
      }
      break;
    }

    case 'retratos': {
      // Cinematic Portrait Backlight Halo
      const headX = width / 2;
      const headY = height * 0.42;
      const headRadius = width * 0.22;

      // Soft dramatic rim light aura
      const rimGrad = ctx.createRadialGradient(headX, headY, headRadius * 0.6, headX, headY, headRadius * 2);
      rimGrad.addColorStop(0, `${colors[2]}bb`);
      rimGrad.addColorStop(0.5, `${colors[3] || colors[1]}44`);
      rimGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Head silhouette
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Neck & Shoulders silhouette
      ctx.beginPath();
      ctx.moveTo(headX - headRadius * 0.5, headY + headRadius * 0.8);
      ctx.lineTo(headX - headRadius * 0.5, headY + headRadius * 1.5);
      ctx.lineTo(headX - width * 0.45, height);
      ctx.lineTo(headX + width * 0.45, height);
      ctx.lineTo(headX + headRadius * 0.5, headY + headRadius * 1.5);
      ctx.lineTo(headX + headRadius * 0.5, headY + headRadius * 0.8);
      ctx.closePath();
      ctx.fill();

      // Glowing rim edge on shoulders
      ctx.strokeStyle = colors[3] || '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Bokeh floating discs
      for (let b = 0; b < 12; b++) {
        const bx = rng() * width;
        const by = rng() * height;
        const br = 8 + rng() * 26;
        ctx.fillStyle = `${colors[(b % 3) + 2] || '#ffffff'}22`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'espaco': {
      // Dense starfield
      for (let s = 0; s < 120; s++) {
        const sx = rng() * width;
        const sy = rng() * height;
        const sr = rng() * 2 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + rng() * 0.7})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Swirling Cosmic Nebula
      const nebX = width * 0.5;
      const nebY = height * 0.38;
      const nebGrad = ctx.createRadialGradient(nebX, nebY, 10, nebX, nebY, width * 0.6);
      nebGrad.addColorStop(0, `${colors[3]}cc`);
      nebGrad.addColorStop(0.4, `${colors[2]}55`);
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(nebX, nebY, width * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Giant Ringed Planet
      const px = width * (0.35 + rng() * 0.3);
      const py = height * (0.35 + rng() * 0.2);
      const pr = width * 0.24;

      const pGrad = ctx.createLinearGradient(px - pr, py - pr, px + pr, py + pr);
      pGrad.addColorStop(0, colors[4] || '#ffffff');
      pGrad.addColorStop(0.5, colors[2]);
      pGrad.addColorStop(1, colors[0]);
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      // Planet rings
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 1.9, pr * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `${colors[3]}bb`;
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'natureza': {
      // Atmospheric Sun / Golden Hour
      const sunY = height * 0.35;
      const sunGrad = ctx.createRadialGradient(width * 0.5, sunY, 10, width * 0.5, sunY, width * 0.4);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.4, `${colors[3] || '#f59e0b'}88`);
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, sunY, width * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Mountain ridges
      for (let l = 0; l < 3; l++) {
        const mY = height * (0.5 + l * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, mY);
        const steps = 8;
        for (let st = 1; st <= steps; st++) {
          const ptX = (st / steps) * width;
          const ptY = mY - (rng() * height * 0.12 * (1 - l * 0.2));
          ctx.lineTo(ptX, ptY);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const lGrad = ctx.createLinearGradient(0, mY - 50, 0, height);
        lGrad.addColorStop(0, colors[l + 1] || colors[1]);
        lGrad.addColorStop(1, colors[0]);
        ctx.fillStyle = lGrad;
        ctx.fill();
      }

      // Water reflection at the bottom
      const lakeY = height * 0.78;
      const lakeGrad = ctx.createLinearGradient(0, lakeY, 0, height);
      lakeGrad.addColorStop(0, `${colors[2]}77`);
      lakeGrad.addColorStop(1, colors[0]);
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, lakeY, width, height - lakeY);
      break;
    }

    case 'cyberpunk':
    case 'arquitetura': {
      // Towering Vertical Megacity Skylines (Perfect for 9:16!)
      const bCount = 14;
      const bWidth = width / 9;
      const ground = height * 0.72;

      // Layer 1: Distant Skyscrapers
      ctx.fillStyle = `${colors[1]}cc`;
      for (let b = 0; b < bCount + 2; b++) {
        const bx = (b - 1) * bWidth * 0.9;
        const bH = height * (0.25 + rng() * 0.35);
        ctx.fillRect(bx, ground - bH, bWidth * 1.1, bH + (height - ground));
      }

      // Layer 2: Foreground Highrises
      ctx.fillStyle = colors[0];
      for (let b = 0; b < bCount; b++) {
        const bx = b * bWidth;
        const bH = height * (0.2 + rng() * 0.4);
        ctx.fillRect(bx, ground - bH, bWidth * 0.9, bH + (height - ground));

        // Window matrix lights
        ctx.fillStyle = `${colors[2] || '#00f0ff'}cc`;
        for (let row = 0; row < bH / 16; row++) {
          for (let col = 0; col < 3; col++) {
            if (rng() > 0.45) {
              ctx.fillRect(bx + 4 + col * 8, ground - bH + 8 + row * 14, 3, 5);
            }
          }
        }
        ctx.fillStyle = colors[0];
      }

      // Neon Holographic Beams
      ctx.strokeStyle = colors[3] || '#ff0055';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const beamX = rng() * width;
        ctx.beginPath();
        ctx.moveTo(beamX, ground - 100);
        ctx.lineTo(beamX + (rng() - 0.5) * 80, 0);
        ctx.stroke();
      }
      break;
    }

    case 'anime': {
      // Stylized Anime Rising Sun & Energy Aura
      const sunX = width / 2;
      const sunY = height * 0.38;
      const sunR = width * 0.28;

      // Diagonal cel-shaded speed lines
      ctx.strokeStyle = `${colors[2]}33`;
      ctx.lineWidth = 2;
      for (let a = 0; a < 16; a++) {
        const angle = (a / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(angle) * width, sunY + Math.sin(angle) * height);
        ctx.stroke();
      }

      // Radiant Core
      const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.6, colors[3] || '#ec4899');
      sunGrad.addColorStop(1, colors[1]);
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Floating mystical cherry blossoms / energy petals
      for (let p = 0; p < 25; p++) {
        const px = rng() * width;
        const py = rng() * height;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rng() * Math.PI);
        ctx.fillStyle = `${colors[3] || '#fda4af'}cc`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'amoled': {
      // Ultra-clean Dark AMOLED wallpaper with glowing neon geometry
      const centerX = width / 2;
      const centerY = height * 0.45;
      const outerR = width * 0.32;

      // Glow rings
      for (let r = 3; r >= 1; r--) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerR * (r / 3), 0, Math.PI * 2);
        ctx.strokeStyle = colors[r + 1] || '#00f0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = colors[r + 1] || '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Glowing central diamond / prism
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - outerR * 0.6);
      ctx.lineTo(centerX + outerR * 0.5, centerY);
      ctx.lineTo(centerX, centerY + outerR * 0.6);
      ctx.lineTo(centerX - outerR * 0.5, centerY);
      ctx.closePath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      break;
    }

    case 'comidas': {
      // Gourmet Culinary Dish / Burger / Gastronomy
      const plateY = height * 0.68;
      const plateW = width * 0.82;
      const plateH = height * 0.16;

      // Tabletop glow
      const tableGrad = ctx.createLinearGradient(0, plateY, 0, height);
      tableGrad.addColorStop(0, '#1c140c');
      tableGrad.addColorStop(1, '#080503');
      ctx.fillStyle = tableGrad;
      ctx.fillRect(0, plateY - 10, width, height - (plateY - 10));

      // Slate / Ceramic serving plate
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(width / 2, plateY, plateW * 0.5, plateH * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = `${colors[2] || '#d97706'}66`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Artisanal Food Stack (Burger / Gourmet Course)
      const foodX = width / 2;
      const foodBaseY = plateY - 20;

      // Bottom bun / base
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(foodX, foodBaseY, width * 0.28, height * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();

      // Savory patty / main element
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(foodX, foodBaseY - height * 0.04, width * 0.29, height * 0.045, 0, 0, Math.PI * 2);
      ctx.fill();

      // Melted cheese / sauce drips
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(foodX - width * 0.27, foodBaseY - height * 0.04);
      ctx.lineTo(foodX + width * 0.27, foodBaseY - height * 0.04);
      ctx.lineTo(foodX + width * 0.2, foodBaseY + 8);
      ctx.lineTo(foodX + width * 0.05, foodBaseY - 2);
      ctx.lineTo(foodX - width * 0.1, foodBaseY + 12);
      ctx.lineTo(foodX - width * 0.24, foodBaseY);
      ctx.closePath();
      ctx.fill();

      // Fresh crispy green lettuce garnish
      ctx.fillStyle = '#16a34a';
      for (let g = 0; g < 6; g++) {
        const gx = foodX - width * 0.24 + g * (width * 0.09);
        ctx.beginPath();
        ctx.arc(gx, foodBaseY - height * 0.075, 14, 0, Math.PI);
        ctx.fill();
      }

      // Top golden bun / dome
      const topBunGrad = ctx.createLinearGradient(0, foodBaseY - height * 0.2, 0, foodBaseY - height * 0.06);
      topBunGrad.addColorStop(0, '#d97706');
      topBunGrad.addColorStop(0.7, '#b45309');
      topBunGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = topBunGrad;
      ctx.beginPath();
      ctx.arc(foodX, foodBaseY - height * 0.06, width * 0.27, Math.PI, 0);
      ctx.fill();

      // Sesame seeds or culinary specks
      for (let s = 0; s < 24; s++) {
        const sx = foodX + (rng() - 0.5) * (width * 0.38);
        const sy = foodBaseY - height * 0.08 - rng() * (height * 0.09);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3, 1.5, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rising steam wisps
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      for (let st = 0; st < 4; st++) {
        const stX = foodX - width * 0.15 + st * (width * 0.1);
        ctx.beginPath();
        ctx.moveTo(stX, foodBaseY - height * 0.2);
        ctx.bezierCurveTo(stX - 18, foodBaseY - height * 0.3, stX + 18, foodBaseY - height * 0.4, stX, foodBaseY - height * 0.5);
        ctx.stroke();
      }
      break;
    }

    case 'animais': {
      // Majestic Wildlife / Creature Silhouette & Mystical Atmosphere
      const moonX = width * 0.5;
      const moonY = height * 0.32;
      const moonR = width * 0.26;

      // Glowing Lunar Orb / Aura
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR * 1.6);
      moonGrad.addColorStop(0, '#ffffff');
      moonGrad.addColorStop(0.4, `${colors[3] || '#38bdf8'}aa`);
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Colina / Rock promontory
      const rockY = height * 0.65;
      ctx.fillStyle = '#05070e';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, rockY + 40);
      ctx.lineTo(width * 0.65, rockY);
      ctx.lineTo(width, rockY + 60);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Noble Wolf / Feline / Creature Silhouette atop the hill
      const animalX = width * 0.52;
      const animalY = rockY;

      ctx.fillStyle = '#02040a';
      ctx.beginPath();
      // Body & chest
      ctx.moveTo(animalX - 35, animalY);
      ctx.lineTo(animalX - 30, animalY - 70);
      ctx.lineTo(animalX - 10, animalY - 110);
      // Head & snout pointing upward to the moon
      ctx.lineTo(animalX + 25, animalY - 145);
      ctx.lineTo(animalX + 35, animalY - 135);
      // Ears
      ctx.lineTo(animalX + 10, animalY - 150);
      ctx.lineTo(animalX + 5, animalY - 130);
      // Back and tail
      ctx.lineTo(animalX - 15, animalY - 90);
      ctx.lineTo(animalX - 65, animalY - 50);
      ctx.lineTo(animalX - 85, animalY - 15);
      ctx.lineTo(animalX - 55, animalY);
      ctx.closePath();
      ctx.fill();

      // Glowing cyan/amber creature rim-light on fur
      ctx.strokeStyle = colors[2] || '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Piercing glowing animal eye
      ctx.fillStyle = colors[3] || '#facc15';
      ctx.shadowColor = colors[3] || '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(animalX + 12, animalY - 132, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mystical ambient fireflies / floating spores
      for (let f = 0; f < 30; f++) {
        ctx.fillStyle = `${colors[3] || '#fde047'}cc`;
        ctx.beginPath();
        ctx.arc(rng() * width, rng() * height, rng() * 2.5 + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'robos': {
      // Mecha / Cybernetic Android Head & Armor Core
      const mechaX = width / 2;
      const mechaY = height * 0.44;

      // Tech grid background rays
      ctx.strokeStyle = `${colors[2] || '#06b6d4'}22`;
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 12; g++) {
        const ang = (g / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(mechaX, mechaY);
        ctx.lineTo(mechaX + Math.cos(ang) * width, mechaY + Math.sin(ang) * height);
        ctx.stroke();
      }

      // Angular Chassis Plating / Helmet
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(mechaX - width * 0.28, mechaY - height * 0.18);
      ctx.lineTo(mechaX + width * 0.28, mechaY - height * 0.18);
      ctx.lineTo(mechaX + width * 0.35, mechaY + height * 0.05);
      ctx.lineTo(mechaX + width * 0.18, mechaY + height * 0.22);
      ctx.lineTo(mechaX - width * 0.18, mechaY + height * 0.22);
      ctx.lineTo(mechaX - width * 0.35, mechaY + height * 0.05);
      ctx.closePath();
      ctx.fill();

      // Armor beveled rim
      ctx.strokeStyle = colors[2] || '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glowing Horizontal Visor Slit
      const visorY = mechaY - height * 0.02;
      const visorW = width * 0.44;
      const visorH = 18;

      const visorGrad = ctx.createLinearGradient(mechaX - visorW / 2, 0, mechaX + visorW / 2, 0);
      visorGrad.addColorStop(0, '#00f0ff');
      visorGrad.addColorStop(0.5, '#ffffff');
      visorGrad.addColorStop(1, '#00f0ff');
      ctx.fillStyle = visorGrad;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 25;
      ctx.fillRect(mechaX - visorW / 2, visorY - visorH / 2, visorW, visorH);
      ctx.shadowBlur = 0;

      // Chest Power Core Reactor
      const coreY = mechaY + height * 0.16;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(mechaX, coreY, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors[3] || '#f43f5e';
      ctx.shadowColor = colors[3] || '#f43f5e';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(mechaX, coreY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Circuit lines
      ctx.strokeStyle = `${colors[2] || '#00f0ff'}88`;
      ctx.lineWidth = 2;
      for (let c = 0; c < 4; c++) {
        const cX = mechaX - width * 0.2 + c * (width * 0.13);
        ctx.beginPath();
        ctx.moveTo(cX, mechaY + height * 0.22);
        ctx.lineTo(cX, height);
        ctx.stroke();
      }
      break;
    }

    case 'flores': {
      // Radiant Blooming Botanical Flower with Layered Petals
      const flowerX = width / 2;
      const flowerY = height * 0.42;
      const petalLayers = 4;

      // Stem and leaves
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(flowerX, flowerY + 40);
      ctx.bezierCurveTo(flowerX + 20, height * 0.65, flowerX - 20, height * 0.82, flowerX, height);
      ctx.stroke();

      // Stem leaves
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(flowerX + 35, height * 0.68, 38, 14, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(flowerX - 35, height * 0.76, 38, 14, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Concentric layered petals
      for (let l = petalLayers; l >= 1; l--) {
        const pCount = 6 + l * 2;
        const pLen = width * (0.16 + l * 0.06);
        const pWid = pLen * 0.42;

        for (let p = 0; p < pCount; p++) {
          const ang = (p / pCount) * Math.PI * 2 + (l % 2) * 0.3;
          ctx.save();
          ctx.translate(flowerX, flowerY);
          ctx.rotate(ang);

          const petGrad = ctx.createLinearGradient(0, 0, pLen, 0);
          petGrad.addColorStop(0, colors[1]);
          petGrad.addColorStop(0.6, colors[3] || '#f43f5e');
          petGrad.addColorStop(1, '#ffffff');
          ctx.fillStyle = petGrad;

          ctx.beginPath();
          ctx.ellipse(pLen * 0.55, 0, pLen * 0.55, pWid * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Luminous flower center / stamen
      const centerGrad = ctx.createRadialGradient(flowerX, flowerY, 2, flowerX, flowerY, 28);
      centerGrad.addColorStop(0, '#fef08a');
      centerGrad.addColorStop(0.6, '#f59e0b');
      centerGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 28, 0, Math.PI * 2);
      ctx.fill();

      // Dew drops / glowing stardust pollen
      for (let d = 0; d < 35; d++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(flowerX + (rng() - 0.5) * (width * 0.7), flowerY + (rng() - 0.5) * (height * 0.5), rng() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'moda': {
      // Luxury Sneaker & Watch Showcase on Illuminated Pedestal
      const standY = height * 0.65;

      // Studio spotlight beam from above
      const spotGrad = ctx.createLinearGradient(width / 2, 0, width / 2, standY);
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      spotGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.3, 0);
      ctx.lineTo(width * 0.7, 0);
      ctx.lineTo(width * 0.9, standY);
      ctx.lineTo(width * 0.1, standY);
      ctx.closePath();
      ctx.fill();

      // Glowing showcase pedestal
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.ellipse(width / 2, standY, width * 0.42, height * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors[3] || '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Luxury Sneaker Profile Silhouette
      const sX = width * 0.2;
      const sY = standY - 14;
      const sW = width * 0.6;
      const sH = height * 0.18;

      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      // Sole
      ctx.moveTo(sX, sY);
      ctx.lineTo(sX + sW * 0.95, sY);
      ctx.lineTo(sX + sW, sY - sH * 0.25);
      ctx.lineTo(sX + sW * 0.75, sY - sH * 0.4);
      // Ankle collar & tongue
      ctx.lineTo(sX + sW * 0.4, sY - sH);
      ctx.lineTo(sX + sW * 0.25, sY - sH * 0.95);
      ctx.lineTo(sX + sW * 0.18, sY - sH * 0.5);
      ctx.lineTo(sX + sW * 0.05, sY - sH * 0.2);
      ctx.closePath();
      ctx.fill();

      // Futuristic chrome swoosh / speedline
      ctx.strokeStyle = colors[2] || '#00f0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sX + sW * 0.25, sY - sH * 0.45);
      ctx.quadraticCurveTo(sX + sW * 0.5, sY - sH * 0.1, sX + sW * 0.85, sY - sH * 0.5);
      ctx.stroke();

      // Sole air cushion glow
      ctx.fillStyle = colors[3] || '#f59e0b';
      ctx.shadowColor = colors[3] || '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fillRect(sX + sW * 0.15, sY - sH * 0.15, sW * 0.6, 6);
      ctx.shadowBlur = 0;
      break;
    }

    case 'musica': {
      // Soundwaves, Frequency Bars & Musical Rhythm
      const midY = height * 0.5;

      // Pulsing Equalizer Vertical Neon Bars
      const barCount = 18;
      const barW = (width * 0.8) / barCount;
      const startX = width * 0.1;

      for (let b = 0; b < barCount; b++) {
        const bH = (height * 0.15) * Math.sin((b / barCount) * Math.PI) * (0.4 + rng() * 0.6);
        const bx = startX + b * barW;

        const bGrad = ctx.createLinearGradient(0, midY - bH, 0, midY + bH);
        bGrad.addColorStop(0, colors[3] || '#f43f5e');
        bGrad.addColorStop(0.5, colors[2] || '#a855f7');
        bGrad.addColorStop(1, colors[1]);
        ctx.fillStyle = bGrad;
        ctx.fillRect(bx, midY - bH, barW - 4, bH * 2);
      }

      // Radiant Sound Ripple Rings
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(width / 2, midY, width * (0.15 * r), 0, Math.PI * 2);
        ctx.strokeStyle = `${colors[2] || '#38bdf8'}${Math.round(180 / r).toString(16)}`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Stylized electric guitar silhouette in center
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(width * 0.44, height * 0.15);
      ctx.lineTo(width * 0.56, height * 0.15);
      ctx.lineTo(width * 0.53, midY - 60);
      // Body curves
      ctx.bezierCurveTo(width * 0.72, midY - 20, width * 0.75, midY + 90, width * 0.58, midY + 110);
      ctx.bezierCurveTo(width * 0.5, midY + 130, width * 0.42, midY + 130, width * 0.34, midY + 100);
      ctx.bezierCurveTo(width * 0.25, midY + 60, width * 0.32, midY - 20, width * 0.47, midY - 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = colors[3] || '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'veiculos': {
      // Supersonic Aircraft / Jet in Sunset Cloudscape
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.5, '#ea580c');
      skyGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant supersonic condensation trails (Vapor Contrails)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, height * 0.9);
      ctx.lineTo(width * 0.62, height * 0.34);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.18, height * 0.95);
      ctx.lineTo(width * 0.65, height * 0.36);
      ctx.stroke();

      // Stealth Fighter Jet Silhouette
      const jetX = width * 0.65;
      const jetY = height * 0.33;

      ctx.save();
      ctx.translate(jetX, jetY);
      ctx.rotate(-0.55);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      // Nose
      ctx.moveTo(0, -65);
      ctx.lineTo(16, -15);
      // Right delta wing
      ctx.lineTo(75, 40);
      ctx.lineTo(25, 40);
      ctx.lineTo(22, 60);
      ctx.lineTo(0, 52);
      // Left delta wing
      ctx.lineTo(-22, 60);
      ctx.lineTo(-25, 40);
      ctx.lineTo(-75, 40);
      ctx.lineTo(-16, -15);
      ctx.closePath();
      ctx.fill();

      // Engine Afterburner Flame Cone
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(-10, 56);
      ctx.lineTo(0, 85);
      ctx.lineTo(10, 56);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
      break;
    }

    case 'jogos':
    case 'fantasia': {
      // Floating Magical Island / Mystical Crystals / RPG Realm
      const crystalX = width / 2;
      const crystalY = height * 0.38;
      const cW = width * 0.22;
      const cH = height * 0.16;

      // Orbiting Magic Runes / Rings
      ctx.strokeStyle = `${colors[2] || '#a855f7'}88`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(crystalX, crystalY, cW * 1.5, cH * 0.4, 0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Floating Mana Crystal
      ctx.fillStyle = colors[3] || '#c084fc';
      ctx.beginPath();
      ctx.moveTo(crystalX, crystalY - cH * 0.8);
      ctx.lineTo(crystalX + cW * 0.6, crystalY);
      ctx.lineTo(crystalX, crystalY + cH * 0.8);
      ctx.lineTo(crystalX - cW * 0.6, crystalY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Floating Sky Island Rock below
      const islandY = height * 0.68;
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(width * 0.15, islandY);
      ctx.lineTo(width * 0.85, islandY);
      ctx.lineTo(width * 0.6, islandY + height * 0.18);
      ctx.lineTo(width * 0.45, islandY + height * 0.12);
      ctx.lineTo(width * 0.3, islandY + height * 0.15);
      ctx.closePath();
      ctx.fill();

      // Glowing vegetation / waterfall off island edge
      ctx.fillStyle = '#10b981';
      ctx.fillRect(width * 0.2, islandY - 6, width * 0.6, 8);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.52, islandY);
      ctx.lineTo(width * 0.52, height);
      ctx.stroke();
      break;
    }

    case 'abstrato': {
      // 3D Fluid Liquid Wave / Chrome Ribbon / Geometric Vortex
      const cX = width / 2;
      const cY = height * 0.45;

      for (let w = 0; w < 5; w++) {
        const rad = width * (0.18 + w * 0.07);
        const wGrad = ctx.createLinearGradient(0, cY - rad, width, cY + rad);
        wGrad.addColorStop(0, colors[(w % 4) + 1]);
        wGrad.addColorStop(0.5, '#ffffff');
        wGrad.addColorStop(1, colors[((w + 2) % 4) + 1]);

        ctx.save();
        ctx.translate(cX, cY);
        ctx.rotate(w * 0.4);
        ctx.strokeStyle = wGrad;
        ctx.lineWidth = 14 - w * 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, rad, rad * 0.5, 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Floating chrome orbs
      for (let o = 0; o < 8; o++) {
        const ox = width * (0.2 + rng() * 0.6);
        const oy = height * (0.25 + rng() * 0.4);
        const or = 8 + rng() * 18;

        const orbGrad = ctx.createRadialGradient(ox - or * 0.3, oy - or * 0.3, 2, ox, oy, or);
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.6, colors[o % 4]);
        orbGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, or, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    default: {
      // High-End Universal Adaptive Synthesizer for ANY prompt
      const promptLower = (item.prompt || '').toLowerCase();
      const orbX = width * 0.5;
      const orbY = height * 0.4;
      const orbR = width * 0.28;

      // Adapt background elements based on freeform keywords
      if (promptLower.includes('mar') || promptLower.includes('praia') || promptLower.includes('agua') || promptLower.includes('água') || promptLower.includes('lago')) {
        // Water horizon
        const waterY = height * 0.65;
        const wGrad = ctx.createLinearGradient(0, waterY, 0, height);
        wGrad.addColorStop(0, '#0284c7');
        wGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = wGrad;
        ctx.fillRect(0, waterY, width, height - waterY);
      }

      // Radiant Core Aura
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, orbR * 1.5);
      orbGrad.addColorStop(0, colors[3] || '#ffffff');
      orbGrad.addColorStop(0.5, colors[2] || colors[1]);
      orbGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Geometric / Organic focal artifact
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Atmospheric Particles
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(rng() * width, rng() * height, rng() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  // 3. Cinematic 9:16 Vignette & Lighting Polish
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 4. Clean Aesthetic Badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  const tagW = aspectRatio === '9:16' ? 148 : 126;
  const tagH = 26;
  ctx.roundRect(width - tagW - 14, height - tagH - 14, tagW, tagH, 6);
  ctx.fill();

  ctx.font = '600 11px sans-serif';
  ctx.fillStyle = '#f3f4f6';
  ctx.textAlign = 'right';
  const tagLabel =
    aspectRatio === '9:16'
      ? `9:16 • #${item.id.toString().padStart(2, '0')}`
      : `IA #${item.id.toString().padStart(2, '0')}`;
  ctx.fillText(tagLabel, width - 24, height - 22);

  // Extract base64
  const imageUrl = canvas.toDataURL('image/png', 0.95);
  const sizeBytes = Math.round((imageUrl.length * 3) / 4);

  return {
    imageUrl,
    width,
    height,
    sizeBytes,
  };
}

// Generate all images in parallel for genuine instantaneous batch production
export async function synthesizeAllInstantaneous(
  items: SynthesizerPrompt[],
  aspectRatio: AspectRatio,
  globalStyle: string
): Promise<Array<{ imageUrl: string; width: number; height: number; sizeBytes: number }>> {
  return Promise.all(items.map((item) => synthesizeArtwork(item, aspectRatio, globalStyle)));
}
