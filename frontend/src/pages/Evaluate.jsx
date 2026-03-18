import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import api from '../lib/api';

// Follow-up code descriptions
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

const QUALIFICATIONS = [
  { value: 'Q01', label: 'Q01 – Illiterate' },
  { value: 'Q02', label: 'Q02 – Up to 5th Std' },
  { value: 'Q03', label: 'Q03 – Up to 10th Std' },
  { value: 'Q04', label: 'Q04 – 12th / Intermediate' },
  { value: 'Q05', label: 'Q05 – Graduate' },
  { value: 'Q06', label: 'Q06 – Post Graduate' },
];

const IIB_STATUSES = [
  { value: '', label: 'Not Set' },
  { value: 'matched', label: 'Matched' },
  { value: 'not_matched', label: 'Not Matched' },
  { value: 'pending', label: 'Pending' },
];

// Default empty form state
const DEFAULT_FORM = {
  proposal_id: '',
  product_code: '',
  product_type: 'term_life',
  product_category: 'life',
  payment_mode: 'annual',
  mode_of_purchase: 'Online',
  policy_term: 20,
  premium_payment_term: 10,
  policy_number: 0,

  applicant_age: 35,
  applicant_gender: 'M',
  applicant_income: 500000,
  proposer_income: 0,
  qualification: 'Q05',
  marital_status: 'M',
  nationality: 'Indian',

  sum_assured: 5000000,
  premium: 50000,
  existing_coverage: 0,
  has_term_rider: false,

  height: '',
  weight: '',
  bmi: '',
  has_weight_changed: false,

  residential_country: 'India',
  business_country: '',

  has_medical_history: false,
  is_adventurous: false,
  family_medical_history_2_or_more: false,
  is_pregnant: false,
  pregnancy_weeks: '',
  is_medical_generated: false,

  is_smoker: false,
  cigarettes_per_day: '',
  smoking_years: '',
  is_alcoholic: false,
  alcohol_type: '',
  liquor_type: '',
  hard_liquor_quantity: '',
  beer_quantity: '',
  wine_quantity: '',
  is_narcotic: false,
  tobacco_quantity: '',

  occupation_code: '',
  occupation_class: 'class_1',
  is_occupation_hazardous: false,
  pincode: '',
  is_negative_pincode: false,
  risk_category: 'low',
  aml_category: 'low',

  is_pep: false,
  is_criminally_convicted: false,
  is_ofac: false,
  special_class: '',

  iib_status: '',
  iib_is_negative: false,
  iib_score: '',
  is_la_new_to_iib: false,
  fgli_policy_statuses: '',

  is_la_proposer: true,
  is_proposer_corporate: false,
  la_proposer_relation: '',
  nominee_relation: '',
};

// Accordion section wrapper
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-medium text-sm text-gray-700">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">{children}</div>}
    </div>
  );
}

function Field({ label, children, span = 1 }) {
  const colClass = span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : 'col-span-1';
  return (
    <div className={colClass}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ name, value, onChange, type = 'text', placeholder, min, max, step }) {
  return (
    <input
      className="input"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
    />
  );
}

function SelectInput({ name, value, onChange, children }) {
  return (
    <select className="input" name={name} value={value} onChange={onChange}>
      {children}
    </select>
  );
}

