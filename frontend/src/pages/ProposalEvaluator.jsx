import { useState, useEffect, useCallback } from 'react';
import { Search, Send, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

import {
  getProposalByPolicyNumber, evaluateProposal,
  getProducts, getRules, getGrids, getScorecards,
  getProductMappings, getGridMappings, getScorecardMappings,
} from '../lib/api';
import RuleMappingPanel from '../components/product/RuleMappingPanel';

// ── Constants ──────────────────────────────────────────────────────────────────

const FOLLOW_UP_DESCRIPTIONS = {
  MPN: 'Physical MER', MCE: 'CBC & ESR', WGN: 'Gynaecologist Report',
  TGQ: 'Transgender Questionnaire', IPR: 'Income Proof', NCM: 'Exit/Entry Details',
  NDN: 'PIO Proof', QNR: 'NRI Questionnaire', QSQ: 'Smoker Questionnaire',
  QAL: 'Alcohol Questionnaire', QHM: 'HUF Addendum', KNM: 'PAN Card',
  MWP: 'MWP Addendum', QEM: 'EE Annexure', QKN: 'Keyman Questionnaire',
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
  { value: '', label: 'Not Set' }, { value: 'matched', label: 'Matched' },
  { value: 'not_matched', label: 'Not Matched' }, { value: 'pending', label: 'Pending' },
];

const EMPTY_FORM = {
  proposal_id: '', product_code: '', product_type: 'term_life',
  product_category: 'life', payment_mode: 'A', mode_of_purchase: 'Online',
  policy_term: 0, premium_payment_term: 0, policy_number: 0,
  applicant_age: 0, applicant_gender: 'M', applicant_income: 0,
  proposer_income: 0, qualification: '', marital_status: '', nationality: 'Indian',
  sum_assured: 0, premium: 0, existing_coverage: 0, has_term_rider: false,
  height: '', weight: '', bmi: '', has_weight_changed: false,
  residential_country: 'India', business_country: '',
  has_medical_history: false, is_adventurous: false,
  family_medical_history_2_or_more: false, is_pregnant: false,
  pregnancy_weeks: '', is_medical_generated: false,
  is_smoker: false, cigarettes_per_day: '', smoking_years: '',
  is_alcoholic: false, alcohol_type: '', liquor_type: '',
  hard_liquor_quantity: '', beer_quantity: '', wine_quantity: '',
  is_narcotic: false, tobacco_quantity: '',
  occupation_code: '', occupation_class: 'class_1',
  is_occupation_hazardous: false, pincode: '', is_negative_pincode: false,
  risk_category: 'low', aml_category: 'low',
  is_pep: false, is_criminally_convicted: false, is_ofac: false, special_class: '',
  iib_status: '', iib_is_negative: false, iib_score: '', is_la_new_to_iib: false,
  fgli_policy_statuses: '',
  is_la_proposer: true, is_proposer_corporate: false,
  la_proposer_relation: '', nominee_relation: '',
};

const EMPTY_MAPPINGS = { rules: [], grids: [], scorecards: [] };

// ── Map Proposal DB record → form fields ─────────────────────────────────────
function mapProposalToForm(p) {
  return {
    ...EMPTY_FORM,
    proposal_id: p.proposal_number || p.proposal_id || '',
    product_code: p.product_code || '',
    product_type: p.product_type || 'term_life',
    product_category: p.product_category || 'life',
    payment_mode: p.payment_mode || 'A',
    mode_of_purchase: p.mode_of_purchase || p.purchase_mode || 'Online',
    policy_term: p.policy_term || 0,
    premium_payment_term: p.premium_payment_term || 0,
    policy_number: p.policy_number || 0,
    applicant_age: p.applicant_age || 0,
    applicant_gender: p.applicant_gender || 'M',
    applicant_income: p.applicant_income || 0,
    proposer_income: p.proposer_income || 0,
    qualification: p.qualification || '',
    marital_status: p.marital_status || '',
    nationality: p.nationality || 'Indian',
    sum_assured: p.sum_assured || 0,
    premium: p.premium || 0,
    existing_coverage: p.existing_coverage || 0,
    has_term_rider: p.has_term_rider || false,
    height: p.height || '',
    weight: p.weight || '',
    bmi: p.bmi || '',
    has_weight_changed: p.has_weight_changed || false,
    residential_country: p.residential_country || 'India',
    business_country: p.business_country || '',
    has_medical_history: p.has_medical_history || false,
    is_adventurous: p.is_adventurous || false,
    family_medical_history_2_or_more: p.family_medical_history || p.family_medical_history_2_or_more || false,
    is_pregnant: p.is_pregnant || false,
    pregnancy_weeks: p.pregnancy_weeks || '',
    is_medical_generated: p.is_medical_generated || false,
    is_smoker: p.is_smoker || false,
    cigarettes_per_day: p.cigarettes_per_day || '',
    smoking_years: p.smoking_years || '',
    is_alcoholic: p.is_alcoholic || false,
    alcohol_type: Array.isArray(p.alcohol_type) ? p.alcohol_type.join(', ') : (p.alcohol_type || ''),
    liquor_type: p.liquor_type != null ? String(p.liquor_type) : '',
    hard_liquor_quantity: p.hard_liquor_quantity || '',
    beer_quantity: p.beer_quantity || '',
    wine_quantity: p.wine_quantity || '',
    is_narcotic: p.is_narcotic || false,
    tobacco_quantity: p.tobacco_quantity || '',
    occupation_code: p.occupation_code || '',
    occupation_class: p.occupation_class || 'class_1',
    is_occupation_hazardous: p.is_occupation_hazardous || p.is_hazardous || false,
    pincode: p.pincode || '',
    is_negative_pincode: p.is_negative_pincode || false,
    risk_category: p.risk_category || 'low',
    aml_category: p.aml_category || p.aml_risk || 'low',
    is_pep: p.is_pep || false,
    is_criminally_convicted: p.is_criminally_convicted || false,
    is_ofac: p.is_ofac || false,
    special_class: p.special_class || '',
    iib_status: p.iib_status || '',
    iib_is_negative: p.iib_is_negative || false,
    iib_score: p.iib_score || '',
    is_la_new_to_iib: p.iib_is_new_to_iib || p.is_la_new_to_iib || false,
    fgli_policy_statuses: Array.isArray(p.fgli_policy_statuses)
      ? p.fgli_policy_statuses.join(', ')
      : (p.fgli_policy_statuses || ''),
    is_la_proposer: p.is_la_proposer !== undefined ? p.is_la_proposer : (p.is_la_proposer_same !== undefined ? p.is_la_proposer_same : true),
    is_proposer_corporate: p.is_proposer_corporate || false,
    la_proposer_relation: p.la_proposer_relation || '',
    nominee_relation: p.nominee_relation || '',
  };
}

// ── Build ProposalData payload for the evaluate endpoint ─────────────────────
function buildEvalPayload(form) {
  const num = (v) => (v !== '' && v !== null && v !== undefined ? Number(v) : null);
  const fgli = form.fgli_policy_statuses
    ? form.fgli_policy_statuses.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    proposal_id: form.proposal_id,
    product_type: form.product_type,
    product_category: form.product_category,
    product_code: form.product_code,
    payment_mode: form.payment_mode,
    purchase_mode: form.mode_of_purchase,
    policy_term: num(form.policy_term) ?? 0,
    premium_payment_term: num(form.premium_payment_term) ?? 0,
    policy_number: num(form.policy_number) ?? 0,
    applicant_age: num(form.applicant_age) ?? 0,
    applicant_gender: form.applicant_gender,
    applicant_income: num(form.applicant_income) ?? 0,
    proposer_income: num(form.proposer_income) ?? 0,
    qualification: form.qualification,
    marital_status: form.marital_status,
    nationality: form.nationality,
    sum_assured: num(form.sum_assured) ?? 0,
    premium: num(form.premium) ?? 0,
    existing_coverage: num(form.existing_coverage) ?? 0,
    has_term_rider: form.has_term_rider,
    height: num(form.height),
    weight: num(form.weight),
    bmi: num(form.bmi),
    has_weight_changed: form.has_weight_changed,
    residential_country: form.residential_country,
    business_country: form.business_country,
    has_medical_history: form.has_medical_history,
    is_adventurous: form.is_adventurous,
    family_medical_history_2_or_more: form.family_medical_history_2_or_more,
    is_pregnant: form.is_pregnant,
    pregnancy_weeks: num(form.pregnancy_weeks),
    is_medical_generated: form.is_medical_generated,
    is_smoker: form.is_smoker,
    cigarettes_per_day: num(form.cigarettes_per_day),
    smoking_years: num(form.smoking_years),
    is_alcoholic: form.is_alcoholic,
    is_narcotic: form.is_narcotic,
    tobacco_quantity: num(form.tobacco_quantity),
    liquor_type: num(form.liquor_type),
    hard_liquor_quantity: num(form.hard_liquor_quantity),
    beer_quantity: num(form.beer_quantity),
    wine_quantity: num(form.wine_quantity),
    occupation_code: form.occupation_code,
    occupation_class: form.occupation_class,
    is_hazardous: form.is_occupation_hazardous,
    pincode: form.pincode,
    is_negative_pincode: form.is_negative_pincode,
    risk_category: form.risk_category,
    aml_risk: form.aml_category,
    is_pep: form.is_pep,
    is_criminally_convicted: form.is_criminally_convicted,
    is_ofac: form.is_ofac,
    special_class: form.special_class,
    iib_status: form.iib_status,
    iib_is_negative: form.iib_is_negative,
    iib_score: num(form.iib_score),
    is_la_new_to_iib: form.is_la_new_to_iib,
    fgli_policy_statuses: fgli,
    is_la_proposer_same: form.is_la_proposer,
    is_proposer_corporate: form.is_proposer_corporate,
    la_proposer_relation: form.la_proposer_relation,
    nominee_relation: form.nominee_relation,
  };
}

