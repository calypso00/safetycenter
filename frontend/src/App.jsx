import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ToastProvider } from './store/ToastContext';
import GlobalStyles from './styles/GlobalStyles';
import Toast from './components/ui/Toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Reservation from './pages/Reservation';
import MyPage from './pages/MyPage';
import Board from './pages/Board';
import PostDetail from './pages/PostDetail';
import Programs from './pages/Programs';
import Kiosk from './pages/Kiosk';
import Dashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ReservationManagement from './pages/Admin/ReservationManagement';
import ProgramManagement from './pages/Admin/ProgramManagement';
import BoardManagement from './pages/Admin/BoardManagement';
import Statistics from './pages/Admin/Statistics';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      로딩 중...
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      로딩 중...
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/programs/:id" element={<Programs />} />
      <Route path="/board" element={<Board />} />
      <Route path="/board/:id" element={<PostDetail />} />
      
      {/* Protected Routes */}
      <Route
        path="/reservation"
        element={
          <ProtectedRoute>
            <Reservation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mypage/reservations"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      
      {/* Kiosk Route - Public access */}
      <Route path="/kiosk" element={<Kiosk />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <AdminRoute>
            <ReservationManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/programs"
        element={
          <AdminRoute>
            <ProgramManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/board"
        element={
          <AdminRoute>
            <BoardManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <AdminRoute>
            <Statistics />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <GlobalStyles />
          <Toast />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
