import { AIMatchResponse } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export class ApiClient {
  private static baseUrl = '';

  public static async matchWithAI(
    query: string,
    filters?: { category?: string; maxBudget?: number; location?: string }
  ): Promise<AIMatchResponse> {
    const res = await fetch(`${this.baseUrl}/api/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters }),
    });

    if (!res.ok) {
      throw new Error(`AI Match server error: ${res.statusText}`);
    }

    const json: ApiResponse<AIMatchResponse> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to analyze request with AI');
    }
    return json.data;
  }

  public static async summarizeIncident(description: string, incidentType: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/ai/summarize-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, incidentType }),
    });

    if (!res.ok) {
      return description;
    }

    const json = await res.json();
    return json.data?.summary || description;
  }

  public static async seedDemoData(): Promise<{ count: number }> {
    const res = await fetch(`${this.baseUrl}/api/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Failed to seed demo data');
    }

    const json = await res.json();
    return json.data;
  }

  public static async getHealth(): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/api/health`);
    return await res.json();
  }
}
