import os from 'node:os';
import { Gauge, Registry } from 'prom-client';
import { RedisLayer } from '../redis-layer/client.js';

export class MetricsEngine {
  private readonly registry = new Registry();
  private readonly cpuGauge = new Gauge({ name: 'mtx_node_cpu_load', help: 'CPU load', registers: [this.registry] });
  private readonly memGauge = new Gauge({ name: 'mtx_node_mem_used_bytes', help: 'Memory used', registers: [this.registry] });

  constructor(private readonly redis = new RedisLayer()) {}

  start(intervalMs = 1000): void {
    setInterval(async () => {
      this.cpuGauge.set(os.loadavg()[0]);
      this.memGauge.set(process.memoryUsage().rss);
      await this.redis.client.set('metrics:summary', JSON.stringify({ cpuLoad: os.loadavg()[0], mem: process.memoryUsage().rss, ts: Date.now() }), 'EX', 5);
    }, intervalMs);
  }

  async getSummary(): Promise<Record<string, unknown>> {
    const data = await this.redis.client.get('metrics:summary');
    return data ? JSON.parse(data) : {};
  }

  async asPrometheus(): Promise<string> {
    return this.registry.metrics();
  }
}
