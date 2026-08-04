import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';

const RequireAuth = ({ children }) => {
    const user = getCurrentUser();
    if (!user.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default RequireAuth;
