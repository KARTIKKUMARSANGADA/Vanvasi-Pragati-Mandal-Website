import { Navigate } from 'react-router-dom';

export const ADMIN_BASE = '/admin-vpm-portal';

const ProtectedRoute = ({ children }) => {
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (!adminInfo) {
        return <Navigate to={ADMIN_BASE} replace />;
    }

    return children;
};

export default ProtectedRoute;
