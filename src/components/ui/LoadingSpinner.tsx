/**
 * LoadingSpinner component - reusable loading indicator
 * Shows animated spinner with optional message
 */

interface LoadingSpinnerProps {
  /** Loading message to display (default: "Loading...") */
  message?: string;
  /** Size of the spinner: 'sm' | 'md' | 'lg' (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Center in viewport (default: true) */
  centered?: boolean;
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  centered = true 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <>
      <div 
        className={`animate-spin rounded-full border-b-2 border-primary-600 mx-auto mb-4 ${sizeClasses[size]}`}
        role="status"
        aria-label={message}
      />
      {message && (
        <p className="text-neutral-600 dark:text-neutral-400">{message}</p>
      )}
    </>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return <div className="text-center">{spinner}</div>;
}
