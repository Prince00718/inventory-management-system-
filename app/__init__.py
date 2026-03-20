from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["PROPAGATE_EXCEPTIONS"] = True

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    CORS(app)

    from app.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # -------------------------
    # Global Error Handlers
    # -------------------------

    @app.errorhandler(404)
    def not_found_error(error):
        return {
            "success": False,
            "message": "Resource not found"
        }, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {
            "success": False,
            "message": "Internal server error"
        }, 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        return {
            "success": False,
            "message": str(e)
        }, 500

    return app