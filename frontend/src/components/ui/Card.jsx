import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: var(--transition);
  
  ${({ $hoverable }) => $hoverable && `
    cursor: pointer;
    
    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
  `}
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
`;

const CardImage = styled.div`
  width: 100%;
  height: ${({ $height }) => $height || '200px'};
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: center;
  background-color: var(--bg-tertiary);
`;

const Card = ({
  children,
  title,
  subtitle,
  image,
  imageHeight,
  footer,
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <CardContainer $hoverable={hoverable} onClick={onClick} {...props}>
      {image && <CardImage src={image} $height={imageHeight} />}
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

export default Card;