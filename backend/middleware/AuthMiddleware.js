import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✔ Normal authentication
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// ✔ Admin-only auth
export const protectAdmin = async (req, res, next) => {
  await protect(req, res, async () => {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Admin access denied" });
    }
    next();
  });
};

// ✔ Fix: Add default export for old imports
export default protect;
