import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MySQLClient } from 'app/backend/mysql';
import { appConfig } from 'app/config';

export const authMiddleware = (mysqlClient: MySQLClient) =>
  async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const token: any = request.headers['x-auth-token'] || request.headers.authorization || request.query.token;
    if (!token) {
      response.status(401).json({ status: 401, message: 'No token provided' });
      return;
    }

    try {
      const decoded = jwt.verify(token, appConfig.app.secret);
      const { userID, email } = decoded as jwt.JwtPayload;
      request.user = { userID, email };
    } catch (error) {
      response.status(401).json({ status: 401, message: 'Invalid token' });
      return;
    }

    try {
      const connection = await mysqlClient.getConnection();

      const [rows] = await connection.query('SELECT id, email FROM user WHERE id = ? AND email = ?', [
        request.user.userID,
        request.user.email,
      ]);
      connection.release();
      const user = mysqlClient.processRows(rows);

      if (!user.length) {
        response.status(403).json({ status: 403, message: 'Forbidden' });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
