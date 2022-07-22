import express from 'express';

import { registerUser, login } from '../controllers/index.controllers.js';

const usersRouter = express.Router();

// Inicio de sesion
usersRouter.post('/login', login);

usersRouter.post('/forgot', (req, res) => {
  res.status(200).send('WAO0');
});

usersRouter.post('/register', registerUser);

export default usersRouter;
