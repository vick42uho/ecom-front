"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Config } from "../../config";
import { useRouter } from "next/navigation";

export default function SigninPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSingIn = async () => {
        try {
            const url = Config.apiURL + "/api/admin/signin";
            const payload = {
                username: username,
                password: password
            }
            const result = await axios.post(url, payload);

            if (result.data.token != null) {
                localStorage.setItem(Config.tokenName, result.data.token);
                
                const role = result.data.role;

                if (role === 'admin') {
                  router.push("/backoffice/home/dashboard");
                } else if (role === 'user') {
                  router.push("/backoffice/home/order");
                }
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success...',
                    text: 'Sign in successfully',
                });
                
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error...',
                text: error.message,
            });
            console.log(error);
        }
    }

    

  return (
    <div className="singin-block">
      <div className="signin">
        <h1>Sing In To Back Office</h1>
        <div>
          <div>username</div>
          <input type="text" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <div>password</div>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <button type="submit" onClick={handleSingIn}>Sign In</button>
        </div>
      </div>
    </div>
  );
}
