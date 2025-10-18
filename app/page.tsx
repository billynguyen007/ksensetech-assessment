'use client';

import { useState } from 'react';
import { fetchAllPatients, submitAssessment } from '@/lib/api';
import { processPatients } from '@/lib/riskScoring';
import { Patient, SubmissionResponse } from '@/types/patient';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [highRiskPatients, setHighRiskPatients] = useState<string[]>([]);
  const [feverPatients, setFeverPatients] = useState<string[]>([]);
  const [dataQualityIssues, setDataQualityIssues] = useState<string[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleFetchAndProcess = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    setSubmissionResult(null);

    try {
      addLog('Starting to fetch patients...');
      const fetchedPatients = await fetchAllPatients();
      setPatients(fetchedPatients);
      addLog(`Fetched ${fetchedPatients.length} patients successfully`);

      addLog('Processing patient data and calculating risk scores...');
      const results = processPatients(fetchedPatients);

      setHighRiskPatients(results.highRiskPatients);
      setFeverPatients(results.feverPatients);
      setDataQualityIssues(results.dataQualityIssues);

      addLog(`High-risk patients: ${results.highRiskPatients.length}`);
      addLog(`Fever patients: ${results.feverPatients.length}`);
      addLog(`Data quality issues: ${results.dataQualityIssues.length}`);
      addLog('Processing completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`ERROR: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (highRiskPatients.length === 0 && feverPatients.length === 0 && dataQualityIssues.length === 0) {
      setError('No data to submit. Please fetch and process patients first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      addLog('Submitting assessment results...');
      const result = await submitAssessment({
        high_risk_patients: highRiskPatients,
        fever_patients: feverPatients,
        data_quality_issues: dataQualityIssues,
      });

      setSubmissionResult(result);
      addLog(`Submission successful! Score: ${result.results.percentage}%`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`ERROR: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Patient Risk Assessment System
        </h1>

        {/* Control Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleFetchAndProcess}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading && !submissionResult ? 'Processing...' : 'Fetch & Process Patients'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || patients.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading && submissionResult === null && patients.length > 0
              ? 'Submitting...'
              : 'Submit Assessment'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
            <h3 className="font-bold mb-1">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Submission Results */}
        {submissionResult && (
          <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Submission Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {submissionResult.results.score.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {submissionResult.results.percentage}%
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {submissionResult.results.status}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">High Risk</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Score: {submissionResult.results.breakdown.high_risk.score} /{' '}
                    {submissionResult.results.breakdown.high_risk.max}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Matches: {submissionResult.results.breakdown.high_risk.matches}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Correct: {submissionResult.results.breakdown.high_risk.correct}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Fever</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Score: {submissionResult.results.breakdown.fever.score} /{' '}
                    {submissionResult.results.breakdown.fever.max}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Matches: {submissionResult.results.breakdown.fever.matches}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Correct: {submissionResult.results.breakdown.fever.correct}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Data Quality</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Score: {submissionResult.results.breakdown.data_quality.score} /{' '}
                    {submissionResult.results.breakdown.data_quality.max}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Matches: {submissionResult.results.breakdown.data_quality.matches}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Correct: {submissionResult.results.breakdown.data_quality.correct}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Feedback</h3>
              {submissionResult.results.feedback.strengths.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">Strengths:</h4>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {submissionResult.results.feedback.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              {submissionResult.results.feedback.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">Issues:</h4>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {submissionResult.results.feedback.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        {patients.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Patients
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                High-Risk Patients
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {highRiskPatients.length}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Fever Patients
              </h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {feverPatients.length}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Data Quality Issues
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {dataQualityIssues.length}
              </p>
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800 text-green-400 rounded-lg shadow font-mono text-sm overflow-auto max-h-60">
            <h3 className="font-bold mb-2 text-white">Logs</h3>
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        )}

        {/* Alert Lists */}
        {patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-red-600 dark:text-red-400">
                High-Risk Patients ({highRiskPatients.length})
              </h3>
              <div className="max-h-60 overflow-auto">
                {highRiskPatients.map((id) => (
                  <div key={id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                    {id}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-orange-600 dark:text-orange-400">
                Fever Patients ({feverPatients.length})
              </h3>
              <div className="max-h-60 overflow-auto">
                {feverPatients.map((id) => (
                  <div key={id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                    {id}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-yellow-600 dark:text-yellow-400">
                Data Quality Issues ({dataQualityIssues.length})
              </h3>
              <div className="max-h-60 overflow-auto">
                {dataQualityIssues.map((id) => (
                  <div key={id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                    {id}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
