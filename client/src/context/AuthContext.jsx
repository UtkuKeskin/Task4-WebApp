import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();
  const location = useLocation();

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/admin');
  };

  const logout = (message = 'Logged out successfully') => {
    setToken('');
    localStorage.removeItem('token');
    toast.info(message);
    navigate('/login');
  };

  useEffect(() => {
    const publicPaths = ['/login', '/register'];

    if (!token && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [token, navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);