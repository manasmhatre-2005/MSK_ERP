const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const banner = PNG.sync.read(fs.readFileSync('client/public/images/logistics-hero-banner.png'));
const heroCard = PNG.sync.read(fs.readFileSync('scratch/extracted_hero_card.png'));

console.log('Original banner:', banner.width, 'x', banner.height);
console.log('Extracted hero card:', heroCard.width, 'x', heroCard.height);

// In heroCard:
// Where is the train, ship, airplane?
// Let's check the yellow front of the train in heroCard vs banner:
// In banner: train is at bottom left, x ≈ 10 to 450, y ≈ 250 to 510
// In heroCard: train is at x ≈ 450 to 650, y ≈ 120 to 240
console.log('Aspect ratio banner:', (banner.width / banner.height).toFixed(2));
console.log('Aspect ratio heroCard:', (heroCard.width / heroCard.height).toFixed(2));
