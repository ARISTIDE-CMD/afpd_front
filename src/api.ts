const API_BASE_URL = 'http://127.0.0.1:8000';

interface FetchOptions extends RequestInit {
    timeout?: number;
}

export const apiFetch = async (
    endpoint: string,
    options: FetchOptions = {}
): Promise<Response> => {
    const { timeout = 5000, ...fetchOptions } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const apiGet = async (endpoint: string, options?: FetchOptions) => {
    const response = await apiFetch(endpoint, {
        ...options,
        method: 'GET',
    });
    return response.json();
};

export const apiPost = async (
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
) => {
    const response = await apiFetch(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const apiPut = async (
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
) => {
    const response = await apiFetch(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const apiDelete = async (endpoint: string, options?: FetchOptions) => {
    const response = await apiFetch(endpoint, {
        ...options,
        method: 'DELETE',
    });
    return response.json();
};
