import datetime

from dateutil import parser
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user

from . import login_manager
from .models import User, db
from .services.agri_logic import agri_logic
from .services.ai_service import ai_service
from .services.processing_service import segment_leaf

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if (
        not data
        or not data.get("username")
        or not data.get("email")
        or not data.get("password")
    ):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(username=data["username"], email=data["email"])
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    # Try to find user by username first, then by email
    user = User.query.filter_by(username=data["username"]).first()
    if not user:
        user = User.query.filter_by(email=data["username"]).first()

    if user and user.check_password(data["password"]):
        login_user(user)
        return jsonify({"message": "Login successful", "user": user.to_dict()}), 200

    return jsonify({"error": "Invalid username or password"}), 401


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

    if current_user.is_authenticated:
        return jsonify({"authenticated": True, "user": current_user.to_dict()}), 200
    return jsonify({"authenticated": False}), 200


# --- IoT / Sensor Routes ---
import secrets

from .models import Sensor, SensorData


@auth_bp.route("/sensors/register", methods=["POST"])
@login_required
def register_sensor():
    data = request.get_json()
    if not data or not data.get("device_id") or not data.get("name"):
        return jsonify({"error": "Missing device_id or name"}), 400

    if Sensor.query.filter_by(device_id=data["device_id"]).first():
        return jsonify({"error": "Device ID already registered"}), 400

    # Generate secure token for the device
    token = secrets.token_hex(32)

    # Get sensor_config from request (optional)
    import json

    sensor_config = data.get("sensor_config", {})

    sensor = Sensor(
        device_id=data["device_id"],
        name=data["name"],
        token=token,
        sensor_config=json.dumps(sensor_config) if sensor_config else None,
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        user_id=current_user.id,
    )

    db.session.add(sensor)
    db.session.commit()

    return jsonify(
        {
            "message": "Sensor registered successfully",
            "sensor": sensor.to_dict(),
            "token": token,  # Show token only once upon registration
        }
    ), 201


