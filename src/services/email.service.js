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
        from: `Vietnamese-German University (VGU) <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your verification code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 24px; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://res.cloudinary.com/drqbhj6ft/image/upload/v1766389229/vgu-logo2_lx0wfw.webp" alt="VGU" style="max-width: 180px; height: auto;">
            </div>
            <h2 style="color: #d35400; margin: 0 0 12px 0;">Hello ${name},</h2>
            <p style="color: #333; margin: 0 0 12px 0; line-height: 1.5;">
              You requested a verification code to register your account. Your code is:
            </p>
            <div style="background-color: #fff6ed; border: 1px solid #ccc; padding: 18px; text-align: center; margin: 16px 0;">
              <h1 style="color: #e67e22; font-size: 32px; margin: 0; letter-spacing: 6px;">${code}</h1>
            </div>
            <p style="color: #333; margin: 0 0 8px 0; line-height: 1.5;">
              This code is valid for 5 minutes. Do not share it with anyone.
            </p>
            <p style="color: #333; margin: 0 0 8px 0; line-height: 1.5;">
              If you did not request this code, you can safely ignore this email.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
            <div style="font-size: 12px; color: #666; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 6px 0;">
                This email was sent automatically from Vietnamese-German University (VGU). Please do not reply.
              </p>
              <p style="margin: 0 0 4px 0;">
                Vietnamese-German University (VGU)
              </p>
              <p style="margin: 0 0 4px 0;">
                Le Lai Street, Hoa Phu Ward, Thu Dau Mot City, Binh Duong Province, Vietnam
              </p>
              <p style="margin: 0;">
                Website: <a href="https://vgu.edu.vn" style="color: #d35400; text-decoration: none;">https://vgu.edu.vn</a> ·
                Email: <a href="mailto:info@vgu.edu.vn" style="color: #d35400; text-decoration: none;">info@vgu.edu.vn</a>
              </p>
            </div>
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
        from: `Vietnamese-German University (VGU) <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your password reset code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 24px; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://res.cloudinary.com/drqbhj6ft/image/upload/v1766389229/vgu-logo2_lx0wfw.webp" alt="VGU" style="max-width: 180px; height: auto;">
            </div>
            <h2 style="color: #d35400; margin: 0 0 12px 0;">Hello ${name},</h2>
            <p style="color: #333; margin: 0 0 12px 0; line-height: 1.5;">
              You requested to reset your password. Your verification code is:
            </p>
            <div style="background-color: #fff6ed; border: 1px solid #ccc; padding: 18px; text-align: center; margin: 16px 0;">
              <h1 style="color: #e67e22; font-size: 32px; margin: 0; letter-spacing: 6px;">${code}</h1>
            </div>
            <p style="color: #333; margin: 0 0 8px 0; line-height: 1.5;">
              This code is valid for 5 minutes. Do not share it with anyone.
            </p>
            <p style="color: #333; margin: 0 0 8px 0; line-height: 1.5;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
            <div style="font-size: 12px; color: #666; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 6px 0;">
                This email was sent automatically from Vietnamese-German University (VGU). Please do not reply.
              </p>
              <p style="margin: 0 0 4px 0;">
                Vietnamese-German University (VGU)
              </p>
              <p style="margin: 0 0 4px 0;">
                Le Lai Street, Hoa Phu Ward, Thu Dau Mot City, Binh Duong Province, Vietnam
              </p>
              <p style="margin: 0;">
                Website: <a href="https://vgu.edu.vn" style="color: #d35400; text-decoration: none;">https://vgu.edu.vn</a> ·
                Email: <a href="mailto:info@vgu.edu.vn" style="color: #d35400; text-decoration: none;">info@vgu.edu.vn</a>
              </p>
            </div>
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
