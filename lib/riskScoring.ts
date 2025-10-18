import { Patient, RiskScore } from '@/types/patient';

// Helper function to check if a value is valid and numeric
function isValidNumber(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  // Check for non-numeric strings
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || isNaN(Number(trimmed))) {
      return false;
    }
    // Check for strings like "TEMP_ERROR", "invalid", "unknown", etc.
    if (!/^-?\d+\.?\d*$/.test(trimmed)) {
      return false;
    }
  }

  return !isNaN(Number(value));
}

// Calculate Blood Pressure Risk Score
function calculateBPScore(bp: string): { score: number; isValid: boolean } {
  if (!bp || typeof bp !== 'string') {
    return { score: 0, isValid: false };
  }

  const parts = bp.split('/');

  // Check if BP format is valid (must have both systolic and diastolic)
  if (parts.length !== 2) {
    return { score: 0, isValid: false };
  }

  const systolic = parts[0]?.trim();
  const diastolic = parts[1]?.trim();

  // Check if both values are present and numeric
  if (!systolic || !diastolic || !isValidNumber(systolic) || !isValidNumber(diastolic)) {
    return { score: 0, isValid: false };
  }

  const systolicNum = parseFloat(systolic);
  const diastolicNum = parseFloat(diastolic);

  // Additional validation - check for reasonable BP ranges
  if (isNaN(systolicNum) || isNaN(diastolicNum)) {
    return { score: 0, isValid: false };
  }

  // Normal: Systolic <120 AND Diastolic <80
  if (systolicNum < 120 && diastolicNum < 80) {
    return { score: 0, isValid: true };
  }

  // Elevated: Systolic 120-129 AND Diastolic <80
  if (systolicNum >= 120 && systolicNum <= 129 && diastolicNum < 80) {
    return { score: 1, isValid: true };
  }

  // Stage 1: Systolic 130-139 OR Diastolic 80-89
  if ((systolicNum >= 130 && systolicNum <= 139) || (diastolicNum >= 80 && diastolicNum <= 89)) {
    return { score: 2, isValid: true };
  }

  // Stage 2: Systolic ≥140 OR Diastolic ≥90
  if (systolicNum >= 140 || diastolicNum >= 90) {
    return { score: 3, isValid: true };
  }

  return { score: 0, isValid: true };
}

// Calculate Temperature Risk Score
function calculateTempScore(temp: any): { score: number; isValid: boolean } {
  if (!isValidNumber(temp)) {
    return { score: 0, isValid: false };
  }

  const tempNum = parseFloat(String(temp));

  if (isNaN(tempNum)) {
    return { score: 0, isValid: false };
  }

  // Normal (≤99.5°F): 0 points
  if (tempNum <= 99.5) {
    return { score: 0, isValid: true };
  }

  // Low Fever (99.6-100.9°F): 1 point
  if (tempNum >= 99.6 && tempNum <= 100.9) {
    return { score: 1, isValid: true };
  }

  // High Fever (≥101.0°F): 2 points
  if (tempNum >= 101.0) {
    return { score: 2, isValid: true };
  }

  return { score: 0, isValid: true };
}

// Calculate Age Risk Score
function calculateAgeScore(age: any): { score: number; isValid: boolean } {
  if (!isValidNumber(age)) {
    return { score: 0, isValid: false };
  }

  const ageNum = parseFloat(String(age));

  if (isNaN(ageNum)) {
    return { score: 0, isValid: false };
  }

  // Under 40: 0 points
  if (ageNum < 40) {
    return { score: 0, isValid: true };
  }

  // 40-65 (inclusive): 1 point
  if (ageNum >= 40 && ageNum <= 65) {
    return { score: 1, isValid: true };
  }

  // Over 65: 2 points
  if (ageNum > 65) {
    return { score: 2, isValid: true };
  }

  return { score: 0, isValid: true };
}

// Calculate risk score for a single patient
export function calculatePatientRisk(patient: Patient): RiskScore {
  const bpResult = calculateBPScore(patient.blood_pressure);
  const tempResult = calculateTempScore(patient.temperature);
  const ageResult = calculateAgeScore(patient.age);

  const hasDataQualityIssues = !bpResult.isValid || !tempResult.isValid || !ageResult.isValid;

  return {
    patient_id: patient.patient_id,
    bp_score: bpResult.score,
    temp_score: tempResult.score,
    age_score: ageResult.score,
    total_score: bpResult.score + tempResult.score + ageResult.score,
    has_data_quality_issues: hasDataQualityIssues,
  };
}

// Process all patients and generate alert lists
export function processPatients(patients: Patient[]) {
  const riskScores: RiskScore[] = [];
  const highRiskPatients: string[] = [];
  const feverPatients: string[] = [];
  const dataQualityIssues: string[] = [];

  for (const patient of patients) {
    const riskScore = calculatePatientRisk(patient);
    riskScores.push(riskScore);

    // High-risk patients: total risk score ≥ 4
    if (!riskScore.has_data_quality_issues && riskScore.total_score >= 4) {
      highRiskPatients.push(patient.patient_id);
    }

    // Fever patients: temperature ≥ 99.6°F
    const temp = parseFloat(String(patient.temperature));
    if (!isNaN(temp) && temp >= 99.6) {
      feverPatients.push(patient.patient_id);
    }

    // Data quality issues
    if (riskScore.has_data_quality_issues) {
      dataQualityIssues.push(patient.patient_id);
    }
  }

  return {
    riskScores,
    highRiskPatients,
    feverPatients,
    dataQualityIssues,
  };
}
