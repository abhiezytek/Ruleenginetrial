import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Grid3X3,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import api from '../lib/api';

const PRODUCT_TYPES = [
  { value: '', label: 'All Products' },
  { value: 'term_life', label: 'Term Life' },
  { value: 'endowment', label: 'Endowment' },
  { value: 'health', label: 'Health' },
  { value: 'ulip', label: 'ULIP' },
];

const GRID_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'medical', label: 'Medical' },
  { value: 'financial', label: 'Financial' },
  { value: 'occupational', label: 'Occupational' },
];

const RESULT_COLORS = {
  NON_MED: 'bg-green-100 text-green-800',
  BASIC_VITALS: 'bg-emerald-100 text-emerald-800',
  BASIC_BLOOD: 'bg-yellow-100 text-yellow-800',
  FULL_MEDICAL: 'bg-orange-100 text-orange-800',
  CARDIAC_PLUS: 'bg-red-100 text-red-800',
  AUTO_OK: 'bg-green-100 text-green-800',
  NEED_PROOF: 'bg-yellow-100 text-yellow-800',
  NEED_OCC_DETAILS: 'bg-amber-100 text-amber-800',
  REFER_UW: 'bg-orange-100 text-orange-800',
  DECLINE: 'bg-red-100 text-red-800',
  LOADING_25: 'bg-blue-100 text-blue-800',
  LOADING_50: 'bg-indigo-100 text-indigo-800',
};

const GRID_TYPE_COLORS = {
  medical: 'bg-rose-100 text-rose-700 border-rose-200',
  financial: 'bg-blue-100 text-blue-700 border-blue-200',
  occupational: 'bg-amber-100 text-amber-700 border-amber-200',
};

function GridTable({ grid }) {
  const rows = grid.row_labels || [];
  const cols = grid.col_labels || [];
  const cells = grid.cells || [];

  const cellMap = useMemo(() => {
    const m = {};
    cells.forEach((c) => {
      m[`${c.row_value}__${c.col_value}`] = c;
    });
    return m;
  }, [cells]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-600">
              {grid.row_field} \ {grid.col_field}
            </th>
            {cols.map((c) => (
              <th
                key={c}
                className="border border-gray-200 bg-gray-50 px-3 py-2 text-center font-semibold text-gray-600 whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="border border-gray-200 bg-gray-50 px-3 py-2 font-medium text-gray-700 whitespace-nowrap">
                {r}
              </td>
              {cols.map((c) => {
                const cell = cellMap[`${r}__${c}`];
                const result = cell?.result || '—';
                const colorCls = RESULT_COLORS[result] || 'bg-gray-100 text-gray-600';
                return (
                  <td
                    key={c}
                    className="border border-gray-200 px-2 py-1.5 text-center"
                    title={cell?.tooltip || result}
                  >
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${colorCls}`}
                    >
                      {result}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EscalationFactors({ factors }) {
  if (!factors || factors.length === 0) return null;
  return (
    <div className="mt-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        Escalation Factors
      </h4>
      <div className="space-y-1">
        {factors.map((f, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2.5 py-1.5"
          >
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-gray-700">{f.factor}:</span>{' '}
              {f.description}{' '}
              <span className="text-gray-400">→ {f.escalation_result}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridCard({ grid, isExpanded, onToggle }) {
  const typeCls = GRID_TYPE_COLORS[grid.grid_type] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{grid.name}</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeCls}`}>
              {grid.grid_type}
            </span>
            {grid.is_enabled ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                active
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                disabled
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{grid.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(grid.products || []).map((p) => (
            <span
              key={p}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
            >
              {p}
            </span>
          ))}
        </div>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
            <div>
              <span className="text-gray-400 block">Row Field</span>
              <span className="font-medium text-gray-700">{grid.row_field}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Col Field</span>
              <span className="font-medium text-gray-700">{grid.col_field}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Rows</span>
              <span className="font-medium text-gray-700">{(grid.row_labels || []).length}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Columns</span>
              <span className="font-medium text-gray-700">{(grid.col_labels || []).length}</span>
            </div>
          </div>
          <GridTable grid={grid} />
          <EscalationFactors factors={grid.escalation_factors} />
        </div>
      )}
    </div>
  );
}

export default function ProductConfiguration() {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  const doFetch = () =>
    api
      .getGrids({ grid_type: typeFilter || undefined, product: productFilter || undefined })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setGrids(list);
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    setError(null);
    doFetch();
  }, [productFilter, typeFilter]);

  const load = () => {
    setLoading(true);
    setError(null);
    setSeedMsg(null);
    doFetch();
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await api.seedDefaultGrids();
      setSeedMsg(res?.message || `Seeded ${res?.seeded ?? 0} grids`);
      load();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSeeding(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return grids.filter((g) => {
      if (q && !(g.name ?? '').toLowerCase().includes(q) && !(g.description ?? '').toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [grids, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((g) => {
      const t = g.grid_type || 'other';
      if (!map[t]) map[t] = [];
      map[t].push(g);
    });
    return map;
  }, [filtered]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">
            {grids.length} underwriting grids configured
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
            onClick={handleSeedDefaults}
            disabled={seeding}
          >
            <Download className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding…' : 'Seed Default Grids'}
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {seedMsg && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          {seedMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search grids…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {PRODUCT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {GRID_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No grids found. Click &quot;Seed Default Grids&quot; to populate default underwriting grids.</p>
        </div>
      )}

      {/* Grid list grouped by type */}
      {!loading &&
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              {type} grids
              <span className="text-xs font-normal text-gray-400">({items.length})</span>
            </h2>
            <div className="space-y-3">
              {items.map((g) => (
                <GridCard
                  key={g.id}
                  grid={g}
                  isExpanded={expandedIds.has(g.id)}
                  onToggle={() => toggleExpand(g.id)}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
