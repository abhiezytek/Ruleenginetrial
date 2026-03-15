import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
} from 'lucide-react';
import api from '../lib/api';

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const doFetch = () =>
    api
      .getRules()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setRules(list);
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

  const categories = useMemo(() => {
    const cats = new Set(rules.map((r) => r.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [rules]);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.category ?? '').toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q);
      const matchCat = !categoryFilter || r.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [rules, search, categoryFilter]);

  const handleToggle = async (rule) => {
    const id = rule.id ?? rule.rule_id;
    setTogglingId(id);
    try {
      await api.toggleRule(id);
      setRules((prev) =>
        prev.map((r) =>
          (r.id ?? r.rule_id) === id ? { ...r, is_enabled: !r.is_enabled } : r
        )
      );
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rules</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rules.length} rules configured in the STP engine
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            type="text"
            placeholder="Search rules by name, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            className="input pl-9 min-w-[180px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-300" />
            Loading rules…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {rules.length === 0 ? 'No rules configured.' : 'No rules match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Products
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Letter Flag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Enabled
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((rule) => {
                  const id = rule.id ?? rule.rule_id;
                  const products = Array.isArray(rule.products)
                    ? rule.products.filter(Boolean)
                    : typeof rule.products === 'string' && rule.products
                    ? rule.products.split(',').map((p) => p.trim()).filter(Boolean)
                    : [];
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 text-sm">{rule.name ?? rule.rule_name}</div>
                        {rule.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{rule.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {rule.category ?? '—'}
                        </span>
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
                      <td className="px-4 py-3">
                        {rule.action?.letter_flag === 'O' ? (
                          <span className="badge-o">O</span>
                        ) : rule.action?.letter_flag === 'L' ? (
                          <span className="badge-l">L</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                        {rule.priority ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(rule)}
                          disabled={togglingId === id}
                          className="inline-flex items-center transition-colors disabled:opacity-40"
                          title={rule.is_enabled ? 'Disable rule' : 'Enable rule'}
                        >
                          {rule.is_enabled ? (
                            <ToggleRight className="w-7 h-7 text-blue-500" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-gray-300" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {rules.length} rules
          </div>
        )}
      </div>
    </div>
  );
}
