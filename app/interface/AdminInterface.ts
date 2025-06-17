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



