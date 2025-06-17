import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  domains: ["localhost"],
  /* config options here */
  // images: {
  //   domains: ['localhost'],
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: '', // เช่น www.google.com
  //       port: '', // ถ้าไม่มี port ให้ใส่ ''
  //       pathname: '/uploads/**', // ตัวอย่าง: /uploads/**
  //     },
  //   ],
  // },
};

export default nextConfig;
