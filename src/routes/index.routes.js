import express from 'express';

import usersRouter from './users.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
  // Carpetas de endpoints
  res.status(404).send('Page not found');
});

router.use('/users', usersRouter);

export { router };
