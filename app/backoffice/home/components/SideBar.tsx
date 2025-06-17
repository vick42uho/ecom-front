"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Config } from "@/app/config";
import { useRouter } from "next/navigation";


export default function SideBar() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [role, setRole] = useState('')

    useEffect(() => {
        fetchData()
    }, [])



    const fetchData = async () => {
        try {
            const url = Config.apiURL + '/api/admin/info'
            const token = localStorage.getItem(Config.tokenName)

            if (!token) {
                router.push('/backoffice/signin')
            } else {
                const headers = {
                    'Authorization': 'Bearer ' + token
                }
                const res = await axios.get(url, { headers })

                if (res.data.name !== undefined) {
                    setName(res.data.name)
                    setRole(res.data.role)
                }
            }
            
        } catch (err: any) {
            Swal.fire({
                title: 'Error FetchData...',
                text: err.message,
                icon: 'error'
            })
            // console.log(err)
        }

    }


    const handleSignOut = async () => {
        const button = await Swal.fire({
            text: 'คุณต้องการออกจากระบบหรือไม่',
            title: 'ออกจากระบบ',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        })

        if (button.isConfirmed) {
            localStorage.removeItem(Config.tokenName)
            router.push('/backoffice/signin')
        }

    }



  return (
    <>
      <div className="sidebar">
        <div className="header">
          <h1>Back Office</h1>
          <p>
            <i className="fa fa-user mr-2"></i>
            {name}: {role}
            </p>

            <p className="button">
                <Link href="/backoffice/home/edit-profile">
                <i className="fa fa-user-edit mr-2"></i>
                แก้ไข
                </Link>
                <button onClick={handleSignOut}>
                    <i className="fa fa-sign-out mr-2"></i>
                    ออกจากระบบ
                </button>
            </p>
        </div>
        <div className="body">
            {role === 'admin' && 
            <Link href="/backoffice/home/dashboard">
            <i className="fa fa-chart-line"></i>
            Dashboard</Link>
            }
            <Link href="/backoffice/home/book">
            <i className="fa fa-box"></i>
            หนังสือ</Link>
            <Link href="/backoffice/home/order">
            <i className="fa fa-file"></i>
            รายการสั่งซื้อ</Link>
            {role === 'admin' && 
            <Link href="/backoffice/home/admin">
            <i className="fa fa-user-cog"></i>
            ผู้ดูแลระบบ</Link>
            }
            
        </div>
      </div>
    </>
  );
}
