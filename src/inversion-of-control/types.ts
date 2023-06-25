const TYPES = {
  MySQLClient: Symbol.for('MySQLClient'),

  UserService: Symbol.for('UserService'),
  UserController: Symbol.for('UserController'),
  TodoService: Symbol.for('TodoService'),
  TodoController: Symbol.for('TodoController'),
};

Object.seal(TYPES);

export default TYPES;
