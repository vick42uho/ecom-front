import { BookInterface } from "./BookInterface";
import { OrderInterface } from "./OrderInterface";

export interface OrderDetailInterface {
    id:string;
    order:OrderInterface;
    Book:BookInterface;
    price:number;
    qty:number;
    amount:number;
}