export interface ErrorResponseData {
    status?: number;
    message?: string;
    [key: string]: string | number | boolean | object | undefined;
}

export interface ApiError extends Error {
    response?: {
        status?: number;
        data?: ErrorResponseData;
    };
    status?: number;
    data?: ErrorResponseData;
    message: string;
    [key: string]: unknown;
}