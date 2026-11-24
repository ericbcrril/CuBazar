import { createServer } from 'node:http';
import { app } from './app';
import { env } from './config/env';
import { connectToDatabase, disconnectFromDatabase } from './config/database';
import { initSocketServer } from './modules/chats/chats.gateway';

export async function startServer(): Promise<void> {
  await connectToDatabase();
  const httpServer = createServer(app);
  const io = initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.info(`CU-bazar API disponible en el puerto ${env.PORT}`);
  });

  const shutdown = () => {
    io.close(() => {
      void disconnectFromDatabase().then(() => process.exit(0));
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

void startServer().catch(async (error: unknown) => {
  console.error('No se pudo iniciar CU-bazar:', error);
  await disconnectFromDatabase();
  process.exitCode = 1;
});
