import chalk from 'chalk';
import mongoose from 'mongoose';
import config from '../../../config.js';

const conn = (user, pwd) => {
  mongoose
    .connect(config.DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: true,
      auth: user ? { authSource: 'admin' } : undefined,
      user: user ? user : undefined,
      pass: user ? pwd : undefined,
    })
    .then(async () => {
      // eslint-disable-next-line no-console
      console.info(`${chalk.green('[server]:')} database connect`);
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.error(`${chalk.red('[ERROR]:')} database connection error`);
      // eslint-disable-next-line no-console
      console.error(e.message);
      // eslint-disable-next-line no-undef
      process.exit(0);
    });
};

export default conn;
