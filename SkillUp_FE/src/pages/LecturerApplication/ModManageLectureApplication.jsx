import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Tooltip, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
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
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [imageUrls, setImageUrls] = useState([]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(ENDPOINTS.all);
            const { code, message, data } = res?.data || {};
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

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const clearFilters = () => setFilteredInfo({});
    const clearAll = () => { setFilteredInfo({}); setSortedInfo({}); setSearch(''); };
    const refresh = () => setRefreshKey(k => k + 1);

    const handlePreview = (fileUrl, fileType) => {
        setPreviewTitle(fileType === 'cv' ? 'CV' : 'Degree');
        if (fileType === 'cv') {
            // Mở CV trong tab mới
            window.open(fileUrl, '_blank');
            setPdfUrl('');
            setImageUrls([]);
        } else {
            setImageUrls(fileUrl.split(','));
            setPdfUrl('');
            setPreviewVisible(true);
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
                <Button
                    type="link"
                    onClick={() => handlePreview(cv, 'cv')}
                >
                    Xem CV
                </Button>
            ),
        },
        {
            title: 'Degree',
            dataIndex: 'degree',
            key: 'degree',
            render: (degree) => (
                <Button
                    type="link"
                    onClick={() => handlePreview(degree, 'degree')}
                >
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
                rowKey="ticketCode"
                loading={loading}
                columns={columns}
                dataSource={displayed}
                onChange={handleChange}
                pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false }}
                scroll={{ x: 980 }}
                locale={{ emptyText: 'Không tìm thấy đơn ứng tuyển nào!' }}
            />

            <Modal
                visible={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={600}  // Cố định chiều rộng modal
                style={{ top: 20 }}  // Điều chỉnh vị trí modal nếu cần
                bodyStyle={{ maxHeight: '650px', overflowY: 'auto' }}  // Cho phép cuộn khi nội dung dài
            >
                {pdfUrl ? (
                    <Document file={pdfUrl}>
                        <Page pageNumber={1} />
                    </Document>
                ) : (
                    imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Degree Image ${index}`}
                            style={{
                                width: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain', // Giữ nguyên tỷ lệ ảnh
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
