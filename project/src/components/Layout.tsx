import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800">
      <Navbar 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onAuthClick={() => setShowAuthModal(true)}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
      
      <div className="flex">
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <main className="flex-1 px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}