import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  message, 
  Input, 
  Select,
  Card,
  Tooltip,
  Popconfirm,
  Image,
  Typography,
  Divider
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import { modPostAPI } from '@/api/modPostAPI';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const ForumManage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch forum posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await modPostAPI.getAllPosts();
      if (response.data.code === 200) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // View post detail
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setDetailVisible(true);
  };

  // Approve post
  const handleApprove = async (postId) => {
    try {
      const response = await modPostAPI.unbanPost(postId);
      if (response.data.code === 200) {
        message.success('Đã kích hoạt bài viết');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error activating post:', error);
      message.error('Không thể kích hoạt bài viết');
    }
  };

  // Reject post
  const handleReject = async (postId) => {
    try {
      const response = await modPostAPI.banPost(postId);
      if (response.data.code === 200) {
        message.success('Đã vô hiệu hóa bài viết');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error banning post:', error);
      message.error('Không thể vô hiệu hóa bài viết');
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchSearch = post.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                       post.contents?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || post.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchCategory = categoryFilter === 'all' || post.categoryName === categoryFilter;
    
    return matchSearch && matchStatus && matchCategory;
  });

  // Table columns
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: '15%',
      render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>,
      sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''),
    },
    {
      title: 'Tác giả',
      dataIndex: 'accountName',
      key: 'accountName',
      width: '15%',
      sorter: (a, b) => a.accountName.localeCompare(b.accountName),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status) => {
        const isActive = status?.toLowerCase() === 'active';
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
          </Tag>
        );
      },
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Vô hiệu hóa', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '16%',
      render: (_, record) => {
        const isActive = record.status?.toLowerCase() === 'active';
        
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button 
                type="primary" 
                icon={<EyeOutlined />} 
                size="small"
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            
            {isActive ? (
              <Tooltip title="Vô hiệu hóa">
                <Popconfirm
                  title="Vô hiệu hóa bài viết này?"
                  description="Bài viết sẽ không hiển thị cho người dùng"
                  onConfirm={() => handleReject(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button 
                    danger
                    icon={<CloseCircleOutlined />} 
                    size="small"
                  />
                </Popconfirm>
              </Tooltip>
            ) : (
              <Tooltip title="Kích hoạt">
                <Popconfirm
                  title="Kích hoạt bài viết này?"
                  onConfirm={() => handleApprove(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />} 
                    size="small"
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <h2 style={{ marginBottom: '24px' }}>Quản lý Forum</h2>
        
        {/* Filters */}
        <Space style={{ marginBottom: '16px' }} wrap>
          <Search
            placeholder="Tìm kiếm bài viết..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Select
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Trạng thái"
          >
            <Option value="all">Tất cả</Option>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Vô hiệu hóa</Option>
          </Select>
          
          <Select
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Danh mục"
          >
            <Option value="all">Tất cả danh mục</Option>
            {Array.from(new Set(posts.map(p => p.categoryName))).filter(Boolean).map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          
          <Button onClick={fetchPosts}>Làm mới</Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} bài viết`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Chi tiết bài viết</Title>}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedPost && (
          <div style={{ padding: '8px 0' }}>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <Text type="secondary" strong>Tiêu đề</Text>
              <Title level={5} style={{ marginTop: '8px', marginBottom: 0 }}>
                {selectedPost.title}
              </Title>
            </div>
            
            <Divider style={{ margin: '16px 0' }} />
            
            {/* Category & Author & Status */}
            <Space size="large" wrap style={{ marginBottom: '20px', width: '100%' }}>
              <div>
                <Text type="secondary" strong>Danh mục</Text>
                <div style={{ marginTop: '8px' }}>
                  <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {selectedPost.categoryName}
                  </Tag>
                </div>
              </div>
              
              <div>
                <Text type="secondary" strong>Tác giả</Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong>{selectedPost.accountName}</Text>
                </div>
              </div>
              
              <div>
                <Text type="secondary" strong>Trạng thái</Text>
                <div style={{ marginTop: '8px' }}>
                  <Tag 
                    color={selectedPost.status?.toLowerCase() === 'active' ? 'green' : 'red'}
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    {selectedPost.status?.toLowerCase() === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </Tag>
                </div>
              </div>
            </Space>
            
            <Divider style={{ margin: '16px 0' }} />
            
            {/* Images with preview */}
            {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <Text type="secondary" strong>Hình ảnh ({selectedPost.imageUrls.length})</Text>
                  <div style={{ marginTop: '12px' }}>
                    <Image.PreviewGroup>
                      <Space size="middle" wrap>
                        {selectedPost.imageUrls.map((url, index) => (
                          <Image 
                            key={index} 
                            src={url} 
                            alt={`Post ${index + 1}`}
                            width={150}
                            height={150}
                            style={{ 
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </div>
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
              </>
            )}
            
            {/* Content */}
            <div style={{ marginBottom: '20px' }}>
              <Text type="secondary" strong>Nội dung</Text>
              <Paragraph
                style={{ 
                  marginTop: '12px', 
                  padding: '16px', 
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  maxHeight: '400px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.8'
                }}
              >
                {selectedPost.contents}
              </Paragraph>
            </div>
            
            <Divider style={{ margin: '16px 0' }} />
            
            {/* Dates */}
            <Space size="large" wrap>
              <div>
                <Text type="secondary" strong>Ngày tạo</Text>
                <div style={{ marginTop: '8px' }}>
                  <Text>{new Date(selectedPost.createdAt).toLocaleString('vi-VN')}</Text>
                </div>
              </div>
              
              {selectedPost.updatedAt && (
                <div>
                  <Text type="secondary" strong>Ngày cập nhật</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text>{new Date(selectedPost.updatedAt).toLocaleString('vi-VN')}</Text>
                  </div>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ForumManage;
