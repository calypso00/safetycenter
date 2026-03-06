"""
Face Recognition Server Configuration Module
"""
import os
import sys

# Try to load python-dotenv, provide helpful error if not installed
try:
    from dotenv import load_dotenv
    # Load environment variables from .env file
    load_dotenv()
except ImportError:
    print("Error: python-dotenv is not installed.", file=sys.stderr)
    print("Please run: pip install python-dotenv", file=sys.stderr)
    print("Or install all dependencies: pip install -r requirements.txt", file=sys.stderr)
    # Fallback: continue without dotenv (environment variables must be set manually)
    load_dotenv = lambda: None  # noqa: E731
    load_dotenv()  # type: ignore[misc]

def get_env_var(name, default=None, required=False):
    """Get environment variable
    
    Args:
        name: Environment variable name
        default: Default value (optional)
        required: Whether the variable is required
        
    Returns:
        Environment variable value
    """
    value = os.getenv(name)
    if value is None:
        if required:
            raise ValueError(f"Required environment variable {name} is not set.")
        return default
    return value


class Config:
    """Base configuration"""
    # Flask settings
    SECRET_KEY = get_env_var('SECRET_KEY', required=True)
    DEBUG = get_env_var('DEBUG', 'False').lower() == 'true'
    
    # Server settings
    HOST = get_env_var('HOST', '0.0.0.0')
    PORT = int(get_env_var('PORT', '5001'))
    
    # Face recognition settings
    FACE_RECOGNITION_TOLERANCE = float(get_env_var('FACE_RECOGNITION_TOLERANCE', '0.6'))
    MODEL = get_env_var('MODEL', 'hog')  # 'hog' (fast) or 'cnn' (accurate)
    
    # Backend API settings
    BACKEND_URL = get_env_var('BACKEND_URL', 'http://localhost:3000')
    BACKEND_API_KEY = get_env_var('BACKEND_API_KEY', '')
    
    # Data storage paths
    DATA_DIR = get_env_var('DATA_DIR', './data')
    FACES_DIR = os.path.join(DATA_DIR, 'faces')
    
    # CORS settings
    CORS_ORIGINS = get_env_var('CORS_ORIGINS', '*').split(',')
    
    @staticmethod
    def init_app():
        """Create data directories on app initialization"""
        os.makedirs(Config.DATA_DIR, exist_ok=True)
        os.makedirs(Config.FACES_DIR, exist_ok=True)


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    MODEL = 'cnn'  # Use accurate model in production
    
    @classmethod
    def init_app(cls):
        """Validate production configuration"""
        super().init_app()
        
        # Production validation
        if cls.SECRET_KEY and len(cls.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in production.")
        
        if not cls.BACKEND_API_KEY:
            raise ValueError("BACKEND_API_KEY is required in production.")


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration class based on environment"""
    env = get_env_var('FLASK_ENV', 'development')
    return config_by_name.get(env, DevelopmentConfig)
