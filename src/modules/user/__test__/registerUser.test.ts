import { faker } from '@faker-js/faker';
import { test } from 'tap';
import buildServer from '../../../server';
import { ImportMock } from 'ts-mock-imports';
import * as userService from '../user.service';
import prisma from '../../../utils/prisma';

test('POST `/api/users` - create user successfully with mock createUser', async (t) => {
  const name = faker.person.firstName();
  const email = faker.internet.email();
  const password = faker.internet.password();
  // Give random number b/w 0 to 1000
  const id = Math.floor(Math.random() * 1_000);

  const fastify = buildServer();

  const stub = ImportMock.mockFunction(userService, 'createUser', {
    name,
    email,
    id,
  });

  t.teardown(() => {
    fastify.close();
    stub.restore();
  });

  const response = await fastify.inject({
    method: 'POST',
    url: '/api/users',
    payload: {
      email,
      password,
      name,
    },
  });

  t.equal(response.statusCode, 201);
  t.equal(response.headers['content-type'], 'application/json; charset=utf-8');

  const data = response.json();
  t.equal(data.name, name);
  t.equal(data.email, email);
  t.equal(data.id, id);
});

test('POST `/api/users` - create user successfully with test database', async (t) => {
  const name = faker.person.firstName();
  const email = faker.internet.email();
  const password = faker.internet.password();

  const fastify = buildServer();

  t.teardown(async () => {
    fastify.close();
    // Deleting all users in test database before adding a user
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
  });

  const response = await fastify.inject({
    method: 'POST',
    url: '/api/users',
    payload: {
      email,
      password,
      name,
    },
  });

  t.equal(response.statusCode, 201);
  t.equal(response.headers['content-type'], 'application/json; charset=utf-8');

  const data = response.json();
  t.equal(data.name, name);
  t.equal(data.email, email);
  t.type(data.id, 'number');
});

test('POST `/api/users` - fail to create a user', async (t) => {
  const name = faker.person.firstName();
  const password = faker.internet.password();

  const fastify = buildServer();

  t.teardown(async () => {
    fastify.close();
  });

  const response = await fastify.inject({
    method: 'POST',
    url: '/api/users',
    payload: {
      password,
      name,
    },
  });

  t.equal(response.statusCode, 400);
  const data = response.json();
  t.equal(data.message, "body must have required property 'email'");
});
