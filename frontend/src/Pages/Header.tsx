import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Handle scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Events", path: "/events" },
    { label: "Gallery", path: "/gallery" },
    { label: "Members", path: "/member" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "glass" : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div
              className="flex-shrink-0 cursor-pointer flex items-center gap-3"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                SR
              </div>
              <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-gradient hidden sm:block">
                SRIT Alumni
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate("/ProfilePage")}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      location.pathname === "/ProfilePage"
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 rounded-full text-sm border-2 border-red-100 text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn-gradient px-5 py-2 rounded-full text-sm font-semibold"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute w-full bg-white border-b border-slate-200 shadow-xl transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <div className="border-t border-slate-100 my-2 pt-2"></div>
            
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    navigate("/ProfilePage");
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${
                    location.pathname === "/ProfilePage"
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center btn-gradient px-4 py-2 rounded-lg font-medium"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

