import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';

import { appConfig } from 'app/config';
import { ConflictError, LogicError, NotFoundError, UnauthorizedError } from 'app/utils';
import { AuthPayload } from './model';
import { MySQLClient } from 'app/backend/mysql';
import TYPES from 'app/inversion-of-control/types';

@injectable()
export class UserService {
  constructor(@inject(TYPES.MySQLClient) private mysqlClient: MySQLClient) {}

  private async checkEmailDuplicate(email: string): Promise<{ status: number; message: string; data?: any }> {
    if (email) {
      const connection = await this.mysqlClient.getConnection();
      const [rows] = await connection.query('SELECT id, email FROM user WHERE email = ?', email);
      const response = this.mysqlClient.processRows(rows);
      if (response.length) {
        connection.release();
        throw new ConflictError('Email already exists');
      }
      connection.release();
      return { status: 404, message: 'Email not found' };
    }
    throw new LogicError('Invalid email');
  }

  // CRUD
  public async getOne(userID: number): Promise<{ status: number; message: string; data?: any }> {
    if (isNaN(userID)) {
      throw new LogicError('Invalid userID (not a number)');
    }

    const connection = await this.mysqlClient.getConnection();
    const [rows] = await connection.query('SELECT * FROM user WHERE id = ?', userID);
    connection.release();

    const users = this.mysqlClient.processRows(rows);
    if (users?.length) {
      const { password, ...data } = users[0];
      return {
        status: 200,
        message: 'User found',
        data: data,
      };
    }
    throw new NotFoundError('User not found');
  }

  public async getAll(): Promise<{
    status: number;
    data: any[];
    message: string;
  }> {
    const connection = await this.mysqlClient.getConnection();
    const [rows] = await connection.query('SELECT * from user');
    connection.release();
    const users = this.mysqlClient.processRows(rows);
    if (users.length) {
      return {
        status: 200,
        data: users,
        message: 'Users list successfully fetched',
      };
    }
    return { status: 200, data: [], message: 'No data' };
  }

  public async create(payload: any): Promise<{ status: number; message: string; data?: any }> {
    const { email } = payload;
    await this.checkEmailDuplicate(email);

    const connection = await this.mysqlClient.getConnection();
    const createResult: any = await connection.query('INSERT INTO user SET ?', payload);
    connection.release();
    const result = await this.getOne(createResult[0].insertId);

    return {
      status: 201,
      message: 'User successfully created',
      data: result.data,
    };
  }

  public async update(userID: number, payload: any): Promise<{ status: number; message: string }> {
    await this.getOne(userID);

    if (payload.password) {
      const hashPwd = await hash(payload.password, 10);
      payload.password = hashPwd;
    }
    const connection = await this.mysqlClient.getConnection();
    await connection.query('UPDATE user SET ? WHERE id = ?', [payload, userID]);
    connection.release();

    return { status: 201, message: 'User successfully updated' };
  }

  public async delete(userID: number): Promise<{ status: number; message: string }> {
    await this.getOne(userID);

    const connection = await this.mysqlClient.getConnection();
    await connection.query('DELETE FROM user WHERE id = ?', userID);
    connection.release();

    return { status: 200, message: 'Account unregistered' };
  }

  // LOGIC
  public async authenticate(payload: AuthPayload): Promise<{ status: number; message?: string; token?: string }> {
    const connection = await this.mysqlClient.getConnection();
    const { email, password } = payload;
    const [rows] = await connection.query('SELECT id, email, password, role FROM user WHERE email = ?', email);

    connection.release();
    const users: any[] = this.mysqlClient.processRows(rows);

    if (users?.length) {
      const user = users[0];
      const match = await compare(password, user.password);
      if (match) {
        const tokenPayload = {
          userID: user.id,
          email: user.email,
        };
        const token = jwt.sign(tokenPayload, appConfig.app.secret, {
          expiresIn: appConfig.app.expiresIn,
        });
        return { status: 200, token: token };
      }
    }
    throw new UnauthorizedError('Wrong credentials');
  }

  public async resetPassword(userID: number, password: string): Promise<{ status: number; message: string }> {
    const connection = await this.mysqlClient.getConnection();
    const hashPwd = await hash(password, 10);
    const data = { password: hashPwd };
    await connection.query('UPDATE user SET ? WHERE id= ?', [data, userID]);
    connection.release();
    return { status: 201, message: 'Password successfully reset' };
  }
}
