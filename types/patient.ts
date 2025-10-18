export interface Patient {
  patient_id: string;
  name: string;
  age: number | string | null | undefined;
  gender: string;
  blood_pressure: string;
  temperature: number | string | null | undefined;
  visit_date: string;
  diagnosis: string;
  medications: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Metadata {
  timestamp: string;
  version: string;
  requestId: string;
}

export interface PatientsResponse {
  data: Patient[];
  pagination: PaginationInfo;
  metadata: Metadata;
}

export interface RiskScore {
  patient_id: string;
  bp_score: number;
  temp_score: number;
  age_score: number;
  total_score: number;
  has_data_quality_issues: boolean;
}

export interface SubmissionPayload {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  results: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      fever: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      data_quality: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
    };
    feedback: {
      strengths: string[];
      issues: string[];
    };
    attempt_number: number;
    remaining_attempts: number;
    is_personal_best: boolean;
    can_resubmit: boolean;
  };
}
