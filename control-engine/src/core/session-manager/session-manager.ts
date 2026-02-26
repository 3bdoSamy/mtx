import { RedisLayer } from '../redis-layer/client.js';
import type { UserSession } from '../../types/index.js';

export class SessionManager {
  constructor(private readonly redis = new RedisLayer()) {}

  async save(session: UserSession): Promise<void> {
    const ttl = Math.floor((session.expiresAt - Date.now()) / 1000);
    await this.redis.client.set(`session:${session.id}`, JSON.stringify(session), 'EX', ttl);
  }

  async listActive(): Promise<UserSession[]> {
    const keys = await this.redis.client.keys('session:*');
    if (!keys.length) return [];
    const values = await this.redis.client.mget(keys);
    return values
      .filter((value): value is string => value !== null)
      .map((value) => JSON.parse(value) as UserSession);
  }
}
