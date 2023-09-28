import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fjwt, { JWT } from '@fastify/jwt';
import userRoutes from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';
import { productSchemas } from './modules/product/product.schema';
import productRoutes from './modules/product/product.route';

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: number;
      name: string;
      email: string;
    };
  }
}

export default function buildServer() {
  const server = Fastify();

  server.register(fjwt, {
    secret: process.env.JWT_SECRET!,
  });

  server.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  server.get('/wings', async (request: FastifyRequest, reply: FastifyReply) =>
    reply.send({ status: 'OK' })
  );

  server.addHook('preHandler', (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });

  // Register schemas before registering routes
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  // Regiter Routes
  server.register(userRoutes, { prefix: 'api/users' });
  server.register(productRoutes, { prefix: 'api/products' });

  return server;
}
