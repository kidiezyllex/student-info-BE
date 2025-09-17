import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 60000, // 60秒连接超时
    greetingTimeout: 30000,   // 30秒问候超时
    socketTimeout: 60000,     // 60秒socket超时
    // 启用TLS
    tls: {
      rejectUnauthorized: false
    },
    // 连接池配置
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10, // 每秒最多10封邮件
    // 重试配置
    retryDelay: 1000, // 1秒后重试
    retryAttempts: 3  // 最多重试3次
  });
};

export const sendVerificationCode = async (email, name, code) => {
  let transporter;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      transporter = createTransporter();
      await transporter.verify();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
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

      const result = await transporter.sendMail(mailOptions);
      transporter.close();
      return true;
      
    } catch (error) {
      retryCount++;
      if (transporter) {
        try {
          transporter.close();
        } catch (closeError) {
          console.error('关闭transporter时出错:', closeError.message);
        }
      }
      
      // 如果不是最后一次尝试，等待后重试
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 指数退避: 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};

export const sendPasswordResetCode = async (email, name, code) => {
  let transporter;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      transporter = createTransporter();
      await transporter.verify();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
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

      const result = await transporter.sendMail(mailOptions);
      
      transporter.close();
      return true;
      
    } catch (error) {
      retryCount++;
      console.error(`发送密码重置邮件失败 (尝试 ${retryCount}/${maxRetries}):`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      if (transporter) {
        try {
          transporter.close();
        } catch (closeError) {
          console.error('关闭transporter时出错:', closeError.message);
        }
      }
      
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 指数退避: 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};
