const fs = require('fs');
const path = require('path');

async function main() {
  const rootDir = path.resolve(__dirname);
  const functionsDir = path.join(rootDir, 'functions');

  // Recreate functions/.next
  const fnNext = path.join(functionsDir, '.next');
  if (fs.existsSync(fnNext)) {
    fs.rmSync(fnNext, { recursive: true, force: true });
  }
  // Copy build output (cpSync will create fnNext directory)
  fs.cpSync(path.join(rootDir, '.next'), fnNext, { recursive: true });

  // Recreate functions/public
  const fnPublic = path.join(functionsDir, 'public');
  if (fs.existsSync(fnPublic)) {
    fs.rmSync(fnPublic, { recursive: true, force: true });
  }
  // Copy public assets (cpSync will create fnPublic directory)
  fs.cpSync(path.join(rootDir, 'public'), fnPublic, { recursive: true });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
