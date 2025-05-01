const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const functionsDir = __dirname;
const projectDir = path.resolve(functionsDir, '..');

console.log('Cleaning functions .next and public directories...');
fs.rmSync(path.join(functionsDir, '.next'), { recursive: true, force: true });
fs.rmSync(path.join(functionsDir, 'public'), { recursive: true, force: true });

console.log('Building Next.js project...');
execSync('npm run build', { cwd: projectDir, stdio: 'inherit', shell: true });

console.log('Copying artifacts to functions...');
fs.cpSync(path.join(projectDir, '.next'), path.join(functionsDir, '.next'), { recursive: true });
fs.cpSync(path.join(projectDir, 'public'), path.join(functionsDir, 'public'), { recursive: true });
