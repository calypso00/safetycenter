const express = require('express');
const cors = require('cors');
const config = require('./config');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// 라우트 가져오기
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const programRoutes = require('./routes/programRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const boardRoutes = require('./routes/boardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const faceRoutes = require('./routes/faceRoutes');

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 (개발 환경)
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/face', faceRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// API 루트
app.get('/api', (req, res) => {
  res.json({
    name: '안전체험관 자동화 시스템 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      programs: '/api/programs',
      reservations: '/api/reservations',
      experiences: '/api/experiences',
      board: '/api/board',
      admin: '/api/admin',
      face: '/api/face'
    }
  });
});

// 404 핸들러
app.use(notFoundHandler);

// 전역 에러 핸들러
app.use(errorHandler);

module.exports = app;