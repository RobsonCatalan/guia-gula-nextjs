const functions = require('firebase-functions');
const next = require('next');

const app = next({
  dev: false,
  conf: { distDir: '.next' }
});
const handle = app.getRequestHandler();

exports.ssr = functions.https.onRequest(async (req, res) => {
  try {
    await app.prepare();
    await handle(req, res);
  } catch (err) {
    console.error('Error handling SSR request:', err);
    res.status(500).send('Internal Server Error');
  }
});
