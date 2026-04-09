// Rule Categories
export const RULE_CATEGORIES = [
  { value: 'stp_decision', label: 'STP Decision', description: 'STP Pass/Fail rules' },
  { value: 'case_type', label: 'Case Type', description: 'Case classification rules' },
  { value: 'reason_flag', label: 'Reason Flag', description: 'Reason flag rules' },
  { value: 'scorecard', label: 'Scorecard', description: 'Scorecard methodology rules' },
  { value: 'income_sa_grid', label: 'Income × SA Grid', description: 'Income vs Sum Assured rules' },
  { value: 'bmi_grid', label: 'BMI Grid', description: 'BMI-based rules' },
  { value: 'occupation', label: 'Occupation', description: 'Occupation risk rules' },
  { value: 'agent_channel', label: 'Agent & Channel', description: 'Agent/channel rules' },
  { value: 'address_pincode', label: 'Address/Pincode', description: 'Location-based rules' },
  { value: 'validation', label: 'Validation', description: 'Input validation rules' },
];

// Operators
export const OPERATORS = [
  { value: 'equals', label: 'Equals', symbol: '=' },
  { value: 'not_equals', label: 'Not Equals', symbol: '≠' },
  { value: 'greater_than', label: 'Greater Than', symbol: '>' },
  { value: 'less_than', label: 'Less Than', symbol: '<' },
  { value: 'greater_than_or_equal', label: 'Greater Than or Equal', symbol: '≥' },
  { value: 'less_than_or_equal', label: 'Less Than or Equal', symbol: '≤' },
  { value: 'in', label: 'In List', symbol: '∈' },
  { value: 'not_in', label: 'Not In List', symbol: '∉' },
  { value: 'between', label: 'Between', symbol: '↔' },
  { value: 'contains', label: 'Contains', symbol: '⊃' },
  { value: 'starts_with', label: 'Starts With', symbol: '^' },
  { value: 'is_empty', label: 'Is Empty', symbol: '∅' },
  { value: 'is_not_empty', label: 'Is Not Empty', symbol: '≠∅' },
];

// Logical Operators
export const LOGICAL_OPERATORS = [
  { value: 'AND', label: 'AND', description: 'All conditions must be true' },
  { value: 'OR', label: 'OR', description: 'At least one condition must be true' },
];

// Case Types
export const CASE_TYPES = [
  { value: 0, label: 'Normal Case', description: 'Standard underwriting' },
  { value: 1, label: 'Direct Accept', description: 'Auto-approved' },
  { value: -1, label: 'Direct Fail', description: 'Auto-declined' },
  { value: 3, label: 'GCRP Case', description: 'Referred for review' },
];

// Reason Flags
export const REASON_FLAGS = [
  { value: 1, label: 'STP Fail - Print Reason', description: 'Show reason to user' },
  { value: 0, label: 'STP Pass - Skip Print', description: 'No reason needed' },
  { value: -1, label: 'Not Provided', description: 'Status not set' },
];

// Product Types
export const PRODUCT_TYPES = [
  { value: 'term_life', label: 'Term Life (Parent)', color: 'blue', isParent: true },
  { value: 'term_pure', label: 'Pure Term', color: 'blue', parent: 'term_life' },
  { value: 'term_returns', label: 'Term with Returns', color: 'cyan', parent: 'term_life' },
  { value: 'endowment', label: 'Endowment', color: 'emerald' },
  { value: 'ulip', label: 'ULIP', color: 'purple' },
  { value: 'health', label: 'Health', color: 'red' },
];

// Product Category
export const PRODUCT_CATEGORIES = [
  { value: 'life', label: 'Life', color: 'blue' },
  { value: 'health', label: 'Health', color: 'purple' },
  { value: 'savings', label: 'Savings', color: 'cyan' },
  { value: 'investment', label: 'Investment', color: 'emerald' },
  // { value: 'ulip', label: 'ULIP', color: 'purple' },
  // { value: 'health', label: 'Health', color: 'red' },
];

