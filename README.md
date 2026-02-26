# MediaMTX Streaming Control Appliance

Production-grade single-node streaming appliance for Ubuntu 22.04 with MediaMTX data plane, TypeScript control engine, Redis-backed token/session state, Prometheus metrics, and enterprise dashboard.

## Components

- **MediaMTX** in `/opt/mtx/mediamtx`
- **Control Engine** (Fastify + WS + Redis + rolling config) in `/opt/mtx/control-engine`
- **Dashboard** (React + Vite + Zustand + WS live updates) in `/opt/mtx/dashboard`
- **NGINX** reverse proxy and rate limiter
- **Systemd** managed services for mediamtx/control/dashboard

## Key platform capabilities

- Rolling YAML config deployment with health-gated rollback.
- Redis token engine (publish/playback, TTL, IP bind, one-time/max-use, revoke + audit stream).
- WebSocket-first telemetry updates (1s push; no dashboard polling).
- JWT auth + role-ready scaffolding.
- Prometheus metrics endpoint for control engine and MediaMTX integration.
- Hardened NGINX, localhost API isolation, and host-level sysctl/limits tuning.

## Install

```bash
sudo ./mtx-install.sh --with-redis --with-prometheus --ssl --noninteractive
```

### Optional flags

- `--with-ffmpeg`
- `--with-redis`
- `--with-prometheus`
- `--ssl`
- `--noninteractive`

## Runtime layout

```text
/opt/mtx
  mediamtx/
  control-engine/
  dashboard/
  config/
  logs/
  recordings/
  backups/
```

## Services

- `/etc/systemd/system/mediamtx.service`
- `/etc/systemd/system/mtx.service`
- `/etc/systemd/system/mtx-dashboard.service`

## Development

```bash
cd control-engine && npm install && npm run dev
cd dashboard && npm install && npm run dev
```
