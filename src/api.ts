export const API_BASE_URL = 'http://127.0.0.1:8000';
const AUTH_TOKEN_STORAGE_KEY = 'afpd_auth_token';

interface FetchOptions extends RequestInit {
    timeout?: number;
}

export const getAuthToken = (): string => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '';
};

export const setAuthToken = (token?: string | null) => {
    if (typeof window === 'undefined') return;
    if (!token) {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        return;
    }
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

export const apiFetch = async (
    endpoint: string,
    options: FetchOptions = {}
): Promise<Response> => {
    const { timeout = 5000, ...fetchOptions } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const isFormDataBody =
        typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
    const authToken = getAuthToken();
    const authHeader = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            // Utiliser 'same-origin' au lieu de 'include' pour éviter les erreurs CORS
            // Une fois le backend configuré avec CORS strict, passer à 'include'
            credentials: (fetchOptions as any).credentials || 'same-origin',
            headers: isFormDataBody
                ? {
                    ...authHeader,
                    ...fetchOptions.headers,
                }
                : {
                    'Content-Type': 'application/json',
                    ...authHeader,
                    ...fetchOptions.headers,
                },
        });

        if (!response.ok) {
            let errBody = null;
            try {
                // Lire le texte une seule fois et le parser
                const text = await response.text();
                try {
                    errBody = JSON.parse(text);
                } catch {
                    errBody = { message: text };
                }
            } catch {
                errBody = null;
            }
            const err: any = new Error(
                errBody?.message || `API Error: ${response.status} ${response.statusText}`
            );
            err.status = response.status;
            err.body = errBody;
            throw err;
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

export const apiPostForm = async (
    endpoint: string,
    data: FormData,
    options?: FetchOptions
) => {
    const response = await apiFetch(endpoint, {
        ...options,
        method: 'POST',
        body: data,
    });
    return response.json();
};
