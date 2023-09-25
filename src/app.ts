import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fjwt from '@fastify/jwt';
import userRoutes from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';
import { productSchemas } from './modules/product/product.schema';
import productRoutes from './modules/product/product.route';

export const server = Fastify();

declare module 'fastify' {
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

server.get('/', async (request: FastifyRequest, reply: FastifyReply) =>
  reply.send('Hello')
);

// Register schemas before registering routes
for (const schema of [...userSchemas, ...productSchemas]) {
  server.addSchema(schema);
}

// Regiter Routes
server.register(userRoutes, { prefix: 'api/users' });
server.register(productRoutes, { prefix: 'api/products' });

// Start server
server.listen({ port: 3000 }, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server is listening on port ${address}`);
});
