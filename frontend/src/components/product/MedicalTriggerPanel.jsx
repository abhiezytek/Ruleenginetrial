import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '../ui/tooltip';
import { Plus, Trash2, Stethoscope, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
export const TRIGGER_FIELDS = [
  { value: 'age',            label: 'Age (years)' },
  { value: 'sum_assured',    label: 'Sum Assured (₹)' },
  { value: 'bmi',            label: 'BMI' },
  { value: 'annual_income',  label: 'Annual Income (₹)' },
  { value: 'premium',        label: 'Premium (₹)' },
  { value: 'policy_term',    label: 'Policy Term (years)' },
  { value: 'gender',         label: 'Gender' },
  { value: 'smoker_status',  label: 'Smoker Status' },
  { value: 'occupation_class', label: 'Occupation Class' },
  { value: 'product_type',   label: 'Product Type' },
];

export const OPERATORS = {
  numeric: [
    { value: 'gt',  label: '> Greater than' },
    { value: 'gte', label: '≥ Greater than or equal' },
    { value: 'lt',  label: '< Less than' },
    { value: 'lte', label: '≤ Less than or equal' },
    { value: 'eq',  label: '= Equals' },
    { value: 'between', label: 'Between (range)' },
  ],
  select: [
    { value: 'eq',  label: '= Equals' },
    { value: 'neq', label: '≠ Not equals' },
  ],
};

export const FIELD_VALUE_OPTIONS = {
  gender:           ['Male', 'Female', 'Other'],
  smoker_status:    ['Smoker', 'Non-Smoker', 'Ex-Smoker'],
  occupation_class: ['Class 1', 'Class 2', 'Class 3', 'Class 4'],
  product_type:     ['term_life', 'whole_life', 'ulip', 'endowment', 'annuity', 'health'],
};

export const MEDICAL_TESTS = [
  { value: 'blood_pressure',   label: 'Blood Pressure (BP)' },
  { value: 'blood_sugar',      label: 'Blood Sugar / HbA1c' },
  { value: 'ecg',              label: 'ECG (Electrocardiogram)' },
  { value: 'echo',             label: 'Echo / 2D Echo' },
  { value: 'lipid_profile',    label: 'Lipid Profile' },
  { value: 'liver_function',   label: 'Liver Function Test (LFT)' },
  { value: 'kidney_function',  label: 'Kidney Function Test (KFT)' },
  { value: 'cbc',              label: 'Complete Blood Count (CBC)' },
  { value: 'urine_analysis',   label: 'Urine Analysis / Routine' },
  { value: 'thyroid',          label: 'Thyroid Profile (T3/T4/TSH)' },
  { value: 'hiv',              label: 'HIV Test' },
  { value: 'hbsag',            label: 'HBsAg (Hepatitis B)' },
  { value: 'anti_hcv',         label: 'Anti-HCV (Hepatitis C)' },
  { value: 'chest_xray',       label: 'Chest X-Ray' },
  { value: 'pft',              label: 'Pulmonary Function Test (PFT)' },
  { value: 'stress_test',      label: 'Stress Test (TMT)' },
  { value: 'usg_abdomen',      label: 'USG Abdomen' },
  { value: 'psa',              label: 'PSA (Prostate, Males 40+)' },
  { value: 'creatinine',       label: 'Serum Creatinine' },
  { value: 'morph',            label: 'Medical Officer Report (MOR)' },
  { value: 'aml_report',       label: 'AML / Financial Report' },
];

const SELECT_TYPE_FIELDS = ['gender', 'smoker_status', 'occupation_class', 'product_type'];

const isSelectField = (field) => SELECT_TYPE_FIELDS.includes(field);

const getOperators = (field) =>
  isSelectField(field) ? OPERATORS.select : OPERATORS.numeric;

const EMPTY_TRIGGER = {
  id: null,
  field: '',
  operator: '',
  value: '',
  value_max: '',
  logic: 'AND',
  required_tests: [],
  is_enabled: true,
  notes: '',
};

let _id = 1;
const newId = () => `t_${_id++}`;

// ─── TestSelector ─────────────────────────────────────────────────────────────
const TestSelector = React.memo(function TestSelector({ selected, onChange }) {
  const toggle = (val) => {
    onChange(
      selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    );
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Required Medical Tests</Label>
      <div className="grid grid-cols-2 gap-1.5 pr-1">
        {MEDICAL_TESTS.map((t) => {
          const active = selected.includes(t.value);
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => toggle(t.value)}
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border hover:bg-muted/60 text-muted-foreground'
              )}
            >
              {active && <span className="mr-1">✓</span>}
              {t.label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 max-w-full">
          {selected.map((v) => {
            const t = MEDICAL_TESTS.find((x) => x.value === v);
            return (
              <Badge key={v} variant="secondary" className="text-xs gap-1">
                {t?.label || v}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
});

// ─── TriggerRow ───────────────────────────────────────────────────────────────
const TriggerRow = React.memo(function TriggerRow({ trigger, index, onChange, onRemove, isFirst }) {
  const ops = getOperators(trigger.field);
  const isSel = isSelectField(trigger.field);
  const isBetween = trigger.operator === 'between';
  const valueOptions = FIELD_VALUE_OPTIONS[trigger.field] || [];

  const update = (key) => (eOrVal) => {
    const val = typeof eOrVal === 'object' && eOrVal?.target ? eOrVal.target.value : eOrVal;
    onChange({ ...trigger, [key]: val });
  };

  return (
    <div className="rounded-lg border bg-background p-4 space-y-4">
      {/* header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Select value={trigger.logic} onValueChange={update('logic')}>
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Badge variant="outline" className="text-xs">Condition {index + 1}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Switch
              checked={!!trigger.is_enabled}
              onCheckedChange={update('is_enabled')}
              className="scale-75"
            />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* condition fields */}
      <div className={cn('grid gap-3', isBetween ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
        <div className="space-y-1.5">
          <Label className="text-xs">Field</Label>
          <Select value={trigger.field} onValueChange={(v) => onChange({ ...trigger, field: v, operator: '', value: '', value_max: '' })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_FIELDS.map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Operator</Label>
          <Select value={trigger.operator} onValueChange={update('operator')} disabled={!trigger.field}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {ops.map((op) => (
                <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">{isBetween ? 'From' : 'Value'}</Label>
          {isSel ? (
            <Select value={trigger.value} onValueChange={update('value')} disabled={!trigger.field}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {valueOptions.map((v) => (
                  <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="number" className="h-8 text-xs"
              placeholder="e.g. 45"
              value={trigger.value}
              onChange={update('value')}
            />
          )}
        </div>

        {isBetween && (
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="number" className="h-8 text-xs"
              placeholder="e.g. 60"
              value={trigger.value_max}
              onChange={update('value_max')}
            />
          </div>
        )}
      </div>

      {/* test selector */}
      <Separator />
      <TestSelector
        selected={trigger.required_tests}
        onChange={(tests) => onChange({ ...trigger, required_tests: tests })}
      />

      {/* notes */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
        <Input
          className="h-8 text-xs"
          placeholder="e.g. Required for SA > 50L"
          value={trigger.notes}
          onChange={update('notes')}
        />
      </div>
    </div>
  );
});

// ─── MedicalTriggerPanel ──────────────────────────────────────────────────────
const MedicalTriggerPanel = ({ triggers, onTriggersChange }) => {
  const addTrigger = useCallback(() => {
    onTriggersChange([
      ...triggers,
      { ...EMPTY_TRIGGER, id: newId() },
    ]);
  }, [triggers, onTriggersChange]);

  const updateTrigger = useCallback((idx, updated) => {
    const next = triggers.map((t, i) => (i === idx ? updated : t));
    onTriggersChange(next);
  }, [triggers, onTriggersChange]);

  const removeTrigger = useCallback((idx) => {
    onTriggersChange(triggers.filter((_, i) => i !== idx));
  }, [triggers, onTriggersChange]);

  const activeTriggers = triggers.filter((t) => t.is_enabled).length;
  const totalTests = [...new Set(triggers.flatMap((t) => t.required_tests))].length;

  return (
    <TooltipProvider>
      <div className="flex flex-col flex-grow overflow-y-auto space-y-4 p-4">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Medical Trigger Configuration</p>
              <p className="text-xs text-muted-foreground">
                Define conditions under which specific medical tests are required.
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Each trigger is a condition (e.g. Age &gt; 45) linked to a set of required tests.
                Multiple conditions can be combined with AND / OR logic.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            {triggers.length > 0 && (
              <div className="flex gap-1.5">
                <Badge variant="secondary" className="text-xs">{activeTriggers} active</Badge>
                <Badge variant="outline" className="text-xs">{totalTests} unique test{totalTests !== 1 ? 's' : ''}</Badge>
              </div>
            )}
            <Button type="button" variant="outline" size="sm" onClick={addTrigger}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Condition
            </Button>
          </div>
        </div>

        {/* main content */}
        {triggers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow rounded-lg border border-dashed py-10 text-center space-y-2">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No medical triggers configured</p>
            <p className="text-xs text-muted-foreground">
              Add conditions like Age &gt; 45 → ECG + Blood Sugar required
            </p>
            <Button type="button" variant="outline" size="sm" onClick={addTrigger}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add First Condition
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 h-[200px] overflow-y-auto flex flex-col">
            {triggers.map((trigger, idx) => (
              <TriggerRow
                key={trigger.id}
                trigger={trigger}
                index={idx}
                isFirst={idx === 0}
                onChange={(updated) => updateTrigger(idx, updated)}
                onRemove={() => removeTrigger(idx)}
              />
            ))}
          </div>
        )}

        {/* summary table */}
        {triggers.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground">Trigger Summary</p>
            <div className="space-y-1">
              {triggers.map((t, idx) => {
                const fieldLabel = TRIGGER_FIELDS.find((f) => f.value === t.field)?.label || t.field;
                const opLabel = [...OPERATORS.numeric, ...OPERATORS.select].find((o) => o.value === t.operator)?.label || t.operator;
                const testLabels = t.required_tests.map(
                  (v) => MEDICAL_TESTS.find((m) => m.value === v)?.label || v
                );
                return (
                  <div key={t.id} className={cn('flex items-start gap-2 text-xs', !t.is_enabled && 'opacity-40')}>
                    {idx > 0 && (
                      <Badge variant="outline" className="text-xs py-0 shrink-0">{t.logic}</Badge>
                    )}
                    <span className="text-muted-foreground shrink-0">
                      {fieldLabel} {opLabel}{t.operator === 'between' ? ` ${t.value} – ${t.value_max}` : ` ${t.value}`}
                    </span>
                    <span className="text-muted-foreground shrink-0">→</span>
                    <span className="font-medium flex flex-wrap gap-1">
                      {testLabels.length > 0
                        ? testLabels.map((tl) => <Badge key={tl} variant="secondary" className="text-xs py-0">{tl}</Badge>)
                        : <span className="text-destructive">No tests selected</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MedicalTriggerPanel;