// ── Reusable read-only form helpers ──────────────────────────────────────────

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
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400" />
          : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, span = 1 }) {
  const cls = span === 3 ? 'col-span-3' : span === 2 ? 'col-span-2' : 'col-span-1';
  return (
    <div className={cls}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ROText({ value, placeholder = '—' }) {
  return (
    <Input
      value={value !== '' && value !== null && value !== undefined ? String(value) : ''}
      readOnly
      placeholder={placeholder}
      className="bg-gray-50 cursor-default"
    />
  );
}

function ROSelect({ value, options, placeholder = '—' }) {
  const label = options?.find((o) => String(o.value) === String(value))?.label ?? value ?? placeholder;
  return (
    <Input value={label} readOnly className="bg-gray-50 cursor-default" />
  );
}

function ROCheck({ checked, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 opacity-75 cursor-default">
      <Checkbox checked={!!checked} disabled />
      {label}
    </label>
  );
}

// ── Result Panel ──────────────────────────────────────────────────────────────

function ResultPanel({ result, onReset }) {
  const isPass = result.stp_decision === 'PASS';
  return (
    <Card className={`border-2 ${isPass ? 'border-green-400' : 'border-red-400'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex gap-3 items-center">
          {isPass
            ? <CheckCircle2 className="text-green-600 w-6 h-6" />
            : <XCircle className="text-red-600 w-6 h-6" />}
          <div>
            <div className="text-xl font-bold">{result.stp_decision}</div>
            <div className="text-sm text-gray-500">{result.case_type_label}</div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.validation_errors?.length > 0 && (
          <div>
            <div className="font-medium mb-1 text-red-600">Validation Errors</div>
            <ul className="list-disc pl-5 space-y-1">
              {result.validation_errors.map((e, i) => (
                <li key={i} className="text-sm text-red-700">{e}</li>
              ))}
            </ul>
          </div>
        )}
        {result.reason_messages?.length > 0 && (
          <div>
            <div className="font-medium mb-1">Reason Messages</div>
            <ul className="list-disc pl-5 space-y-1">
              {result.reason_messages.map((m, i) => (
                <li key={i} className="text-sm">{m}</li>
              ))}
            </ul>
          </div>
        )}
        {result.follow_up_codes?.length > 0 && (
          <div>
            <div className="font-medium mb-2">Follow-Up Codes</div>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                {result.follow_up_codes.map((code) => (
                  <Tooltip key={code}>
                    <TooltipTrigger asChild>
                      <Badge>{code}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>{FOLLOW_UP_DESCRIPTIONS[code] ?? code}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}
        {result.rule_trace?.length > 0 && (
          <div>
            <div className="font-medium mb-2">Rule Trace</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Triggered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rule_trace.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{r.rule_name}</TableCell>
                      <TableCell className="text-sm">{r.category}</TableCell>
                      <TableCell>
                        <Badge variant={r.triggered ? 'destructive' : 'secondary'}>
                          {r.triggered ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProposalEvaluator() {
  const [policyInput, setPolicyInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [proposalLoaded, setProposalLoaded] = useState(false);

  // Rules tab state
  const [assets, setAssets] = useState({ rules: [], grids: [], scorecards: [] });
  const [mappings, setMappings] = useState(EMPTY_MAPPINGS);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Results tab state
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  const [activeTab, setActiveTab] = useState('policy');

  // ── Search proposal by policy number ──────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const pn = parseInt(policyInput, 10);
    if (!pn || pn <= 0) {
      toast.error('Enter a valid positive policy number');
      return;
    }
    setSearching(true);
    try {
      const res = await getProposalByPolicyNumber(pn);
      const mapped = mapProposalToForm(res.data);
      setForm(mapped);
      setProposalLoaded(true);
      setResult(null);
      toast.success(`Proposal loaded for policy #${pn}`);

      // Pre-seed Rules tab: find product matching product_code and load its mappings
      const productCode = res.data.product_code;
      if (productCode) {
        loadMappingsForProduct(productCode);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Proposal not found';
      toast.error(msg);
      setProposalLoaded(false);
      setForm(EMPTY_FORM);
    } finally {
      setSearching(false);
    }
  }, [policyInput]);

  // ── Load rules/grids/scorecards assets ─────────────────────────────────────
  const loadAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const [rulesRes, gridsRes, scorecardsRes] = await Promise.allSettled([
        getRules(), getGrids(), getScorecards(),
      ]);
      setAssets({
        rules: rulesRes.status === 'fulfilled' ? (rulesRes.value?.data || []) : [],
        grids: gridsRes.status === 'fulfilled' ? (gridsRes.value?.data || []) : [],
        scorecards: scorecardsRes.status === 'fulfilled' ? (scorecardsRes.value?.data || []) : [],
      });
    } catch {
      toast.error('Could not load rules / grids / scorecards');
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  // ── Load mappings for a given product code ──────────────────────────────────
  const loadMappingsForProduct = useCallback(async (productCode) => {
    try {
      const productsRes = await getProducts();
      const products = productsRes.data || [];
      const product = products.find((p) => p.code === productCode);
      if (!product) return;

      const [mapRes, gridRes, scorecardRes] = await Promise.allSettled([
        getProductMappings(product.id),
        getGridMappings(product.id),
        getScorecardMappings(product.id),
      ]);
      setMappings({
        rules: mapRes.status === 'fulfilled' ? (mapRes.value?.data?.rule_ids || []) : [],
        grids: gridRes.status === 'fulfilled' ? (gridRes.value?.data?.grid_ids || []) : [],
        scorecards: scorecardRes.status === 'fulfilled' ? (scorecardRes.value?.data?.scorecard_ids || []) : [],
      });
    } catch {
      // non-critical
    }
  }, []);

  // ── Load assets when Rules tab is first opened ─────────────────────────────
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'rules' && assets.rules.length === 0) {
      loadAssets();
    }
  }, [assets.rules.length, loadAssets]);

  // ── Evaluate ───────────────────────────────────────────────────────────────
  const handleEvaluate = useCallback(async () => {
    if (!proposalLoaded) {
      toast.error('Load a proposal first from the Policy tab');
      return;
    }
    setEvaluating(true);
    setResult(null);
    try {
      const payload = buildEvalPayload(form);
      const res = await evaluateProposal(payload);
      setResult(res.data);
      toast.success('Evaluation complete');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Evaluation failed';
      toast.error(msg);
    } finally {
      setEvaluating(false);
    }
  }, [form, proposalLoaded]);

  const handleReset = useCallback(() => {
    setPolicyInput('');
    setForm(EMPTY_FORM);
    setProposalLoaded(false);
    setMappings(EMPTY_MAPPINGS);
    setResult(null);
    setActiveTab('policy');
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Proposal Evaluator</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* ── POLICY TAB ──────────────────────────────────────────────────── */}
        <TabsContent value="policy" className="mt-4">
          {/* Search bar */}
          <div className="flex gap-2 mb-6">
            <Input
              type="number"
              placeholder="Enter Policy Number"
              value={policyInput}
              onChange={(e) => setPolicyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-xs"
            />
            <Button onClick={handleSearch} disabled={searching}>
              <Search className="w-4 h-4 mr-2" />
              {searching ? 'Searching…' : 'Search'}
            </Button>
            {proposalLoaded && (
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" /> Reset
              </Button>
            )}
          </div>

          {!proposalLoaded && (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed rounded-lg">
              Enter a policy number above to load proposal details
            </div>
          )}

          {proposalLoaded && (
            <>
              <Section title="1 · Basic Info" defaultOpen>
                <Field label="Proposal ID"><ROText value={form.proposal_id} /></Field>
                <Field label="Product Type"><ROText value={form.product_type} /></Field>
                <Field label="Product Category"><ROText value={form.product_category} /></Field>
                <Field label="Product Code"><ROText value={form.product_code} /></Field>
                <Field label="Payment Mode"><ROText value={form.payment_mode} /></Field>
                <Field label="Mode of Purchase"><ROText value={form.mode_of_purchase} /></Field>
                <Field label="Policy Term (yrs)"><ROText value={form.policy_term} /></Field>
                <Field label="PPT (yrs)"><ROText value={form.premium_payment_term} /></Field>
                <Field label="Policy Number"><ROText value={form.policy_number} /></Field>
              </Section>

              <Section title="2 · Applicant Details" defaultOpen>
                <Field label="Age"><ROText value={form.applicant_age} /></Field>
                <Field label="Gender"><ROText value={form.applicant_gender} /></Field>
                <Field label="Annual Income"><ROText value={form.applicant_income} /></Field>
                <Field label="Proposer Income"><ROText value={form.proposer_income} /></Field>
                <Field label="Qualification">
                  <ROSelect value={form.qualification} options={QUALIFICATIONS} />
                </Field>
                <Field label="Marital Status"><ROText value={form.marital_status} /></Field>
                <Field label="Nationality"><ROText value={form.nationality} /></Field>
              </Section>

              <Section title="3 · Coverage" defaultOpen>
                <Field label="Sum Assured"><ROText value={form.sum_assured} /></Field>
                <Field label="Premium"><ROText value={form.premium} /></Field>
                <Field label="Existing Coverage"><ROText value={form.existing_coverage} /></Field>
                <Field label="Term Rider">
                  <ROCheck checked={form.has_term_rider} label="Term Rider attached" />
                </Field>
              </Section>

              <Section title="4 · Build">
                <Field label="Height (cm)"><ROText value={form.height} /></Field>
                <Field label="Weight (kg)"><ROText value={form.weight} /></Field>
                <Field label="BMI (auto-calculated)">
                  <ROText value={form.bmi ? `${form.bmi} kg/m²` : ''} placeholder="—" />
                </Field>
                <Field label="Weight Changed">
                  <ROCheck checked={form.has_weight_changed} label="Significant weight change" />
                </Field>
              </Section>

              <Section title="5 · Residential Status">
                <Field label="Residential Country"><ROText value={form.residential_country} /></Field>
                <Field label="Business Country"><ROText value={form.business_country} /></Field>
              </Section>

              <Section title="6 · Health & Medical History">
                <Field label="Medical History">
                  <ROCheck checked={form.has_medical_history} label="Has Medical History" />
                </Field>
                <Field label="Adventurous Activities">
                  <ROCheck checked={form.is_adventurous} label="Participates in Adventurous Activities" />
                </Field>
                <Field label="Family History">
                  <ROCheck checked={form.family_medical_history_2_or_more} label="2+ Family Members with Medical History" />
                </Field>
                <Field label="Pregnant">
                  <ROCheck checked={form.is_pregnant} label="Is Pregnant" />
                </Field>
                {form.is_pregnant && (
                  <Field label="Pregnancy Weeks"><ROText value={form.pregnancy_weeks} /></Field>
                )}
                <Field label="Medical Generated">
                  <ROCheck checked={form.is_medical_generated} label="Medical Report Generated" />
                </Field>
              </Section>

              <Section title="7 · Lifestyle Habits">
                <Field label="Smoker">
                  <ROCheck checked={form.is_smoker} label="Is Smoker" />
                </Field>
                {form.is_smoker && (
                  <>
                    <Field label="Cigarettes/Day"><ROText value={form.cigarettes_per_day} /></Field>
                    <Field label="Smoking Years"><ROText value={form.smoking_years} /></Field>
                  </>
                )}
                <Field label="Tobacco Qty (g/day)" span={form.is_smoker ? 3 : 1}>
                  <ROText value={form.tobacco_quantity} />
                </Field>
                <Field label="Alcoholic">
                  <ROCheck checked={form.is_alcoholic} label="Is Alcoholic" />
                </Field>
                {form.is_alcoholic && (
                  <>
                    <Field label="Alcohol Type"><ROText value={form.alcohol_type} /></Field>
                    <Field label="Liquor Type"><ROText value={form.liquor_type} /></Field>
                    <Field label="Hard Liquor (ml/day)"><ROText value={form.hard_liquor_quantity} /></Field>
                    <Field label="Beer (ml/day)"><ROText value={form.beer_quantity} /></Field>
                    <Field label="Wine (ml/day)"><ROText value={form.wine_quantity} /></Field>
                  </>
                )}
                <Field label="Narcotic">
                  <ROCheck checked={form.is_narcotic} label="Narcotic Use" />
                </Field>
              </Section>

              <Section title="8 · Occupation & Risk">
                <Field label="Occupation Code"><ROText value={form.occupation_code} /></Field>
                <Field label="Occupation Class"><ROText value={form.occupation_class} /></Field>
                <Field label="Hazardous?">
                  <ROCheck checked={form.is_occupation_hazardous} label="Hazardous Occupation" />
                </Field>
                <Field label="Pincode"><ROText value={form.pincode} /></Field>
                <Field label="Negative Pincode?">
                  <ROCheck checked={form.is_negative_pincode} label="Negative Pincode" />
                </Field>
                <Field label="Risk Category"><ROText value={form.risk_category} /></Field>
                <Field label="AML Category"><ROText value={form.aml_category} /></Field>
              </Section>

              <Section title="9 · Compliance & Flags">
                <Field label="PEP">
                  <ROCheck checked={form.is_pep} label="Politically Exposed Person" />
                </Field>
                <Field label="Criminally Convicted">
                  <ROCheck checked={form.is_criminally_convicted} label="Criminally Convicted" />
                </Field>
                <Field label="OFAC Listed">
                  <ROCheck checked={form.is_ofac} label="OFAC Listed" />
                </Field>
                <Field label="Special Class"><ROText value={form.special_class} /></Field>
              </Section>

              <Section title="10 · IIB / Previous Policy">
                <Field label="IIB Status">
                  <ROSelect value={form.iib_status} options={IIB_STATUSES} />
                </Field>
                <Field label="IIB Negative?">
                  <ROCheck checked={form.iib_is_negative} label="IIB Is Negative" />
                </Field>
                <Field label="IIB Score"><ROText value={form.iib_score} /></Field>
                <Field label="New to IIB?">
                  <ROCheck checked={form.is_la_new_to_iib} label="LA is New to IIB" />
                </Field>
                <Field label="FGLI Policy Statuses" span={3}>
                  <ROText value={form.fgli_policy_statuses} />
                </Field>
              </Section>

              <Section title="11 · Relationship & Proposer">
                <Field label="LA is Proposer?">
                  <ROCheck checked={form.is_la_proposer} label="LA Same as Proposer" />
                </Field>
                <Field label="Corporate Proposer?">
                  <ROCheck checked={form.is_proposer_corporate} label="Proposer is Corporate" />
                </Field>
                <Field label="LA-Proposer Relation"><ROText value={form.la_proposer_relation} /></Field>
                <Field label="Nominee Relation"><ROText value={form.nominee_relation} /></Field>
              </Section>
            </>
          )}
        </TabsContent>

        {/* ── RULES TAB ────────────────────────────────────────────────────── */}
        <TabsContent value="rules" className="mt-4">
          {!proposalLoaded && (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed rounded-lg">
              Load a proposal from the Policy tab first
            </div>
          )}
          {proposalLoaded && (
            <>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">Product:</span>
                <Badge variant="outline">{form.product_code}</Badge>
                <span className="text-slate-400">– rules for this product are pre-selected below</span>
              </div>
              {assetsLoading ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                  Loading rules…
                </div>
              ) : (
                <RuleMappingPanel
                  assets={assets}
                  mappings={mappings}
                  onMappingsChange={setMappings}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* ── RESULTS TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="results" className="mt-4">
          <div className="flex gap-3 mb-6">
            <Button onClick={handleEvaluate} disabled={evaluating || !proposalLoaded}>
              <Send className="w-4 h-4 mr-2" />
              {evaluating ? 'Evaluating…' : 'Evaluate Proposal'}
            </Button>
            {!proposalLoaded && (
              <span className="text-sm text-slate-400 self-center">
                Load a proposal from the Policy tab first
              </span>
            )}
          </div>
          {result && <ResultPanel result={result} onReset={() => setResult(null)} />}
          {!result && proposalLoaded && !evaluating && (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed rounded-lg">
              Click "Evaluate Proposal" to run the rules engine
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
