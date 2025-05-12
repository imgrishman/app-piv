from flask import Flask, jsonify
import pymysql
from dotenv import load_dotenv
import os
import boto3
from flask_cors import CORS
import json
from datetime import date, datetime, time, timedelta


load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

def get_db_connection():
    return pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        ssl_disabled=True  # Add this if you are not using SSL
    )


def custom_json_serializer(obj):
    """Custom JSON serializer for date, datetime, time, and timedelta objects."""
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
            # Fetch logs from the database
            cursor.execute("SELECT * FROM metadata")
            result = cursor.fetchall()

            # Convert result to a list of dictionaries
            logs = []
            for row in result:
                log = {
                    'Id': row[0],
                    'fileName': row[1],
                    'filePath': row[2],
                    'status': row[3], 
                    'uploaded_date':row[4], # Leave as date object for custom serialization
                    'date': row[5],  # Leave as time object for custom serialization
                    'time': row[6],
                    'Result': json.loads(row[7]) if row[7] else None,
                    'Editedby': row[8],
                }
                logs.append(log)

            # Use the custom serializer to handle non-JSON types
            return app.response_class(
                json.dumps(logs, default=custom_json_serializer),
                mimetype='application/json'
            )
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
