// components/Input.tsx
import React, { ForwardedRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

// Fix: Use React.forwardRef to allow the component to accept a ref prop.
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      // Fix: Pass the forwarded ref to the native input element.
      ref={ref}
      className={`w-full p-4 text-2xl text-center border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 bg-white text-gray-800 placeholder-gray-400 shadow-sm transition-all duration-200 ${className}`}
      {...props}
    />
  );
});

// Add a display name for better debugging in React DevTools.
Input.displayName = 'Input';

export default Input;