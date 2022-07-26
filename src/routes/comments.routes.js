import express from 'express';

const commentsRouter = express.Router();

// Obtener listado de comentarios
commentsRouter.get('/', (req, res) => {
  res.send({ msg: 'wao' });
});

// Crear comentario
commentsRouter.post('/', (req, res) => {
  res.send({ msg: 'wao' });
});

// Actualizar comentario
commentsRouter.put('/:id', (req, res) => {
  res.send({ msg: 'wao' });
});

// Obtener comentario por ID
commentsRouter.get('/:id', (req, res) => {
  res.send({ msg: 'wao' });
});

// Obtener comentarios por MOVIE ID
commentsRouter.get('/movie/:id', (req, res) => {
  res.send({ msg: 'wao' });
});

export default commentsRouter;
