const fs = require('fs');
const { execSync } = require('child_process');

async function download() {
  const url = 'https://github.com/cli/cli/releases/download/v2.103.3/gh_2.103.3_windows_amd64.zip';
  console.log('Downloading GitHub CLI...');
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  fs.writeFileSync('scratch/gh.zip', Buffer.from(buf));
  console.log('Downloaded', buf.byteLength, 'bytes. Extracting...');
  execSync('tar -xf scratch/gh.zip -C scratch');
  console.log('Extracted successfully!');
}

download().catch(console.error);
