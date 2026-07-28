const app = require('../src/app');

module.exports = (req, res) => {
  // En Vercel, si req.url no empieza con /api pero la ruta original sí lo era, 
  // Express fallará al hacer match con app.use('/api').
  // Forzamos que req.url empiece con /api si no lo hace, para que coincida.
  if (!req.url.startsWith('/api') && req.url !== '/') {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
