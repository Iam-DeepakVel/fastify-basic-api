import { FastifyRequest, FastifyReply } from 'fastify';
import { createUser, findUserByEmail, findUsers } from './user.service';
import { CreateUserInput, LoginInput } from './user.schema';
import { verifyPassword } from '../../utils/hash';

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;
  try {
    const user = await createUser(body);
    return reply.code(201).send(user);
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  // Find a user by email
  const user = await findUserByEmail(body.email);

  if (!user) {
    return reply.code(401).send({
      message: 'Invalid email or password',
    });
  }

  // Verify Password
  if (
    !verifyPassword({
      candidatePassword: body.password,
      salt: user.salt,
      hash: user.password,
    })
  ) {
    return reply.code(401).send({
      message: 'Invalid email or password',
    });
  }

  // Generate access token by passing id, email, name as payload
  const { password, salt, ...rest } = user;

  return { accessToken: request.jwt.sign(rest) };
}

export async function getUsersHandler() {
  return await findUsers();
}
