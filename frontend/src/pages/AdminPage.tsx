import React, { useState } from 'react'; // Thêm useState
import { 
  Layout, 
  Menu, 
  Avatar, 
  Dropdown, 
  Space, 
  Typography, 
  // Import các component mới
  Button, 
  Table, 
  Modal, 
  Form, 
  Input,
  Tag,
  Popconfirm,
  message
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import {
  UserOutlined,
  LinkOutlined,
  LogoutOutlined,
  PlusOutlined, // Icon cho nút "Thêm"
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import styles from '../utils/AdminPage.module.css'; // Đảm bảo đường dẫn đúng

const { Header, Sider, Content } = Layout;
const { Text } = Typography; 

// Menu cho Dropdown Avatar (giữ nguyên)
const items: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Đăng xuất',
    danger: true,
    onClick: () => { console.log('Đăng xuất...'); },
  },
];

// Định nghĩa kiểu dữ liệu cho một link
interface LinkDataType {
  key: string;
  id: number;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
}

// Dữ liệu mẫu (sau này bạn sẽ thay bằng API)
const mockData: LinkDataType[] = [
  {
    key: '1',
    id: 1,
    original_url: 'https://www.google.com/search?q=react+ant+design',
    short_code: 'gg-antd',
    clicks: 102,
    created_at: '2025-11-05',
  },
  {
    key: '2',
    id: 2,
    original_url: 'https://bycom.vn/blog/huong-dan-react',
    short_code: 'react-tut',
    clicks: 78,
    created_at: '2025-11-04',
  },
  {
    key: '3',
    id: 3,
    original_url: 'https://vtv.vn/',
    short_code: 'vtv',
    clicks: 15,
    created_at: '2025-11-03',
  },
];

const AdminPage: React.FC = () => {
  // State cho Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Hàm xử lý xóa
  const handleDelete = (key: string) => {
    // Logic gọi API xóa ở đây
    console.log('Xóa link có key:', key);
    message.success('Đã xóa link thành công');
    // Cập nhật lại data source sau khi xóa
  };
  
  // Định nghĩa các cột cho bảng
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
      ellipsis: true, // Tự động thu gọn link dài
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
      sorter: (a, b) => a.clicks - b.clicks, // Thêm chức năng sắp xếp
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
  
  // Hàm xử lý Modal
  const showModal = (record?: LinkDataType) => {
    if (record) {
      // Đây là trường hợp Sửa
      form.setFieldsValue(record); // Điền dữ liệu cũ vào form
    } else {
      // Đây là trường hợp Thêm mới
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setLoading(true);
    form.validateFields()
      .then(values => {
        // Logic gọi API thêm mới/cập nhật ở đây
        console.log('Dữ liệu form:', values);
        setTimeout(() => { // Giả lập gọi API
          setIsModalVisible(false);
          setLoading(false);
          message.success('Cập nhật thành công!');
        }, 1000);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        setLoading(false);
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
        <Menu theme="light" mode="inline" defaultSelectedKeys={['links']}>
          <Menu.Item key="links" icon={<LinkOutlined />}>
            Quản lý link
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout className={styles.innerLayout}>
        <Header className={styles.header}>
          <Dropdown menu={{ items }} trigger={['click']}>
            <Space className={styles.headerRight} size="middle">
                <Avatar icon={<UserOutlined />} />
                <Text className={styles.username}>Admin</Text>
            </Space>
          </Dropdown>
        </Header>

        {/* === PHẦN NỘI DUNG MỚI === */}
        <Content className={styles.content}>
          {/* Thanh Header của Content */}
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
          
          {/* Bảng Dữ Liệu */}
          <Table 
            columns={columns} 
            dataSource={mockData} 
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }} // Hỗ trợ cuộn ngang trên mobile
          />

        </Content>
        {/* === KẾT THÚC NỘI DUNG MỚI === */}

      </Layout>

      {/* Modal Thêm/Sửa Link */}
      <Modal
        title={form.getFieldValue('id') ? 'Sửa Link' : 'Thêm Link Mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
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