from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user') # user, admin, expert
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role
        }

class Sensor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.String(64), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False) # For API Authentication
    sensor_config = db.Column(db.Text, nullable=True) # JSON: {"temperature": {"enabled": true, "unit": "°C"}, ...}
    latitude = db.Column(db.Float, nullable=True) # GPS Latitude
    longitude = db.Column(db.Float, nullable=True) # GPS Longitude
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Owned by user
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    data_logs = db.relationship('SensorData', backref='sensor', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'device_id': self.device_id,
            'name': self.name,
            'token': self.token,  # Include token so users can view it later
            'user_id': self.user_id,
            'sensor_config': json.loads(self.sensor_config) if self.sensor_config else {},
            'latitude': self.latitude,
            'longitude': self.longitude,
            'latest_data': self.data_logs[-1].to_dict() if self.data_logs else None
        }

class SensorData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensor.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    temperature = db.Column(db.Float, nullable=True)
    humidity = db.Column(db.Float, nullable=True)
    soil_ph = db.Column(db.Float, nullable=True)
    soil_moisture = db.Column(db.Float, nullable=True)
    light_intensity = db.Column(db.Float, nullable=True)
    rainfall = db.Column(db.Float, nullable=True)
    wind_speed = db.Column(db.Float, nullable=True)
    pressure = db.Column(db.Float, nullable=True)
    payload_json = db.Column(db.Text, nullable=True) # Raw JSON storage
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'temperature': self.temperature,
            'humidity': self.humidity,
            'soil_ph': self.soil_ph,
            'soil_moisture': self.soil_moisture,
            'light_intensity': self.light_intensity,
            'rainfall': self.rainfall,
            'wind_speed': self.wind_speed,
            'pressure': self.pressure
        }

class FertilizerPrice(db.Model):
    """
    Dynamic fertilizer pricing model with time-series support.
    Supports both manual updates and API synchronization.
    """
    id = db.Column(db.Integer, primary_key=True)
    fertilizer_type = db.Column(db.String(50), nullable=False, index=True)  # 'urea', 'sp36', etc.
    price_per_kg = db.Column(db.Float, nullable=False)
    effective_date = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    source = db.Column(db.String(100), default='manual')  # 'manual', 'api_sync', 'government', 'initial_seed'
    region = db.Column(db.String(100), default='national')  # Future: regional pricing support
    updated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Admin who updated
    notes = db.Column(db.Text, nullable=True)  # Optional notes about price change
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'fertilizer_type': self.fertilizer_type,
            'price_per_kg': self.price_per_kg,
            'effective_date': self.effective_date.isoformat(),
            'source': self.source,
            'region': self.region,
            'updated_by': self.updated_by,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }
