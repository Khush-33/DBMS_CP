import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PrimaryButton = ({ 
  to, 
  children, 
  onClick, 
  variant = 'primary', // primary, secondary, success, danger, outline
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = false,
  animate = true
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Size variants
  const sizeClasses = {
    small: 'px-4 py-2 text-sm font-medium',
    medium: 'px-8 py-3 text-base font-bold',
    large: 'px-10 py-4 text-lg font-bold'
  };

  // Color variants
  const variantClasses = {
    primary: {
      base: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
      text: 'text-white',
      shadow: 'shadow-cyan-500/25 hover:shadow-cyan-500/40',
      border: 'border-transparent',
      glow: 'hover:shadow-2xl'
    },
    secondary: {
      base: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
      text: 'text-white',
      shadow: 'shadow-orange-500/25 hover:shadow-orange-500/40',
      border: 'border-transparent',
      glow: 'hover:shadow-2xl'
    },
    success: {
      base: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      text: 'text-white',
      shadow: 'shadow-green-500/25 hover:shadow-green-500/40',
      border: 'border-transparent',
      glow: 'hover:shadow-2xl'
    },
    danger: {
      base: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      text: 'text-white',
      shadow: 'shadow-red-500/25 hover:shadow-red-500/40',
      border: 'border-transparent',
      glow: 'hover:shadow-2xl'
    },
    outline: {
      base: 'bg-transparent hover:bg-white/10',
      text: 'text-cyan-400 hover:text-white',
      shadow: 'shadow-none',
      border: 'border-2 border-cyan-500/50 hover:border-cyan-400',
      glow: 'hover:shadow-lg hover:shadow-cyan-500/20'
    }
  };

  const currentVariant = variantClasses[variant];
  const currentSize = sizeClasses[size];

  const baseClasses = `
    relative inline-flex items-center justify-center
    ${currentSize}
    ${currentVariant.base}
    ${currentVariant.text}
    ${currentVariant.border}
    ${currentVariant.shadow}
    ${fullWidth ? 'w-full' : ''}
    rounded-xl
    transition-all duration-300 ease-out
    transform
    ${animate && !disabled ? 'hover:scale-105 active:scale-95' : ''}
    ${currentVariant.glow}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isPressed && animate ? 'scale-95' : ''}
    overflow-hidden
    group
    ${className}
  `;

  const buttonContent = (
    <>
      {/* Background animation overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {/* Loading spinner */}
        {loading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
        
        {/* Left icon */}
        {icon && iconPosition === 'left' && !loading && (
          <span className="text-lg transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
        )}
        
        {/* Button text */}
        {!loading && (
          <span className="relative">
            {children}
            {/* Underline animation for outline variant */}
            {variant === 'outline' && (
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></div>
            )}
          </span>
        )}
        
        {/* Right icon */}
        {icon && iconPosition === 'right' && !loading && (
          <span className="text-lg transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </div>
      
      {/* Corner accents for primary variant */}
      {variant === 'primary' && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      )}
    </>
  );

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {buttonContent}
    </button>
  );
};

// Specialized button components
export const ActionButton = ({ children, ...props }) => (
  <PrimaryButton variant="primary" icon="⚡" iconPosition="left" {...props}>
    {children}
  </PrimaryButton>
);

export const SecondaryButton = ({ children, ...props }) => (
  <PrimaryButton variant="secondary" {...props}>
    {children}
  </PrimaryButton>
);

export const OutlineButton = ({ children, ...props }) => (
  <PrimaryButton variant="outline" {...props}>
    {children}
  </PrimaryButton>
);

export const SuccessButton = ({ children, ...props }) => (
  <PrimaryButton variant="success" icon="✓" iconPosition="left" {...props}>
    {children}
  </PrimaryButton>
);

export const DangerButton = ({ children, ...props }) => (
  <PrimaryButton variant="danger" icon="⚠" iconPosition="left" {...props}>
    {children}
  </PrimaryButton>
);

// Button with cricket-themed styling
export const CricketButton = ({ children, ...props }) => (
  <PrimaryButton 
    variant="primary" 
    icon="🏏" 
    iconPosition="left"
    className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-700 hover:via-green-600 hover:to-green-700"
    {...props}
  >
    {children}
  </PrimaryButton>
);

// Auction-specific button
export const BidButton = ({ children, ...props }) => (
  <PrimaryButton 
    variant="secondary" 
    icon="💰" 
    iconPosition="left"
    animate={true}
    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 shadow-yellow-500/25 hover:shadow-yellow-500/40"
    {...props}
  >
    {children}
  </PrimaryButton>
);

export default PrimaryButton;