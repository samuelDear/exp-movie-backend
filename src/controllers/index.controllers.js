import {
  registerUser,
  login,
  forgotPwd,
  changePwd,
} from './auth.controllers.js';
import {
  getMovieById,
  createMovie,
  updateMovieById,
  deleteMovieById,
  getMoviesList,
} from './movies.controllers.js';
import {
  createComment,
  getCommentListByMovie,
  updateComment,
  getCommentById,
  getCommentsList,
  deleteComment,
} from './comments.controllers.js';

export {
  registerUser,
  login,
  forgotPwd,
  changePwd,
  getMovieById,
  createMovie,
  updateMovieById,
  deleteMovieById,
  getMoviesList,
  createComment,
  getCommentListByMovie,
  updateComment,
  getCommentById,
  getCommentsList,
  deleteComment,
};
