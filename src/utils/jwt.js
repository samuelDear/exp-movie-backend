import jsonwebtoken from 'jsonwebtoken';
import chalk from 'chalk';

import config from '../../config.js';

const { sign, verify } = jsonwebtoken;

export const jwtValidator = (req, res, next) => {
  try {
    // Obtenemos el token de la cabecera
    let auth = req.headers['authorization'];

    // Si no existe, retornamos error
    if (!auth) throw new Error('Not JWT');

    auth = auth.split(' ').pop();

    // eslint-disable-next-line no-console
    console.log(auth);

    const decoded = verify(auth, config.JWT_SECRET);

    req.tokenInfo = decoded;

    // eslint-disable-next-line no-console
    console.info(`${chalk.green('[server]:')} token`, decoded);

    return next();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`${chalk.red('[ERROR]:')}`, e.message);
    return (
      res
        .status(401)
        // eslint-disable-next-line camelcase
        .send({ msg: 'Sesion invalida', msg_detail: e.message })
    );
  }
};

export const jwtSign = payload =>
  sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_MAX_EXP_TIME,
  });
