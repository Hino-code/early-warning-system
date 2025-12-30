from fastapi import APIRouter, HTTPException
from app.models.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

# Lazy initialization - service will be created on first request
_recommendation_service = None

def get_recommendation_service() -> RecommendationService:
    """Get or create recommendation service instance"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest):
    """
    Generate AI-powered pest management recommendations using Gemini API
    """
    try:
        service = get_recommendation_service()
        recommendations = await service.generate_recommendations(request)
        return RecommendationResponse(recommendations=recommendations)
    except ValueError as e:
        # API key not configured
        raise HTTPException(
            status_code=503,
            detail=f"Recommendation service not configured: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )

