# Safety Experience Frontend

Frontend application for the Safety Experience Automation System.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: Styled Components
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form

## Project Structure

```
frontend/
|-- public/                     # Static assets
|   |-- vite.svg
|
|-- src/
|   |-- components/             # Reusable components
|   |   |-- common/             # Common components (future use)
|   |   |-- layout/             # Layout components
|   |   |   |-- Header.jsx      # Header component
|   |   |   |-- Footer.jsx      # Footer component
|   |   |   |-- Layout.jsx      # Main layout wrapper
|   |   |   |-- index.js        # Exports
|   |   |
|   |   |-- ui/                 # UI components
|   |   |   |-- Button.jsx      # Button component
|   |   |   |-- Card.jsx        # Card component
|   |   |   |-- Input.jsx       # Input component
|   |   |   |-- Loading.jsx     # Loading spinner
|   |   |   |-- Modal.jsx       # Modal dialog
|   |   |   |-- Toast.jsx       # Toast notification
|   |   |   |-- index.js        # Exports
|   |   |
|   |   |-- kiosk/              # Kiosk-specific components
|   |       |-- CameraCapture.jsx      # Camera capture
|   |       |-- FaceRecognitionPanel.jsx # Face recognition UI
|   |       |-- index.js        # Exports
|   |
|   |-- pages/                  # Page components
|   |   |-- Home.jsx            # Home page
|   |   |-- Login.jsx           # Login page
|   |   |-- Register.jsx        # Registration page
|   |   |-- Programs.jsx        # Program list page
|   |   |-- Reservation.jsx     # Reservation page
|   |   |-- MyPage.jsx          # User mypage
|   |   |-- Board.jsx           # Board list page
|   |   |-- PostDetail.jsx      # Post detail page
|   |   |-- Kiosk.jsx           # Kiosk page
|   |   |-- Admin/              # Admin pages
|   |       |-- Dashboard.jsx   # Admin dashboard
|   |       |-- UserManagement.jsx # User management
|   |       |-- index.js        # Exports
|   |
|   |-- services/               # API service modules
|   |   |-- api.js              # Axios instance & interceptors
|   |   |-- authService.js      # Auth API calls
|   |   |-- userService.js      # User API calls
|   |   |-- programService.js   # Program API calls
|   |   |-- reservationService.js # Reservation API calls
|   |   |-- experienceService.js # Experience API calls
|   |   |-- boardService.js     # Board API calls
|   |   |-- adminService.js     # Admin API calls
|   |   |-- faceService.js      # Face recognition API calls
|   |
|   |-- store/                  # State management
|   |   |-- AuthContext.jsx     # Authentication state
|   |   |-- ToastContext.jsx    # Toast notification state
|   |
|   |-- styles/                 # Global styles
|   |   |-- GlobalStyles.js     # Global styled-components
|   |
|   |-- utils/                  # Utility functions (future use)
|   |
|   |-- App.jsx                 # Root component with routing
|   |-- main.jsx                # Entry point
|   |-- App.css                 # App styles
|   |-- index.css               # Global CSS
|
|-- index.html                  # HTML template
|-- vite.config.js              # Vite configuration
|-- eslint.config.js            # ESLint configuration
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
| VITE_API_URL | Backend API URL | http://localhost:3000/api |

## Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Pages Overview

### User Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with program highlights |
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Programs | `/programs` | Browse experience programs |
| Reservation | `/reservation/:programId` | Make a reservation |
| MyPage | `/mypage` | User profile and history |
| Board | `/board` | Q&A board |
| Post Detail | `/board/:postId` | View post details |

### Admin Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Admin dashboard with statistics |
| User Management | `/admin/users` | Manage users |

### Kiosk Pages

| Page | Route | Description |
|------|-------|-------------|
| Kiosk | `/kiosk` | Face recognition entry/exit |

## Component Architecture

### Layout Components

```jsx
// Layout wrapper
<Layout>
  <Header />
  <main>{children}</main>
  <Footer />
</Layout>
```

### UI Components

#### Button
```jsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>
```

#### Input
```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
/>
```

#### Modal
```jsx
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  Modal content here
</Modal>
```

#### Toast
```jsx
// Use via ToastContext
const { showToast } = useToast();
showToast('Success!', 'success');
```

### Kiosk Components

#### CameraCapture
```jsx
<CameraCapture
  onCapture={handleCapture}
  isActive={isActive}
/>
```

#### FaceRecognitionPanel
```jsx
<FaceRecognitionPanel
  onRecognitionSuccess={handleSuccess}
  onRecognitionFailure={handleFailure}
/>
```

## State Management

### AuthContext

Provides authentication state and methods:

```jsx
const {
  user,           // Current user object
  isAuthenticated, // Boolean auth state
  login,          // Login function
  logout,         // Logout function
  loading         // Loading state
} = useAuth();
```

### ToastContext

Provides toast notification functionality:

```jsx
const {
  showToast,  // Show toast: (message, type)
  success,    // Success toast
  error,      // Error toast
  warning,    // Warning toast
  info        // Info toast
} = useToast();
```

## API Services

### Using API Services

```jsx
import authService from '../services/authService';
import reservationService from '../services/reservationService';

// Login
const result = await authService.login({ username, password });

// Get reservations
const reservations = await reservationService.getMyReservations();
```

### API Instance Configuration

The API instance in `services/api.js` is configured with:
- Base URL from environment variable
- Automatic JWT token attachment
- Request/response interceptors
- Error handling

## Routing

Routes are defined in `App.jsx`:

```jsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected routes (require authentication) */}
  <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
  
  {/* Admin routes */}
  <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />
  
  {/* Kiosk routes */}
  <Route path="/kiosk" element={<Kiosk />} />
</Routes>
```

## Styling

The application uses Styled Components for styling:

```jsx
import styled from 'styled-components';

const StyledCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
```

Global styles are defined in `styles/GlobalStyles.js`.

## Development Guidelines

### Adding a New Page

1. Create the page component in `src/pages/`
2. Add the route in `App.jsx`
3. Create corresponding service if API calls are needed

### Adding a New Component

1. Create the component in appropriate folder under `src/components/`
2. Export from `index.js` if needed
3. Import and use in pages

### Form Handling

Use React Hook Form for forms:

```jsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  // Handle form submission
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('fieldName', { required: true })} />
  {errors.fieldName && <span>This field is required</span>}
  <button type="submit">Submit</button>
</form>
```

## Build & Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Docker Deployment

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
