import { useNavigate } from "react-router-dom"
import { useState } from "react";

const Header = () => {

    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <div className="w-full bg-white shadow mx-0 px-0 sticky top-0">
                <div className="flex flex-col items-center">
                    <h1 className="text-center font-bold text-xl sm:text-2xl py-4 w-full">
                        Sri Ramakrishna Institute of Technology Alumni Website
                    </h1>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:block w-full bg-blue-500 h-15">
                        <ul className="cursor-pointer flex flex-wrap gap-3 justify-center h-full">
                            {[
                              { label: 'Home', path: '/' },
                              { label: 'About', path: '/about' },
                              { label: 'ProfilePage', path: '/ProfilePage' },
                              { label: 'Events', path: '/events' },
                              { label: 'Gallery', path: '/gallery' },
                              { label: 'Member', path: '/member' },
                              { label: 'Register::Login', path: '/login' },
                            ].map((item) => (
                              <li key={item.path} className="h-full">
                                <button
                                  onClick={() => navigate(item.path)}
                                  className="h-full px-3 py-1 bg-blue-500 text-white hover:bg-red-500 transition-colors flex items-center text-sm md:text-base"
                                >
                                  {item.label}
                                </button>
                              </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden w-full bg-blue-500 h-15 flex items-center justify-start px-4">
                        <button
                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                          className="text-white text-2xl focus:outline-none"
                        >
                          ☰
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                      <div className="md:hidden w-full bg-blue-500">
                        <ul className="cursor-pointer flex flex-col w-full">
                            {[
                              { label: 'Home', path: '/' },
                              { label: 'About', path: '/about' },
                              { label: 'ProfilePage', path: '/ProfilePage' },
                              { label: 'Events', path: '/events' },
                              { label: 'Gallery', path: '/gallery' },
                              { label: 'Member', path: '/member' },
                              { label: 'Register::Login', path: '/login' },
                            ].map((item) => (
                              <li key={item.path} className="w-full border-b border-blue-600">
                                <button
                                  onClick={() => {
                                    navigate(item.path);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="w-full px-4 py-3 text-white hover:bg-red-500 transition-colors text-left"
                                >
                                  {item.label}
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
            </div>
        </>

    )
}

export default Header