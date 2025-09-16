import VerificationCode from '../models/verificationCode.model.js';
import { sendVerificationCode, sendPasswordResetCode } from '../services/email.service.js';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ'
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

    const emailSent = await sendVerificationCode(email, 'User', code);

    if (!emailSent) {
      await VerificationCode.deleteOne({ _id: verificationCode._id });
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi mã xác thực. Vui lòng thử lại.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mã xác thực đã được gửi đến email của bạn',
      data: {
        email,
        expiresAt
      }
    });

  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi gửi mã xác thực'
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email và mã xác thực là bắt buộc'
      });
    }

    const verificationRecord = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code
    });

    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không đúng'
      });
    }

    if (new Date() > verificationRecord.expiresAt) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực đã hết hạn'
      });
    }

    if (verificationRecord.attempts >= 3) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới'
      });
    }

    await VerificationCode.deleteOne({ _id: verificationRecord._id });

    res.status(200).json({
      success: true,
      message: 'Xác thực thành công',
      data: {
        email: verificationRecord.email,
        verified: true
      }
    });

  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xác thực mã'
    });
  }
};

export const sendPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ'
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

    const emailSent = await sendPasswordResetCode(email, 'User', code);

    if (!emailSent) {
      await VerificationCode.deleteOne({ _id: verificationCode._id });
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi mã đặt lại mật khẩu. Vui lòng thử lại.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mã đặt lại mật khẩu đã được gửi đến email của bạn',
      data: {
        email,
        expiresAt
      }
    });

  } catch (error) {
    console.error('Send password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi gửi mã đặt lại mật khẩu'
    });
  }
};
