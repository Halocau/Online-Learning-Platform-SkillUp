import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Input, Button, Form, Typography, Space, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';

const { TextArea } = Input;
const { Text } = Typography;

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // Reset form khi mở/đóng
    useEffect(() => {
        if (isOpen) {
            form.setFieldsValue({ title: '', contents: '' });
            setSubmitting(false);
        } else {
            form.resetFields();
            setSubmitting(false);
        }
    }, [isOpen, form]);


    // GIỮ NGUYÊN logic gọi API: POST -> API_ENDPOINTS.CREATE_TICKET (multipart/form-data)
    const doRequest = useCallback(
        async (values) => {
            try {
                setSubmitting(true);
                const fd = new FormData();
                fd.append('Title', values.title.trim());
                fd.append('Contents', values.contents.trim());

                const res = await axiosInstance.post(API_ENDPOINTS.CREATE_TICKET, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (res?.data?.code === 200) {
                    // (tuỳ BE, nếu trả về item mới có thể lấy ở res.data.data?.[0])
                    toast.success('Tạo ticket thành công!');
                    onClose?.();
                    onSuccess?.();
                } else {
                    toast.error(res?.data?.message || 'Không thể tạo ticket.');
                }
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Có lỗi xảy ra khi tạo ticket.';
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        },
        [onClose, onSuccess]
    );

    const handleSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields();
            await doRequest(values);
        } catch (err) {
            // nếu là lỗi validate (antd), không toast
            if (!err?.errorFields) {
                // eslint-disable-next-line no-console
                console.error(err);
                toast.error('Có lỗi xảy ra khi tạo ticket.');
            }
        }
    }, [form, doRequest]);

    // Hotkey Ctrl/Cmd + Enter
    useEffect(() => {
        if (!isOpen) return;

        const handler = (e) => {
            if (e.isComposing) return;
            const isHotkey = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
            if (!isHotkey || submitting) return;
            e.preventDefault();
            handleSubmit();
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, submitting, handleSubmit]);

    const TitleLabel = (
        <Space size={6}>
            <span>Title</span>
            <Tooltip title="Tiêu đề ngắn gọn, nêu rõ vấn đề hoặc yêu cầu.">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    const ContentsLabel = (
        <Space size={6}>
            <span>Contents</span>
            <Tooltip title="Mô tả chi tiết bối cảnh, bước tái hiện, ảnh hưởng,…">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    return (
        <Modal
            title={<span className="font-semibold">Tạo ticket</span>}
            open={isOpen}
            onCancel={() => !submitting && onClose?.()}
            destroyOnClose
            maskClosable={!submitting}
            closable={!submitting}
            centered
            width={720}
            footer={
                <div className="flex items-center justify-between w-full">
                    <Text type="secondary" className="text-xs">
                        Mẹo: nhấn <kbd>Ctrl</kbd>+<kbd>Enter</kbd> để gửi nhanh
                    </Text>
                    <Space>
                        <Button onClick={onClose} disabled={submitting} >
                            Hủy
                        </Button>
                        <Button type="primary" onClick={handleSubmit} loading={submitting} >
                            Tạo ticket
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form form={form} layout="vertical" requiredMark={false} autoComplete="off">
                <Form.Item
                    label={TitleLabel}
                    name="title"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                        { max: 200, message: 'Tối đa 200 ký tự' },
                    ]}
                    extra={<Text type="secondary">Tiêu đề ngắn gọn, ≤ 200 ký tự.</Text>}
                >
                    <Input
                        placeholder="VD: Không đăng nhập được"
                        maxLength={200}
                        showCount
                        allowClear
                        disabled={submitting}
                    />
                </Form.Item>

                <Form.Item
                    label={ContentsLabel}
                    name="contents"
                    rules={[
                        { required: true, message: 'Vui lòng nhập nội dung' },
                        { min: 10, message: 'Nội dung nên ≥ 10 ký tự' },
                        { max: 4000, message: 'Tối đa 4000 ký tự' },
                    ]}
                    extra={<Text type="secondary">Bạn có thể xuống dòng; nội dung sẽ giữ format khi hiển thị.</Text>}
                >
                    <TextArea
                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải…"
                        autoSize={{ minRows: 8, maxRows: 24 }}
                        allowClear
                        showCount
                        maxLength={4000}
                        disabled={submitting}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
