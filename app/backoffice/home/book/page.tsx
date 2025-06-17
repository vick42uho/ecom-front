"use client";

import { BookInterface } from "@/app/interface/BookInterface";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Config } from "@/app/config";
import Modal from "../components/Modal";
import Image from "next/image";
import { ApiError } from "@/app/interface/ErrorInterface";


export default function BookPage() {
  const [books, setBooks] = useState<BookInterface[]>([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState<File | null>();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = Config.apiURL + '/api/book'
      const response = await axios.get(url)
      if (response.status === 200) {
        setBooks(response.data)
      }
      
    } catch (error: unknown) {
      const err = error as ApiError;
      Swal.fire({
        title: 'เกิดข้อผิพลาด',
        text: err.response?.data?.message || err.message,
        icon: 'error'
      })
    }
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false);
    resetForm();
};

const resetForm = () => {
    setId("");
    setName("");
    setPrice(0);
    setDescription("");
    setIsbn("");
    setImageUrl("");
    setImage(null);
};




const handelSave = async () => {
    try {
      const data = new FormData()
      if (image) {
        data.append("image", image as Blob)
      }
      data.append("isbn", isbn)
      data.append("name", name)
      data.append("price", price.toString())
      data.append("description", description)
      
      let response: {
        status: number;
        data: BookInterface;
      }

      if (id == '') {
        
          // insert
          const url = Config.apiURL + '/api/book'
          response = await axios.post(url, data)
      }else{
          // update
          const url = Config.apiURL + '/api/book/' + id
          response = await axios.put(url, data)
      }
        
        if (response.status === 200) {
          Swal.fire({
            title: 'สำเร็จ',
            text: 'เพิ่มหนังสือสำเร็จ',
            icon: 'success',
            timer: 1000
          })
          resetForm()
          fetchData()
          closeModal()
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

const handleEdit = (book: BookInterface) => {
    setId(book.id)
    setName(book.name)
    setPrice(book.price)
    setDescription(book.description ?? '')
    setIsbn(book.isbn ?? '')
    setImageUrl(book.image as string)


    openModal();
}

const handelDelete = async (book: BookInterface) => {
    const button = await Swal.fire({
        title: 'ลบหนังสือ',
        text: 'คุณต้องการลบหนังสือชื่อ ' + book.name + ' หรือไม่ ?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true
    })

    if (button.isConfirmed) {
        try {
            const response = await axios.delete(Config.apiURL + '/api/book/' + book.id)
            if (response.status === 200) {
                Swal.fire({
                    title: 'สำเร็จ',
                    text: 'ลบหนังสือสำเร็จ',
                    icon: 'success',
                    timer: 1000
                })
                fetchData()
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
}

const chooseFile = (files: FileList | null): void => {
    if (files && files.length > 0) {
      // console.log(files[0])
      const file: File = files[0]
      setImage(file)
    }
}

  return (
    <>
      <div className="container">
        <div className="title">หนังสือ</div>

        <div>
        <button onClick={openModal}>
          <i className="fa fa-plus mr-2"></i>
          เพิ่มหนังสือ
        </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>isbn</th>
              <th>ชื่อ</th>
              <th style={{ textAlign: 'right' }}>ราคา</th>
              <th>รายละเอียด</th>
              <th className="w-[130px]">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book: BookInterface) => (
              <tr key={book.id}>
                <td className="text-center">
                  {book.image != null ? (
                    <div className="relative w-[150px] h-[150px]">
                      <Image 
                        src={`${Config.apiURL}/uploads/${book.image}`}
                        alt={book.name || 'Book cover'}
                        fill
                        className="object-cover rounded-xl shadow-md"
                        sizes="150px"
                      />
                    </div>
                  ) : (
                    <i className="fa fa-image text-6xl text-gray-500"></i>
                  )}
                  </td>
                <td>{book.isbn}</td>
                <td>{book.name}</td>
                <td style={{ textAlign: 'right' }}>{book.price}</td>
                <td>{book.description}</td>
                <td>
                  <div className="flex gap-2 items-center">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(book)}
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handelDelete(book)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {showModal ? (
        <Modal
          title="เพิ่มหนังสือ"
          onClose={closeModal}
          
        >
          <div>
            <label>isbn</label>
            <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          </div>
          <div>
            <label>ชื่อ</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>ราคา</label>
            <input 
              type="number" 
              value={price || ''} 
              onChange={(e) => setPrice(Number(e.target.value) || 0)} 
            />
          </div>
          <div>
            <label>รายละเอียด</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label>รูปภาพ</label>
            {imageUrl != null && (
              <div className="relative w-full h-48 mt-3 mb-3">
                <Image
                  src={`${Config.apiURL}/uploads/${imageUrl}`}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            <input type="file" onChange={(e) => chooseFile(e.target.files)} />
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
                            onClick={handelSave}
                        >
                            <i className="fa fa-check mr-2"></i>
                            บันทึก
                        </button>
                    </div>
          
        </Modal>
      ) : null}
    </>
  );
}
