import { Link } from 'react-router-dom';
import '../CSS/nav.css'
function AppNavBar()
{
    return(
      <nav class="custom-navbar">
        <div class="container">
          <div class="brand">
            <a href='/'><img src="https://tse4.mm.bing.net/th/id/OIP.SGwtU2eVDrBalSP51gC-9gHaFj?w=253&h=190&c=7&r=0&o=5&dpr=1.5&pid=1.7" alt="Logo" width="60" height="60" /></a>
          <a href="/" class="brand-link">Doodle</a>
          </div>
          <ul class="nav-links">
          <li><a href="/Info" class="nav-link">Info</a></li>
          <li><a href="/help" class="nav-link">Help</a></li>
          <li><a href="/faq" class="nav-link">FAQ</a></li>
        </ul>
        </div>
      </nav>
    )
}

export default AppNavBar;
