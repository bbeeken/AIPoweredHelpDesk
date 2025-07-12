const { fork } = require('child_process');
const { readdirSync } = require('fs');
const path = require('path');

async function run() {
  const tests = readdirSync(path.join(__dirname, 'tests'))
    .filter(f => f.endsWith('.test.js'))
    .sort();
  for (const file of tests) {
    await new Promise((resolve, reject) => {
      const child = fork(path.join(__dirname, 'tests', file), { stdio: 'inherit' });
      child.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`${file} failed`));
        } else {
          resolve();
        }
      });
    });
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
