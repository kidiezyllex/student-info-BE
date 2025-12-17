import nodemailer from 'nodemailer';

const createTransporter = () => {
  const hasSmtpCreds = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;

  if (!hasSmtpCreds) {
    throw new Error('SMTP credentials (EMAIL_USER / EMAIL_PASS) are not configured');
  }

  // Try different SMTP configurations based on environment
  if (process.env.NODE_ENV === 'production') {
    // Use Gmail with different port and settings for production
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 3000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false
      },
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      rateLimit: 3,
      retryDelay: 500,
      retryAttempts: 1
    });
  } else {
    // Local development configuration
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 15000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false
      },
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      rateLimit: 5,
      retryDelay: 1000,
      retryAttempts: 2
    });
  }
};

export const sendVerificationCode = async (email, name, code) => {
  const hasSmtpCreds = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;

  // In development, if no email provider is configured, don't block the flow
  if (process.env.NODE_ENV !== 'production' && !hasSmtpCreds) {
    console.warn('No email provider configured (SMTP).');
    console.warn(`Verification code for ${email}: ${code}`);
    return true;
  }

  // Fallback to SMTP
  const maxRetries = 1;
  const totalTimeout = 20000;
  
  const sendWithTimeout = async () => {
    return Promise.race([
      sendEmailAttempt(email, name, code, maxRetries),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), totalTimeout)
      )
    ]);
  };

  try {
    return await sendWithTimeout();
  } catch (error) {
    return true; // Return true to allow the process to continue
  }
};

const sendEmailAttempt = async (email, name, code, maxRetries) => {
  let transporter;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      transporter = createTransporter();
      if (process.env.NODE_ENV === 'production') {
      } else {
        const verifyPromise = transporter.verify();
        const verifyTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SMTP verification timeout')), 5000)
        );
        
        await Promise.race([verifyPromise, verifyTimeout]);
      }
      
      const mailOptions = {
        from: `Trường Đại học Việt Đức (VGU) <${process.env.EMAIL_USER}>`,
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

      const sendPromise = transporter.sendMail(mailOptions);
      const sendTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP send timeout')), 20000)
      );
      
      await Promise.race([sendPromise, sendTimeout]);
      
      if (transporter) {
        transporter.close();
      }
      return true;
      
    } catch (error) {
      retryCount++;
      console.error(`Email send attempt ${retryCount}/${maxRetries} failed:`, error.message);
      
      if (transporter) {
        try {
          transporter.close();
        } catch (closeError) {
          console.error('Error closing transporter:', closeError.message);
        }
      }
      
      if (retryCount < maxRetries) {
        const delay = 2000 * retryCount;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};

export const sendPasswordResetCode = async (email, name, code) => {
  const hasSmtpCreds = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;

  // In development, if no email provider is configured, don't block the flow
  if (process.env.NODE_ENV !== 'production' && !hasSmtpCreds) {
    console.warn('No email provider configured (SMTP).');
    console.warn(`Password reset code for ${email}: ${code}`);
    return true;
  }

  // Use SMTP
  const maxRetries = 1;
  const totalTimeout = 20000;
  
  const sendWithTimeout = async () => {
    return Promise.race([
      sendPasswordResetAttempt(email, name, code, maxRetries),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), totalTimeout)
      )
    ]);
  };

  try {
    return await sendWithTimeout();
  } catch (error) {
    return true; // Return true to allow the process to continue
  }
};

const sendPasswordResetAttempt = async (email, name, code, maxRetries) => {
  let transporter;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      transporter = createTransporter();
      // Skip verification in production to avoid timeout issues
      if (process.env.NODE_ENV === 'production') {
      } else {
        const verifyPromise = transporter.verify();
        const verifyTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SMTP verification timeout')), 5000)
        );
        
        await Promise.race([verifyPromise, verifyTimeout]);
      }
      
      const mailOptions = {
        from: `Trường Đại học Việt Đức (VGU) <${process.env.EMAIL_USER}>`,
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

      const sendPromise = transporter.sendMail(mailOptions);
      const sendTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP send timeout')), 20000)
      );
      
      await Promise.race([sendPromise, sendTimeout]);
      
      if (transporter) {
        transporter.close();
      }
      return true;
      
    } catch (error) {
      retryCount++;
      console.error(`Password reset email attempt ${retryCount}/${maxRetries} failed:`, error.message);
      
      if (transporter) {
        try {
          transporter.close();
        } catch (closeError) {
          console.error('Error closing transporter:', closeError.message);
        }
      }
      
      if (retryCount < maxRetries) {
        const delay = 2000 * retryCount;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};
