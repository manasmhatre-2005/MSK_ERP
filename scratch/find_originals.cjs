const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const dirs = [
  'C:/Users/manas/.gemini/antigravity/brain/0ff150a3-9202-4216-b4e4-bfed4e97c603/.user_uploaded',
  'C:/MSK_Logistic_Software/client/public/images',
  'C:/MSK_Logistic_Software/client/src/assets'
];

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    console.log('=== Directory:', dir);
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.endsWith('.png') || f.endsWith('.jpg')) {
        const full = path.join(dir, f);
        try {
          const buf = fs.readFileSync(full);
          const p = PNG.sync.read(buf);
          console.log(f, p.width, 'x', p.height, (buf.length / 1024).toFixed(1) + ' KB');
        } catch (e) {
          console.log(f, 'error or not png:', e.message);
        }
      }
    }
  }
}
