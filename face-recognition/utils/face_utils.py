"""
안면인식 유틸리티 모듈
"""
import json
import os
from datetime import datetime
import face_recognition
import numpy as np
from config import Config


class FaceRecognitionManager:
    """안면인식 관리 클래스"""
    
    def __init__(self):
        self.tolerance = Config.FACE_RECOGNITION_TOLERANCE
        self.model = Config.MODEL
        self.known_encodings = {}  # user_id -> face_encoding
        self.load_known_faces()
    
    def load_known_faces(self):
        """
        저장된 얼굴 인코딩 로드
        """
        faces_file = os.path.join(Config.DATA_DIR, 'face_encodings.json')
        if os.path.exists(faces_file):
            try:
                with open(faces_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # JSON 문자열을 NumPy 배열로 변환
                    for user_id, encoding_str in data.items():
                        self.known_encodings[int(user_id)] = np.array(json.loads(encoding_str))
                print(f"Loaded {len(self.known_encodings)} face encodings")
            except json.JSONDecodeError as e:
                print(f"Error: Face encoding file is corrupted: {e}")
                # 손상된 파일 백업 및 초기화
                self._backup_corrupted_file(faces_file)
                self.known_encodings = {}
            except Exception as e:
                print(f"Error loading face encodings: {e}")
                self.known_encodings = {}
    
    def _backup_corrupted_file(self, filepath):
        """손상된 파일 백업"""
        try:
            backup_path = f"{filepath}.corrupted.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.rename(filepath, backup_path)
            print(f"Corrupted file backed up to: {backup_path}")
        except Exception as e:
            print(f"Failed to backup corrupted file: {e}")
    
    def save_known_faces(self):
        """
        얼굴 인코딩을 파일로 저장
        """
        faces_file = os.path.join(Config.DATA_DIR, 'face_encodings.json')
        try:
            # NumPy 배열을 JSON 문자열로 변환
            data = {}
            for user_id, encoding in self.known_encodings.items():
                data[str(user_id)] = json.dumps(encoding.tolist())
            
            with open(faces_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving face encodings: {e}")
    
    def detect_faces(self, image_array):
        """
        이미지에서 얼굴 감지
        
        Args:
            image_array (numpy.ndarray): RGB 이미지 배열
            
        Returns:
            list: 감지된 얼굴 위치 리스트 [(top, right, bottom, left), ...]
        """
        face_locations = face_recognition.face_locations(
            image_array,
            model=self.model
        )
        return face_locations
    
    def extract_encoding(self, image_array, face_location=None):
        """
        얼굴에서 특징 추출 (128차원 벡터)
        
        Args:
            image_array (numpy.ndarray): RGB 이미지 배열
            face_location (tuple): 얼굴 위치 (top, right, bottom, left)
            
        Returns:
            numpy.ndarray: 128차원 얼굴 인코딩 벡터
        """
        if face_location:
            encodings = face_recognition.face_encodings(
                image_array,
                known_face_locations=[face_location]
            )
        else:
            encodings = face_recognition.face_encodings(image_array)
        
        if len(encodings) > 0:
            return encodings[0]
        return None
    
    def register_face(self, user_id, image_array):
        """
        얼굴 등록
        
        Args:
            user_id (int): 사용자 ID
            image_array (numpy.ndarray): RGB 이미지 배열
            
        Returns:
            dict: 등록 결과
        """
        # 얼굴 감지
        face_locations = self.detect_faces(image_array)
        
        if len(face_locations) == 0:
            return {
                'success': False,
                'message': '이미지에서 얼굴을 감지할 수 없습니다.'
            }
        
        if len(face_locations) > 1:
            return {
                'success': False,
                'message': '여러 개의 얼굴이 감지되었습니다. 한 명만 등록해주세요.'
            }
        
        # 얼굴 특징 추출
        encoding = self.extract_encoding(image_array, face_locations[0])
        
        if encoding is None:
            return {
                'success': False,
                'message': '얼굴 특징 추출에 실패했습니다.'
            }
        
        # 저장
        self.known_encodings[user_id] = encoding
        self.save_known_faces()
        
        return {
            'success': True,
            'message': '얼굴이 성공적으로 등록되었습니다.',
            'face_encoding': json.dumps(encoding.tolist())
        }
    
    def verify_face(self, image_array):
        """
        얼굴 인증
        
        Args:
            image_array (numpy.ndarray): RGB 이미지 배열
            
        Returns:
            dict: 인증 결과
        """
        # 얼굴 감지
        face_locations = self.detect_faces(image_array)
        
        if len(face_locations) == 0:
            return {
                'success': False,
                'message': '이미지에서 얼굴을 감지할 수 없습니다.'
            }
        
        # 얼굴 특징 추출
        encoding = self.extract_encoding(image_array, face_locations[0])
        
        if encoding is None:
            return {
                'success': False,
                'message': '얼굴 특징 추출에 실패했습니다.'
            }
        
        # 등록된 얼굴과 매칭
        best_match = None
        best_distance = self.tolerance
        
        for user_id, known_encoding in self.known_encodings.items():
            # 유클리드 거리 계산
            distance = face_recognition.face_distance([known_encoding], encoding)[0]
            
            if distance < best_distance:
                best_distance = distance
                best_match = user_id
        
        if best_match is not None:
            confidence = 1 - best_distance
            return {
                'success': True,
                'user_id': best_match,
                'confidence': round(confidence, 4),
                'distance': round(best_distance, 4),
                'message': '얼굴 인증 성공'
            }
        
        return {
            'success': False,
            'message': '등록된 얼굴과 일치하는 사용자를 찾을 수 없습니다.'
        }
    
    def delete_face(self, user_id):
        """
        등록된 얼굴 삭제
        
        Args:
            user_id (int): 사용자 ID
            
        Returns:
            dict: 삭제 결과
        """
        if user_id in self.known_encodings:
            del self.known_encodings[user_id]
            self.save_known_faces()
            return {
                'success': True,
                'message': '얼굴 데이터가 삭제되었습니다.'
            }
        
        return {
            'success': False,
            'message': '등록된 얼굴 데이터가 없습니다.'
        }
    
    def get_encoding_count(self):
        """
        등록된 얼굴 인코딩 개수 반환
        
        Returns:
            int: 등록된 얼굴 개수
        """
        return len(self.known_encodings)


# 싱글톤 인스턴스
face_manager = FaceRecognitionManager()
