import express from 'express';
import { jwtValidator } from '../utils/index.js';

import { getMovieById, createMovie } from '../controllers/index.controllers.js';

const moviesRouter = express.Router();

// Inicio de sesion
moviesRouter.get('/', jwtValidator, (req, res) => {
  res.send('wao');
});

moviesRouter.post('/', jwtValidator, createMovie);

moviesRouter.get('/:id', jwtValidator, getMovieById);

moviesRouter.put('/:id', jwtValidator, (req, res) => {
  res.send('wao');
});

moviesRouter.delete('/:id', jwtValidator, (req, res) => {
  res.send('wao');
});

export default moviesRouter;
