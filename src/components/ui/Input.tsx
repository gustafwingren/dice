import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showCharacterCount?: boolean;
  helperText?: string;
  floatingLabel?: boolean;
}

/**
 * Accessible Input component with validation states, character counter, and floating label option
 */
export function Input({
  label,
  error,
  showCharacterCount,
  helperText,
  floatingLabel = false,
  className = '',
  maxLength,
  value,
  id,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-danger`;
  const helperId = `${inputId}-helper`;
  
  const currentLength = typeof value === 'string' ? value.length : 0;
  const hasValue = typeof value === 'string' ? value.length > 0 : false;
  
  const baseStyles = 'block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ease-in-out min-h-[44px] bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
  const normalStyles = 'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500 hover:border-neutral-400 dark:hover:border-neutral-500';
  const errorStyles = 'border-danger-500 dark:border-danger-400 focus:border-danger-500 focus:ring-danger-500';
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  // Floating label variant
  if (floatingLabel && label) {
    return (
      <div className="w-full relative">
        <input
          id={inputId}
          className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className} ${floatingLabel ? 'pt-6 pb-2' : ''}`}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused || hasValue ? props.placeholder : ''}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-3 transition-all duration-200 ease-in-out pointer-events-none ${
            isFocused || hasValue
              ? 'top-1.5 text-xs font-medium text-primary-600 dark:text-primary-400'
              : 'top-3 text-base text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {label}
        </label>
        
        <div className="mt-1 flex justify-between items-start">
          <div className="flex-1">
            {error && (
              <p id={errorId} className="text-sm text-danger-600 dark:text-danger-400 animate-in slide-in-from-top-1 fade-in duration-200" role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={helperId} className="text-sm text-neutral-500 dark:text-neutral-400">
                {helperText}
              </p>
            )}
          </div>
          
          {showCharacterCount && maxLength && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-2 shrink-0" aria-live="polite">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Standard label variant
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      
      <div className="mt-1 flex justify-between items-start">
        <div className="flex-1">
          {error && (
            <p id={errorId} className="text-sm text-danger-600 dark:text-danger-400 animate-in slide-in-from-top-1 fade-in duration-200" role="alert">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={helperId} className="text-sm text-neutral-500 dark:text-neutral-400">
              {helperText}
            </p>
          )}
        </div>
        
        {showCharacterCount && maxLength && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-2 shrink-0" aria-live="polite">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
