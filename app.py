from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_cors import CORS
import os
import random

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Store OTP temporarily
otp_storage = {}

@app.route('/')
def home():
    return "Krishi Setu Backend Running"

# ---------------- UPLOAD API ---------------- #

@app.route('/upload', methods=['POST'])
def upload():
    image = request.files.get('image')
    video = request.files.get('video')

    if image and image.filename != '':
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], image.filename))

    if video and video.filename != '':
        video.save(os.path.join(app.config['UPLOAD_FOLDER'], video.filename))

    return jsonify({
        "message": "Files Uploaded Successfully!"
    })

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ---------------- OTP APIs ---------------- #

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()

    email = data.get('email')

    otp = str(random.randint(100000, 999999))

    otp_storage[email] = otp

    print(f"OTP for {email}: {otp}")

    return jsonify({
        "message": "OTP sent successfully",
        "otp_for_testing": otp
    })

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()

    email = data.get('email')
    otp = data.get('otp')

    stored_otp = otp_storage.get(email)

    if stored_otp == otp:
        return jsonify({
            "message": "OTP verified successfully"
        })

    return jsonify({
        "detail": "Invalid OTP"
    }), 400

# ---------------- MAIN ---------------- #

if __name__ == '__main__':
    app.run(debug=True, port=5000)