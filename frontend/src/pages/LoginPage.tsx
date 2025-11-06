import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Alert, Space, message } from 'antd';
import styles from '../utils/LoginPage.module.css';
// Import icon MailOutlined thay cho UserOutlined
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      setLoading(false);
      return;
    }
    
    try {
      // Gọi API thật
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),
      });

      if (response.ok) {
        // Đăng nhập thành công
        const data = await response.json();
        message.success('Đăng nhập thành công!');
        
        // Lưu token vào localStorage để dùng cho các API khác
        localStorage.setItem('token', data.token); 
        localStorage.setItem('username', data.user);
        
        navigate('/manager'); // Chuyển hướng đến trang admin
      } else {
        // Đăng nhập thất bại
        const errData = await response.json();
        setError(errData.message || 'Email hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      // Xử lý lỗi mạng (ví dụ: server Go bị sập)
      console.error('Login failed:', err);
      setError('Lỗi: Không thể kết nối đến máy chủ.');
    } finally {
      // Luôn tắt loading sau khi hoàn tất
      setLoading(false);
    }
  };

  // Hàm xử lý khi nhấn Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        
        <a href="/" className={styles.logo}>link-short </a>
        <h2 className={styles.title}>Đăng nhập</h2>
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* === THAY ĐỔI 3: Cập nhật Input cho 'email' === */}
        <Input
          className={styles.input}
          placeholder="Email" // Đổi placeholder
          value={email} // Đổi value
          onChange={e => setEmail(e.target.value)} // Đổi onChange
          disabled={loading}
          size="large"
          prefix={<MailOutlined className={styles.icon} />} // Đổi Icon
          onKeyPress={handleKeyPress}
        />
        
        {/* Input mật khẩu giữ nguyên */}
        <Input.Password
          className={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          size="large"
          prefix={<LockOutlined className={styles.icon} />}
          onKeyPress={handleKeyPress}
        />

        <div className={styles.extraLinks}>
          <a href="/forgot-password" className={styles.link}>
            Quên mật khẩu?
          </a>
        </div>

        <Button
          type="primary"
          className={styles.loginButton}
          onClick={handleLogin}
          loading={loading}
          block
          size="large"
        >
          Đăng nhập
        </Button>

        <div className={styles.signupLink}>
          <span style={{ color: '#a0aec0' }}>Chưa có tài khoản? </span>
          <Button 
            type="link" 
            className={styles.linkButton} 
            onClick={() => navigate('/register')}
          >
            Đăng ký ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;