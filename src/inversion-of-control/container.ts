import 'reflect-metadata';
import { Container } from 'inversify';

import { MySQLClient } from 'app/backend/mysql';
import TYPES from './types';

import { UserService, UserController } from 'app/api/user';

const container = new Container();
container
  .bind<MySQLClient>(TYPES.MySQLClient)
  .to(MySQLClient)
  .inSingletonScope();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<UserController>(TYPES.UserController).to(UserController);

Object.seal(container);

export default container;
