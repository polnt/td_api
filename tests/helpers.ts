import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import { router } from 'app/router';

export const createApp = async (): Promise<express.Express> => {
  const app = express();
  app.use('*', cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', await router());
  return app;
};
