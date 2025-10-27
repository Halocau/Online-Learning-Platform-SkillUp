import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

const ENDPOINTS = {
    all: API_ENDPOINTS.MANAGE_LECTURER_APPLICATIONS,
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

const ModManageLectureApplication = () => {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [dataset, setDataset] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Preview states
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [imageUrls, setImageUrls] = useState([]);

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
            // XEM CV TRONG MODAL (mặc định Cách A):
            setPreviewTitle('CV');
            setPdfUrl(fileUrl);
            setImageUrls([]);
            setPreviewVisible(true);

            // NẾU MUỐN MỞ TAB MỚI THAY VÌ MODAL, bỏ comment dòng dưới và comment 4 dòng trên:
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
                // Đổi rowKey nếu không có ticketCode: fallback theo id hoặc tổ hợp
                rowKey={(r) => r.id ?? r.ticketCode ?? `${r.title}-${r.createdAt}`}
                loading={loading}
                columns={columns}
                dataSource={displayed}
                onChange={handleChange}
                pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false }}
                scroll={{ x: 980 }}
                locale={{ emptyText: 'Không tìm thấy đơn ứng tuyển nào!' }}
            />

            {/* AntD v5: dùng 'open' thay vì 'visible' */}
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
        </div>
    );
};

export default ModManageLectureApplication;
