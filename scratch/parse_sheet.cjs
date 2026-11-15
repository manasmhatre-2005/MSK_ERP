const fs = require('fs');

const sheet1Xml = fs.readFileSync('C:\\MSK_Logistic_Software\\scratch\\excel_unzipped\\xl\\worksheets\\sheet1.xml', 'utf8');

// Parse rows
const rows = [];
const rowMatches = sheet1Xml.matchAll(/<row r="(\d+)"[^>]*>(.*?)<\/row>/gs);
for (const rm of rowMatches) {
  const rowNum = parseInt(rm[1]);
  const rowContent = rm[2];
  const cells = [];
  const cellMatches = rowContent.matchAll(/<c r="([A-Z]+)\d+"(?: [^>]*)?>(?:<f>.*?<\/f>)?(?:<is><t>(.*?)<\/t><\/is>|<v>(.*?)<\/v>)?<\/c>/gs);
  for (const cm of cellMatches) {
    const col = cm[1];
    const val = cm[2] !== undefined ? cm[2] : cm[3];
    cells.push({ col, val: val || '' });
  }
  rows.push({ rowNum, cells });
}

console.log('--- ALL ROWS IN EXCEL TEMPLATE ---');
for (const r of rows) {
  const rowStr = r.cells.map(c => `${c.col}: "${c.val}"`).join(' | ');
  console.log(`Row ${r.rowNum.toString().padStart(2)}: ${rowStr}`);
}
