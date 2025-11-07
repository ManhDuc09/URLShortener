import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Alert, message } from 'antd';
import styles from '../utils/LoginPage.module.css'; // Dùng chung file CSS với Login
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const RegisterPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);

    // --- Client-side Validation ---
    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng ký thật
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        }),
      });

      if (response.ok) {
        // Đăng ký thành công (status 201 Created)
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login'); // Chuyển hướng về trang đăng nhập
      } else {
        // Xử lý lỗi từ server (ví dụ: 400, 500)
        const errData = await response.json();
        setError(errData.message || 'Lỗi: Không thể đăng ký tài khoản.');
      }

    } catch (err) {
      // Xử lý lỗi mạng (server Go sập)
      console.error('Registration failed:', err);
      setError('Lỗi: Không thể kết nối đến máy chủ.');
    } finally {
      // Luôn tắt loading
      setLoading(false);
    }
  };

  // Hỗ trợ nhấn Enter để đăng ký
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleRegister();
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>

        <a href="/" className={styles.logo}>link-short</a>

        <h2 className={styles.title}>Tạo tài khoản</h2>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '1rem' }} // Thêm khoảng cách
          />
        )}

        {/* Trường Họ và Tên */}
        <Input
          className={styles.input}
          placeholder="Họ và tên"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
          size="large"
          prefix={<UserOutlined className={styles.icon} />}
          onKeyPress={handleKeyPress}
        />

        {/* Trường Email */}
        <Input
          className={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          size="large"
          prefix={<MailOutlined className={styles.icon} />}
          onKeyPress={handleKeyPress}
        />

        {/* Trường Mật khẩu */}
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

        {/* Trường Xác nhận Mật khẩu */}
        <Input.Password
          className={styles.input}
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          disabled={loading}
          size="large"
          prefix={<LockOutlined className={styles.icon} />}
          onKeyPress={handleKeyPress}
        />

        <Button
          type="primary"
          className={styles.loginButton}
          onClick={handleRegister}
          loading={loading}
          block
          size="large"
          style={{ marginTop: '1rem' }} // Thêm khoảng cách
        >
          Đăng ký
        </Button>

        {/* Link quay về Đăng nhập */}
        <div className={styles.signupLink}>
          <span style={{ color: '#a0aec0' }}>Đã có tài khoản? </span>
          {/* Dùng navigate thay vì <a href> */}
          <Button
            type="link"
            className={styles.linkButton} // Dùng class mới cho đẹp hơn
            onClick={() => navigate('/login')}
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;