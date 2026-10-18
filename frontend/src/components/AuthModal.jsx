import React, { useState } from 'react';
import { CloseIcon, UserIcon, SparklesIcon } from './Icons';

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await onRegister(name.trim(), email.trim(), password);
      } else {
        await onLogin(email.trim(), password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@example.com');
    setPassword('DemoPassword123');
    setName('Demo Explorer');
    setError('');
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="auth-modal-container glass-panel animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <UserIcon size={20} />
          </div>
          <h2 className="auth-title">
            {isRegisterMode ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {isRegisterMode
              ? 'Join AuraNotes to synchronize your notes across devices with Neon DB'
              : 'Sign in to access and manage your private cloud notes'}
          </p>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="auth-error-alert animate-fade-in">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegisterMode}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Authenticating...'
              : isRegisterMode
              ? 'Create Free Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="auth-demo-footer">
          <button
            type="button"
            className="btn btn-ghost btn-sm demo-fill-btn"
            onClick={fillDemoAccount}
          >
            <SparklesIcon size={14} />
            <span>Fill Demo Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
