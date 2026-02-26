import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { registerApiRoutes } from './routes/api.js';
import { MetricsEngine } from './core/metrics-engine/metrics-engine.js';
import { WebsocketGateway } from './core/websocket-gateway/gateway.js';

const app = Fastify({ logger: true });
const metrics = new MetricsEngine();

await app.register(cors, { origin: true });
await app.register(sensible);
await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'change-me-too' });
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
await registerApiRoutes(app);

metrics.start();
const server = app.server;
new WebsocketGateway(metrics).bind(server);

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8081);
await app.listen({ host, port });
