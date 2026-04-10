import axios from 'axios';

// 동적으로 API URL 설정
// 환경 변수가 있으면 사용, 없으면 현재 호스트 기반으로 URL 생성
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // 현재 접속한 호스트 기반으로 API URL 생성
  const protocol = window.location.protocol; // 'http:' 또는 'https:'
  const hostname = window.location.hostname;
  const port = import.meta.env.VITE_API_PORT || '3000';
  
  return `${protocol}//${hostname}:${port}/api`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 토큰 만료 여부 확인 헬퍼 함수
const isTokenExpiredError = (error) => {
  if (!error.response) return false;
  
  const status = error.response.status;
  const message = error.response.data?.message || '';
  
  // 401 상태 코드 또는 토큰 만료 관련 메시지
  return status === 401 || 
         message.includes('토큰이 만료') || 
         message.includes('만료된 토큰') ||
         message.includes('TokenExpiredError');
};

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 에러 시 토큰 갱신 시도
    if (isTokenExpiredError(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 세션 만료 이벤트 발생
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // 세션 만료 이벤트 발생
        window.dispatchEvent(new CustomEvent('session-expired', {
          detail: { message: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.' }
        }));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
