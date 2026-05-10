from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_cors import CORS
import os
import random
from database import SessionLocal, engine
import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

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
    db = SessionLocal()
    try:
        image = request.files.get('image')
        video = request.files.get('video')
        description = request.form.get('description')
        author_email = request.form.get('author_email')

        image_url = None
        video_url = None

        if image and image.filename != '':
            filename = f"image_{random.randint(1000, 9999)}_{image.filename}"
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_url = f"/api-app/uploads/{filename}"

        if video and video.filename != '':
            filename = f"video_{random.randint(1000, 9999)}_{video.filename}"
            video.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            video_url = f"/api-app/uploads/{filename}"

        new_post = models.HarvestPost(
            description=description,
            image_url=image_url,
            video_url=video_url,
            author_email=author_email
        )
        db.add(new_post)
        db.commit()

        return jsonify({
            "message": "Harvest Posted Successfully!",
            "post_id": new_post.id
        })
    finally:
        db.close()

@app.route('/posts', methods=['GET'])
def get_posts():
    db = SessionLocal()
    try:
        posts = db.query(models.HarvestPost).order_by(models.HarvestPost.timestamp.desc()).all()
        post_list = []
        for p in posts:
            post_list.append({
                "id": p.id,
                "description": p.description,
                "image_url": p.image_url,
                "video_url": p.video_url,
                "likes_count": p.likes_count,
                "author_email": p.author_email,
                "timestamp": p.timestamp.isoformat() if p.timestamp else None
            })
        return jsonify(post_list)
    finally:
        db.close()

@app.route('/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    db = SessionLocal()
    try:
        post = db.query(models.HarvestPost).filter(models.HarvestPost.id == post_id).first()
        if not post:
            return jsonify({"error": "Post not found"}), 404
        post.likes_count += 1
        db.commit()
        return jsonify({"likes_count": post.likes_count})
    finally:
        db.close()

@app.route('/posts/<int:post_id>/comment', methods=['POST'])
def add_comment(post_id):
    data = request.get_json()
    db = SessionLocal()
    try:
        text = data.get('text')
        if not text:
            return jsonify({"error": "Comment text required"}), 400
        new_comment = models.Comment(post_id=post_id, text=text)
        db.add(new_comment)
        db.commit()
        return jsonify({"message": "Comment added successfully"})
    finally:
        db.close()

@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    db = SessionLocal()
    try:
        comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.timestamp.asc()).all()
        return jsonify([{
            "id": c.id,
            "text": c.text,
            "user_name": c.user_name,
            "timestamp": c.timestamp.isoformat() if c.timestamp else None
        } for c in comments])
    finally:
        db.close()

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    author_email = request.args.get('email')
    db = SessionLocal()
    try:
        post = db.query(models.HarvestPost).filter(models.HarvestPost.id == post_id).first()
        if not post:
            return jsonify({"error": "Post not found"}), 404
        
        if post.author_email != author_email:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Delete related comments first
        db.query(models.Comment).filter(models.Comment.post_id == post_id).delete()
        
        db.delete(post)
        db.commit()
        return jsonify({"message": "Post deleted successfully"})
    finally:
        db.close()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ---------------- AUTH APIs ---------------- #

@app.route('/check-user', methods=['POST'])
def check_user():
    """Check if an email is already registered."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({"error": "Email required"}), 400
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        return jsonify({"exists": user is not None})
    finally:
        db.close()

@app.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip().lower()
    role = data.get('role', 'farmer').strip().lower()
    field_location = data.get('field_location', '').strip()

    if not all([name, phone, email, role]):
        return jsonify({"error": "name, phone, email, and role are required"}), 400

    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            return jsonify({"error": "Email already registered. Please login."}), 409
        new_user = models.User(
            name=name,
            phone=phone,
            email=email,
            role=role,
            field_location=field_location
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return jsonify({
            "message": "Registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "phone": new_user.phone,
                "email": new_user.email,
                "role": new_user.role,
                "field_location": new_user.field_location
            }
        }), 201
    finally:
        db.close()

@app.route('/get-user', methods=['POST'])
def get_user():
    """Fetch profile of a registered user by email."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({"error": "Email required"}), 400
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role,
            "field_location": user.field_location
        })
    finally:
        db.close()

@app.route('/update-user', methods=['POST'])
def update_user():
    """Update profile fields for an existing user."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({"error": "Email required"}), 400
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        if 'name' in data and data['name']:
            user.name = data['name'].strip()
        if 'phone' in data and data['phone']:
            user.phone = data['phone'].strip()
        if 'role' in data and data['role']:
            user.role = data['role'].strip().lower()
        if 'field_location' in data:
            user.field_location = data['field_location'].strip()
        db.commit()
        db.refresh(user)
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "phone": user.phone,
                "email": user.email,
                "role": user.role,
                "field_location": user.field_location
            }
        })
    finally:
        db.close()





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