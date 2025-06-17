"use client";

import { Config } from "@/app/config";
import { OrderInterface } from "@/app/interface/OrderInterface";
import axios from "axios";
import Image from "next/image";
import React, { JSX, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { ApiError } from "@/app/interface/ErrorInterface";


export default function Order() {
  const [orders, setOrders] = useState<OrderInterface[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderInterface>();
  const [trackCode, setTrackCode] = useState('')
  const [express, setExpress] = useState('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = Config.apiURL + "/api/order/list";
      const token = localStorage.getItem(Config.tokenName)
      const headers = {
        'Authorization': 'Bearer ' + token
      }
      const response = await axios.get(url, { headers });
      if (response.status == 200) {
        setOrders(response.data);
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  };

  const mapStatusToThai = (status: string): JSX.Element => {
    const statusConfig: {[key: string]: {text: string, icon: string, color: string, bgColor: string}} = {
      'cancel': { text: 'ยกเลิก', icon: 'fa-times-circle', color: 'text-red-600', bgColor: 'bg-red-100' },
      'paid': { text: 'ชำระเงินแล้ว', icon: 'fa-check-circle', color: 'text-green-600', bgColor: 'bg-green-100' },
      'send': { text: 'จัดส่งแล้ว', icon: 'fa-truck', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'done': { text: 'สินค้าถึง', icon: 'fa-check-double', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'pending': { text: 'รอการชำระเงิน', icon: 'fa-clock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      'processing': { text: 'กำลังดำเนินการ', icon: 'fa-spinner fa-spin', color: 'text-amber-600', bgColor: 'bg-amber-100' },
      'shipped': { text: 'จัดส่งแล้ว', icon: 'fa-truck-fast', color: 'text-blue-500', bgColor: 'bg-blue-50' },
      'delivered': { text: 'จัดส่งสำเร็จ', icon: 'fa-box-check', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
      'cancelled': { text: 'ยกเลิกแล้ว', icon: 'fa-ban', color: 'text-red-700', bgColor: 'bg-red-50' },
      'refunded': { text: 'คืนเงินแล้ว', icon: 'fa-rotate-left', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    };

    const config = statusConfig[status] || { text: status, icon: 'fa-question-circle', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}>
        <i className={`fa-solid ${config.icon} mr-2`}></i>
        {config.text}
      </span>
    );
  };

  const openModal = (order: OrderInterface) => {
    setShowModal(true);
    setOrder(order);
  };

  const closeModal = () => {
    setShowModal(false);
  };


  useEffect(() => {
    if (showModal && order) {
      setTrackCode(order.trackCode || '');
      setExpress(order.express || '');
      setRemark(order.remark || '');
    }
  }, [showModal, order]);

  const handleCancel = async () => {
    try {
        const button = await Swal.fire({
            title: "ยืนยันการยกเลิก",
            text: "คุณต้องการยกเลิกสินค้าหรือไม่",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        })
        if (button.isConfirmed) {
            const url = Config.apiURL + "/api/order/cancel/" + order?.id;
            const token = localStorage.getItem(Config.tokenName)
            const headers = {
                'Authorization': 'Bearer ' + token
            }
            const response = await axios.delete(url, { headers });
            if (response.status == 200) {
                Swal.fire({
                    title: "ยกเลิกสินค้าสำเร็จ",
                    icon: "success",
                    timer: 1000,
                });
                closeModal();
                fetchData();
            }
        }        
    } catch (error: unknown) {
      const err = error as ApiError;
        Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: err.response?.data?.message || err.message,
            icon: "error",
        })
    }
  }


  const handlePaid = async () => {
    try {
        const button = await Swal.fire({
            title: "ยืนยันการชำระเงิน",
            text: "คุณต้องการชำระเงินหรือไม่",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        })
        if (button.isConfirmed) {
            const url = Config.apiURL + "/api/order/paid/" + order?.id;
            const token = localStorage.getItem(Config.tokenName);
            const response = await axios.put(url, {}, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.status == 200) {
                Swal.fire({
                    title: "ชำระเงินสำเร็จ",
                    icon: "success",
                    text: "คุณได้ชำระเงินแล้ว",
                    timer: 1000,
                });
                closeModal();
                fetchData();
            }
        }        
    } catch (error: unknown) {
      const err = error as ApiError;
        Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: err.response?.data?.message || err.message,
            icon: "error",
        })
    }
  }


  const handleSend = async () => {
    try {
       const url = Config.apiURL + '/api/order/send'
       const payload = {
        trackCode: trackCode,
        express: express,
        remark: remark,
        orderId: order?.id
       }
       const token = localStorage.getItem(Config.tokenName)
       const headers = {
           'Authorization': 'Bearer ' + token
       }
       const response = await axios.put(url, payload, { headers });
       if (response.status == 200) {
           Swal.fire({
               title: "จัดส่งสินค้าสำเร็จ",
               icon: "success",
               text: "คุณได้จัดส่งสินค้าแล้ว",
               timer: 1000,
           });
           closeModal();
           fetchData();
       }
    } catch (error: unknown) {
      const err = error as ApiError;
        Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: err.response?.data?.message || err.message,
            icon: "error",
        })
    }
  }


  return (
    <div className="container">
      <div className="title">รายการสั่งซื้อ</div>
      <table>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ผู้รับสินค้า</th>
            <th>ที่อยู่จัดส่ง</th>
            <th>เบอร์โทรติดต่อ</th>
            <th>สถานะ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? orders.map((order) => (
            <tr key={order.id}>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{order.customerName}</td>
              <td>{order.customerAddress}</td>
              <td>{order.customerPhone}</td>
              <td className="whitespace-nowrap">{mapStatusToThai(order.status)}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => openModal(order)}
                >
                  <i className="fa fa-file mr-2"></i>ดูข้อมูล
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                ไม่พบรายการสั่งซื้อ
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <Modal title="รายการสินค้า" onClose={closeModal} size="xl">
          <div>
            <label>รหัสติดตามพัสดุ</label>
            <input value={trackCode} onChange={(e) => setTrackCode(e.target.value)}/>
          </div>
          <div>
            <label>บริษัทขนส่ง</label>
            <input value={express} onChange={(e) => setExpress(e.target.value)}/>
          </div>
          <div className="mb-3">
            <div className="relative w-[350px] h-[350px]">
              <Image
                src={`${Config.apiURL}/uploads/slip/${order?.slipImage}`}
                alt={order?.slipImage || 'Slip image'}
                fill
                className="object-cover rounded-lg"
                sizes="350px"
              />
            </div>
          </div>

          <table className="table mt-5">
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
              {!order?.OrderDetail || order.OrderDetail.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    ไม่พบรายการสินค้า
                  </td>
                </tr>
              ) : (
                order.OrderDetail.map((item) => (
                  <tr key={item.id}>
                    <td>{item.Book.isbn}</td>
                    <td>{item.Book.name}</td>
                    <td className="text-right">{item.price}</td>
                    <td className="text-right">{item.qty}</td>
                    <td className="text-right">
                      {(item.price * item.qty).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="text-gray-400 mt-3 justify-center flex text-xl gap-3">
            <span>
              <i className="fa fa-money-bill mr-2"></i>
              ยอดรวม :
            </span>
            <span className="text-amber-300">
              {order?.OrderDetail && order.OrderDetail.length > 0 
                ? order.OrderDetail.reduce(
                    (total, item) => total + item.price * item.qty,
                    0
                  ).toLocaleString()
                : "0"}
            </span>
            <span>บาท</span>
          </div>
          <div>
            <label>หมายเหตุ</label>
            <input value={remark} onChange={(e) => setRemark(e.target.value)}/>
          </div>
          <div className="mt-5 flex justify-center gap-2">
            <button className="model-btn-order-cancel" onClick={handleCancel}>
              <i className="fa fa-times mr-2"></i>
              ยกเลิก
            </button>
            <button className="model-btn-get-money" onClick={handlePaid}>
              <i className="fa fa-check mr-2"></i>
              ได้รับเงินแล้ว
            </button>
            <button className="model-btn-send" onClick={handleSend}>
              <i className="fa fa-truck mr-2"></i>
              จัดส่งสินค้าแล้ว
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
