import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';

const ConfigSchema = z.object({
  api: z.object({
    enabled: z.boolean(),
    address: z.string()
  }).optional(),
  metrics: z.boolean().optional()
}).passthrough();

export class ConfigEngine {
  constructor(private readonly configPath = '/opt/mtx/config/mediamtx.yml') {}

  async readRaw(): Promise<string> {
    return fs.readFile(this.configPath, 'utf8');
  }

  parse(raw: string): Record<string, unknown> {
    const parsed = YAML.parse(raw) as Record<string, unknown>;
    ConfigSchema.parse(parsed);
    return parsed;
  }

  async atomicWrite(raw: string): Promise<void> {
    const tmp = `${this.configPath}.tmp`;
    await fs.writeFile(tmp, raw, { mode: 0o640 });
    await fs.rename(tmp, this.configPath);
  }

  checksum(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  async ensureDir(): Promise<void> {
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
  }
}
