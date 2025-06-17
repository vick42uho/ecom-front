export interface BookInterface {
    id: string;
    name: string;
    price: number;
    description: string;
    isbn: string;
    image: File | string;
    createdAt: Date;
    updatedAt: Date;
}


