import express from 'express';

import { jwtValidator } from '../utils/index.js';
import {
  createComment,
  getCommentListByMovie,
  getCommentById,
  updateComment,
  getCommentsList,
  deleteComment,
} from '../controllers/index.controllers.js';

const commentsRouter = express.Router();

// Obtener listado de comentarios
commentsRouter.get('/', jwtValidator, getCommentsList);

// Crear comentario
commentsRouter.post('/', jwtValidator, createComment);

// Actualizar comentario
commentsRouter.put('/:id', jwtValidator, updateComment);

// Obtener comentario por ID
commentsRouter.get('/:id', jwtValidator, getCommentById);

// Obtener comentarios por MOVIE ID
commentsRouter.get('/movie/:id', getCommentListByMovie);

// Eliminar un comentario por ID
commentsRouter.delete('/:id', jwtValidator, deleteComment);

export default commentsRouter;
