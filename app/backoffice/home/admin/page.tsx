'use client'
import { Config } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { Admin, AdminFormData, AdminPayload } from "../../../interface/AdminInterface";
import { ApiError } from "@/app/interface/ErrorInterface";


export default function AdminPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [roles] = useState([
        {label: 'ผู้ดูแลระบบ', value: 'admin'},
        {label: 'ผู้ใช้งานทั่วไป', value: 'user'}
    ]);

    const [formData, setFormData] = useState<AdminFormData>({
        id: '',
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${Config.apiURL}/api/admin/list`);
            if (response.status === 200) {
                setAdmins(response.data);
            }
        } catch (error: unknown) {
            const err = error as ApiError;
            Swal.fire({
                title: 'ไม่สามารถดึงข้อมูลได้',
                text: err.response?.data?.message || err.message,
                icon: 'error'
            });
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            username: '',
            password: '',
            confirmPassword: '',
            role: 'user'
        });
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSave = async () => {
        try {
            // ตรวจสอบข้อมูลก่อนบันทึก
            if (!formData.name || !formData.username || (!formData.id && !formData.password)) {
                Swal.fire({
                    title: 'ข้อมูลไม่ครบถ้วน',
                    text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                    icon: 'warning'
                });
                return;
            }

            // ตรวจสอบรหัสผ่านว่าตรงกันหรือไม่
            if (formData.password && formData.password !== formData.confirmPassword) {
                Swal.fire({
                    title: 'รหัสผ่านไม่ตรงกัน',
                    text: 'รหัสผ่านและยืนยันรหัสผ่านต้องตรงกัน',
                    icon: 'warning'
                });
                return;
            }

            const payload: AdminPayload = {
                name: formData.name,
                username: formData.username,
                role: formData.role
            };

            // เพิ่ม password เฉพาะเมื่อมีการกรอก
            if (formData.password) {
                payload.password = formData.password;
            }

            let response;
            if (formData.id) {
                // อัพเดทข้อมูล
                response = await axios.put(`${Config.apiURL}/api/admin/update-data/${formData.id}`, payload);
            } else {
                // สร้างข้อมูลใหม่
                response = await axios.post(`${Config.apiURL}/api/admin/create`, payload);
            }

            if (response.status === 200) {
                Swal.fire({
                    title: 'สำเร็จ',
                    text: formData.id ? 'อัพเดทข้อมูลเรียบร้อย' : 'เพิ่มข้อมูลเรียบร้อย',
                    icon: 'success',
                    timer: 1500
                });
                fetchData();
                closeModal();
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const err = error as unknown as ApiError;
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: err.response?.data?.message || 
                          err.message || 
                          'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
                    icon: 'error'
                });
            } else if (error instanceof Error) {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: error.message,
                    icon: 'error'
                });
            } else {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
                    icon: 'error'
                });
            }
            console.error('Error:', error);
        }
    };

    const handleEdit = (admin: Admin) => {
        setFormData({
            id: admin.id,
            name: admin.name,
            username: admin.username,
            password: '',
            confirmPassword: '',
            role: admin.role
        });
        setShowModal(true);
    };

    const handleDelete = async (admin: Admin) => {
        const button = await Swal.fire({
            title: 'ลบผู้ใช้งาน',
            text: 'คุณต้องการลบผู้ใช้งานชื่อ ' + admin.name + ' หรือไม่ ?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
            
        })

        if (button.isConfirmed) {
            try {
                const url = Config.apiURL + '/api/admin/remove/' + admin.id;
                const response = await axios.delete(url);
                if (response.status === 200) {
                    Swal.fire({
                        title: 'ลบข้อมูล',
                        text: 'ลบข้อมูลเรียบร้อย',
                        icon: 'success',
                        timer: 1500
                    });
                    fetchData();
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const err = error as unknown as ApiError;
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: err.response?.data?.message || 
                              err.message || 
                              'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
                        icon: 'error'
                    });
                } else if (error instanceof Error) {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: error.message,
                        icon: 'error'
                    });
                } else {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
                        icon: 'error'
                    });
                }
            }
        }
    };

    return (
        <>
            <div className="container">
                <div className="title">ผู้ใช้งานระบบ</div>
                <div className="mb-4">
                    <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                        onClick={openModal}
                    >
                        <i className="fa fa-plus mr-2"></i>
                        เพิ่มผู้ใช้งาน
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>ชื่อ</th>
                                <th>ชื่อผู้ใช้</th>
                                <th>สิทธิ์</th>
                                <th className="w-[120px] text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.length > 0 ? (
                                admins.map((admin: Admin) => (
                                    <tr key={admin.id}>
                                        <td>{admin.name}</td>
                                        <td>{admin.username}</td>
                                        <td>
                                            {admin.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(admin)}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(admin)}
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">ไม่พบข้อมูลผู้ใช้งาน</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <Modal onClose={closeModal} title={formData.id ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้งาน"}>
                    <div className="space-y-4">
                        <div>
                            <label>ชื่อ</label>
                            <input 
                                name="name"
                                value={formData.name} 
                                onChange={handleInputChange}
                                placeholder="กรอกชื่อผู้ใช้งาน"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label>ชื่อผู้ใช้</label>
                            <input 
                                name="username"
                                value={formData.username} 
                                onChange={handleInputChange}
                                placeholder="กรอกชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label>รหัสผ่าน {formData.id && "(เว้นว่างหากไม่ต้องการเปลี่ยน)"}</label>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password} 
                                onChange={handleInputChange}
                                placeholder="กรอกรหัสผ่าน"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label>ยืนยันรหัสผ่าน</label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={formData.confirmPassword} 
                                onChange={handleInputChange}
                                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label>สิทธิ์การใช้งาน</label>
                            <select 
                                name="role"
                                value={formData.role} 
                                onChange={handleInputChange}
                                className="mt-1"
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            className="modal-btn modal-btn-cancel" 
                            onClick={closeModal}
                        >
                            <i className="fa fa-times mr-2"></i>
                            ยกเลิก
                        </button>
                        <button 
                            className="modal-btn modal-btn-submit" 
                            onClick={handleSave}
                        >
                            <i className="fa fa-check mr-2"></i>
                            บันทึก
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
