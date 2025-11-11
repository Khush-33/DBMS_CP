import React from 'react';
import { colors } from '../../theme/tokens';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: {
      bg: colors.gray[700],
      text: colors.gray[200],
      border: colors.gray[600],
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: colors.success,
      border: 'rgba(16, 185, 129, 0.3)',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: colors.error,
      border: 'rgba(239, 68, 68, 0.3)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: colors.warning,
      border: 'rgba(245, 158, 11, 0.3)',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: colors.info,
      border: 'rgba(59, 130, 246, 0.3)',
    },
    primary: {
      bg: 'rgba(255, 107, 53, 0.1)',
      text: colors.primary,
      border: 'rgba(255, 107, 53, 0.3)',
    },
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const style = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizes[size]} ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
