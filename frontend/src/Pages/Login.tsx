import React, { useState } from "react";
import { motion } from "framer-motion";
import bgImage from "../assets/Collge_Front.jpeg";

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    if (loading) return;
    setIsLogin((prev) => !prev);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      // ✅ Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Login Success ");
    } catch {
      alert("Login Failed ");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      // ✅ Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Register Success ");
    } catch {
      alert("Register Failed ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* ✅ Responsive Card */}
      <div className="relative w-[92%] sm:w-105 md:w-130 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <motion.div
          animate={{ x: isLogin ? "0%" : "-50%" }}
          transition={{ duration: 0.5 }}
          className="flex w-[200%]"
        >
          {/* ================= LOGIN ================= */}
          <div className="w-1/2 flex flex-col justify-center px-5 sm:px-8 py-10">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-6">
              Login
            </h2>

            <input
              type="email"
              placeholder="Email"
              disabled={loading}
              className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />

            <input
              type="password"
              placeholder="Password"
              disabled={loading}
              className="mb-6 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && isLogin && (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              )}
              {loading && isLogin ? "Logging in..." : "Login"}
            </button>

            <p className="text-xs sm:text-sm text-center mt-6">
              Don't have an account?{" "}
              <span
                onClick={toggleMode}
                className={`text-blue-600 font-medium ${
                  loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                Register
              </span>
            </p>
          </div>

          {/* ================= REGISTER ================= */}
          <div className="w-1/2 flex flex-col justify-center px-5 sm:px-8 py-10">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-6">
              Register
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              disabled={loading}
              className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />

            <input
              type="email"
              placeholder="Email"
              disabled={loading}
              className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />

            <input
              type="password"
              placeholder="Password"
              disabled={loading}
              className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />

            <input
              type="number"
              placeholder="Batch Year"
              disabled={loading}
              className="mb-6 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && !isLogin && (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              )}
              {loading && !isLogin ? "Registering..." : "Register"}
            </button>

            <p className="text-xs sm:text-sm text-center mt-6">
              Already have an account?{" "}
              <span
                onClick={toggleMode}
                className={`text-blue-600 font-medium ${
                  loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                Login
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
