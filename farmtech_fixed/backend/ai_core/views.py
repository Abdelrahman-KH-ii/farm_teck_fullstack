"""
AI Core Views

Provides REST API endpoints for various AI model predictions including
crop recommendations, yield forecasting, soil health analysis, and more.
RAG (Retrieval-Augmented Generation) is integrated into CV and Chatbot views
for enriched agricultural knowledge responses.
"""

import os
import json
import time
import tempfile
from PIL import Image

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from farms.models import Farm
from .models import AICoreResult, CropField
from .services.hf_crop_recommender import HFCropRecommender
from .services.hf_irrigation_recommender import HFIrrigationRecommender
from .services.hf_forecast_service import HFForecastService
from .services.hf_yield_predictor import HFYieldPredictor
from .serializers import CropFieldListSerializer, CropFieldGeoSerializer

from .services.model_loader import (
    crop_model,
    fertilizer_model,
    irrigation_model,
    price_forecast_model,
    scenario_model,
    yield_model,
    cv_model,
)


class BaseAIView(APIView):
    """
    Base class for AI prediction views.
    Handles standard result saving and error reporting.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # 1. Extract input
            input_data = request.data.get("data", "{}")
            if isinstance(input_data, str):
                try:
                    input_data = json.loads(input_data)
                except:
                    input_data = {}

            # 2. Run child prediction
            result_data = self.run_prediction(request, input_data)

            # 3. Success response
            return Response({
                "success": True,
                "data": result_data
            })

        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def run_prediction(self, request, input_data):
        raise NotImplementedError("Subclasses must implement run_prediction")

class CVView(BaseAIView):
    """
    Computer Vision model for plant disease detection.

    Accepts image file uploads and returns classification results.
    """
    model_type = "cv"
    permission_classes = [AllowAny]

    def run_prediction(self, request, input_data):
        image_file = request.FILES.get("image")

        if not image_file:
            raise ValueError("No image uploaded")

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        ) as temp:
            for chunk in image_file.chunks():
                temp.write(chunk)

            temp_path = temp.name

        try:
            # Get CV classification
            result = cv_model.predict_image(temp_path)

            disease_name = result.get("prediction", "Unknown")

            # Build response
            response = {
                "prediction": disease_name,
                "class_id": result.get("class_id", -1),
                "confidence": result.get("confidence", 0),
            }

            return response

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


class CropRecommendationView(BaseAIView):
    model_type = "crop_recommendation"
    permission_classes = [AllowAny]
    def run_prediction(self, request, input_data):
        return HFCropRecommender.get_recommendation(input_data)

class PriceForecastingView(BaseAIView):
    model_type = "price_forecast"
    permission_classes = [AllowAny]
    def run_prediction(self, request, input_data):
        commodity = input_data.get("commodity", "Wheat")
        return HFForecastService.get_forecast(commodity)

class ScenarioSimulatorView(BaseAIView):
    """
    Scenario simulator: computes predicted impact of a farming scenario
    (e.g., increasing irrigation, changing crop type) using statistics
    from the CropField database records closest to the given lat/lon.
    """
    model_type = "scenario"
    permission_classes = [AllowAny]

    def run_prediction(self, request, input_data):
        from django.db.models import ExpressionWrapper, FloatField, Avg
        from django.db.models import F as DBF

        lat = float(input_data.get("lat", input_data.get("latitude", 30.0)))
        lon = float(input_data.get("lon", input_data.get("longitude", 31.0)))
        scenario = input_data.get("scenario", "increase_irrigation")
        crop = input_data.get("crop", "wheat")

        # Find nearest 10 CropField records for statistical analysis
        nearby = CropField.objects.annotate(
            distance=ExpressionWrapper(
                (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                output_field=FloatField()
            )
        ).filter(crop__iexact=crop).order_by('distance')[:10]

        if not nearby.exists():
            nearby = CropField.objects.annotate(
                distance=ExpressionWrapper(
                    (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                    output_field=FloatField()
                )
            ).order_by('distance')[:10]

        # Compute averages from real data
        agg = nearby.aggregate(
            avg_ndvi=Avg('ndvi_mean'),
            avg_moisture=Avg('soil_moisture'),
            avg_precip=Avg('precip_sum'),
            avg_temp=Avg('temp_mean'),
        )

        avg_ndvi = agg['avg_ndvi'] or 0.5
        avg_moisture = agg['avg_moisture'] or 30.0

        # Scenario impact rules (agronomically grounded heuristics)
        scenario_impacts = {
            "increase_irrigation": {
                "impact": "Positive",
                "description": "Increased irrigation improves soil moisture and NDVI.",
                "ndvi_change": round(min(0.15, (0.8 - avg_ndvi) * 0.4), 3) if avg_ndvi < 0.8 else -0.02,
                "moisture_change": round(min(20.0, (70 - avg_moisture) * 0.5), 2) if avg_moisture < 70 else -5.0,
                "confidence": round(0.78 + (avg_ndvi * 0.1), 2),
            },
            "reduce_irrigation": {
                "impact": "Moderate" if avg_moisture > 50 else "Negative",
                "description": "Reducing irrigation saves water but may stress crops in dry conditions.",
                "ndvi_change": round(-0.05 if avg_moisture < 40 else 0.01, 3),
                "moisture_change": round(-min(15.0, avg_moisture * 0.3), 2),
                "confidence": round(0.72 + (avg_moisture / 200), 2),
            },
            "add_fertilizer": {
                "impact": "Positive",
                "description": "Fertilizer addition boosts soil nutrients and crop health.",
                "ndvi_change": round(min(0.12, (0.75 - avg_ndvi) * 0.5), 3),
                "moisture_change": 0.0,
                "confidence": 0.81,
            },
            "change_crop": {
                "impact": "Variable",
                "description": "Crop rotation impacts depend on soil type and previous crop history.",
                "ndvi_change": round(-0.03 + avg_ndvi * 0.05, 3),
                "moisture_change": round(-5.0 + avg_moisture * 0.02, 2),
                "confidence": 0.68,
            },
        }

        result = scenario_impacts.get(scenario, scenario_impacts["increase_irrigation"])
        result["scenario"] = scenario
        result["crop"] = crop
        result["baseline"] = {
            "avg_ndvi": round(avg_ndvi, 3),
            "avg_soil_moisture": round(avg_moisture, 2),
            "avg_precipitation_mm": round(agg['avg_precip'] or 0, 1),
            "avg_temperature_c": round(agg['avg_temp'] or 0, 1),
        }
        result["records_used"] = nearby.count()
        return result


class SoilHealthPredictionView(BaseAIView):
    """
    Soil health prediction using nearest CropField database records.
    Computes a composite health score from real soil properties.
    """
    model_type = "soil_health"
    permission_classes = [AllowAny]

    def run_prediction(self, request, input_data):
        from django.db.models import ExpressionWrapper, FloatField
        from django.db.models import F as DBF

        lat = float(input_data.get("lat", input_data.get("latitude", 30.0)))
        lon = float(input_data.get("lon", input_data.get("longitude", 31.0)))
        crop = input_data.get("crop", None)

        qs = CropField.objects.annotate(
            distance=ExpressionWrapper(
                (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                output_field=FloatField()
            )
        )
        if crop:
            qs = qs.filter(crop__iexact=crop)

        field = qs.order_by('distance').first()
        if not field:
            field = CropField.objects.annotate(
                distance=ExpressionWrapper(
                    (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                    output_field=FloatField()
                )
            ).order_by('distance').first()

        if not field:
            return {"error": "No crop field data available in database"}

        # Real soil properties
        ph = field.soil_ph or 7.0
        soc = field.soil_soc or 0.5        # soil organic carbon (g/kg)
        clay = field.soil_clay or 25.0     # %
        nitrogen = field.soil_nitrogen or 1.5  # g/kg
        cec = field.soil_cec or 15.0      # cmol/kg
        moisture = field.soil_moisture or 30.0
        fertility = field.fertility_index
        aridity = field.aridity_index

        # Compute health score (0–100) from real properties
        # pH score: optimal 6.5–7.5
        ph_score = max(0, 100 - abs(ph - 7.0) * 15)
        # SOC score: higher is better (>2 = excellent)
        soc_score = min(100, (soc / 3.0) * 100)
        # Nitrogen score: 1–3 g/kg is optimal
        n_score = min(100, max(0, (nitrogen / 2.5) * 100))
        # Moisture score: 30–65% optimal
        m_score = max(0, 100 - abs(moisture - 45) * 1.5)
        # CEC score: >10 cmol/kg is good
        cec_score = min(100, (cec / 25.0) * 100)

        health_score = round((ph_score * 0.25 + soc_score * 0.20 + n_score * 0.20 +
                              m_score * 0.20 + cec_score * 0.15), 1)

        if health_score >= 75:
            status = "Excellent"
        elif health_score >= 55:
            status = "Good"
        elif health_score >= 35:
            status = "Fair"
        else:
            status = "Poor"

        return {
            "status": "success",
            "health_score": health_score,
            "status_label": status,
            "soil_properties": {
                "ph": round(ph, 2),
                "soil_organic_carbon_g_kg": round(soc, 3),
                "nitrogen_g_kg": round(nitrogen, 3),
                "clay_percent": round(clay, 1),
                "cec_cmol_kg": round(cec, 2),
                "soil_moisture_percent": round(moisture, 1),
            },
            "component_scores": {
                "ph_score": round(ph_score, 1),
                "organic_matter_score": round(soc_score, 1),
                "nitrogen_score": round(n_score, 1),
                "moisture_score": round(m_score, 1),
                "cec_score": round(cec_score, 1),
            },
            "fertility_index": round(fertility, 3) if fertility else None,
            "aridity_index": round(aridity, 3) if aridity else None,
            "nearest_field": {
                "crop": field.crop,
                "year": field.year,
                "lat": field.lat,
                "lon": field.lon,
            }
        }


class FertilizerOptimizerView(BaseAIView):
    """
    Fertilizer optimizer: generates crop-specific NPK recommendations
    from real soil chemistry data in the CropField database.
    """
    model_type = "fertilizer"
    permission_classes = [AllowAny]

    # Optimal NPK targets by crop (kg/ha)
    CROP_NPK_TARGETS = {
        "wheat":  {"N": 120, "P": 60,  "K": 80},
        "rice":   {"N": 100, "P": 50,  "K": 60},
        "maize":  {"N": 140, "P": 70,  "K": 100},
        "corn":   {"N": 140, "P": 70,  "K": 100},
        "cotton": {"N": 130, "P": 60,  "K": 90},
        "tomato": {"N": 150, "P": 80,  "K": 130},
        "potato": {"N": 160, "P": 100, "K": 180},
        "default":{"N": 100, "P": 50,  "K": 70},
    }

    def run_prediction(self, request, input_data):
        from django.db.models import ExpressionWrapper, FloatField
        from django.db.models import F as DBF

        lat = float(input_data.get("lat", input_data.get("latitude", 30.0)))
        lon = float(input_data.get("lon", input_data.get("longitude", 31.0)))
        crop = str(input_data.get("crop", "wheat")).strip().lower()

        qs = CropField.objects.annotate(
            distance=ExpressionWrapper(
                (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                output_field=FloatField()
            )
        ).filter(crop__iexact=crop).order_by('distance')

        field = qs.first()
        if not field:
            field = CropField.objects.annotate(
                distance=ExpressionWrapper(
                    (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                    output_field=FloatField()
                )
            ).order_by('distance').first()

        if not field:
            return {"error": "No crop field data available in database"}

        # Real soil nitrogen from SoilGrids (g/kg) → convert to kg/ha estimate
        # Bulk density ~1.3 g/cm³, 0-20cm depth → 2600 tonnes/ha soil mass
        bd = field.soil_bd or 1.3
        depth_cm = 20
        soil_mass_kg_ha = bd * 1000 * depth_cm * 100  # kg/ha

        soil_n_kg_ha = (field.soil_nitrogen or 1.5) * soil_mass_kg_ha / 1000
        soil_p_kg_ha = (field.soil_soc or 0.5) * 15  # approx P from SOC ratio
        soil_k_kg_ha = (field.soil_cec or 15.0) * 10  # approx K from CEC

        targets = self.CROP_NPK_TARGETS.get(crop, self.CROP_NPK_TARGETS["default"])

        # Compute deficits
        n_deficit = max(0, targets["N"] - soil_n_kg_ha)
        p_deficit = max(0, targets["P"] - soil_p_kg_ha)
        k_deficit = max(0, targets["K"] - soil_k_kg_ha)

        # Fertilizer conversions (fertilizer grade fractions)
        urea_rate = round(n_deficit / 0.46, 1)      # 46% N
        dap_rate  = round(p_deficit / 0.46, 1)       # 46% P₂O₅
        mop_rate  = round(k_deficit / 0.60, 1)       # 60% K₂O

        # Determine priority
        deficits = {"Nitrogen": n_deficit, "Phosphorus": p_deficit, "Potassium": k_deficit}
        priority = max(deficits, key=deficits.get)

        ph = field.soil_ph or 7.0
        lime_needed = ph < 6.0
        gypsum_needed = ph > 8.0

        return {
            "status": "success",
            "crop": crop,
            "soil_nutrient_levels_kg_ha": {
                "nitrogen": round(soil_n_kg_ha, 1),
                "phosphorus": round(soil_p_kg_ha, 1),
                "potassium": round(soil_k_kg_ha, 1),
            },
            "target_levels_kg_ha": targets,
            "deficits_kg_ha": {
                "nitrogen": round(n_deficit, 1),
                "phosphorus": round(p_deficit, 1),
                "potassium": round(k_deficit, 1),
            },
            "fertilizer_recommendations": {
                "urea_kg_ha": urea_rate,
                "dap_kg_ha": dap_rate,
                "mop_kg_ha": mop_rate,
            },
            "amendments": {
                "lime_needed": lime_needed,
                "gypsum_needed": gypsum_needed,
            },
            "priority_nutrient": priority,
            "recommendation": (
                f"Apply {urea_rate:.0f} kg/ha Urea ({n_deficit:.0f} kg/ha N deficit), "
                f"{dap_rate:.0f} kg/ha DAP ({p_deficit:.0f} kg/ha P deficit), "
                f"{mop_rate:.0f} kg/ha MOP ({k_deficit:.0f} kg/ha K deficit). "
                f"Priority: {priority}."
                + (" Add lime to raise pH." if lime_needed else "")
                + (" Add gypsum to lower pH." if gypsum_needed else "")
            ),
            "soil_ph": round(ph, 2),
            "nearest_field": {
                "crop": field.crop,
                "year": field.year,
                "lat": field.lat,
                "lon": field.lon,
            }
        }


class IrrigationOptimizerView(BaseAIView):
    model_type = "irrigation"
    permission_classes = [AllowAny]
    def run_prediction(self, request, input_data):
        return HFIrrigationRecommender.get_recommendation(input_data)

class YieldPredictionView(BaseAIView):
    model_type = "yield"
    permission_classes = [AllowAny]
    def run_prediction(self, request, input_data):
        return HFYieldPredictor.get_prediction(input_data)

class CropFieldView(BaseAIView):
    """Returns list of crop fields."""
    permission_classes = [AllowAny]
    def get(self, request):
        limit = int(request.query_params.get("limit", 100))
        fields = CropField.objects.all()[:limit]
        serializer = CropFieldListSerializer(fields, many=True)
        return Response({"count": CropField.objects.count(), "results": serializer.data})

class CropRotationView(BaseAIView):
    """
    Crop rotation recommendations based on the current/previous crop
    at the nearest DB location. Uses agronomic rotation rules.
    """
    permission_classes = [AllowAny]

    # Agronomic rotation rules: what follows what
    ROTATION_RULES = {
        "wheat":   {"next": "Legumes (Faba Bean / Lentil)", "reason": "Legumes fix atmospheric nitrogen, replenishing N depleted by wheat."},
        "rice":    {"next": "Wheat or Vegetables",           "reason": "Breaks rice blast disease cycle; wheat uses residual water efficiently."},
        "maize":   {"next": "Soybeans or Faba Bean",         "reason": "Soybeans fix N and break corn rootworm cycle."},
        "corn":    {"next": "Soybeans or Faba Bean",         "reason": "Soybeans fix N and break corn rootworm cycle."},
        "cotton":  {"next": "Wheat or Clover",               "reason": "Clover fixes N; wheat provides income while breaking cotton pest cycle."},
        "tomato":  {"next": "Cereals (Wheat/Maize)",         "reason": "Cereals break soilborne disease pathogens from previous tomato crop."},
        "potato":  {"next": "Clover or Cereals",             "reason": "Clover restores organic matter; avoids Solanaceae family repeat."},
        "soybeans":{"next": "Wheat or Maize",                "reason": "Cereals capitalize on residual N left by soybeans."},
        "barley":  {"next": "Legumes or Oilseeds",           "reason": "Legumes restore soil N; oilseeds diversify crop income."},
        "default": {"next": "Legumes (Faba Bean / Clover)",  "reason": "Legumes are universally beneficial for soil N restoration."},
    }

    def run_prediction(self, request, input_data):
        from django.db.models import ExpressionWrapper, FloatField
        from django.db.models import F as DBF

        lat = float(input_data.get("lat", input_data.get("latitude", 30.0)))
        lon = float(input_data.get("lon", input_data.get("longitude", 31.0)))
        current_crop = input_data.get("current_crop", input_data.get("crop", None))

        if not current_crop:
            # Query nearest field to find what was grown there
            field = CropField.objects.annotate(
                distance=ExpressionWrapper(
                    (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                    output_field=FloatField()
                )
            ).order_by('distance').first()
            current_crop = field.crop if field else "wheat"

        current_crop_lower = current_crop.strip().lower()
        rotation = self.ROTATION_RULES.get(current_crop_lower, self.ROTATION_RULES["default"])

        # Also query some soil data for context
        field = CropField.objects.annotate(
            distance=ExpressionWrapper(
                (DBF('lat') - lat) * (DBF('lat') - lat) + (DBF('lon') - lon) * (DBF('lon') - lon),
                output_field=FloatField()
            )
        ).filter(crop__iexact=current_crop_lower).order_by('distance').first()

        soil_context = {}
        if field:
            soil_context = {
                "soil_ph": round(field.soil_ph, 2) if field.soil_ph else None,
                "soil_nitrogen_g_kg": round(field.soil_nitrogen, 3) if field.soil_nitrogen else None,
                "fertility_index": round(field.fertility_index, 3) if field.fertility_index else None,
            }

        return {
            "status": "success",
            "current_crop": current_crop,
            "next_crop": rotation["next"],
            "reason": rotation["reason"],
            "additional_tips": [
                "Ensure adequate soil pH (6.0–7.5) before planting the next crop.",
                "Apply compost or green manure to improve organic matter between seasons.",
                "Test soil NPK levels after harvest before deciding on fertilizer needs.",
            ],
            "soil_context": soil_context,
        }


class CropFieldMapView(APIView):
    """
    Returns GeoJSON feature collection for Leaflet map rendering.
    Optimized for large datasets.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        crop = request.query_params.get("crop")
        year = request.query_params.get("year", 2024)
        
        queryset = CropField.objects.all()
        if crop:
            queryset = queryset.filter(crop__iexact=crop)
        if year:
            queryset = queryset.filter(year=year)
            
        # Limit to 5000 for map performance
        fields = queryset[:5000]
        
        features = [f.to_geojson_feature() for f in fields]
        
        return Response({
            "type": "FeatureCollection",
            "features": features
        })


class ForecastView(APIView):
    """
    GET /api/ai/forecast/              → all commodities list + their 4-quarter forecasts
    GET /api/ai/forecast/?commodity=Wheat → single commodity forecast
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        commodity = request.query_params.get("commodity", "").strip()

        if commodity:
            data = HFForecastService.get_forecast(commodity)
            if not data:
                return Response(
                    {"success": False, "error": f"No forecast available for '{commodity}'"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response({"success": True, "commodity": commodity, "forecast": data})

        # Return all commodities + their forecasts
        commodities = HFForecastService.get_commodities()
        return Response({"success": True, "commodities": commodities})