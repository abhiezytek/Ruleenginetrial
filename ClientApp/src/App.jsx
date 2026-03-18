export default function App() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          RuleEnginenetrial React ClientApp
        </h1>
        <p style={{ lineHeight: 1.6, marginBottom: '0.5rem' }}>
          This is the minimal Vite + React host that will serve the migrated UI from
          <code style={{ marginLeft: '0.25rem' }}>/frontend</code>. Move pages/components here
          and wire React Router as needed. The build is configured to emit into
          <code style={{ marginLeft: '0.25rem' }}>../wwwroot</code> so ASP.NET Core can serve the
          SPA alongside the API.
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
          <li>Run <code>npm install</code> inside <code>ClientApp</code>.</li>
          <li>Use <code>npm run dev</code> for local SPA with an <code>/api</code> dev proxy.</li>
          <li>Use <code>npm run build</code> to publish static assets to <code>wwwroot/</code>.</li>
        </ul>
      </div>
    </main>
  );
}
