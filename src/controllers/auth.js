import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP, sendPasswordResetEmail } from "../services/emailService.js";
import { generateOTP } from "../utils/otpGenerator.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";


// register and send OTP
export const registerUser = async (req, res) => {
  try {
    const { studentId, email, name, password, phoneNumber } = req.body;

    if (!studentId || !email || !name || !password) {
      return res.status(400).json({ message: "All required fields required." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const sent = await sendOTP(name, email, otp);
    if (!sent.success) {
      return res.status(500).json({ message: "Failed to send OTP." });
    }

    const signupToken = jwt.sign(
      { studentId, email, name, password: hashedPassword, phoneNumber, otp },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      message: "OTP sent to email. Verify to complete registration.",
      token: signupToken
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// veify OTP
export const verifyOTP = async (req, res) => {
  const { otp, token } = req.body;

  if (!otp || !token) {
    return res.status(400).json({ message: "OTP and token required." });
  }

  try {
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "OTP expired." });
      }
      return res.status(401).json({ message: "Invalid token." });
    }

    if (String(otp) !== String(decoded.otp)) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const existingUser = await User.findOne({
      $or: [{ email: decoded.email }, { studentId: decoded.studentId }]
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const user = await User.create({
      studentId: decoded.studentId,
      email: decoded.email,
      name: decoded.name,
      password: decoded.password,
      phoneNumber: decoded.phoneNumber,
      isEmailVerified: true
    });

    const loginToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      token: loginToken
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// resend OTP
export const resendOTP = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    const { studentId, email, name, password, phoneNumber } = decoded;

    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const sent = await sendOTP(name, email, newOtp);
    if (!sent.success) {
      return res.status(500).json({ message: "Failed to resend OTP." });
    }

    const newToken = jwt.sign(
      { studentId, email, name, password, phoneNumber, otp: newOtp },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      message: "New OTP sent.",
      token: newToken
    });

  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If email exists, OTP sent."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const sent = await sendPasswordResetEmail(user.name, email, otp);
    if (!sent.success) {
      return res.status(500).json({ message: "Failed to send reset OTP." });
    }

    const resetToken = jwt.sign(
      { id: user._id, otp },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      message: "OTP sent.",
      token: resetToken
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  const { token, otp, newPassword } = req.body;

  if (!token || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password reset successful."
    });

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// logout
export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Logout successful."
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};