function CheckboxInput({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// Result panel component
function ResultPanel({ result, onReset }) {
  const [traceOpen, setTraceOpen] = useState(false);
  const isPass = result.stp_decision === 'PASS';

  return (
    <div className={`mt-6 rounded-xl border-2 ${isPass ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {isPass ? (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
          <div>
            <div className={`text-3xl font-extrabold ${isPass ? 'text-green-700' : 'text-red-700'}`}>
              {result.stp_decision}
            </div>
            <div className="text-sm text-gray-600">
              {result.case_type_label ?? `Case Type ${result.case_type}`} ·{' '}
              {result.evaluation_time_ms?.toFixed(2)}ms
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          New Evaluation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Letter Flags */}
        {(result.letter_flags ?? []).length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="section-title">Letter Flags</div>
            <div className="flex gap-2 flex-wrap">
              {result.letter_flags.map((f) =>
                f === 'O' ? (
                  <span key={f} className="badge-o text-sm px-3 py-1">O — Offer Letter</span>
                ) : f === 'L' ? (
                  <span key={f} className="badge-l text-sm px-3 py-1">L — Loading Letter</span>
                ) : (
                  <span key={f} className="inline-flex px-3 py-1 rounded text-sm font-semibold bg-gray-100 text-gray-700">
                    {f}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Follow-up Codes */}
        {(result.follow_up_codes ?? []).length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="section-title">Follow-Up Codes</div>
            <div className="flex gap-2 flex-wrap">
              {result.follow_up_codes.map((code) => (
                <div key={code} className="relative group">
                  <span className="badge-code text-xs px-2.5 py-1 cursor-help">{code}</span>
                  {FOLLOW_UP_DESCRIPTIONS[code] && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max max-w-xs bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      {code}: {FOLLOW_UP_DESCRIPTIONS[code]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {result.follow_up_codes.map((code) =>
                FOLLOW_UP_DESCRIPTIONS[code] ? (
                  <div key={code} className="text-xs text-gray-500">
                    <span className="font-mono font-semibold text-purple-700">{code}</span>
                    {' — '}
                    {FOLLOW_UP_DESCRIPTIONS[code]}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Reason Codes */}
        {(result.reason_codes ?? []).length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="section-title">Reason Codes</div>
            <div className="flex gap-1.5 flex-wrap">
              {result.reason_codes.map((code) => (
                <span key={code} className="inline-flex px-2 py-0.5 rounded text-xs font-mono bg-yellow-100 text-yellow-800 border border-yellow-200">
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scorecard */}
        {result.scorecard_value != null && result.scorecard_value !== 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="section-title">Scorecard</div>
            <div className="text-2xl font-bold text-gray-800">{result.scorecard_value}</div>
          </div>
        )}
      </div>

      {/* Triggered Rules */}
      {(result.triggered_rules ?? []).length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="section-title">
            Triggered Rules ({result.triggered_rules.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.triggered_rules.map((r, i) => (
              <span
                key={i}
                className="inline-flex px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reason Messages */}
      {(result.reason_messages ?? []).length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="section-title">Reason Messages</div>
          <ul className="space-y-1">
            {result.reason_messages.map((msg, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Errors */}
      {(result.validation_errors ?? []).length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
          <div className="section-title text-red-600">Validation Errors</div>
          <ul className="space-y-1">
            {result.validation_errors.map((e, i) => (
              <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rule Trace */}
      {(result.rule_trace ?? []).length > 0 && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
            onClick={() => setTraceOpen((o) => !o)}
          >
            <span className="section-title mb-0">
              Rule Trace ({result.rule_trace.length} rules evaluated)
            </span>
            {traceOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {traceOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Rule</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Triggered</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Letter Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.rule_trace.map((t, i) => (
                    <tr key={i} className={t.triggered ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-gray-700">{t.rule_name}</td>
                      <td className="px-3 py-2">
                        {t.triggered ? (
                          <span className="text-red-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {t.letter_flag === 'O' ? (
                          <span className="badge-o">O</span>
                        ) : t.letter_flag === 'L' ? (
                          <span className="badge-l">L</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Evaluate() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Auto-calculate BMI
  useEffect(() => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (h > 0 && w > 0) {
      const bmi = (w / Math.pow(h / 100, 2)).toFixed(1);
      setForm((f) => ({ ...f, bmi }));
    } else {
      setForm((f) => ({ ...f, bmi: '' }));
    }
  }, [form.height, form.weight]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const buildPayload = () => {
    const nullIfEmpty = (v) => (v === '' || v === null || v === undefined ? null : v);
    const numOrNull = (v) => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    };
    const boolOrNull = (v) => {
      if (v === true || v === 'true') return true;
      if (v === false || v === 'false') return false;
      return null;
    };
    // Backend expects liquor_type numeric: 1 = single type, 2 = multiple/mixed types
    const LIQUOR_TYPE_SINGLE = 1;
    const LIQUOR_TYPE_MIXED = 2;
    const liquorTypeValue = (() => {
      if (!form.is_alcoholic) return null;
      if (form.liquor_type === 'mixed') return LIQUOR_TYPE_MIXED;
      // Valid single liquor type identifiers from the form select
      const singleTypes = ['hard', 'beer', 'wine'];
      // Any selected single type (hard/beer/wine) → single liquor type flag
      return singleTypes.includes(form.liquor_type) ? LIQUOR_TYPE_SINGLE : null;
    })();
    return {
      proposal_id: form.proposal_id || `PROP-${Date.now()}`,
      product_code: form.product_code || 'GENERIC',
      product_type: form.product_type,
      product_category: form.product_category,
      payment_mode: form.payment_mode,
      mode_of_purchase: form.mode_of_purchase,
      policy_term: parseInt(form.policy_term) || 20,
      premium_payment_term: parseInt(form.premium_payment_term) || 10,
      policy_number: parseInt(form.policy_number) || 0,

      applicant_age: parseInt(form.applicant_age) || 35,
      applicant_gender: form.applicant_gender,
      applicant_income: parseFloat(form.applicant_income) || 0,
      proposer_income: parseFloat(form.proposer_income) || 0,
      qualification: form.qualification,
      marital_status: form.marital_status,
      nationality: form.nationality,

      sum_assured: parseFloat(form.sum_assured) || 0,
      premium: parseFloat(form.premium) || 0,
      existing_coverage: parseFloat(form.existing_coverage) || 0,
      has_term_rider: form.has_term_rider,

      height: numOrNull(form.height),
      weight: numOrNull(form.weight),
      bmi: numOrNull(form.bmi),
      has_weight_changed: form.has_weight_changed,

      residential_country: form.residential_country,
      business_country: nullIfEmpty(form.business_country),

      has_medical_history: form.has_medical_history,
      is_adventurous: form.is_adventurous,
      family_medical_history_2_or_more: form.family_medical_history_2_or_more,
      is_pregnant: form.is_pregnant,
      pregnancy_weeks: form.is_pregnant ? numOrNull(form.pregnancy_weeks) : null,
      is_medical_generated: form.is_medical_generated,

      is_smoker: form.is_smoker,
      cigarettes_per_day: form.is_smoker ? numOrNull(form.cigarettes_per_day) : null,
      smoking_years: form.is_smoker ? numOrNull(form.smoking_years) : null,
      is_alcoholic: form.is_alcoholic,
      alcohol_type: nullIfEmpty(form.alcohol_type),
      liquor_type: liquorTypeValue,
      hard_liquor_quantity: form.is_alcoholic ? numOrNull(form.hard_liquor_quantity) : null,
      beer_quantity: form.is_alcoholic ? numOrNull(form.beer_quantity) : null,
      wine_quantity: form.is_alcoholic ? numOrNull(form.wine_quantity) : null,
      is_narcotic: form.is_narcotic,
      tobacco_quantity: numOrNull(form.tobacco_quantity),

      occupation_code: nullIfEmpty(form.occupation_code),
      occupation_class: form.occupation_class,
      is_occupation_hazardous: form.is_occupation_hazardous,
      pincode: nullIfEmpty(form.pincode),
      is_negative_pincode: form.is_negative_pincode,
      risk_category: form.risk_category,
      aml_category: form.aml_category,

      is_pep: form.is_pep,
      is_criminally_convicted: form.is_criminally_convicted,
      is_ofac: form.is_ofac,
      special_class: nullIfEmpty(form.special_class),

      iib_status: nullIfEmpty(form.iib_status),
      iib_is_negative: boolOrNull(form.iib_is_negative),
      iib_score: numOrNull(form.iib_score),
      is_la_new_to_iib: boolOrNull(form.is_la_new_to_iib),
      fgli_policy_statuses: form.fgli_policy_statuses
        ? form.fgli_policy_statuses
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => s.toUpperCase())
        : null,

      is_la_proposer: form.is_la_proposer,
      is_proposer_corporate: form.is_proposer_corporate,
      la_proposer_relation: nullIfEmpty(form.la_proposer_relation),
      nominee_relation: nullIfEmpty(form.nominee_relation),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = buildPayload();
      const res = await api.evaluate(payload);
      setResult(res);
      setTimeout(() => {
        document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.title || err?.message || JSON.stringify(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setForm(DEFAULT_FORM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evaluation Console</h1>
        <p className="text-sm text-gray-500 mt-1">
          Left: enter proposal details · Right: view real-time STP decision and rule trace.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Evaluation Error</div>
            <div className="mt-0.5 text-red-600">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6 items-start">
        {/* Left: Proposal form */}
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-1">
            {/* Section 1: Basic Info */}
            <Section title="1 · Basic Info" defaultOpen>
              <Field label="Proposal ID">
                <TextInput name="proposal_id" value={form.proposal_id} onChange={handleChange} placeholder="Auto-generated if blank" />
              </Field>
              <Field label="Product Type">
                <SelectInput name="product_type" value={form.product_type} onChange={handleChange}>
                  <option value="term_life">Term Life</option>
                  <option value="endowment">Endowment</option>
                  <option value="ulip">ULIP</option>
                  <option value="health">Health</option>
                </SelectInput>
              </Field>
              <Field label="Product Category">
                <SelectInput name="product_category" value={form.product_category} onChange={handleChange}>
                  <option value="life">Life</option>
                  <option value="health">Health</option>
                  <option value="savings">Savings</option>
                  <option value="investment">Investment</option>
                </SelectInput>
              </Field>
              <Field label="Product Code">
                <TextInput name="product_code" value={form.product_code} onChange={handleChange} placeholder="e.g. TL001" />
              </Field>
              <Field label="Payment Mode">
                <SelectInput name="payment_mode" value={form.payment_mode} onChange={handleChange}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half_yearly">Half Yearly</option>
                  <option value="annual">Annual</option>
                </SelectInput>
              </Field>
              <Field label="Mode of Purchase">
                <SelectInput name="mode_of_purchase" value={form.mode_of_purchase} onChange={handleChange}>
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                  <option value="Amex">Amex</option>
                </SelectInput>
              </Field>
              <Field label="Policy Term (yrs)">
                <TextInput name="policy_term" value={form.policy_term} onChange={handleChange} type="number" min={1} max={50} />
              </Field>
              <Field label="PPT (yrs)">
                <TextInput name="premium_payment_term" value={form.premium_payment_term} onChange={handleChange} type="number" min={1} max={50} />
              </Field>
              <Field label="Policy Number">
                <TextInput name="policy_number" value={form.policy_number} onChange={handleChange} type="number" min={0} />
              </Field>
            </Section>

            {/* Section 2: Applicant */}
            <Section title="2 · Applicant Details" defaultOpen>
              <Field label="Age">
                <TextInput name="applicant_age" value={form.applicant_age} onChange={handleChange} type="number" min={0} max={100} />
              </Field>
              <Field label="Gender">
                <SelectInput name="applicant_gender" value={form.applicant_gender} onChange={handleChange}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </SelectInput>
              </Field>
              <Field label="Annual Income (₹)">
                <TextInput name="applicant_income" value={form.applicant_income} onChange={handleChange} type="number" min={0} />
              </Field>
              <Field label="Proposer Income (₹)">
                <TextInput name="proposer_income" value={form.proposer_income} onChange={handleChange} type="number" min={0} />
              </Field>
              <Field label="Qualification">
                <SelectInput name="qualification" value={form.qualification} onChange={handleChange}>
                  {QUALIFICATIONS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Marital Status">
                <SelectInput name="marital_status" value={form.marital_status} onChange={handleChange}>
                  <option value="S">Single</option>
                  <option value="M">Married</option>
                  <option value="W">Widowed</option>
                  <option value="D">Divorced</option>
                </SelectInput>
              </Field>
              <Field label="Nationality">
                <SelectInput name="nationality" value={form.nationality} onChange={handleChange}>
                  <option value="Indian">Indian</option>
                  <option value="NRI">NRI</option>
                  <option value="PIO">PIO</option>
                  <option value="OCI">OCI</option>
                  <option value="FN">Foreign National</option>
                </SelectInput>
              </Field>
            </Section>

            {/* Section 3: Coverage */}
            <Section title="3 · Coverage" defaultOpen>
              <Field label="Sum Assured (₹)">
                <TextInput name="sum_assured" value={form.sum_assured} onChange={handleChange} type="number" min={0} />
              </Field>
              <Field label="Premium (₹)">
                <TextInput name="premium" value={form.premium} onChange={handleChange} type="number" min={0} />
              </Field>
              <Field label="Existing Coverage (₹)">
                <TextInput name="existing_coverage" value={form.existing_coverage} onChange={handleChange} type="number" min={0} />
              </Field>
              <Field label="Has Term Rider" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="has_term_rider" checked={form.has_term_rider} onChange={handleChange} label="Term Rider attached" />
                </div>
              </Field>
            </Section>

            {/* Section 4: Build */}
            <Section title="4 · Build (Physical Measurements)">
              <Field label="Height (cm)">
                <TextInput name="height" value={form.height} onChange={handleChange} type="number" min={0} step={0.1} placeholder="e.g. 170" />
              </Field>
              <Field label="Weight (kg)">
                <TextInput name="weight" value={form.weight} onChange={handleChange} type="number" min={0} step={0.1} placeholder="e.g. 70" />
              </Field>
              <Field label="BMI (auto-calculated)">
                <div className="flex items-center gap-2">
                  <input
                    className="input bg-gray-50"
                    type="text"
                    value={form.bmi ? `${form.bmi} kg/m²` : ''}
                    readOnly
                    placeholder="Set height & weight"
                  />
                </div>
              </Field>
              <Field label="Weight Changed?">
                <div className="pt-1">
                  <CheckboxInput name="has_weight_changed" checked={form.has_weight_changed} onChange={handleChange} label="Significant weight change" />
                </div>
              </Field>
            </Section>

            {/* Section 5: Residential Status */}
            <Section title="5 · Residential Status">
              <Field label="Residential Country">
                <SelectInput name="residential_country" value={form.residential_country} onChange={handleChange}>
                  <option value="India">India</option>
                  <option value="Standard">Standard</option>
                  <option value="Substandard">Substandard</option>
                </SelectInput>
              </Field>
              <Field label="Business Country">
                <TextInput name="business_country" value={form.business_country} onChange={handleChange} placeholder="e.g. USA (optional)" />
              </Field>
            </Section>

            {/* Section 6: Health & History */}
            <Section title="6 · Health & Medical History">
              <Field label="Medical History" span={1}>
                <div className="pt-1 space-y-2">
                  <CheckboxInput name="has_medical_history" checked={form.has_medical_history} onChange={handleChange} label="Has Medical History" />
                </div>
              </Field>
              <Field label="Adventurous Activities" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="is_adventurous" checked={form.is_adventurous} onChange={handleChange} label="Participates in Adventurous Activities" />
                </div>
              </Field>
              <Field label="Family History" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="family_medical_history_2_or_more" checked={form.family_medical_history_2_or_more} onChange={handleChange} label="2+ Family Members with Medical History" />
                </div>
              </Field>
              <Field label="Pregnant" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="is_pregnant" checked={form.is_pregnant} onChange={handleChange} label="Is Pregnant" />
                </div>
              </Field>
              {form.is_pregnant && (
                <Field label="Pregnancy Weeks">
                  <TextInput name="pregnancy_weeks" value={form.pregnancy_weeks} onChange={handleChange} type="number" min={1} max={42} placeholder="weeks" />
                </Field>
              )}
              <Field label="Medical Generated" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="is_medical_generated" checked={form.is_medical_generated} onChange={handleChange} label="Medical Report Generated" />
                </div>
              </Field>
            </Section>

            {/* Section 7: Habits */}
            <Section title="7 · Lifestyle Habits">
              <Field label="Smoker" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="is_smoker" checked={form.is_smoker} onChange={handleChange} label="Is Smoker" />
                </div>
              </Field>
              {form.is_smoker && (
                <>
                  <Field label="Cigarettes/Day">
                    <TextInput name="cigarettes_per_day" value={form.cigarettes_per_day} onChange={handleChange} type="number" min={0} placeholder="count" />
                  </Field>
                  <Field label="Smoking Years">
                    <TextInput name="smoking_years" value={form.smoking_years} onChange={handleChange} type="number" min={0} placeholder="years" />
                  </Field>
                </>
              )}
              <Field label="Tobacco Qty (g/day)" span={form.is_smoker ? 3 : 1}>
                <TextInput name="tobacco_quantity" value={form.tobacco_quantity} onChange={handleChange} type="number" min={0} step={0.1} placeholder="grams" />
              </Field>
              <Field label="Alcoholic" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="is_alcoholic" checked={form.is_alcoholic} onChange={handleChange} label="Is Alcoholic" />
                </div>
              </Field>
              {form.is_alcoholic && (
                <>
                  <Field label="Alcohol Type">
                    <TextInput name="alcohol_type" value={form.alcohol_type} onChange={handleChange} placeholder="e.g. Beer/Whiskey" />
                  </Field>
                  <Field label="Liquor Type">
                    <SelectInput name="liquor_type" value={form.liquor_type} onChange={handleChange}>
                      <option value="">Select type</option>
                      <option value="hard">Hard Liquor</option>
                      <option value="beer">Beer</option>
                      <option value="wine">Wine</option>
                      <option value="mixed">Mixed</option>
                    </SelectInput>
                  </Field>
                  <Field label="Hard Liquor (ml/day)">
                    <TextInput name="hard_liquor_quantity" value={form.hard_liquor_quantity} onChange={handleChange} type="number" min={0} />
                  </Field>
                  <Field label="Beer (ml/day)">
                    <TextInput name="beer_quantity" value={form.beer_quantity} onChange={handleChange} type="number" min={0} />
                  </Field>
                  <Field label="Wine (ml/day)">
                    <TextInput name="wine_quantity" value={form.wine_quantity} onChange={handleChange} type="number" min={0} />
                  </Field>
                </>
              )}
              <Field label="Narcotic" span={1}>
                <div className="pt-1">
                  <CheckboxInput name="is_narcotic" checked={form.is_narcotic} onChange={handleChange} label="Narcotic Use" />
                </div>
              </Field>
            </Section>

            {/* Section 8: Occupation */}
            <Section title="8 · Occupation & Risk">
              <Field label="Occupation Code">
                <TextInput name="occupation_code" value={form.occupation_code} onChange={handleChange} placeholder="e.g. OCC001" />
              </Field>
              <Field label="Occupation Class">
                <SelectInput name="occupation_class" value={form.occupation_class} onChange={handleChange}>
                  <option value="class_1">Class 1 (Low Risk)</option>
                  <option value="class_2">Class 2</option>
                  <option value="class_3">Class 3</option>
                  <option value="class_4">Class 4 (High Risk)</option>
                </SelectInput>
              </Field>
              <Field label="Hazardous?">
                <div className="pt-1">
                  <CheckboxInput name="is_occupation_hazardous" checked={form.is_occupation_hazardous} onChange={handleChange} label="Hazardous Occupation" />
                </div>
              </Field>
              <Field label="Pincode">
                <TextInput name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" />
              </Field>
              <Field label="Negative Pincode?">
                <div className="pt-1">
                  <CheckboxInput name="is_negative_pincode" checked={form.is_negative_pincode} onChange={handleChange} label="Negative Pincode" />
                </div>
              </Field>
              <Field label="Risk Category">
                <SelectInput name="risk_category" value={form.risk_category} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </SelectInput>
              </Field>
              <Field label="AML Category">
                <SelectInput name="aml_category" value={form.aml_category} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </SelectInput>
              </Field>
            </Section>

            {/* Section 9: Compliance */}
            <Section title="9 · Compliance & Flags">
              <Field label="PEP">
                <div className="pt-1">
                  <CheckboxInput name="is_pep" checked={form.is_pep} onChange={handleChange} label="Politically Exposed Person" />
                </div>
              </Field>
              <Field label="Criminally Convicted">
                <div className="pt-1">
                  <CheckboxInput name="is_criminally_convicted" checked={form.is_criminally_convicted} onChange={handleChange} label="Criminally Convicted" />
                </div>
              </Field>
              <Field label="OFAC Listed">
                <div className="pt-1">
                  <CheckboxInput name="is_ofac" checked={form.is_ofac} onChange={handleChange} label="OFAC Listed" />
                </div>
              </Field>
              <Field label="Special Class">
                <SelectInput name="special_class" value={form.special_class} onChange={handleChange}>
                  <option value="">None</option>
                  <option value="HUF">HUF</option>
                  <option value="MWP">MWP</option>
                  <option value="employer_employee">Employer-Employee</option>
                  <option value="keyman">Keyman</option>
                </SelectInput>
              </Field>
            </Section>

            {/* Section 10: IIB */}
            <Section title="10 · IIB / Previous Policy">
              <Field label="IIB Status">
                <SelectInput name="iib_status" value={form.iib_status} onChange={handleChange}>
                  {IIB_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="IIB Negative?">
                <div className="pt-1">
                  <CheckboxInput name="iib_is_negative" checked={form.iib_is_negative} onChange={handleChange} label="IIB Is Negative" />
                </div>
              </Field>
              <Field label="IIB Score">
                <TextInput name="iib_score" value={form.iib_score} onChange={handleChange} type="number" placeholder="score" />
              </Field>
              <Field label="New to IIB?">
                <div className="pt-1">
                  <CheckboxInput name="is_la_new_to_iib" checked={form.is_la_new_to_iib} onChange={handleChange} label="LA is New to IIB" />
                </div>
              </Field>
              <Field label="FGLI Policy Statuses" span={3}>
                <TextInput
                  name="fgli_policy_statuses"
                  value={form.fgli_policy_statuses}
                  onChange={handleChange}
                  placeholder="Comma-separated statuses e.g. active,lapsed"
                />
                <div className="text-xs text-gray-400 mt-1">Comma-separated list of policy statuses</div>
              </Field>
            </Section>

            {/* Section 11: Relationship */}
            <Section title="11 · Relationship & Proposer">
              <Field label="LA is Proposer?">
                <div className="pt-1">
                  <CheckboxInput name="is_la_proposer" checked={form.is_la_proposer} onChange={handleChange} label="LA Same as Proposer" />
                </div>
              </Field>
              <Field label="Corporate Proposer?">
                <div className="pt-1">
                  <CheckboxInput name="is_proposer_corporate" checked={form.is_proposer_corporate} onChange={handleChange} label="Proposer is Corporate" />
                </div>
              </Field>
              <Field label="LA-Proposer Relation">
                <TextInput name="la_proposer_relation" value={form.la_proposer_relation} onChange={handleChange} placeholder="e.g. Spouse, Parent" />
              </Field>
              <Field label="Nominee Relation">
                <TextInput name="nominee_relation" value={form.nominee_relation} onChange={handleChange} placeholder="e.g. Spouse, Child" />
              </Field>
            </Section>

            {/* Submit */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                className="btn-primary px-8 py-3 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Evaluating…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Evaluate Proposal
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Right: Decision / result panel */}
        <div className="space-y-4 sticky top-4">
          {!result && (
            <div className="card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Decision Panel</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Submit the proposal to see the STP decision, score, and rule trace here.
                  </div>
                </div>
              </div>
            </div>
          )}
          {result && (
            <div id="result-panel">
              <ResultPanel result={result} onReset={handleReset} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
