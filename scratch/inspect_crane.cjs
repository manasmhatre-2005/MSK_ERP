const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));
const img = PNG.sync.read(fs.readFileSync('C:/MSK_Logistic_Software/scratch/extracted_hero_card.png'));

console.log('Checking crane area x=240..340, y=50..120');
for (let y = 60; y <= 100; y += 10) {
  let row = [];
  for (let x = 260; x <= 320; x += 15) {
    const idx = (y * img.width + x) * 4;
    row.push('rgb(' + img.data[idx] + ',' + img.data[idx+1] + ',' + img.data[idx+2] + ')');
  }
  console.log('y=' + y + ': ' + row.join(' '));
}
