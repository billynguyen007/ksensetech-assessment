import { Patient, PatientsResponse, SubmissionPayload, SubmissionResponse } from '@/types/patient';

const API_BASE_URL = 'https://assessment.ksensetech.com/api';
const API_KEY = 'ak_8f8731302a7191e67c868b9b78a9c1a5a10dd7d215ac072c';

// Delay function for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry logic for intermittent failures (500/503 errors)
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries = 5,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
        console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
        await delay(retryAfter * 1000);
        continue;
      }

      // Retry on 500/503 errors (~8% chance)
      if (response.status === 500 || response.status === 503) {
        console.log(`Server error (${response.status}). Attempt ${attempt + 1}/${maxRetries}`);
        lastError = new Error(`Server error: ${response.status}`);
        await delay(delayMs * (attempt + 1)); // Exponential backoff
        continue;
      }

      // Handle other non-OK responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries - 1) {
        await delay(delayMs * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Fetch all patients with pagination
export async function fetchAllPatients(): Promise<Patient[]> {
  const allPatients: Patient[] = [];
  let page = 1;
  let hasNext = true;

  console.log('Starting to fetch all patients...');

  while (hasNext) {
    try {
      console.log(`Fetching page ${page}...`);

      const data = await fetchWithRetry<PatientsResponse>(
        `${API_BASE_URL}/patients?page=${page}&limit=20`,
        {
          method: 'GET',
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );

      allPatients.push(...data.data);
      hasNext = data.pagination.hasNext;
      page++;

      console.log(`Fetched ${data.data.length} patients. Total so far: ${allPatients.length}`);

      // Small delay to avoid rate limiting
      if (hasNext) {
        await delay(500);
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      throw error;
    }
  }

  console.log(`Finished fetching all ${allPatients.length} patients`);
  return allPatients;
}

// Submit assessment results
export async function submitAssessment(payload: SubmissionPayload): Promise<SubmissionResponse> {
  console.log('Submitting assessment...', payload);

  return fetchWithRetry<SubmissionResponse>(
    `${API_BASE_URL}/submit-assessment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );
}
