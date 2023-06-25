/* eslint-disable max-len */

import 'reflect-metadata';
import { createApp } from 'tests/helpers';
import container from 'app/inversion-of-control/container';
import { MySQLClient } from 'app/backend/mysql';
import TYPES from 'app/inversion-of-control/types';
import request from 'supertest';
import jwt from 'jsonwebtoken';

describe('todo integration tests', () => {
  let app: any;
  const validToken = jwt.sign({ todoID: 1, email: 'test@test.test' }, 'secret');

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    await Promise.all([mysql.disconnect()]);
    jest.clearAllMocks();
  });

  describe('create todo', () => {
    test('create todo success', async () => {
      const response = await request(app).post(`/api/todo/create`).set('x-auth-token', validToken).send({
        label: 'test',
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual('todo successfully created');
    });
    test('create todo conflict', async () => {
      const response = await request(app).post(`/api/todo/create`).set('x-auth-token', validToken).send({
        email: 'test@test.test',
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toEqual('Email already exists');
    });
  });

  test('get one todo', async () => {
    const response = await request(app).get(`/api/todo/1`).set('x-auth-token', validToken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('todo found');
  });

  test('get all todos', async () => {
    const response = await request(app).get(`/api/todo`).set('x-auth-token', validToken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('todo list successfully fetched');
  });

  test('update todo', async () => {
    const response = await request(app)
      .put(`/api/todo/update/1`)
      .set('x-auth-token', validToken)
      .send({ firstname: 'test' });
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('todo successfully updated');
  });
  test('delete todo', async () => {
    const response = await request(app).delete(`/api/todo/delete/2`).set('x-auth-token', validToken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Account unregistered');
  });
});
