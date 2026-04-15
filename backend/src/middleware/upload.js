const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PROGRAMS_UPLOAD_DIR = path.join(UPLOAD_DIR, 'programs');

// 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(PROGRAMS_UPLOAD_DIR)) {
  fs.mkdirSync(PROGRAMS_UPLOAD_DIR, { recursive: true });
}

// 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROGRAMS_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'program-' + uniqueSuffix + ext);
  }
});

// 파일 필터 - 이미지만 허용
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용되지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'), false);
  }
};

// multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// 에러 핸들러
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기는 5MB를 초과할 수 없습니다.'
      });
    }
    return res.status(400).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다: ' + err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadSingle: upload.single('thumbnail'),
  handleUploadError
};
