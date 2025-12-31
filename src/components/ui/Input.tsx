import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
