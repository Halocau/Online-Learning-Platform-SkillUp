import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Image, Switch, Typography, Card, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-toastify';
import BannerEditModal from '@/components/Banner/BannerEditModal';
import BannerCreateModal from '@/components/Banner/BannerCreateModal';

const { Title } = Typography;

const BannerManage = () => {
  const [data, setData] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);

  const fetchBanners = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:5120/api/Banner/all-banners');
      setData(response.data.data.flat());
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Helper: Handle Status Toggle (Mock)
  const handleToggleActive = async (id, checked) => {
    try {
      const newData = data.map(item =>
        item.id === id ? { ...item, isActive: checked } : item
      );
      const response = await axiosInstance.put('http://localhost:5120/api/Banner/toggle-banner',
        null,
        {
          params: {
            isActive: checked,
            bannerId: id
          }
        })
      setData(newData);
      message.info(`Banner status updated to ${checked ? 'Active' : 'Inactive'}`);
      toast.success('Banner status updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating banner status');
    }
  };

  const handleUpdateBanner = async (updatedBanner) => {
    try {
      const response = await axiosInstance.put('http://localhost:5120/api/Banner/update-banner', updatedBanner, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Banner updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating banner');
    } finally {
      setEditOpen(false);
      fetchBanners();
    }
  };

  const handleCreateBanner = async (formData) => {
    try {
      const response = await axiosInstance.post('http://localhost:5120/api/Banner/create-banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Banner created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating banner');
    } finally {
      setCreateOpen(false);
      fetchBanners();
    }
  };

  // --- Table Configuration ---
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (src) => (
        <Image
          width={100}
          height={60}
          src={src}
          style={{ objectFit: 'cover', borderRadius: '6px' }}
          alt="Banner Preview"
        />
      ),
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space
            direction="vertical"
            size={0}
            style={{ width: '100%', maxWidth: 250 }} // 1. Restrict width to force truncation
          >
            <Typography.Text
              strong
              ellipsis={{ tooltip: record.title }} // 2. Auto-tooltip on hover
            >
              {record.title}
            </Typography.Text>

            <Typography.Text
              type="secondary"
              style={{ fontSize: '12px' }}
              ellipsis={{ tooltip: record.description }} // 3. Auto-tooltip on hover
            >
              {record.description}
            </Typography.Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Tag icon={<LinkOutlined />} color="blue">
              <Typography.Text
                style={{
                  maxWidth: '150px',
                  color: 'inherit',
                  margin: 0
                }}
                ellipsis={{ tooltip: record.hyperlink }}
              >
                {record.hyperlink}
              </Typography.Text>
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'], // Hide on small screens
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary"
            ghost icon={<EditOutlined />}
            size="small"
            onClick={() => { setEditingItem(record); setEditOpen(true) }}>
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Card style={{ borderRadius: '8px' }}>

          {/* Header Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>Banner Management</Title>
              <Typography.Text type="secondary">Manage your homepage banners and promotions</Typography.Text>
            </div>
            <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => setCreateOpen(true)}
            >
              Thêm mới
            </Button>
          </div>

          {/* Table Section */}
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered
          />
        </Card>
      </div>

      <BannerEditModal
        visible={editOpen}
        editingBanner={editingItem}
        onCancel={() => setEditOpen(false)}
        onUpdate={handleUpdateBanner}
      />

      <BannerCreateModal
        visible={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreate={handleCreateBanner}
      />
    </>
  );
};

export default BannerManage;