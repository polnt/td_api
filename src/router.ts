import express, { Handler, Request, Response, NextFunction } from 'express';
import container from './inversion-of-control/container';

import { MySQLClient } from 'app/db/mysql';

import { UserController } from 'app/api/user';

import TYPES from './inversion-of-control/types';
import { authMiddleware, notfoundMiddleware } from 'app/middlewares';

import { exceptionsFilter } from 'app/filters';

const asyncWrapper =
  (handler: Handler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);

const Router = express.Router();

export const router = async (): Promise<express.Router> => {
  const mysql = container.get<MySQLClient>(TYPES.MySQLClient);

  process.on('SIGINT', async () => {
    await mysql.disconnect();
    process.exit(1);
  });

  try {
    await mysql.connect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  // CONTROLLERS
  const userController = container.get<UserController>(TYPES.UserController);

  // ROUTES
  // FIRST PATH HANDLED
  Router.get('/', (_: Request, response: Response) =>
    response.status(200).json({
      status: 200,
      message: `Welcome`,
    })
  );

  // SIGN IN
  Router.post('/signin', asyncWrapper(userController.authorize));

  // AUTHENTICATION MIDDLEWARE
  Router.all(`/*`, [authMiddleware(mysql)]);

  // USER
  Router.get('/user', asyncWrapper(userController.getAll));
  Router.get('/user/current', asyncWrapper(userController.getCurrentUser));
  Router.get('/user/:id', asyncWrapper(userController.getOne));
  Router.post('/user/create', asyncWrapper(userController.create));
  Router.put('/user/update/:id', asyncWrapper(userController.update));
  Router.put(
    '/user/reset_password',
    asyncWrapper(userController.resetPassword)
  );
  Router.delete('/user/delete/:id', asyncWrapper(userController.delete));

  // 404 & Exceptions
  Router.use(notfoundMiddleware);
  Router.use(exceptionsFilter);

  return Router;
};
