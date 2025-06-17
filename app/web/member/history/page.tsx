"use client";

import { Config } from "@/app/config";
import { OrderInterface } from "@/app/interface/OrderInterface";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function History() {
  const [orders, setOrders] = useState<OrderInterface[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = Config.apiURL + "/api/member/history";
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(Config.tokenMember)}`,
      };
      const response = await axios.get(url, { headers });
      if (response.status === 200) {


        const rows = []
        for (let i = 0; i < response.data.length; i++) {
          const order = response.data[i]
          let sum = 0
          for (let j = 0; j < order.OrderDetail.length; j++) {
            const orderDetail = order.OrderDetail[j]
            const price = orderDetail.price
            const qty = orderDetail.qty
            const amount = (qty * price)

            orderDetail.amount = amount

            sum += amount
          }

          order.sum = sum
          rows.push(order)
        }
        setOrders(rows);
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    }
  };
  return (
    <>
      <div className="text-2xl font-bold mb-3">
        <i className="fa fa-file-alt mr-2"></i>
        ติดตามสินค้า
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border mb-5 p-3 rounded-lg shadow-md bg-white"
        >
          <div className="flex gap-2">
            <div className="w-[150px]">วันที่สั่งซื้อ</div>
            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="flex gap-2">
            <div className="w-[150px]">ชื่อผุ้รับสินค้า</div>
            <div>{order.customerName}</div>
          </div>
          <div className="flex gap-2">
            <div className="w-[150px]">เบอร์โทรศัพท์</div>
            <div>{order.customerPhone}</div>
          </div>
          <div className="flex gap-2">
            <div className="w-[150px]">ที่อยู่ในการจัดส่ง</div>
            <div>{order.customerAddress}</div>
          </div>

          <div className="flex gap-2">
            <div className="w-[150px]">รหัสติดตามพัสดุ</div>
            <div>{order.trackCode} {order.express} </div>
          </div>

          <div className="font-semibold mt-3">
            <i className="fa fa-list mr-2"></i>
            รายการสินค้า
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>รหัสสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th className="text-right">ราคา</th>
                <th className="text-right">จำนวน</th>
                <th className="text-right">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
             {order.OrderDetail.map((orderDetail, index) =>
                <tr key={index}>
                    <td className="p-3">{orderDetail.Book.isbn}</td>
                    <td className="p-3">{orderDetail.Book.name}</td>
                    <td className="text-right">{orderDetail.price.toLocaleString()}</td>
                    <td className="text-right">{orderDetail.qty}</td>
                    <td className="text-right">
                        {/* {(orderDetail.price * orderDetail.qty).toLocaleString()} */}
                        {orderDetail.amount.toLocaleString()}
                        </td>
                </tr>
             )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="p-3"></td>
                <td className="text-right p-3 bg-gray-400 rounded-br-xl rounded-bl-xl">
                  {/* {(order.OrderDetail.reduce((total, orderDetail) => total + orderDetail.price * orderDetail.qty, 0)).toLocaleString()} */}
                  {order.sum.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </>
  )
}
