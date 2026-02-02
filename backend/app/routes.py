from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from .models import User, db
from . import login_manager
from dateutil import parser
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
        
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Registration successful'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Try to find user by username first, then by email
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        user = User.query.filter_by(email=data['username']).first()
    
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200
        
    return jsonify({'error': 'Invalid username or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

    if current_user.is_authenticated:
        return jsonify({'authenticated': True, 'user': current_user.to_dict()}), 200
    return jsonify({'authenticated': False}), 200

# --- IoT / Sensor Routes ---
import secrets
from .models import Sensor, SensorData

@auth_bp.route('/sensors/register', methods=['POST'])
@login_required
def register_sensor():
    data = request.get_json()
    if not data or not data.get('device_id') or not data.get('name'):
        return jsonify({'error': 'Missing device_id or name'}), 400
        
    if Sensor.query.filter_by(device_id=data['device_id']).first():
        return jsonify({'error': 'Device ID already registered'}), 400
        
    # Generate secure token for the device
    token = secrets.token_hex(32)
    
    # Get sensor_config from request (optional)
    import json
    sensor_config = data.get('sensor_config', {})
    
    sensor = Sensor(
        device_id=data['device_id'],
        name=data['name'],
        token=token,
        sensor_config=json.dumps(sensor_config) if sensor_config else None,
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        user_id=current_user.id
    )
    
    db.session.add(sensor)
    db.session.commit()
    
    return jsonify({
        'message': 'Sensor registered successfully',
        'sensor': sensor.to_dict(),
        'token': token # Show token only once upon registration
    }), 201

@auth_bp.route('/sensors/<int:sensor_id>', methods=['PUT'])
@login_required
def update_sensor(sensor_id):
    sensor = Sensor.query.filter_by(id=sensor_id, user_id=current_user.id).first()
    if not sensor:
        return jsonify({'error': 'Sensor not found'}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    if 'name' in data:
        sensor.name = data['name']
        
    if 'sensor_config' in data:
        import json
        # Ensure it's a valid dict before saving
        config = data['sensor_config']
        if isinstance(config, dict):
            sensor.sensor_config = json.dumps(config)
            
    if 'latitude' in data:
        sensor.latitude = data['latitude']
        
    if 'longitude' in data:
        sensor.longitude = data['longitude']
        
    db.session.commit()
    
    return jsonify({
        'message': 'Sensor updated successfully',
        'sensor': sensor.to_dict()
    }), 200

@auth_bp.route('/sensors', methods=['GET'])
@login_required
def get_sensors():
    sensors = Sensor.query.filter_by(user_id=current_user.id).all()
    return jsonify([s.to_dict() for s in sensors]), 200

@auth_bp.route('/sensors/<int:sensor_id>', methods=['DELETE'])
@login_required
def delete_sensor(sensor_id):
    sensor = Sensor.query.filter_by(id=sensor_id, user_id=current_user.id).first()
    if not sensor:
        return jsonify({'error': 'Sensor not found'}), 404
        
    db.session.delete(sensor)
    db.session.commit()
    
    return jsonify({'message': 'Sensor and associated data deleted successfully'}), 200

# Telemetry Endpoint (No Login Required, uses Token Auth)
@auth_bp.route('/v1/telemetry', methods=['POST'])
def ingestion():
    token = request.headers.get('X-Sensor-Token')
    if not token:
        return jsonify({'error': 'Missing X-Sensor-Token header'}), 401
        
    sensor = Sensor.query.filter_by(token=token).first()
    if not sensor:
        return jsonify({'error': 'Invalid Token'}), 403
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No payload'}), 400
        
    # Store data
    log = SensorData(
        sensor_id=sensor.id,
        temperature=data.get('temperature'),
        humidity=data.get('humidity'),
        soil_ph=data.get('soil_ph'),
        soil_moisture=data.get('soil_moisture'),
        light_intensity=data.get('light_intensity'),
        rainfall=data.get('rainfall'),
        wind_speed=data.get('wind_speed'),
        pressure=data.get('pressure'),
        payload_json=str(data)
    )

    # Use device timestamp if provided
    device_ts = data.get('timestamp')
    if device_ts:
        try:
            log.timestamp = parser.parse(device_ts)
        except (ValueError, TypeError):
            pass # Fallback to default (now)
    
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Data received'}), 201

# Fetch Telemetry History
@auth_bp.route('/sensors/<int:sensor_id>/history', methods=['GET'])
@login_required
def get_sensor_history(sensor_id):
    sensor = Sensor.query.filter_by(id=sensor_id, user_id=current_user.id).first()
    if not sensor:
        return jsonify({'error': 'Sensor not found'}), 404
        
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

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
        history = list(reversed(history)) # Chronological order
    else:
        history = query.order_by(SensorData.timestamp.asc()).all()
    
    data = []
    for log in history:
        # Include full ISO format for precise sorting/filtering on frontend if needed, 
        # but keep the time-only display for the chart labels
        data.append({
            'timestamp': log.timestamp.strftime('%H:%M:%S') if log.timestamp else None,
            'full_timestamp': log.timestamp.isoformat() if log.timestamp else None,
            'temperature': log.temperature,
            'humidity': log.humidity,
            'soil_ph': log.soil_ph,
            'soil_moisture': log.soil_moisture,
            'light_intensity': log.light_intensity,
            'rainfall': log.rainfall,
            'wind_speed': log.wind_speed,
            'pressure': log.pressure
        })
        
    return jsonify(data)

# --- Disease Detection Route ---
import random

@auth_bp.route('/disease-detection/analyze', methods=['POST'])
@login_required
def analyze_disease():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    detection_type = request.form.get('type', 'disease')
    
    if detection_type == 'chlorophyll':
        # Mock chlorophyll data
        spad_value = round(random.uniform(35.0, 55.0), 1)
        result = {
            'name': 'Kadar Klorofil (SPAD)',
            'value': spad_value,
            'unit': 'SPAD Units',
            'status': 'Normal' if 40 <= spad_value <= 50 else ('Rendah' if spad_value < 40 else 'Tinggi'),
            'recommendation': 'Kadar klorofil normal. Pertahankan pemupukan N yang seimbang.' if 40 <= spad_value <= 50 else 'Tingkatkan aplikasi pupuk Nitrogen untuk meningkatkan kadar klorofil.' if spad_value < 40 else 'Kurangi aplikasi pupuk Nitrogen untuk menghindari keracunan.',
            'model_info': 'MobileNetV3-Chlorophyll-Regressor'
        }
    else:
        # Mock disease analysis results based on MobileNetV3 architecture
        diseases = [
            {
                'name': 'Bercak Daun (Leaf Spot)',
                'confidence': 0.89,
                'recommendation': 'Gunakan fungisida berbahan aktif mankozeb dan pastikan sirkulasi udara di sekitar tanaman baik.',
                'model_info': 'MobileNetV3-CNN'
            },
            {
                'name': 'Karat Daun (Rust)',
                'confidence': 0.92,
                'recommendation': 'Segera buang daun yang terinfeksi dan aplikasikan sulfur atau fungisida sistemik.',
                'model_info': 'MobileNetV3-CNN'
            },
            {
                'name': 'Tanaman Sehat',
                'confidence': 0.98,
                'recommendation': 'Tanaman terlihat sehat. Lanjutkan pemeliharaan rutin dan pantau secara berkala.',
                'model_info': 'MobileNetV3-CNN'
            }
        ]
        result = random.choice(diseases)
    
    return jsonify({
        'status': 'success',
        'type': detection_type,
        'result': result,
        'timestamp': datetime.datetime.now().isoformat()
    }), 200
