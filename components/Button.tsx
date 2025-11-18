// components/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-4';
  
  const variantStyles = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 focus:ring-emerald-500/30',
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/50 focus:ring-blue-500/30',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50 focus:ring-red-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
