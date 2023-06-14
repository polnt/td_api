import express, { Express } from 'express';
import YAML from 'yaml';
import { readFileSync } from 'fs';
import { appConfig } from 'app/config';

import cors from 'cors';
import { router } from './router';

import swaggerUi from 'swagger-ui-express';

const app: Express = express();
const port = appConfig.app.port;
const docPath = 'doc/db.yml';
const file = readFileSync(docPath, 'utf-8');
const swaggerDocument = YAML.parse(file);

async function main() {
  app.use(cors());

  app.options('*', cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api', await router());

  app.get('/', (_, res) => {
    res.send('<h1>EZ PZ LZ</h1>');
  });

  app.listen(port, (err?: Error) => {
    if (err) {
      throw new Error('Erreur lors de la création du serveur');
    }
    console.log(`API OK, listening port: ${port}`);
  });
}
main();
