import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiLogIn, FiUserPlus } from 'react-icons/fi';
import '../CSS/auth.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const history = useHistory();
  const { login, register, getRoleForEmail } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'verification'
  const [portal, setPortal] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        await register(email, password);
        setMode('verification');
      } else {
        await login(email, password);
        const derivedRole = getRoleForEmail(email);
        if (portal !== derivedRole) {
          throw new Error(`This account belongs to the ${derivedRole} portal. Please switch portals.`);
        }
        history.push(derivedRole === 'admin' ? '/admin' : '/candidate');
      }
    } catch (authError) {
      setError(authError.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'verification') {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="verification-notice">
            <FiCheckCircle className="icon" />
            <h2>Verify your email</h2>
            <p>
              A verification link has been sent to <strong>{email}</strong>. Please check your inbox and follow the link to activate your account.
            </p>
            <button className="auth-submit" onClick={() => setMode('login')}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h1>
          <p>Access your personalized hiring dashboard.</p>
        </div>

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
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@company.com"
            />
          </div>

          <div className="form-group">
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
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              'Please wait...'
            ) : mode === 'login' ? (
              <>
                <FiLogIn /> Sign In
              </>
            ) : (
              <>
                <FiUserPlus /> Create Account
              </>
            )}
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
