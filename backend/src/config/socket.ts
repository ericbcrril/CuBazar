import type { Server } from 'socket.io';

let socketServer: Server | undefined;

export function setSocketServer(server: Server): void {
  socketServer = server;
}

export function getSocketServer(): Server | undefined {
  return socketServer;
}
