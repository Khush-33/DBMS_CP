import React from 'react';
import { Link } from 'react-router-dom';

const PrimaryButton = ({ 
  to, 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = false
}) => {

  const sizeClasses = {
    small: 'text-sm px-4 py-2',
    medium: 'text-base px-6 py-3',
    large: 'text-lg px-8 py-4'
  };

  let buttonClass = 'btn ' + sizeClasses[size];
  
  if (variant === 'primary') buttonClass += ' btn-primary';
  else if (variant === 'secondary') buttonClass += ' btn-secondary';
  else if (variant === 'success') buttonClass += ' btn-success';
  else if (variant === 'error') buttonClass += ' btn-error';
  else if (variant === 'outline') buttonClass += ' btn-outline';
  
  if (fullWidth) buttonClass += ' w-full';
  if (disabled) buttonClass += ' opacity-50 cursor-not-allowed';
  if (className) buttonClass += ' ' + className;

  const buttonContent = (
    <>
      {loading && (
        <span className="animate-spin mr-2">⏳</span>
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={buttonClass}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClass}
    >
      {buttonContent}
    </button>
  );
};

// Specialized button components
export const ActionButton = ({ children, ...props }) => (
  <PrimaryButton variant="primary" {...props}>
    {children}
  </PrimaryButton>
);

export const OutlineButton = ({ children, ...props }) => (
  <PrimaryButton variant="outline" {...props}>
    {children}
  </PrimaryButton>
);

export default PrimaryButton;