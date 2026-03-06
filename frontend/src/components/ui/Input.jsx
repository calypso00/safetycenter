import styled, { css } from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  
  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: var(--error-color);
    }
  `}
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: var(--text-light);
  }
  
  ${({ $error }) => $error && css`
    border-color: var(--error-color);
    
    &:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: var(--error-color);
`;

const HelperText = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  autoComplete,
  ...props
}) => {
  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={name} $required={required}>
          {label}
        </Label>
      )}
      <StyledInput
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete={autoComplete}
        $error={!!error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
};

export default Input;