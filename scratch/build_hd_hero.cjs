const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

// Read the reference hero card (872 x 244)
const heroCard = PNG.sync.read(fs.readFileSync('scratch/extracted_hero_card.png'));

// In heroCard:
// The logistics montage section starts around x = 320 to 340 (where the red swoosh begins)
// and ends at x = 872 (width 872).
// Height is 244.
const cropX = 330;
const cropW = heroCard.width - cropX; // 542
const cropH = heroCard.height; // 244

console.log('Source crop size:', cropW, 'x', cropH);

// We want to generate an HD 2x Retina asset:
// Width = cropW * 2 = 1084
// Height = cropH * 2 = 488
const targetW = cropW * 2;
const targetH = cropH * 2;

const hdImg = new PNG({ width: targetW, height: targetH });

// Catmull-Rom Bicubic Interpolation for sharp, edge-preserving upscaling
function catmullRom(p0, p1, p2, p3, t) {
  const v = 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  );
  return Math.max(0, Math.min(255, v));
}

function getPixel(x, y, c) {
  const cx = Math.max(0, Math.min(cropW - 1, x));
  const cy = Math.max(0, Math.min(cropH - 1, y));
  const idx = ((cy) * heroCard.width + (cropX + cx)) * 4;
  return heroCard.data[idx + c];
}

console.log('Upscaling with Catmull-Rom bicubic interpolation...');

for (let dy = 0; dy < targetH; dy++) {
  const sy = (dy / targetH) * (cropH - 1);
  const y1 = Math.floor(sy);
  const ty = sy - y1;
  const y0 = Math.max(0, y1 - 1);
  const y2 = Math.min(cropH - 1, y1 + 1);
  const y3 = Math.min(cropH - 1, y1 + 2);

  for (let dx = 0; dx < targetW; dx++) {
    const sx = (dx / targetW) * (cropW - 1);
    const x1 = Math.floor(sx);
    const tx = sx - x1;
    const x0 = Math.max(0, x1 - 1);
    const x2 = Math.min(cropW - 1, x1 + 1);
    const x3 = Math.min(cropW - 1, x1 + 2);

    const outIdx = (dy * targetW + dx) * 4;

    for (let c = 0; c < 3; c++) {
      // 4 horizontal samples for each of the 4 rows
      const row0 = catmullRom(getPixel(x0, y0, c), getPixel(x1, y0, c), getPixel(x2, y0, c), getPixel(x3, y0, c), tx);
      const row1 = catmullRom(getPixel(x0, y1, c), getPixel(x1, y1, c), getPixel(x2, y1, c), getPixel(x3, y1, c), tx);
      const row2 = catmullRom(getPixel(x0, y2, c), getPixel(x1, y2, c), getPixel(x2, y2, c), getPixel(x3, y2, c), tx);
      const row3 = catmullRom(getPixel(x0, y3, c), getPixel(x1, y3, c), getPixel(x2, y3, c), getPixel(x3, y3, c), tx);

      // Vertical Catmull-Rom
      const val = catmullRom(row0, row1, row2, row3, ty);
      hdImg.data[outIdx + c] = Math.round(val);
    }
    hdImg.data[outIdx + 3] = 255;
  }
}

