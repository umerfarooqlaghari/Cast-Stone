module.exports = function isAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    if (req.user) return next();
    return res.status(401).json({ message: "Unauthorized" });
  };
  