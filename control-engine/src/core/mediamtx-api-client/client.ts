export class MediaMtxApiClient {
  constructor(private readonly baseUrl = process.env.MEDIAMTX_API_URL ?? 'http://127.0.0.1:9997') {}

  async listPaths(): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/v3/paths/list`);
    if (!res.ok) throw new Error(`MediaMTX API error ${res.status}`);
    return res.json();
  }

  async reloadConfig(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/v3/config/reload`, { method: 'POST' });
    if (!res.ok) throw new Error(`Reload failed ${res.status}`);
  }

  async health(): Promise<number> {
    const t0 = performance.now();
    await this.listPaths();
    return performance.now() - t0;
  }
}
