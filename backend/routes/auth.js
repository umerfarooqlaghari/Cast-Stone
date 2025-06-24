const express = require("express");
const passport = require("passport");
const router = express.Router();
const { signUp, signIn, resetPassword, validateResetPassword } = require("../controllers/authController");

// Google login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful login, redirect to home page or dashboard
    res.redirect("/home");  // Redirect after successful Google login
  }
);

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/reset-password", resetPassword);
router.post("/reset-password/validate", validateResetPassword);

module.exports = router;

