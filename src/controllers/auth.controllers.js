import chalk from 'chalk';
import sha256 from 'crypto-js/sha256.js';

import {
  validateParams,
  jwtSign,
  validateEmail,
  sendEmail,
} from '../utils/index.js';
import { UsersModel } from '../db/models/index.models.js';
import config from '../../config.js';

// Inicio de sesion
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

    // token
    const sessionid = sha256('movietoken' + user.id).toString();

    // Actualizamos su ultima sesion
    user.lastSession = new Date();
    user.sessionid = sessionid;

    await user.save();

    // todo OK
    res.status(200).send({
      id: user.id,
      email: user.usr,
      sessionid: jwtSign({
        id: user.id,
        usr: user.usr,
        sessionid: sessionid,
      }),
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

export const forgotPwd = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['usr'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { usr } = req.body;

    // Validamos que el correo sea valido
    if (!validateEmail(usr)) {
      return res.status(405).send({ msg: `Formato de correo incorrecto` });
    }

    // Validamos si existe
    const row = await UsersModel.find({ usr }, { pwd: 0, lastSession: 0 });

    // Si noobtuvimos resultados. marcamos error
    if (row.length == 0) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Usuario ${usr} no existe`);
      return res.status(402).send({ msg: `Usuario ${usr} no existe` });
    }

    const user = row[0];

    // token
    const sessionid = sha256('movietoken' + user.id).toString();

    // Actualizamos su hash
    user.sessionid = sessionid;

    await user.save();

    await sendEmail(
      [usr],
      'Usuario creado',
      'Usario creado con exito',
      `<div>
        <a href="${config.FRONT_URL}/change?hash=${sessionid}&email=${usr}">Cambiar PWD</a>
      </div>`,
    );

    res.status(200).send({ msg: 'Correo enviado' });
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

export const changePwd = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['hash', 'pwd'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { hash, pwd } = req.body;

    // Validamos si existe
    const qty = await UsersModel.count({ sessionid: hash });

    // Si noobtuvimos resultados. marcamos error
    if (qty == 0) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Hash incorrecto`);
      return res.status(401).send({ msg: `Hash incorrecto` });
    }

    // Actualizamos ese usuario
    await UsersModel.updateOne(
      { sessionid: hash },
      { $set: { sessionid: null, pwd: pwd } },
    );

    res.status(200).send({ msg: 'Correo enviado' });
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

// Registrar nuevo usuario
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
    const usr = req.body.usr.toLowerCase();
    const pwd = req.body.pwd;

    // Validamos que el correo sea valido
    if (!validateEmail(usr)) {
      return res.status(405).send({ msg: `Formato de correo incorrecto` });
    }

    // Validamos si existe
    const qty = await UsersModel.count({ usr });

    // Si obtuvimos resultados. marcamos error
    if (qty > 0) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Usuario ${usr} ya existe`);
      return res.status(402).send({ msg: `Usuario ${usr} ya existe` });
    }

    // Si llegamos aqui, creamos el usuario
    const newUser = new UsersModel({ usr: usr, pwd, status: 1 });
    await newUser.save();

    newUser.sessionid = sha256('movietoken' + newUser.id).toString();

    await newUser.save();

    await sendEmail(
      [usr],
      'Usuario creado',
      'Usario creado con exito',
      '<b>creaste un nuevo usuario</b>',
    );

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
