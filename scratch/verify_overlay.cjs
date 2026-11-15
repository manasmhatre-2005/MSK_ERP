const fs = require('fs');
const path = require('path');
const { PNG } = require(path.resolve(__dirname, '../client/node_modules/pngjs/lib/png.js'));

const banner = PNG.sync.read(fs.readFileSync('client/public/images/logistics-hero-banner.png'));
const heroCard = PNG.sync.read(fs.readFileSync('scratch/extracted_hero_card.png'));

// Scale banner from 1024x512 down to 488x244
const targetW = 488;
const targetH = 244;
const offsetX = 872 - targetW; // 384
console.log('OffsetX in heroCard:', offsetX);

// Let's sample a few vehicle points in banner vs heroCard:
// Point 1: Train yellow front at x=0.2 in banner -> in scaled: x = 0.2 * 488 = 97.6 -> in heroCard: 384 + 97.6 = 481.6
const bannerX = Math.round(0.2 * 1024);
const bannerY = Math.round(0.65 * 512);
const bIdx = (bannerY * banner.width + bannerX) * 4;
console.log('Banner train point:', banner.data[bIdx], banner.data[bIdx+1], banner.data[bIdx+2]);

const heroX = offsetX + Math.round(0.2 * targetW);
const heroY = Math.round(0.65 * targetH);
const hIdx = (heroY * heroCard.width + heroX) * 4;
console.log('HeroCard train point:', heroCard.data[hIdx], heroCard.data[hIdx+1], heroCard.data[hIdx+2]);
