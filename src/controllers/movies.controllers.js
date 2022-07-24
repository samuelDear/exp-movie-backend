import chalk from 'chalk';
import mongoose from 'mongoose';

import config from '../../config.js';
import { MoviesModel, UsersModel } from '../db/models/index.models.js';
import { validateParams } from '../utils/index.js';

const { ObjectId } = mongoose;

// Crear pelicula
export const createMovie = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['title', 'director'];
    if (!validateParams(req.body, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    // Peticion
    const { title, director, dsc } = req.body;
    // Headers
    const { id: userId } = req.tokenInfo;

    // Validamos que no existe ya la pelicula por su titulo
    const qty = await MoviesModel.count({ title });

    // Si obtuvimos resultados. marcamos error
    if (qty > 0) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Pelicula ${title} ya existe`);
      return res.status(402).send({ msg: `Pelicula ${title} ya existe` });
    }

    // Si llegamos aqui, creamos la pelicula
    const newMovie = new MoviesModel({
      title,
      dsc,
      director,
      // eslint-disable-next-line camelcase
      created_at: new Date(),
      // eslint-disable-next-line camelcase
      created_by: userId,
      status: 1,
    });

    // Creamos la pelicula
    await newMovie.save();

    // todo OK
    res.status(200).send({ msg: 'Pelicula creada con exito' });
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

// Obtener pelicula por ID
export const getMovieById = async (req, res) => {
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

    const movie = await MoviesModel.findById(id);

    // Validamos si existe la pelicula por su ID
    if (movie === null) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Pelicula no encontrada`);
      return res.status(402).send({ msg: `Pelicula no encontrada` });
    }

    // Buscamos al creador
    const creatorUser = await UsersModel.findById(movie.created_by);

    // todo OK
    res.status(200).send({
      title: movie.title,
      dsc: movie.dsc,
      director: movie.director,
      status: {
        id: movie.status,
        dsc: movie.status === 1 ? 'Activo' : 'Inactivo',
      },
      creator: {
        id: creatorUser.id,
        email: creatorUser.usr,
      },
      // eslint-disable-next-line camelcase
      created_date: {
        cannonical: movie.created_at,
        formatted: '',
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
