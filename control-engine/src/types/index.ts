export type Role = 'admin' | 'operator' | 'viewer';

export interface UserSession {
  id: string;
  username: string;
  role: Role;
  createdAt: number;
  expiresAt: number;
  ip?: string;
}

export interface StreamToken {
  id: string;
  stream: string;
  type: 'publish' | 'playback';
  issuedAt: number;
  expiresAt: number;
  maxUses: number;
  uses: number;
  oneTime: boolean;
  ipBinding?: string;
  revoked?: boolean;
}

export interface ConfigVersion {
  version: string;
  createdAt: string;
  checksum: string;
  author: string;
  reason: string;
  path: string;
}

export interface HealthStatus {
  mediamtxUp: boolean;
  redisUp: boolean;
  apiLatencyMs: number;
  timestamp: number;
}
