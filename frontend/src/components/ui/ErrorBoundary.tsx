'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <AlertTriangle />
            </div>
            
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            
            <p className={styles.errorMessage}>
              We're sorry, but something unexpected happened. Our team has been notified 
              and is working to fix the issue.
            </p>

            <div className={styles.errorActions}>
              <button 
                className={styles.retryButton}
                onClick={this.handleRetry}
              >
                <RefreshCw />
                Try Again
              </button>
              
              <button 
                className={styles.homeButton}
                onClick={this.handleGoHome}
              >
                <Home />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <div className={styles.errorStack}>
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Async error caught:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

// Network error handler
export const handleNetworkError = (error: any) => {
  if (!navigator.onLine) {
    return {
      type: 'offline',
      message: 'You appear to be offline. Please check your internet connection.',
      action: 'retry'
    };
  }

  if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error occurred. Please try again.',
      action: 'retry'
    };
  }

  if (error.response?.status >= 500) {
    return {
      type: 'server',
      message: 'Server error occurred. Please try again later.',
      action: 'retry'
    };
  }

  if (error.response?.status === 404) {
    return {
      type: 'notFound',
      message: 'The requested resource was not found.',
      action: 'goBack'
    };
  }

  if (error.response?.status === 401) {
    return {
      type: 'unauthorized',
      message: 'Please log in to continue.',
      action: 'login'
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
    action: 'retry'
  };
};

// Payment error handler
export const handlePaymentError = (error: any) => {
  const errorCode = error.code || error.type;
  
  switch (errorCode) {
    case 'card_declined':
      return {
        type: 'cardDeclined',
        message: 'Your card was declined. Please try a different payment method.',
        action: 'changePayment'
      };
    
    case 'insufficient_funds':
      return {
        type: 'insufficientFunds',
        message: 'Insufficient funds. Please try a different payment method.',
        action: 'changePayment'
      };
    
    case 'expired_card':
      return {
        type: 'expiredCard',
        message: 'Your card has expired. Please use a different payment method.',
        action: 'changePayment'
      };
    
    case 'incorrect_cvc':
      return {
        type: 'incorrectCvc',
        message: 'The security code is incorrect. Please check and try again.',
        action: 'retry'
      };
    
    case 'processing_error':
      return {
        type: 'processingError',
        message: 'Payment processing error. Please try again.',
        action: 'retry'
      };
    
    default:
      return {
        type: 'paymentError',
        message: 'Payment failed. Please try again or use a different payment method.',
        action: 'retry'
      };
  }
};
