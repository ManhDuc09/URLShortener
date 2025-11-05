import React, { useState } from 'react';
import { Typography, Input, Button } from 'antd';

const { Title, Text } = Typography;

interface HomePageProps {
  onShorten: (originalUrl: string) => void;
  shortenedUrl: string;
}

const HomePage: React.FC<HomePageProps> = ({ onShorten, shortenedUrl }) => {
  const [originalUrl, setOriginalUrl] = useState('');

  const handleShorten = () => {
    onShorten(originalUrl);
  };

  return (
    <div className="homepage-container">
      <Title level={2}>Rút Gọn Link</Title>
      <Input
        placeholder="Nhập URL gốc"
        value={originalUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOriginalUrl(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />
      <Button type="primary" onClick={handleShorten} style={{ marginBottom: '1rem' }}>
        Rút gọn
      </Button>
      {shortenedUrl && (
        <div>
          <Text>Link rút gọn:</Text>
          <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
            {shortenedUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default HomePage;
