import { useForm } from "react-hook-form"
import { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
} from "lucide-react"

import api from "../lib/api"

// shadcn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

// ================= CONSTANTS =================

const FOLLOW_UP_DESCRIPTIONS = {
  MPN: "Physical MER",
  MCE: "CBC & ESR",
  WGN: "Gynaecologist Report",
  TGQ: "Transgender Questionnaire",
  IPR: "Income Proof",
  NCM: "Exit/Entry Details",
  NDN: "PIO Proof",
  QNR: "NRI Questionnaire",
  QSQ: "Smoker Questionnaire",
  QAL: "Alcohol Questionnaire",
  QHM: "HUF Addendum",
  KNM: "PAN Card",
  MWP: "MWP Addendum",
  QEM: "EE Annexure",
  QKN: "Keyman Questionnaire",
}

const QUALIFICATIONS = [
  { value: "Q01", label: "Q01 – Illiterate" },
  { value: "Q02", label: "Q02 – Up to 5th Std" },
  { value: "Q03", label: "Q03 – Up to 10th Std" },
  { value: "Q04", label: "Q04 – 12th / Intermediate" },
  { value: "Q05", label: "Q05 – Graduate" },
  { value: "Q06", label: "Q06 – Post Graduate" },
]

const IIB_STATUSES = [
  { value: "", label: "Not Set" },
  { value: "matched", label: "Matched" },
  { value: "not_matched", label: "Not Matched" },
  { value: "pending", label: "Pending" },
]

// ================= DEFAULT FORM =================

const DEFAULT_FORM = {
  proposal_id: '',
  product_code: '',
  product_type: "term_life",
  product_category: 'life',
  payment_mode: 'A',
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

// ================= UI HELPERS =================

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

// ? Text Input
function TextInput({ name, value, onChange, readOnly, type = "text", placeholder, min, max, step, }) {
  return (
    <Input
      className="input"
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
    />
  )
}

// ? Select Input (IMPORTANT FIX)
function SelectInput({ name, value, onChange, children }) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(val) =>
        onChange({ target: { name, value: val } })
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>

      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}

