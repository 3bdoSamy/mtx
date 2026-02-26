import { useDashboardStore } from '../store/dashboardStore';

export function connectLiveWs(): WebSocket {
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/live`);
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.type === 'metrics') {
      useDashboardStore.getState().setMetrics(msg.data);
    }
  };
  return ws;
}
