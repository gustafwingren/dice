'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You could send error reports to a service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-linear-to-b from-danger-50 to-white dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                We encountered an unexpected error. Don&apos;t worry, your dice are safe!
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg text-left">
                  <p className="font-semibold text-danger-700 dark:text-danger-400 mb-2">
                    Error Details (Development Only):
                  </p>
                  <pre className="text-xs text-danger-600 dark:text-danger-300 overflow-x-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-danger-600 dark:text-danger-400 font-medium">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-danger-600 dark:text-danger-300 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="secondary"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="primary"
                  size="lg"
                >
                  Reload Page
                </Button>
              </div>

              <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                If this problem persists, try clearing your browser cache or using a different browser.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
