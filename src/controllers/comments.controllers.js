import chalk from 'chalk';
import jsonwebtoken from 'jsonwebtoken';

import { validateParams } from '../utils/index.js';
import {
  CommentsModel,
  MoviesModel,
  UsersModel,
} from '../db/models/index.models.js';
import config from '../../config.js';
import { format } from 'date-fns';

const { verify } = jsonwebtoken;

// Crear comentario
export const createComment = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['movie', 'dsc'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    // Peticion
    const { movie, dsc } = req.body;
    // Headers
    const { id: userId } = req.tokenInfo;

    // Validamos que existe la pelicula
    const movieRow = await MoviesModel.findById(movie);

    // Si no obtuvimos resultados. marcamos error
    if (!movieRow) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Película no existe`);
      return res.status(402).send({ msg: `Película no existe` });
    }

    const newComment = new CommentsModel({
      dsc: dsc,
      status: 1,
      movie: movie,
      // eslint-disable-next-line camelcase
      created_at: new Date(),
      // eslint-disable-next-line camelcase
      created_by: userId,
    });

    await newComment.save();

    const out = { msg: 'Comentario creado' };

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

// Obtener comentarios por pelicula
export const getCommentListByMovie = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['id'];
    if (!validateParams(req.params, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    const paramsQuery = ['limit', 'offset'];
    if (!validateParams(req.query, paramsQuery)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    let auth = req.headers['authorization'];

    let decoded = {};

    if (auth) {
      auth = auth.split(' ').pop();
      decoded = verify(auth, config.JWT_SECRET);
    }

    // Obtenemos los datos
    const orderby = req.query.orderby || 'created_at';
    const dir = req.query.dir ? (req.query.dir === 'asc' ? 1 : -1) : 1;
    const { id } = req.params;
    const { limit, offset } = req.query;
    const out = {};

    // Validamos que exista la pelicula
    const movieRow = await MoviesModel.findById(id);

    // Si no obtuvimos resultados. marcamos error
    if (!movieRow) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Película no existe`);
      return res.status(402).send({ msg: `Película no existe` });
    }

    // Buscamos la cantidad de comentarios
    const qty = await CommentsModel.count({ movie: id });

    out.qty = qty;

    // Buscamos los registros
    const row = await CommentsModel.find({ movie: id })
      .skip(offset * limit)
      .limit(limit)
      .sort({ [`${orderby}`]: dir });

    // Armamos la salida
    const records = [];
    for (let i = 0; row.length > i; i++) {
      // Buscamos al autor
      const user = await UsersModel.findById(row[i].created_by);

      const record = {
        id: row[i].id,
        dsc: row[i].dsc,
        author: {
          id: user.id,
          name: user.name,
          email: user.usr,
        },
        canDelete: decoded.id === user.id,
        canEdit: decoded.id === user.id,
        // eslint-disable-next-line camelcase
        created_date: {
          cannonical: row[i].created_at,
          formatted: format(new Date(row[i].created_at), 'dd-MM-yyyy HH:m'),
        },
      };

      records.push(record);
    }

    out.records = records;

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

// Obtener comentario por ID
export const getCommentById = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['id'];
    if (!validateParams(req.params, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { id } = req.params;

    // Validamos que exista el comentario
    const comment = await CommentsModel.findById(id);

    // Si no obtuvimos resultados. marcamos error
    if (!comment) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Comentario no existe`);
      return res.status(402).send({ msg: `Comentario no existe` });
    }

    // Consultamos la pelicula de el comentario
    const movie = await MoviesModel.findById(comment.movie);

    // Buscamos al autor
    const user = await UsersModel.findById(comment.created_by);

    // Armamos el resultado
    const out = {
      id: comment.id,
      dsc: comment.dsc,
      status: {
        id: comment.status,
        dsc: comment.status === '1' ? 'Activo' : 'Inactivo',
      },
      movie: {
        id: movie.id,
      },
      creator: {
        id: user.id,
        name: user.name,
        email: user.usr,
      },
      // eslint-disable-next-line camelcase
      created_date: {
        cannonical: comment.created_at,
        formatted: format(new Date(comment.created_at), 'dd-MM-yyyy HH:m'),
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

// Actualizar un comentario
export const updateComment = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['id'];
    if (!validateParams(req.params, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { id } = req.params;
    const { dsc } = req.body;
    const out = {};

    // Validamos que exista el comentario
    const comment = await CommentsModel.findById(id);

    // Si no obtuvimos resultados. marcamos error
    if (!comment) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Comentario no existe`);
      return res.status(402).send({ msg: `Comentario no existe` });
    }

    // Cambiamos el comentario
    comment.dsc = dsc;

    // Guardamos
    await comment.save();

    out.id = id;

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

// Listado de comentarios
export const getCommentsList = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['limit', 'offset'];
    if (!validateParams(req.query, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const out = {};
    const filter = req.query.filter || '';
    const orderby = req.query.orderby || 'created_at';
    const dir = req.query.dir ? (req.query.dir === 'asc' ? 1 : -1) : 1;
    const { limit, offset } = req.query;

    // Validamos los parametros obligatorios
    if (limit < 1) {
      // eslint-disable-next-line no-console
      console.info(
        `${chalk.red('[ERROR]:')} Parametro limit no puede ser menor a 1`,
      );
      return res
        .status(400)
        .send({ msg: `Parametro limit no puede ser menor a 1` });
    }

    if (offset < 0) {
      // eslint-disable-next-line no-console
      console.info(
        `${chalk.red('[ERROR]:')} Parametro offset no puede ser menor a 0`,
      );
      return res
        .status(400)
        .send({ msg: `Parametro offset no puede ser menor a 0` });
    }

    // Armamos el query
    const query = {};

    if (filter) {
      const reg = { $regex: filter, $options: 'i' };
      query.$or = [
        {
          $or: [
            {
              dsc: reg,
            },
          ],
        },
      ];
    }

    // Obtenemos la cantidad de registros
    const qty = await CommentsModel.count(query);

    out.qty = qty;

    // Obtenemos los registros
    const row = await CommentsModel.find(query)
      .skip(offset * limit)
      .limit(limit)
      .sort({ [`${orderby}`]: dir });

    const records = [];

    // Armamos el objeto de salida
    row.map(el => {
      const record = {
        id: el.id,
        dsc: el.dsc,
        status: {
          id: el.status,
          dsc: el.status === '1' ? 'Activo' : 'Inactivo',
        },
        // eslint-disable-next-line camelcase
        created_date: {
          cannonical: el.created_at,
          formatted: format(new Date(el.created_at), 'dd-MM-yyyy HH:m'),
        },
      };

      records.push(record);
    });

    out.records = records;

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

// Actualizar un comentario
export const deleteComment = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['id'];
    if (!validateParams(req.params, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    const { id } = req.params;
    const out = {};

    // Validamos que exista el comentario
    const comment = await CommentsModel.findById(id);

    // Si no obtuvimos resultados. marcamos error
    if (!comment) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Comentario no existe`);
      return res.status(402).send({ msg: `Comentario no existe` });
    }

    // Guardamos
    await comment.remove();

    out.msg = 'Comentario eliminado';

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
