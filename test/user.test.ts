import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { initTestApp } from './utils.js';
import { EntityData } from '@mikro-orm/core';
import { User } from '../src/modules/user/user.entity.js';
import { initORM } from '../src/db.js';

let app: FastifyInstance;

beforeAll(async () => {
  // we use different ports to allow parallel testing
  app = await initTestApp(30002);
});

afterAll(async () => {
  const db = await initORM();
  try {
    const fork = db.em.fork();
    await fork.removeAndFlush(
      await fork.findOneOrFail(User, { email: 'foo@bar.com' }),
    );
  } catch (e: unknown) {
    console.error(e);
  }
  // we close only the fastify app - it will close the database connection via onClose hook automatically
  await app.close();
});

test('full flow', async () => {
  const res1 = await app.inject({
    method: 'post',
    url: '/user/sign-up',
    payload: {
      fullName: 'Foo Bar',
      email: 'foo@bar.com',
      password: 'password123',
    },
  });

  expect(res1.statusCode).toBe(200);
  expect(res1.json()).toMatchObject({
    fullName: 'Foo Bar',
  });

  const res1dup = await app.inject({
    method: 'post',
    url: '/user/sign-up',
    payload: {
      fullName: 'Foo Bar',
      email: 'foo@bar.com',
      password: 'password123',
    },
  });

  expect(res1dup.statusCode).toBe(409);
  expect(res1dup.json()).toMatchObject({
    message: 'This email is already registered, maybe you want to sign in?',
  });

  const res2 = await app.inject({
    method: 'post',
    url: '/user/sign-in',
    payload: {
      email: 'foo@bar.com',
      password: 'password123',
    },
  });

  expect(res2.statusCode).toBe(200);
  expect(res2.json()).toMatchObject({
    fullName: 'Foo Bar',
  });

  const res3 = await app.inject({
    method: 'post',
    url: '/user/sign-in',
    payload: {
      email: 'foo@bar.com',
      password: 'password456',
    },
  });

  expect(res3.statusCode).toBe(401);
  expect(res3.json()).toMatchObject({
    message: 'Invalid combination of email and password',
  });

  const res4 = await app.inject({
    method: 'get',
    url: '/user/profile',
    headers: {
      Authorization: `Bearer ${res2.json().token}`,
    },
  });
  expect(res4.statusCode).toBe(200);
  expect(res2.json()).toMatchObject(res4.json());
});
