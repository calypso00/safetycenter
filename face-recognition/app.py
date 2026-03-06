"""
안면인식 Flask 서버 메인 애플리케이션
"""
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# 경로 설정
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config, get_config
from utils.face_utils import face_manager
from utils import image_utils

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config_class=None):
    """
    Flask 애플리케이션 팩토리
    
    Args:
        config_class: 설정 클래스
        
    Returns:
        Flask: Flask 애플리케이션 인스턴스
    """
    if config_class is None:
        config_class = get_config()
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # CORS 설정
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # 데이터 디렉토리 초기화
    config_class.init_app()
    
    # 요청 로깅 미들웨어
    @app.before_request
    def log_request():
        logger.info(f"[{datetime.now().isoformat()}] {request.method} {request.path}")
    
    # 에러 핸들러
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'code': 400,
            'message': '잘못된 요청입니다.',
            'error': str(error)
        }), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'code': 404,
            'message': '요청한 리소스를 찾을 수 없습니다.'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal Server Error: {error}")
        return jsonify({
            'success': False,
            'code': 500,
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500
    
    # ==================== 라우트 정의 ====================
    
    @app.route('/', methods=['GET'])
    def index():
        """서버 상태 확인"""
        return jsonify({
            'success': True,
            'message': '안면인식 서버가 정상 작동 중입니다.',
            'version': '1.0.0',
            'registered_faces': face_manager.get_encoding_count()
        })
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """헬스 체크 엔드포인트"""
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.now().isoformat()
        })
    
    @app.route('/register', methods=['POST'])
    def register_face():
        """
        얼굴 등록 API
        
        Request:
            {
                "user_id": 1,
                "image": "base64_encoded_image"
            }
        
        Response:
            {
                "success": true,
                "message": "Face registered successfully",
                "face_encoding": "..."
            }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': '요청 데이터가 없습니다.'
                }), 400
            
            user_id = data.get('user_id')
            image_base64 = data.get('image')
            
            # 파라미터 검증
            if not user_id:
                return jsonify({
                    'success': False,
                    'message': 'user_id가 필요합니다.'
                }), 400
            
            if not image_base64:
                return jsonify({
                    'success': False,
                    'message': '이미지가 필요합니다.'
                }), 400
            
            # 이미지 유효성 검사
            is_valid, error_msg = image_utils.validate_image(image_base64)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'message': error_msg
                }), 400
            
            # 이미지 디코딩
            image = image_utils.decode_base64_image(image_base64)
            image_array = image_utils.image_to_numpy(image)
            
            # 얼굴 등록
            result = face_manager.register_face(user_id, image_array)
            
            if result['success']:
                logger.info(f"Face registered for user_id: {user_id}")
                return jsonify(result), 200
            else:
                return jsonify(result), 400
                
        except Exception as e:
            logger.error(f"Error in register_face: {e}")
            return jsonify({
                'success': False,
                'message': f'얼굴 등록 중 오류가 발생했습니다: {str(e)}'
            }), 500
    
    @app.route('/verify', methods=['POST'])
    def verify_face():
        """
        얼굴 인증 API
        
        Request:
            {
                "image": "base64_encoded_image"
            }
        
        Response:
            {
                "success": true,
                "user_id": 1,
                "confidence": 0.95
            }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': '요청 데이터가 없습니다.'
                }), 400
            
            image_base64 = data.get('image')
            
            # 파라미터 검증
            if not image_base64:
                return jsonify({
                    'success': False,
                    'message': '이미지가 필요합니다.'
                }), 400
            
            # 이미지 유효성 검사
            is_valid, error_msg = image_utils.validate_image(image_base64)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'message': error_msg
                }), 400
            
            # 이미지 디코딩
            image = image_utils.decode_base64_image(image_base64)
            image_array = image_utils.image_to_numpy(image)
            
            # 얼굴 인증
            result = face_manager.verify_face(image_array)
            
            if result['success']:
                logger.info(f"Face verified: user_id={result['user_id']}, confidence={result['confidence']}")
                return jsonify(result), 200
            else:
                return jsonify(result), 404
                
        except Exception as e:
            logger.error(f"Error in verify_face: {e}")
            return jsonify({
                'success': False,
                'message': f'얼굴 인증 중 오류가 발생했습니다: {str(e)}'
            }), 500
    
    @app.route('/delete/<int:user_id>', methods=['DELETE'])
    def delete_face(user_id):
        """
        얼굴 데이터 삭제 API
        
        Response:
            {
                "success": true,
                "message": "Face data deleted successfully"
            }
        """
        try:
            result = face_manager.delete_face(user_id)
            
            if result['success']:
                logger.info(f"Face deleted for user_id: {user_id}")
                return jsonify(result), 200
            else:
                return jsonify(result), 404
                
        except Exception as e:
            logger.error(f"Error in delete_face: {e}")
            return jsonify({
                'success': False,
                'message': f'얼굴 데이터 삭제 중 오류가 발생했습니다: {str(e)}'
            }), 500
    
    @app.route('/status', methods=['GET'])
    def get_status():
        """
        서버 상태 및 등록된 얼굴 수 조회
        
        Response:
            {
                "success": true,
                "registered_faces": 10,
                "model": "hog",
                "tolerance": 0.6
            }
        """
        return jsonify({
            'success': True,
            'registered_faces': face_manager.get_encoding_count(),
            'model': Config.MODEL,
            'tolerance': Config.FACE_RECOGNITION_TOLERANCE
        })
    
    @app.route('/detect', methods=['POST'])
    def detect_faces():
        """
        이미지에서 얼굴 감지만 수행
        
        Request:
            {
                "image": "base64_encoded_image"
            }
        
        Response:
            {
                "success": true,
                "faces_detected": 1,
                "locations": [[top, right, bottom, left], ...]
            }
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'message': '요청 데이터가 없습니다.'
                }), 400
            
            image_base64 = data.get('image')
            
            if not image_base64:
                return jsonify({
                    'success': False,
                    'message': '이미지가 필요합니다.'
                }), 400
            
            # 이미지 디코딩
            image = image_utils.decode_base64_image(image_base64)
            image_array = image_utils.image_to_numpy(image)
            
            # 얼굴 감지
            face_locations = face_manager.detect_faces(image_array)
            
            return jsonify({
                'success': True,
                'faces_detected': len(face_locations),
                'locations': [list(loc) for loc in face_locations]
            })
            
        except Exception as e:
            logger.error(f"Error in detect_faces: {e}")
            return jsonify({
                'success': False,
                'message': f'얼굴 감지 중 오류가 발생했습니다: {str(e)}'
            }), 500
    
    return app


# 애플리케이션 인스턴스 생성
app = create_app()


if __name__ == '__main__':
    config = get_config()
    logger.info(f"Starting Face Recognition Server on {config.HOST}:{config.PORT}")
    logger.info(f"Debug mode: {config.DEBUG}")
    logger.info(f"Model: {config.MODEL}")
    
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
