import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '' }) => {
  const baseStyles = 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const themeStyles = disabled
    ? 'bg-indigo-400 cursor-not-allowed'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${themeStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;