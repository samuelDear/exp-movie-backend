import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const MoviesSchema = new Schema({
  // Titulo
  title: {
    type: String,
    required: [true, 'title es requerido'],
    maxLength: 244,
  },
  // Descripcion
  dsc: {
    type: String,
  },
  // Director de la pelicula
  director: {
    type: String,
    required: [true, 'director es requerido'],
    maxLength: 128,
  },
  image: {
    type: String,
    required: [true, 'image es requerido'],
  },
  // 0 INACTIVO, 1 ACTIVO
  status: {
    type: Number,
    required: [true, 'status es requerido'],
    enum: {
      values: [0, 1],
      message: '{VALUE} es incorrecto',
    },
  },
  // Fecha de creacion
  // eslint-disable-next-line camelcase
  created_at: {
    type: Date,
    required: [true, 'created_at es requerido'],
    default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
  },
  // Quien la agrego
  // eslint-disable-next-line camelcase
  created_by: {
    type: Types.ObjectId,
    ref: 'users',
  },
});

const MoviesModel = model('movies', MoviesSchema);

export default MoviesModel;
