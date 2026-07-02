import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import './Auth.css';

function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
          <h2>Forgot your password?</h2>
          <p>No worries! Enter your email address and we'll send you a link to reset your password.</p>
          <div className="auth-features">
            <div className="auth-feature"><span className="feature-icon">✉️</span><span>Reset link sent to your email</span></div>
            <div className="auth-feature"><span className="feature-icon">⏱️</span><span>Link valid for 1 hour</span></div>
            <div className="auth-feature"><span className="feature-icon">🔒</span><span>Secure password reset</span></div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {success ? (
            <div className="forgot-success">
              <div className="forgot-success-icon">📧</div>
              <h2>Check your email!</h2>
              <p>We've sent a password reset link to <strong>{email}</strong>.</p>
              <p>Please check your inbox and spam folder.</p>
              <p className="forgot-note">The link will expire in <strong>1 hour</strong>.</p>
              <Link to="/login" className="auth-btn" style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'24px'}}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-form-header">
                <h1>Reset Password</h1>
                <p>Remember your password? <Link to="/login">Sign in here</Link></p>
              </div>

              {error && <div className="alert alert-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>

              <p className="auth-footer-text">
                <Link to="/login">← Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

export default ForgotPassword;