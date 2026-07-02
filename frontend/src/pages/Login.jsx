import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './Auth.css';

function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));

if (res.data.user.role === 'admin') {
  navigate('/admin');
} else {
  navigate('/');
}
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <span>Zamanss Homestay</span>
          </Link>
          <h2>Welcome back!</h2>
          <p>Sign in to manage your bookings, view your history, and enjoy exclusive offers.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Sign In</h1>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
            <label style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              Password
              <Link to="/forgot-password" style={{fontSize:'0.8rem', color:'var(--primary)', fontWeight:500}}>
                Forgot password?
              </Link>
            </label>
            <div className="input-wrap">
              <input type="password" name="password" placeholder="Enter your password"
                value={form.password} onChange={handleChange} required />
            </div>
          </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-footer-text">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;