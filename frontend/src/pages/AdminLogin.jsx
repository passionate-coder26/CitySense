import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen flex flex-col">

      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center gap-2 text-black-600 font-bold text-xl">
        CitySense AI
        </div>
      </header>

      {/* CENTER LOGIN CARD */}
      <div className="flex justify-center items-start mt-16 px-4">
        <div className="bg-white shadow-lg border rounded-2xl max-w-md w-full p-8">

          {/* ICON */}
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full text-2xl">
              📍
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold">Admin Portal</h2>
          <p className="text-center text-gray-500 text-sm">
            Secure access to CitySense AI management console
          </p>

          {/* FORM */}
          <div className="mt-6">

            <label className="text-sm font-semibold">Email Address</label>
            <input
              type="email"
              placeholder="Enter your username or Email"
              className="w-full border rounded-lg px-3 py-2 mt-1 outline-blue-500"
            />

            <label className="text-sm font-semibold mt-4 block">Password</label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full border rounded-lg px-3 py-2 outline-blue-500"
              />
              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img width="20" height="20" style={{ paddingTop: "4px" }} src="https://img.icons8.com/ios/50/visible--v1.png" alt="visible--v1"/>
              </span>
            </div>

            {/* SIGN IN */}
            <button
  onClick={() => navigate("/admin/dashboard")}
  className="bg-blue-600 text-white w-full py-2 rounded-lg mt-5"
>
  Sign In
</button>

          </div>


          {/* FOOTER */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Not an admin?
            <Link to="/" className="text-blue-600 ml-1">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
