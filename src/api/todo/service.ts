import { inject, injectable } from 'inversify';

import { LogicError, NotFoundError } from 'app/utils';
import { MySQLClient } from 'app/backend/mysql';
import TYPES from 'app/inversion-of-control/types';
import { TodoPayload } from './model';

@injectable()
export class TodoService {
  constructor(@inject(TYPES.MySQLClient) private mysqlClient: MySQLClient) { }

  // CRUD
  public async getOne(todoID: number, userID: number): Promise<{ status: number; message: string; data?: any; }> {
    if (isNaN(todoID)) {
      throw new LogicError('Invalid todoID (not a number)');
    }

    const connection = await this.mysqlClient.getConnection();
    const [rows] = await connection.query('SELECT * FROM todo WHERE id = ? AND user_id = ?', [todoID, userID]);
    connection.release();

    const todos = this.mysqlClient.processRows(rows);
    if (todos?.length) {
      const { password, ...data } = todos[0];
      return {
        status: 200,
        message: 'todo found',
        data: data,
      };
    }
    throw new NotFoundError('todo not found');
  }

  public async getAll(userID: number): Promise<{
    status: number;
    data: TodoPayload[];
    message: string;
  }> {
    const connection = await this.mysqlClient.getConnection();
    const [rows] = await connection.query('SELECT * from todo WHERE user_id = ?', userID);
    connection.release();
    const todos = this.mysqlClient.processRows(rows);
    if (todos.length) {
      return {
        status: 200,
        data: todos,
        message: 'todos list successfully fetched',
      };
    }
    return { status: 200, data: [], message: 'No data' };
  }

  public async update(
    todoID: number, userID: number, payload: TodoPayload): Promise<{
      status: number;
      message: string;
    }> {
    await this.getOne(todoID, userID);
    const connection = await this.mysqlClient.getConnection();
    await connection.query('UPDATE todo SET ? WHERE id = ?', [payload, todoID]);
    connection.release();

    return { status: 201, message: 'todo successfully updated' };
  }

  public async create(userID: number, payload: TodoPayload): Promise<{ status: number; message: string; data?: any; }> {
    const connection = await this.mysqlClient.getConnection();
    const createResult: any = await connection.query('INSERT INTO todo SET ?', { user_id: userID, ...payload });
    connection.release();
    const { data } = await this.getOne(createResult[0].insertId, userID);

    return {
      status: 201,
      message: 'Todo successfully added',
      data: data,
    };
  }

  public async delete(todoID: number, userID: number): Promise<{ status: number; message: string; }> {
    await this.getOne(todoID, userID);

    const connection = await this.mysqlClient.getConnection();
    await connection.query('DELETE FROM todo WHERE id = ?', todoID);
    connection.release();

    return { status: 200, message: 'Todo deleted' };
  }
}
