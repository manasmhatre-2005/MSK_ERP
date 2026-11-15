const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const banner = PNG.sync.read(fs.readFileSync('client/public/images/logistics-hero-banner.png'));
const heroCard = PNG.sync.read(fs.readFileSync('scratch/extracted_hero_card.png'));

// In heroCard:
// The hero card is 872 x 244.
// In heroCard, the vehicles start around x=384, y=0 to 244.
// If we compare banner (1024 x 512) scaled down to 488 x 244:
// Are the positions of the airplane, ship, train, truck identical?
console.log('Comparing positions...');
// Airplane cockpit:
// In banner: cockpit tip is at x=65, y=177 (relative to 1024x512 -> x/W = 0.063, y/H = 0.345)
// In heroCard: 384 + 0.063 * 488 = 414.7, y = 0.345 * 244 = 84.1
const heroCockpitIdx = (84 * heroCard.width + 415) * 4;
console.log('HeroCard airplane cockpit:', heroCard.data[heroCockpitIdx], heroCard.data[heroCockpitIdx+1], heroCard.data[heroCockpitIdx+2]);

// Truck headlight:
// In banner: truck right headlight is at x=950, y=435 (x/W = 0.927, y/H = 0.849)
// In heroCard: 384 + 0.927 * 488 = 836, y = 0.849 * 244 = 207
const heroTruckIdx = (207 * heroCard.width + 836) * 4;
console.log('HeroCard truck headlight:', heroCard.data[heroTruckIdx], heroCard.data[heroTruckIdx+1], heroCard.data[heroTruckIdx+2]);
