import { BookInterface } from "./BookInterface";

export interface CartInterface {
    id: string;
    memberId: string;
    bookId: string;
    qty: number;
    book: BookInterface  // เชื่อมต่อกับ BookInterface
}