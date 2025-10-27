import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

const ENDPOINTS = {
    all: API_ENDPOINTS.MANAGE_LECTURER_APPLICATIONS,
    // Nếu baseURL của axiosInstance là '/api' thì chỉ cần path bên dưới:
    updateStatus: (id) => `${API_ENDPOINTS.UPDATE_STATUS_LECTURER_APPLICATION}/${encodeURIComponent(id)}`,
    // Trường hợp bạn đã có sẵn hằng số trong API_ENDPOINTS thì thay bằng:
    // updateStatus: (id) => `${API_ENDPOINTS.UPDATE_STATUS_LECTURER_APPLICATION}/${encodeURIComponent(id)}`,
};

const PAGE_SIZE = 10;

const statusColor = (s) => {
    switch (s) {
        case 'Rejected':
            return 'red';
        case 'Pending':
            return 'gold';
        case 'Accepted':
            return 'green';
        default:
            return 'default';
    }
};

const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Helper lấy id ứng tuyển từ record (điều chỉnh theo backend của bạn)
const getAppId = (r) =>
    r?.id ??
    r?.lecturerApplicationId ??
    r?.applicationId ??
    r?.guid ??
    r?.lecturerId ??
    null;

const ModManageLectureApplication = () => {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [dataset, setDataset] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Preview (PDF/Ảnh)
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [imageUrls, setImageUrls] = useState([]);

    // Update status
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusTarget, setStatusTarget] = useState(null); // record
    const [targetAction, setTargetAction] = useState('Accepted'); // 'Accepted' | 'Rejected'
    const [reason, setReason] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(ENDPOINTS.all);
            const { code, data } = res?.data || {};
            if (code !== 200 || !data || !Array.isArray(data)) {
                toast.error('Không thể tải danh sách đơn ứng tuyển');
                setApplications([]);
                return;
            }
            setApplications(data[0] || []);
        } catch (err) {
            console.error('Fetch lecturer applications failed:', err);
            toast.error('Không thể tải danh sách đơn ứng tuyển');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [dataset, refreshKey]);

    const displayed = useMemo(() => {
        if (!search.trim()) return applications;
        const q = search.trim().toLowerCase();
        return applications.filter((app) => {
            const title = (app.title || '').toLowerCase();
            const status = (app.status || '').toLowerCase();
            return title.includes(q) || status.includes(q);
        });
    }, [applications, search]);

    const handleChange = (_pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const clearFilters = () => setFilteredInfo({});
    const clearAll = () => {
        setFilteredInfo({});
        setSortedInfo({});
        setSearch('');
    };
    const refresh = () => setRefreshKey((k) => k + 1);

    const handlePreview = (fileUrl, fileType) => {
        if (!fileUrl) return;

        if (fileType === 'cv') {
            // Xem CV trong MODAL (Cách A)
            setPreviewTitle('CV');
            setPdfUrl(fileUrl);
            setImageUrls([]);
            setPreviewVisible(true);

            // Nếu muốn mở tab mới thay vì modal:
            // window.open(fileUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        // Degree là danh sách ảnh, phân tách bằng dấu phẩy
        setPreviewTitle('Degree');
        setPdfUrl('');
        const imgs = fileUrl
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        setImageUrls(imgs);
        setPreviewVisible(true);
    };

    const openStatusModal = (record, action) => {
        setStatusTarget(record);
        setTargetAction(action); // 'Accepted' | 'Rejected'
        setReason('');
        setStatusModalOpen(true);
    };

    const submitStatusUpdate = async () => {
        const id = getAppId(statusTarget);
        if (!id) {
            toast.error('Không xác định được ID đơn ứng tuyển.');
            return;
        }
        // Backend expects: { status: boolean, reason: string }
        // Map: Accepted => true, Rejected => false
        const statusBool = targetAction === 'Accepted';

        if (!statusBool && !reason.trim()) {
            toast.info('Vui lòng nhập lý do khi từ chối.');
            return;
        }

        setUpdating(true);
        try {
            const payload = { status: statusBool, reason: reason?.trim() || '' };
            const res = await axiosInstance.put(ENDPOINTS.updateStatus(id), payload);

            // Một số API trả {code,message}, một số trả trực tiếp object/200.
            const { code, message } = res?.data || {};
            if (res.status === 200 && (code === undefined || code === 200)) {
                toast.success('Cập nhật trạng thái thành công');
                setStatusModalOpen(false);
                setStatusTarget(null);
                refresh(); // refetch list
            } else {
                toast.error(message || 'Cập nhật thất bại');
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Cập nhật trạng thái thất bại';
            toast.error(msg);
            console.error('Update status error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            sortOrder: sortedInfo.columnKey === 'title' ? sortedInfo.order : null,
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Accepted', value: 'Accepted' },
                { text: 'Rejected', value: 'Rejected' },
            ],
            filteredValue: filteredInfo.status || null,
            onFilter: (value, record) => record.status === value,
            render: (s) => <Tag color={statusColor(s)}>{s || 'Unknown'}</Tag>,
        },
        {
            title: 'Chức danh',
            dataIndex: 'profession',
            key: 'profession',
            ellipsis: true,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'CV',
            dataIndex: 'cv',
            key: 'cv',
            render: (cv) => (
                <Button type="link" onClick={() => handlePreview(cv, 'cv')}>
                    Xem CV
                </Button>
            ),
        },
        {
            title: 'Degree',
            dataIndex: 'degree',
            key: 'degree',
            render: (degree) => (
                <Button type="link" onClick={() => handlePreview(degree, 'degree')}>
                    Xem bằng cấp
                </Button>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
            render: (v) => <span>{formatDateTime(v)}</span>,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 220,
            render: (_, record) => {
                const disabledAccept = record.status === 'Accepted';
                const disabledReject = record.status === 'Rejected';
                return (
                    <Space>
                        <Button
                            type="primary"
                            disabled={disabledAccept}
                            onClick={() => openStatusModal(record, 'Accepted')}
                        >
                            Duyệt
                        </Button>
                        <Button
                            danger
                            disabled={disabledReject}
                            onClick={() => openStatusModal(record, 'Rejected')}
                        >
                            Từ chối
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý đơn ứng tuyển giảng viên</h2>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Segmented
                        value={dataset}
                        onChange={(v) => setDataset(v)}
                        options={[{ label: 'All', value: 'all' }]}
                    />
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tiêu đề, trạng thái…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 320 }}
                    />
                </div>

                <Space wrap>
                    <Button onClick={() => setSortedInfo({ columnKey: 'createdAt', order: 'descend' })}>
                        Sort mới nhất
                    </Button>
                    <Button onClick={clearFilters}>Clear filters</Button>
                    <Button onClick={clearAll}>Clear all</Button>
                    <Button icon={<ReloadOutlined />} onClick={refresh}>
                        Refresh
                    </Button>
                </Space>
            </div>

            <Table
                size="middle"
                bordered
                rowKey={(r) => r.id ?? r.ticketCode ?? `${r.title}-${r.createdAt}`}
                loading={loading}
                columns={columns}
                dataSource={displayed}
                onChange={handleChange}
                pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false }}
                scroll={{ x: 1100 }}
                locale={{ emptyText: 'Không tìm thấy đơn ứng tuyển nào!' }}
            />

            {/* Preview Modal (PDF/Images) */}
            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                centered
                destroyOnClose
                maskClosable
                bodyStyle={{ maxHeight: 700, overflowY: 'auto' }}
            >
                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=1&navpanes=0`}
                        title="PDF preview"
                        style={{ width: '100%', height: '640px', border: 'none' }}
                        allow="fullscreen"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Degree Image ${index + 1}`}
                            style={{
                                width: '100%',
                                maxHeight: 640,
                                objectFit: 'contain',
                                marginBottom: 10,
                                display: 'block',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}
                        />
                    ))
                )}
            </Modal>

            {/* Update Status Modal */}
            <Modal
                open={statusModalOpen}
                title={`Cập nhật trạng thái — ${statusTarget?.title ?? ''}`}
                onCancel={() => setStatusModalOpen(false)}
                onOk={submitStatusUpdate}
                okText={targetAction === 'Accepted' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                confirmLoading={updating}
                destroyOnClose
                maskClosable={!updating}
            >
                <div style={{ marginBottom: 12 }}>
                    <b>Hành động:</b> {targetAction === 'Accepted' ? 'Duyệt (Accepted)' : 'Từ chối (Rejected)'}
                </div>
                <div>
                    <b>Lý do {targetAction === 'Rejected' ? '(bắt buộc)' : '(tuỳ chọn)'}:</b>
                    <Input.TextArea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder={
                            targetAction === 'Accepted'
                                ? 'Ghi chú nội bộ (tuỳ chọn)...'
                                : 'Nhập lý do từ chối...'
                        }
                        maxLength={500}
                        style={{ marginTop: 6 }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ModManageLectureApplication;