// PAYMENT MODE
export const PAYMENT_MODE = [
  { value: 'monthly', label: 'Monthly', color: 'blue' },
  { value: 'quarterly', label: 'Quarterly', color: 'purple' },
  { value: 'half_yearly', label: 'Half Yearly', color: 'cyan' },
  { value: 'annual', label: 'Annual', color: 'emerald' },
  // { value: 'ulip', label: 'ULIP', color: 'purple' },
  // { value: 'health', label: 'Health', color: 'red' },
];

// Mode of Purchase
export const MODEOFPURCHES = [
  { value: 'online', label: 'Online', color: 'blue' },
  { value: 'physical', label: 'Physical', color: 'purple' },
  { value: 'amex', label: 'Half Amex', color: 'cyan' }
];

// Gender
export const GENDER = [
  { value: 'M', label: 'Male', color: 'blue' },
  { value: 'F', label: 'Female', color: 'purple' },
  { value: 'O', label: 'Other', color: 'cyan' }
];


export const FOLLOW_UP_DESCRIPTIONS = {
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
};

export const QUALIFICATIONS = [
  { value: "Q01", label: "Q01 – Illiterate" },
  { value: "Q02", label: "Q02 – Literate" },
  { value: "Q03", label: "Q03 – Primary" },
  { value: "Q04", label: "Q04 – Middle" },
  { value: "Q05", label: "Q05 – Below SSC" },
  { value: "Q06", label: "Q06 – SSC not completed" },
  { value: "Q07", label: "Q07 – SSC" },
  { value: "Q08", label: "Q08 – HSC" },
  { value: "Q09", label: "Q09 – Diploma/ITI" },
  { value: "Q10", label: "Q10 – Graduate" },
  { value: "Q11", label: "Q11 – Postgraduate" },
  { value: "Q12", label: "Q12 – Professional" },
  { value: "Q13", label: "Q13 – No formal education" },
];
export const PREVIOUS_POLICY_STATUS = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "lapsed", label: "Lapsed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "renewed", label: "Renewed" },
  { value: "not_renewed", label: "Not Renewed" },
  { value: "under_process", label: "Under Process" },
  { value: "rejected", label: "Rejected" },
  { value: "claimed", label: "Claimed" },
  { value: "no_previous_policy", label: "No Previous Policy" }
];
export const ALCOHOL_TYPE = [
  { value: "hardliquor", label: "Hard Liquor" },
  { value: "wine", label: "Wine" },
  { value: "beer", label: "Beer" },
  { value: "other", label: "Other" }
];
export const PROPOSER_TYPE = [
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "trust", label: "Trust" },
  { value: "huf", label: "HUF" },
  { value: "employer_employee", label: "Employer-Employee" },
  { value: "keyman", label: "Keyman" },
  { value: "mwp", label: "MWP" },
  { value: "other", label: "Other" }
];


export const OCCUPATIONS = [
  { value: "OCC001", label: "Student" },
  { value: "OCC002", label: "Housewife / Homemaker" },
  { value: "OCC003", label: "Salaried Office Employee" },
  { value: "OCC004", label: "Teacher / Lecturer / Professor" },
  { value: "OCC005", label: "Chartered Accountant / Auditor" },
  { value: "OCC006", label: "Software Engineer / IT Professional" },
  { value: "OCC007", label: "Doctor / Dentist (clinic-based)" },
  { value: "OCC008", label: "Lawyer" },
  { value: "OCC009", label: "Business Owner / Trader" },
  { value: "OCC010", label: "Sales Executive (field travel)" },
  { value: "OCC011", label: "Factory Supervisor" },
  { value: "OCC012", label: "Electrician" },
  { value: "OCC013", label: "Mechanic / Technician" },
  { value: "OCC014", label: "Commercial Driver" },
  { value: "OCC015", label: "Delivery Rider / Courier Rider" },
  { value: "OCC016", label: "Construction Worker" },
  { value: "OCC017", label: "Miner / Driller" },
  { value: "OCC018", label: "Offshore Oil & Gas Worker" },
  { value: "OCC019", label: "Firefighter" },
  { value: "OCC020", label: "Police" },
  { value: "OCC021", label: "Armed Forces / Military" },
  { value: "OCC022", label: "Pilot / Aircrew" },
  { value: "OCC023", label: "Armed Security Guard" },
  { value: "OCC024", label: "Factory Labor / Machine Operator" },
  { value: "OCC025", label: "Agricultural Field Laborer" },
  { value: "OCC026", label: "Fisherman / Seafarer" },
];

