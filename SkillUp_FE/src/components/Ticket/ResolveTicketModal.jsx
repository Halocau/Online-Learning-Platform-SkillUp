// src/components/Ticket/ResolveTicketModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Typography,
    Tag,
    Space,
    Radio,
    Input,
    Button,
    Spin,
    Divider,
    Row,
    Col,
    Tooltip,
    Card,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

const statusColor = (s) => {
    switch (s) {
        case 'Pending': return 'gold';
        case 'Accepted': return 'green';
        case 'Rejected': return 'red';
        default: return 'default';
    }
};

// Map hiển thị tiếng Việt (không ảnh hưởng đến giá trị gốc gửi/nhận từ BE)
const statusLabelMap = {
    Pending: 'Chờ xử lý',
    Accepted: 'Đã chấp nhận',
    Rejected: 'Từ chối',
};

const getModeratorName = () => {
    try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        return u?.fullName || u?.fullname || u?.email || 'Điều phối viên';
    } catch {
        return 'Điều phối viên';
    }
};

const buildAutoAcceptMsg = () =>
    `Đã chấp nhận ticket. Duyệt bởi ${getModeratorName()} lúc ${new Date().toLocaleString('vi-VN')}.`;

const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

/**
 * Props:
 *  - open: boolean
 *  - code: string|null
 *  - onClose: () => void
 *  - onSuccess: () => void
 */
export default function ResolveTicketModal({ open, code, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [decision, setDecision] = useState('Accepted'); // Accepted | Rejected
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const DETAIL_EP = useMemo(() => (code ? `${API_ENDPOINTS.GET_TICKET}/${code}` : ''), [code]);
    const RESOLVE_EP = API_ENDPOINTS.RESOLVE_TICKET; // PUT /Ticket/resolve-ticket

    useEffect(() => {
        if (!open || !code) return;
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                setTicket(null);
                const res = await axiosInstance.get(DETAIL_EP);
                const data = res?.data?.data;
                const item = Array.isArray(data) ? data[0] : data;
                if (!item) {
                    toast.error('Không tìm thấy ticket.');
                    onClose?.();
                    return;
                }
                if (mounted) setTicket(item);
            } catch (e) {
                console.error('Ticket detail error:', e);
                toast.error('Không thể tải chi tiết ticket');
                onClose?.();
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // reset khi mở
        setDecision('Accepted');
        setResponse(buildAutoAcceptMsg());
        load();

        return () => { mounted = false; };
    }, [open, code, DETAIL_EP, onClose]);

    const handleSave = async () => {
        if (!ticket?.ticketCode) return;

        const isRejected = decision === 'Rejected';
        if (isRejected && !response.trim()) {
            toast.error('Vui lòng nhập lý do khi từ chối.');
            return;
        }

        try {
            setSubmitting(true);
            // gửi JSON đúng spec { code, decision, response }
            const payload = {
                code: ticket.ticketCode,
                decision: decision === 'Accepted',          // true = Accepted, false = Rejected
                response: isRejected ? response.trim() : (response || ''),
            };

            const res = await axiosInstance.put(RESOLVE_EP, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (res?.data?.code === 200) {
                toast.success('Giải quyết ticket thành công!');
                onClose?.();
                onSuccess?.(); // refresh list
            } else {
                toast.error(res?.data?.message || 'Không thể giải quyết ticket.');
            }
        } catch (err) {
            console.error('Resolve ticket error:', err);
            const msg = err?.response?.data?.message || err?.message || 'Có lỗi khi giải quyết ticket.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={<span className="font-semibold">Xem & xử lý phiếu hỗ trợ</span>}
            open={open}
            onCancel={() => !submitting && onClose?.()}
            destroyOnClose
            maskClosable={!submitting}
            closable={!submitting}
            width={920}
            footer={
                <Space>
                    <Button onClick={onClose} disabled={submitting}>Đóng</Button>
                    <Button type="primary" onClick={handleSave} loading={submitting}>Lưu</Button>
                </Space>
            }
        >
            {loading ? (
                <div className="py-10 text-center"><Spin /></div>
            ) : ticket ? (
                <div className="space-y-14">
                    {/* Header meta */}
                    <div>
                        <Title level={5} style={{ marginBottom: 6 }}>{ticket.title}</Title>
                        <Row gutter={[12, 12]} align="middle">
                            <Col>
                                <Space size={6}>
                                    <Text type="secondary">Mã:</Text>
                                    <Tooltip title="Nhấn để sao chép">
                                        <Text code copyable={{ text: ticket.ticketCode }} className="select-all">
                                            #{ticket.ticketCode}
                                        </Text>
                                    </Tooltip>
                                </Space>
                            </Col>
                            <Col>
                                <Text type="secondary">
                                    Người gửi: <Text strong>{ticket.accountName || '—'}</Text>
                                </Text>
                            </Col>
                            <Col>
                                <Text type="secondary">Tạo lúc: {formatDateTime(ticket.createdAt)}</Text>
                            </Col>
                            <Col>
                                <Tag color={statusColor(ticket.status)}>
                                    {statusLabelMap[ticket.status] || 'Không rõ'}
                                </Tag>
                            </Col>
                        </Row>
                    </div>

                    {/* Nội dung & phản hồi hiện tại */}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Card
                                size="small"
                                title={<span className="font-medium">Nội dung</span>}
                                bodyStyle={{ paddingTop: 12 }}
                            >
                                <Paragraph
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        marginBottom: 0,
                                        background: '#fafafa',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: 8,
                                        padding: 12,
                                    }}
                                >
                                    {ticket.contents || '—'}
                                </Paragraph>
                            </Card>
                        </Col>

                        {ticket.response && (
                            <Col span={24}>
                                <Card
                                    size="small"
                                    title={<span className="font-medium">Phản hồi hiện tại</span>}
                                    bodyStyle={{ paddingTop: 12 }}
                                >
                                    <Paragraph
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            marginBottom: 0,
                                            background: '#fafafa',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: 8,
                                            padding: 12,
                                        }}
                                    >
                                        {ticket.response}
                                    </Paragraph>
                                </Card>
                            </Col>
                        )}
                    </Row>

                    {/* Quyết định */}
                    <div>
                        <Divider orientation="left" plain>
                            <Text strong>Quyết định</Text>
                        </Divider>

                        <Radio.Group
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                            buttonStyle="solid"
                        >
                            {/* Giữ value gốc để gửi/so sánh; chỉ đổi nhãn hiển thị */}
                            <Radio.Button value="Accepted">Chấp nhận</Radio.Button>
                            <Radio.Button value="Rejected">Từ chối</Radio.Button>
                        </Radio.Group>

                        {decision === 'Rejected' && (
                            <div style={{ marginTop: 12 }}>
                                <div className="mb-1 text-sm text-gray-600">
                                    Lý do từ chối <span style={{ color: 'red' }}>*</span>
                                </div>
                                <TextArea
                                    placeholder="Nhập lý do từ chối..."
                                    autoSize={{ minRows: 5, maxRows: 10 }}
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    maxLength={2000}
                                    showCount
                                    disabled={submitting}
                                    style={{
                                        background: '#fff',
                                        borderColor: '#ffccc7',
                                        boxShadow: '0 0 0 2px rgba(255,77,79,.1)',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="py-6">Không có dữ liệu.</div>
            )}
        </Modal>
    );
}
