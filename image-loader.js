module.exports = function imageLoader({ src, width, quality }) {
  // Bypass local static images
  if (src.startsWith('/')) {
    return src;
  }
  return `/api/resize?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};
