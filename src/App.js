import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import './App.css';
import DashBoard from './Pages/Dashboard';
import AppNavBar from './Layouts/app-nav-bar';
import Info from './Pages/Info';
import help from './Pages/Help';
import Faq from './Pages/FAQ';
import Login from './Pages/Login';
import CandidateDashboard from './Pages/CandidateDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, role } = useAuth();
  const location = useLocation();
  const showNav = Boolean(user) && location.pathname !== '/login';

  return (
    <div className="App">
      {showNav ? <AppNavBar /> : null}
      <Switch>
        <Route path="/login" component={Login} />

        <ProtectedRoute path="/admin" roles={['admin']} component={DashBoard} />
        <ProtectedRoute path="/candidate" roles={['candidate', 'admin']} component={CandidateDashboard} />
        <ProtectedRoute path="/info" roles={['candidate', 'admin']} component={Info} />
        <ProtectedRoute path="/help" roles={['candidate', 'admin']} component={help} />
        <ProtectedRoute path="/faq" roles={['candidate', 'admin']} component={Faq} />

        <Route exact path="/">
          {!user ? <Redirect to="/login" /> : role === 'admin' ? <Redirect to="/admin" /> : <Redirect to="/candidate" />}
        </Route>

        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
