const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const jwt = require("jsonwebtoken");
const otp = require("otp-generator");
const { sendResetPasswordMail, sendResetPasswordConfirmationMail } = require("../service/sendMail");

//SIGNUP
const signUp = async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    // Basic validation
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      confirmPassword, // virtual field, required for schema validation
      name
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Error creating user",
      error: err.message || "Unknown error"
    });
  }
};

// SIGNIN
// SIGNIN
const signIn = async (req, res) => {
  try {
    if (!req.body?.email || !req.body?.password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // ✅ Include name and email
    res.status(200).json({
      message: "User signed in successfully",
      user: {
        name: user.name,
        email: user.email,
        userId: user.userId
      },
      token
    });

  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({
      message: "Error signing in",
      error: err.message || "Unknown error"
    });
  }
};
//RESET PASSWORD REQUESTD
const resetPassword = async (req, res) => {
  try {
    if (!req.body?.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const otpCode = otp.generate(6, { upperCase: false, specialChars: false, alphabets: false });

    const existingOtp = await Otp.findOne({ userId: user._id });
    if (existingOtp) {
      existingOtp.otpCode = otpCode;
      existingOtp.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      await existingOtp.save();
    }
    else {
      const newOtp = new Otp({
        email,
        otpCode,
        userId: user._id,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes from now
      });
      await newOtp.save();
    }
    // Send OTP to user's email
    sendResetPasswordMail(email, otpCode)

    return res.status(200).json({ message: "Password reset OTP sent to your email" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Error in reset password",
      error: err.message || "Unknown error"
    });
  }
};

// RESET PASSWORD
const validateResetPassword = async (req, res) => {
  try {
    if (!req.body?.email || !req.body?.otpCode || !req.body?.newPassword) {
      return res.status(400).json({ message: "Email,Otp and Password is required" });
    }
    const { email, otpCode, newPassword } = req.body;
    const checkOtp = await Otp.findOne({ email, otpCode });
    if (!checkOtp) return res.status(400).json({ message: "Invalid OTP" });
    if (checkOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    const updateUser = await User.findOne({ email });
    if (!updateUser) return res.status(400).json({ message: "User not found" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateUser.password = hashedPassword;
    await updateUser.save();
    //send password reset confirmation email
    sendResetPasswordConfirmationMail(email, "Your password has been reset successfully");
    return res.status(200).json({ message: "Password has been reset" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Error in reset password",
      error: err.message || "Unknown error"
    });
  }
};

module.exports = { signUp, signIn, resetPassword, validateResetPassword };