// Inpaint the card 4 and search bar tip if any remnants exist on far left
// In crop space (0 to 542):
// Card 4 was at original x ≈ 340 to 440 (crop x ≈ 10 to 110), y ≈ 120 to 170 (crop y ≈ 120 to 170)
// Search bar tip was at original x ≈ 340 to 420 (crop x ≈ 10 to 90), y ≈ 185 to 238
// In HD space (targetW = 1084, targetH = 488):
console.log('Cleaning card 4 and search bar remnants...');
for (let y = Math.round(115 * 2); y <= Math.round(175 * 2); y++) {
  for (let x = Math.round(65 * 2); x <= Math.round(115 * 2); x++) {
    const dstIdx = (y * targetW + x) * 4;
    const refIdx = (y * targetW + Math.round(125 * 2)) * 4;
    hdImg.data[dstIdx] = hdImg.data[refIdx];
    hdImg.data[dstIdx + 1] = hdImg.data[refIdx + 1];
    hdImg.data[dstIdx + 2] = hdImg.data[refIdx + 2];
  }
}
for (let y = Math.round(185 * 2); y < targetH; y++) {
  for (let x = 0; x <= Math.round(90 * 2); x++) {
    const dstIdx = (y * targetW + x) * 4;
    const refIdx = (y * targetW + Math.round(100 * 2)) * 4;
    hdImg.data[dstIdx] = hdImg.data[refIdx];
    hdImg.data[dstIdx + 1] = hdImg.data[refIdx + 1];
    hdImg.data[dstIdx + 2] = hdImg.data[refIdx + 2];
  }
}

// Apply Unsharp Mask (Luminance Sharpening) to enhance edges and micro-details
console.log('Applying edge-preserving unsharp mask...');
const sharpened = new PNG({ width: targetW, height: targetH });
// Copy original
for (let i = 0; i < targetW * targetH * 4; i++) {
  sharpened.data[i] = hdImg.data[i];
}

// 3x3 Laplacian / Unsharp kernel
const amount = 0.45; // Subtle crisp sharpening without haloing
for (let y = 1; y < targetH - 1; y++) {
  for (let x = 1; x < targetW - 1; x++) {
    const idx = (y * targetW + x) * 4;
    for (let c = 0; c < 3; c++) {
      const orig = hdImg.data[idx + c];
      // Sample 4 neighbors
      const up = hdImg.data[((y - 1) * targetW + x) * 4 + c];
      const down = hdImg.data[((y + 1) * targetW + x) * 4 + c];
      const left = hdImg.data[(y * targetW + (x - 1)) * 4 + c];
      const right = hdImg.data[(y * targetW + (x + 1)) * 4 + c];
      const blur = (up + down + left + right) / 4;
      const diff = orig - blur;
      const sharpVal = Math.max(0, Math.min(255, orig + diff * amount));
      sharpened.data[idx + c] = Math.round(sharpVal);
    }
    sharpened.data[idx + 3] = 255;
  }
}

// Left edge feathering along the boundary curve
// Tracing the red ribbon at top down to the train front
function getBoundaryX(y) {
  const normY = y / targetH;
  if (normY <= 0.38) {
    // Top diagonal red ribbon
    const t = normY / 0.38;
    return 16 + t * 140;
  } else if (normY <= 0.70) {
    // Transition between ribbon and train
    const t = (normY - 0.38) / 0.32;
    return 156 + t * 45;
  } else {
    // Lower road / light trails
    const t = (normY - 0.70) / 0.30;
    return 201 - t * 35;
  }
}

const featherWidth = 64; // 64px smooth feather
for (let y = 0; y < targetH; y++) {
  const bX = getBoundaryX(y);
  for (let x = 0; x < targetW; x++) {
    const idx = (y * targetW + x) * 4;
    let alpha = 1.0;
    if (x <= bX) {
      alpha = 0.0;
    } else if (x < bX + featherWidth) {
      const t = (x - bX) / featherWidth;
      // Smooth Hermite smoothstep curve
      alpha = t * t * (3 - 2 * t);
    }
    sharpened.data[idx + 3] = Math.round(alpha * 255);
  }
}

// Write outputs
const outBuffer = PNG.sync.write(sharpened);
const clientPublicPath = 'client/public/images/logistics-hero-seamless.png';
const clientDistPath = 'client/dist/images/logistics-hero-seamless.png';

fs.writeFileSync(clientPublicPath, outBuffer);
if (fs.existsSync('client/dist/images')) {
  fs.writeFileSync(clientDistPath, outBuffer);
}

console.log('Saved crystal-clear logistics-hero-seamless.png (' + targetW + 'x' + targetH + ')');
