import sgMail from '@sendgrid/mail';

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationCode = async (email, name, code) => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
        name: 'Trường Đại học Việt Đức (VGU)'
      },
      subject: 'Mã xác thực đăng ký tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Trường Đại học Việt Đức (VGU)</h1>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">Vietnamese-German University</p>
          </div>
          <h2 style="color: #333;">Xin chào ${name}!</h2>
          <p>Bạn đã yêu cầu mã xác thực để đăng ký tài khoản. Mã xác thực của bạn là:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Email này được gửi tự động từ Trường Đại học Việt Đức (VGU), vui lòng không trả lời.</p>
        </div>
      `
    };

    await sgMail.send(msg);
    return true;

  } catch (error) {
    console.error('SendGrid verification email failed:', {
      error: error.message,
      code: error.code,
      response: error.response?.body
    });
    return false;
  }
};

export const sendPasswordResetCode = async (email, name, code) => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
        name: 'Trường Đại học Việt Đức (VGU)'
      },
      subject: 'Mã xác thực đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Trường Đại học Việt Đức (VGU)</h1>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">Vietnamese-German University</p>
          </div>
          <h2 style="color: #333;">Xin chào ${name}!</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác thực của bạn là:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Email này được gửi tự động từ Trường Đại học Việt Đức (VGU), vui lòng không trả lời.</p>
        </div>
      `
    };

    await sgMail.send(msg);
    return true;

  } catch (error) {
    console.error('SendGrid password reset email failed:', {
      error: error.message,
      code: error.code,
      response: error.response?.body
    });
    return false;
  }
};
