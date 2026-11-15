const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const src = fs.readFileSync('C:/Users/manas/.gemini/antigravity/brain/0ff150a3-9202-4216-b4e4-bfed4e97c603/.user_uploaded/media_1793525476311_0c8daa4a.png');
const png = PNG.sync.read(src);

// Hero card bounding box in media_1793525476311_0c8daa4a.png:
// x: 141, y: 79, w: 872, h: 244
const cardW = 872;
const cardH = 244;
const cardPng = new PNG({ width: cardW, height: cardH });

for (let y = 0; y < cardH; y++) {
  for (let x = 0; x < cardW; x++) {
    const srcIdx = ((79 + y) * png.width + (141 + x)) * 4;
    const dstIdx = (y * cardW + x) * 4;
    cardPng.data[dstIdx] = png.data[srcIdx];
    cardPng.data[dstIdx + 1] = png.data[srcIdx + 1];
    cardPng.data[dstIdx + 2] = png.data[srcIdx + 2];
    cardPng.data[dstIdx + 3] = png.data[srcIdx + 3];
  }
}

const buffer = PNG.sync.write(cardPng);
fs.writeFileSync('C:/MSK_Logistic_Software/scratch/extracted_hero_card.png', buffer);
console.log('Saved extracted_hero_card.png');
