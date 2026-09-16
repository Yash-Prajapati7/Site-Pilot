import { PERMISSIONS, ROLE_HIERARCHY } from '../config/constants.js';


export const requireRole = (...roles) => (req, res, next) => {
    const role = req.user?.role || req.userRole;
    if (!role) return res.status(401).json({ success: false, error: 'Authentication required' });
    if (!roles.includes(role)) return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    next();
};

export const requirePermission = (permission) => (req, res, next) => {
    const role = req.user?.role || req.userRole;
    if (!role) return res.status(401).json({ success: false, error: 'Authentication required' });
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles || !allowedRoles.includes(role)) {
        return res.status(403).json({ success: false, error: `Permission '${permission}' denied for role '${role}'` });
    }
    next();
};

export const getPermissions = (role) => {
    return Object.entries(PERMISSIONS)
        .filter(([, roles]) => roles.includes(role))
        .map(([perm]) => perm);
};

export { PERMISSIONS, ROLE_HIERARCHY };
