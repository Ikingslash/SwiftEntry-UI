import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

export default function PublicRoute({ children }) {
  const { user, authData } = useAuth();

  if (user === undefined) {
    return children;
  }
  else if (user) {
    if (authData.role === "patient"){
        return <Navigate to="/dashboard" />
    }else if(authData.role === "facility"){
        return <Navigate to="/facilities/dashboard" />
    }else if (authData.role === "doctor"){
        return <Navigate to="/doctor/dashboard" />
    }
  }
  else {
    return children;
  }
}