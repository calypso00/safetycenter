"""
이미지 처리 유틸리티 모듈
"""
import base64
import io
import os
from PIL import Image
import numpy as np


def decode_base64_image(base64_string):
    """
    Base64 인코딩된 이미지를 PIL Image로 변환
    
    Args:
        base64_string (str): Base64 인코딩된 이미지 문자열
        
    Returns:
        PIL.Image: 변환된 이미지 객체
    """
    # 데이터 URL 접두사 제거
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Base64 디코딩
    image_data = base64.b64decode(base64_string)
    
    # PIL Image로 변환
    image = Image.open(io.BytesIO(image_data))
    
    # RGB로 변환 (투명도 채널 제거)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return image


def image_to_numpy(image):
    """
    PIL Image를 NumPy 배열로 변환
    
    Args:
        image (PIL.Image): PIL 이미지 객체
        
    Returns:
        numpy.ndarray: NumPy 배열 (RGB)
    """
    return np.array(image)


def numpy_to_image(numpy_array):
    """
    NumPy 배열을 PIL Image로 변환
    
    Args:
        numpy_array (numpy.ndarray): NumPy 배열
        
    Returns:
        PIL.Image: PIL 이미지 객체
    """
    return Image.fromarray(numpy_array.astype('uint8'), 'RGB')


def save_image(image, filepath, quality=95):
    """
    이미지를 파일로 저장
    
    Args:
        image (PIL.Image): 저장할 이미지
        filepath (str): 저장 경로
        quality (int): JPEG 품질 (1-100)
        
    Returns:
        str: 저장된 파일 경로
    """
    # 디렉토리 생성
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # 이미지 저장
    image.save(filepath, quality=quality, optimize=True)
    
    return filepath


def image_to_base64(image, format='JPEG'):
    """
    PIL Image를 Base64 문자열로 변환
    
    Args:
        image (PIL.Image): PIL 이미지 객체
        format (str): 이미지 포맷 (JPEG, PNG)
        
    Returns:
        str: Base64 인코딩된 이미지 문자열
    """
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return f"data:image/{format.lower()};base64,{img_str}"


def resize_image(image, max_width=800, max_height=600):
    """
    이미지 크기 조정
    
    Args:
        image (PIL.Image): 원본 이미지
        max_width (int): 최대 너비
        max_height (int): 최대 높이
        
    Returns:
        PIL.Image: 크기가 조정된 이미지
    """
    width, height = image.size
    
    # 비율 유지하며 크기 조정
    if width > max_width or height > max_height:
        ratio = min(max_width / width, max_height / height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        image = image.resize((new_width, new_height), Image.LANCZOS)
    
    return image


def validate_image(base64_string):
    """
    Base64 이미지 유효성 검사
    
    Args:
        base64_string (str): Base64 인코딩된 이미지
        
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        image = decode_base64_image(base64_string)
        
        # 최소 크기 확인
        width, height = image.size
        if width < 50 or height < 50:
            return False, "이미지가 너무 작습니다. 최소 50x50 픽셀이 필요합니다."
        
        # 최대 크기 확인
        if width > 4096 or height > 4096:
            return False, "이미지가 너무 큽니다. 최대 4096x4096 픽셀까지 지원합니다."
        
        return True, None
        
    except Exception as e:
        return False, f"이미지 처리 중 오류가 발생했습니다: {str(e)}"
