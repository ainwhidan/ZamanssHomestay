import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api';
import './Auth.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get('token');

  const [form,      setForm]      = useState({ password: '', confirm: '' });
  const [loading,   setLoading]   = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [userName,  setUserName]  = useState('');
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setValidToken(false);
      return;
    }

    // Verify token
    API.get(`/auth/verify-token?token=${token}`)
      .then(res => {
        setValidToken(true);
        setUserName(res.data.name);
      })
      .catch(() => setValidToken(false))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);

    try {
      await API.post('/auth/reset-password', {
        token,
        password: form.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
            <span>🏡 Zamanss Homestay</span>
          </Link>
          <h2>Create new password</h2>
          <p>Choose a strong password to keep your account secure.</p>
          <div className="auth-features">
            <div className="auth-feature"><span className="feature-icon">🔒</span><span>Minimum 8 characters</span></div>
            <div className="auth-feature"><span className="feature-icon">✅</span><span>Secure & encrypted</span></div>
            <div className="auth-feature"><span className="feature-icon">🏡</span><span>Access all your bookings</span></div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {verifying ? (
            <div style={{textAlign:'center', padding:'40px', color:'var(--text-light)'}}>
              Verifying reset link...
            </div>
          ) : !validToken ? (
            <div className="forgot-success">
              <div className="forgot-success-icon">❌</div>
              <h2>Link Expired</h2>
              <p>This reset link is invalid or has expired.</p>
              <p>Please request a new password reset link.</p>
              <Link to="/forgot-password" className="auth-btn"
                style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'24px'}}>
                Request New Link
              </Link>
            </div>
          ) : success ? (
            <div className="forgot-success">
              <div className="forgot-success-icon">✅</div>
              <h2>Password Reset!</h2>
              <p>Your password has been reset successfully.</p>
              <p>Redirecting to login in 3 seconds...</p>
              <Link to="/login" className="auth-btn"
                style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'24px'}}>
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1>New Password</h1>
                <p>Hi <strong>{userName}</strong>! Enter your new password below.</p>
              </div>

              {error && <div className="alert alert-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat your new password"
                    value={form.confirm}
                    onChange={e => setForm({...form, confirm: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

export default ResetPassword;