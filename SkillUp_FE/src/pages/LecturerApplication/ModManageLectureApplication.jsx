import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

const ENDPOINTS = {
    all: API_ENDPOINTS.MANAGE_LECTURER_APPLICATIONS,
    updateStatus: (id) => `${API_ENDPOINTS.UPDATE_STATUS_LECTURER_APPLICATION}/${encodeURIComponent(id)}`,
};

const PAGE_SIZE = 10;

const statusColor = (s) => {
    switch (s) {
        case 'Rejected': return 'red';
        case 'Pending': return 'gold';
        case 'Accepted': return 'green';
        default: return 'default';
    }
};

// Map hiển thị tiếng Việt (không đổi giá trị gốc dùng cho BE)
const statusLabelMap = {
    Pending: 'Chờ xử lý',
    Accepted: 'Đã chấp nhận',
    Rejected: 'Từ chối',
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
            // Lấy danh sách thực từ data (thường là data[0])
            let list = data[0] || [];

            // --- Chuẩn hoá trạng thái hiển thị ---
            list = list.map((it) => ({
                ...it,
                statusRaw: it.status,                              // giữ nguyên giá trị gốc
                statusLabel: statusLabelMap[it.status] || 'Không rõ', // hiển thị tiếng Việt
            }));

            setApplications(list);
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
            const statusRaw = (app.statusRaw || '').toLowerCase();
            const statusLabel = (app.statusLabel || '').toLowerCase();
            return title.includes(q) || statusRaw.includes(q) || statusLabel.includes(q);
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
            // Xem CV trong MODAL
            setPreviewTitle('CV');
            setPdfUrl(fileUrl);
            setImageUrls([]);
            setPreviewVisible(true);
            return;
        }

        // Degree là danh sách ảnh, phân tách bằng dấu phẩy
        setPreviewTitle('Bằng cấp');
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
        // BE expects: { status: boolean, reason: string }
        // Map UI: Accepted => true, Rejected => false
        const statusBool = targetAction === 'Accepted';

        if (!statusBool && !reason.trim()) {
            toast.error('Vui lòng nhập lý do khi từ chối.');
            return;
        }

        setUpdating(true);
        try {
            const payload = { status: statusBool, reason: reason?.trim() || '' };
            const res = await axiosInstance.put(ENDPOINTS.updateStatus(id), payload);

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
            dataIndex: 'statusRaw',  // dùng giá trị gốc cho filter/sort
            key: 'statusRaw',
            filters: [
                { text: 'Chờ xử lý', value: 'Pending' },
                { text: 'Đã chấp nhận', value: 'Accepted' },
                { text: 'Từ chối', value: 'Rejected' },
            ],
            filteredValue: filteredInfo.statusRaw || null,
            onFilter: (value, record) => (record.statusRaw || '') === value,
            sorter: (a, b) => (a.statusRaw || '').localeCompare(b.statusRaw || ''),
            sortOrder: sortedInfo.columnKey === 'statusRaw' ? sortedInfo.order : null,
            render: (_, r) => <Tag color={statusColor(r.statusRaw)}>{r.statusLabel}</Tag>,
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
            title: 'Bằng cấp',
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
                const disabledAccept = record.statusRaw === 'Accepted';
                const disabledReject = record.statusRaw === 'Rejected';
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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Segmented
                        value={dataset}
                        onChange={(v) => {
                            setDataset(v);
                            // (tuỳ chọn) reset filter/sort khi đổi dataset
                            setFilteredInfo({});
                            setSortedInfo({});
                        }}
                        options={[{ label: 'Tất cả', value: 'all' }]}
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
                        Sắp xếp mới nhất
                    </Button>
                    <Button onClick={clearFilters}>Xoá bộ lọc</Button>
                    <Button onClick={clearAll}>Xoá tất cả</Button>
                    <Button icon={<ReloadOutlined />} onClick={refresh}>
                        Tải lại
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
                pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false, showTotal: (t) => `${t} bản ghi` }}
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
                        title="Xem trước PDF"
                        style={{ width: '100%', height: '640px', border: 'none' }}
                        allow="fullscreen"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Ảnh bằng cấp ${index + 1}`}
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
                    <b>Hành động:</b> {targetAction === 'Accepted' ? 'Duyệt' : 'Từ chối'}
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
