const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const heroCard = PNG.sync.read(fs.readFileSync('scratch/extracted_hero_card.png'));

// Sample colors in heroCard:
// 1. Sky at top center (above plane): x=500, y=20
const sky1 = (20 * heroCard.width + 500) * 4;
console.log('Sky top center:', heroCard.data[sky1], heroCard.data[sky1+1], heroCard.data[sky1+2]);

// 2. Sky top right: x=800, y=20
const sky2 = (20 * heroCard.width + 800) * 4;
console.log('Sky top right:', heroCard.data[sky2], heroCard.data[sky2+1], heroCard.data[sky2+2]);

// 3. Ground at bottom center: x=600, y=230
const gnd = (230 * heroCard.width + 600) * 4;
console.log('Ground bottom:', heroCard.data[gnd], heroCard.data[gnd+1], heroCard.data[gnd+2]);

// 4. Red light trail: let's scan bottom row y=220 from x=450 to 550
let maxRed = 0, redX = 0;
for (let x = 450; x <= 650; x++) {
  const idx = (220 * heroCard.width + x) * 4;
  if (heroCard.data[idx] > maxRed) {
    maxRed = heroCard.data[idx];
    redX = x;
  }
}
const rIdx = (220 * heroCard.width + redX) * 4;
console.log('Brightest red trail at x=' + redX + ':', heroCard.data[rIdx], heroCard.data[rIdx+1], heroCard.data[rIdx+2]);

// 5. Cyan ribbon: let's scan y=30 from x=550 to 650
let maxCyan = 0, cyanX = 0;
for (let x = 550; x <= 650; x++) {
  const idx = (30 * heroCard.width + x) * 4;
  const cyanVal = heroCard.data[idx+1] + heroCard.data[idx+2];
  if (cyanVal > maxCyan) {
    maxCyan = cyanVal;
    cyanX = x;
  }
}
const cIdx = (30 * heroCard.width + cyanX) * 4;
console.log('Brightest cyan ribbon at x=' + cyanX + ':', heroCard.data[cIdx], heroCard.data[cIdx+1], heroCard.data[cIdx+2]);
