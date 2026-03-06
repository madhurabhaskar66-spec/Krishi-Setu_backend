from flask import Flask, render_template, request, send_from_directory
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def home():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload():
    image = request.files.get('image')
    video = request.files.get('video')

    if image and image.filename != '':
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], image.filename))

    if video and video.filename != '':
        video.save(os.path.join(app.config['UPLOAD_FOLDER'], video.filename))

    return "Files Uploaded Successfully!"

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)