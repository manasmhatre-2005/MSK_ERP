const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function parseGitIndex() {
  const buf = fs.readFileSync('.git/index');
  const magic = buf.slice(0, 4).toString('ascii');
  if (magic !== 'DIRC') {
    throw new Error('Not a valid git index: ' + magic);
  }
  const version = buf.readUInt32BE(4);
  const entryCount = buf.readUInt32BE(8);
  console.log(`Git Index Version: ${version}, Tracked Entries: ${entryCount}`);

  let offset = 12;
  const entries = [];

  for (let i = 0; i < entryCount; i++) {
    const ctimeSec = buf.readUInt32BE(offset);
    const mtimeSec = buf.readUInt32BE(offset + 8);
    const fileSize = buf.readUInt32BE(offset + 36);
    const sha1 = buf.slice(offset + 40, offset + 60).toString('hex');
    const flags = buf.readUInt16BE(offset + 60);
    const nameLength = flags & 0x0fff;

    offset += 62;
    let nameEnd = offset;
    while (buf[nameEnd] !== 0) {
      nameEnd++;
    }
    const name = buf.slice(offset, nameEnd).toString('utf8');
    
    // 8-byte padding
    const entryLen = (62 + (nameEnd - offset) + 1);
    const pad = (8 - (entryLen % 8)) % 8;
    offset = nameEnd + 1 + pad;

    entries.push({ name, fileSize, sha1 });
  }

  return entries;
}

function verifyTrackedFiles() {
  const entries = parseGitIndex();
  let missing = [];
  let modified = [];
  let intact = 0;

  for (const entry of entries) {
    const filePath = entry.name.replace(/\//g, path.sep);
    if (!fs.existsSync(filePath)) {
      missing.push(entry.name);
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.size !== entry.fileSize) {
      // Calculate git blob sha1
      const content = fs.readFileSync(filePath);
      const header = `blob ${content.length}\0`;
      const hash = crypto.createHash('sha1').update(header).update(content).digest('hex');
      if (hash !== entry.sha1) {
        modified.push({ file: entry.name, expectedSize: entry.fileSize, actualSize: stat.size, sha: entry.sha1 });
      } else {
        intact++;
      }
    } else {
      // Same size, check blob sha1 to be 100% sure
      const content = fs.readFileSync(filePath);
      const header = `blob ${content.length}\0`;
      const hash = crypto.createHash('sha1').update(header).update(content).digest('hex');
      if (hash !== entry.sha1) {
        // Check if CRLF vs LF
        const zlib = require('zlib');
        const objPath = '.git/objects/' + entry.sha1.slice(0, 2) + '/' + entry.sha1.slice(2);
        let reason = 'different content';
        if (fs.existsSync(objPath)) {
          const uncompressed = zlib.inflateSync(fs.readFileSync(objPath));
          const gitContent = uncompressed.slice(uncompressed.indexOf(0) + 1).toString('utf8');
          const diskContent = content.toString('utf8');
          if (gitContent.replace(/\r\n/g, '\n') === diskContent.replace(/\r\n/g, '\n')) {
            reason = 'CRLF vs LF line endings only';
          }
        }
        modified.push({ file: entry.name, expectedSize: entry.fileSize, actualSize: stat.size, reason });
      } else {
        intact++;
      }
    }
  }

  console.log(`\n--- Git Integrity Results ---`);
  console.log(`Intact tracked files: ${intact} / ${entries.length}`);
  console.log(`Missing tracked files: ${missing.length}`);
  if (missing.length > 0) {
    missing.forEach(f => console.log('  [MISSING]', f));
  }
  console.log(`Modified tracked files: ${modified.length}`);
  if (modified.length > 0) {
    modified.forEach(m => console.log(`  [MODIFIED] ${m.file} (index: ${m.expectedSize}B, disk: ${m.actualSize}B) -> ${m.reason}`));
  }
}

verifyTrackedFiles();
