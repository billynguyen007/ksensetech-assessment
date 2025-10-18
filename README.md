# Patient Risk Assessment System

A Next.js-based web application that fetches patient data from an API, calculates risk scores based on vital signs, and identifies high-risk patients, fever cases, and data quality issues.

## Overview

This application is designed to help healthcare providers identify patients who require immediate attention by analyzing their vital signs and calculating risk scores. It processes patient data including age, blood pressure, and temperature to categorize patients into different risk levels.

## Features

- **Patient Data Fetching**: Automatically retrieves patient records from a paginated API with retry logic and rate limiting
- **Risk Score Calculation**: Calculates individual and total risk scores based on:
  - Blood pressure (BP) readings
  - Body temperature
  - Patient age
- **Patient Classification**:
  - High-risk patients (total risk score ≥ 4)
  - Fever patients (temperature ≥ 99.6°F)
  - Data quality issues (invalid or missing vital signs)
- **Assessment Submission**: Submits results to the API for validation and scoring
- **Real-time Feedback**: Displays detailed breakdown of results including strengths and areas for improvement
- **Dark Mode Support**: Fully responsive UI with dark mode compatibility

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **UI**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: Client-side rendering for interactive UI

## Project Structure

```
ksensetech-assessment/
├── app/
│   ├── page.tsx          # Main application UI and state management
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles and Tailwind imports
├── lib/
│   ├── api.ts            # API client with retry logic and rate limiting
│   └── riskScoring.ts    # Risk score calculation algorithms
├── types/
│   └── patient.ts        # TypeScript interfaces and types
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Risk Scoring Algorithm

### Blood Pressure Score
- **Normal** (Systolic <120 AND Diastolic <80): 0 points
- **Elevated** (Systolic 120-129 AND Diastolic <80): 1 point
- **Stage 1** (Systolic 130-139 OR Diastolic 80-89): 2 points
- **Stage 2** (Systolic ≥140 OR Diastolic ≥90): 3 points

### Temperature Score
- **Normal** (≤99.5°F): 0 points
- **Low Fever** (99.6-100.9°F): 1 point
- **High Fever** (≥101.0°F): 2 points

### Age Score
- **Under 40**: 0 points
- **40-65** (inclusive): 1 point
- **Over 65**: 2 points

### Classification Criteria
- **High-Risk Patient**: Total score ≥ 4 (only valid data)
- **Fever Patient**: Temperature ≥ 99.6°F
- **Data Quality Issue**: Any invalid or missing vital sign data

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ksensetech-assessment
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
```

## Usage

1. **Fetch & Process Patients**: Click the "Fetch & Process Patients" button to:
   - Retrieve all patient records from the API
   - Calculate risk scores for each patient
   - Classify patients into risk categories

2. **Review Results**: The dashboard displays:
   - Total number of patients processed
   - Count of high-risk patients
   - Count of fever patients
   - Count of data quality issues
   - Detailed lists of patient IDs in each category

3. **Submit Assessment**: Click "Submit Assessment" to:
   - Send the classification results to the API
   - Receive a detailed score breakdown
   - View feedback on accuracy and areas for improvement

## API Integration

The application connects to the KsenseTech Assessment API with the following features:

- **Retry Logic**: Automatically retries failed requests (up to 5 attempts)
- **Rate Limiting**: Handles 429 responses with exponential backoff
- **Error Handling**: Gracefully handles 500/503 server errors
- **Pagination**: Fetches all patient records across multiple pages

### API Endpoints

- `GET /api/patients`: Fetch paginated patient data
- `POST /api/submit-assessment`: Submit assessment results for validation

## Key Files

- [app/page.tsx](app/page.tsx) - Main UI component with state management
- [lib/api.ts](lib/api.ts) - API client with retry and rate limiting logic
- [lib/riskScoring.ts](lib/riskScoring.ts) - Risk calculation algorithms
- [types/patient.ts](types/patient.ts) - TypeScript type definitions

## Data Validation

The system validates all vital signs before calculating risk scores:

- **Blood Pressure**: Must be in "systolic/diastolic" format with valid numeric values
- **Temperature**: Must be a valid numeric value
- **Age**: Must be a valid numeric value

Patients with invalid data are flagged for data quality issues and excluded from high-risk calculations.

## License

Private - KsenseTech Assessment Project
