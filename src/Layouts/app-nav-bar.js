import { Link, useHistory } from 'react-router-dom';
import '../CSS/nav.css';
import { useAuth } from '../context/AuthContext';

function AppNavBar() {
  const history = useHistory();
  const { role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };

  return (
    <nav className="custom-navbar">
      <div className="container">
        <div className="brand">
          <Link to="/">
            <img
              src="https://tse4.mm.bing.net/th/id/OIP.SGwtU2eVDrBalSP51gC-9gHaFj?w=253&h=190&c=7&r=0&o=5&dpr=1.5&pid=1.7"
              alt="Logo"
              width="60"
              height="60"
            />
          </Link>
          <Link to="/" className="brand-link">
            Doodle
          </Link>
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/info" className="nav-link">
              Info
            </Link>
          </li>
          <li>
            <Link to="/help" className="nav-link">
              Help
            </Link>
          </li>
          <li>
            <Link to="/faq" className="nav-link">
              FAQ
            </Link>
          </li>
          <li>
            <span className="role-chip">{role === 'admin' ? 'Admin' : 'Candidate'}</span>
          </li>
          <li>
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default AppNavBar;
