const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const mediaDir = 'C:/Users/manas/.gemini/antigravity/brain/0ff150a3-9202-4216-b4e4-bfed4e97c603/.system_generated/logs/media';
if (fs.existsSync(mediaDir)) {
  const files = fs.readdirSync(mediaDir);
  for (const f of files) {
    if (f.endsWith('.png')) {
      const fullPath = path.join(mediaDir, f);
      try {
        const data = fs.readFileSync(fullPath);
        const p = PNG.sync.read(data);
        console.log(f, p.width, 'x', p.height, (data.length / 1024).toFixed(1) + ' KB');
      } catch (e) {
        console.log(f, 'error:', e.message);
      }
    }
  }
}
