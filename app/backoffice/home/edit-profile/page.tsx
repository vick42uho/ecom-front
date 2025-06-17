"use client"
import { Config } from "@/app/config"
import axios from "axios"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { ApiError } from "@/app/interface/AdminInterface"

export default function EditProfilePage() {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSave = async () => {
        try {
            if (password !== confirmPassword) {
                Swal.fire({
                    title: 'ตรวจสอบรหัสผ่าน และการยืนยัน',
                    text: 'รหัสผ่านไม่ตรงกัน',
                    icon: 'warning'
                })
                return
            }
            const url = Config.apiURL + '/api/admin/update'
            const payload = {
                name: name,
                username: username,
                password: password,
            }

            const headers = {
                'Authorization': 'Bearer ' + localStorage.getItem(Config.tokenName)
            }

            const response = await axios.put(url, payload, {headers})
            if (response.status == 200) {
                Swal.fire({
                    title: 'บันทึกข้อมูล',
                    text: 'บันทึกข้อมูลเรียบร้อย',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false
                })
            }
            
        } catch (err: unknown) {
            const error = err as ApiError;
            Swal.fire({
                title: 'Error...',
                text: error.response?.data?.message || error.message,
                icon: 'error'
            })
            console.log(error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const url = Config.apiURL + '/api/admin/info'
            const headers = {
                'Authorization': 'Bearer ' + localStorage.getItem(Config.tokenName)
            }
            const response = await axios.get(url, { headers })
            if (response.status == 200) {
                setName(response.data.name)
                setUsername(response.data.username)
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            Swal.fire({
                title: 'Error FetchData...',
                text: error.response?.data?.message || error.message,
                icon: 'error'
            })
        }
    }
    
    return (
        <div className="container">
        <div className="title">แก้ไขข้อมูลส่วนตัว</div>
        <div>
            <label htmlFor="">ชื่อ</label>
            <input  value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
        <div>
            <label htmlFor="">username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div>
            <label htmlFor="">password *หากไม่ต้องการแก้ไข ไม่ต้องกรอก</label>
            <input type="password" onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div>
            <label htmlFor="">confirm password *หากไม่ต้องการแก้ไข ไม่ต้องกรอก</label>
            <input type="password" onChange={(e) => setConfirmPassword(e.target.value)}/>
        </div>
        <div>
            <button onClick={handleSave}>
                <i className="fa fa-check mr-2"></i>
                Save
                </button>
        </div>
        </div>
    )
}