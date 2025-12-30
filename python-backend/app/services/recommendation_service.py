import json
import os
from typing import Dict, List
from google import generativeai as genai
from app.models.recommendation import RecommendationItem, RecommendationRequest

class RecommendationService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_recommendations(
        self, 
        request: RecommendationRequest
    ) -> List[RecommendationItem]:
        """Generate AI-powered recommendations using Gemini"""
        
        prompt = self._build_prompt(request)
        
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_response(response.text)
            return result
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            # Fallback to rule-based recommendations
            return self._fallback_recommendations(request.riskMetrics)
    
    def _build_prompt(self, request: RecommendationRequest) -> str:
        return f"""You are an expert agricultural pest management advisor specializing in rice farming in the Philippines.

Given the following pest monitoring data:

Pest Type: {request.pestType}

Forecast Data:
{json.dumps(request.forecastData, indent=2)}

Risk Metrics:
{json.dumps(request.riskMetrics, indent=2)}

Historical Patterns:
{json.dumps(request.historicalData, indent=2)}

Provide 3-5 actionable recommendations in JSON format. Consider:
- Economic thresholds and intervention costs
- Optimal timing for interventions
- Expected impact of actions
- Philippine rice farming best practices
- Seasonal patterns and weather considerations

Return ONLY valid JSON in this exact format:
{{
  "recommendations": [
    {{
      "priority": "High|Medium|Low",
      "action": "specific actionable step",
      "reason": "why this is needed based on the data",
      "timing": "optimal timing (e.g., 'Within 24 hours', 'Before peak day')",
      "expectedImpact": "expected outcome",
      "costConsideration": "cost/benefit note"
    }}
  ]
}}

Do not include markdown formatting, code blocks, or any text outside the JSON."""

    def _parse_response(self, response_text: str) -> List[RecommendationItem]:
        """Parse Gemini response and extract JSON"""
        # Remove markdown code blocks if present
        text = response_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        # Parse JSON
        data = json.loads(text)
        recommendations = []
        
        for rec in data.get("recommendations", []):
            recommendations.append(RecommendationItem(**rec))
        
        return recommendations
    
    def _fallback_recommendations(self, risk_metrics: Dict) -> List[RecommendationItem]:
        """Rule-based fallback if Gemini API fails"""
        recommendations = []
        
        risk_level = risk_metrics.get("riskLevel", "Low")
        days_above_threshold = risk_metrics.get("daysAboveThreshold", 0)
        
        if risk_level == "High" or days_above_threshold > 0:
            recommendations.append(RecommendationItem(
                priority="High",
                action="Schedule immediate field inspection",
                reason=f"High risk level detected ({risk_level})",
                timing="Within 24 hours",
                expectedImpact="Early detection and intervention"
            ))
        
        if days_above_threshold > 2:
            recommendations.append(RecommendationItem(
                priority="High",
                action="Prepare intervention resources",
                reason=f"{days_above_threshold} days forecasted above threshold",
                timing="Immediately",
                expectedImpact="Ready for intervention when needed"
            ))
        
        if not recommendations:
            recommendations.append(RecommendationItem(
                priority="Low",
                action="Maintain regular monitoring",
                reason="Forecast indicates normal pest levels",
                timing="Ongoing",
                expectedImpact="Continued vigilance"
            ))
        
        return recommendations

