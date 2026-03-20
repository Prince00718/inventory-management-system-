from flask import send_from_directory
from app import create_app
import os

app = create_app()

# Upload folder path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Serve uploaded images
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == "__main__":

    # Run backend on port 5001 (same as React API calls)
    app.run(debug=True, port=5001)