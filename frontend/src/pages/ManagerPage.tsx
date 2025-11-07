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
import type { MenuProps, TableProps } from 'antd';
import {
  UserOutlined,
  LinkOutlined,
  LogoutOutlined,
  PlusOutlined,
  // EditOutlined, // (Xóa EditOutlined)
  DeleteOutlined,
  CopyOutlined, // (Thêm CopyOutlined)
} from '@ant-design/icons';
import styles from '../utils/ManagerPage.module.css';
import { Link } from 'react-router-dom';

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
      localStorage.removeItem('username');
      window.location.href = '/login';
    },
  },
];

// Menu Sider (giữ nguyên)
const siderMenuItems: MenuProps['items'] = [
  {
    key: 'links',
    icon: <LinkOutlined />,
    label: 'Quản lý link',
  },
];

// (Interface giữ nguyên)
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

const ManagerPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL;
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
  const [username, setUsername] = useState<string>('');

  // === THAY ĐỔI: Thêm state cho link mới ===
  const [newlyCreatedLink, setNewlyCreatedLink] = useState<string | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  // (Hàm fetchLinks giữ nguyên)
  const fetchLinks = async (page = 1, limit = 10) => {
    // ... (Giữ nguyên code fetchLinks) ...
    setTableLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      messageApi.error('Bạn chưa đăng nhập! Đang chuyển hướng...');
      setTableLoading(false);
      window.location.href = '/login';
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/links?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        const formattedData: LinkDataType[] = result.data.map((item: ApiLinkData) => ({
          key: item.ID.toString(), id: item.ID, original_url: item.OriginalURL,
          short_code: item.ShortCode, clicks: item.Clicks, created_at: '',
        }));
        setDataSource(formattedData);
        setPagination({
          current: result.page, pageSize: result.limit, total: formattedData.length,
        });
      } else {
        if (response.status === 401) {
          messageApi.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          messageApi.error('Không thể tải dữ liệu link.');
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      messageApi.error('Lỗi kết nối máy chủ.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('username') || '';
    setUsername(stored);
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchLinks(newPagination.current, newPagination.pageSize);
  };

  // (Hàm handleDelete giữ nguyên)
  const handleDelete = async (shortCode: string) => {
    // ... (Giữ nguyên code handleDelete) ...
    const token = localStorage.getItem('token');
    if (!token) {
      messageApi.error('Vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return;
    }
    setTableLoading(true);
    try {
      const response = await fetch(`${API_BASE}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: shortCode })
      });
      if (response.ok) {
        const successMessage = await response.text();
        messageApi.success(successMessage || 'Đã xóa link thành công');
        await fetchLinks(pagination.current, pagination.pageSize);
      } else {
        setTableLoading(false);
        if (response.status === 401) {
          messageApi.error('Phiên đăng nhập hết hạn.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (response.status === 403) {
          messageApi.error('Bạn không có quyền xóa link này.');
        } else if (response.status === 404) {
          messageApi.error('Không tìm thấy link này.');
        } else {
          messageApi.error('Xóa link thất bại.');
        }
      }
    } catch (error) {
      setTableLoading(false);
      console.error('Delete error:', error);
      messageApi.error('Lỗi kết nối máy chủ.');
    }
  };


  // === THAY ĐỔI: Xóa nút "Sửa" ===
  const columns: TableProps<LinkDataType>['columns'] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
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
      width: 100, // Giảm chiều rộng
      render: (_, record) => (
        <Space size="middle">
          {/* Nút "Sửa" đã bị xóa */}
          <Popconfirm
            title="Bạn có chắc muốn xóa link này?"
            onConfirm={() => handleDelete(record.short_code)}
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

  // === THAY ĐỔI: Hàm mở Modal (bỏ record) ===
  const showModal = () => {
    form.resetFields(); // Luôn reset form
    setNewlyCreatedLink(null); // Đảm bảo modal hiển thị form
    setIsModalVisible(true);
  };

  // === THAY ĐỔI: Hàm OK (gọi API shorten) ===
  const handleOk = () => {
    setModalLoading(true);
    form.validateFields()
      .then(async (values) => {
        // Lấy token
        const token = localStorage.getItem('token');
        if (!token) {
          messageApi.error('Vui lòng đăng nhập lại.');
          window.location.href = '/login';
          return;
        }

        try {
          // Gọi API /shorten (bản bảo mật)
          const response = await fetch(`${API_BASE}/shorten`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              URL: values.original_url // Gửi key "URL" như bạn yêu cầu
            })
          });

          if (response.ok) {
            const data = await response.json();
            const newLink = `${API_BASE}/${data.short_code}`;

            // Hiển thị kết quả trong Modal
            setNewlyCreatedLink(newLink);
            messageApi.success('Tạo link thành công!');

            // Tải lại bảng ở background
            fetchLinks(pagination.current, pagination.pageSize);
          } else {
            const errData = await response.json();
            messageApi.error(errData.message || 'Tạo link thất bại');
          }
        } catch (error) {
          messageApi.error('Lỗi kết nối máy chủ');
        } finally {
          setModalLoading(false);
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        setModalLoading(false);
      });
  };

  // === THAY ĐỔI: Hàm Cancel (reset state) ===
  const handleCancel = () => {
    setIsModalVisible(false);
    // Chờ animation đóng xong mới reset
    setTimeout(() => {
      setNewlyCreatedLink(null);
    }, 300);
  };

  // === THAY ĐỔI: Hàm copy trong Modal ===
  const handleModalCopy = () => {
    if (newlyCreatedLink) {
      navigator.clipboard.writeText(newlyCreatedLink);
      messageApi.success('Đã sao chép!');
    }
  };


  return (
    <Layout className={styles.adminLayout}>
      {contextHolder} {/* Thêm contextHolder để message hoạt động */}
      <Sider
        className={styles.sider}
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
      >
        <Link to="/" className={styles.logo}>
          HOME</Link>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['links']}
          items={siderMenuItems}
        />
      </Sider>

      <Layout className={styles.innerLayout}>
        <Header className={styles.header}>
          <Dropdown menu={{ items: avatarMenuItems }} trigger={['click']}>
            <Space className={styles.headerRight} size="middle">
              <Avatar icon={<UserOutlined />} />
              <Text className={styles.username}>{username || 'Admin'}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content className={styles.content}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>Quản lý Link</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal} // Sửa: gọi không cần tham số
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

      {/* === THAY ĐỔI: Cập nhật Modal === */}
      <Modal
        title="Thêm Link Mới" // Chỉ 1 title
        open={isModalVisible}
        onCancel={handleCancel} // Chỉ giữ lại onCancel
        destroyOnHidden

        // Tùy chỉnh footer (nút bấm)
        footer={
          !newlyCreatedLink ?
            // Footer khi đang điền form
            [
              <Button key="back" onClick={handleCancel}>
                Hủy
              </Button>,
              <Button key="submit" type="primary" loading={modalLoading} onClick={handleOk}>
                Rút gọn
              </Button>,
            ] :
            // Footer khi đã có kết quả
            [
              <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleModalCopy}>
                Sao chép
              </Button>,
              <Button key="close" onClick={handleCancel}>
                Đóng
              </Button>,
            ]
        }
      >
        {/* Dùng ternary để hiển thị Form hoặc Kết quả */}
        {!newlyCreatedLink ? (
          // 1. Hiển thị Form
          <Form form={form} layout="vertical" name="link_form" style={{ marginTop: 24 }}>
            <Form.Item
              name="original_url"
              label="Link Gốc"
              rules={[{ required: true, message: 'Vui lòng nhập link gốc!' }]}
            >
              <Input placeholder="https://example.com/..." />
            </Form.Item>
            {/* Trường ShortCode đã bị xóa */}
          </Form>
        ) : (
          // 2. Hiển thị Kết quả
          <div style={{ marginTop: 24 }}>
            <Text>Link của bạn đã sẵn sàng:</Text>
            <Input
              value={newlyCreatedLink}
              readOnly
              style={{ marginTop: 8 }}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ManagerPage;