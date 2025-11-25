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
  const baseStyles = 'px-6 py-3 rounded-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 transform hover:-translate-y-1 active:translate-y-0';
  
  const variantStyles = {
    primary: 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/40 focus:ring-sky-500/30',
    secondary: 'bg-indigo-400 hover:bg-indigo-300 text-white shadow-lg shadow-indigo-400/40 focus:ring-indigo-400/30',
    danger: 'bg-rose-400 hover:bg-rose-300 text-white shadow-lg shadow-rose-400/40 focus:ring-rose-400/30',
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