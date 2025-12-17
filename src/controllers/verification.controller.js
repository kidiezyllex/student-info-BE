import VerificationCode from '../models/verificationCode.model.js';
import { sendVerificationCode, sendPasswordResetCode } from '../services/email.service.js';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendCode = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    await VerificationCode.deleteMany({ email });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      name: 'User',
      expiresAt
    });

    await verificationCode.save();

    const emailStartTime = Date.now();
    const emailSent = await sendVerificationCode(email, 'User', code);
    const emailDuration = Date.now() - emailStartTime;
    

    if (!emailSent) {
      await VerificationCode.deleteOne({ _id: verificationCode._id });
      console.error(`Failed to send email for: ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Unable to send verification code. Please try again.'
      });
    }

    const totalDuration = Date.now() - startTime;
    console.log(`Verification code process completed in ${totalDuration}ms for email: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Verification code has been sent to your email',
      data: {
        email,
        expiresAt
      }
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`Send code error after ${totalDuration}ms:`, {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({
      success: false,
      message: 'System error when sending verification code'
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const verificationRecord = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code
    });

    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    if (new Date() > verificationRecord.expiresAt) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }

    if (verificationRecord.attempts >= 3) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded. Please request a new code'
      });
    }

    // Mark this code as verified (allow backend to check for passwordless login)
    verificationRecord.verified = true;
    await verificationRecord.save();

    res.status(200).json({
      success: true,
      message: 'Verification successful',
      data: {
        email: verificationRecord.email,
        verified: true
      }
    });

  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'System error when verifying code'
    });
  }
};

export const sendPasswordReset = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    console.log(`Starting password reset process for email: ${email}`);

    await VerificationCode.deleteMany({ email });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      name: 'User',
      expiresAt
    });

    await verificationCode.save();
    console.log(`Password reset code saved to database for email: ${email}`);

    const emailStartTime = Date.now();
    const emailSent = await sendPasswordResetCode(email, 'User', code);
    const emailDuration = Date.now() - emailStartTime;
    
    console.log(`Password reset email sending took ${emailDuration}ms for email: ${email}`);

    if (!emailSent) {
      await VerificationCode.deleteOne({ _id: verificationCode._id });
      console.error(`Failed to send password reset email for: ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Unable to send password reset code. Please try again.'
      });
    }

    const totalDuration = Date.now() - startTime;
    console.log(`Password reset process completed in ${totalDuration}ms for email: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email',
      data: {
        email,
        expiresAt
      }
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`Send password reset error after ${totalDuration}ms:`, {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({
      success: false,
      message: 'System error when sending password reset code'
    });
  }
};
