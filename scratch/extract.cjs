const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const zipPath = 'C:\\MSK_Logistic_Software\\scratch\\temp_excel.zip';
  fs.copyFileSync('C:\\Users\\manas\\.gemini\\antigravity\\brain\\f9b346ab-260d-4143-8174-142db6e90f53\\.user_uploaded\\media_1794031881317_3ab583d1.xlsx', zipPath);
  console.log('Copied xlsx to zip');

  if (fs.existsSync('C:\\MSK_Logistic_Software\\scratch\\excel_unzipped')) {
    fs.rmSync('C:\\MSK_Logistic_Software\\scratch\\excel_unzipped', { recursive: true, force: true });
  }
  execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/\\/g, '\\\\')}', 'C:\\\\MSK_Logistic_Software\\\\scratch\\\\excel_unzipped')"`);
  console.log('Extracted zip successfully');
} catch (e) {
  console.error('Error:', e);
}
