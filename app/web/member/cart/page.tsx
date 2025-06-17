"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Config } from "@/app/config";
import { CartInterface } from "@/app/interface/CartInterface";
import Swal from "sweetalert2";

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

  useEffect(() => {
    fetchDataMember();

    if (memberId != "") {
      fetchData();
    }
  }, [memberId]);

  useEffect(() => {
    computeTotalAmount();
  }, [carts]);

  useEffect(() => {
    if (totalAmount > 0) {
      fetchQrImage();
    }
  }, [totalAmount]);

  const fetchQrImage = async () => {
    try {
      const url = "https://www.pp-qr.com/api/0868776053/" + totalAmount;
      const response = await axios.get(url);

      if (response.status === 200) {
        setQrImage(response.data.qrImage);
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    }
  };

  const computeTotalAmount = () => {
    let sum = 0;

    for (let i = 0; i < carts.length; i++) {
      const item = carts[i];
      sum += item.qty * item.book.price;
    }

    setTotalAmount(sum);
  };

  const fetchDataMember = async () => {
    try {
      const url = `${Config.apiURL}/api/member/info`;
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(Config.tokenMember)}`,
      };
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        setMemberId(response.data.id);
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    }
  };

  const fetchData = async () => {
    try {
      const url = `${Config.apiURL}/api/cart/list/${memberId}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setCarts(response.data);
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
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
        const url = Config.apiURL + "/api/cart/delete/" + id;
        const response = await axios.delete(url);
        if (response.status === 200) {
          fetchData();
          Swal.fire({
            title: "ลบสำเร็จ",
            text: "สินค้าถูกลบออกจากตะกร้า",
            icon: "success",
            timer: 1500,
          });
        }
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    }
  };

  const upQty = async (id: string) => {
    try {
      const url = Config.apiURL + "/api/cart/upQty/" + id;
      const response = await axios.put(url);

      if (response.status === 200) {
        fetchData();
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
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
    } catch (error: any) {
      if (error.status === 400) {
        Swal.fire({
          text: "สินค้าควรมีจำนวนอย่างน้อย 1 รายการ",
          title: "ตรวจสอบรายการ",
          icon: "warning",
        });
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: error.message,
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
                {carts.length === 0 ? (
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
                        <img
                          src={`${Config.apiURL}/uploads/${cart.book.image}`}
                          alt={cart.book.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md"
                        />
                      </td>
                      <td className="p-4 text-gray-700">{cart.book.name}</td>
                      <td className="p-4 text-right text-gray-800">
                        {cart.book.price.toLocaleString()} บาท
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => downQty(cart.id)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors duration-200"
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                          <span className="font-medium">{cart.qty}</span>
                          <button
                            onClick={(e) => upQty(cart.id)}
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
                          onClick={(e) => handleDelete(cart.id)}
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

  const handleSave = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      await handleUpdateMember();
      await handleUploadFile();
      await handleSaveOrder();

      router.push("/web/member/cart/success");
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleUpdateMember = async () => {
    const url = Config.apiURL + "/api/cart/confirm";
    const headers = {
      Authorization: `Bearer ${localStorage.getItem(Config.tokenMember)}`,
    };
    const payload = {
      name: name,
      address: address,
      phone: phone,
    };
    const response = await axios.post(url, payload, { headers });

    if (response.status === 200) {
      handleUploadFile();
    }
  };

  const handleChooseFile = (files: any) => {
    if (files.length > 0) {
      const file = files[0];
      setMyFile(file);
    }
  };

  const handleUploadFile = async () => {
    const form = new FormData();
    form.append("myFile", myFile as Blob);

    const url = Config.apiURL + "/api/cart/uploadSlip";
    await axios.post(url, form);
  };

  const handleSaveOrder = async () => {
    if (myFile) {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(Config.tokenMember)}`,
      };
      const payload = {
        slipName: myFile.name,
      };
      const url = Config.apiURL + "/api/cart/confirmOrder";
      const response = await axios.post(url, payload, { headers });

      if (response.status === 200) {
        
      }
    }
  };
  const uiPay = () => {
    return (
      <>
        <div className="front pl-3 pr-3">
          <div className="text-2xl font-bold">การชำระเงิน</div>
          <div className="text-center mt-2">
            {qrImage && (
              <img
                className="w-full h-full object-cover rounded-md shadow-lg border-2 border-gray-200"
                src={qrImage}
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
                onChange={(e) => handleChooseFile(e.target.files)}
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
