import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ component: Component, roles = [], ...rest }) {
  const { user, role, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return <div className="route-loading">Checking access...</div>;
        }

        if (!user) {
          return <Redirect to="/login" />;
        }

        if (roles.length > 0 && !roles.includes(role)) {
          return <Redirect to={role === 'admin' ? '/admin' : '/candidate'} />;
        }

        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;
