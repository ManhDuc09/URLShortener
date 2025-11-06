import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Dropdown, 
  Space, 
  Typography, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input,
  Tag,
  Popconfirm,
  message
} from 'antd';
// Sửa lỗi 1: Cần import 'MenuItemType'
import type { MenuProps, TableProps } from 'antd'; 
import {
  UserOutlined,
  LinkOutlined,
  LogoutOutlined,
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import styles from '../utils/AdminPage.module.css'; 

const { Header, Sider, Content } = Layout;
const { Text } = Typography; 

// Menu cho Dropdown Avatar (giữ nguyên)
const avatarMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Đăng xuất',
    danger: true,
    onClick: () => { 
      console.log('Đăng xuất...'); 
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    },
  },
];

// === SỬA LỖI 1: ĐỊNH NGHĨA MENU CHO SIDER BẰNG 'items' ===
const siderMenuItems: MenuProps['items'] = [
  {
    key: 'links',
    icon: <LinkOutlined />,
    label: 'Quản lý link',
  },
];
// === KẾT THÚC SỬA LỖI 1 ===


// (Các interface ApiLinkData và LinkDataType giữ nguyên)
interface ApiLinkData {
  ID: number;
  OriginalURL: string;
  ShortCode: string;
  UserID: number;
  Clicks: number;
}
interface LinkDataType {
  key: string;
  id: number;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<LinkDataType[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // (Hàm fetchLinks giữ nguyên)
  const fetchLinks = async (page = 1, limit = 10) => {
    setTableLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      message.error('Bạn chưa đăng nhập! Đang chuyển hướng...');
      setTableLoading(false);
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/links?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const formattedData: LinkDataType[] = result.data.map((item: ApiLinkData) => ({
          key: item.ID.toString(),
          id: item.ID,
          original_url: item.OriginalURL,
          short_code: item.ShortCode,
          clicks: item.Clicks,
          created_at: '', 
        }));
        
        setDataSource(formattedData);
        setPagination({
          current: result.page,
          pageSize: result.limit,
          total: formattedData.length, 
        });

      } else {
        if (response.status === 401) {
            message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            message.error('Không thể tải dữ liệu link.');
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Lỗi kết nối máy chủ.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []); 

  const handleTableChange = (newPagination: any) => {
    fetchLinks(newPagination.current, newPagination.pageSize);
  };
  
  const handleDelete = (key: string) => {
    console.log('Xóa link có key:', key);
    message.success('Đã xóa link thành công');
    // fetchLinks(pagination.current, pagination.pageSize);
  };
  
  // (Định nghĩa columns giữ nguyên)
  const columns: TableProps<LinkDataType>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Link Gốc',
      dataIndex: 'original_url',
      key: 'original_url',
      ellipsis: true, 
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
    },
    {
      title: 'Link Rút Gọn',
      dataIndex: 'short_code',
      key: 'short_code',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Lượt click',
      dataIndex: 'clicks',
      key: 'clicks',
      width: 120,
      sorter: (a, b) => a.clicks - b.clicks,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa link này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  // (Các hàm Modal giữ nguyên)
  const showModal = (record?: LinkDataType) => {
    if (record) {
      form.setFieldsValue(record); 
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setModalLoading(true);
    form.validateFields()
      .then(values => {
        console.log('Dữ liệu form:', values);
        setTimeout(() => { 
          setIsModalVisible(false);
          setModalLoading(false);
          message.success('Cập nhật thành công!');
          // fetchLinks(pagination.current, pagination.pageSize);
        }, 1000);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        setModalLoading(false);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout className={styles.adminLayout}>
      <Sider 
        className={styles.sider} 
        breakpoint="lg" 
        collapsedWidth="0"
        width={250}
      >
        <div className={styles.logo}>BYCOMVN</div>
        
        {/* === SỬA LỖI 1: DÙNG PROP 'items' === */}
        <Menu 
          theme="light" 
          mode="inline" 
          defaultSelectedKeys={['links']}
          items={siderMenuItems} // <-- Sửa ở đây
        />
        {/* === KẾT THÚC SỬA LỖI 1 === */}
          
      </Sider>

      <Layout className={styles.innerLayout}>
        <Header className={styles.header}>
          <Dropdown menu={{ items: avatarMenuItems }} trigger={['click']}>
            <Space className={styles.headerRight} size="middle">
                <Avatar icon={<UserOutlined />} />
                <Text className={styles.username}>Admin</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content className={styles.content}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Quản lý Link</h1>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
              size="large"
            >
              Thêm Link Mới
            </Button>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={dataSource}       
            loading={tableLoading}        
            pagination={pagination}       
            onChange={handleTableChange}  
            scroll={{ x: 'max-content' }} 
          />
        </Content>
      </Layout>

      <Modal
        title={form.getFieldValue('id') ? 'Sửa Link' : 'Thêm Link Mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={modalLoading} 
        
        // giúp Antd không báo lỗi "not connected"
        destroyOnClose 
      >
        <Form form={form} layout="vertical" name="link_form" style={{ marginTop: 24 }}>
          <Form.Item
            name="original_url"
            label="Link Gốc"
            rules={[{ required: true, message: 'Vui lòng nhập link gốc!' }]}
          >
            <Input placeholder="https://example.com/..." />
          </Form.Item>
          <Form.Item
            name="short_code"
            label="Code Rút Gọn (Tùy chọn)"
            help="Bỏ trống để hệ thống tự động tạo."
          >
            <Input placeholder="ví dụ: my-link" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;