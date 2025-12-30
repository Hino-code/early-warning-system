from pydantic import BaseModel
from typing import List, Literal, Optional

class RecommendationItem(BaseModel):
    priority: Literal["High", "Medium", "Low"]
    action: str
    reason: str
    timing: Optional[str] = None
    expectedImpact: Optional[str] = None
    costConsideration: Optional[str] = None

class RecommendationRequest(BaseModel):
    pestType: str
    forecastData: dict
    riskMetrics: dict
    historicalData: dict

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]

