import { apiClient } from "./api-client";

export interface RecommendationItem {
  priority: "High" | "Medium" | "Low";
  action: string;
  reason: string;
  timing?: string;
  expectedImpact?: string;
  costConsideration?: string;
}

export interface RecommendationRequest {
  pestType: string;
  forecastData: Record<string, any>;
  riskMetrics: Record<string, any>;
  historicalData: Record<string, any>;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
}

/**
 * Generate AI-powered pest management recommendations using Gemini API
 * 
 * Note: This uses a relative path to leverage Vite's proxy configuration
 * which routes /api/recommendations to http://localhost:8001
 */
export async function generateRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const apiPath = "/api/recommendations/generate";
  
  const response = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  
  if (!data.recommendations || !Array.isArray(data.recommendations)) {
    throw new Error("Invalid response format from API");
  }
  
  return data as RecommendationResponse;
}

