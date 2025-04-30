#!/usr/bin/env node

const { rmSync, cpSync } = require('fs');
const { execSync } = require('child_process');
const { resolve } = require('path');

// Limpa builds antigos
['.next', 'functions/.next', 'functions/public'].forEach(p => {
  try { rmSync(resolve(__dirname, p), { recursive: true, force: true }); }
  catch {}
});

// Executa build do Next.js
execSync('npm run build', { stdio: 'inherit' });

// Copia build para functions
cpSync(resolve(__dirname, '.next'), resolve(__dirname, 'functions', '.next'), { recursive: true });
cpSync(resolve(__dirname, 'public'), resolve(__dirname, 'functions', 'public'), { recursive: true });

console.log('Predeploy script finalizado com sucesso.');
