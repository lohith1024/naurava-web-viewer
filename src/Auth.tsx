import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, resetPassword } from './firebase';
import './Auth.css';
import LogoImage from './assets/nAurava_logo.png';
import Slideshow from './Slideshow';

enum AuthMode {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD
}

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.REGISTER);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.documentElement.style.width = '';
      document.body.style.width = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, error } = await loginUser(email, password);
      if (error) {
        setError(error);
      } else if (user) {
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { user, error } = await registerUser(email, password);
      if (error) {
        setError(error);
      } else if (user) {
        setSuccessMessage('Registration successful! You can now log in.');
        setMode(AuthMode.LOGIN);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { success, error } = await resetPassword(email);
      if (error) {
        setError(error);
      } else if (success) {
        setSuccessMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img src={LogoImage} alt="NVIDIA Logo" className="auth-logo" />
        <h2 className="auth-title">Omniverse Embedded Web Viewer</h2>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          {successMessage && <div className="auth-success">{successMessage}</div>}
          {error && <div className="auth-error">{error}</div>}

          {mode === AuthMode.LOGIN && (
            <>
              <h3>Login</h3>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <button type="submit" className="nvidia-button" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              <div className="auth-links">
                <button 
                  onClick={() => setMode(AuthMode.REGISTER)} 
                  className="text-link"
                >
                  Need an account? Register
                </button>
                <button 
                  onClick={() => setMode(AuthMode.FORGOT_PASSWORD)} 
                  className="text-link"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          {mode === AuthMode.REGISTER && (
            <>
              <h3>Register</h3>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <button type="submit" className="nvidia-button" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <div className="auth-links">
                <button 
                  onClick={() => setMode(AuthMode.LOGIN)} 
                  className="text-link"
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}

          {mode === AuthMode.FORGOT_PASSWORD && (
            <>
              <h3>Reset Password</h3>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <button type="submit" className="nvidia-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
              <div className="auth-links">
                <button 
                  onClick={() => setMode(AuthMode.LOGIN)} 
                  className="text-link"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
        <div className="slideshow-wrapper">
          <Slideshow />
        </div>
      </div>
    </div>
  );
};

export default Auth; 