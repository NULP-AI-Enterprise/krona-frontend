export const ROLE_HIERARCHY = ['GUEST', 'USER', 'COMPILER', 'ADMIN', 'SUPER_ADMIN'];

export const getCurrentUser = () => ({
    id: parseInt(localStorage.getItem('user_id')) || null,
    fullName: localStorage.getItem('user_full_name') || '',
    email: localStorage.getItem('user_email') || '',
    role: localStorage.getItem('user_role') || '',
    isAuthenticated: !!localStorage.getItem('access_token'),
});

export const hasRole = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};

export const hasMinimumRole = (userRole, requiredRole) => {
    return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
};
