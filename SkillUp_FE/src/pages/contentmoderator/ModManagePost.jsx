import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Modal, Image } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { modPostAPI } from '@/api/modPostAPI';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const statusColor = (s) => {
    switch (s) {
        case 'Active': return 'green';
        case 'Inactive': return 'red';
        case 'Banned': return 'volcano';
        default: return 'default';
    }
};

// Map hiển thị tiếng Việt
const statusLabelMap = {
    Active: 'Hoạt động',
    Inactive: 'Không hoạt động',
    Banned: 'Đã cấm',
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

const ModManagePost = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [dataset, setDataset] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Post Detail Modal
    const [detailVisible, setDetailVisible] = useState(false);
    const [detailPost, setDetailPost] = useState(null);

    // Ban/Unban Modal
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionTarget, setActionTarget] = useState(null);
    const [actionType, setActionType] = useState('ban'); // 'ban' | 'unban'
    const [processing, setProcessing] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await modPostAPI.getAllPosts();
            const { code, data } = res?.data || {};
            if (code !== 200 || !data || !Array.isArray(data)) {
                toast.error('Không thể tải danh sách bài đăng');
                setPosts([]);
                return;
            }

            // Chuẩn hoá dữ liệu
            const list = data.map((item) => ({
                ...item,
                statusRaw: item.status,
                statusLabel: statusLabelMap[item.status] || 'Không rõ',
            }));

            setPosts(list);
        } catch (err) {
            console.error('Fetch posts failed:', err);
            toast.error('Không thể tải danh sách bài đăng');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [dataset, refreshKey]);

    const displayed = useMemo(() => {
        if (!search.trim()) return posts;
        const q = search.trim().toLowerCase();
        return posts.filter((post) => {
            const title = (post.title || '').toLowerCase();
            const contents = (post.contents || '').toLowerCase();
            const accountName = (post.accountName || '').toLowerCase();
            const categoryName = (post.categoryName || '').toLowerCase();
            const statusRaw = (post.statusRaw || '').toLowerCase();
            const statusLabel = (post.statusLabel || '').toLowerCase();
            return (
                title.includes(q) ||
                contents.includes(q) ||
                accountName.includes(q) ||
                categoryName.includes(q) ||
                statusRaw.includes(q) ||
                statusLabel.includes(q)
            );
        });
    }, [posts, search]);

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

    const handleViewDetail = (record) => {
        setDetailPost(record);
        setDetailVisible(true);
    };

    const openActionModal = (record, type) => {
        setActionTarget(record);
        setActionType(type);
        setActionModalOpen(true);
    };

    const submitAction = async () => {
        if (!actionTarget?.id) {
            toast.error('Không xác định được ID bài đăng');
            return;
        }

        setProcessing(true);
        try {
            const res =
                actionType === 'ban'
                    ? await modPostAPI.banPost(actionTarget.id)
                    : await modPostAPI.unbanPost(actionTarget.id);

            const { code, message } = res?.data || {};

            if (res.status === 200 && (code === undefined || code === 200)) {
                toast.success(
                    actionType === 'ban'
                        ? 'Cấm bài đăng thành công'
                        : 'Bỏ cấm bài đăng thành công'
                );
                setActionModalOpen(false);
                setActionTarget(null);
                refresh();
            } else {
                toast.error(message || 'Thao tác thất bại');
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Thao tác thất bại';
            toast.error(msg);
            console.error('Action error:', err);
        } finally {
            setProcessing(false);
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
            width: 250,
        },
        {
            title: 'Tác giả',
            dataIndex: 'accountName',
            key: 'accountName',
            ellipsis: true,
            width: 150,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusRaw',
            key: 'statusRaw',
            filters: [
                { text: 'Hoạt động', value: 'Active' },
                { text: 'Không hoạt động', value: 'Inactive' },
                { text: 'Đã cấm', value: 'Banned' },
            ],
            filteredValue: filteredInfo.statusRaw || null,
            onFilter: (value, record) => (record.statusRaw || '') === value,
            sorter: (a, b) => (a.statusRaw || '').localeCompare(b.statusRaw || ''),
            sortOrder: sortedInfo.columnKey === 'statusRaw' ? sortedInfo.order : null,
            render: (_, r) => <Tag color={statusColor(r.statusRaw)}>{r.statusLabel}</Tag>,
            width: 150,
        },
        {
            title: 'Chi tiết',
            key: 'detail',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                >
                    Xem
                </Button>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 200,
            render: (_, record) => {
                const isBanned = record.statusRaw === 'Banned';
                const isInactive = record.statusRaw === 'Inactive';

                return (
                    <Space>
                        <Button
                            danger
                            disabled={isBanned}
                            onClick={() => openActionModal(record, 'ban')}
                        >
                            Cấm
                        </Button>
                        <Button
                            type="primary"
                            disabled={!isBanned && !isInactive}
                            onClick={() => openActionModal(record, 'unban')}
                        >
                            Bỏ cấm
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
                            setFilteredInfo({});
                            setSortedInfo({});
                        }}
                        options={[{ label: 'Tất cả', value: 'all' }]}
                    />
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tiêu đề, nội dung, tác giả..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 320 }}
                    />
                </div>

                <Space wrap>
                    <Button
                        onClick={() =>
                            setSortedInfo({ columnKey: 'createdAt', order: 'descend' })
                        }
                    >
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
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={displayed}
                onChange={handleChange}
                pagination={{
                    pageSize: PAGE_SIZE,
                    showSizeChanger: false,
                    showTotal: (t) => `${t} bản ghi`,
                }}
                scroll={{ x: 900 }}
                locale={{ emptyText: 'Không tìm thấy bài đăng nào!' }}
            />

            {/* Post Detail Modal */}
            <Modal
                open={detailVisible}
                title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết bài đăng</span>}
                footer={null}
                onCancel={() => setDetailVisible(false)}
                width={800}
                centered
                destroyOnClose
                maskClosable
                bodyStyle={{ maxHeight: 700, overflowY: 'auto', padding: '24px' }}
            >
                {detailPost && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Header with Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}>
                                {detailPost.accountName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                                    {detailPost.accountName}
                                </div>
                                <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
                                    {formatDateTime(detailPost.createdAt)}
                                </div>
                            </div>
                            <Tag color={statusColor(detailPost.statusRaw)} style={{ margin: 0, fontSize: '13px', padding: '4px 12px' }}>
                                {detailPost.statusLabel}
                            </Tag>
                        </div>

                        {/* Category */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tag color="blue" style={{ margin: 0, fontSize: '13px', padding: '4px 12px' }}>
                                {detailPost.categoryName || 'Chưa phân loại'}
                            </Tag>
                        </div>

                        {/* Title */}
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#262626', margin: 0, lineHeight: 1.4 }}>
                                {detailPost.title}
                            </h2>
                        </div>

                        {/* Content */}
                        <div style={{
                            fontSize: '15px',
                            color: '#595959',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {detailPost.contents}
                        </div>

                        {/* Images */}
                        {detailPost.imageUrls && detailPost.imageUrls.length > 0 && (
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: 12 }}>
                                    Hình ảnh ({detailPost.imageUrls.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Image.PreviewGroup>
                                        {detailPost.imageUrls.map((url, index) => (
                                            <Image
                                                key={index}
                                                src={url}
                                                alt={`Hình ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    maxHeight: 400,
                                                    objectFit: 'cover',
                                                    borderRadius: 8,
                                                    marginBottom: 8,
                                                }}
                                            />
                                        ))}
                                    </Image.PreviewGroup>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div style={{ paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '13px', color: '#8c8c8c' }}>
                                <div>
                                    <span style={{ fontWeight: 600 }}>Ngày tạo:</span>{' '}
                                    {formatDateTime(detailPost.createdAt)}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600 }}>Ngày cập nhật:</span>{' '}
                                    {detailPost.updatedAt ? formatDateTime(detailPost.updatedAt) : 'Chưa cập nhật'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Ban/Unban Confirmation Modal */}
            <Modal
                open={actionModalOpen}
                title={
                    actionType === 'ban'
                        ? `Cấm bài đăng — ${actionTarget?.title ?? ''}`
                        : `Bỏ cấm bài đăng — ${actionTarget?.title ?? ''}`
                }
                onCancel={() => setActionModalOpen(false)}
                onOk={submitAction}
                okText={actionType === 'ban' ? 'Xác nhận cấm' : 'Xác nhận bỏ cấm'}
                okButtonProps={{
                    danger: actionType === 'ban',
                }}
                confirmLoading={processing}
                destroyOnClose
                maskClosable={!processing}
            >
                <div style={{ marginBottom: 12 }}>
                    <p>
                        Bạn có chắc chắn muốn{' '}
                        <b>{actionType === 'ban' ? 'cấm' : 'bỏ cấm'}</b> bài đăng này không?
                    </p>
                    <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                        <p><b>Tiêu đề:</b> {actionTarget?.title}</p>
                        <p><b>Tác giả:</b> {actionTarget?.accountName}</p>
                        <p><b>Trạng thái hiện tại:</b> <Tag color={statusColor(actionTarget?.statusRaw)}>{actionTarget?.statusLabel}</Tag></p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ModManagePost;
