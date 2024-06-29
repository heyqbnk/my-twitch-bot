import { Server } from 'socket.io';
import { Server as HttpServer } from 'node:http';

/**
 * Creates a new WebSocket server.
 * @param server - http server.
 */
export function createIo(server: HttpServer): Server {
  return new Server(server, {
    cors: {
      // Allow all origins.
      origin() {
        return true;
      },
    },
  });
}