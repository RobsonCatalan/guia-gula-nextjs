const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const functionsDir = __dirname;
const projectDir = path.resolve(functionsDir, '..');

console.log('Cleaning functions .next and public directories...');
fs.rmSync(path.join(functionsDir, '.next'), { recursive: true, force: true });
fs.rmSync(path.join(functionsDir, 'public'), { recursive: true, force: true });

// Ensure Next.js build can access Firestore via Admin SDK
const saPath = path.join(functionsDir, 'gulaapp-5be3b-5c4c42fad535.json');
console.log('Predeploy: setting GOOGLE_APPLICATION_CREDENTIALS to', saPath);
process.env.GOOGLE_APPLICATION_CREDENTIALS = saPath;

console.log('Building Next.js project...');
execSync('npm run build', { cwd: projectDir, stdio: 'inherit', shell: true });

console.log('Copying artifacts to functions...');
fs.cpSync(path.join(projectDir, '.next'), path.join(functionsDir, '.next'), { recursive: true });
fs.cpSync(path.join(projectDir, 'public'), path.join(functionsDir, 'public'), { recursive: true });
