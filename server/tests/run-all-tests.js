const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TEST_DIR = __dirname;
const EXCLUDE = ['run-all-tests.js', 'TEST_README.md'];

function getTestFiles() {
  return fs.readdirSync(TEST_DIR)
    .filter(f => f.endsWith('.js') && !EXCLUDE.includes(f) && !f.endsWith('.test.js'));
}

async function runTestFile(file) {
  return new Promise((resolve) => {
    const proc = spawn('node', [path.join(TEST_DIR, file)], { stdio: 'inherit' });
    proc.on('close', (code) => {
      resolve({ file, code });
    });
  });
}

async function runAllTests() {
  const testFiles = getTestFiles();
  console.log('🧪 Running all test files:', testFiles.join(', '));
  let passed = 0, failed = 0;
  for (const file of testFiles) {
    console.log(`\n=== Running ${file} ===`);
    const result = await runTestFile(file);
    if (result.code === 0) {
      console.log(`✅ ${file} PASSED`);
      passed++;
    } else {
      console.log(`❌ ${file} FAILED (exit code ${result.code})`);
      failed++;
    }
  }
  console.log('\n========================');
  console.log(`Total: ${testFiles.length}, Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

runAllTests(); 