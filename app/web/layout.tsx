// app/web/member/layout.tsx
'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { Config } from "../config";
import axios from "axios";
import Swal from "sweetalert2";
import { ApiError } from "@/app/interface/AdminInterface";



export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = useState('')

  const fetchData = async () => {
    try {
      const token = localStorage.getItem(Config.tokenMember)
      if (token != undefined) {
        const headers = {
          'Authorization': 'Bearer ' + token
        }
        const url = Config.apiURL + '/api/member/info'
        const response = await axios.get(url, { headers })
        if (response.status === 200) {
          setUsername(response.data.username)
        }
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        icon: 'error'
      })
    }

  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSignOut = async () => {
    const button = await Swal.fire({
      title: 'คุณต้องการออกจากระบบหรือไม่',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true
    })
      if (button.isConfirmed) {
        localStorage.removeItem(Config.tokenMember)
        window.location.href = '/web'
      }
  }
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 p-10 text-white">
        <div className="flex justify-between">
        <div className="text-3xl">
          <i className="fa fa-book-open mr-3"></i>
          Wick ร้านหนังสือออนไลน์
        </div>
        {username != '' && (
          <>
          <div className="flex items-center">
            <i className="fa fa-user mr-2"></i>
            {username}
          </div>
          </>
        )}
        </div>
        <div className="text-xl">แหล่งหนังสือที่ดีที่สุด</div>
        
      </div>

      <div className="bg-gray-700 text-white p-4 flex gap-4">
        <Link href="/">
          <i className="fa fa-home mr-2"></i>
          หน้าแรก
        </Link>
        {username == '' ? 
          <>
          <Link href="/web/member/register">
          <i className="fa fa-user-plus mr-2"></i>
          สมัครสมาชิก
        </Link>
        <Link href="/web/member/sign-in">
            
          เข้าสู่ระบบ
        </Link>
        </>
        : <>
        <Link href="/web/member/history">
        <i className="fa fa-history mr-2"></i>
        ติดตามสินค้า
        </Link>
        <button onClick={handleSignOut} className="cursor-pointer">
          <i className="fa fa-sign-out mr-2"></i>
          ออกจากระบบ
        </button>
        </>
        }
      </div>
      <div className="p-4">{children}</div>
    </>
  );
}
