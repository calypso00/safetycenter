# Face Recognition Service

Face recognition microservice for the Safety Experience Automation System.

## Tech Stack

- **Language**: Python 3.8+
- **Framework**: Flask
- **Face Recognition**: face_recognition (dlib-based)
- **Image Processing**: Pillow, NumPy
- **Deployment**: Gunicorn

## Project Structure

```
face-recognition/
|-- app.py                     # Flask application main file
|-- config.py                  # Configuration classes
|-- requirements.txt           # Python dependencies
|-- .env.example               # Environment variables template
|
|-- utils/                     # Utility modules
|   |-- __init__.py            # Package init
|   |-- face_utils.py          # Face recognition utilities
|   |-- image_utils.py         # Image processing utilities
|
|-- data/                      # Data storage (auto-created)
|   |-- encodings/             # Face encodings storage
|   |-- images/                # Face images storage
```

## Installation

### Prerequisites

- Python 3.8 or higher
- CMake (for dlib compilation)
- C++ compiler (for dlib)

### Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Installing dlib (if needed)

On some systems, dlib may require additional steps:

```bash
# Ubuntu/Debian
sudo apt-get install cmake
sudo apt-get install python3-dev
pip install dlib

# macOS
brew install cmake
pip install dlib

# Windows
# Install Visual Studio Build Tools with C++ support
# Install CMake
pip install cmake
pip install dlib
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| FLASK_ENV | Flask environment | development |
| SECRET_KEY | Flask secret key | - |
| DEBUG | Debug mode | True |
| HOST | Server host | 0.0.0.0 |
| PORT | Server port | 5001 |
| FACE_RECOGNITION_TOLERANCE | Face matching threshold | 0.6 |
| MODEL | Face detection model (hog/cnn) | hog |
| BACKEND_URL | Backend API URL | http://localhost:3000 |
| BACKEND_API_KEY | API key for backend | - |
| DATA_DIR | Data storage directory | ./data |
| CORS_ORIGINS | Allowed CORS origins | - |

### Model Selection

- **hog**: Faster, works on CPU, suitable for real-time
- **cnn**: More accurate, requires GPU/CUDA, slower

### Tolerance

Lower tolerance = stricter matching (more false negatives)
Higher tolerance = looser matching (more false positives)

Recommended range: 0.4 - 0.8

## Running the Server

```bash
# Development mode
python app.py

# Production mode with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## API Endpoints

### Server Status

#### GET /

Check server status and registered face count.

**Response:**
```json
{
  "success": true,
  "message": "안면인식 서버가 정상 작동 중입니다.",
  "version": "1.0.0",
  "registered_faces": 10
}
```

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00"
}
```

#### GET /status

Get server configuration and statistics.

**Response:**
```json
{
  "success": true,
  "registered_faces": 10,
  "model": "hog",
  "tolerance": 0.6
}
```

### Face Registration

#### POST /register

Register a face for a user.

**Request:**
```json
{
  "user_id": 1,
  "image": "base64_encoded_image_string"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "얼굴 등록이 완료되었습니다.",
  "face_encoding": "base64_encoded_encoding"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "얼굴이 감지되지 않았습니다."
}
```

### Face Verification

#### POST /verify

Verify a face against registered faces.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Success Response:**
```json
{
  "success": true,
  "user_id": 1,
  "confidence": 0.95,
  "message": "얼굴 인증 성공"
}
```

**Failure Response:**
```json
{
  "success": false,
  "message": "등록된 얼굴과 일치하는 사용자를 찾을 수 없습니다."
}
```

### Face Detection

#### POST /detect

Detect faces in an image without verification.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "success": true,
  "faces_detected": 2,
  "locations": [
    [100, 200, 150, 50],
    [180, 280, 230, 130]
  ]
}
```

### Face Deletion

#### DELETE /delete/<user_id>

Delete face data for a user.

**Response:**
```json
{
  "success": true,
  "message": "얼굴 데이터가 삭제되었습니다."
}
```

## Image Requirements

### Supported Formats
- JPEG
- PNG

### Minimum Resolution
- 640x480 pixels recommended

### Best Practices
- Single face per image for registration
- Well-lit environment
- Front-facing pose
- No obstructions (glasses, masks, etc.)

## Technical Specifications

| Specification | Value |
|--------------|-------|
| Recognition Accuracy | 99.38% (LFW benchmark) |
| Processing Time | ~0.5 seconds (single face, HOG) |
| Face Encoding Size | 128 dimensions |
| Max Image Size | 10MB |
| Concurrent Requests | Limited by server resources |

## Integration with Backend

The face recognition service is designed to work with the main backend API:

```
Frontend (Kiosk) --> Face Recognition Service --> Backend API
                           |
                           v
                      Face Database
```

### Workflow

1. **Registration Flow:**
   - User captures face image
   - Frontend sends to backend
   - Backend forwards to face recognition service
   - Face encoding stored in database

2. **Verification Flow:**
   - User stands before kiosk camera
   - Image captured and sent to face recognition service
   - Service returns matched user_id
   - Backend validates reservation and grants entry

## Error Handling

| HTTP Code | Description |
|-----------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid image, missing parameters) |
| 404 | Not Found (no matching face) |
| 500 | Internal Server Error |

## Security Considerations

1. **Network Security**: Run on internal network only
2. **HTTPS**: Use HTTPS in production
3. **Data Privacy**: Face data should be encrypted
4. **Access Control**: Restrict API access to authorized services
5. **Data Retention**: Delete face data when users withdraw

## Performance Optimization

### For Higher Throughput

```bash
# Use Gunicorn with multiple workers
gunicorn -w 8 -b 0.0.0.0:5001 app:app

# Use CNN model with GPU
# Set MODEL=cnn in .env
```

### For Lower Latency

- Use HOG model (default)
- Reduce image size before sending
- Use connection pooling

## Docker Deployment

```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
```

## Troubleshooting

### dlib Installation Issues

```bash
# If pip install dlib fails:
pip install cmake
pip install dlib --no-cache-dir

# On Windows, you may need to download pre-built wheels
# from: https://github.com/z-mahmud22/Dlib_Windows_Python3.x
```

### Memory Issues

If you encounter memory issues with many registered faces:
- Increase server RAM
- Use Redis for encoding storage
- Implement encoding pagination

### Slow Recognition

- Switch to HOG model if using CNN
- Reduce image resolution
- Check CPU usage