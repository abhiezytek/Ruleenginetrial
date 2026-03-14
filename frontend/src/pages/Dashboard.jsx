import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import api from '../lib/api';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = () =>
    Promise.all([api.getDashboardStats(), api.getEvaluations(), api.getTemplates()])
      .then(([s, evals, templates]) => {
        // merge template count into stats
        setStats({ ...s, total_templates: Array.isArray(templates) ? templates.length : 0 });
        const list = Array.isArray(evals) ? evals : evals?.items ?? evals?.data ?? [];
        setEvaluations(list.slice(0, 10));
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));

  // Initial load — loading starts true, no synchronous setState needed in effect
  useEffect(() => { fetchAll(); }, []);

  const passCount = stats?.stp_pass ?? evaluations.filter((e) => e.stp_decision === 'PASS').length;
  const failCount = stats?.stp_fail ?? evaluations.filter((e) => e.stp_decision === 'FAIL').length;
  const totalEvals = stats?.total_evaluations ?? evaluations.length;
  const passRate =
    totalEvals > 0
      ? Math.round((passCount / totalEvals) * 100)
      : stats?.stp_rate != null && stats.stp_rate > 0
      ? Math.round(stats.stp_rate)
      : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Insurance STP Rule Engine — Overview
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Rules"
            value={stats?.total_rules ?? stats?.totalRules ?? '—'}
            color="bg-blue-500"
            sub={`${stats?.active_rules ?? stats?.enabled_rules ?? stats?.enabledRules ?? 0} active`}
          />
          <StatCard
            icon={FileText}
            label="Templates"
            value={stats?.total_templates ?? stats?.totalTemplates ?? '—'}
            color="bg-indigo-500"
            sub="STP patterns"
          />
          <StatCard
            icon={ClipboardList}
            label="Evaluations"
            value={totalEvals}
            color="bg-teal-500"
            sub="total processed"
          />
          <StatCard
            icon={TrendingUp}
            label="Pass Rate"
            value={
              passRate !== null
                ? `${passRate}%`
                : stats?.pass_rate != null
                ? `${Math.round(stats.pass_rate)}%`
                : '—'
            }
            color="bg-green-500"
            sub={`${passCount} pass / ${failCount} fail`}
          />
        </div>
      )}

      {/* Recent Evaluations */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Evaluations</h2>
          <Link to="/history" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
        ) : evaluations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No evaluations yet.{' '}
            <Link to="/evaluate" className="text-blue-600 hover:underline">
              Run your first evaluation →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Proposal ID
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Decision
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Case Type
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Letter Flags
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Rules Hit
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Time (ms)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evaluations.map((ev, idx) => (
                  <tr key={ev.proposal_id ?? ev.id ?? idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700 text-xs">
                      {ev.proposal_id ?? ev.id ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {ev.stp_decision === 'PASS' ? (
                        <span className="badge-pass">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          PASS
                        </span>
                      ) : (
                        <span className="badge-fail">
                          <XCircle className="w-3 h-3 mr-1" />
                          FAIL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {ev.case_type_label ?? `Type ${ev.case_type}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(ev.letter_flags ?? []).map((f) =>
                          f === 'O' ? (
                            <span key={f} className="badge-o">O</span>
                          ) : (
                            <span key={f} className="badge-l">L</span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(ev.triggered_rules ?? []).length}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {ev.evaluation_time_ms?.toFixed(1) ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
