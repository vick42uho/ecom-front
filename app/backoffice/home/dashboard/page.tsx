"use client";

import { Config } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const [totalOrder, setTotalOrder] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalMember, setTotalMember] = useState(0);

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    try {
      const url = Config.apiURL + "/api/dashboard";
      const token = localStorage.getItem(Config.tokenName)
      const headers = {
        'Authorization': 'Bearer ' + token
      }
      const response = await axios.get(url, { headers });
      if (response.status == 200) {
        setTotalOrder(response.data.totalOrder);
        setTotalIncome(response.data.totalIncome);
        setTotalMember(response.data.totalMember);
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || error.message,
        icon: "error",
      })
    }
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl">Hello Dashboard</h1>

      <div className="flex justify-between gap-4">
        <div className="w-full rounded-xl bg-blue-500 p-5 text-right text-white">
          <div className="text-lg">
            รายการสั่งซื้อ
            <i className="fa fa-shopping-cart ml-2"></i>
          </div>
          <div className="text-4xl">{totalOrder.toLocaleString()}</div>
        </div>

        <div className="w-full rounded-xl bg-green-600 p-5 text-right text-white">
          <div className="text-lg">
            รายได้
            <i className="fa fa-dollar-sign ml-2"></i>
          </div>
          <div className="text-4xl">{totalIncome.toLocaleString()}</div>
        </div>

        <div className="w-full rounded-xl bg-amber-500 p-5 text-right text-black">
          <div className="text-lg">
            สมาชิก
            <i className="fa fa-user ml-2"></i>
          </div>
          <div className="text-4xl">{totalMember.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
