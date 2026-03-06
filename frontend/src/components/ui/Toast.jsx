import styled, { css } from 'styled-components';
import { useToast } from '../../store/ToastContext';

const ToastContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  min-width: 300px;
  max-width: 400px;
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
`;

const ToastMessage = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
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
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} $type={toast.type}>
          <ToastMessage>{toast.message}</ToastMessage>
          <CloseButton onClick={() => removeToast(toast.id)} />
        </ToastItem>
      ))}
    </ToastContainer>
  );
};

export default Toast;