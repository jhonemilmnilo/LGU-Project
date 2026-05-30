const fs = require('fs');
const path = require('path');
const inFile = path.resolve(__dirname, '..', 'ngrok_paymongo_matches.txt');
const outFile = path.resolve(__dirname, '..', 'ngrok_paymongo_raw_decoded.txt');
if (!fs.existsSync(inFile)) {
  console.error('Input file not found:', inFile);
  process.exit(2);
}
const txt = fs.readFileSync(inFile, 'utf8');
const regex = /"raw":"([^\"]*)"/gs;
let i = 0;
const outputs = [];
for (const m of txt.matchAll(regex)) {
  let b64 = m[1];
  // Remove any newlines or spaces that might be inserted
  b64 = b64.replace(/\r?\n/g, '');
  try {
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    outputs.push(`--- raw #${++i} ---\n${decoded}\n`);
  } catch (e) {
    outputs.push(`--- raw #${++i} ---\n<<decode-error>>\n`);
  }
}
fs.writeFileSync(outFile, outputs.join('\n'), 'utf8');
console.log('WROTE', i, 'entries to', outFile);
