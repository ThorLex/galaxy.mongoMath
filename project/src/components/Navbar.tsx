import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sigma, Menu, Github } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  onAuthClick: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onMenuClick, 
  onAuthClick, 
  isAuthenticated, 
  onLogout 
}) => {
  const location = useLocation();

  return (
    <nav className="bg-green-900/50 backdrop-blur-lg border-b border-green-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={onMenuClick} className="lg:hidden p-2 text-green-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center space-x-3">
              <Sigma className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">MongoMath</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <NavLink to="/docs">Documentation</NavLink>
            <NavLink to="/examples">Examples</NavLink>
            <NavLink to="/api">API</NavLink>
            <NavLink to="/community">Community</NavLink>
            
            <a href="https://github.com/ThorLex/galaxy.mongoMath" 
               className="text-green-300 hover:text-white flex items-center space-x-2">
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
            
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`${
        isActive 
          ? 'text-white bg-green-800/50' 
          : 'text-green-300 hover:text-white'
      } px-3 py-2 rounded-lg transition-colors`}
    >
      {children}
    </Link>
  );
};

export default Navbar;