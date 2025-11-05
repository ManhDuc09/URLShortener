import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Layout, 
  Space, 
  Typography, 
  Alert, 
  message, 
  Spin
} from 'antd';

import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Import CSS Module
import styles from '../utils/HomePage.module.css'; 

const { Text } = Typography;


const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleShorten = async () => {
    if (!url) {
      setError('Vui lòng nhập một URL để rút gọn.');
      return;
    }

    setLoading(true);
    setError(null);
    setShortenedUrl(null);

    try {
      const customShortCode = Math.random().toString(36).substring(2, 9);

      const response = await fetch('http://localhost:8080/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          original_url: url, 
          short_code: customShortCode
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShortenedUrl(`http://localhost:8080/${data.short_code}`);
        setUrl(''); 
      } else {
        const errData = await response.json();
        setError(errData.message || 'Lỗi: Không thể rút gọn link.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Lỗi: Không thể kết nối đến máy chủ. Hãy đảm bảo API đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      message.success('Đã sao chép vào clipboard!');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        {/* === THÊM MỘT DIV BỌC BÊN TRONG === */}
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>Nhom 13</a>
          <nav>
            <ul className={styles.navMenu}>
              <li className={styles.navItem}><a href="#">Bảng giá</a></li>
              <li className={styles.navItem}><a href="#">Blog</a></li>
              <li className={styles.navItem}><a href="#">Giải pháp ⌄</a></li>
              <li className={styles.navItem}><a href="#">Liên hệ</a></li>
            </ul>
          </nav>
          <Space className={styles.authButtons}>
            <Button type="link" style={{ color: '#cbd5e0' }} onClick={() => navigate('/login')}>Đăng nhập</Button>
            <Button type="primary" style={{ backgroundColor: '#63b3ed', borderColor: '#63b3ed' }}>Bắt đầu</Button>
          </Space>
        </div>
        {/* === KẾT THÚC DIV BỌC === */}
      </header>

      {/* Main Content Section */}
      <main className={styles.mainContent}>
        {/* ... (Phần main content giữ nguyên) ... */}
        <div className={styles.leftSection}>
          <span className={styles.badge}>Rút gọn link miễn phí</span>
          <h1 className={styles.title}>Rút gọn link miễn phí</h1>
          <p className={styles.description}>
            Tạo link ngắn và truy cập với độ trễ thấp. Dữ liệu được lưu giữ vĩnh viễn.
          </p>
          {/* ... (Phần shortenBox, termsText, error, result giữ nguyên) ... */}
          <div className={styles.shortenBox}>
            <LinkOutlined style={{ color: '#718096', fontSize: '1.2rem', marginLeft: '0.5rem' }} />
            <input
              type="text"
              className={styles.shortenInput}
              placeholder="Dán liên kết dài của bạn"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleShorten();
              }}
              disabled={loading}
            />
            <button 
              className={styles.shortenButton} 
              onClick={handleShorten} 
              disabled={loading}
            >
              {loading ? <Spin size="small" /> : 'Rút gọn link'}
            </button>
          </div>

          <p className={styles.termsText}>
            Khi bấm RÚT GỌN LINK, nghĩa là bạn đã đồng ý với <a href="#">Điều khoản sử dụng</a>.
          </p>

          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className={styles.errorAlert}
            />
          )}
          {shortenedUrl && (
            <div className={styles.shortenedResult}>
              <Text className={styles.shortenedResultText} onClick={handleCopy}>
                {shortenedUrl}
              </Text>
              <Button 
                icon={<CopyOutlined />} 
                onClick={handleCopy} 
                className={styles.copyButton}
              >
                Copy
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;