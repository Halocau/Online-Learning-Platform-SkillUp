import React, { useState } from 'react';
import { Modal, Form, Input, Switch, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const BannerCreateModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // --- PREPARE FORM DATA ---
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || ''); // Optional: send empty string if null
      formData.append('hyperlink', values.hyperlink || '');     // Optional
      formData.append('isActive', values.isActive);             // true/false

      // Handle File (Mandatory for Create)
      if (values.file && values.file[0] && values.file[0].originFileObj) {
        formData.append('file', values.file[0].originFileObj);
      }

      // Send to Parent and Await response
      await onCreate(formData);

      // Cleanup only on success
      form.resetFields();

    } catch (error) {
      console.log('Validation or API Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize Upload event
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <Modal
      open={visible}
      title="Tạo banner mới"
      okText="Lưu"
      cancelText="Huỷ"
      onCancel={() => {
        form.resetFields(); // Clear form when canceling
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      centered
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        name="banner_create_form"
        initialValues={{ isActive: true }}
      >

        {/* Title */}
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Please enter a title!' }]}
        >
          <Input.TextArea
            maxLength={255}
            autoSize={{ minRows: 1, maxRows: 3 }}
            placeholder="Nhập tiêu đề..."
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Mô tả ngắn"
          rules={[{ required: true, message: 'Please enter a title!' }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn..." />
        </Form.Item>

        {/* Hyperlink */}
        <Form.Item
          name="hyperlink"
          label="Hyperlink"
          rules={[{ type: 'url', warningOnly: true, message: 'This field usually takes a valid URL' }]}
        >
          <Input placeholder="www.example.com" />
        </Form.Item>

        {/* Is Active Switch */}
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>

        {/* FILE UPLOAD (Required for Create) */}
        <Form.Item
          name="file"
          label="Hình ảnh"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Please upload an image!' }]} // <--- Required here
        >
          <Upload
            name="image"
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false} // Prevent auto-upload
            accept="image/*"
            showUploadList={{ showRemoveIcon: true }} // Allow removing selection before submit
            onPreview={(file) => {
              window.open(file.url || file.thumbUrl, '_blank');
            }}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Ảnh</div>
            </div>
          </Upload>
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default BannerCreateModal;