import express from 'express';
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword
} from '../controllers/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register and send OTP
router.post('/register', registerUser);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP to complete registration
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
router.post('/resend-otp', resendOTP);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', loginUser);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', resetPassword);

export default router;
