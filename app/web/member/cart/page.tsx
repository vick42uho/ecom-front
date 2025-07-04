"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Config } from "@/app/config";
import { CartInterface } from "@/app/interface/CartInterface";
import Swal from "sweetalert2";
import { ApiError } from "@/app/interface/ErrorInterface";
import Image from "next/image";

export default function Cart() {
  const [carts, setCarts] = useState<CartInterface[]>([]);
  const [memberId, setMemberId] = useState("");
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState(0);
  const [qrImage, setQrImage] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [myFile, setMyFile] = useState<File | null>(null);

  const fetchQrImage = useCallback(async () => {
    if (totalAmount <= 0) return;
    
    try {
      const url = `https://www.pp-qr.com/api/0868776053/${totalAmount}`;
      const response = await axios.get<{ qrImage: string }>(url);
      if (response.status === 200) {
        setQrImage(response.data.qrImage);
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Error fetching QR code:', err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message || "ไม่สามารถดึงข้อมูล QR code ได้",
        icon: "error",
      });
    }
  }, [totalAmount]);

  const computeTotalAmount = useCallback(() => {
    if (!carts || carts.length === 0) {
      setTotalAmount(0);
      return;
    }
    
    const sum = carts.reduce((total, item) => {
      return total + (item.qty * item.book.price);
    }, 0);
    
    setTotalAmount(sum);
  }, [carts]);

  const fetchDataMember = useCallback(async () => {
    try {
      const token = localStorage.getItem(Config.tokenMember);
      if (!token) {
        router.push('/web/member/sign-in');
        return;
      }
      
      const url = `${Config.apiURL}/api/member/info`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        setMemberId(response.data.id);
        setName(response.data.name || "");
        setAddress(response.data.address || "");
        setPhone(response.data.phone || "");
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Error fetching member data:', err);
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!memberId) return;
    
    try {
      const url = `${Config.apiURL}/api/cart/list/${memberId}`;
      const response = await axios.get<CartInterface[]>(url);
      if (response.status === 200) {
        setCarts(response.data);
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Error fetching cart data:', err);
    }
  }, [memberId]);

  // Initial data loading
  useEffect(() => {
    fetchDataMember();
  }, [fetchDataMember]);

  // Load cart when memberId changes
  useEffect(() => {
    if (memberId) {
      fetchData();
    }
  }, [memberId, fetchData]);

  // Update total amount when cart changes
  useEffect(() => {
    computeTotalAmount();
  }, [carts, computeTotalAmount]);

  // Update QR code when total amount changes
  useEffect(() => {
    if (totalAmount > 0) {
      fetchQrImage();
    }
  }, [totalAmount, fetchQrImage]);

  // ฟังก์ชันถูกย้ายไปด้านบนและใช้ useCallback แล้ว

  const handleDelete = useCallback(async (id: string) => {
    try {
      const cart = carts.find((item) => item.id === id);
      const button = await Swal.fire({
        title: "ลบรายการ",
        text: "ยืนยันการลบ " + cart?.book.name + " ออกจากตะกร้า?",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });
      if (button.isConfirmed) {
        const url = `${Config.apiURL}/api/cart/delete/${id}`;
        const response = await axios.delete(url);
        if (response.status === 200) {
          fetchData();
          await Swal.fire({
            title: "ลบสำเร็จ",
            text: "สินค้าถูกลบออกจากตะกร้า",
            icon: "success",
            timer: 1500,
          });
        }
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  }, [carts, fetchData]);

  const upQty = async (id: string) => {
    try {
      const url = Config.apiURL + "/api/cart/upQty/" + id;
      const response = await axios.put(url);

      if (response.status === 200) {
        fetchData();
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

  const downQty = async (id: string) => {
    try {
      const url = Config.apiURL + "/api/cart/downQty/" + id;
      const response = await axios.put(url);

      if (response.status === 200) {
        fetchData();
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      const status = err.response?.status || err.response?.data?.status;
      const message = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      
      if (status === 400 || message.includes('minimum')) {
        Swal.fire({
          text: "สินค้าควรมีจำนวนอย่างน้อย 1 รายการ",
          title: "ตรวจสอบรายการ",
          icon: "warning",
        });
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: message,
          icon: "error",
        });
      }
    }
  };

  const uiCart = () => {
    return (
      <>
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
            สินค้าในตะกร้า
          </h1>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-xl">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="p-4 text-left w-[150px] md:w-[200px]">
                    สินค้า
                  </th>
                  <th className="p-4 text-left">ชื่อ</th>
                  <th className="p-4 text-right w-[100px]">ราคา</th>
                  <th className="p-4 text-center w-[120px]">จำนวน</th>
                  <th className="p-4 text-right w-[100px]">ยอดรวม</th>
                  <th className="p-4 w-[150px]">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {!carts || carts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      ตะกร้าสินค้าว่างเปล่า
                    </td>
                  </tr>
                ) : (
                  carts.map((cart: CartInterface) => (
                    <tr
                      key={cart.id}
                      className="border-b hover:bg-gray-100 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <Image
                          src={`${Config.apiURL}/uploads/${cart.book.image}`}
                          alt={cart.book.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md"
                          width={80}
                          height={80}
                        />
                      </td>
                      <td className="p-4 text-gray-700">{cart.book.name}</td>
                      <td className="p-4 text-right text-gray-800">
                        {cart.book.price.toLocaleString()} บาท
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { downQty(cart.id) }}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors duration-200"
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                          <span className="font-medium">{cart.qty}</span>
                          <button
                            onClick={() => { upQty(cart.id) }}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors duration-200"
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-800">
                        {(cart.qty * cart.book.price).toLocaleString()} บาท
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(cart.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="text-center mt-6">
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              ยอดรวม: {totalAmount.toLocaleString()} บาท
            </p>
          </div>
        </div>
      </>
    );
  };

  const handleChooseFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setMyFile(files[0]);
    }
  }, []);

  const handleUploadFile = useCallback(async () => {
    if (!myFile) return;
    
    const form = new FormData();
    form.append("myFile", myFile as Blob);

    const url = `${Config.apiURL}/api/cart/uploadSlip`;
    await axios.post(url, form);
  }, [myFile]);

  const handleUpdateMember = useCallback(async () => {
    const url = `${Config.apiURL}/api/cart/confirm`;
    const token = localStorage.getItem(Config.tokenMember);
    if (!token) return;
    
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      name,
      address,
      phone,
    };
    await axios.post(url, payload, { headers });
  }, [name, address, phone]);

  const handleSaveOrder = useCallback(async () => {
    if (!myFile) return;
    
    const token = localStorage.getItem(Config.tokenMember);
    if (!token) return;
    
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      slipName: myFile.name,
    };
    const url = `${Config.apiURL}/api/cart/confirmOrder`;
    await axios.post(url, payload, { headers });
  }, [myFile]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      await handleUpdateMember();
      await handleUploadFile();
      await handleSaveOrder();

      router.push("/web/member/cart/success");
    } catch (error: unknown) {
      const err = error as ApiError;
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        icon: "error",
      });
    }
  }, [handleUpdateMember, handleUploadFile, handleSaveOrder, router]);
  const uiPay = () => {
    return (
      <>
        <div className="front pl-3 pr-3">
          <div className="text-2xl font-bold">การชำระเงิน</div>
          <div className="text-center mt-2">
            {qrImage && (
              <Image
                className="w-full h-full object-cover rounded-md shadow-lg border-2 border-gray-200"
                src={qrImage}
                alt="QR Code สำหรับชำระเงิน"
                width={300}
                height={300}
              />
            )}
          </div>
          <form onSubmit={(e) => handleSave(e)}>
            <div>
              <div>ชื่อผู้รับสินค้า</div>
              <input
                className="w-full"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div>ที่อยู่ในการจัดส่ง</div>
              <textarea
                className="border rounded-md h-[100px] w-full shadow-lg p-2"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <div>เบอร์โทรศัพท์</div>
              <input
                className="w-full"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label>สลิปการโอน</label>
              <input
                type="file"
                className="w-full"
                onChange={handleChooseFile}
                accept="image/*"
              />
            </div>
            <div>
              <button type="submit">
                <i className="fa fa-check mr-2"></i>
                ส่งข้อมูล
              </button>
            </div>
          </form>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex">
        <div> {uiCart()}</div>
        <div> {uiPay()}</div>
      </div>
    </>
  );
}
