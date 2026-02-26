import type { FastifyInstance } from 'fastify';
import { RollingConfigEngine } from '../core/rolling-config-engine/rolling-config-engine.js';
import { MediaMtxApiClient } from '../core/mediamtx-api-client/client.js';
import { TokenEngine } from '../core/token-engine/token-engine.js';
import { MetricsEngine } from '../core/metrics-engine/metrics-engine.js';
import { SessionManager } from '../core/session-manager/session-manager.js';

export async function registerApiRoutes(app: FastifyInstance): Promise<void> {
  const rollingConfig = new RollingConfigEngine();
  const mtx = new MediaMtxApiClient();
  const tokenEngine = new TokenEngine();
  const metrics = new MetricsEngine();
  const sessions = new SessionManager();

  app.get('/api/health', async () => ({ ok: true, ts: Date.now() }));
  app.get('/api/streams', async () => mtx.listPaths());
  app.post('/api/config/apply', async (request) => {
    const body = request.body as { yaml: string; reason: string; author: string };
    return rollingConfig.applyConfig(body.yaml, body.author, body.reason);
  });

  app.post('/api/tokens/issue', async (request) => {
    const body = request.body as Parameters<typeof tokenEngine.issue>[0];
    return { token: await tokenEngine.issue(body) };
  });

  app.post('/api/tokens/revoke/:id', async (request) => {
    const params = request.params as { id: string };
    await tokenEngine.revoke(params.id);
    return { revoked: true };
  });

  app.get('/api/sessions', async () => sessions.listActive());
  app.get('/metrics', async (_, reply) => {
    reply.header('content-type', 'text/plain; version=0.0.4');
    return metrics.asPrometheus();
  });
}
