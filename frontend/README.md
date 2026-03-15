# Insurance STP Rule Engine — Frontend

React + Vite + Tailwind CSS frontend for the Insurance STP Rule Engine backend API.

## Setup

```bash
npm install
cp .env.example .env          # edit VITE_API_URL if backend is not on localhost:5115
npm run dev                   # starts dev server on http://localhost:5173
```

## Build

```bash
npm run build                 # outputs to dist/
npm run preview               # preview the production build
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | **Dashboard** — stats cards (rules, templates, evaluations, pass rate) + recent evaluations table |
| `/evaluate` | **Evaluate Proposal** — 11-section accordion form with all STP fields; inline results panel |
| `/history` | **Evaluation History** — table with letter flags, follow-up codes; click to expand details |
| `/rules` | **Rules** — all 95 seeded STP rules with search, category filter, enable toggle |
| `/templates` | **Templates** — all 95 STP rule templates grouped by rule ID range |

## Key Features

- **Auto-BMI calculation** from height + weight
- **Conditional fields** (pregnancy weeks appear only when `is_pregnant=true`, smoker details only when `is_smoker=true`, etc.)
- **Letter Flag display** — `O` (orange, Offer/RUW referral) and `L` (blue, Loading/requirement letter)
- **Follow-Up Code display** — purple monospace badges with descriptions (MPN=Physical MER, MCE=CBC & ESR, WGN=Gynaecologist Report, IPR=Income Proof, NCM=Exit/Entry Details, etc.)
- **Rule Trace accordion** — expandable per-rule triggered/not-triggered breakdown
- **Vite dev proxy** for `/api` → backend so CORS is not needed in development
- API base URL configurable via `VITE_API_URL` environment variable
