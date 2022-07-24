import express from 'express';

import loginRouter from './login.routes.js';

const router = express.Router();

// Rutas
router.get('/', (req, res) => {
  // Carpetas de endpoints
  res.status(404).send('Page not found');
});

// Auth
router.use('/login', loginRouter);

export { router };
