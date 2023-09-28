import buildServer from './server';

export const server = buildServer();

// Start server
server.listen({ port: 3000 }, function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server is listening on port ${address}`);
});
