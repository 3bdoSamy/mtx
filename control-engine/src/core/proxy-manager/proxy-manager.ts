export interface ProxyPolicy {
  route: string;
  upstream: string;
  rateLimit: string;
  tls: boolean;
}

export class ProxyManager {
  getPolicies(): ProxyPolicy[] {
    return [
      { route: '/dashboard', upstream: 'http://127.0.0.1:5173', rateLimit: '50r/s', tls: true },
      { route: '/api', upstream: 'http://127.0.0.1:8081', rateLimit: '100r/s', tls: true }
    ];
  }
}
