import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Alert, Space, message } from 'antd';
import styles from '../utils/LoginPage.module.css';
// Import thêm icon
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      setLoading(false);
      return;
    }
    
    // Giả lập gọi API
    setTimeout(() => {
      if (username === 'admin' && password === '123456') {
        message.success('Đăng nhập thành công!');
        navigate('/admin');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
      setLoading(false);
    }, 1000);
  };

  // Thêm: Hàm xử lý khi nhấn Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        
        {/* Thêm: Logo (link về trang chủ) */}
        <a href="/" className={styles.logo}>link-short </a>

        <h2 className={styles.title}>Đăng nhập</h2>
        
        {/* Thêm: Thông báo lỗi (đã di chuyển lên trên) */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)} // Cho phép tắt lỗi
          />
        )}

        <Input
          className={styles.input}
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          size="large" // Thêm: Kích thước lớn hơn
          prefix={<UserOutlined className={styles.icon} />} // Thêm: Icon
          onKeyPress={handleKeyPress} // Thêm: Hỗ trợ Enter
        />
        <Input.Password
          className={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          size="large" // Thêm: Kích thước lớn hơn
          prefix={<LockOutlined className={styles.icon} />} // Thêm: Icon
          onKeyPress={handleKeyPress} // Thêm: Hỗ trợ Enter
        />

        {/* Thêm: Link quên mật khẩu */}
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
          size="large" // Thêm: Kích thước lớn hơn
        >
          Đăng nhập
        </Button>

        {/* Thêm: Link đăng ký */}
        <div className={styles.signupLink}>
          <span style={{ color: '#a0aec0' }}>Chưa có tài khoản? </span>
          <a href="/signup" className={styles.link}>
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;