import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/Collge_Front.jpeg";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "461770927726-e3ae8196kf2b5uukpfa3v6kitu18ckdm.apps.googleusercontent.com";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"student" | "admin">("student");

  // Register fields
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerBatchYear, setRegisterBatchYear] = useState("");
  const [registerRole, setRegisterRole] = useState<"student" | "admin">("student");
  const [registerOtp, setRegisterOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      setOtpMessage(null);
      setOtpError(null);
      const res = await fetch("/api/auth/admin-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorDetail = data.detail || "Failed to send OTP. Please try again.";
        setOtpError(errorDetail);
        alert(errorDetail);
        return;
      }

      if (data.emailDelivered === false) {
        setOtpSent(false);
        const errDetail = data.deliveryError || data.message || "Failed to send email via SMTP.";
        setOtpError(`Delivery Error: ${errDetail}`);
        alert(
          `Could not deliver OTP to sritalumni@gmail.com!\n\n` +
          `Diagnostic Reason:\n${errDetail}\n\n` +
          `Gmail SMTP Setup:\n` +
          `1. Open Google Account for sritalumni@gmail.com -> Security\n` +
          `2. Turn on 2-Step Verification\n` +
          `3. Visit App Passwords: https://myaccount.google.com/apppasswords\n` +
          `4. Generate a 16-character App Password\n` +
          `5. Paste into backend/.env:\n` +
          `   SMTP_PASS=xxxx xxxx xxxx xxxx`
        );
        return;
      }

      setOtpSent(true);
      setOtpCooldown(60);
      setOtpMessage("Verification OTP has been sent to sritalumni@gmail.com! Please check your Gmail inbox and enter the 6-digit code.");
      alert("Verification OTP has been successfully sent to sritalumni@gmail.com!\n\nPlease check your email inbox and enter the 6-digit code.");
    } catch (err) {
      console.error("OTP send error:", err);
      const netErr = "Failed to connect to authentication server. Please check your network connection.";
      setOtpError(netErr);
      alert(netErr);
    } finally {
      setSendingOtp(false);
    }
  };

  const toggleMode = () => {
    if (loading) return;
    setIsLogin((prev) => !prev);
  };

  // State refs to eliminate stale closure issues with Google Identity Services callback
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;

  const loginRoleRef = useRef(loginRole);
  loginRoleRef.current = loginRole;

  const registerRoleRef = useRef(registerRole);
  registerRoleRef.current = registerRole;

  const registerOtpRef = useRef(registerOtp);
  registerOtpRef.current = registerOtp;

  const handleGoogleSuccess = async (response: { credential?: string }) => {
    if (!response?.credential) {
      alert("Google sign-in did not return a valid credential.");
      return;
    }

    const currentIsLogin = isLoginRef.current;
    const currentLoginRole = loginRoleRef.current;
    const currentRegisterRole = registerRoleRef.current;
    const currentRegisterOtp = registerOtpRef.current.trim();

    const activeRole = currentIsLogin ? currentLoginRole : currentRegisterRole;

    // If attempting to register/sign-in as admin via Google, ensure OTP is entered
    if (!currentIsLogin && activeRole === "admin" && !currentRegisterOtp) {
      alert(
        "Administrator registration requires verification.\n\nPlease click 'Send OTP' to receive the 6-digit verification code at sritalumni@gmail.com, enter the OTP in the box above, and then click Sign up with Google."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
          role: activeRole,
          otp: activeRole === "admin" && currentRegisterOtp ? currentRegisterOtp : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.detail || "Google authentication failed. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert(
        `Welcome, ${data.user?.fullName || "Alumni"}! Successfully signed in as ${
          data.user?.role === "admin" ? "Administrator" : "Student"
        }.`
      );

      if (data.user?.role === "admin") {
        navigate("/events");
      } else {
        navigate("/ProfilePage");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccessRef = useRef(handleGoogleSuccess);
  handleGoogleSuccessRef.current = handleGoogleSuccess;

  useEffect(() => {
    const renderGoogleButtons = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (res: any) => handleGoogleSuccessRef.current(res),
          });

          const loginBtn = document.getElementById("googleBtnLogin");
          if (loginBtn) {
            loginBtn.innerHTML = "";
            window.google.accounts.id.renderButton(loginBtn, {
              theme: "outline",
              size: "large",
              width: 300,
              text: "continue_with",
              shape: "pill",
            });
          }

          const registerBtn = document.getElementById("googleBtnRegister");
          if (registerBtn) {
            registerBtn.innerHTML = "";
            window.google.accounts.id.renderButton(registerBtn, {
              theme: "outline",
              size: "large",
              width: 300,
              text: "signup_with",
              shape: "pill",
            });
          }
        } catch (err) {
          console.error("Error initializing Google Identity Services:", err);
        }
      }
    };

    renderGoogleButtons();
    const timer = setTimeout(renderGoogleButtons, 600);
    return () => clearTimeout(timer);
  }, [isLogin, loginRole, registerRole]);

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
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole }),
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

      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`Welcome, ${data.user.fullName || "Alumni"}! Logged in as ${data.user.role === "admin" ? "Administrator" : "Student"}.`);

      // Redirect directly to events for admin, or profile page for students
      if (data.user.role === "admin") {
        navigate("/events");
      } else {
        navigate("/ProfilePage");
      }
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

      if (registerRole === "admin" && !registerOtp.trim()) {
        alert("Please enter the Administrator OTP sent to sritalumni@gmail.com.");
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
          role: registerRole,
          otp: registerRole === "admin" ? registerOtp.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Registration failed. Please try again.");
        return;
      }

      const data = await res.json();

      // If token is returned, immediately sign in the new account
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert(
          `Welcome, ${data.user.fullName}! Successfully registered and signed in as ${
            data.user.role === "admin" ? "Administrator" : "Student"
          }.`
        );

        if (data.user.role === "admin") {
          navigate("/events");
        } else {
          navigate("/ProfilePage");
        }
        return;
      }

      alert(`Registered successfully as ${data.user.fullName} (${data.user.role === "admin" ? "Administrator" : "Student"}). You can now log in.`);

      // Clear register form and switch to login
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterBatchYear("");
      setRegisterOtp("");
      setOtpSent(false);
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

      {/* Back to Home Button — Prominent, outside the card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl mb-4">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span className="font-semibold text-sm">Back to Home</span>
        </button>
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-1">

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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Login as</label>
                  <select
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value as "student" | "admin")}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
                  >
                    <option value="student">Student / Alumni</option>
                    <option value="admin">Administrator</option>
                  </select>
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

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <div className="flex justify-center w-full min-h-[44px]">
                  <div id="googleBtnLogin" className="flex justify-center"></div>
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

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Register as</label>
                  <select
                    value={registerRole}
                    onChange={(e) => {
                      setRegisterRole(e.target.value as "student" | "admin");
                      setRegisterOtp("");
                      setOtpMessage(null);
                      setOtpError(null);
                    }}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 text-sm font-medium"
                  >
                    <option value="student">Student / Alumni</option>
                    <option value="admin">Administrator (Requires OTP Verification)</option>
                  </select>
                </div>

                {registerRole === "admin" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">
                        Administrator accounts require authorization. Click <strong>Send OTP</strong> to dispatch a 6-digit code to <strong>sritalumni@gmail.com</strong>.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={registerOtp}
                        onChange={(e) => setRegisterOtp(e.target.value)}
                        maxLength={10}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || otpCooldown > 0}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-xs"
                      >
                        {sendingOtp ? "Sending..." : otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>

                    {otpMessage && (
                      <p className="text-[11px] text-emerald-700 font-semibold">{otpMessage}</p>
                    )}
                    {otpError && (
                      <p className="text-[11px] text-rose-600 font-medium leading-tight">{otpError}</p>
                    )}
                  </div>
                )}

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

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <div className="flex justify-center w-full min-h-[44px]">
                  <div id="googleBtnRegister" className="flex justify-center"></div>
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
