import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Input, Button, Form, Typography, Space, Tag, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';

const { TextArea } = Input;
const { Text } = Typography;

const STATUS_MAP = new Map([
    ['accepted', { vi: 'Đã chấp nhận', color: 'green' }],
    ['rejected', { vi: 'Từ chối', color: 'red' }],
    ['pending', { vi: 'Đang chờ', color: 'gold' }],
]);

const norm = (s) => String(s ?? '').trim().toLowerCase();
const getStatusMeta = (s) => STATUS_MAP.get(norm(s)) ?? { vi: s ?? '', color: 'default' };

export default function UpdateTicketModal({ isOpen, onClose, ticket, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

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
            toast.error('Không tìm thấy mã phiếu.');
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
                toast.success('Cập nhật phiếu thành công!');
                onClose?.();
                onSuccess?.();
            } else {
                toast.error(res?.data?.message || 'Cập nhật không thành công.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Đã xảy ra lỗi khi cập nhật phiếu.');
        } finally {
            setSubmitting(false);
        }
    }, [ticket, onClose, onSuccess]);

    const handleSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields();
            await doRequest(values);
        } catch (err) {
            if (!err?.errorFields) {
                console.error(err);
                toast.error('Đã xảy ra lỗi khi cập nhật phiếu.');
            }
        }
    }, [form, doRequest]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.isComposing) return;
            const isHotkey = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
            if (!isHotkey || submitting) return;
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
            <span>Tiêu đề</span>
            <Tooltip title="Tiêu đề ngắn gọn, phản ánh đúng nội dung cập nhật.">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    const ContentsLabel = (
        <Space size={6}>
            <span>Nội dung</span>
            <Tooltip title="Mô tả chi tiết thay đổi; có thể xuống dòng thoải mái.">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    const statusMeta = getStatusMeta(ticket?.status);

    return (
        <Modal
            title={
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-semibold">Cập nhật phiếu</span>
                        {ticket?.ticketCode && (
                            <span className="text-xs text-gray-500">Mã: #{ticket.ticketCode}</span>
                        )}
                    </div>
                    {ticket?.status && (
                        <Tag color={statusMeta.color} className={statusMeta.color === 'default' ? '' : 'border border-yellow-300'}>
                            {statusMeta.vi}
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
                    <Input placeholder="Nhập tiêu đề" maxLength={200} showCount allowClear disabled={submitting} />
                </Form.Item>

                <Form.Item
                    label={ContentsLabel}
                    name="contents"
                    rules={[
                        { required: true, message: 'Vui lòng nhập nội dung' },
                        { min: 10, message: 'Nội dung nên ≥ 10 ký tự' },
                        { max: 4000, message: 'Tối đa 4000 ký tự' },
                    ]}
                    extra={<Text type="secondary">Bạn có thể xuống dòng; nội dung sẽ được giữ định dạng khi hiển thị.</Text>}
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
