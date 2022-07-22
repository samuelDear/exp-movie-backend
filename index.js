import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import chalk from 'chalk';

import config from './config.js';
import { router } from './src/routes/index.routes.js';

// app
const app = express();

// Configuracion
app.set('port', config.PORT || 4000);

// cors
app.use(cors({ origin: '*' })); // cors
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/api', router);
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Listeners
app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.info(
    `${chalk.green('[server]:')} Server listen on port ${app.get('port')}`,
  );
});
