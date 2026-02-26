import type { Server } from 'node:http';
import { WebSocketServer } from 'ws';
import { MetricsEngine } from '../metrics-engine/metrics-engine.js';

export class WebsocketGateway {
  private wss?: WebSocketServer;

  constructor(private readonly metrics: MetricsEngine) {}

  bind(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws/live' });
    this.wss.on('connection', (socket) => {
      socket.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
    });

    setInterval(async () => {
      const summary = await this.metrics.getSummary();
      const payload = JSON.stringify({ type: 'metrics', data: summary });
      this.wss?.clients.forEach((client) => {
        if (client.readyState === client.OPEN) client.send(payload);
      });
    }, 1000);
  }
}
