import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  'h-Custom': string;
}

const prisma = new PrismaClient();
const server = fastify({ logger: true });

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

server.get('/todos', async (request, reply) => {
  const todos = await prisma.todo.findMany();

  return { todos };
});

server.post<{ Body: { content: string } }>('/todos', async (request, reply) => {
  const { content } = request.body;

  const todo = await prisma.todo.create({
    data: { content },
  });

  return { todo };
});

server.get<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
  const { id } = request.params;

  const todo = await prisma.todo.findUniqueOrThrow({
    where: { id: Number(id) },
  });

  return { todo };
});

server.put<{ Body: { content: string }; Params: { id: string } }>(
  '/todos/:id',
  async (request, reply) => {
    const { content } = request.body;
    const { id } = request.params;

    const todo = await prisma.todo.update({
      where: { id: Number(id) },
      data: { content },
    });

    return { todo };
  }
);

server.delete<{ Params: { id: string } }>(
  '/todos/:id',
  async (request, reply) => {
    const { id } = request.params;

    console.log('delete:id', id);

    await prisma.todo.delete({
      where: { id: Number(id) },
    });

    return reply;
  }
);

server.get<{
  Querystring: IQuerystring;
  Headers: IHeaders;
}>(
  '/auth',
  {
    preValidation: (request, reply, done) => {
      const { username, password } = request.query;
      done(username !== 'admin' ? new Error('Must be admin') : undefined); // NOTE: only validate `admin` account
    },
  },
  async (request, reply) => {
    const customHeader = request.headers['h-Custom'];

    return 'logged in!';
  }
);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
