import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const CommentsSchema = new Schema({
  // Descripcion
  dsc: {
    type: String,
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
  movie: {
    type: Types.ObjectId,
    ref: 'movies',
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

const CommentsModel = model('comments', CommentsSchema);

export default CommentsModel;
