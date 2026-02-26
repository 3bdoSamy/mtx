import Redis, { type Redis as RedisClient } from 'ioredis';

export class RedisLayer {
  readonly client: RedisClient;
import Redis from 'ioredis';

export class RedisLayer {
  readonly client: Redis;

  constructor(url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379') {
    this.client = new Redis(url, { maxRetriesPerRequest: 1, enableReadyCheck: true });
  }

  async health(): Promise<boolean> {
    return (await this.client.ping()) === 'PONG';
  }
}
