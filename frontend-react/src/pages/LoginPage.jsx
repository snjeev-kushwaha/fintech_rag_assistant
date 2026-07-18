/**
 * LoginPage.jsx — Authentication screen
 */
import { useState } from 'react';
import { apiLogin } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiLogin(username.trim(), password);
      login(data);
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className={styles.page}>
      {/* Ambient blobs */}
      <div className={styles.blobLeft} aria-hidden="true" />
      <div className={styles.blobRight} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <span className={styles.logoIcon} role="img" aria-label="bank">🏦</span>
            <span className={styles.logoPulse} aria-hidden="true" />
          </div>
          <h1 className={styles.title}>FinSolve AI</h1>
          <p className={styles.subtitle}>Role-Based Intelligent Knowledge Assistant</p>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <form onSubmit={handleSubmit} noValidate id="login-form">
            <div className={styles.field}>
              <label htmlFor="login-username" className={styles.label}>USERNAME</label>
              <input
                id="login-username"
                type="text"
                className={styles.input}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password" className={styles.label}>PASSWORD</label>
              <input
                id="login-password"
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className={styles.spinnerRow}>
                  <span className={styles.spinner} aria-hidden="true" />
                  Authenticating…
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          Sign in with your department or administrative credentials.
        </p>
      </div>
    </div>
  );
}
