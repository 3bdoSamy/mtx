import { NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const pages = ['Overview', 'Streams', 'Protocols', 'Tokens', 'Recording', 'Metrics', 'Logs', 'Config', 'Security', 'System'];

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>MediaMTX</h1>
        <nav>
          {pages.map((p) => (
            <NavLink key={p} to={`/${p.toLowerCase()}`} className="nav-item">
              {p}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <span className="badge ok">Node healthy</span>
          <span className="muted">Commercial Streaming Control Appliance</span>
          <button className="user">admin</button>
        </header>
        {children}
      </main>
    </div>
  );
}
