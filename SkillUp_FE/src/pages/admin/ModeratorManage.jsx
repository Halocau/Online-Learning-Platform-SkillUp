import React, { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Space,
  Button,
  Input,
  Avatar,
  Modal,
  Form,
  Select,
  message,
  Card,
  Typography,
  Dropdown,
  Popconfirm,
  Badge,
  Switch
} from 'antd';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  UserCog,
  Shield,
  ShieldAlert,
  Mail,
  KeyRound,
  Filter
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { API_BASE_URL } from '@/config/api';
import { record } from 'zod';
import { toast } from 'react-toastify';

const { Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

const ModeratorManage = () => {
  const [initialData, setInitialData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchModerators = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_BASE_URL}/User/all-mod`);

      setInitialData(response.data.data[0]);
      setDataSource(response.data.data[0]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching moderators:', error);
    }
  };

  useEffect(() => {
    fetchModerators();
  }, []);

  // --- Actions ---

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    if (!value) {
      setDataSource(initialData);
      return;
    }

    const filtered = initialData.filter(entry =>
      entry.fullname.toLowerCase().includes(value) ||
      entry.email.toLowerCase().includes(value) ||
      entry.roleName.toLowerCase().includes(value)
    );
    setDataSource(filtered);
  };

  const handleToggleStatus = async (item) => {
    try {
      item.status = item.status === 'Active' ? 'InActive' : 'Active';
      const response = await axiosInstance.put(`${API_BASE_URL}/User/update-status`, {
        id: item.id,
        status: item.status
      });

      if (response.data.code === 200) {
        const newData = dataSource.map(record =>
          record.id === item.id ? { ...record, status: item.status } : record
        );
        setDataSource(newData);
      }
    } catch (error) {
      toast.error('Error toggling status:', error);
    }
  };

  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'Active', roleName: 'Content Morderator' });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const roleIdMap = {
        'System Morderator': 2,
        'Content Morderator': 3
      };

      const payload = {
        email: values.email,
        password: values.password,
        confirmPassword: values.password,
        fullname: values.fullname,
        roleId: roleIdMap[values.roleName] || 0
      };

      console.log("Sending payload:", payload);

      if (editingRecord) {

        message.success('Moderator updated successfully');
      } else {
        await axiosInstance.post(`${API_BASE_URL}/Auth/register-mod`, payload);
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchModerators();

    } catch (error) {
      if (error.errorFields) {
        console.log('Validation Failed:', error);
      } else {
        console.error('API Error:', error);
        message.error(error.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Table Configuration ---

  // Refactored to return Tailwind classes instead of Ant Design color props
  const getRoleStyle = (role) => {
    if (role.toLowerCase().includes('system')) {
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    }
    if (role.toLowerCase().includes('content')) {
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (text, record, index) => <span className="text-gray-500">{index + 1}</span>,
    },
    {
      title: 'Quản trị viên',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 380,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar}
            icon={!record.avatar && <UserCog size={20} />}
            className="bg-indigo-100 text-indigo-600"
            size="large"
          />
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{text}</Text>
            <Text type="secondary" className="text-xs">{record.id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={14} />
          {email}
        </div>
      )
    },
    {
      title: 'Chức vụ',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 250,
      filters: [
        { text: 'System Moderator', value: 'System' },
        { text: 'Content Moderator', value: 'Content' },
      ],
      onFilter: (value, record) => record.roleName.includes(value),
      render: (role) => {
        const icon = role.includes('System') ? <ShieldAlert size={14} /> : <Shield size={14} />;
        return (
          // Replaced Ant Design Tag with a Tailwind styled div for better layout control
          <div
            className={`flex items-center w-max gap-2 px-3 py-1 rounded-full ${getRoleStyle(role)}`}
          >
            {icon}
            <span className="whitespace-nowrap text-sm font-medium">{role}</span>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status) => (
        <Badge
          status={status === 'Active' ? 'success' : 'error'}
          text={<span className={status === 'Active' ? 'text-green-600 font-medium' : 'text-red-500'}>{status == "Active" ? "Hoạt động" : "Ngừng hoạt động"}</span>}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'left',
      render: (_, record) => (
        <Space size="middle" className="pr-8">
          <Button
            hidden
            type="text"
            icon={<Edit size={16} className="text-blue-600" />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title={record.status === 'Active' ? "Deactivate Moderator" : "Activate Moderator"}
            description={`Are you sure you want to ${record.status === 'Active' ? 'deactivate' : 'activate'} this moderator?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: record.status === 'Active' }}
          >
            <Switch
              size="small"
              checked={record.status === 'Active'}
              className={record.status === 'Active' ? "bg-green-500" : "bg-gray-300"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="bg-white">
      <Content className="p-6 w-full">
        <div className="mb-4 flex justify-end">
          <Button
            type="primary"
            icon={<Plus size={18} />}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={() => showModal()}
          >
            Thêm quản trị viên mới
          </Button>
        </div>

        {/* Filters and Table Card */}
        <Card
          className="shadow-none border border-gray-200"
          styles={{ body: { padding: '0' } }}
        >
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
            <Input
              placeholder="Tìm theo tên, email hoặc chức vụ..."
              prefix={<Search size={16} className="text-gray-400" />}
              onChange={handleSearch}
              className="max-w-md"
              allowClear
            />
            <div className="flex gap-2">
              <Button icon={<Filter size={16} />}>Bộ lọc</Button>
            </div>
          </div>

          <Table
            loading={loading}
            rowKey={(r) => r.id}
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Content>

      {/* Add/Edit Modal */}
      <Modal
        loading={loading}
        title={editingRecord ? "Edit Moderator" : "Add New Moderator"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Save Changes" : "Add Moderator"}
        okButtonProps={{ className: "bg-indigo-600" }}
      >
        <Form
          form={form}
          layout="vertical"
          name="moderatorForm"
          initialValues={{ status: 'Active' }}
        >
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input prefix={<UserCog size={16} className="text-gray-400" />} placeholder="e.g. John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<Mail size={16} className="text-gray-400" />}
              placeholder="e.g. mod@example.com"
              disabled={editingRecord ? true : false} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            hidden={editingRecord ? true : false}
            rules={[
              { required: true, message: 'Please input the password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<KeyRound size={16} className="text-gray-400" />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="roleName"
              label="Role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select placeholder="Select a role">
                <Option value="Content Morderator">Content Moderator</Option>
                <Option value="System Morderator">System Moderator</Option>
              </Select>
            </Form.Item>

            <Form.Item
              hidden={editingRecord ? false : true}
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Active">
                  <Badge status="success" text="Active" />
                </Option>
                <Option value="Inactive">
                  <Badge status="error" text="Inactive" />
                </Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ModeratorManage;