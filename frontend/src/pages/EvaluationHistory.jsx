import { useEffect, useState, Fragment } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  RefreshCw,
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

function ExpandedRow({ ev }) {
  return (
    <tr>
      <td colSpan={7} className="bg-slate-50 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {(ev.triggered_rules ?? []).length > 0 && (
            <div>
              <div className="font-medium text-gray-600 mb-2">
                Triggered Rules ({ev.triggered_rules.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {ev.triggered_rules.map((r, i) => (
                  <span key={i} className="inline-flex px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-700">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(ev.reason_messages ?? []).length > 0 && (
            <div>
              <div className="font-medium text-gray-600 mb-2">Reason Messages</div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                {ev.reason_messages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {(ev.follow_up_codes ?? []).length > 0 && (
            <div>
              <div className="font-medium text-gray-600 mb-2">Follow-Up Codes</div>
              <div className="space-y-1">
                {ev.follow_up_codes.map((code) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="badge-code">{code}</span>
                    <span className="text-xs text-gray-500">
                      {FOLLOW_UP_DESCRIPTIONS[code] ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function EvaluationHistory() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const doFetch = () =>
    api
      .getEvaluations()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setEvaluations(list);
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

  const toggleRow = (id) => setExpandedRow((prev) => (prev === id ? null : id));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluation History</h1>
          <p className="text-sm text-gray-500 mt-1">All past STP evaluations</p>
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

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-300" />
            Loading evaluations…
          </div>
        ) : evaluations.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No evaluations found. Run an evaluation from the Evaluate page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-6" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Proposal ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Decision
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Letter Flags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Follow-Up Codes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Rules Hit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Time (ms)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evaluations.map((ev, idx) => {
                  const rowId = ev.proposal_id ?? ev.id ?? idx;
                  const isExpanded = expandedRow === rowId;
                  return (
                    <Fragment key={rowId}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRow(rowId)}
                      >
                        <td className="px-3 py-3 text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
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
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(ev.follow_up_codes ?? []).map((code) => (
                              <div key={code} className="relative group">
                                <span className="badge-code cursor-help">{code}</span>
                                {FOLLOW_UP_DESCRIPTIONS[code] && (
                                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max max-w-xs bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                    {FOLLOW_UP_DESCRIPTIONS[code]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {(ev.triggered_rules ?? []).length}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {ev.evaluation_time_ms?.toFixed(1) ?? '—'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <ExpandedRow key={`exp-${rowId}`} ev={ev} />
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && evaluations.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {evaluations.length} total evaluations · Click a row to expand details
          </div>
        )}
      </div>
    </div>
  );
}
