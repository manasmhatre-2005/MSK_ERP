const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const data = fs.readFileSync('C:/Users/manas/.gemini/antigravity/brain/0ff150a3-9202-4216-b4e4-bfed4e97c603/.user_uploaded/media_1793525476311_0c8daa4a.png');
const png = PNG.sync.read(data);

console.log('Image dimensions:', png.width, png.height);

// Let's find the exact bounding box of the hero card.
// In the screenshot, the hero card is located approximately at:
// x: 140 to 1010, y: 75 to 325.
// Let's inspect rows around y=75..85 and y=315..330 at x=500
console.log('Y scan at x=500:');
for (let y = 70; y <= 90; y++) {
  const idx = (y * png.width + 500) * 4;
  console.log(`y=${y}: rgb(${png.data[idx]}, ${png.data[idx+1]}, ${png.data[idx+2]})`);
}

for (let y = 315; y <= 335; y++) {
  const idx = (y * png.width + 500) * 4;
  console.log(`y=${y}: rgb(${png.data[idx]}, ${png.data[idx+1]}, ${png.data[idx+2]})`);
}

// And X scan at y=200
console.log('X scan at y=200:');
for (let x = 135; x <= 150; x++) {
  const idx = (200 * png.width + x) * 4;
  console.log(`x=${x}: rgb(${png.data[idx]}, ${png.data[idx+1]}, ${png.data[idx+2]})`);
}
for (let x = 1000; x <= 1020; x++) {
  const idx = (200 * png.width + x) * 4;
  console.log(`x=${x}: rgb(${png.data[idx]}, ${png.data[idx+1]}, ${png.data[idx+2]})`);
}
