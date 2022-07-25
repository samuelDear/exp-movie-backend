import chalk from 'chalk';

import { MoviesModel, UsersModel } from '../db/models/index.models.js';
import { validateParams } from '../utils/index.js';

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

    // Armamos el retorno
    const out = {
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

// Actualizar pelicula por ID
export const updateMovieById = async (req, res) => {
  try {
    // parametros obligatorios
    const params = ['id'];
    if (!validateParams(req.params, params)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    const paramsBody = ['title', 'dsc', 'director', 'status'];
    if (!validateParams(req.body, paramsBody)) {
      return res
        .status(400)
        .send({ msg: `Parametros obligatorios ${params.join(', ')}` });
    }

    // Obtenemos los datos
    // El query params
    const { id } = req.params;
    // Body
    const { title, dsc, director, status } = req.body;

    const movie = await MoviesModel.findById(id);

    // Validamos si existe la pelicula por su ID
    if (movie === null) {
      // eslint-disable-next-line no-console
      console.info(`${chalk.red('[ERROR]:')}`, `Pelicula no encontrada`);
      return res.status(402).send({ msg: `Pelicula no encontrada` });
    }

    // Actualizamos esa pelicula
    movie.title = title;
    movie.dsc = dsc;
    movie.director = director;
    movie.status = status;

    await movie.save();

    // todo OK
    res.status(200).send({ msg: 'Pelicula actualizada con exito' });
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

// Eliminar pelicula por ID
export const deleteMovieById = async (req, res) => {
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

    await movie.remove();

    // todo OK
    res.status(200).send({ msg: 'Pelicula eliminada con exito' });
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

// Listado de peliculas
export const getMoviesList = async (req, res) => {
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
              title: reg,
            },
          ],
        },
        {
          $or: [
            {
              dsc: reg,
            },
          ],
        },
        {
          $or: [
            {
              director: reg,
            },
          ],
        },
      ];
    }

    // Obtenemos la cantidad de registros
    const qty = await MoviesModel.count(query);

    out.qty = qty;

    // Obtenemos los registros
    const row = await MoviesModel.find(query)
      .skip(offset * limit)
      .limit(limit)
      .sort({ [`${orderby}`]: dir });

    const records = [];

    // Armamos el objeto de salida
    row.map(el => {
      const record = {
        id: el.id,
        title: el.title,
        dsc: el.dsc,
        director: el.director,
        status: {
          id: el.status,
          dsc: el.status === '1' ? 'Activo' : 'Inactivo',
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
