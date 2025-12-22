import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Define standard API response wrapper
export interface ApiResponse<T = unknown> {
    data: T;
    success?: boolean;
    message?: string;
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: '/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Response Interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    private handleError(error: AxiosError) {
        let message = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with error code
            const data = error.response.data as { message?: string };
            message = data.message || `Error ${error.response.status}`;
        } else if (error.request) {
            // Request made but no response
            message = 'Network Error: No response from server';
        }

        // Global Toast Notification for errors
        // We avoid toasting for 404s if handled locally, but typically 500s/400s should notify
        if (error.response?.status !== 404) {
            console.error('[API Error]', message);
            // Note: Toast might duplicate if UI also handles it. 
            // Ideally, we emit an event or let specific calls override this. 
            // For now, logging to console is safe.
        }
    }

    public async get<T>(url: string, params?: unknown): Promise<T> {
        const response = await this.client.get<ApiResponse<T>>(url, { params });
        // Handling our "successResponse" wrapper structure
        return response.data.data ? response.data.data : response.data as unknown as T;
    }

    public async post<T>(url: string, data?: unknown): Promise<T> {
        const response = await this.client.post<ApiResponse<T>>(url, data);
        return response.data.data ? response.data.data : response.data as unknown as T;
    }

    // ... put, delete etc
}

export const apiClient = new ApiClient();
