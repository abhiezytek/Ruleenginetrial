import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { StatusBadge, CaseTypeBadge, CategoryBadge } from '../components/shared/StatusBadge';
import { PageLoader } from '../components/shared/LoadingSpinner';
import { evaluateProposal, getProducts } from '../lib/api';
import { PAYMENT_MODE, PRODUCT_TYPES, PRODUCT_CATEGORIES, MODEOFPURCHES, QUALIFICATIONS, MARITAL_STATUSES, NATIONALITY, IIB_STATUSES, LA_PROPOSER, NOMINEE_RELATION, GENDER, PRODUCT_CODES, OCCUPATIONS, PREVIOUS_POLICY_STATUS, PROPOSER_TYPE, PRODUCT_MAPPING, OCCUPATION_MAPPING, SPECIAL_CLASS, ALCOHOL_TYPE } from '../lib/constants';
import { toast } from 'sonner';
import {
  Play,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

// ============ HELPER COMPONENTS DEFINED OUTSIDE ============
// This prevents recreation on every render, fixing focus loss issues

const Section = memo(({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-sm">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        onClick={onToggle}
      >
        <span className="font-semibold text-sm text-slate-700">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-5 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
});

Section.displayName = 'Section';

// Initial proposal state factory
const getEmptyProposal = () => ({
  proposal_id: `PROP-${Date.now()}`,
  product_type: '',
  product_category: '',
  product_code: '',
  payment_mode: '',
  purchase_mode: '',
  policy_term: '',
  ppt: '',
  policy_number: '',
  applicant_age: '',
  applicant_gender: '',
  applicant_income: '',
  proposer_income: '',
  qualification: '',
  marital_status: '',
  nationality: '',
  sum_assured: '',
  premium: '',
  existing_coverage: '',
  ape: '',
  has_term_rider: false,
  height: '',
  weight: '',
  bmi: '',
  has_weight_changed: false,
  residential_country: '',
  business_country: '',
  has_medical_history: false,
  is_adventurous: false,
  family_meber_medical_history: false,
  is_pregnant: false,
  pregnancy_weeks: 0,
  is_medical_report_generated: false,
  is_smoker: false,
  is_alcoholic: false,
  is_narcotic: false,
  occupation: "",
  occupation_code: "",
  occupation_class: "",
  pincode: '',
  occupation_risk: '',
  aml_risk: '',
  is_hazardous: false,
  is_negative_pincode: false,
  is_pep: false,
  is_criminally_convicted: false,
  is_ofac: false,
  special_class: '',
  iib_status: '',
  iib_score: '',
  is_iib_negative: false,
  is_la_new_to_iib: false,
  fgli_policy_statuses: [],
  is_la_proposer_same: false,
  is_corporate_proposer: false,
  la_proposer_relation: '',
  nominee_relation: '',
  agent_code: '',
  agent_tier: '',
  risk_category: '',
  //conditional fields
  cigarettes_per_day: null,
  smoking_years: null,
  alcohol_type: [],
  alcohol_quantity: null,
  ailment_type: null,
  ailment_details: null,
  ailment_duration_years: null,
  is_ailment_ongoing: false,
});

// ============ MAIN COMPONENT ============
const EvaluationConsole = () => {
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [products, setProducts] = useState([]);
  const [traceExpanded, setTraceExpanded] = useState({});
  const [proposal, setProposal] = useState(getEmptyProposal);
  const [openSections, setOpenSections] = useState(["section1"]);

  // BMI Calculation - FIXED: now correctly sets 'bmi' not 'calcbmi'
  useEffect(() => {
    const h = parseFloat(proposal.height);
    const w = parseFloat(proposal.weight);

    if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
      const calcbmi = (w / Math.pow(h / 100, 2)).toFixed(1);
      if (proposal.bmi !== calcbmi) {
        setProposal((prev) => ({ ...prev, bmi: calcbmi }));
      }
    }
  }, [proposal.height, proposal.weight, proposal.bmi]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // Stable toggle handler using useCallback
  const toggleSection = useCallback((section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }, []);

  // Stable field change handler
  // const handleFieldChange = useCallback((field, value) => {
  //   setProposal((prev) => ({ ...prev, [field]: value }));
  // }, []);

  const handleFieldChange = useCallback((field, value) => {
    setProposal((prev) => {
      let updated = { ...prev, [field]: value };
      debugger;

      setIsLocked((prevLocks) => {
        let lockCategory = prevLocks.category;
        let lockCode = prevLocks.code;
        let lockOccupationClass = prevLocks.occ_class;
        let lockIsHazardous = prevLocks.occ_hazardus;
        let lockProposerType = prevLocks.prop_type;
        let lockLAProposerRelation = prevLocks.is_la_prop_same;

        // ?? When Product Type changes
        if (field === "product_type") {
          const match = PRODUCT_MAPPING.find((p) => p.type === value);

          if (match) {
            updated.product_category = match.category;
            updated.product_code = match.code;

            lockCategory = true;
            lockCode = true;
          }
        }
        console.log(value);
        // ?? When Occupation changes
        if (field === "occupation") {

          const match1 = OCCUPATION_MAPPING.find(
            (p) => p.occupationCode === value
          );
          updated.occupation_code = value;
          console.log("occupation_code: " + updated.occupation_code);
          if (match1) {
            updated.occupation_class = match1.occupationclass;
            updated.is_hazardous = match1.ishazardous;

            lockOccupationClass = true;
            lockIsHazardous = true;
          }
        }

        // ?? When LA Proposer Same
        if (field === "is_la_proposer_same") {

          if (value) {
            updated.proposer_type = "individual";
            updated.la_proposer_relation = "self";

            lockProposerType = true;
            lockLAProposerRelation = true;
          }
          else {
            lockProposerType = false;
            lockLAProposerRelation = false;
          }
        }


        // // ?? When Product Category changes manually
        // if (field === "product_category") {
        //   const match = PRODUCT_MAPPING.find(
        //     (p) =>
        //       p.type === updated.product_type &&
        //       p.category === value
        //   );

        //   if (match) {
        //     updated.product_code = match.code;
        //     lockCode = true;
        //   }
        // }

        return {
          category: lockCategory,
          code: lockCode,
          occ_class: lockOccupationClass,
          occ_hazardus: lockIsHazardous,
          prop_type: lockProposerType,
          is_la_prop_same: lockLAProposerRelation
        };
      });

      return updated;
    });
  }, []);

  // Handler for input onChange events
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setProposal((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Validate required fields before submission
  const validateProposal = () => {
    const errors = [];
    if (!proposal.product_type) errors.push('Product Type is required');
    if (!proposal.product_code) errors.push('Product Code is required');
    if (!proposal.product_category) errors.push('Product Category is required');
    if (!proposal.applicant_age) errors.push('Applicant Age is required');
    if (!proposal.applicant_gender) errors.push('Gender is required');
    if (!proposal.applicant_income) errors.push('Annual Income is required');
    if (!proposal.proposer_income) errors.push('Proposer Income is required');
    if (!proposal.sum_assured) errors.push('Sum Assured is required');
    if (!proposal.premium) errors.push('Premium is required');
    if (!proposal.payment_mode) errors.push('Payment Mode is required');
    if (!proposal.existing_coverage) errors.push('Existing Coverage is required');
    if (!proposal.bmi) errors.push('BMI is required');
    if (!proposal.height) errors.push('Height is required');
    if (!proposal.weight) errors.push('Weight is required');
    if (!proposal.qualification) errors.push('Qualification is required');
    if (!proposal.marital_status) errors.push('Marital Status is required');
    if (!proposal.nationality) errors.push('Nationality is required');
    // if (!proposal.occupation_risk) errors.push('Occupation Risk is required');
    // if (!proposal.aml_risk) errors.push('AML Risk is required');
    if (!proposal.purchase_mode) errors.push('Purchase Mode is required');
    if (!proposal.policy_term) errors.push('Policy Term is required');
    if (!proposal.ppt) errors.push('PPT is required');
    // if (!proposal.policy_number) errors.push('Policy Number is required');
    if (!proposal.special_class) errors.push('Special class is required');
    if (!proposal.pincode) errors.push('Pincode is required');
    if (!proposal.occupation) errors.push('Occupation  is required');
    if (!proposal.proposer_type) errors.push('Proposer type  is required');
    if (!proposal.nominee_relation) errors.push('Nominee relation  is required');

    if (proposal.is_smoker) {
      if (!proposal.cigarettes_per_day) errors.push('Cigarettes per day is required for smokers');
      if (!proposal.smoking_years) errors.push('Smoking years is required for smokers');
    }
    if (proposal.is_alcoholic) {
      if (!proposal.alcohol_type) errors.push('Alcohol type is required for Alcoholic');
      if (!proposal.alcohol_quantity) errors.push('Alcohol quantity is required for Alcoholic');
    }

    if (proposal.has_medical_history) {
      if (!proposal.ailment_type) errors.push('Ailment type is required for medical history');
      if (!proposal.ailment_duration_years) errors.push('Ailment duration is required for medical history');
    }

    return errors;
  };

  const handleEvaluate = async () => {
    const validationErrors = validateProposal();
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
      return;
    }

    try {
      setEvaluating(true);
      setResult(null);

      const proposalData = {
        proposal_id: proposal.proposal_id,
        product_type: proposal.product_type,
        product_category: proposal.product_category,
        product_code: proposal.product_code || proposal.product_type?.toUpperCase().replace('_', '_'),
        payment_mode: proposal.payment_mode,
        purchase_mode: proposal.purchase_mode,
        policy_term: parseInt(proposal.policy_term) || 0,
        ppt: parseInt(proposal.ppt) || 0,
        policy_number: parseInt(proposal.policy_number) || 0,
        applicant_age: parseInt(proposal.applicant_age) || 0,
        applicant_gender: proposal.applicant_gender,
        applicant_income: parseInt(proposal.applicant_income) || 0,
        proposer_income: parseInt(proposal.proposer_income) || 0,
        qualification: proposal.qualification,
        marital_status: proposal.marital_status,
        nationality: proposal.nationality,
        sum_assured: parseFloat(proposal.sum_assured) || 0,
        premium: parseFloat(proposal.premium) || 0,
        existing_coverage: parseFloat(proposal.existing_coverage) || 0,
        has_term_rider: proposal.has_term_rider,
        height: parseFloat(proposal.height) || 0,
        weight: parseFloat(proposal.weight) || 0,
        bmi: parseFloat(proposal.bmi) || 0,
        has_weight_changed: proposal.has_weight_changed,
        residential_country: proposal.residential_country,
        business_country: proposal.business_country,
        has_medical_history: proposal.has_medical_history,
        is_adventurous: proposal.is_adventurous,
        family_meber_medical_history: proposal.family_meber_medical_history,
        is_pregnant: proposal.is_pregnant,
        pregnancy_weeks: parseInt(proposal.pregnancy_weeks) || 0,
        is_medical_report_generated: proposal.is_medical_report_generated,
        is_smoker: proposal.is_smoker,
        is_alcoholic: proposal.is_alcoholic,
        is_narcotic: proposal.is_narcotic,
        occupation_code: proposal.occupation_code || 'DEFAULT',
        occupation_class: proposal.occupation_class,
        pincode: proposal.pincode,
        occupation_risk: proposal.occupation_risk,
        aml_risk: proposal.aml_risk,
        is_hazardous: proposal.is_hazardous,
        is_negative_pincode: proposal.is_negative_pincode,
        is_pep: proposal.is_pep,
        is_criminally_convicted: proposal.is_criminally_convicted,
        is_ofac: proposal.is_ofac,
        special_class: proposal.special_class,
        // agent_code: proposal.agent_code || 'DEFAULT',
        // agent_tier: proposal.agent_tier,
        iib_status: proposal.iib_status,
        iib_score: parseInt(proposal.iib_score) || 0,
        is_iib_negative: proposal.is_iib_negative,
        is_la_new_to_iib: proposal.is_la_new_to_iib,
        fgli_policy_statuses: proposal.fgli_policy_statuses,
        is_la_proposer_same: proposal.is_la_proposer_same,
        is_corporate_proposer: proposal.is_corporate_proposer,
        la_proposer_relation: proposal.la_proposer_relation,
        nominee_relation: proposal.nominee_relation,
        agent_code: proposal.agent_code,
        agent_tier: proposal.agent_tier,
        risk_category: proposal.risk_category,
        cigarettes_per_day: proposal.is_smoker ? (parseInt(proposal.cigarettes_per_day) || null) : null,
        smoking_years: proposal.is_smoker ? (parseInt(proposal.smoking_years) || null) : null,
        alcohol_type: proposal.is_alcoholic ? proposal.alcohol_type : null,
        alcohol_quantity: proposal.is_alcoholic ? (parseInt(proposal.alcohol_quantity) || null) : null,
        ailment_type: proposal.has_medical_history ? proposal.ailment_type : null,
        ailment_details: proposal.has_medical_history ? proposal.ailment_details : null,
        ailment_duration_years: proposal.has_medical_history ? (parseInt(proposal.ailment_duration_years) || null) : null,
        is_ailment_ongoing: proposal.has_medical_history ? proposal.is_ailment_ongoing : false,
        tobacco_quantity: 0,
        liquor_type: proposal.is_alcoholic ? proposal.alcohol_type.length > 1 ? 2 : 1 : null,
        hard_liquor_quantity: 0,
        beer_quantity: 0,
        wine_quantity: 0,
      };

      const response = await evaluateProposal(proposalData);
      setResult(response.data);

      if (response.data.stp_decision === 'PASS') {
        toast.success('Proposal passed STP');
      } else {
        toast.error('Proposal failed STP');
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast.error('Failed to evaluate proposal');
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = useCallback(() => {
    setProposal(getEmptyProposal());
    setResult(null);
  }, []);

  const toggleTrace = useCallback((ruleId) => {
    setTraceExpanded(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleFgliPolicyStatusChange = useCallback((value) => {
    setProposal((prev) => {
      const exists = prev.fgli_policy_statuses.includes(value);
      return {
        ...prev,
        fgli_policy_statuses: exists
          ? prev.fgli_policy_statuses.filter((item) => item !== value)
          : [...prev.fgli_policy_statuses, value],
      };
    });
  }, []);

  const [isLocked, setIsLocked] = useState({
    category: (typeof category !== "undefined" && category) || false,
    code: (typeof code !== "undefined" && code) || false,
    occ_class: (typeof occ_class !== "undefined" && occ_class) || false,
    occ_hazardus: (typeof occ_hazardus !== "undefined" && occ_hazardus) || false,
    prop_type: (typeof prop_type !== "undefined" && prop_type) || false,
    is_la_prop_same: (typeof is_la_prop_same !== "undefined" && is_la_prop_same) || false,
  });

  // Ailment options memoized
  const ailmentOptions = useMemo(() => [
    { value: "1", label: "Overweight" },
    { value: "2", label: "Underweight" },
    { value: "3", label: "Dwarfism" },
    { value: "4", label: "Gigantism" },
    { value: "5", label: "Elevated Blood Pressure" },
    { value: "6", label: "High Blood Pressure" },
    { value: "7", label: "ECG findings" },
    { value: "8", label: "Stress ECG findings" },
    { value: "9", label: "Hypertension" },
    { value: "10", label: "History of Heart Disease" },
    { value: "11", label: "Heart attack" },
    { value: "12", label: "Coronary Angioplasty/ CABG" },
    { value: "13", label: "High Blood Pressure and Protein" },
    { value: "14", label: "Elevated Blood Sugar" },
    { value: "15", label: "Glycosuria" },
    { value: "16", label: "Diabetes Mellitis" },
    { value: "17", label: "Diabetes Insipidus" },
    { value: "18", label: "Ele.Blood Sugar(DM)/Proteinuria" },
    { value: "19", label: "Gestational Diabetes" },
    { value: "20", label: "Diabetes & Blood Pressure" },
    { value: "21", label: "Asthma" },
    { value: "22", label: "Bronchitis" },
    { value: "23", label: "Chronic Obstructive Pulmonary" },
    { value: "24", label: "Respiratory disorder" },
    { value: "25", label: "Lung surgery" },
    { value: "26", label: "Pneumonia" },
    { value: "27", label: "Chest X ray findings" },
    { value: "28", label: "Serum Lipid Profile values" },
    { value: "29", label: "Blood profile test values" },
    { value: "30", label: "Anaemia" },
    { value: "31", label: "Low Haemoglobin" },
    { value: "32", label: "Lymphatic system disorder" },
    { value: "33", label: "Hormonal Disorder" },
    { value: "34", label: "Hyperthyroidism" },
    { value: "35", label: "Hypothyroidism" },
    { value: "36", label: "Neurological disorder" },
    { value: "37", label: "Meningitis" },
    { value: "38", label: "Psychological Disorder" },
    { value: "39", label: "Migraine Disorders" },
    { value: "40", label: "Epilepsy" },
    { value: "41", label: "Paralysis" },
    { value: "42", label: "Parkinsonian Disorders" },
    { value: "43", label: "Kidney disorder" },
    { value: "44", label: "Renal Function test values" },
    { value: "45", label: "Renal calculus" },
    { value: "46", label: "Renal failure" },
    { value: "47", label: "Urinary Tract Infection" },
    { value: "48", label: "Routine urine test findings" },
    { value: "49", label: "Proteinuria" },
    { value: "50", label: "Hematuria" },
    { value: "other", label: "Other" },
  ], []);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="evaluation-console-page">
      <Header title="Evaluation Console" subtitle="Test proposals against the rule engine" />

      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white">
                <CardTitle className="text-lg font-semibold text-slate-800">Proposal Data</CardTitle>
                <Button variant="outline" size="sm" onClick={handleReset} data-testid="reset-btn" className="text-slate-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-2 bg-slate-50/50">

                {/* // ================= SECTION 1: Basic Info ================= */}
                <Section
                  title="1 · Basic Info"
                  isOpen={openSections.includes("section1")}
                  onToggle={() => toggleSection("section1")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 text-sm">Proposal ID</Label>
                      <Input
                        type="text"
                        name="proposal_id"
                        value={proposal.proposal_id}
                        onChange={handleInputChange}
                        className="mt-1.5 font-mono text-sm"
                        data-testid="proposal-id-input"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Product Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.product_type}
                        onValueChange={(v) => handleFieldChange('product_type', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="product-type-select">
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_TYPES.filter(p => !p.isParent).map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.parent ? `↳ ${p.label}` : p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Product Category <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.product_category}
                        onValueChange={(v) => handleFieldChange('product_category', v)}
                        disabled={isLocked.category}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="product-category-select">
                          <SelectValue placeholder="Select product category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Product Code <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.product_code}
                        onValueChange={(v) => handleFieldChange('product_code', v)}
                        disabled={isLocked.code}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="product-code-select">
                          <SelectValue placeholder="Select product code" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CODES.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Payment Mode <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.payment_mode}
                        onValueChange={(v) => handleFieldChange('payment_mode', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="payment-mode-select">
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_MODE.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Mode of Purchase <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.purchase_mode}
                        onValueChange={(v) => handleFieldChange('purchase_mode', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="purchase-mode-select">
                          <SelectValue placeholder="Select purchase mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODEOFPURCHES.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Policy Term (yrs) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="policy_term"
                        value={proposal.policy_term}
                        onChange={handleInputChange}
                        className="mt-1.5 font-mono text-sm"
                        data-testid="policy-term-input"
                        placeholder="e.g.,10"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Premium Payment Term (yrs) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="ppt"
                        value={proposal.ppt}
                        onChange={handleInputChange}
                        className="mt-1.5 font-mono text-sm"
                        data-testid="ppt-input"
                        placeholder="e.g.,5"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Policy Number</Label>
                      <Input
                        type="number"
                        name="policy_number"
                        value={proposal.policy_number}
                        onChange={handleInputChange}
                        className="mt-1.5 font-mono text-sm"
                        data-testid="policy-number-input"
                        placeholder="e.g.1000001"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <Switch
                        checked={proposal.has_term_rider}
                        onCheckedChange={(checked) => handleFieldChange('has_term_rider', checked)}
                        data-testid="has-term-rider-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Has Term Rider</Label>
                    </div>
                  </div>
                </Section>

                {/* // ================= SECTION 2: Life Assured ================= */}
                <Section
                  title="2 · Life Assured"
                  isOpen={openSections.includes("section2")}
                  onToggle={() => toggleSection("section2")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 text-sm">Age <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="applicant_age"
                        value={proposal.applicant_age}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 35"
                        data-testid="applicant-age-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Gender <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.applicant_gender}
                        onValueChange={(v) => handleFieldChange('applicant_gender', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="gender-select">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                    <div>
                      <Label className="text-slate-600 text-sm">Marital Status <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.marital_status}
                        onValueChange={(v) => handleFieldChange('marital_status', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="marital-status-select">
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          {MARITAL_STATUSES.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Nationality <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.nationality}
                        onValueChange={(v) => handleFieldChange('nationality', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="nationality-select">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIONALITY.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Residential Country</Label>
                      <Select
                        value={proposal.residential_country}
                        onValueChange={(v) => handleFieldChange('residential_country', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="residential-country-select">
                          <SelectValue placeholder="Select residential country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Substandard">Substandard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Business Country</Label>
                      <Input
                        type="text"
                        name="business_country"
                        value={proposal.business_country}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g. USA (optional)"
                        data-testid="business-country-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">PinCode <span className="text-red-500">*</span></Label>
                      <Input
                        type="text"
                        name="pincode"
                        value={proposal.pincode}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g. 400001"
                        data-testid="pincode-input"
                      />
                    </div>
                  </div>
                </Section>

                {/* // ================= SECTION 3: Financial Details ================= */}
                <Section
                  title="3 · Financial Details"
                  isOpen={openSections.includes("section3")}
                  onToggle={() => toggleSection("section3")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 text-sm">LA Annual Income (INR) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="applicant_income"
                        value={proposal.applicant_income}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 50000"
                        data-testid="applicant-income-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Proposer Income (INR) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="proposer_income"
                        value={proposal.proposer_income}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 50000"
                        data-testid="proposer-income-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Sum Assured (INR) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="sum_assured"
                        value={proposal.sum_assured}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 5000000"
                        data-testid="sum-assured-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Premium (INR) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="premium"
                        value={proposal.premium}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 25000"
                        data-testid="premium-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">APE (INR)</Label>
                      <Input
                        type="number"
                        name="ape"
                        value={proposal.ape}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 1200000"
                        data-testid="ape-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Existing Coverage (INR) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="existing_coverage"
                        value={proposal.existing_coverage}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 1200000"
                        data-testid="existing-coverage-input"
                      />
                    </div>
                  </div>
                </Section>

                {/* // ================= SECTION 4 : Build (Physical Measurements) ================= */}
                <Section
                  title="4 · Build (Physical Measurements)"
                  isOpen={openSections.includes("section4")}
                  onToggle={() => toggleSection("section4")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-slate-600 text-sm">Height (cm) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        step="0.1"
                        name="height"
                        value={proposal.height}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 170"
                        data-testid="height-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Weight (kg) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={proposal.weight}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g., 70"
                        data-testid="weight-input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">BMI (auto-calculated)</Label>
                      <Input
                        type="text"
                        value={proposal.bmi ? `${proposal.bmi} kg/m²` : ""}
                        readOnly
                        className="mt-1.5 bg-slate-100 cursor-not-allowed"
                        placeholder="Enter height & weight"
                        data-testid="bmi-input"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <Switch
                        checked={proposal.has_weight_changed}
                        onCheckedChange={(checked) => handleFieldChange('has_weight_changed', checked)}
                        data-testid="has-weight-changed-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Weight Changed?</Label>
                    </div>
                  </div>
                </Section>
                {/* // ================= SECTION 5 : Education & Occupation ================= */}
                <Section
                  title="5 · Education & Occupation"
                  isOpen={openSections.includes("section5")}
                  onToggle={() => toggleSection("section5")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 text-sm">Qualification <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.qualification}
                        onValueChange={(v) => handleFieldChange('qualification', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="qualification-select">
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALIFICATIONS.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Occupation <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.occupation}
                        onValueChange={(v) => handleFieldChange('occupation', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="occupation-select">
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                        <SelectContent>
                          {OCCUPATIONS.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* <div>
                      <Label className="text-slate-600 text-sm">Occupation Code</Label>
                      <Input
                        type="text"
                        name="occupation_code"
                        value={proposal.occupation_code}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder="e.g. OCC001"
                        data-testid="occupation-code-input"
                      />
                    </div> */}
                    <div>
                      <Label className="text-slate-600 text-sm">Occupation Class</Label>
                      <Select
                        value={proposal.occupation_class}
                        onValueChange={(v) => handleFieldChange('occupation_class', v)}
                        disabled={isLocked.occ_class}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="occupation-class-select">
                          <SelectValue placeholder="Select occupation class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class1">Class 1 (Low Risk)</SelectItem>
                          <SelectItem value="class2">Class 2</SelectItem>
                          <SelectItem value="class3">Class 3</SelectItem>
                          <SelectItem value="class4">Class 4 (High Risk)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>



                    {/* <div></div> */}
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_hazardous}
                        onCheckedChange={(checked) => handleFieldChange('is_hazardous', checked)}
                        data-testid="is-hazardous-switch"
                        disabled={isLocked.occ_hazardus}
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Is Hazardous Occupation</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_negative_pincode}
                        onCheckedChange={(checked) => handleFieldChange('is_negative_pincode', checked)}
                        data-testid="is-negative-pincode-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Is Negative Pincode</Label>
                    </div>
                  </div>
                </Section>
                {/* // ================= SECTION 6 : Lifestyle Habits ================= */}
                <Section
                  title="6 · Lifestyle Habits"
                  isOpen={openSections.includes("section6")}
                  onToggle={() => toggleSection("section6")}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.is_smoker}
                          onCheckedChange={(checked) => {
                            setProposal(prev => ({
                              ...prev,
                              is_smoker: checked,
                              cigarettes_per_day: checked ? prev.cigarettes_per_day || '' : null,
                              smoking_years: checked ? prev.smoking_years || '' : null
                            }));
                          }}
                          data-testid="is-smoker-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">Smoker</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.is_alcoholic}
                          onCheckedChange={(checked) => {
                            setProposal(prev => ({
                              ...prev,
                              is_alcoholic: checked,
                              alcohol_type: checked ? prev.alcohol_type || '' : null,
                              alcohol_quantity: checked ? prev.alcohol_quantity || '' : null
                            }));
                          }}
                          data-testid="is-alcoholic-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">Alcoholic</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.is_narcotic}
                          onCheckedChange={(checked) => handleFieldChange('is_narcotic', checked)}
                          data-testid="is-narcotic-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">Narcotic</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.is_adventurous}
                          onCheckedChange={(checked) => handleFieldChange('is_adventurous', checked)}
                          data-testid="is-adventurous-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">Adventurous Activities</Label>
                      </div>
                    </div>

                    {/* Conditional: Smoker Details */}
                    {proposal.is_smoker && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h5 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Smoking Details (Required)
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-600 text-sm">Cigarettes per Day <span className="text-red-500">*</span></Label>
                            <Input
                              type="number"
                              min="1"
                              name="cigarettes_per_day"
                              value={proposal.cigarettes_per_day || ''}
                              onChange={handleInputChange}
                              className="mt-1.5 bg-white"
                              placeholder="e.g., 10"
                              data-testid="cigarettes-input"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-600 text-sm">Years of Smoking <span className="text-red-500">*</span></Label>
                            <Input
                              type="number"
                              min="1"
                              name="smoking_years"
                              value={proposal.smoking_years || ''}
                              onChange={handleInputChange}
                              className="mt-1.5 bg-white"
                              placeholder="e.g., 5"
                              data-testid="smoking-years-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conditional: Alcoholic Details */}
                    {proposal.is_alcoholic && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <h5 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Alcohol Details (Required)
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-600 text-sm">Alcohol Type<span className="text-red-500">*</span></Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="mt-1.5 w-full justify-between font-normal h-10 px-3"
                                  data-testid="alcohol-type-select"

                                >
                                  <span className="truncate">
                                    {proposal.alcohol_type.length > 0
                                      ? proposal.alcohol_type
                                        .map(val => {
                                          const item = ALCOHOL_TYPE.find(p => p.value === val);
                                          return item ? item.label : val;
                                        })
                                        .join(', ')
                                      : 'Select alcohol type'}
                                  </span>
                                  {proposal.alcohol_type.length > 0 && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      {proposal.alcohol_type.length}
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[320px] p-3" align="start">
                                <div className="max-h-64 overflow-auto space-y-2">
                                  {ALCOHOL_TYPE.filter(p => !p.isParent).map(p => (
                                    <div
                                      key={p.value}
                                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                                      onClick={() => {
                                        const exists = proposal.alcohol_type.includes(p.value);
                                        setProposal(prev => ({
                                          ...prev,
                                          alcohol_type: exists
                                            ? prev.alcohol_type.filter(item => item !== p.value)
                                            : [...prev.alcohol_type, p.value],
                                        }));
                                      }}
                                    >
                                      <Checkbox
                                        checked={proposal.alcohol_type.includes(p.value)}
                                      />
                                      <span className="text-sm text-slate-700">{p.label}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-2 border-t border-slate-200 flex gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3"
                                    onClick={() => setProposal(prev => ({ ...prev, alcohol_type: [] }))}
                                  >
                                    Clear All
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {/* <div>
                            <Label className="text-slate-600 text-sm">Alcohol Type <span className="text-red-500">*</span></Label>
                            <Select
                              value={proposal.alcohol_type || ''}
                              onValueChange={(v) => handleFieldChange('alcohol_type', v)}
                            >
                              <SelectTrigger className="mt-1.5 bg-white" data-testid="alcohol-type-select">
                                <SelectValue placeholder="Select alcohol type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hardliquor">Hard Liquor</SelectItem>
                                <SelectItem value="wine">Wine</SelectItem>
                                <SelectItem value="beer">Beer</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}
                          <div>
                            <Label className="text-slate-600 text-sm">Quantity (ml) <span className="text-red-500">*</span></Label>
                            <Input
                              type="number"
                              min="1"
                              name="alcohol_quantity"
                              value={proposal.alcohol_quantity || ''}
                              onChange={handleInputChange}
                              className="mt-1.5 bg-white"
                              placeholder="e.g., 60"
                              data-testid="alcohol-quantity-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                {/* // ================= SECTION 5 : Residential Status ================= */}
                {/* <Section
                  title="5 · Residential Status"
                  isOpen={openSections.includes("section5")}
                  onToggle={() => toggleSection("section5")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  </div>
                </Section> */}

                {/* // ================= SECTION 7 : Health & Medical History ================= */}
                <Section
                  title="7 · Health & Medical History"
                  isOpen={openSections.includes("section7")}
                  onToggle={() => toggleSection("section7")}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.has_medical_history}
                          onCheckedChange={(checked) => {
                            setProposal(prev => ({
                              ...prev,
                              has_medical_history: checked,
                              ailment_type: checked ? prev.ailment_type || '' : null,
                              ailment_duration_years: checked ? prev.ailment_duration_years || '' : null,
                              is_ailment_ongoing: checked ? prev.is_ailment_ongoing : false
                            }));
                          }}
                          data-testid="has-medical-history-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">Has Medical History</Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.family_meber_medical_history}
                          onCheckedChange={(checked) => handleFieldChange('family_meber_medical_history', checked)}
                          data-testid="family-meber-medical-history-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">2+ Family Members with Medical History</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={proposal.is_pregnant}
                          onCheckedChange={(checked) => handleFieldChange('is_pregnant', checked)}
                          data-testid="is-pregnant-switch"
                        />
                        <Label className="text-slate-600 text-sm cursor-pointer">Is Pregnant</Label>
                      </div>

                    </div>

                    {/* Conditional: Medical History Details - min-height prevents layout shift */}
                    {proposal.has_medical_history && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                        <h5 className="text-sm font-semibold text-rose-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Medical History Details (Required)
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-600 text-sm">Ailment Type <span className="text-red-500">*</span></Label>
                            <Select
                              value={proposal.ailment_type || ''}
                              onValueChange={(v) => handleFieldChange('ailment_type', v)}
                            >
                              <SelectTrigger className="mt-1.5 bg-white" data-testid="ailment-type-select">
                                <SelectValue placeholder="Select ailment" />
                              </SelectTrigger>
                              <SelectContent>
                                {ailmentOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-slate-600 text-sm">Duration (Years) <span className="text-red-500">*</span></Label>
                            <Input
                              type="number"
                              min="0"
                              name="ailment_duration_years"
                              value={proposal.ailment_duration_years || ''}
                              onChange={handleInputChange}
                              className="mt-1.5 bg-white"
                              placeholder="Years since diagnosis"
                              data-testid="ailment-duration-input"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <Switch
                            checked={proposal.is_ailment_ongoing}
                            onCheckedChange={(checked) => handleFieldChange('is_ailment_ongoing', checked)}
                            data-testid="is-ailment-ongoing-switch"
                          />
                          <Label className="text-slate-600 text-sm cursor-pointer">Is the condition ongoing/current?</Label>
                        </div>
                        {proposal.ailment_type === 'other' && (
                          <div className="mt-3">
                            <Label className="text-slate-600 text-sm">Ailment Details</Label>
                            <Input
                              name="ailment_details"
                              value={proposal.ailment_details || ''}
                              onChange={handleInputChange}
                              className="mt-1.5 bg-white"
                              placeholder="Please specify the ailment"
                              data-testid="ailment-details-input"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Section>

                {/* ================= SECTION 8: IIB Check ================= */}
                <Section
                  title="8 · IIB Check"
                  isOpen={openSections.includes("section8")}
                  onToggle={() => toggleSection("section8")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* IIB Status */}
                    <div>
                      <Label className="text-slate-600 text-sm">IIB Status</Label>
                      <Select value={proposal.iib_status}
                        onValueChange={(v) => handleFieldChange('iib_status', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="iib-status-select">
                          <SelectValue placeholder="Select IIB status" />
                        </SelectTrigger>
                        <SelectContent>
                          {IIB_STATUSES.filter(p => !p.isParent).map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* IIB Score */}
                    <div>
                      <Label className="text-slate-600 text-sm">IIB Score</Label>
                      <Input
                        type="number"
                        name="iib_score"
                        value={proposal.iib_score}
                        onChange={handleInputChange}
                        className="mt-1.5"
                        placeholder=""
                        data-testid="iib-score-input"
                      />
                    </div>

                    {/* FGLI Policy Statuses - MULTI SELECT */}
                    <div>
                      <Label className="text-slate-600 text-sm">FGLI Policy Statuses</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1.5 w-full justify-between font-normal h-10 px-3"
                            data-testid="fgli-Policy-Statuses-select"
                          >
                            <span className="truncate">
                              {proposal.fgli_policy_statuses.length > 0
                                ? proposal.fgli_policy_statuses
                                  .map(val => {
                                    const item = PREVIOUS_POLICY_STATUS.find(p => p.value === val);
                                    return item ? item.label : val;
                                  })
                                  .join(', ')
                                : 'Select fgli policy status'}
                            </span>
                            {proposal.fgli_policy_statuses.length > 0 && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {proposal.fgli_policy_statuses.length}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-3" align="start">
                          <div className="max-h-64 overflow-auto space-y-2">
                            {PREVIOUS_POLICY_STATUS.filter(p => !p.isParent).map(p => (
                              <div
                                key={p.value}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                                onClick={() => {
                                  const exists = proposal.fgli_policy_statuses.includes(p.value);
                                  setProposal(prev => ({
                                    ...prev,
                                    fgli_policy_statuses: exists
                                      ? prev.fgli_policy_statuses.filter(item => item !== p.value)
                                      : [...prev.fgli_policy_statuses, p.value],
                                  }));
                                }}
                              >
                                <Checkbox
                                  checked={proposal.fgli_policy_statuses.includes(p.value)}
                                />
                                <span className="text-sm text-slate-700">{p.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-2 border-t border-slate-200 flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3"
                              onClick={() => setProposal(prev => ({ ...prev, fgli_policy_statuses: [] }))}
                            >
                              Clear All
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Is IIB Negative */}
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_iib_negative}
                        onCheckedChange={checked => handleFieldChange('is_iib_negative', checked)}
                        data-testid="is-iib-negative-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Is IIB Negative</Label>
                    </div>

                    {/* LA is new to IIB */}
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_la_new_to_iib}
                        onCheckedChange={checked => handleFieldChange('is_la_new_to_iib', checked)}
                        data-testid="is-la-new-to-iib-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">LA is new to IIB</Label>
                    </div>
                  </div>
                </Section>

                {/* // ================= SECTION 9 : Relationship & Nominee ================= */}
                <Section
                  title="9 · Relationship & Nominee"
                  isOpen={openSections.includes("section9")}
                  onToggle={() => toggleSection("section9")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_la_proposer_same}
                        onCheckedChange={(checked) => handleFieldChange('is_la_proposer_same', checked)}
                        data-testid="is-la-proposer-same-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">LA is Proposer?</Label>
                    </div>
                    {/* <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_corporate_proposer}
                        onCheckedChange={(checked) => handleFieldChange('is_corporate_proposer', checked)}
                        data-testid="is-corporate-proposer-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Corporate Proposer</Label>
                    </div> */}
                    <div>
                      <Label className="text-slate-600 text-sm">Proposer Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.proposer_type}
                        onValueChange={(v) => handleFieldChange('proposer_type', v)}
                        disabled={isLocked.prop_type}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="proposer-type-select">
                          <SelectValue placeholder="Select proposer type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPOSER_TYPE && PROPOSER_TYPE.filter(p => !p.isParent).map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">LA Proposer Relation</Label>
                      <Select
                        value={proposal.la_proposer_relation}
                        onValueChange={(v) => handleFieldChange('la_proposer_relation', v)}
                        disabled={isLocked.is_la_prop_same}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="la-proposer-relation-select">
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {LA_PROPOSER && LA_PROPOSER.filter(p => !p.isParent).map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Nominee Relation <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.nominee_relation}
                        onValueChange={(v) => handleFieldChange('nominee_relation', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="nominee-relation-select">
                          <SelectValue placeholder="Select nominee relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOMINEE_RELATION && NOMINEE_RELATION.filter(p => !p.isParent).map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Special Class <span className="text-red-500">*</span></Label>
                      <Select
                        value={proposal.special_class}
                        onValueChange={(v) => handleFieldChange('special_class', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="special-class-select">
                          <SelectValue placeholder="Select special class" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIAL_CLASS && SPECIAL_CLASS.filter(p => !p.isParent).map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Section>

                {/* // ================= SECTION 10 : Risk & Compliance ================= */}
                <Section
                  title="10 · Risk & Compliance"
                  isOpen={openSections.includes("section10")}
                  onToggle={() => toggleSection("section10")}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 text-sm">AML Category</Label>
                      <Select
                        value={proposal.aml_risk}
                        onValueChange={(v) => handleFieldChange('aml_risk', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="aml-risk-select">
                          <SelectValue placeholder="Select aml level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Risk Category</Label>
                      <Select
                        value={proposal.risk_category}
                        onValueChange={(v) => handleFieldChange('risk_category', v)}
                      >
                        <SelectTrigger className="mt-1.5" data-testid="risk-category-select">
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_pep}
                        onCheckedChange={(checked) => handleFieldChange('is_pep', checked)}
                        data-testid="is-pep-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Is PEP</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_criminally_convicted}
                        onCheckedChange={(checked) => handleFieldChange('is_criminally_convicted', checked)}
                        data-testid="is-criminally-convicted-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Is Criminally Convicted</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_ofac}
                        onCheckedChange={(checked) => handleFieldChange('is_ofac', checked)}
                        data-testid="is-ofac-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">OFAC Listed</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={proposal.is_medical_report_generated}
                        onCheckedChange={(checked) => handleFieldChange('is_medical_report_generated', checked)}
                        data-testid="is-medical-report-generated-switch"
                      />
                      <Label className="text-slate-600 text-sm cursor-pointer">Medical Report Generated</Label>
                    </div>
                  </div>
                </Section>

                {/* Evaluate Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                    data-testid="evaluate-btn"
                  >
                    {evaluating ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Evaluate Proposal
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Decision Summary */}
                <Card className={`border-2 ${result.stp_decision === 'PASS' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 uppercase">STP Decision</p>
                        <div className="flex items-center gap-3 mt-2">
                          {result.stp_decision === 'PASS' ? (
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                          ) : (
                            <XCircle className="w-10 h-10 text-red-600" />
                          )}
                          <span className={`text-4xl font-bold ${result.stp_decision === 'PASS' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {result.stp_decision}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {result.evaluation_time_ms?.toFixed(2)} ms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card className="border-slate-200" data-testid="result-details-card">
                  <CardHeader>
                    <CardTitle>Evaluation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500">Case Type</p>
                        <div className="mt-1">
                          <CaseTypeBadge caseType={result.case_type} label={result.case_type_label} />
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500">Scorecard Value</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{result.scorecard_value}</p>
                      </div>
                    </div>

                    {/* Risk Loading / Premium Adjustment */}
                    {result.risk_loading && (
                      <Card className="border-purple-200 bg-purple-50/50" data-testid="risk-loading-card">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2 text-purple-800">
                            <TrendingUp className="w-5 h-5" />
                            Premium Loading Calculation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-white rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-600">Base Premium</p>
                              <p className="text-lg font-bold text-slate-900">
                                {formatCurrency(result.risk_loading.base_premium)}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-600">Loaded Premium</p>
                              <p className="text-lg font-bold text-purple-700">
                                {formatCurrency(result.risk_loading.loaded_premium)}
                                {result.risk_loading.total_loading_percentage !== 0 && (
                                  <span className={`ml-2 text-sm font-normal ${result.risk_loading.total_loading_percentage > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    ({result.risk_loading.total_loading_percentage > 0 ? '+' : ''}{result.risk_loading.total_loading_percentage}%)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-purple-700">Total Risk Score</span>
                            <span className="font-semibold">{result.risk_loading.total_risk_score} pts</span>
                          </div>

                          {result.risk_loading.applied_bands?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Applied Risk Bands</p>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {result.risk_loading.applied_bands.map((band, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-purple-100 text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${band.category === 'age' ? 'bg-blue-100 text-blue-700' :
                                        band.category === 'smoking' ? 'bg-amber-100 text-amber-700' :
                                          band.category === 'medical' ? 'bg-rose-100 text-rose-700' :
                                            band.category === 'bmi' ? 'bg-green-100 text-green-700' :
                                              band.category === 'height' ? 'bg-blue-100 text-blue-700' :
                                                band.category === 'weight' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-slate-100 text-slate-700'
                                        }`}>
                                        {band.category}
                                      </span>
                                      <span className="text-slate-700">{band.band_name}</span>
                                    </div>
                                    <span className={`font-medium ${band.loading_percentage > 0 ? 'text-red-600' :
                                      band.loading_percentage < 0 ? 'text-green-600' : 'text-slate-600'
                                      }`}>
                                      {band.loading_percentage > 0 ? '+' : ''}{band.loading_percentage}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Triggered Rules */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Triggered Rules ({result.triggered_rules?.length || 0})
                      </h4>
                      {result.triggered_rules?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.triggered_rules.map((rule, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No rules triggered</p>
                      )}
                    </div>

                    {/* Validation Errors */}
                    {result.validation_errors?.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Validation Errors
                        </h4>
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {result.validation_errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reason Messages */}
                    {result.reason_messages?.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Reason Messages</h4>
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                          {result.reason_messages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stage Execution Trace */}
                {result.stage_trace?.length > 0 && (
                  <Card className="border-slate-200" data-testid="stage-trace-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Stage Execution Flow
                        <span className="text-sm font-normal text-slate-500">
                          ({result.stage_trace.length} stages)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.stage_trace.map((stage, idx) => (
                          <div
                            key={stage.stage_id}
                            className={`relative p-4 rounded-lg border ${stage.status === 'passed' ? 'bg-emerald-50 border-emerald-200' :
                              stage.status === 'failed' ? 'bg-red-50 border-red-200' :
                                'bg-slate-50 border-slate-200 opacity-50'
                              }`}
                            data-testid={`stage-trace-${idx}`}
                          >
                            {/* Stage connector line */}
                            {idx < result.stage_trace.length - 1 && (
                              <div className="absolute left-8 top-full h-3 w-0.5 bg-slate-300 z-10" />
                            )}

                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {/* Status icon */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${stage.status === 'passed' ? 'bg-emerald-600' :
                                  stage.status === 'failed' ? 'bg-red-600' :
                                    'bg-slate-400'
                                  }`}>
                                  {stage.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                  {stage.status === 'failed' && <XCircle className="w-4 h-4 text-white" />}
                                  {stage.status === 'skipped' && <span className="text-white text-xs font-bold">-</span>}
                                </div>

                                <div>
                                  <h4 className="font-semibold text-slate-900">{stage.stage_name}</h4>
                                  <p className="text-sm text-slate-600 mt-0.5">
                                    {stage.rules_executed?.length || 0} rules evaluated
                                    {stage.triggered_rules_count > 0 && (
                                      <span className="text-amber-600 ml-2">
                                        ({stage.triggered_rules_count} triggered)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase ${stage.status === 'passed' ? 'bg-emerald-200 text-emerald-800' :
                                  stage.status === 'failed' ? 'bg-red-200 text-red-800' :
                                    'bg-slate-200 text-slate-600'
                                  }`}>
                                  {stage.status}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">
                                  {stage.execution_time_ms?.toFixed(2)} ms
                                </p>
                              </div>
                            </div>

                            {/* Show triggered rules in stage */}
                            {stage.triggered_rules_count > 0 && stage.rules_executed && (
                              <div className="mt-3 pl-9 border-l-2 border-slate-200">
                                {stage.rules_executed.filter(r => r.triggered).map((rule, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-2 py-1 text-sm">
                                    <CheckCircle2 className="w-3 h-3 text-amber-500" />
                                    <span className="font-medium text-slate-700">{rule.rule_name}</span>
                                    <CategoryBadge category={rule.category} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rule Trace */}
                <Card className="border-slate-200" data-testid="rule-trace-card">
                  <CardHeader>
                    <CardTitle>Rule Execution Trace</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[900px] overflow-y-auto pr-2">
                      <div className="space-y-2">
                        {result.rule_trace?.map((trace, idx) => (
                          <Collapsible key={idx} open={traceExpanded[trace.rule_id]}>
                            <CollapsibleTrigger
                              onClick={() => toggleTrace(trace.rule_id)}
                              className={`w-full p-3 rounded-lg border text-left transition-colors ${trace.triggered
                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                }`}
                              data-testid={`trace-item-${idx}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {traceExpanded[trace.rule_id] ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                  <span className="font-medium text-slate-900">{trace.rule_name}</span>
                                  <CategoryBadge category={trace.category} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">
                                    {trace.execution_time_ms?.toFixed(2)} ms
                                  </span>
                                  {trace.triggered ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase">Input Values</p>
                                    <pre className="mt-1 text-xs font-mono bg-slate-50 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(trace.input_values, null, 2)}
                                    </pre>
                                  </div>
                                  {trace.action_applied && (
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase">Action Applied</p>
                                      <pre className="mt-1 text-xs font-mono bg-slate-50 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(trace.action_applied, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-slate-200 border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Evaluation Yet</h3>
                  <p className="text-sm text-slate-500">
                    Fill in the proposal data and click "Evaluate Proposal" to see results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default EvaluationConsole;