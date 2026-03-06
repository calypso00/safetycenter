import styled, { css } from 'styled-components';

const buttonVariants = {
  primary: css`
    background-color: var(--primary-color);
    color: white;
    &:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
  `,
  secondary: css`
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    &:hover:not(:disabled) {
      background-color: var(--border-color);
    }
  `,
  success: css`
    background-color: var(--success-color);
    color: white;
    &:hover:not(:disabled) {
      background-color: #16a34a;
    }
  `,
  danger: css`
    background-color: var(--error-color);
    color: white;
    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    &:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: white;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--text-primary);
    &:hover:not(:disabled) {
      background-color: var(--bg-tertiary);
    }
  `,
};

const buttonSizes = {
  small: css`
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  `,
  medium: css`
    padding: 0.5rem 1rem;
    font-size: 1rem;
  `,
  large: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  cursor: pointer;
  border: none;
  
  ${({ $variant }) => buttonVariants[$variant] || buttonVariants.primary}
  ${({ $size }) => buttonSizes[$size] || buttonSizes.medium}
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `}
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      type={type}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;