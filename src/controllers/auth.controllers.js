import chalk from 'chalk';
import sha256 from 'crypto-js/sha256.js';

import { validateParams, jwtSign } from '../utils/index.js';
import { UsersModel } from '../db/models/index.models.js';
import { validateEmail } from '../utils/validator.js';

export const login = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['usr', 'pwd'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { usr, pwd } = req.body;

    // Validamos que el correo sea valido
    if (!validateEmail(usr)) {
      return res.status(405).send({ msg: `Formato de correo incorrecto` });
    }

    // Validamos si existe
    const row = await UsersModel.find({ usr, pwd }, { pwd: 0, lastSession: 0 });

    // Si no se encuentra, lanzamos error
    if (row.length === 0) {
      // eslint-disable-next-line no-console
      console.info(
        `${chalk.red('[ERROR]:')}`,
        `Datos incorrectos o usuario no existe`,
      );
      return res
        .status(403)
        .send({ msg: `Datos incorrectos o usuario no existe` });
    }

    const user = row[0];

    // Actualizamos su ultima sesion
    user.lastSession = new Date();
    await user.save();

    // todo OK
    res.status(200).send({
      id: user.id,
      email: user.usr,
      token: jwtSign({ id: user.id, usr: user.usr }),
      status: user.status,
      lastSession: {
        cannonical: user.lastSession,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`${chalk.red('[ERROR]:')}`, e.message);
    return (
      res
        .status(500)
        // eslint-disable-next-line camelcase
        .send({ msg: 'Error interno', msg_detail: e.message })
    );
  }
};

export const registerUser = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['usr', 'pwd'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { usr, pwd } = req.body;

    // Validamos que el correo sea valido
    if (!validateEmail(usr)) {
      return res.status(405).send({ msg: `Formato de correo incorrecto` });
    }

    // Validamos si existe
    const row = await UsersModel.find({ usr }, { pwd: 0, lastSession: 0 });

    // Si obtuvimos resultados. marcamos error
    if (row.length > 0) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Usuario ${usr} ya existe`);
      return res.status(402).send({ msg: `Usuario ${usr} ya existe` });
    }

    // Si llegamos aqui, creamos el usuario
    const newUser = new UsersModel({ usr, pwd, status: 1 });
    await newUser.save();

    newUser.sessionid = sha256('movietoken' + newUser.id).toString();

    await newUser.save();

    res.status(200).send({ msg: 'Usuario creado' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`${chalk.red('[ERROR]:')}`, e.message);
    return (
      res
        .status(500)
        // eslint-disable-next-line camelcase
        .send({ msg: 'Error interno', msg_detail: e.message })
    );
  }
};
