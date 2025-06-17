export interface AdminFormData {
    id: string;
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    role: string;
}

export interface AdminPayload {
    name: string;
    username: string;
    role: string;
    password?: string;
}



export interface Admin {
    id: string;
    name: string;
    username: string;
    password?: string;
    confirmPassword?: string;
    role: string;
}

export interface ApiError extends Error {
    response?: {
        status?: number;
        data?: {
            status?: number;
            message?: string;
            [key: string]: any;
        };
    };
    status?: number;
    data?: {
        status?: number;
        message?: string;
        [key: string]: any;
    };
    message: string;
    [key: string]: any;
}