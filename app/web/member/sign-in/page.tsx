"use client";
import { useState } from "react";
import { Config } from "@/app/config";
import axios from "axios";
import Swal from "sweetalert2";
import { ApiError } from "@/app/interface/AdminInterface";

export default function SignIn() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handelSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload = {
                username: username,
                password: password
            }
            const url = Config.apiURL + '/api/member/sign-in'
            const response = await axios.post(url, payload)

            if (response.status === 200) {
                localStorage.setItem(Config.tokenMember, response.data.token)
                // router.push('/web')
                window.location.href = '/web'
            }
        } catch (error: unknown) {
            const err = error as ApiError;
            Swal.fire({
                title: 'username ไม่ถูกต้อง',
                text: 'ไม่มีผู้ใช้นี้ในระบบ',
                icon: 'info',
                timer: 1000
            })
        }
    }
  return (
    <div className="front">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
      <form onSubmit={(e) => handelSignIn(e)}>
        <div>
          <label htmlFor="username">username</label>
          <input onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password">password</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">
          <i className="fa fa-lock mr-2"></i>
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
