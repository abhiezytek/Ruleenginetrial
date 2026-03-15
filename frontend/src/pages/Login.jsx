import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

// Criterion brand component — "Crite" red, "rion" blue
function CriterionBrand({ size = 'lg' }) {
  const cls =
    size === 'xl'
      ? 'text-4xl font-extrabold tracking-tight'
      : size === 'lg'
      ? 'text-2xl font-extrabold tracking-tight'
      : 'text-base font-bold';
  return (
    <span className={cls}>
      <span className="text-red-600">Crite</span>
      <span className="text-blue-600">rion</span>
    </span>
  );
}

// SVG background — actuarial / insurance sketch style (charts, calculator, math)
function SketchBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Light warm background */}
      <rect width="900" height="600" fill="#f5f4f0" />

      {/* — Calculator (bottom-left) — */}
      <g stroke="#888" strokeWidth="1.5" fill="none" opacity="0.45">
        {/* Body */}
        <rect x="30" y="260" width="130" height="200" rx="8" />
        {/* Screen */}
        <rect x="44" y="275" width="102" height="40" rx="3" />
        <text x="130" y="298" textAnchor="end" fontSize="12" fill="#888" fontFamily="monospace">8,540</text>
        {/* Key grid */}
        {[0,1,2,3].map(r =>
          [0,1,2,3].map(c => (
            <rect
              key={`k${r}${c}`}
              x={44 + c * 26}
              y={325 + r * 28}
              width="20"
              height="20"
              rx="2"
            />
          ))
        )}
        <text x="32" y="490" fontSize="9" fill="#999">OFF</text>
      </g>

      {/* — Clipboard / document (centre) — */}
      <g stroke="#888" strokeWidth="1.5" fill="none" opacity="0.4">
        <rect x="220" y="30" width="380" height="480" rx="6" />
        {/* Clip top */}
        <rect x="360" y="15" width="100" height="28" rx="14" />
        <rect x="385" y="5" width="50" height="20" rx="10" />
        {/* Title text */}
        <text x="410" y="90" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#888" letterSpacing="2">INFOGRAPHIC</text>
        {/* Pie charts row */}
        {[0,1,2,3].map(i => {
          const cx = 280 + i * 80;
          const cy = 165;
          const r = 28;
          const pct = [25,50,65,75][i];
          const angle = (pct / 100) * 360;
          const rad = angle * Math.PI / 180;
          const x1 = cx + r * Math.sin(0);
          const y1 = cy - r * Math.cos(0);
          const x2 = cx + r * Math.sin(rad);
          const y2 = cy - r * Math.cos(rad);
          const large = pct > 50 ? 1 : 0;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} />
              <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill="#ccc" opacity="0.5" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fill="#777">{pct}%</text>
            </g>
          );
        })}
        {/* Bar chart 1 */}
        {[40,60,35,70,45,80,55,65,50,75].map((h, i) => (
          <rect key={i} x={238 + i * 18} y={340 - h} width="12" height={h} fill="#ccc" opacity="0.55" />
        ))}
        {/* Bar chart 2 */}
        {[30,55,70,40,65,45,80,35,60,50].map((h, i) => (
          <rect key={i} x={490 + i * 18} y={340 - h} width="12" height={h} fill="#ccc" opacity="0.55" />
        ))}
        {/* x-axis lines */}
        <line x1="238" y1="341" x2="418" y2="341" />
        <line x1="490" y1="341" x2="670" y2="341" />
        {/* Math formula area */}
        <text x="480" y="420" fontSize="28" fill="#aaa" fontStyle="italic">y = Ax²</text>
        <line x1="460" y1="440" x2="640" y2="440" />
        <text x="530" y="465" fontSize="22" fill="#aaa" fontStyle="italic">C</text>
        {/* Horizontal sketch lines */}
        <line x1="238" y1="390" x2="550" y2="390" strokeDasharray="4,3" opacity="0.4" />
        <line x1="238" y1="405" x2="550" y2="405" strokeDasharray="4,3" opacity="0.4" />
      </g>

      {/* — Top pen / pencil — */}
      <g stroke="#888" strokeWidth="1.5" fill="none" opacity="0.45">
        <rect x="280" y="10" width="200" height="28" rx="4" transform="rotate(-5,380,24)" />
        <rect x="420" y="15" width="120" height="18" rx="3" transform="rotate(-5,480,24)" />
        <rect x="435" y="38" width="110" height="22" rx="3" transform="rotate(4,490,49)" />
      </g>

      {/* — Right side horizontal lines (behind login card) — */}
      <g stroke="#ccc" strokeWidth="1" opacity="0.35">
        <rect x="680" y="310" width="200" height="30" rx="3" />
        <rect x="680" y="355" width="200" height="30" rx="3" />
      </g>

      {/* Top colour bar: red left → blue right */}
      <defs>
        <linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="900" height="5" fill="url(#topbar)" />
    </svg>
  );
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ username: username.trim(), password });
      // data is the axios-interceptor-unwrapped response body
      const token = data?.access_token ?? data?.accessToken ?? '';
      const user = data?.user ?? { username: username.trim() };
      localStorage.setItem('criterion_token', token);
      localStorage.setItem('criterion_user', JSON.stringify(user));
      onLogin(user);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err?.detail ??
        err?.message ??
        (typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-end pr-8 sm:pr-16 lg:pr-24">
      {/* Full-page sketch background */}
      <SketchBackground />

      {/* Login card — floats on the right, sits above the background */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Card with red top accent */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Red → blue gradient top bar */}
          <div
            className="h-1.5 w-full"
            style={{ background: 'linear-gradient(to right, #dc2626, #2563eb)' }}
          />

          <div className="px-8 pt-8 pb-9">
            {/* Brand */}
            <div className="text-center mb-6">
              <CriterionBrand size="xl" />
              <p className="text-gray-500 text-sm mt-1">Intelligent Insurance Rule Engine</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Signing in…' : 'Login'}
              </button>
            </form>

            {/* Forgot password */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                onClick={() => setError('Please contact your administrator to reset your password.')}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>

        {/* Hint text below card */}
        <p className="text-center text-xs text-gray-400 mt-3">
          Default: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
        </p>
      </div>
    </div>
  );
}
