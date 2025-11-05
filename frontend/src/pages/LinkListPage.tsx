import React from 'react';
import { Table, Typography } from 'antd';

const { Title } = Typography;

interface Link {
  id: number;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
}

interface LinkListPageProps {
  links: Link[];
}

const LinkListPage: React.FC<LinkListPageProps> = ({ links }) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Original URL',
      dataIndex: 'originalUrl',
      key: 'originalUrl',
    },
    {
      title: 'ShortCode',
      dataIndex: 'shortCode',
      key: 'shortCode',
      render: (text: string) => (
        <a href={`http://localhost:8080/${text}`} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'ClickCount',
      dataIndex: 'clickCount',
      key: 'clickCount',
    },
  ];

  return (
    <div className="linklist-container">
      <Title level={3} style={{ marginTop: '2rem' }}>Quản Lý Link</Title>
      <Table dataSource={links} columns={columns} rowKey="id" />
    </div>
  );
};

export default LinkListPage;
