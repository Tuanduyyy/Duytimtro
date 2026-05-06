import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, Phone, LogOut, User, Heart, Menu, X as CloseIcon } from 'lucide-react';
import { useRooms } from '../context/RoomContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, favorites } = useRooms();
  const [logoClicks, setLogoClicks] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/rooms', label: 'Danh sách phòng', icon: List },
    { path: '/favorites', label: 'Yêu thích', icon: Heart },
    { path: '/contact', label: 'Liên hệ', icon: Phone },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // Secret admin trigger
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      setLogoClicks(0);
      navigate('/duy-dang-nhap');
      return;
    }
    
    setLogoClicks(newCount);
    // Reset count after 2 seconds of inactivity
    setTimeout(() => setLogoClicks(0), 2000);

    // Navigation and Scroll to top logic
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
          <div className="flex justify-between h-20 items-center">
            <div 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 cursor-pointer select-none"
            >
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-accent font-serif font-bold text-2xl shadow-xl shadow-primary/10">
                D
              </div>
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-primary hidden xs:block">
                Duy <span className="text-accent italic">Tìm Trọ</span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold tracking-wide uppercase transition-colors hover:text-accent flex items-center space-x-2 ${
                    location.pathname === link.path ? 'text-accent' : 'text-gray-500'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.path === '/favorites' && favorites.length > 0 && (
                    <span className="bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              ))}
              
              <div className="h-6 w-px bg-gray-100 mx-2"></div>

              {currentUser ? (
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    {currentUser.role === 'admin' ? (
                      <Link to="/duy-quan-ly" className="flex items-center space-x-3 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          location.pathname === '/duy-quan-ly' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'
                        }`}>
                          <User size={16} />
                        </div>
                        <span className={`text-sm font-bold transition-colors ${
                          location.pathname === '/duy-quan-ly' ? 'text-accent' : 'text-gray-700 group-hover:text-accent'
                        }`}>
                          {currentUser.name}
                        </span>
                      </Link>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                          <User size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{currentUser.name}</span>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              ) : null}

            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 -mr-2 text-primary hover:text-accent transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <CloseIcon size={32} /> : <Menu size={32} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-accent font-serif font-bold text-xl">
                    D
                  </div>
                  <span className="text-xl font-serif font-bold text-primary italic">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-accent transition-colors"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${
                      location.pathname === link.path 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon size={20} />
                    <span className="text-base">{link.label}</span>
                    {link.path === '/favorites' && favorites.length > 0 && (
                      <span className="bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                        {favorites.length}
                      </span>
                    )}
                  </Link>
                ))}

                {currentUser?.role === 'admin' && (
                  <Link
                    to="/duy-quan-ly"
                    className={`flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${
                      location.pathname === '/duy-quan-ly' 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User size={20} />
                    <span className="text-base">Quản trị hệ thống</span>
                  </Link>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                {currentUser && (
                  <>
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                        <User size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-primary leading-none mb-1 truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all"
                    >
                      <LogOut size={20} />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

