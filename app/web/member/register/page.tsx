'use client'

import { useState } from "react"
import { Config } from "@/app/config"
import axios from "axios"
import Swal from "sweetalert2"
import { useRouter } from "next/navigation"

export default function Register() {
    const [phone, setPhone] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const router = useRouter()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (password !== confirmPassword) {
                Swal.fire({
                    title: 'ตรวจสอบรหัสผ่าน',
                    text: 'รหัสผ่านไม่ตรงกัน',
                    icon: 'warning'
                })
                return
            }
            const url = Config.apiURL + '/api/member/signup'
            const payload = {
                phone: phone,
                username: username,
                password: password
            }
            const result = await axios.post(url, payload)
            if (result.status === 200) {
                Swal.fire({
                    title: 'สมัครสมาชิก',
                    text: 'สมัครสมาชิกเรียบร้อย',
                    icon: 'success'
                })
                router.push('/member/sign-in')
            }
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                icon: 'error'
            })
        }
    }
    
    return (
        <div className="front">
        <div className="text-2xl">สมัครสมาชิก</div>
        <form onSubmit={(e) => handleSignUp(e)}>
            <div>
                <label>เบอร์โทร</label>
                <input onChange={(e) => setPhone(e.target.value)}/>
            </div>
            <div>
                <label>username</label>
                <input onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div>
                <label>password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div>
                <label>ยืนยัน password</label>
                <input type="password" onChange={(e) => setConfirmPassword(e.target.value)}/>
            </div>
            <div>
                <button type="submit">
                    <i className="fa fa-check mr-2"></i>
                    สมัครสมาชิก
                    </button>
            </div>
        </form>
        </div>
    )
}