from flask import Flask, jsonify, send_file
import pymysql
from dotenv import load_dotenv
import os
import boto3
from flask_cors import CORS
import json
from datetime import date, datetime, time, timedelta
from io import BytesIO
 
# Load .env if needed
load_dotenv()
 
app = Flask(__name__)
CORS(app)
 
# AWS Config
 
 
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=REGION_NAME
)
 
# Database configuration
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}
 
def get_db_connection():
    return pymysql.connect(**db_config)
 
def custom_json_serializer(obj):
    if isinstance(obj, (date, datetime)):
        return obj.strftime('%Y-%m-%d')
    elif isinstance(obj, time):
        return obj.strftime('%H:%M:%S')
    elif isinstance(obj, timedelta):
        return str(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")
 
 
@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM metadata")
            result = cursor.fetchall()
 
            logs = []
            for row in result:
                log = {
                    'Id': row[0],
                    'fileName': row[1],
                    'filePath': row[2],
                    'status': row[3],
                    'uploaded_date': row[4],
                    'date': row[5],
                    'time': row[6],
                    'Result': json.loads(row[7]) if row[7] else None,
                    'Editedby': row[8],
                }
                logs.append(log)
 
            return app.response_class(
                json.dumps(logs, default=custom_json_serializer),
                mimetype='application/json'
            )
    finally:
        conn.close()
 
@app.route('/api/download', methods=['GET'])

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
 
if __name__ == '__main__':
    app.run(debug=True, port=5000)