import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../CSS/auth.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const history = useHistory();
  const { login, register, getRoleForEmail } = useAuth();

  const [mode, setMode] = useState('login');
  const [portal, setPortal] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      if (mode === 'register') {
        await register(email, password);
      } else {
        await login(email, password);
      }

      const derivedRole = getRoleForEmail(email);
      if (portal !== derivedRole) {
        throw new Error(`This account belongs to ${derivedRole} portal. Please choose the correct portal.`);
      }

      history.push(derivedRole === 'admin' ? '/admin' : '/candidate');
    } catch (authError) {
      setError(authError.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Doodle Hiring Platform</p>
        <h1>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h1>

        <div className="portal-switch">
          <button
            type="button"
            className={portal === 'candidate' ? 'active' : ''}
            onClick={() => setPortal('candidate')}
          >
            Candidate Portal
          </button>
          <button
            type="button"
            className={portal === 'admin' ? 'active' : ''}
            onClick={() => setPortal('admin')}
          >
            Admin Portal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@company.com"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="Minimum 6 characters"
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="auth-link"
          >
            {mode === 'login' ? 'Register here' : 'Sign in here'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
