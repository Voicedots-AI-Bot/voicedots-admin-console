export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Base API client with JWT token management.
 */
class ApiClient {
    private getToken(): string | null {
        return localStorage.getItem('voicedots_token');
    }

    private getHeaders(extra?: Record<string, string>, isFormData: boolean = false): Record<string, string> {
        const headers: Record<string, string> = {
            ...extra,
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 401) {
            localStorage.removeItem('voicedots_token');
            localStorage.removeItem('voicedots_email');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    async get<T>(path: string): Promise<T> {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(res);
    }

    async post<T>(path: string, body?: unknown): Promise<T> {
        const isFormData = body instanceof FormData;
        const res = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: this.getHeaders({}, isFormData),
            body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
        });
        return this.handleResponse<T>(res);
    }

    async put<T>(path: string, body?: unknown): Promise<T> {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse<T>(res);
    }

    async patch<T>(path: string, body?: unknown): Promise<T> {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse<T>(res);
    }

    async delete<T>(path: string): Promise<T> {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(res);
    }
}

export const api = new ApiClient();
