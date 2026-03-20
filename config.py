class Config:
    SECRET_KEY = "supersecretkey"
    JWT_SECRET_KEY = "jwt-super-secret-key"

    DB_USERNAME = "root"
    DB_PASSWORD = "12345"
    DB_HOST = "localhost"
    DB_NAME = "inventory_system"

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False