import chalk from 'chalk';
import sha256 from 'crypto-js/sha256.js';
import { format } from 'date-fns';

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

    const out = {
      id: user.id,
      email: user.usr,
      name: user.name,
      sessionid: jwtSign({
        id: user.id,
        usr: user.usr,
        sessionid: sessionid,
      }),
      status: user.status,
      lastSession: {
        cannonical: user.lastSession,
        formatted: format(new Date(user.lastSession), 'dd-MM-yyyy'),
      },
    };

    // todo OK
    res.status(200).send(out);
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
      'Movie place - Recuperar',
      'Usario creado',
      `<html>
        <head>
          <style>

            .mainBox {
              width: 100%;
              padding: 20px 0px;
              background: #CCC;
              heigth: 100%;
            }

            .floatingBox {
              margin: auto;
              padding: 15px;
              width: 70%;
              display: block;
              background: #FFF;
              border-radius: 21px;
            }

            .title {
              font-weight: 600;
              font-size: 24px;
              margin-bottom: 10px;
              text-align: center;
            }

            .msgContent {
              font-weight: 500;
              font-size: 14px;
              margin: 0px;
              margin-bottom: 10px;
              text-align: center;
            }

            .subMsg {
              font-weight: 500;
              font-size: 14px;
              margin: 0px;
              margin-bottom: 15px;
              margin-right: auto;
              margin-left: auto;
              text-align: center;
              line-height: 19px;
              text-decoration: none;
              display: block;
            }

            .btnRecover {
              background: #00375B;
              border-radius: 12px;
              display: block;
              margin: 20px auto;
              padding: 10px 15px;
              width: fit-content;
              text-decoration: none;
              color: #FFF;
              cursor: pointer;
            }

          </style>
        </head>
      </html>
      <body>
        <div class="mainBox">
          <div class="floatingBox">

            <h1 class="title" >Movie Place</h1>

            <p class='msgContent'>
              Entra en este enlace para restablecer la contrase&ntilde;a de la cuenta <label style='color: #FFF;'>${usr.toLowerCase()}</label>
            </p>

            <p class='subMsg'>
              Este es tu enlace
            </p>

            <a href="${
              config.FRONT_URL
            }/change?hash=${sessionid}&email=${usr}" class='subMsg'>
              ${config.FRONT_URL}/change
            </a>


            <a class="btnRecover" href="${
              config.FRONT_URL
            }/change?hash=${sessionid}&email=${usr}">Cambiar contraseña</a>
          
            <p style='color:#888;text-align: center;font-weight: bold;'>
              Si usted no solicito este código ignore este mensaje
            </p>
          </div>
        </div>
      </body>
      `,
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

    res.status(200).send({ msg: 'Contraseña cambiada exitosamente' });
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
    const name = req.body.name;

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
    const newUser = new UsersModel({ usr: usr, name, pwd, status: 1 });
    await newUser.save();

    newUser.sessionid = sha256('movietoken' + newUser.id).toString();

    await newUser.save();

    await sendEmail(
      [usr],
      'Movie place - Usuario creado',
      'Usario creado con exito',
      `<html>
        <head>
          <style>

            .mainBox {
              width: 100%;
              padding: 20px 0px;
              background: #CCC;
              heigth: 100%;
            }

            .floatingBox {
              margin: auto;
              padding: 15px;
              width: 70%;
              display: block;
              background: #FFF;
              border-radius: 21px;
            }

            .title {
              font-weight: 600;
              font-size: 24px;
              margin-bottom: 10px;
              text-align: center;
            }

            .msgContent {
              font-weight: 500;
              font-size: 14px;
              margin: 0px;
              margin-bottom: 10px;
              text-align: center;
            }

          </style>
        </head>
      </html>
      <body>
        <div class="mainBox">
          <div class="floatingBox">

            <h1 class="title">Movie Place</h1>

            <p class='msgContent'>
              Registro del usuario <label style='color: #FFF;'>${usr.toLowerCase()}</label> ha sido completado
            </p>
          
          </div>
        </div>
      </body>
      `,
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
