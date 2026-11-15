const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const data = fs.readFileSync('C:/Users/manas/.gemini/antigravity/brain/0ff150a3-9202-4216-b4e4-bfed4e97c603/.user_uploaded/media_1793525476311_0c8daa4a.png');
const png = PNG.sync.read(data);

console.log('Image dimensions:', png.width, png.height);

// Let's find the hero banner boundary
// In the screenshot:
// The hero banner has a white background on the top-left (e.g. near x=160, y=100)
// And the page background outside the banner is light blueish grey e.g. around (245, 249, 254)
// Let's scan horizontally across the middle of the hero banner (y = 150)
let startX = -1, endX = -1;
const testY = 150;
for (let x = 120; x < png.width; x++) {
  const idx = (testY * png.width + x) * 4;
  const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2];
  if (r > 250 && g > 250 && b > 250 && startX === -1) {
    startX = x;
  }
}

// Let's scan from right edge to find right border
for (let x = png.width - 1; x > 500; x--) {
  const idx = (testY * png.width + x) * 4;
  const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2];
  // Hero banner right side is dark navy (low r, g, b e.g. < 40)
  // Outside it on right is background light blueish grey
  if (r < 60 && g < 60 && b < 80) {
    endX = x;
    break;
  }
}

console.log('Detected hero banner X bounds:', startX, endX);

// Now find top and bottom bounds at x = 500
let startY = -1, endY = -1;
for (let y = 60; y < 400; y++) {
  const idx = (y * png.width + 500) * 4;
  const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2];
  // Inside hero banner at x=500 it's dark navy or sky
  if (r < 60 && g < 100 && b < 150) {
    startY = y;
    break;
  }
}
for (let y = 350; y > 150; y--) {
  const idx = (y * png.width + 500) * 4;
  const r = png.data[idx], g = png.data[idx + 1], b = png.data[idx + 2];
  if (r < 60 && g < 100 && b < 150) {
    endY = y;
    break;
  }
}
console.log('Detected hero banner Y bounds at x=500:', startY, endY);
