import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
`;

const VideoElement = styled.video`
  width: 100%;
  height: auto;
  border-radius: 12px;
  background: #000;
  transform: scaleX(-1); /* Mirror effect */
`;

const CanvasElement = styled.canvas`
  display: none;
`;

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 320px;
  border: 3px solid ${props => props.$detected ? '#4CAF50' : '#fff'};
  border-radius: 50% 50% 45% 45%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  transition: border-color 0.3s ease;
`;

const CaptureButton = styled.button`
  display: block;
  width: 70px;
  height: 70px;
  margin: 20px auto 0;
  border-radius: 50%;
  background: ${props => props.$disabled ? '#ccc' : '#fff'};
  border: 4px solid ${props => props.$disabled ? '#999' : '#4CAF50'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => props.$disabled ? '#999' : '#4CAF50'};
    transition: all 0.2s ease;
  }
  
  &:hover::after {
    width: 45px;
    height: 45px;
  }
`;

const StatusText = styled.p`
  text-align: center;
  margin-top: 15px;
  font-size: 16px;
  color: ${props => props.$error ? '#f44336' : '#666'};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #f5f5f5;
  border-radius: 12px;
  color: #f44336;
`;

/**
 * CameraCapture - webcam capture component for face recognition
 */
const CameraCapture = ({ onCapture, onError, autoCapture = false, captureInterval = 2000 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const streamRef = useRef(null);
  const autoCaptureRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsStreaming(true);
          setError(null);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Camera access failed.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera device found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another application.';
      }
      
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (autoCaptureRef.current) {
      clearInterval(autoCaptureRef.current);
      autoCaptureRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image (because video is mirrored)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    return imageData;
  }, [isStreaming]);

  // Handle capture button click
  const handleCapture = useCallback(() => {
    const imageData = captureImage();
    if (imageData && onCapture) {
      onCapture(imageData);
    }
  }, [captureImage, onCapture]);

  // Auto capture mode
  useEffect(() => {
    if (autoCapture && isStreaming) {
      autoCaptureRef.current = setInterval(() => {
        const imageData = captureImage();
        if (imageData && onCapture) {
          onCapture(imageData);
        }
      }, captureInterval);

      return () => {
        if (autoCaptureRef.current) {
          clearInterval(autoCaptureRef.current);
        }
      };
    }
  }, [autoCapture, isStreaming, captureInterval, captureImage, onCapture]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  if (error) {
    return (
      <CameraContainer>
        <ErrorMessage>
          <p>Camera Error</p>
          <p>{error}</p>
        </ErrorMessage>
      </CameraContainer>
    );
  }

  return (
    <CameraContainer>
      <VideoElement
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />
      <Overlay $detected={faceDetected} />
      <CanvasElement ref={canvasRef} />
      
      {!autoCapture && (
        <CaptureButton
          onClick={handleCapture}
          $disabled={!isStreaming}
          disabled={!isStreaming}
          aria-label="Capture"
        />
      )}
      
      <StatusText $error={false}>
        {isStreaming 
          ? (autoCapture 
              ? 'Position your face within the frame...' 
              : 'Click the button to capture')
          : 'Starting camera...'}
      </StatusText>
    </CameraContainer>
  );
};

export default CameraCapture;