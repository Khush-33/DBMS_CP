import React from 'react';

const FilterChip = ({ label, onRemove, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-sm text-orange-300 ${className}`}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-orange-500/30 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default FilterChip;
