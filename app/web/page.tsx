// app/web/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Config } from "../config";
import Swal from "sweetalert2";
import { BookInterface } from "../interface/BookInterface";
import { CartInterface } from "../interface/CartInterface";
import Link from "next/link";
import { ApiError } from "@/app/interface/ErrorInterface";

export default function Home() {
  const [books, setBooks] = useState<BookInterface[]>([]);
  const [, setLoading] = useState(true);
  const [token, setToken] = useState('')
  const [carts, setCarts] = useState<CartInterface[]>([])
  const [memberId, setMemberId] = useState('')
  const [qtyInCart, setQtyInCart] = useState(0)

  useEffect(() => {
    readToken()
    fetchData();

    if (memberId != '') {
      fetchDataCart()
    }
  }, [memberId]);


  const readToken = async () => {
    const token = localStorage.getItem(Config.tokenMember) ?? ''
    setToken(token)
    try {
      const url = Config.apiURL + '/api/member/info'
      const headers = {
        'Authorization': 'Bearer ' + token
      }
      const response = await axios.get(url, { headers })
      if (response.status === 200) {
        setMemberId(response.data.id)
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || err.message,
        icon: 'error'
      })
    }
    
  }


  const fetchData = async () => {
    try {
      setLoading(true);
      const url = Config.apiURL + "/api/book";
      const response = await axios.get(url);
      if (response.status === 200) {
        setBooks(response.data);
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCart = async () => {
    try {
      if (token != '') {
        const url = Config.apiURL + '/api/cart/list/' + memberId
        const response = await axios.get(url)
        if (response.status === 200) {
          setCarts(response.data)
          let sum = 0
          for (let i = 0; i < response.data.length; i++) {
            const item = response.data[i]
            sum += item.qty
          }
        setQtyInCart(sum)
        }
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  }

  const handleAddToCart = async (bookId: string) => {
    try {
      const url = Config.apiURL + '/api/cart/add'
      const payload = {
        memberId: memberId,
        bookId: bookId
      }
      const response = await axios.post(url, payload)
      if (response.status === 200) {
        fetchDataCart()
      }    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Cart Summary */}
      <div className="flex justify-end items-center mb-6">
        <div className="text-right space-y-2">
          <div className="text-lg md:text-xl font-medium text-gray-700">
            สินค้าในตะกร้า{' '}
            <span className="font-bold text-red-500">{carts.length}</span> รายการ
            <span className="pl-3 text-blue-500 font-bold">{qtyInCart}</span> ชิ้น
          </div>
          <Link
            href="/web/member/cart"
            className="inline-flex items-center bg-green-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300"
          >
            <i className="fa fa-shopping-cart mr-2"></i>
            ตะกร้าของฉัน
          </Link>
        </div>
      </div>

      {/* Books Section */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
        หนังสือในร้านเรา
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {books.map((book: BookInterface) => (
          <div
            key={book.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Book Image */}
            <div className="relative overflow-hidden rounded-t-xl">
              <img
                src={`${Config.apiURL}/uploads/${book.image}`}
                alt={book.name}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Book Details */}
            <div className="p-4">
              <h2 className="text-lg font-medium text-indigo-600 line-clamp-2">
                {book.name}
              </h2>
              <p className="text-xl font-bold text-gray-800 mt-2">
                {book.price.toLocaleString()} บาท
              </p>
            </div>

            {/* Add to Cart Button */}
            <div className="p-3 bg-gray-100 rounded-b-xl">
              {token ? (
                <button
                  onClick={() => handleAddToCart(book.id)}
                  className="w-full flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-300"
                >
                  <i className="fa fa-shopping-cart mr-2"></i>
                  หยิบลงตะกร้า
                </button>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้า
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}