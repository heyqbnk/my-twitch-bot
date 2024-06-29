import express from 'express';
import { createServer, type Server } from 'node:http';

export function createHttpServer(): Server {
  const app = express();
  return createServer(app);
}