export const IIB_STATUSES = [
  { value: "NA", label: "Not Set" },
  { value: "matched", label: "Matched" },
  { value: "not_matched", label: "Not Matched" },
  { value: "pending", label: "Pending" },
]

export const MARITAL_STATUSES = [
  { value: "S", label: "Single" },
  { value: "M", label: "Married" },
  { value: "W", label: "Widow" },
  { value: "D", label: "Divorced" },
  { value: "SP", label: "Separated" },
  { value: "O", label: "Other" },
]

export const NATIONALITY = [
  { value: "Indian", label: "Indian" },
  { value: "NRI", label: "NRI" },
  { value: "PIO", label: "PIO" },
  { value: "OCI", label: "OCI" },
  { value: "FN", label: "FN" },
]

export const PRODUCT_CODES = [
  { value: "E97", label: "E97" },
  { value: "E98", label: "E98" },
  { value: "E83;", label: "E83" },
  { value: "E91", label: "E91" },
  { value: "E92", label: "E92" },
  { value: "U52", label: "U52" },
  { value: "TERM001", label: "TERM001" },
  { value: "TERM002", label: "TERM002" },
  { value: "TERM003", label: "TERM003" },
  { value: "ULIP001", label: "ULIP001" },
  { value: "ENDOW001", label: "ENDOW001" },
  { value: "HLTH001", label: "HLTH001" },
]

export const PRODUCT_MAPPING = [
  { type: "term_life", category: "life", code: "TERM001" },
  { type: "term_pure", category: "life", code: "TERM002" },
  { type: "term_returns", category: "life", code: "TERM003" },
  { type: "endowment", category: "savings", code: "ENDOW001" },
  { type: "ulip", category: "investment", code: "ULIP001" },
  { type: "health", category: "health", code: "HLTH001" },
]

export const OCCUPATION_MAPPING = [
  { occupationCode: "OCC001", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC002", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC003", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC004", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC005", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC006", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC007", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC008", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC009", ishazardous: false, occupationclass: "class1" },
  { occupationCode: "OCC010", ishazardous: false, occupationclass: "class2" },
  { occupationCode: "OCC011", ishazardous: true, occupationclass: "class2" },
  { occupationCode: "OCC012", ishazardous: true, occupationclass: "class3" },
  { occupationCode: "OCC013", ishazardous: true, occupationclass: "class3" },
  { occupationCode: "OCC014", ishazardous: true, occupationclass: "class3" },
  { occupationCode: "OCC015", ishazardous: true, occupationclass: "class3" },
  { occupationCode: "OCC016", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC017", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC018", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC019", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC020", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC021", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC022", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC023", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC024", ishazardous: true, occupationclass: "class4" },
  { occupationCode: "OCC025", ishazardous: true, occupationclass: "class3" },
  { occupationCode: "OCC026", ishazardous: true, occupationclass: "class4" }
];

export const LA_PROPOSER = [
  { value: "self", label: "Self" },
  { value: "husband", label: "Husband" },
  { value: "wife", label: "Wife" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "grandfather", label: "Grandfather" },
  { value: "grandmother", label: "Grandmother" },
  { value: "grandson", label: "Grandson" },
  { value: "granddaughter", label: "Granddaughter" },
  { value: "other", label: "Other" },
]

export const NOMINEE_RELATION = [
  { value: "husband", label: "Husband" },
  { value: "wife", label: "Wife" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "grandfather", label: "Grandfather" },
  { value: "grandmother", label: "Grandmother" },
  { value: "grandson", label: "Grandson" },
  { value: "granddaughter", label: "Granddaughter" },
  { value: "other", label: "Other" },
]

export const SPECIAL_CLASS = [
  { value: "none_ordinary", label: "None/Ordinary" },
  { value: "huf", label: "HUF" },
  { value: "mwp", label: "MWP" },
  { value: "employer_employee", label: "Employer-Employee" },
  { value: "keyman_insurance", label: "Keyman Insurance" },
]

