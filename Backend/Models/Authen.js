const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Administrator = require("../models/Administrator");

/**
 * Verifies the Bearer JWT and attaches req.user (end-user) or
 * req.admin (dashboard responder) depending on the token's role claim.
 */
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") {
      req.admin = await Administrator.findById(decoded.id);
      if (!req.admin) throw new Error("Admin not found");
    } else {
      req.user = await User.findById(decoded.id);
      if (!req.user) throw new Error("User not found");
    }
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid" });
  }
};

/** Restricts a route to admin-role tokens only (Live Terminal / triage endpoints). */
const adminOnly = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

module.exports = { protect, adminOnly };
