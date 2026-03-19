const fs = require('fs');
const content = fs.readFileSync('lint_report.json', 'utf8');
const lines = content.split('\n');
const jsonLine = lines.find(l => l.trim().startsWith('['));
if (!jsonLine) {
  console.log("No json array found in", content);
  process.exit(1);
}
const data = JSON.parse(jsonLine);
let totalProblems = 0;
data.forEach(file => {
  if (file.errorCount > 0 || file.warningCount > 0) {
    console.log(file.filePath);
    file.messages.forEach(m => {
      console.log(`  ${m.line}:${m.column} [${m.severity === 2 ? 'Error' : 'Warning'}] ${m.message} (${m.ruleId})`);
      totalProblems++;
    });
  }
});
console.log(`Total problems: ${totalProblems}`);
