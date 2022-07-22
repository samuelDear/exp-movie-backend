import mongoose from 'mongoose';

import { validateEmail } from '../../utils/validator.js';

const { Schema, model } = mongoose;

const UsersSchema = new Schema({
  // Correo del usuario
  usr: {
    type: String,
    required: [true, 'usr es requerido'],
    maxLength: 128,
    unique: true,
    validate: [validateEmail, 'Formato de correo incorrecto'],
    match: [
      // eslint-disable-next-line no-useless-escape
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Formato de correo incorrecto',
    ],
  },
  // Password encryptada en MD5
  pwd: {
    type: String,
    required: [true, 'pwd es requerido'],
    maxLength: 244,
  },
  // 0 bloqueado, 1 activo
  status: {
    type: Number,
    required: [true, 'status es requerido'],
    enum: {
      values: [0, 1],
      message: '{VALUE} es incorrecto',
    },
  },
  sessionid: { type: String },
  lastSession: { type: Date, default: null },
});

const UsersModel = model('users', UsersSchema);

export default UsersModel;
