/**
 * API Client for EcoCollect Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ScanResponse {
  ok: boolean;
  id: string;
  binId: string;
}

export interface ScanRequest {
  binId: string;
  collectorId: string;
  weight?: number;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

/**
 * Submit a scan to the backend
 */
export async function submitScan(payload: ScanRequest): Promise<ScanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/collections/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `Failed to submit scan: ${response.statusText}`,
      status: response.status,
    };
    
    try {
      const errorData = await response.json();
      error.message = errorData.message || error.message;
    } catch {
      // Ignore JSON parse errors
    }
    
    throw error;
  }

  return response.json();
}

/**
 * Seed a bin (development helper)
 */
export async function seedBin(binId?: string): Promise<{ ok: boolean; binId: string }> {
  const endpoint = binId 
    ? `${API_BASE_URL}/api/collections/seed-bin/${binId}`
    : `${API_BASE_URL}/api/collections/seed-bin`;
    
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to seed bin: ${response.statusText}`);
  }

  return response.json();
}
