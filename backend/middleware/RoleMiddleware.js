// backend/middleware/roleMiddleware.js

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found on request" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};

// Convenience middleware for specific roles
export const faculty = requireRole("faculty");
export const student = requireRole("student");
export const admin = requireRole("admin");
