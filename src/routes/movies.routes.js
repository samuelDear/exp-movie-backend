import express from 'express';
import { jwtValidator } from '../utils/index.js';

import {
  getMovieById,
  createMovie,
  updateMovieById,
  deleteMovieById,
  getMoviesList,
} from '../controllers/index.controllers.js';

const moviesRouter = express.Router();

// Inicio de sesion
moviesRouter.get('/', jwtValidator, getMoviesList);

moviesRouter.post('/', jwtValidator, createMovie);

moviesRouter.get('/:id', jwtValidator, getMovieById);

moviesRouter.put('/:id', jwtValidator, updateMovieById);

moviesRouter.delete('/:id', jwtValidator, deleteMovieById);

export default moviesRouter;
