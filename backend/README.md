# Safety Experience Backend

Backend API server for the Safety Experience Automation System.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcrypt
- **Validation**: express-validator

## Project Structure

```
backend/
|-- src/
|   |-- config/                 # Configuration files
|   |   |-- database.js         # Database connection
|   |   |-- index.js            # Config aggregation
|   |
|   |-- controllers/            # Request handlers
|   |   |-- authController.js   # Authentication controller
|   |   |-- userController.js   # User controller
|   |   |-- programController.js # Program controller
|   |   |-- reservationController.js # Reservation controller
|   |   |-- experienceController.js # Experience controller
|   |   |-- boardController.js  # Board controller
|   |   |-- adminController.js  # Admin controller
|   |   |-- faceController.js   # Face recognition controller
|   |
|   |-- middleware/             # Express middleware
|   |   |-- auth.js             # Authentication middleware
|   |   |-- errorHandler.js     # Error handling middleware
|   |
|   |-- models/                 # Database models
|   |   |-- User.js             # User model
|   |   |-- FaceData.js         # Face data model
|   |   |-- Program.js          # Program model
|   |   |-- Reservation.js      # Reservation model
|   |   |-- ExperienceLog.js    # Experience log model
|   |   |-- BoardPost.js        # Board post model
|   |   |-- BoardComment.js     # Board comment model
|   |
|   |-- routes/                 # API routes
|   |   |-- authRoutes.js       # Auth routes
|   |   |-- userRoutes.js       # User routes
|   |   |-- programRoutes.js    # Program routes
|   |   |-- reservationRoutes.js # Reservation routes
|   |   |-- experienceRoutes.js # Experience routes
|   |   |-- boardRoutes.js      # Board routes
|   |   |-- adminRoutes.js      # Admin routes
|   |   |-- faceRoutes.js       # Face recognition routes
|   |
|   |-- services/               # Business logic
|   |   |-- authService.js      # Auth service
|   |   |-- userService.js      # User service
|   |   |-- programService.js   # Program service
|   |   |-- reservationService.js # Reservation service
|   |   |-- experienceService.js # Experience service
|   |   |-- boardService.js     # Board service
|   |   |-- adminService.js     # Admin service
|   |   |-- faceService.js      # Face recognition service
|   |
|   |-- utils/                  # Utility functions
|   |   |-- errors.js           # Custom error classes
|   |   |-- jwt.js              # JWT utilities
|   |   |-- password.js         # Password utilities
|   |   |-- response.js         # Response formatters
|   |
|   |-- app.js                  # Express app setup
|   |-- server.js               # Server entry point
|
|-- package.json
|-- .env.example
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | safety_experience |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | JWT expiration time | 24h |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 7d |
| FACE_RECOGNITION_URL | Face recognition service URL | http://localhost:5001 |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3001 |

## Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | User registration | No |
| POST | /login | User login | No |
| POST | /logout | User logout | Yes |
| GET | /me | Get current user info | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /profile | Get user profile | Yes |
| PUT | /profile | Update profile | Yes |
| DELETE | /account | Delete account | Yes |
| GET | /reservations | Get user reservations | Yes |
| GET | /experiences | Get user experience logs | Yes |

### Programs (`/api/programs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get program list | No |
| GET | /:id | Get program details | No |
| GET | /:id/slots | Get available time slots | No |
| POST | / | Create program | Admin |
| PUT | /:id | Update program | Admin |
| DELETE | /:id | Delete program | Admin |

### Reservations (`/api/reservations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get reservations | Yes |
| POST | / | Create reservation | Yes |
| GET | /:id | Get reservation details | Yes |
| PUT | /:id | Update reservation | Yes |
| DELETE | /:id | Cancel reservation | Yes |
| GET | /check-availability | Check availability | No |

### Experiences (`/api/experiences`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /entry | Record entry | Kiosk |
| PUT | /:id/exit | Record exit | Kiosk |
| GET | /:id | Get experience details | Yes |
| GET | /today | Get today's visitors | Admin |
| GET | /stats | Get experience statistics | Admin |

### Board (`/api/board`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /posts | Get post list | No |
| POST | /posts | Create post | Yes |
| GET | /posts/:id | Get post details | No |
| PUT | /posts/:id | Update post | Yes (Author) |
| DELETE | /posts/:id | Delete post | Yes (Author) |
| POST | /posts/:id/comments | Add comment | Yes |
| GET | /posts/:id/comments | Get comments | No |
| DELETE | /comments/:id | Delete comment | Yes (Author) |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /users | Get user list | Admin |
| GET | /users/:id | Get user details | Admin |
| PUT | /users/:id/status | Update user status | Admin |
| GET | /reservations | Get all reservations | Admin |
| GET | /experiences | Get all experience logs | Admin |
| GET | /statistics/dashboard | Get dashboard stats | Admin |
| GET | /statistics/daily | Get daily statistics | Admin |
| GET | /statistics/programs | Get program statistics | Admin |
| GET | /logs | Get admin logs | Admin |

### Face Recognition (`/api/face`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | Register face data | Yes |
| POST | /verify | Verify face | Kiosk |
| DELETE | /:userId | Delete face data | Yes/Admin |
| GET | /status/:userId | Get registration status | Yes |

## API Response Format

### Success Response

```json
{
  "success": true,
  "code": 200,
  "message": "Request successful",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "code": 400,
  "message": "Bad request",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "password"}'
```

### Using the Token

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <your_token>"
```

## Database Schema

The database schema is defined in `../database/schema.sql`. Key tables:

- **users**: User accounts and profiles
- **face_data**: Face recognition data
- **programs**: Experience programs
- **reservations**: Program reservations
- **experience_logs**: Entry/exit records
- **board_posts**: Board posts
- **board_comments**: Post comments

## Error Handling

The API uses standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Development

### Adding a New Endpoint

1. Create a route in `src/routes/`
2. Create a controller in `src/controllers/`
3. Create a service in `src/services/` (if needed)
4. Register the route in `src/app.js`

### Running Tests

```bash
npm test
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Input validation on all endpoints
- CORS configuration for cross-origin requests
- SQL injection prevention via prepared statements