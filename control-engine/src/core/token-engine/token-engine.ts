import jwt from 'jsonwebtoken';
import { RedisLayer } from '../redis-layer/client.js';
import type { StreamToken } from '../../types/index.js';

export class TokenEngine {
  constructor(
    private readonly redis = new RedisLayer(),
    private readonly secret = process.env.TOKEN_SIGNING_SECRET ?? 'change-me'
  ) {}

  async issue(token: Omit<StreamToken, 'uses' | 'revoked'>): Promise<string> {
    const payload = { ...token, uses: 0 };
    const signed = jwt.sign(payload, this.secret, { algorithm: 'HS256' });
    await this.redis.client.set(`token:${token.id}`, JSON.stringify(payload), 'EX', Math.floor((token.expiresAt - Date.now()) / 1000));
    return signed;
  }

  async validate(signed: string, ip?: string): Promise<boolean> {
    const decoded = jwt.verify(signed, this.secret) as StreamToken;
    const stored = await this.redis.client.get(`token:${decoded.id}`);
    if (!stored) return false;
    const token = JSON.parse(stored) as StreamToken;
    if (token.revoked || token.expiresAt < Date.now()) return false;
    if (token.ipBinding && token.ipBinding !== ip) return false;
    if (token.oneTime && token.uses > 0) return false;
    if (token.uses >= token.maxUses) return false;
    token.uses += 1;
    await this.redis.client.multi()
      .set(`token:${decoded.id}`, JSON.stringify(token))
      .xadd('audit:token_usage', '*', 'tokenId', token.id, 'stream', token.stream, 'ts', `${Date.now()}`)
      .exec();
    return true;
  }

  async revoke(tokenId: string): Promise<void> {
    const data = await this.redis.client.get(`token:${tokenId}`);
    if (!data) return;
    const token = JSON.parse(data) as StreamToken;
    token.revoked = true;
    await this.redis.client.set(`token:${tokenId}`, JSON.stringify(token));
  }
}
