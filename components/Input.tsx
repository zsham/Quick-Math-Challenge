// components/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 ${className}`}
      {...props}
    />
  );
};

export default Input;