// Available Fields for Conditions
export const AVAILABLE_FIELDS = [
  { value: 'applicant_age', label: 'Applicant Age', type: 'number' },
  { value: 'applicant_gender', label: 'Applicant Gender', type: 'string' },
  { value: 'applicant_income', label: 'Applicant Income', type: 'number' },
  { value: 'sum_assured', label: 'Sum Assured', type: 'number' },
  { value: 'premium', label: 'Premium', type: 'number' },
  { value: 'bmi', label: 'BMI', type: 'number' },
  { value: 'occupation_code', label: 'Occupation Code', type: 'string' },
  { value: 'occupation_risk', label: 'Occupation Risk', type: 'string' },
  { value: 'agent_code', label: 'Agent Code', type: 'string' },
  { value: 'agent_tier', label: 'Agent Tier', type: 'string' },
  { value: 'pincode', label: 'Pincode', type: 'string' },
  { value: 'is_smoker', label: 'Is Smoker', type: 'boolean' },
  { value: 'has_medical_history', label: 'Has Medical History', type: 'boolean' },
  { value: 'existing_coverage', label: 'Existing Coverage', type: 'number' },
  { value: 'product_type', label: 'Product Type', type: 'string' },
  { value: 'is_criminally_convicted', label: 'Is Criminally Convicted', type: 'boolean' },
  { value: 'is_adventurous', label: 'Is Adventurous', type: 'boolean' },
  { value: 'aml_risk', label: 'AML Category', type: 'string' },
  { value: 'is_narcotic', label: 'Is Narcotic', type: 'boolean' },
  { value: 'height', label: 'Height', type: 'number' },
  { value: 'qualification', label: 'Qualification', type: 'string' },
  { value: 'mode', label: 'Mode', type: 'string' },
  { value: 'is_alcoholic', label: 'Is Alcoholic', type: 'boolean' },
  { value: 'liquor_type', label: 'Liquor Type', type: 'number' },
  { value: 'is_occupationHazardous', label: 'Is OccupationHazardous', type: 'boolean' },
  { value: 'product_category', label: 'Product Category', type: 'string' },
  { value: 'product_code', label: 'Product Code', type: 'string' },
  { value: 'payment_mode', label: 'Payment Mode', type: 'string' },
  { value: 'purchase_mode', label: 'Purchase Mode', type: 'string' },
  { value: 'policy_term', label: 'Policy Term', type: 'number' },
  { value: 'ppt', label: 'PPT', type: 'number' },
  { value: 'policy_number', label: 'Policy Number', type: 'number' },
  { value: 'proposer_income', label: 'Proposer Income', type: 'number' },
  { value: 'marital_status', label: 'Marital Status', type: 'string' },
  { value: 'nationality', label: 'Nationality', type: 'string' },
  { value: 'ape', label: 'APE', type: 'number' },
  { value: 'has_term_rider', label: 'Has Term Rider', type: 'boolean' },
  { value: 'weight', label: 'Weight', type: 'number' },
  { value: 'has_weight_changed', label: 'Has Weight Changed', type: 'boolean' },
  { value: 'residential_country', label: 'Residential Country', type: 'string' },
  { value: 'business_country', label: 'Business Country', type: 'string' },
  { value: 'family_meber_medical_history', label: 'Family Meber Medical History', type: 'boolean' },
  { value: 'is_pregnant', label: 'Is Pregnant', type: 'boolean' },
  { value: 'pregnancy_weeks', label: 'Pregnancy Weeks', type: 'number' },
  { value: 'is_medical_report_generated', label: 'Is MedicalReport Generated', type: 'boolean' },
  { value: 'is_alcoholic', label: 'Is Alcoholic', type: 'boolean' },
  { value: 'Occupation', label: 'Occupation', type: 'string' },
  { value: 'occupation_class', label: 'Occupation Class', type: 'string' },
  { value: 'is_hazardous', label: 'Is Hazardous Occupation', type: 'boolean' },
  { value: 'is_negative_pincode', label: 'Is Negative Pincode', type: 'boolean' },
  { value: 'is_pep', label: 'Is PEP', type: 'boolean' },
  { value: 'is_ofac', label: 'Is OFAC', type: 'boolean' },
  { value: 'special_class', label: 'Special Class', type: 'string' },
  { value: 'iib_status', label: 'IIB Status', type: 'string' },
  { value: 'iib_score', label: 'IIB Score', type: 'number' },
  { value: 'is_iib_negative', label: 'Is IIB Negative', type: 'boolean' },
  { value: 'is_la_new_to_iib', label: 'Is_LA New To IIB', type: 'boolean' },
  { value: 'fgli_policy_statuses', label: 'FGLI Policy Statuses', type: 'string' },
  { value: 'is_la_proposer_same', label: 'Is LA Proposer Same', type: 'boolean' },
  { value: 'is_corporate_proposer', label: 'Is Corporate Proposer', type: 'boolean' },
  { value: 'la_proposer_relation', label: 'LA Proposer Relation', type: 'string' },
  { value: 'nominee_relation', label: 'Nominee Relation', type: 'string' },
  { value: 'risk_category', label: 'Risk Category', type: 'boolean' },
  { value: 'maturity_age', label: 'Maturity Age', type: 'number' },

  // Conditional fields (dependent on parent questions)
  { value: 'cigarettes_per_day', label: 'Cigarettes per Day', type: 'number', dependsOn: 'is_smoker' },
  { value: 'smoking_years', label: 'Smoking Years', type: 'number', dependsOn: 'is_smoker' },
  { value: 'ailment_type', label: 'Ailment Type', type: 'string', dependsOn: 'has_medical_history' },
  { value: 'ailment_details', label: 'Ailment Details', type: 'string', dependsOn: 'has_medical_history' },
  { value: 'ailment_duration_years', label: 'Ailment Duration (Years)', type: 'number', dependsOn: 'has_medical_history' },
  { value: 'is_ailment_ongoing', label: 'Is Ailment Ongoing', type: 'boolean', dependsOn: 'has_medical_history' },
  { value: 'alcohol_type', label: 'Alcohol Type', type: 'string', dependsOn: 'is_alcoholic' },
  { value: 'alcohol_quantity', label: 'Alcohol Quantity', type: 'number', dependsOn: 'is_alcoholic' },
];

