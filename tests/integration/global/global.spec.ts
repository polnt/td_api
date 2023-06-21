/* eslint-disable max-len */

import 'reflect-metadata';
import request from 'supertest';
import { createApp } from 'tests/helpers';
import { MySQLClient } from 'app/backend/mysql';
import container from 'app/inversion-of-control/container';
import TYPES from 'app/inversion-of-control/types';

// let token = '';
// let pictureID = '';

describe('global integration tests', () => {
  describe('init app', () => {
    let app: any;
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);

    beforeAll(async () => {
      app = await createApp();
    });

    afterAll(async () => {
      await Promise.all([mysql.disconnect()]);
      jest.clearAllMocks();
    });

    test('Backend storage behavior', async () => {
      try {
        const dummyMySQL = new MySQLClient();
        await dummyMySQL.getConnection();
      } catch (err: any) {
        expect(err.message).toEqual('MySQLClient not connected, call "connect(): Promise<void>" before');
      }

      expect(async () => await mysql.connect()).not.toThrow();
    });

    describe('Welcome and jwt', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp2aW5jZW50IiwidXNlcklEIjoiNDA2NDUxMW1qczgybWprNCIsImlhdCI6MTU1MDM1NzE2OSwiZXhwIjoxNTUwNDQzNTY5fQ.CV7oQagJKtsBdO15PPt1sTmIe8cQ6_ewAVqQE0w-jn0';
      // const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjIsImVtYWlsIjoidGVzdEB0ZXN0LnRlc3QiLCJpYXQiOjE2ODczNDcyMjV9.x8PFxK1yC-bAa_W5CuqhSqtxgyOLYPUnzDdULaYNh8Q';
      test('500 Error', async () => {});
      test('404 Not found', async () => {
        const response = await request(app).get(`/ap`);
        expect(response.status).toBe(404);
      });
      test('200 Welcome', async () => {
        const response = await request(app).get(`/api`);
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Welcome');
      });
      test('401 No token provided', async () => {
        const response = await request(app).get(`/api/users`);
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('No token provided');
      });
      test('401 invalid token', async () => {
        const response = await request(app).get('/api/users').set('x-auth-token', invalidToken);
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('Invalid token');
      });
      // test('401 forbidden (forged token)', async () => {
      //   const response = await request(app).get('/api/users').set('x-auth-token', forgedToken);
      //   expect(response.status).toBe(403);
      //   expect(response.body.message).toEqual('Forbidden');
      // });
    });
  });
});
