import styled, { css } from 'styled-components';

const spinnerSizes = {
  small: '1.5rem',
  medium: '2.5rem',
  large: '3.5rem',
};

const Spinner = styled.div`
  width: ${({ $size }) => spinnerSizes[$size] || spinnerSizes.medium};
  height: ${({ $size }) => spinnerSizes[$size] || spinnerSizes.medium};
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
`;

const Text = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const Loading = ({ size = 'medium', text, fullScreen = false }) => {
  const content = (
    <Container>
      <Spinner $size={size} />
      {text && <Text>{text}</Text>}
    </Container>
  );

  if (fullScreen) {
    return <Overlay>{content}</Overlay>;
  }

  return content;
};

export default Loading;