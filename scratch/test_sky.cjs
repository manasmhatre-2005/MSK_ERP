const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const b = PNG.sync.read(fs.readFileSync('client/public/images/logistics-hero-banner.png'));

// Test various points
const testPoints = [
  { name: 'Top-left corner', x: 20, y: 20 },
  { name: 'Above plane', x: 150, y: 30 },
  { name: 'Between plane & ship', x: 330, y: 150 },
  { name: 'Between ship & crane', x: 800, y: 150 },
  { name: 'Top-right corner', x: 950, y: 30 },
  { name: 'Sky between crane beams', x: 860, y: 400 },
  { name: 'Inside plane fuselage', x: 200, y: 250 },
  { name: 'Inside yellow train', x: 100, y: 350 },
  { name: 'Inside cargo ship hull', x: 550, y: 400 },
  { name: 'Inside truck cab', x: 920, y: 400 }
];

for (const p of testPoints) {
  const idx = (p.y * b.width + p.x) * 4;
  console.log(p.name + ' (' + p.x + ',' + p.y + '): rgb(' + b.data[idx] + ',' + b.data[idx+1] + ',' + b.data[idx+2] + ') alpha=' + b.data[idx+3]);
}
