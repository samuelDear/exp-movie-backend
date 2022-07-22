import chalk from 'chalk';

import { validateParams } from '../utils/index.js';
import { UsersModel } from '../db/models/index.models.js';

export const loginUser = async (req, res) => {
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

    // Validamos si existe
    const row = await UsersModel.find({ usr, pwd }, { pwd: 0, lastSession: 0 });

    res.status(200).send({ msg: 'Usuario' });
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

    const response = await newUser.save();

    res.status(200).send({ msg: 'Usuario creado', res: response });
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
