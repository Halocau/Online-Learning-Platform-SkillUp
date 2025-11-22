import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const BannerEditModal = ({ visible, onCancel, onUpdate, editingBanner }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && editingBanner) {
            form.setFieldsValue({
                id: editingBanner.id,
                title: editingBanner.title,
                description: editingBanner.description,
                hyperlink: editingBanner.hyperlink,
                isActive: editingBanner.isActive,
                file: [
                    {
                        uid: '-1', // Unique ID for internal React keys
                        name: 'current-image.png',
                        status: 'done',
                        url: editingBanner.image, // <--- The existing URL
                    },
                ],
            });
        }
    }, [visible, editingBanner, form]);

    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            const formData = new FormData();

            // Append text fields
            formData.append('id', values.id);
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('hyperlink', values.hyperlink);
            formData.append('isActive', values.isActive);

            const fileObj = values.file && values.file[0];

            if (fileObj && fileObj.originFileObj) {
                formData.append('file', fileObj.originFileObj);
            } else {
                formData.append('existingImageUrl', editingBanner.image);
            }

            await onUpdate(formData);
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <Modal
            open={visible}
            centered
            destroyOnHidden={true}
            title="Chỉnh sửa banner"
            okText="Save Changes"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={handleOk}
            width={800}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" name="banner_edit_form">

                <Form.Item name="id" label="Banner ID">
                    <Input disabled />
                </Form.Item>

                {/* Title */}
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Please enter a title!' }]}
                >
                    <Input.TextArea
                        maxLength={255}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                    />
                </Form.Item>

                {/* Description */}
                <Form.Item
                    name="description"
                    label="Mô tả ngắn"
                    rules={[{ required: true, message: 'Please enter a title!' }]}
                >
                    <Input.TextArea
                        maxLength={255}
                        autoSize={{ minRows: 3 }}
                    />
                </Form.Item>

                {/* Hyperlink */}
                <Form.Item name="hyperlink" label="Hyperlink">
                    <Input />
                </Form.Item>

                {/* Is Active Switch */}
                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" hidden={true}>
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>

                <Form.Item
                    name="file"
                    label="Hình ảnh"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    extra="Tải lên ảnh mới sẽ thay thế ảnh hiện tại."
                >
                    <Upload
                        name="image"
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/*"
                        showUploadList={{
                            showRemoveIcon: false,
                        }}
                        onPreview={(file) => {
                            window.open(file.url || file.thumbUrl, '_blank');
                        }}
                    >
                        <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>
                                Ảnh khác
                            </div>
                        </div>
                    </Upload>
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default BannerEditModal;