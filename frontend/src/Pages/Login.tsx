import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/Collge_Front.jpeg";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register fields
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerBatchYear, setRegisterBatchYear] = useState("");

  const toggleMode = () => {
    if (loading) return;
    setIsLogin((prev) => !prev);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      if (!loginEmail || !loginPassword) {
        alert("Please enter email and password");
        return;
      }

      console.log("Attempting login with:", loginEmail);
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log("Error response:", data);
        alert(data.detail || "Login failed. Please check your credentials.");
        return;
      }

      const data = await res.json();
      console.log("Login response:", data);
      alert(`Welcome, ${data.user.fullName || "Alumni"}!`);
      
      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to profile page after successful login
      navigate("/ProfilePage");
      // Optionally clear fields
      setLoginPassword("");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      if (!registerName || !registerEmail || !registerPassword) {
        alert("Please fill all required fields.");
        return;
      }

      const batchYearNumber = registerBatchYear
        ? parseInt(registerBatchYear, 10)
        : undefined;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registerName,
          email: registerEmail,
          password: registerPassword,
          batchYear: batchYearNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Registration failed. Please try again.");
        return;
      }

      const data = await res.json();
      alert(`Registered successfully as ${data.user.fullName}. You can now log in.`);

      // Clear register form and switch to login
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterBatchYear("");
      setIsLogin(true);
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 px-4 py-8">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Campus Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-900/80"></div>
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000 z-0"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-1">
        
        {/* Navigation back */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors z-20 flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Home
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-inner relative">
          <motion.div
            animate={{ x: isLogin ? "0%" : "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex w-[200%]"
          >
            {/* ================= LOGIN ================= */}
            <div className="w-1/2 flex flex-col justify-center px-8 sm:px-12 py-16">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  SR
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-sm text-slate-500 mt-2">Sign in to your alumni account</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled={loading}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    disabled={loading}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="btn-gradient w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading && isLogin && (
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    )}
                    {loading && isLogin ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </div>

              <p className="text-sm text-center mt-8 text-slate-600">
                Don't have an account?{" "}
                <button
                  onClick={toggleMode}
                  disabled={loading}
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Create account
                </button>
              </p>
            </div>

            {/* ================= REGISTER ================= */}
            <div className="w-1/2 flex flex-col justify-center px-8 sm:px-12 py-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Join the Network
                </h2>
                <p className="text-sm text-slate-500 mt-2">Create your alumni profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    disabled={loading}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled={loading}
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      disabled={loading}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Batch Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2020"
                      disabled={loading}
                      value={registerBatchYear}
                      onChange={(e) => setRegisterBatchYear(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="btn-gradient w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading && !isLogin && (
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    )}
                    {loading && !isLogin ? "Creating account..." : "Create Account"}
                  </button>
                </div>
              </div>

              <p className="text-sm text-center mt-6 text-slate-600">
                Already have an account?{" "}
                <button
                  onClick={toggleMode}
                  disabled={loading}
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
