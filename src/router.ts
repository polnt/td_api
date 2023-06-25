import express, { Handler, Request, Response, NextFunction } from 'express';
import container from './inversion-of-control/container';

import { MySQLClient } from 'app/backend/mysql';

import { UserController } from 'app/api/user';
import { TodoController } from 'app/api/todo';

import TYPES from './inversion-of-control/types';
import { authMiddleware, notfoundMiddleware } from 'app/middlewares';

import { exceptionsFilter } from 'app/filters';

function asyncWrapper(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

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
  const todoController = container.get<TodoController>(TYPES.TodoController);

  // ROUTES
  // FIRST PATH HANDLED
  Router.get('/', (_: Request, response: Response) =>
    response.status(200).json({
      status: 200,
      message: `Welcome`,
    })
  );

  // SIGN IN
  Router.post('/signup', asyncWrapper(userController.create));
  Router.post('/signin', asyncWrapper(userController.authenticate));
  Router.delete('/delete-account', asyncWrapper(userController.delete));

  // AUTHENTICATION MIDDLEWARE
  Router.all(`/*`, [authMiddleware(mysql)]);

  // USER
  Router.get('/user/current', asyncWrapper(userController.getCurrentUser));
  Router.put('/user/update/:id', asyncWrapper(userController.update));

  // TO-DO
  Router.get('/todo', asyncWrapper(todoController.getAll));
  Router.get('/todo/:id', asyncWrapper(todoController.getOne));
  Router.post('/todo/create', asyncWrapper(todoController.create));
  Router.put('/todo/update/:id', asyncWrapper(todoController.update));
  Router.delete('/todo/delete/:id', asyncWrapper(todoController.delete));

  // 404 & Exceptions
  Router.use(notfoundMiddleware);
  Router.use(exceptionsFilter);

  return Router;
};