// Grid Types
export const GRID_TYPES = [
  { value: 'bmi', label: 'BMI Grid', description: 'BMI-based risk assessment' },
  { value: 'income_sa', label: 'Income × SA Grid', description: 'Income vs Sum Assured eligibility' },
  { value: 'occupation', label: 'Occupation Grid', description: 'Occupation risk categorization' },
  { value: 'medical', label: 'Medical Grid', description: 'Medical risk categorization' },
  { value: 'financial', label: 'Financial Grid', description: 'Financial risk categorization' },
];

// Grid Results
export const GRID_RESULTS = [
  { value: 'ACCEPT', label: 'Accept', color: 'emerald' },
  { value: 'DECLINE', label: 'Decline', color: 'red' },
  { value: 'REFER', label: 'Refer', color: 'amber' },
];

// Priority Levels
export const PRIORITY_LEVELS = [
  { min: 1, max: 25, label: 'Critical', color: 'red' },
  { min: 26, max: 50, label: 'High', color: 'orange' },
  { min: 51, max: 75, label: 'Medium', color: 'amber' },
  { min: 76, max: 100, label: 'Normal', color: 'slate' },
];

// Format helpers
export const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)} K`;
  }
  return `₹${value}`;
};

export const getCategoryColor = (category) => {
  const colors = {
    stp_decision: 'blue',
    case_type: 'purple',
    validation: 'amber',
    scorecard: 'emerald',
    income_sa_grid: 'cyan',
    bmi_grid: 'rose',
    occupation: 'indigo',
    agent_channel: 'orange',
    address_pincode: 'teal',
    reason_flag: 'slate',
  };
  return colors[category] || 'slate';
};

export const getPriorityLevel = (priority) => {
  return PRIORITY_LEVELS.find(level => priority >= level.min && priority <= level.max) || PRIORITY_LEVELS[3];
};
