import { useEffect, useState } from 'react';
import { Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';

interface RequirementMst {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PagedResult {
  items: RequirementMst[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Medical: 'bg-blue-50 text-blue-700 border-blue-200',
  Financial: 'bg-amber-50 text-amber-700 border-amber-200',
  Questionnaire: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function RequirementPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = (pg = page) => {
    setLoading(true);
    setError(null);
    const params: Record<string, string | number | boolean> = { page: pg, page_size: pageSize };
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (activeFilter !== '') params.is_active = activeFilter === 'active';

    api
      .getRequirements(params)
      .then((res: PagedResult) => setData(res))
      .catch((e: unknown) => {
        const err = e as { message?: string };
        setError(String(err?.message ?? e));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1);
  };

  const handleReset = () => {
    setSearch('');
    setCategoryFilter('');
    setActiveFilter('');
    setPage(1);
    setLoading(true);
    setError(null);
    api
      .getRequirements({ page: 1, page_size: pageSize })
      .then((res: PagedResult) => setData(res))
      .catch((e: unknown) => {
        const err = e as { message?: string };
        setError(String(err?.message ?? e));
      })
      .finally(() => setLoading(false));
  };

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirement Master</h1>
          <p className="text-sm text-gray-500 mt-1">
            Master list of underwriting requirement codes used during policy evaluation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Code, name, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="min-w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            <option value="Medical">Medical</option>
            <option value="Financial">Financial</option>
            <option value="Questionnaire">Questionnaire</option>
          </select>
        </div>
        <div className="min-w-32">
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm border-b border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Loading requirements…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">No requirements found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden lg:table-cell whitespace-nowrap">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => {
                  const catClass = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600 border-gray-200';
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 whitespace-nowrap">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                        {item.description ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${catClass}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                            item.is_active
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs text-right hidden lg:table-cell whitespace-nowrap">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} requirements
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
