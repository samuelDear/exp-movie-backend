/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`),
});

export default {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  DB_USER: process.env.DB_USER || '',
  DB_PWD: process.env.DB_PWD || '',
  DB_URL: process.env.DB_URL || 'localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'LOCAL-MOVIE',
  JWT_MAX_EXP_TIME: process.env.JWT_MAX_EXP_TIME || '72h',
};