@auth_bp.route("/sensors/<int:sensor_id>", methods=["PUT"])
@login_required
def update_sensor(sensor_id):
    sensor = Sensor.query.filter_by(id=sensor_id, user_id=current_user.id).first()
    if not sensor:
        return jsonify({"error": "Sensor not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "name" in data:
        sensor.name = data["name"]

    if "sensor_config" in data:
        import json

        # Ensure it's a valid dict before saving
        config = data["sensor_config"]
        if isinstance(config, dict):
            sensor.sensor_config = json.dumps(config)

    if "latitude" in data:
        sensor.latitude = data["latitude"]

    if "longitude" in data:
        sensor.longitude = data["longitude"]

    db.session.commit()

    return jsonify(
        {"message": "Sensor updated successfully", "sensor": sensor.to_dict()}
    ), 200


@auth_bp.route("/sensors", methods=["GET"])
@login_required
def get_sensors():
    sensors = Sensor.query.filter_by(user_id=current_user.id).all()
    return jsonify([s.to_dict() for s in sensors]), 200


@auth_bp.route("/sensors/<int:sensor_id>", methods=["DELETE"])
@login_required
def delete_sensor(sensor_id):
    sensor = Sensor.query.filter_by(id=sensor_id, user_id=current_user.id).first()
    if not sensor:
        return jsonify({"error": "Sensor not found"}), 404

    db.session.delete(sensor)
    db.session.commit()

    return jsonify({"message": "Sensor and associated data deleted successfully"}), 200


# Telemetry Endpoint (No Login Required, uses Token Auth)
@auth_bp.route("/v1/telemetry", methods=["POST"])
def ingestion():
    token = request.headers.get("X-Sensor-Token")
    if not token:
        return jsonify({"error": "Missing X-Sensor-Token header"}), 401

    sensor = Sensor.query.filter_by(token=token).first()
    if not sensor:
        return jsonify({"error": "Invalid Token"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No payload"}), 400

    # Store data
    log = SensorData(
        sensor_id=sensor.id,
        temperature=data.get("temperature"),
        humidity=data.get("humidity"),
        soil_ph=data.get("soil_ph"),
        soil_moisture=data.get("soil_moisture"),
        light_intensity=data.get("light_intensity"),
        rainfall=data.get("rainfall"),
        wind_speed=data.get("wind_speed"),
        pressure=data.get("pressure"),
        payload_json=str(data),
    )

    # Use device timestamp if provided
    device_ts = data.get("timestamp")
    if device_ts:
        try:
            log.timestamp = parser.parse(device_ts)
        except (ValueError, TypeError):
            pass  # Fallback to default (now)

    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Data received"}), 201


# Fetch Telemetry History
@auth_bp.route("/sensors/<int:sensor_id>/history", methods=["GET"])
@login_required
def get_sensor_history(sensor_id):
    sensor = Sensor.query.filter_by(id=sensor_id, user_id=current_user.id).first()
    if not sensor:
        return jsonify({"error": "Sensor not found"}), 404

    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    query = SensorData.query.filter_by(sensor_id=sensor_id)

    if start_date_str:
        try:
            start_date = parser.parse(start_date_str)
            query = query.filter(SensorData.timestamp >= start_date)
        except (ValueError, TypeError):
            pass

    if end_date_str:
        try:
            end_date = parser.parse(end_date_str)
            query = query.filter(SensorData.timestamp <= end_date)
        except (ValueError, TypeError):
            pass

    # If no dates provided, limit to last 20
    if not start_date_str and not end_date_str:
        history = query.order_by(SensorData.timestamp.desc()).limit(20).all()
        history = list(reversed(history))  # Chronological order
    else:
        history = query.order_by(SensorData.timestamp.asc()).all()

    data = []
    for log in history:
        # Include full ISO format for precise sorting/filtering on frontend if needed,
        # but keep the time-only display for the chart labels
        data.append(
            {
                "timestamp": log.timestamp.strftime("%H:%M:%S")
                if log.timestamp
                else None,
                "full_timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "temperature": log.temperature,
                "humidity": log.humidity,
                "soil_ph": log.soil_ph,
                "soil_moisture": log.soil_moisture,
                "light_intensity": log.light_intensity,
                "rainfall": log.rainfall,
                "wind_speed": log.wind_speed,
                "pressure": log.pressure,
            }
        )

    return jsonify(data)


# --- Disease Detection Route ---


@auth_bp.route("/disease-detection/analyze", methods=["POST"])
@login_required
def analyze_disease():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()

    # Perform Leaf Segmentation
    masked_base64, leaf_percentage, is_leaf = segment_leaf(image_bytes)

    if not is_leaf:
        return jsonify(
            {
                "status": "error",
                "message": f"Objek utama bukan daun (Hanya {leaf_percentage}% terdeteksi sebagai area daun). Silakan pastikan objek di foto adalah daun dan memiliki kontras yang cukup.",
                "leaf_area": leaf_percentage,
            }
        ), 422

    detection_type = request.form.get("type", "disease")

    if detection_type == "chlorophyll":
        # Real AI Inference for Chlorophyll
        import base64

        masked_bytes = base64.b64decode(masked_base64)

        result = ai_service.predict_chlorophyll(masked_bytes)

        if not result:
            return jsonify(
                {"status": "error", "message": "Gagal melakukan prediksi Klorofil."}
            ), 500
    else:
        # Real AI Inference
        # Note: masking is done in processing_service, but predict_disease expects raw bytes or image object.
        # Ideally we should pass the MASKED image to the AI.
        # Let's decode the masked base64 back to bytes or modify ai_service to accept base64 or perform masking internally.
        # Actually, ai_service accepts 'image_bytes'.
        # But segment_leaf returns 'masked_base64'.
        # We should use the masked image for prediction to ensure background doesn't affect result.

        import base64

        masked_bytes = base64.b64decode(masked_base64)

        # result = ai_service.predict_disease(image_bytes)
        result = ai_service.predict_disease(masked_bytes)

        if not result:
            return jsonify(
                {"status": "error", "message": "Gagal melakukan prediksi AI."}
            ), 500

    return jsonify(
        {
            "status": "success",
            "type": detection_type,
            "result": result,
            "segmentation": {
                "leaf_area_percentage": leaf_percentage,
                # "masked_image": base64.b64encode(image_bytes).decode("utf-8"),
                "masked_image": masked_base64,
            },
            "timestamp": datetime.datetime.now().isoformat(),
        }
    ), 200


# --- Agriculture Logic Routes ---


@auth_bp.route("/agriculture/crops", methods=["GET"])
def get_crops():
    """Returns list of supported crops and their metadata."""
    return jsonify(agri_logic.CROP_DATA), 200


@auth_bp.route("/agriculture/soil-textures", methods=["GET"])
def get_soil_textures():
    """Returns list of soil textures and moisture metadata."""
    return jsonify(agri_logic.SOIL_DATA), 200


@auth_bp.route("/agriculture/calculate-water", methods=["POST"])
@login_required
def calculate_water():
    data = request.get_json()
    if (
        not data
        or not data.get("crop_type")
        or not data.get("age_days")
        or not data.get("area_m2")
    ):
        return jsonify(
            {"error": "Missing required fields (crop_type, age_days, area_m2)"}
        ), 400

    # Optional weather data (can be fetched from user's sensors if not provided)
    t_min = data.get("t_min")
    t_max = data.get("t_max")
    humidity = data.get("humidity")
    wind_speed = data.get("wind_speed")
    pressure = data.get("pressure")
    solar_rad = data.get("solar_rad")
    t_mean = data.get("t_mean")
    rainfall = data.get("rainfall", 0)  # Default to 0 if not provided

    # If data not provided, try to fetch from the latest sensor data of the user
    if any(v is None for v in [t_min, t_max, humidity, wind_speed]):
        sensor = Sensor.query.filter_by(user_id=current_user.id).first()
        if sensor and sensor.data_logs:
            latest = sensor.data_logs[-1]
            temp = latest.temperature or 25.0
            t_min = t_min if t_min is not None else temp - 2
            t_max = t_max if t_max is not None else temp + 2
            humidity = humidity if humidity is not None else (latest.humidity or 70.0)
            wind_speed = (
                wind_speed if wind_speed is not None else (latest.wind_speed or 2.0)
            )
            pressure = pressure if pressure is not None else (latest.pressure or 101.3)
            rainfall = rainfall if rainfall is not None else (latest.rainfall or 0)
        else:
            # Fallback defaults for tropics
            t_min = t_min if t_min is not None else 23.0
            t_max = t_max if t_max is not None else 31.0
            humidity = humidity if humidity is not None else (latest.humidity or 75.0)
            wind_speed = (
                wind_speed if wind_speed is not None else (latest.wind_speed or 1.5)
            )
            pressure = pressure if pressure is not None else (latest.pressure or 101.3)
            solar_rad = solar_rad if solar_rad is not None else 15.0  # Typical trop Rs
            t_mean = t_mean if t_mean is not None else 27.0

    result = agri_logic.calculate_irrigation(
        data["crop_type"],
        int(data["age_days"]),
        float(data["area_m2"]),
        float(t_min),
        float(t_max),
        float(humidity),
        float(wind_speed),
        float(pressure),
        solar_rad=float(solar_rad) if solar_rad is not None else None,
        t_mean=float(t_mean) if t_mean is not None else None,
        rainfall=float(rainfall),
    )

    return jsonify(result), 200


@auth_bp.route("/agriculture/seasonal-water-demand", methods=["POST"])
@login_required
def calculate_seasonal_water_demand():
    data = request.get_json()
    if not data or not data.get("crop_type") or not data.get("area_m2"):
        return jsonify({"error": "Missing required fields (crop_type, area_m2)"}), 400

    eto_avg = data.get("eto_avg", 4.0)
    result = agri_logic.calculate_seasonal_water_demand(
        data["crop_type"], float(data["area_m2"]), float(eto_avg)
    )

    if not result:
        return jsonify({"error": "Crop type not supported"}), 400

    return jsonify(result), 200


@auth_bp.route("/agriculture/seasonal-demand", methods=["POST"])
@login_required
def calculate_seasonal_demand():
    data = request.get_json()
    if not data or not data.get("crop_type") or not data.get("area_m2"):
        return jsonify({"error": "Missing required fields (crop_type, area_m2)"}), 400

    eto_avg = data.get("eto_avg", 4.0)
    result = agri_logic.calculate_seasonal_demand(
        data["crop_type"], float(data["area_m2"]), float(eto_avg)
    )

    return jsonify(result), 200


@auth_bp.route("/agriculture/calculate-fertilizer", methods=["POST"])
@login_required
def calculate_fertilizer():
    data = request.get_json()
    if not data or not data.get("crop_type") or not data.get("area_m2"):
        return jsonify({"error": "Missing required fields (crop_type, area_m2)"}), 400

    # Check if soil data is provided - use scientific method if available
    has_soil_data = any(
        k in data for k in ["soil_n", "soil_p", "soil_k", "target_yield"]
    )

    if has_soil_data:
        # Use scientific nutrient balance method
        result = agri_logic.calculate_fertilizer_scientific(
            crop_type=data["crop_type"],
            area_m2=float(data["area_m2"]),
            target_yield=float(data.get("target_yield"))
            if data.get("target_yield")
            else None,
            soil_n_percent=float(data.get("soil_n")) if data.get("soil_n") else None,
            soil_p_ppm=float(data.get("soil_p")) if data.get("soil_p") else None,
            soil_k_me=float(data.get("soil_k")) if data.get("soil_k") else None,
            soil_ph=float(data.get("soil_ph", 6.5)),
            organic_matter_percent=float(data.get("organic_matter", 2.0)),
        )
    else:
        # Fallback to simple area-based method
        result = agri_logic.recommend_fertilizer(
            data["crop_type"], float(data["area_m2"])
        )

    if not result:
        return jsonify({"error": "Crop type not supported"}), 400

    return jsonify(result), 200


@auth_bp.route("/agriculture/calculate-fertilizer-multi", methods=["POST"])
@login_required
def calculate_fertilizer_multi():
    """
    Calculate multiple fertilizer combination options with scoring and ranking
    """
    data = request.get_json()
    if not data or not data.get("crop_type") or not data.get("area_m2"):
        return jsonify({"error": "Missing required fields (crop_type, area_m2)"}), 400

    try:
        result = agri_logic.calculate_fertilizer_multi_option(
            crop_type=data["crop_type"],
            area_m2=float(data["area_m2"]),
            target_yield=float(data.get("target_yield"))
            if data.get("target_yield")
            else None,
            soil_n_percent=float(data.get("soil_n")) if data.get("soil_n") else None,
            soil_p_ppm=float(data.get("soil_p")) if data.get("soil_p") else None,
            soil_k_me=float(data.get("soil_k")) if data.get("soil_k") else None,
            soil_ph=float(data.get("soil_ph", 6.5)),
            organic_matter_percent=float(data.get("organic_matter", 2.0)),
            max_options=int(data.get("max_options", 5)),
        )

        if not result:
            return jsonify({"error": "Crop type not supported"}), 400

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Fertilizer Price Management Routes ---


@auth_bp.route("/agriculture/fertilizer-prices", methods=["GET"])
def get_fertilizer_prices():
    """
    Get current prices for all fertilizers.
    Public endpoint - no authentication required.
    """
    try:
        prices = agri_logic.get_all_current_prices()
        return jsonify(prices), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route(
    "/agriculture/fertilizer-prices/<fertilizer_type>/trend", methods=["GET"]
)
def get_price_trend(fertilizer_type):
    """
    Get price trend for a specific fertilizer.
    Query params: days (default: 30)
    """
    try:
        days = int(request.args.get("days", 30))
        trend = agri_logic.get_price_trend(fertilizer_type, days=days)
        return jsonify(trend), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/agriculture/fertilizer-prices", methods=["POST"])
@login_required
def update_fertilizer_price():
    """
    Update fertilizer price (Admin only).
    Supports both manual updates and API sync.
    """
    # Check if user is admin
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Admin access required."}), 403

    data = request.get_json()
    if not data or not data.get("fertilizer_type") or not data.get("price_per_kg"):
        return jsonify(
            {"error": "Missing required fields (fertilizer_type, price_per_kg)"}
        ), 400

    try:
        from datetime import datetime

        from .models import FertilizerPrice

        # Create new price record
        new_price = FertilizerPrice(
            fertilizer_type=data["fertilizer_type"],
            price_per_kg=float(data["price_per_kg"]),
            effective_date=datetime.utcnow(),
            source=data.get("source", "manual"),
            region=data.get("region", "national"),
            updated_by=current_user.id,
            notes=data.get("notes"),
        )

        db.session.add(new_price)
        db.session.commit()

        return jsonify(
            {"message": "Price updated successfully", "price": new_price.to_dict()}
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/agriculture/fertilizer-prices/sync", methods=["POST"])
@login_required
def sync_fertilizer_prices():
    """
    Sync fertilizer prices from external API (Admin only).
    This is a placeholder for future API integration.
    """
    # Check if user is admin
    if current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Admin access required."}), 403

    try:
        # TODO: Implement actual API sync logic
        # For now, return a placeholder response
        return jsonify(
            {
                "message": "API sync not yet implemented",
                "status": "pending",
                "note": "This endpoint will sync prices from government/market APIs in the future",
            }
        ), 501  # Not Implemented

    except Exception as e:
        return jsonify({"error": str(e)}), 500
