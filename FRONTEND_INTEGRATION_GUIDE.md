Tích hợp API xác thực email cho Frontend

## Tổng quan API

Tôi đã tạo 3 API endpoints cho chức năng xác thực email:

### 1. Gửi mã xác thực đến email
- **Endpoint**: `POST /api/verification/send-code`
- **Payload**: `{ "email": "user@example.com" }`
- **Response**: Mã xác thực 6 chữ số được gửi đến email

### 2. Xác thực mã được nhập
- **Endpoint**: `POST /api/verification/verify-code`
- **Payload**: `{ "email": "user@example.com", "code": "123456" }`
- **Response**: Xác nhận mã đúng/sai

### 3. Gửi mã đặt lại mật khẩu
- **Endpoint**: `POST /api/verification/send-password-reset`
- **Payload**: `{ "email": "user@example.com" }`
- **Response**: Mã đặt lại mật khẩu được gửi đến email

## Yêu cầu Frontend Implementation

Hãy tạo các component và chức năng sau cho Frontend:

### 1. Component gửi mã xác thực

```typescript
// SendVerificationCode.tsx
interface SendCodeProps {
  onCodeSent: (email: string) => void;
}

const SendVerificationCode = ({ onCodeSent }: SendCodeProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      setMessage('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verification/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Mã xác thực đã được gửi đến email của bạn');
        onCodeSent(email);
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Nhập email của bạn"
        disabled={loading}
      />
      <button onClick={handleSendCode} disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};
```

### 2. Component xác thực mã

```typescript
// VerifyCode.tsx
interface VerifyCodeProps {
  email: string;
  onVerified: () => void;
  onResendCode: () => void;
}

const VerifyCode = ({ email, onVerified, onResendCode }: VerifyCodeProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setMessage('Vui lòng nhập mã 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Xác thực thành công!');
        onVerified();
      } else {
        setMessage(data.message || 'Mã xác thực không đúng');
        setAttempts(prev => prev + 1);
      }
    } catch (error) {
      setMessage('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/verification/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Mã mới đã được gửi');
        setAttempts(0);
      } else {
        setMessage(data.message || 'Không thể gửi mã mới');
      }
    } catch (error) {
      setMessage('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Mã xác thực đã được gửi đến: {email}</p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Nhập mã 6 chữ số"
        maxLength={6}
        disabled={loading}
      />
      <button onClick={handleVerifyCode} disabled={loading || attempts >= 3}>
        {loading ? 'Đang xác thực...' : 'Xác thực'}
      </button>
      <button onClick={handleResendCode} disabled={loading}>
        Gửi lại mã
      </button>
      {message && <p>{message}</p>}
      {attempts >= 3 && (
        <p style={{color: 'red'}}>
          Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới.
        </p>
      )}
    </div>
  );
};
```

### 3. Component đặt lại mật khẩu

```typescript
// PasswordReset.tsx
const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendResetCode = async () => {
    if (!email) {
      setMessage('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verification/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Mã đặt lại mật khẩu đã được gửi');
        setStep('code');
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    if (!code || code.length !== 6) {
      setMessage('Vui lòng nhập mã 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Mã xác thực đúng');
        setStep('password');
      } else {
        setMessage(data.message || 'Mã xác thực không đúng');
      }
    } catch (error) {
      setMessage('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      // Gọi API đặt lại mật khẩu (cần tạo thêm API này)
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code, 
          newPassword 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Đặt lại mật khẩu thành công');
        setStep('email');
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'email' && (
        <div>
          <h3>Đặt lại mật khẩu</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            disabled={loading}
          />
          <button onClick={handleSendResetCode} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi mã đặt lại'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div>
          <h3>Nhập mã xác thực</h3>
          <p>Mã đã được gửi đến: {email}</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Nhập mã 6 chữ số"
            maxLength={6}
            disabled={loading}
          />
          <button onClick={handleVerifyResetCode} disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>
          <button onClick={() => setStep('email')}>
            Quay lại
          </button>
        </div>
      )}

      {step === 'password' && (
        <div>
          <h3>Nhập mật khẩu mới</h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới"
            disabled={loading}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            disabled={loading}
          />
          <button onClick={handleResetPassword} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
          <button onClick={() => setStep('code')}>
            Quay lại
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};
```

### 4. Hook tùy chỉnh cho API calls

```typescript
// hooks/useVerification.ts
import { useState } from 'react';

export const useVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verification/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Mã xác thực không đúng');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verification/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendCode,
    verifyCode,
    sendPasswordReset,
  };
};
```

## Các tính năng cần lưu ý

1. **Rate Limiting**: API có giới hạn số lần gọi, cần hiển thị thông báo phù hợp
2. **Mã hết hạn**: Mã xác thực có hiệu lực 5 phút
3. **Giới hạn số lần thử**: Tối đa 3 lần thử cho mỗi mã
4. **Validation**: Kiểm tra định dạng email và độ dài mã
5. **Loading states**: Hiển thị trạng thái loading khi gọi API
6. **Error handling**: Xử lý và hiển thị lỗi một cách thân thiện

## Cấu hình môi trường

Đảm bảo Frontend có cấu hình đúng base URL cho API:

```typescript
// config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## Testing

Sử dụng các API endpoints này để test:

1. **Test gửi mã**: `POST /api/verification/send-code`
2. **Test xác thực**: `POST /api/verification/verify-code`
3. **Test đặt lại mật khẩu**: `POST /api/verification/send-password-reset`

Tất cả API đều trả về response theo format:
```json
{
  "success": boolean,
  "message": string,
  "data": object
}
```
