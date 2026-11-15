const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const bannerBuf = fs.readFileSync('C:/MSK_Logistic_Software/client/public/images/logistics-hero-banner.png');
const banner = PNG.sync.read(bannerBuf);
console.log('Original banner:', banner.width, 'x', banner.height);

// Check alpha distribution
let transparent = 0, opaque = 0, semi = 0;
for (let i = 0; i < banner.width * banner.height; i++) {
  const a = banner.data[i * 4 + 3];
  if (a === 0) transparent++;
  else if (a === 255) opaque++;
  else semi++;
}
console.log('Pixels - Transparent:', transparent, 'Opaque:', opaque, 'Semi-transparent:', semi);

// Find bounding box of non-transparent pixels in original banner
let minX = banner.width, maxX = 0, minY = banner.height, maxY = 0;
for (let y = 0; y < banner.height; y++) {
  for (let x = 0; x < banner.width; x++) {
    const a = banner.data[(y * banner.width + x) * 4 + 3];
    if (a > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('Vehicle bounding box: minX=' + minX + ', maxX=' + maxX + ', minY=' + minY + ', maxY=' + maxY);
