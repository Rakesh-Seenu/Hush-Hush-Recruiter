import { Suspense } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import './App.css';
import DashBoard from './Pages/Dashboard';
import AppNavBar from './Layouts/app-nav-bar';
import Info from './Pages/Info';
import Help from './Pages/Help';
import FAQ from './Pages/FAQ';
import Login from './Pages/Login';
import CandidateDashboard from './Pages/CandidateDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const showNav = user && location.pathname !== '/login';

  return (
    <div className="App">
      {showNav && <AppNavBar />}
      <main>
        <Suspense fallback={<div className="route-loading">Loading...</div>}>
          <Switch>
            <Route path="/login" component={Login} />
            <ProtectedRoute path="/admin" component={DashBoard} role="admin" />
            <ProtectedRoute path="/candidate" component={CandidateDashboard} role="candidate" />
            <Route path="/info" component={Info} />
            <Route path="/help" component={Help} />
            <Route path="/faq" component={FAQ} />
            <Redirect from="/" to="/login" />
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
