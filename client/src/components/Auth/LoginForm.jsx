import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await api.post('/users/login', { email, password });
      const token = response.data.token;
      login(token);
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
        sessionStorage.setItem('token', token);
      }
      toast.success('Login successful!');
      navigate('/admin');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        (err.response?.status === 401
          ? 'Invalid email or password, or user is blocked'
          : err.message) ||
        'Login failed';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4c6fff 0%, #b347d9 50%, #7c3aed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px 40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
          width: '100%',
          border: 'none',
        }}
      >
        <h1 className="mb-3" style={{ fontSize: '36px', fontWeight: '700', color: '#4c6fff', letterSpacing: '2px', textAlign: 'center' }}>THE APP</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', marginBottom: '8px' }}>Start your journey</p>
        <p style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', textAlign: 'center', marginBottom: '32px' }}>Sign in to The App</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', backgroundColor: '#fafafa', marginBottom: '20px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3" style={{ position: 'relative' }}>
            <label htmlFor="password" style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              id="password"
              style={{ width: '100%', padding: '12px 16px', paddingRight: '44px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', backgroundColor: '#fafafa', marginBottom: '20px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                top: '38px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="mb-3 form-check d-flex align-items-center" style={{ marginBottom: '24px' }}>
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              style={{ width: '18px', height: '18px', marginRight: '8px', accentColor: '#4c6fff' }}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: '14px', color: '#6b7280', cursor: 'pointer' }}>Remember me</label>
          </div>
          <button
            type="submit"
            className="btn w-100"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#9ca3af' : '#4c6fff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Don’t have an account? <Link to="/register" style={{ color: '#4c6fff', textDecoration: 'none', fontWeight: '500' }}>Sign up</Link> | <a href="#" className="text-muted">Forgot password?</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;