 
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return null;
  }
  else if (user) {
    return children;
  }
  else {
    const url = location.pathname + location.search + location.hash;
    return <Navigate to="/" state={{next: url}} />
  }
}