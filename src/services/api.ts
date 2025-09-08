import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for large uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or other headers here if needed
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
    });

    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('🔍 Resource not found');
    } else if (error.response?.status === 500) {
      console.error('🔥 Server error');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
    } else if (!error.response) {
      console.error('🌐 Network error - server might be down');
    }

    return Promise.reject(error);
  }
);

// Generic API response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API service class
export class ApiService {
  protected client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // Generic GET request
  protected get = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await this.client.get<ApiResponse<T>>(endpoint);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic POST request
  protected post = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic POST request for FormData (file uploads)
  protected postForm = async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    try {
      console.log('postForm called with endpoint:', endpoint);
      const response = await this.client.post<ApiResponse<T>>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic PUT request
  protected put = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await this.client.put<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic DELETE request
  protected delete = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await this.client.delete<ApiResponse<T>>(endpoint);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Error handler
  private handleError = (error: any): ApiResponse<any> => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        const responseData = axiosError.response.data as any;
        return {
          success: false,
          error: responseData?.error || `Server error: ${axiosError.response.status}`,
        };
      } else if (axiosError.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'Network error - please check your connection',
        };
      }
    }
    
    // Other errors
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

export default apiClient;
