const app = require('../src/app');

module.exports = (req, res) => {
  // En Vercel Serverless, req.url puede venir acortado o alterado dependiendo del rewrite.
  // req.originalUrl conserva la ruta completa. Nos aseguramos de que Express vea la correcta.
  if (req.headers['x-now-route-matches']) {
    // Vercel a veces hace cosas raras con el req.url.
  }
  return app(req, res);
};
