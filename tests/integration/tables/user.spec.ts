/* eslint-disable max-len */

import 'reflect-metadata';
import { createApp } from 'tests/helpers';
import container from 'app/inversion-of-control/container';
import { MySQLClient } from 'app/backend/mysql';
import TYPES from 'app/inversion-of-control/types';
import request from 'supertest';

describe('user integration tests', () => {
  let app: any;
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LnRlc3QiLCJpYXQiOjE2ODczNTkwMzh9.PkAZm5ria4klbwMp4wxO9IzP3tpeHGsAidUYCGf3jQA';

  beforeAll(async () => {
    app = await createApp();
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    const connection = await mysql.getConnection();
    await connection.query('INSERT INTO user (email) VALUES ("test@test.test");');
    connection.release();
  });

  afterAll(async () => {
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    await Promise.all([mysql.disconnect()]);
    jest.clearAllMocks();
  });

  test('get all users', async () => {
    const response = await request(app).get(`/api/users`).set('x-auth-token', token);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Users list successfully fetched');
  });
  test('get one user', async () => {
    const response = await request(app).get(`/api/users/1`).set('x-auth-token', token);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('User found');
    expect(response.body.data.id).toEqual(1);
  });
  // test('create user', async () => {
  //   const response = await request(app).get(`/api/users`).set('x-auth-token', token);
  //   expect(response.status).toBe(200);
  //   expect(response.body.message).toEqual('Users list successfully fetched');
  // });
});
