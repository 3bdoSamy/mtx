import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ConfigEngine } from '../config-engine/config-engine.js';
import { MediaMtxApiClient } from '../mediamtx-api-client/client.js';
import { log } from '../../utils/logger.js';

export class RollingConfigEngine {
  constructor(
    private readonly config = new ConfigEngine(),
    private readonly mtx = new MediaMtxApiClient(),
    private readonly versionsDir = '/opt/mtx/config/versions'
  ) {}

  async applyConfig(newRaw: string, author: string, reason: string): Promise<{ version: string; rolledBack: boolean }> {
    await this.config.ensureDir();
    await fs.mkdir(this.versionsDir, { recursive: true });
    this.config.parse(newRaw);

    const current = await this.config.readRaw().catch(() => '');
    const version = `${Date.now()}`;
    const backupPath = path.join(this.versionsDir, `${version}.yml`);
    await fs.writeFile(backupPath, current, 'utf8');

    await this.config.atomicWrite(newRaw);
    await this.mtx.reloadConfig();

    const healthy = await this.healthWindow(5000);
    if (!healthy) {
      await this.config.atomicWrite(current);
      await this.mtx.reloadConfig();
      log.error('config rollback', { author, reason, version });
      return { version, rolledBack: true };
    }

    log.info('config applied', { author, reason, version });
    return { version, rolledBack: false };
  }

  private async healthWindow(windowMs: number): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < windowMs) {
      try {
        await this.mtx.health();
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        return false;
      }
    }
    return true;
  }
}
