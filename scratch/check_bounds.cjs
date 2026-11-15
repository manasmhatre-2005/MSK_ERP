const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));
const img = PNG.sync.read(fs.readFileSync('C:/MSK_Logistic_Software/scratch/extracted_hero_card.png'));

console.log('Image dimensions:', img.width, img.height);
// Let's check card 4 bounds:
// In extracted_hero_card.png, where is card 4?
// Let's scan y=130 from x=320 to 460
for (let x = 320; x <= 460; x += 15) {
  const idx = (130 * img.width + x) * 4;
  console.log(`x=${x}: rgb(${img.data[idx]},${img.data[idx+1]},${img.data[idx+2]})`);
}

// Where is the search bar right end?
// Let's scan y=200 from x=320 to 440
for (let x = 320; x <= 440; x += 15) {
  const idx = (200 * img.width + x) * 4;
  console.log(`y=200, x=${x}: rgb(${img.data[idx]},${img.data[idx+1]},${img.data[idx+2]})`);
}
