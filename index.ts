import fastify from 'fastify'

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  'h-Custom': string;
}

const server = fastify({ logger: true })

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.get<{
  Querystring: IQuerystring,
  Headers: IHeaders
}>('/auth', {
  preValidation: (request, reply, done) => {
    const { username, password } = request.query
    done(username !== 'admin' ? new Error('Must be admin') : undefined) // NOTE: only validate `admin` account
  },
}, async (request, reply) => {
  const customHeader = request.headers['h-Custom']

  return 'logged in!'
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
