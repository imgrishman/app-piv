from flask import Flask, jsonify, send_file, request
import os
import boto3
from flask_cors import CORS
import json
from io import BytesIO

# Load .env if needed
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# AWS S3 Config
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
BUCKET_NAME = 'pivora-test-bucket-hs'
REGION_NAME = 'us-east-1'

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=REGION_NAME
)

@app.route('/api/download', methods=['GET'])
def download_file():
    file_path = request.args.get('filePath')

    # Ensure the file path is valid (e.g., no access to unauthorized directories)
    if not file_path.startswith('pivora-test/'):
        return jsonify({'error': 'Unauthorized file access'}), 403
    
    try:
        # Download file from S3 (if it's an S3 file)
        local_path = '/tmp/' + os.path.basename(file_path)  # Temporary location to store the file
        s3_client.download_file(BUCKET_NAME, file_path, local_path)

        # Send the file as a download
        return send_file(local_path, as_attachment=True)
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch file'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
