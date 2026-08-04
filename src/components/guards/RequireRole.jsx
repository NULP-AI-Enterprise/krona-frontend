import { Navigate } from 'react-router-dom';
import { getCurrentUser, hasRole } from '../../utils/auth';

const RequireRole = ({ roles, children, fallback = null, renderDenied = false }) => {
    const user = getCurrentUser();

    if (!user.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(user.role, roles)) {
        if (renderDenied) {
            return fallback || (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h2>Доступ заборонено</h2>
                </div>
            );
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RequireRole;
