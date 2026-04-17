import styled, { css } from 'styled-components';
import { useToast } from '../../store/ToastContext';

const ToastContainer = styled.div`
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  right: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(400px, calc(100vw - 2rem));

  @media (max-width: 768px) {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100vw - 1.5rem);
    max-width: 36rem;
  }
`;

const toastTypes = {
  success: css`
    background-color: #dcfce7;
    border-left: 4px solid var(--success-color);
    color: #166534;
  `,
  error: css`
    background-color: #fee2e2;
    border-left: 4px solid var(--error-color);
    color: #991b1b;
  `,
  warning: css`
    background-color: #fef3c7;
    border-left: 4px solid var(--warning-color);
    color: #92400e;
  `,
  info: css`
    background-color: #dbeafe;
    border-left: 4px solid var(--info-color);
    color: #1e40af;
  `,
};

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  animation: slideIn 0.3s ease-in-out;

  ${({ $type }) => toastTypes[$type] || toastTypes.info}

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    border-left-width: 0;
    border-top: 4px solid
      ${({ $type }) => {
        if ($type === 'success') return 'var(--success-color)';
        if ($type === 'error') return 'var(--error-color)';
        if ($type === 'warning') return 'var(--warning-color)';

        return 'var(--info-color)';
      }};
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  }
`;

const ToastMessage = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  font-size: 1rem;
  color: inherit;
  opacity: 0.7;
  transition: var(--transition);
  
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '×';
  }
`;

const Toast = () => {
  const { toasts, removeToast } = useToast();

  return (
    <ToastContainer role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} $type={toast.type} role="alert">
          <ToastMessage>{toast.message}</ToastMessage>
          <CloseButton
            type="button"
            aria-label="토스트 메시지 닫기"
            onClick={() => removeToast(toast.id)}
          />
        </ToastItem>
      ))}
    </ToastContainer>
  );
};

export default Toast;
