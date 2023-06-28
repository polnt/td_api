import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';

import { appConfig } from 'app/config';
import { ConflictError, LogicError, NotFoundError, UnauthorizedError } from 'app/utils';
import { AuthPayload, User } from './model';
import { MySQLClient } from 'app/backend/mysql';
import TYPES from 'app/inversion-of-control/types';

@injectable()
export class UserService {
  constructor(@inject(TYPES.MySQLClient) private mysqlClient: MySQLClient) { }

  private async checkEmailDuplicate(email: string): Promise<{ status: number; message: string; }> {
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

  public async authenticate(payload: AuthPayload): Promise<{ status: number; message?: string; token?: string; }> {
    const connection = await this.mysqlClient.getConnection();
    const { email, password } = payload;
    const [rows] = await connection.query('SELECT id, email, password FROM user WHERE email = ?', email);

    connection.release();
    const users: any[] = this.mysqlClient.processRows(rows);

    if (users?.length) {
      const user = users[0];
      const match = await compare(password, user.password);
      if (match) {
        const tokenPayload: { userID: number, email: string; } = {
          userID: user.id,
          email: user.email,
        };
        const token = jwt.sign(tokenPayload, appConfig.app.secret, {
          expiresIn: appConfig.app.expiresIn,
        });
        return { status: 200, message: 'Authentication success', token: token };
      }
    }
    throw new UnauthorizedError('Wrong credentials');
  }

  public async getOne(userID: number): Promise<{ status: number; message: string; data?: User; }> {
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

  public async create(payload: AuthPayload): Promise<{ status: number; message: string; data?: User; }> {
    const { email, password } = payload;
    await this.checkEmailDuplicate(email);
    if (password) {
      const hashPwd = await hash(payload.password, 10);
      payload.password = hashPwd;
    }

    const connection = await this.mysqlClient.getConnection();
    const createResult: any = await connection.query('INSERT INTO user SET ?', payload);
    connection.release();
    const { data } = await this.getOne(createResult[0].insertId);

    return {
      status: 201,
      message: 'Account successfully created',
      data: data,
    };
  }

  public async delete(payload: AuthPayload): Promise<{ status: number; message: string; }> {
    const { email } = payload;
    await this.authenticate(payload);

    const connection = await this.mysqlClient.getConnection();
    await connection.query('DELETE FROM user WHERE email = ?', email);
    connection.release();

    return { status: 200, message: 'Account unregistered' };
  }

  public async update(userID: number, payload: User): Promise<{ status: number; message: string; }> {
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
}
