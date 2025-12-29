
// components/Navbar.tsx
import React, { useState } from 'react';
import { User, ViewMode } from '../types';

interface NavbarProps {
  user: User;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentView, onNavigate, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { label: 'Play', icon: '🎮', view: ViewMode.GAME },
    { label: 'History', icon: '📜', view: ViewMode.HISTORY },
    { label: 'Leaderboard', icon: '🏆', view: ViewMode.LEADERBOARD },
    { label: 'Challenges', icon: '⚔️', view: ViewMode.ACTIVE_CHALLENGES },
    { label: 'Stats', icon: '📊', view: ViewMode.STATISTICS },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const getNavItemClass = (view: ViewMode) => {
    const isActive = currentView === view;
    return `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-bold ${
      isActive
        ? 'bg-sky-100 text-sky-700 shadow-sm'
        : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
    }`;
  };

  return (
    <nav className="w-full max-w-6xl mx-auto mb-6 px-4 z-50 relative pt-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-6 py-3 flex justify-between items-center relative">
        {/* Logo Section */}
        <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => handleNavClick(ViewMode.GAME)}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
            🧮
          </div>
          <span className="text-xl font-black text-indigo-900 hidden sm:block tracking-tight">
            Quick Math
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={getNavItemClass(item.view)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Profile Dropdown (Desktop) / Mobile Toggle */}
        <div className="flex items-center gap-4">
            {/* Desktop User Section with Dropdown */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-100 relative">
                <button 
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 focus:outline-none group"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-indigo-900 leading-tight group-hover:text-indigo-700">
                            {user.displayName || user.username}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-gray-500">My Account</p>
                    </div>
                    {user.profilePictureBase64 ? (
                        <img src={user.profilePictureBase64} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                        </div>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu Overlay */}
                {isUserMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all duration-200">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-sm font-bold text-indigo-900 truncate">{user.displayName || user.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email || 'No email set'}</p>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => handleNavClick(ViewMode.PROFILE)}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-gray-700 transition-colors font-medium"
                                >
                                    <span className="text-lg">👤</span> Edit Profile
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button
                                    onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors font-bold"
                                >
                                    <span className="text-lg">👋</span> Log Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Hamburger */}
            <button
                className="md:hidden p-2 text-indigo-800 focus:outline-none hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-2 md:hidden z-50">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-2">
                 {user.profilePictureBase64 ? (
                    <img src={user.profilePictureBase64} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="overflow-hidden">
                     <p className="text-sm font-bold text-indigo-900 truncate">{user.displayName || user.username}</p>
                     <p className="text-xs text-gray-400 truncate">{user.email || 'No email set'}</p>
                </div>
            </div>

            {navItems.map((item) => (
                <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full text-left p-4 rounded-xl flex items-center gap-3 ${
                    currentView === item.view ? 'bg-sky-50 text-sky-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
                >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
                </button>
            ))}
            
            <div className="h-px bg-gray-100 my-2"></div>
            
            <button
                onClick={() => handleNavClick(ViewMode.PROFILE)}
                className="w-full text-left p-4 rounded-xl flex items-center gap-3 text-gray-600 hover:bg-gray-50"
            >
                <span className="text-xl">👤</span>
                <span className="text-lg">Edit Profile</span>
            </button>
             <button
                onClick={onLogout}
                className="w-full text-left p-4 rounded-xl flex items-center gap-3 text-rose-500 hover:bg-rose-50 bg-rose-50/30"
            >
                <span className="text-xl">🚪</span>
                <span className="text-lg font-bold">Log Out</span>
            </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
