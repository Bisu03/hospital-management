"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaHospitalSymbol, FaUserCircle, FaKey } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ButtomSpinner from "@/components/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("biswanathbera03@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      usernameOrEmail: email,
      password: password,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error);
      setTimeout(() => location.reload(), 3000);
    } else {
      setLoading(false);
      router.push("/");
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header Section */}


      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-teal-600 p-6">
              <div className="flex items-center justify-center space-x-3">
                <FaHospitalSymbol className="h-8 w-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Hospital Staff Portal</h2>
              </div>
            </div>

            <div className="px-8 py-10">
              {error && (
                <div className="mb-6 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaUserCircle className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                      placeholder="name@hospital.org"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FaKey className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-gray-400 hover:text-teal-600"
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {loading ? (
                    <ButtomSpinner />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Support Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Need help? Contact IT Support:{" "}
              <a href="tel:+1234567890" className="text-teal-600 hover:text-teal-700">
                +91 8637018031
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-2 md:mb-0">
              © {new Date().getFullYear()} LHMS. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-teal-600">Privacy Policy</a>
              <a href="#" className="hover:text-teal-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}