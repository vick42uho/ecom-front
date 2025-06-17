import { MemberInterface } from "./MemberInterface";
import { OrderDetailInterface } from "./OrderDetailInterface";

export interface OrderInterface {
    id: string;
    createdAt: string;
    member: MemberInterface
    status: string;
    slipImage: string;
    trackCode: string;
    express: string;
    remark: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    OrderDetail:OrderDetailInterface[];
    sum:number;
}