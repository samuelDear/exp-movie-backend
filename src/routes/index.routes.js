import express from 'express';

import loginRouter from './login.routes.js';
import moviesRouter from './movies.routes.js';
import commentsRouter from './comments.routes.js';

const router = express.Router();

// Rutas
router.get('/', (req, res) => {
  // Carpetas de endpoints
  res.status(404).send('Page not found');
});

// Auth
router.use('/login', loginRouter);

// Movies
router.use('/movies', moviesRouter);

// Comments
router.use('/comments', commentsRouter);

export { router };
