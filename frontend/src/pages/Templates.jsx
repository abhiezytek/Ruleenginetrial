import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import api from '../lib/api';

const FOLLOW_UP_DESCRIPTIONS = {
  MPN: 'Physical MER',
  MCE: 'CBC & ESR',
  WGN: 'Gynaecologist Report',
  TGQ: 'Transgender Questionnaire',
  IPR: 'Income Proof',
  NCM: 'Exit/Entry Details',
  NDN: 'PIO Proof',
  QNR: 'NRI Questionnaire',
  QSQ: 'Smoker Questionnaire',
  QAL: 'Alcohol Questionnaire',
  QHM: 'HUF Addendum',
  KNM: 'PAN Card',
  MWP: 'MWP Addendum',
  QEM: 'EE Annexure',
  QKN: 'Keyman Questionnaire',
};

// Group templates into buckets of 10 by numeric part of ID
function groupTemplates(templates) {
  const groups = {};
  for (const t of templates) {
    const id = t.template_id ?? t.id ?? '';
    const match = id.match(/(\d+)/);
    const num = match ? parseInt(match[1]) : 0;
    const bucket = Math.floor((num - 1) / 10);
    const start = bucket * 10 + 1;
    const end = start + 9;
    const key = `STP${String(start).padStart(3, '0')}–STP${String(end).padStart(3, '0')}`;
    if (!groups[key]) groups[key] = { key, start, templates: [] };
    groups[key].templates.push(t);
  }
  return Object.values(groups).sort((a, b) => a.start - b.start);
}

function TemplateRow({ t }) {
  const products = Array.isArray(t.applicable_products)
    ? t.applicable_products
    : typeof t.applicable_products === 'string' && t.applicable_products
    ? t.applicable_products.split(',').map((p) => p.trim())
    : [];

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600 whitespace-nowrap">
        {t.template_id ?? t.id}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-800 text-sm">{t.name ?? t.template_name}</div>
        {t.description && (
          <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.description}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {t.category ?? '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        {t.letter_flag === 'O' ? (
          <span className="badge-o">O</span>
        ) : t.letter_flag === 'L' ? (
          <span className="badge-l">L</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {t.follow_up_code ? (
          <div className="relative group inline-block">
            <span className="badge-code cursor-help">{t.follow_up_code}</span>
            {FOLLOW_UP_DESCRIPTIONS[t.follow_up_code] && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max max-w-xs bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                {FOLLOW_UP_DESCRIPTIONS[t.follow_up_code]}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {products.length > 0
            ? products.map((p) => (
                <span key={p} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  {p}
                </span>
              ))
            : <span className="text-gray-400 text-xs">All</span>
          }
        </div>
      </td>
    </tr>
  );
}

function TemplateGroup({ group }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 card p-0 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left border-b border-gray-200"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-slate-700 text-sm">
          {group.key}
          <span className="ml-2 text-xs font-normal text-slate-400">
            ({group.templates.length} templates)
          </span>
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Letter Flag</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Follow-Up Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {group.templates.map((t, i) => (
                <TemplateRow key={t.template_id ?? t.id ?? i} t={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const doFetch = () =>
    api
      .getTemplates()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setTemplates(list);
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));

  // Initial load — loading starts true, no synchronous setState in effect
  useEffect(() => { doFetch(); }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    doFetch();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        (t.template_id ?? t.id ?? '').toLowerCase().includes(q) ||
        (t.name ?? t.template_name ?? '').toLowerCase().includes(q) ||
        (t.category ?? '').toLowerCase().includes(q) ||
        (t.follow_up_code ?? '').toLowerCase().includes(q)
    );
  }, [templates, search]);

  const groups = useMemo(() => groupTemplates(filtered), [filtered]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">STP Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            {templates.length} seeded STP rule templates
          </p>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-9"
          type="text"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-300" />
          Loading templates…
        </div>
      ) : groups.length === 0 ? (
        <div className="card p-10 text-center text-gray-400 text-sm">
          {templates.length === 0 ? 'No templates found.' : 'No templates match your search.'}
        </div>
      ) : (
        <>
          <div className="mb-3 text-xs text-gray-400">
            {search ? `${filtered.length} of ${templates.length}` : templates.length} templates · grouped by ID range
          </div>
          {groups.map((group) => (
            <TemplateGroup key={group.key} group={group} />
          ))}
        </>
      )}
    </div>
  );
}
