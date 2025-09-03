import { useState, useCallback, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, AppError, ErrorHandler } from '../utils/errorHandler';

// API state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

// API hook return type
interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Custom hook for handling API operations with loading states and error handling
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<{ success: boolean; data?: T; error?: string }>,
  options: {
    showToast?: boolean;
    context?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
  } = {}
): UseApiReturn<T> {
  const { showToast = true, context, onSuccess, onError } = options;
  const { showToast: showToastMessage } = useToast();

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use useRef to store the latest apiFunction to avoid dependency issues
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFunctionRef.current(...args);

      if (response.success && response.data !== undefined) {
        setState(prev => ({ ...prev, data: response.data!, loading: false }));
        
        if (onSuccess) {
          onSuccess(response.data);
        }

        if (showToast) {
          showToastMessage('✅ Operation completed successfully!', 'success');
        }

        return response.data;
      } else {
        const error: AppError = {
          type: 'UNKNOWN' as any,
          message: response.error || 'Operation failed',
          timestamp: new Date().toISOString(),
        };

        setState(prev => ({ ...prev, error, loading: false }));

        if (onError) {
          onError(error);
        }

        if (showToast) {
          showToastMessage(ErrorHandler.getUserFriendlyMessage(error), 'error');
        }

        return null;
      }
    } catch (error) {
      const appError = handleApiError(error, context);
      setState(prev => ({ ...prev, error: appError, loading: false }));

      if (onError) {
        onError(appError);
      }

      if (showToast) {
        showToastMessage(ErrorHandler.getUserFriendlyMessage(appError), 'error');
      }

      return null;
    }
  }, [showToast, context, onSuccess, onError, showToastMessage]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for handling multiple API operations
 */
export function useMultipleApi<T>(
  apiFunctions: Array<(...args: any[]) => Promise<{ success: boolean; data?: T; error?: string }>>,
  options: {
    showToast?: boolean;
    context?: string;
    onSuccess?: (results: Array<T | null>) => void;
    onError?: (errors: AppError[]) => void;
  } = {}
) {
  const { showToast = true, context, onSuccess, onError } = options;
  const { showToast: showToastMessage } = useToast();

  const [state, setState] = useState<{
    data: Array<T | null>;
    loading: boolean;
    errors: AppError[];
  }>({
    data: [],
    loading: false,
    errors: [],
  });

  const executeAll = useCallback(async (...args: any[]): Promise<Array<T | null>> => {
    setState(prev => ({ ...prev, loading: true, errors: [] }));

    try {
      const results = await Promise.allSettled(
        apiFunctions.map(apiFunction => apiFunction(...args))
      );

      const data: Array<T | null> = [];
      const errors: AppError[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          if (response.success && response.data !== undefined) {
            data[index] = response.data;
          } else {
            data[index] = null;
            errors.push({
              type: 'UNKNOWN' as any,
              message: response.error || 'Operation failed',
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          data[index] = null;
          const appError = handleApiError(result.reason, `${context}-${index}`);
          errors.push(appError);
        }
      });

      setState(prev => ({ ...prev, data, errors, loading: false }));

      if (errors.length === 0 && onSuccess) {
        onSuccess(data);
      }

      if (errors.length > 0 && onError) {
        onError(errors);
      }

      if (showToast) {
        if (errors.length === 0) {
          showToastMessage('✅ All operations completed successfully!', 'success');
        } else {
          showToastMessage(`⚠️ ${errors.length} operation(s) failed`, 'error');
        }
      }

      return data;
    } catch (error) {
      const appError = handleApiError(error, context);
      setState(prev => ({ ...prev, errors: [appError], loading: false }));

      if (onError) {
        onError([appError]);
      }

      if (showToast) {
        showToastMessage(ErrorHandler.getUserFriendlyMessage(appError), 'error');
      }

      return [];
    }
  }, [apiFunctions, showToast, context, onSuccess, onError, showToastMessage]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      errors: [],
    });
  }, []);

  return {
    ...state,
    executeAll,
    reset,
  };
}

export default useApi;
