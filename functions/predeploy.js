const { execSync } = require('child_process');

console.log('Running Next.js build for SSR function...');
// Run build at project root (one level up)
execSync('npm --prefix .. run build', { stdio: 'inherit' });
