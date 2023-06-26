import dotenv from 'dotenv';
import express, { Express } from 'express';
import YAML from 'yaml';
import { readFileSync } from 'fs';
import { appConfig } from 'app/config';

import cors from 'cors';
import { router } from './router';

import swaggerUi from 'swagger-ui-express';

dotenv.config();
const app: Express = express();
const port = appConfig.app.port;
const docPath = 'src/swaggerdoc/db.yml';
const file = readFileSync(docPath, 'utf-8');
const swaggerDocument = YAML.parse(file);

async function main() {
  app.use(cors());

  app.options('*', cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api', await router());

  app.get('/', (_, res) => {
    res.send('<a href="http://localhost:3000/api">API</a>');
  });

  app.listen(port, (err?: Error) => {
    if (err) {
      throw new Error('Erreur lors de la création du serveur');
    }
    console.log(`API OK, listening port: ${port}`);
    console.log(process.env.NODE_ENV);
  });
}
main();
