import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Role, UserSession } from '../../types/index.js';

export class AuthService {
  constructor(private readonly secret = process.env.JWT_SECRET ?? 'change-me-too') {}

  signSession(username: string, role: Role, ip?: string): string {
    const now = Date.now();
    const session: UserSession = {
      id: crypto.randomUUID(),
      username,
      role,
      createdAt: now,
      expiresAt: now + 12 * 60 * 60 * 1000,
      ip
    };

    return jwt.sign(session, this.secret, { algorithm: 'HS256' });
  }

  verifySession(token: string): UserSession {
    return jwt.verify(token, this.secret) as UserSession;
  }
}
