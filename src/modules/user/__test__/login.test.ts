import { faker } from '@faker-js/faker';
import { test } from 'tap';
import buildServer from '../../../server';
import prisma from '../../../utils/prisma';
import { UserType } from '@fastify/jwt';

test("POST 'api/users/login'", async (t) => {
  test('given the email and password are correct', async (t) => {
    const name = faker.person.firstName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const fastify = buildServer();

    t.teardown(async () => {
      fastify.close();
      await prisma.user.deleteMany({});
    });

    // Registers the user
    await fastify.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        email,
        password,
        name,
      },
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: {
        email,
        password,
      },
    });

    t.equal(response.statusCode, 200);

    const data = response.json();

    const verified = fastify.jwt.verify<UserType & { iat: number }>(
      data.accessToken
    );

    t.equal(verified.email, email);
    t.equal(verified.name, name);
    t.type(verified.id, 'number');
    t.type(verified.iat, 'number');
  });

  test('given the email and password are not correct', async (t) => {
    const name = faker.person.firstName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const fastify = buildServer();

    t.teardown(async () => {
      fastify.close();
      await prisma.user.deleteMany({});
    });

    // Registers the user
    await fastify.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        email,
        password,
        name,
      },
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: {
        email: 'asdfoahseioboawg@gmail.com',
        password: 'sdfasfsfsdaf',
      },
    });

    t.equal(response.statusCode, 401);

    const data = response.json();

    t.equal(data.message, "Invalid email or password");
  });
});
