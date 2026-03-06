# Safety Experience Automation System

## Overview

This system automates the entire process from visitor entry to experience completion at a safety experience center, improving operational efficiency and providing visitors with a smooth experience environment.

## Key Features

### User Features
- **User Registration & Authentication**: Sign up, login, profile management
- **Program Browsing**: View safety experience programs and details
- **Reservation System**: Book programs, select dates and times, manage reservations
- **Experience Records**: View personal experience history
- **Board System**: Inquiries, notices, FAQ

### Admin Features
- **Dashboard**: Today's statistics, recent reservations, summary
- **User Management**: User list, search, status management
- **Program Management**: CRUD operations for experience programs
- **Reservation Management**: View all reservations, approve/cancel
- **Statistics**: Daily, program-wise statistics with graphs

### Kiosk Features
- **Face Recognition Entry**: Automatic identity verification via face recognition
- **Face Registration**: Register face data for new users
- **Exit Processing**: Record exit time and calculate experience duration

## System Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Frontend       |     |    Backend       |     |   Face Recog.    |
|   (React)        |---->|   (Node.js)      |---->|   (Python)       |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                                |                         |
                                v                         v
                         +-------------+           +-------------+
                         |             |           |             |
                         |   MySQL     |           |   Face DB   |
                         |             |           |             |
                         +-------------+           +-------------+
```

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: Styled Components
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcrypt
- **Validation**: express-validator

### Face Recognition Module
- **Language**: Python 3
- **Framework**: Flask
- **Library**: face_recognition (dlib-based)
- **Model**: HOG + CNN hybrid

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Database**: MySQL 8.0
- **Cache/Session**: Redis (optional)

## Installation & Execution

### Prerequisites
- Node.js 18+
- Python 3.8+ (for face recognition)
- MySQL 8.0+
- Docker & Docker Compose (recommended)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd safety-experience-system

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Face Recognition: http://localhost:5001
```

### Manual Installation

#### 1. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE safety_experience;"

# Initialize tables
mysql -u root -p safety_experience < database/init.sql
mysql -u root -p safety_experience < database/schema.sql
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start server
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

#### 4. Face Recognition Module Setup

```bash
cd face-recognition

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Start server
python app.py
```

## Project Structure

```
safety-experience-system/
|-- backend/                    # Backend API Server
|   |-- src/
|   |   |-- config/             # Configuration files
|   |   |-- controllers/        # Request handlers
|   |   |-- middleware/         # Express middleware
|   |   |-- models/             # Database models
|   |   |-- routes/             # API routes
|   |   |-- services/           # Business logic
|   |   |-- utils/              # Utility functions
|   |   |-- app.js              # Express app setup
|   |   |-- server.js           # Server entry point
|   |-- package.json
|   |-- .env.example
|
|-- frontend/                   # Frontend Application
|   |-- src/
|   |   |-- components/         # Reusable components
|   |   |   |-- common/          # Common UI components
|   |   |   |-- layout/         # Layout components
|   |   |   |-- ui/             # UI elements
|   |   |   |-- kiosk/          # Kiosk-specific components
|   |   |-- pages/              # Page components
|   |   |   |-- Admin/          # Admin pages
|   |   |-- services/           # API service modules
|   |   |-- store/              # State management
|   |   |-- styles/             # Global styles
|   |   |-- utils/              # Utility functions
|   |   |-- App.jsx             # Root component
|   |   |-- main.jsx            # Entry point
|   |-- package.json
|   |-- vite.config.js
|
|-- face-recognition/           # Face Recognition Service
|   |-- app.py                  # Flask application
|   |-- config.py               # Configuration
|   |-- utils/                  # Utility modules
|   |   |-- face_utils.py       # Face processing
|   |   |-- image_utils.py      # Image processing
|   |-- requirements.txt
|   |-- .env.example
|
|-- database/                   # Database Scripts
|   |-- init.sql                # Initial data
|   |-- schema.sql              # Table definitions
|
|-- docs/                       # Documentation
|   |-- architecture.md         # Architecture design
|
|-- docker-compose.yml          # Docker orchestration
|-- README.md                   # This file
```

## API Documentation

### API Base URL
- Development: `http://localhost:3000/api`
- Production: Configure according to deployment

### API Endpoints Overview

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth | `/api/auth/*` | Authentication endpoints |
| Users | `/api/users/*` | User management |
| Programs | `/api/programs/*` | Experience programs |
| Reservations | `/api/reservations/*` | Reservation management |
| Experiences | `/api/experiences/*` | Experience records |
| Board | `/api/board/*` | Board system |
| Admin | `/api/admin/*` | Admin functions |
| Face | `/api/face/*` | Face recognition |

For detailed API documentation, refer to [`docs/architecture.md`](docs/architecture.md).

## Development Environment Setup

### IDE Recommendations
- **VS Code**: Recommended extensions listed below
  - ESLint
  - Prettier
  - Python
  - MySQL

### Environment Variables

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=safety_experience
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
FACE_RECOGNITION_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

#### Face Recognition (.env)
```env
FLASK_ENV=development
HOST=0.0.0.0
PORT=5001
FACE_RECOGNITION_TOLERANCE=0.6
MODEL=hog
BACKEND_URL=http://localhost:3000
```

## Default Accounts

After database initialization, the following accounts are available:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

**Important**: Change the default password immediately after first login.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please use the board system within the application.
