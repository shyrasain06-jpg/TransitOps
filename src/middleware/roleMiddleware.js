// Role-Based Access Control Middleware
exports.authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Unauthorized: No role specified",
      });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};
