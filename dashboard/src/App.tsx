import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { PageFactory } from './pages/PageFactory';
import { connectLiveWs } from './services/ws';

const pages = ['overview', 'streams', 'protocols', 'tokens', 'recording', 'metrics', 'logs', 'config', 'security', 'system'];

export function App() {
  useEffect(() => {
    const ws = connectLiveWs();
    return () => ws.close();
  }, []);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        {pages.map((p) => (
          <Route key={p} path={`/${p}`} element={<PageFactory title={p.toUpperCase()} />} />
        ))}
      </Routes>
    </AppLayout>
  );
}