// ? Checkbox Input (IMPORTANT FIX)
function CheckboxInput({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={(val) =>
          onChange({ target: { name, checked: !!val, type: "checkbox" } })
        }
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}

// ================= RESULT PANEL =================


function ResultPanel({ result, onReset }) {
  const isPass = result.stp_decision === "PASS"

  return (
    <Card className={`mt-6 border-2 ${isPass ? "border-green-400" : "border-red-400"}`}>
      <CardHeader className="flex justify-between">
        <div className="flex gap-3 items-center">
          {isPass ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />}
          <div>
            <div className="text-xl font-bold">{result.stp_decision}</div>
            <div className="text-sm text-gray-500">{result.case_type_label}</div>
          </div>
        </div>

        <Button variant="secondary" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* FOLLOW UPS */}
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
                    <TooltipContent>
                      {FOLLOW_UP_DESCRIPTIONS[code]}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* RULE TRACE */}
        {result.rule_trace?.length > 0 && (
          <div>
            <div className="font-medium mb-2">Rule Trace</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Triggered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rule_trace.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.rule_name}</TableCell>
                    <TableCell>{r.triggered ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================= MAIN =================

export default function Evaluate() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // BMI AUTO CALC
  useEffect(() => {
    const h = parseFloat(form.height)
    const w = parseFloat(form.weight)

    if (h > 0 && w > 0) {
      const bmi = (w / Math.pow(h / 100, 2)).toFixed(1)
      setForm((f) => ({ ...f, bmi }))
    }
  }, [form.height, form.weight])

  const handleChange = useCallback((name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.evaluate(form)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Evaluate Proposal</h1>

      <form onSubmit={handleSubmit}>

        {/* ALL 11 SECTIONS — FULLY INCLUDED */}
        <Section title="1 · Basic Info" defaultOpen>
          {/* <Field label="Proposal ID">
            <Input value={form.proposal_id} onChange={(e) => handleChange("proposal_id", e.target.value)} />
          </Field> */}

          <Field label="Proposal ID">
            <TextInput name="proposal_id" value={form.proposal_id} onChange={handleChange} placeholder="Auto-generated if blank" />
          </Field>

          {/* <Field label="Product Type">
            <Select value={form.product_type} onValueChange={(v) => handleChange("product_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <option value="term_life">Term Life</option>
                <option value="endowment">Endowment</option>
                <option value="ulip">ULIP</option>
                <option value="health">Health</option>
              </SelectContent>
            </Select>
          </Field> */}
          <Field label="Product Type">
            <SelectInput name="product_type" value={form.product_type} onChange={handleChange}>
              <option value="term_life">Term Life</option>
              <option value="endowment">Endowment</option>
              <option value="ulip">ULIP</option>
              <option value="health">Health</option>
            </SelectInput>
          </Field>

          {/* <Field label="Product Category">
            <Select value={form.product_category} onValueChange={(v) => handleChange("product_category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <option value="life">Life</option>
                <option value="health">Health</option>
                <option value="savings">Savings</option>
                <option value="investment">Investment</option>
              </SelectContent>
            </Select>
          </Field> */}
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
              <option value="A">Annual</option>
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

        {/* // ================= SECTION 2 ================= */}
        <Section title="2 · Applicant Details" defaultOpen>
          <Field label="Age">
            <TextInput name="applicant_age" value={form.applicant_age} onChange={handleChange} type="number" />
          </Field>

          <Field label="Gender">
            <SelectInput name="applicant_gender" value={form.applicant_gender} onChange={handleChange}>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
            </SelectInput>
          </Field>

          <Field label="Annual Income">
            <TextInput name="applicant_income" value={form.applicant_income} onChange={handleChange} type="number" />
          </Field>

          <Field label="Proposer Income">
            <TextInput name="proposer_income" value={form.proposer_income} onChange={handleChange} type="number" />
          </Field>

          <Field label="Qualification">
            <SelectInput name="qualification" value={form.qualification} onChange={handleChange}>
              {QUALIFICATIONS.map((q) => (
                <SelectItem key={q.value} value={q.value}>
                  {q.label}
                </SelectItem>
              ))}
            </SelectInput>
          </Field>

          <Field label="Marital Status">
            <SelectInput name="marital_status" value={form.marital_status} onChange={handleChange}>
              <SelectItem value="S">Single</SelectItem>
              <SelectItem value="M">Married</SelectItem>
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

        {/* // ================= SECTION 3 ================= */}
        <Section title="3 · Coverage" defaultOpen>
          <Field label="Sum Assured">
            <TextInput name="sum_assured" value={form.sum_assured} onChange={handleChange} type="number" />
          </Field>

          <Field label="Premium">
            <TextInput name="premium" value={form.premium} onChange={handleChange} type="number" />
          </Field>

          <Field label="Existing Coverage">
            <TextInput name="existing_coverage" value={form.existing_coverage} onChange={handleChange} type="number" />
          </Field>

          <Field label="Term Rider">
            <CheckboxInput
              name="has_term_rider"
              checked={form.has_term_rider}
              onChange={handleChange}
              label="Term Rider attached"
            />
          </Field>
        </Section>

        {/* // ================= SECTION 4 ================= */}
        <Section title="4 · Build">
          <Field label="Height (cm)">
            <TextInput name="height" value={form.height} onChange={handleChange} type="number" min={0} step={0.1} placeholder="e.g. 170" />
          </Field>

          <Field label="Weight (kg)">
            <TextInput name="weight" value={form.weight} onChange={handleChange} type="number" min={0} step={0.1} placeholder="e.g. 70" />
          </Field>
          <Field label="BMI (auto-calculated)">
            <TextInput value={form.bmi ? `${form.bmi} kg/m²` : ""} readOnly className="input bg-gray-100 cursor-not-allowed" placeholder="Set height & weight" />
          </Field>

          {/* <Field label="BMI (auto-calculated)">
            <div className="flex items-center gap-2">
              <input
                // className="input bg-gray-50"
                type="text"
                value={form.bmi ? `${form.bmi} kg/m²` : ''}
                readOnly
                placeholder="Set height & weight"
              />
            </div>
          </Field> */}

          <Field label="Weight Changed">
            <CheckboxInput
              name="has_weight_changed"
              checked={form.has_weight_changed}
              onChange={handleChange}
              label="Significant weight change"
            />
          </Field>
        </Section>

        {/* // ================= SECTION 5 ================= */}
        <Section title="5 · Residential Status">
           <Field label="Residential Country">
            <SelectInput name="residential_country" value={form.residential_country} onChange={handleChange}>
              <option value="India">India</option>
              <option value="Standard">Standard</option>
              <option value="Substandard">Substandard</option>
            </SelectInput>
          </Field>

          <Field label="Business Country">
            <TextInput name="business_country" value={form.business_country} onChange={handleChange}  placeholder="e.g. USA (optional)" />
          </Field>
        </Section>

        {/* // ================= SECTION 6 ================= */}
        <Section title="6 · Health & Medical History">
          {/* <CheckboxInput name="has_medical_history" checked={form.has_medical_history} onChange={handleChange} label="Has Medical History" />
          <CheckboxInput name="is_adventurous" checked={form.is_adventurous} onChange={handleChange} label="Adventurous Activities" />
          <CheckboxInput name="family_medical_history_2_or_more" checked={form.family_medical_history_2_or_more} onChange={handleChange} label="Family History" />
          <CheckboxInput name="is_pregnant" checked={form.is_pregnant} onChange={handleChange} label="Pregnant" />
          <CheckboxInput name="is_medical_generated" checked={form.is_medical_generated} onChange={handleChange} label="Medical Report Generated" /> */}

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

        {/* // ================= SECTION 7 ================= */}
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

        {/* // ================= SECTION 8 ================= */}
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

        {/* // ================= SECTION 9 ================= */}
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

        {/* // ================= SECTION 10 ================= */}
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

        {/* // ================= SECTION 11 ================= */}
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
        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Evaluating..." : "Evaluate Proposal"}
            <Send className="ml-2 w-4 h-4" />
          </Button>

          <Button type="button" variant="secondary" onClick={() => setForm(DEFAULT_FORM)}>
            <RefreshCw className="mr-2 w-4 h-4" />
            Reset
          </Button>
        </div>

      </form>

      {result && <ResultPanel result={result} onReset={() => setResult(null)} />}

    </div>
  )
}