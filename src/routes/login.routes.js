import express from 'express';

import {
  registerUser,
  login,
  forgotPwd,
  changePwd,
} from '../controllers/index.controllers.js';

const loginRouter = express.Router();

// Inicio de sesion
loginRouter.post('/login', login);

// Recuperar PWD
loginRouter.post('/forgot', forgotPwd);

// Cambiar PWD
loginRouter.post('/change', changePwd);

// Registrar Usuario
loginRouter.post('/register', registerUser);

export default loginRouter;
