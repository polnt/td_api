/* eslint-disable max-len */

import 'reflect-metadata';
import request from 'supertest';
import { createApp } from 'tests/helpers';
import { MySQLClient } from 'app/backend/mysql';
import container from 'app/inversion-of-control/container';
import TYPES from 'app/inversion-of-control/types';
import jwt from 'jsonwebtoken';

describe('integration tests', () => {
  jest.setTimeout(30000);
  let app: any;
  let validToken: string;
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

    test('404 Not found', async () => {
      const { status } = await request(app).get('/ap');
      expect(status).toBe(404);
    });
    test('200 Welcome', async () => {
      const { status, body } = await request(app).get('/api');
      expect(status).toBe(200);
      expect(body.message).toEqual('Welcome');
    });
    test('401 No token provided', async () => {
      const { status, body } = await request(app).get('/api/user');
      expect(status).toBe(401);
      expect(body.message).toEqual('No token provided');
    });
    test('401 invalid token', async () => {
      const { status, body } = await request(app).get('/api/user').set('x-auth-token', invalidToken);
      expect(status).toBe(401);
      expect(body.message).toEqual('Invalid token');
    });
  });

  describe('sign up / sing in / Account management', () => {
    test('sign up success', async () => {
      const { status, body } = await request(app).post(`/api/signup`).send({
        email: 'foo@foo.foo',
        password: 'foo'
      });
      expect(status).toBe(201);
      expect(body.message).toEqual('Account successfully created');
    });

    test('sign up conflict', async () => {
      const { status, body } = await request(app).post(`/api/signup`).send({
        email: 'foo@foo.foo',
        password: 'foo'
      });
      expect(status).toBe(409);
      expect(body.message).toEqual('Email already exists');
    });

    test('sign in', async () => {
      const { status, body } = await request(app).post(`/api/signin`).send({ email: 'foo@foo.foo', password: 'foo' });
      expect(status).toBe(200);
      expect(body.message).toEqual('Authentication success');
      validToken = body.token;
    });

    test('get current user success', async () => {
      const { status, body } = await request(app).get(`/api/user/current`).set('x-auth-token', validToken);
      expect(status).toBe(200);
      expect(body.message).toEqual('User found');
    });

    test('update current user success', async () => {
      const { status, body } = await request(app)
        .put(`/api/user/update/1`)
        .set('x-auth-token', validToken)
        .send({ firstname: 'test' });
      expect(status).toBe(201);
      expect(body.message).toEqual('User successfully updated');
    });
  });

  describe('todo', () => {
    test('create todo success', async () => {
      const { status, body } = await request(app).post(`/api/todo/create`).set('x-auth-token', validToken).send({
        label: 'test',
      });
      expect(status).toBe(201);
      expect(body.message).toEqual('Todo successfully added');
    });

    test('get one todo success', async () => {
      const { status, body } = await request(app).get(`/api/todo/1`).set('x-auth-token', validToken);
      expect(status).toBe(200);
      expect(body.message).toEqual('Todo found');
    });

    test('get all todos success', async () => {
      const { status, body } = await request(app).get(`/api/todo`).set('x-auth-token', validToken);
      expect(status).toBe(200);
      expect(body.message).toEqual('Todo list successfully fetched');
    });

    test('update todo success', async () => {
      const { status, body } = await request(app)
        .put(`/api/todo/update/1`)
        .set('x-auth-token', validToken)
        .send({ label: 'testSuccess' });
      expect(status).toBe(201);
      expect(body.message).toEqual('Todo successfully updated');
    });

    test('delete todo success', async () => {
      const { status, body } = await request(app).delete(`/api/todo/delete/1`).set('x-auth-token', validToken);
      expect(status).toBe(200);
      expect(body.message).toEqual('Todo deleted');
    });
  });

  describe('Security', () => {
    test('Forged token should fail', async () => {
      const forgedToken = jwt.sign({ userID: 2, email: 'foo@foo.foo' }, 'secret');
      const { status, body } = await request(app).get(`/api/current`).set('x-auth-token', forgedToken);
      expect(status).toBe(403);
      expect(body.message).toEqual('Forbidden');
    });
  });

  describe('Account deletion', () => {
    test('Account deletion success', async () => {
      const { status, body } = await request(app).delete(`/api/delete-account`).send({ email: 'foo@foo.foo', password: 'foo' });
      expect(status).toBe(200);
      expect(body.message).toEqual('Account unregistered');
    });
  });
});
