import 'reflect-metadata';
import { Container } from 'inversify';

import { MySQLClient } from 'app/backend/mysql';
import TYPES from './types';

import { UserService, UserController } from 'app/api/user';
import { TodoService, TodoController } from 'app/api/todo';

const container = new Container();
container
  .bind<MySQLClient>(TYPES.MySQLClient)
  .to(MySQLClient)
  .inSingletonScope();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<TodoService>(TYPES.TodoService).to(TodoService);
container.bind<TodoController>(TYPES.TodoController).to(TodoController);

Object.seal(container);

export default container;
