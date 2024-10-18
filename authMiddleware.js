const jwt = require("jsonwebtoken");
const roles = require("./roles");
// Middleware to authenticate user
function authenticateToken(req, res, next) {
  const token = req.cookies.token
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, "your_jwt_secret");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}

// Middleware to authorize user based on role and permission
function authorizeRole(action) {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles[userRole] || !roles[userRole].includes(action)) {
      return res.status(403).send("Access Denied");
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
