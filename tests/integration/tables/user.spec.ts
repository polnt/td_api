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
  const validToken = jwt.sign({ userID: 1, email: 'test@test.test' }, 'secret');

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    const mysql = container.get<MySQLClient>(TYPES.MySQLClient);
    await Promise.all([mysql.disconnect()]);
    jest.clearAllMocks();
  });

  // describe('create user', () => {
  test('create user success', async () => {
    const response = await request(app).post(`/api/signup`).send({
      email: 'foo@foo.foo',
      password: 'foo'
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('Account successfully created');
  });
  test('create user conflict', async () => {
    const response = await request(app).post(`/api/signup`).send({
      email: 'test@test.test',
    });
    expect(response.status).toBe(409);
    expect(response.body.message).toEqual('Email already exists');
  });
  // });

  test('authenticate', async () => {
    const response = await request(app).get(`/api/signin`).send({ email: 'foo@foo.foo', password: 'foo' });
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Authentication success');
  });

  test('delete account', async () => {
    const response = await request(app).delete(`/api/delete-account`).send({ email: 'foo@foo.foo', password: 'foo' });
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Account unregistered');
  });

  test('get current user', async () => {
    const response = await request(app).get(`/api/user/current`).set('x-auth-token', validToken);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('User found');
  });

  test('update user', async () => {
    const response = await request(app)
      .put(`/api/user/update/1`)
      .set('x-auth-token', validToken)
      .send({ firstname: 'test' });
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('User successfully updated');
  });
});
