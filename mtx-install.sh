#!/usr/bin/env bash
set -euo pipefail

WITH_FFMPEG=0
WITH_REDIS=0
WITH_PROMETHEUS=0
WITH_SSL=0
NONINTERACTIVE=0

for arg in "$@"; do
  case "$arg" in
    --with-ffmpeg) WITH_FFMPEG=1 ;;
    --with-redis) WITH_REDIS=1 ;;
    --with-prometheus) WITH_PROMETHEUS=1 ;;
    --ssl) WITH_SSL=1 ;;
    --noninteractive) NONINTERACTIVE=1 ;;
    *) echo "Unknown option: $arg"; exit 1 ;;
  esac
done

if [[ ${EUID} -ne 0 ]]; then
  echo "Run as root"; exit 1
fi

BASE=/opt/mtx
apt-get update
apt-get install -y curl ca-certificates gnupg lsb-release build-essential nginx ufw git jq

if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y nodejs
fi

if [[ $WITH_REDIS -eq 1 ]]; then
  apt-get install -y redis-server
  sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
  sed -i 's/^protected-mode .*/protected-mode yes/' /etc/redis/redis.conf
  systemctl enable --now redis-server
fi

if [[ $WITH_PROMETHEUS -eq 1 ]]; then
  apt-get install -y prometheus
  systemctl enable --now prometheus
fi

if [[ $WITH_FFMPEG -eq 1 ]]; then
  apt-get install -y ffmpeg
fi

install -d -m 0750 "$BASE" "$BASE"/{mediamtx,control-engine,dashboard,config,logs,recordings,backups} "$BASE/config/versions"

if [[ ! -f "$BASE/mediamtx/mediamtx" ]]; then
  curl -L https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_v1.8.4_linux_amd64.tar.gz -o /tmp/mediamtx.tgz
  tar -xzf /tmp/mediamtx.tgz -C "$BASE/mediamtx"
fi

rsync -a --delete ./control-engine/ "$BASE/control-engine/"
rsync -a --delete ./dashboard/ "$BASE/dashboard/"
rsync -a ./config/mediamtx.yml "$BASE/config/mediamtx.yml"

pushd "$BASE/control-engine" >/dev/null
npm install --omit=dev
npm run build
popd >/dev/null

pushd "$BASE/dashboard" >/dev/null
npm install
npm run build
popd >/dev/null

install -m 0644 ./deploy/nginx/mtx.conf /etc/nginx/sites-available/mtx.conf
ln -sf /etc/nginx/sites-available/mtx.conf /etc/nginx/sites-enabled/mtx.conf
rm -f /etc/nginx/sites-enabled/default

if [[ $WITH_SSL -eq 1 ]]; then
  apt-get install -y certbot python3-certbot-nginx
fi

install -m 0644 ./deploy/systemd/mediamtx.service /etc/systemd/system/mediamtx.service
install -m 0644 ./deploy/systemd/mtx.service /etc/systemd/system/mtx.service
install -m 0644 ./deploy/systemd/mtx-dashboard.service /etc/systemd/system/mtx-dashboard.service

cat >/etc/sysctl.d/99-mtx.conf <<SYSCTL
net.core.somaxconn=65535
net.core.rmem_max=268435456
net.core.wmem_max=268435456
net.ipv4.tcp_max_syn_backlog=8192
net.ipv4.ip_local_port_range=10240 65535
SYSCTL
sysctl --system >/dev/null

cat >/etc/security/limits.d/99-mtx.conf <<LIMITS
www-data soft nofile 1048576
www-data hard nofile 1048576
LIMITS

ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 1935/tcp || true
ufw allow 8554/tcp || true
ufw allow 8888/tcp || true
ufw --force enable || true

systemctl daemon-reload
systemctl enable --now mediamtx mtx mtx-dashboard nginx
nginx -t && systemctl reload nginx

echo "==== MediaMTX Appliance Installed ===="
echo "Dashboard: http://$(hostname -I | awk '{print $1}')/"
echo "API: http://127.0.0.1:8081/api/health"
echo "MediaMTX API: http://127.0.0.1:9997"
echo "MediaMTX Metrics: http://127.0.0.1:9998/metrics"
echo "Flags => redis:$WITH_REDIS prometheus:$WITH_PROMETHEUS ffmpeg:$WITH_FFMPEG ssl:$WITH_SSL noninteractive:$NONINTERACTIVE"
