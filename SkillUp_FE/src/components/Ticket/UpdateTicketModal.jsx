import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Input, Button, Form, Typography, Space, Tag, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * UpdateTicketModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - ticket: { ticketCode, title, contents, status? }
 *  - onSuccess: () => void
 */
export default function UpdateTicketModal({ isOpen, onClose, ticket, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // preset dữ liệu vào Form khi mở modal
    useEffect(() => {
        if (isOpen) {
            form.setFieldsValue({
                title: ticket?.title || '',
                contents: ticket?.contents || '',
            });
        } else {
            form.resetFields();
            setSubmitting(false);
        }
    }, [isOpen, ticket, form]);

    const doRequest = useCallback(async (values) => {
        if (!ticket?.ticketCode) {
            toast.error('Không có mã ticket.');
            return;
        }
        try {
            setSubmitting(true);
            const fd = new FormData();
            fd.append('Code', ticket.ticketCode);
            fd.append('Title', values.title.trim());
            fd.append('Contents', values.contents.trim());

            const url = API_ENDPOINTS?.UPDATE_TICKET || '/api/Ticket/update-ticket';
            const res = await axiosInstance.put(url, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res?.data?.code === 200) {
                toast.success('Cập nhật ticket thành công!');
                onClose?.();
                onSuccess?.();
            } else {
                toast.error(res?.data?.message || 'Cập nhật thất bại.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Có lỗi khi cập nhật ticket.');
        } finally {
            setSubmitting(false);
        }
    }, [ticket, onClose, onSuccess]);

    const handleSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields();
            await doRequest(values);
        } catch (err) {
            // Nếu là lỗi validate của antd, err.errorFields tồn tại -> không toast
            if (!err?.errorFields) {
                console.error(err);
                toast.error('Có lỗi khi cập nhật ticket.');
            }
        }
    }, [form, doRequest]);

    // Hotkey Ctrl/Cmd + Enter (global khi modal mở)
    useEffect(() => {
        if (!isOpen) return;

        const handler = (e) => {
            if (e.isComposing) return; // gõ tiếng Việt/IME
            const isHotkey = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
            if (!isHotkey || submitting) return;

            // Nếu muốn chỉ khi focus nằm trong modal:
            const wrap = document.querySelector('.ant-modal-wrap');
            if (wrap && !wrap.contains(document.activeElement)) return;

            e.preventDefault();
            handleSubmit();
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, submitting, handleSubmit]);

    const TitleLabel = (
        <Space size={6}>
            <span>Title</span>
            <Tooltip title="Tiêu đề ngắn gọn, rõ nội dung cần cập nhật">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    const ContentsLabel = (
        <Space size={6}>
            <span>Contents</span>
            <Tooltip title="Mô tả chi tiết thay đổi. Bạn có thể xuống dòng thoải mái.">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    return (
        <Modal
            title={
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-semibold">Cập nhật ticket</span>
                        {ticket?.ticketCode && (
                            <span className="text-xs text-gray-500">Mã: #{ticket.ticketCode}</span>
                        )}
                    </div>
                    {ticket?.status && (
                        <Tag color="gold" className="border border-yellow-300">
                            {ticket.status}
                        </Tag>
                    )}
                </div>
            }
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
                        Mẹo: nhấn <kbd>Ctrl</kbd>+<kbd>Enter</kbd> để lưu nhanh
                    </Text>
                    <Space>
                        <Button onClick={onClose} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button type="primary" onClick={handleSubmit} loading={submitting}>
                            Lưu thay đổi
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                autoComplete="off"
            >
                <Form.Item
                    label={TitleLabel}
                    name="title"
                    rules={[
                        { required: true, message: 'Vui lòng nhập Title' },
                        { max: 200, message: 'Tối đa 200 ký tự' },
                    ]}
                    extra={<Text type="secondary">Tiêu đề ngắn gọn, ≤ 200 ký tự.</Text>}
                >
                    <Input
                        placeholder="Nhập tiêu đề"
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
                        { required: true, message: 'Vui lòng nhập Contents' },
                        { min: 10, message: 'Nội dung nên ≥ 10 ký tự' },
                        { max: 4000, message: 'Tối đa 4000 ký tự' },
                    ]}
                    extra={<Text type="secondary">Bạn có thể xuống dòng; nội dung sẽ giữ format khi hiển thị.</Text>}
                >
                    <TextArea
                        placeholder="Nhập nội dung cập nhật"
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
