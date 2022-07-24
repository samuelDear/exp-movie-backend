import {
  registerUser,
  login,
  forgotPwd,
  changePwd,
} from './auth.controllers.js';
import { getMovieById, createMovie } from './movies.controllers.js';

export { registerUser, login, forgotPwd, changePwd, getMovieById, createMovie };
