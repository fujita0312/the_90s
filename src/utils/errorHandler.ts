import { AxiosError } from 'axios';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  statusCode?: number;
  timestamp: string;
}

// Error handler class
export class ErrorHandler {
  /**
   * Handle axios errors and convert them to AppError
   */
  static handleAxiosError(error: AxiosError): AppError {
    const timestamp = new Date().toISOString();

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const responseData = error.response.data as any;
      
      switch (status) {
        case 400:
          return {
            type: ErrorType.VALIDATION,
            message: responseData?.error || 'Invalid request data',
            details: responseData?.details,
            statusCode: status,
            timestamp,
          };
        case 401:
          return {
            type: ErrorType.AUTHENTICATION,
            message: 'Authentication required',
            statusCode: status,
            timestamp,
          };
        case 403:
          return {
            type: ErrorType.AUTHORIZATION,
            message: 'Access denied',
            statusCode: status,
            timestamp,
          };
        case 404:
          return {
            type: ErrorType.NOT_FOUND,
            message: responseData?.error || 'Resource not found',
            statusCode: status,
            timestamp,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ErrorType.SERVER,
            message: 'Server error occurred',
            details: responseData?.error,
            statusCode: status,
            timestamp,
          };
        default:
          return {
            type: ErrorType.SERVER,
            message: responseData?.error || `Server error: ${status}`,
            statusCode: status,
            timestamp,
          };
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        type: ErrorType.NETWORK,
        message: 'Network error - please check your connection',
        details: 'Unable to reach the server',
        timestamp,
      };
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      return {
        type: ErrorType.TIMEOUT,
        message: 'Request timeout',
        details: 'The request took too long to complete',
        timestamp,
      };
    }

    // Other errors
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred',
      timestamp,
    };
  }

  /**
   * Handle generic errors
   */
  static handleGenericError(error: any): AppError {
    const timestamp = new Date().toISOString();

    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        timestamp,
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      timestamp,
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '🌐 Connection problem! Please check your internet connection and try again.';
      case ErrorType.SERVER:
        return '🔥 Server is having issues! Please try again in a few moments.';
      case ErrorType.VALIDATION:
        return `⚠️ ${error.message}`;
      case ErrorType.AUTHENTICATION:
        return '🔐 Please log in to continue.';
      case ErrorType.AUTHORIZATION:
        return '🚫 You don\'t have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return '🔍 The requested resource was not found.';
      case ErrorType.TIMEOUT:
        return '⏰ Request timed out! Please try again.';
      default:
        return `❌ ${error.message}`;
    }
  }

  /**
   * Log error for debugging
   */
  static logError(error: AppError, context?: string): void {
    const logMessage = context 
      ? `[${context}] ${error.type}: ${error.message}`
      : `${error.type}: ${error.message}`;
    
    console.error(logMessage, {
      details: error.details,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
    });
  }
}

// Utility function to handle API errors
export const handleApiError = (error: any, context?: string): AppError => {
  let appError: AppError;

  if (error.isAxiosError) {
    appError = ErrorHandler.handleAxiosError(error);
  } else {
    appError = ErrorHandler.handleGenericError(error);
  }

  ErrorHandler.logError(appError, context);
  return appError;
};

export default ErrorHandler;
