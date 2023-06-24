/* eslint-disable max-len */

import 'reflect-metadata';
import { createApp } from 'tests/helpers';
import container from 'app/inversion-of-control/container';
import { MySQLClient } from 'app/backend/mysql';
import TYPES from 'app/inversion-of-control/types';
import request from 'supertest';
import jwt from 'jsonwebtoken';

describe('user integration tests', () => {
  let app: any;
  const token = jwt.sign({ userID: 1, email: 'test@test.test' }, 'secret');

  beforeAll(async () => {
    app = await createApp();
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    const connection = await mysql.getConnection();
    await connection.query('INSERT INTO user (email) VALUES ("test@test.test");');
    await connection.query('INSERT INTO user (email) VALUES ("foo@foo.foo");');
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
  });

  describe('create user', () => {
    test('create user success', async () => {
      const response = await request(app).post(`/api/users/create`).set('x-auth-token', token).send({
        email: 'bar@bar.bar',
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual('User successfully created');
    });
    test('create user conflict', async () => {
      const response = await request(app).post(`/api/users/create`).set('x-auth-token', token).send({
        email: 'test@test.test',
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toEqual('Email already exists');
    });
  });
  test('update user', async () => {
    const response = await request(app)
      .put(`/api/users/update/1`)
      .set('x-auth-token', token)
      .send({ firstname: 'test' });
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('User successfully updated');
  });
  test('delete user', async () => {
    const response = await request(app).delete(`/api/users/delete/2`).set('x-auth-token', token);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Account unregistered');
  });
});
