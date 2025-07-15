const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/audit.log');

function log(event, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    details,
  };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

function readLogs() {
  try {
    return fs
      .readFileSync(logFile, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(l => JSON.parse(l));
  } catch {
    return [];
  }
}

module.exports = { log, readLogs };
