export interface HealthResponse {
  status: string;
  timestamp: string;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const response = await fetch(`${baseUrl}/api/health`);

  if (!response.ok) {
    throw new Error('Failed to fetch health information');
  }

  return response.json();
};
