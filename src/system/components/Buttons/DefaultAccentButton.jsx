import React from 'react';

export default function DefaultAccentButton({ children = 'Action', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`btn btn-default-accent ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}