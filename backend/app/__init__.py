import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
login_manager = LoginManager()

# Maximum accepted upload size (phone photos are large; keep in sync with the
# nginx `client_max_body_size` in front of this app).
MAX_UPLOAD_MB = 3


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or "dev-secret-key"

    # Handle PostgreSQL URI compatibility (Render/Heroku often use postgres://)
    database_url = os.environ.get("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///tanipintar.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Reject oversized uploads with a clean JSON 413 (instead of a raw error).
    app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024

    @app.errorhandler(413)
    def request_entity_too_large(_e):  # pyright: ignore[reportUnusedFunction]
        return (
            jsonify(
                {
                    "status": "error",
                    "message": f"Ukuran file terlalu besar. Maksimal {MAX_UPLOAD_MB} MB.",
                    "max_mb": MAX_UPLOAD_MB,
                }
            ),
            413,
        )

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.unauthorized_handler
    def unauthorized():  # pyright: ignore[reportUnusedFunction]
        return (
            jsonify(
                {
                    "status": "error",
                    "error": "Authentication required",
                    "message": "Sesi login sudah berakhir. Silakan login ulang.",
                }
            ),
            401,
        )

    # CORS Configuration
    allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(
        ","
    )
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "X-Sensor-Token"],
                "supports_credentials": True,
            }
        },
    )

    # Register blueprints
    from .routes import auth_bp

    app.register_blueprint(auth_bp)

    with app.app_context():
        db.create_all()

    @app.route("/health")
    @app.route("/api/health")
    def health_check():  # pyright: ignore[reportUnusedFunction]  # registered via decorator
        return {"status": "healthy", "service": "TaniPintar Backend"}

    return app
