import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import chalk from 'chalk';
import compression from 'compression';

import config from './config.js';
import { router } from './src/routes/index.routes.js';
import conn from './src/db/config/conn.js';

console.log(config);
// app
const app = express();

// Connection DB
conn(config.DB_USER, config.DB_PWD);

// Configuracion
app.set('port', config.PORT || 4000);

// Others
app.use(cors({ origin: '*' })); // cors
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// routes
app.use('/api', router);
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Listeners
app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.info(
    `${chalk.green('[server]:')} sServer listen on port ${app.get('port')}`,
  );
});
