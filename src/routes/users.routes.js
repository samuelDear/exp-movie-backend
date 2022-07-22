import express from 'express';
import chalk from 'chalk';

import { validateParams } from '../utils/index.js';
import { registerUser } from '../controllers/index.controllers.js';

const usersRouter = express.Router();

// Inicio de sesion
usersRouter.post('/login', (req, res) => {
  try {
    // parametros obligatorios
    const params = ['usr', 'pwd'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Retornamos OK
    res.status(200).send({ res: 'wao' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`${chalk.red('[ERROR]:')} e.message`);
    // eslint-disable-next-line camelcase
    res.status(500).send({ msg: 'Error interno', msg_detail: e.message });
  }
});

usersRouter.post('/forgot', (req, res) => {
  res.status(200).send('WAO0');
});

usersRouter.post('/register', registerUser);

export default usersRouter;
