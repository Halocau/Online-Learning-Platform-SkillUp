import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import ResolveTicketModal from '@/components/Ticket/ResolveTicketModal.jsx';

const ENDPOINTS = {
    all: API_ENDPOINTS.ALL_TICKETS,          // '/Ticket/all-tickets'
    unsolved: API_ENDPOINTS.UNSOLVED_TICKETS, // '/Ticket/unsolved-tickets'
    solved: API_ENDPOINTS.SOLVE_TICKETS,      // '/Ticket/solved-tickets'
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

// Hiển thị nhãn tiếng Việt (giữ nguyên value gốc để filter/so khớp dữ liệu)
const statusLabelMap = {
    Pending: 'Chờ xử lý',
    Accepted: 'Đã chấp nhận',
    Rejected: 'Từ chối',
};

const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

export default function ModAllTicket() {
    const navigate = useNavigate();

    const [dataset, setDataset] = useState('all'); // all | unsolved | solved
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [sortedInfo, setSortedInfo] = useState({});
    const [filteredInfo, setFilteredInfo] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailCode, setDetailCode] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setTickets([]);

        try {
            const endpoint = ENDPOINTS[dataset] || ENDPOINTS.all;
            const res = await axiosInstance.get(endpoint);
            const { code, message, data } = res?.data || {};

            if (code !== 200) {
                if (typeof message === 'string' && message.toLowerCase().includes('không tìm thấy ticket')) {
                    setTickets([]);
                    return;
                }
                setTickets([]);
                toast.error('Không thể tải danh sách ticket');
                return;
            }

            let list = [];
            if (Array.isArray(data)) {
                list = Array.isArray(data[0]) ? data[0] : data;
            } else if (data) {
                list = [data];
            }

            if (!Array.isArray(list) || list.length === 0) {
                setTickets([]);
                return;
            }

            setTickets(list);
        } catch (err) {
            console.error('Fetch tickets failed:', err);
            setTickets([]);
            toast.error('Không thể tải danh sách ticket');
        } finally {
            setLoading(false);
        }
    }, [dataset]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets, refreshKey]);

    // Tìm kiếm phía client
    const displayed = useMemo(() => {
        if (!search.trim()) return tickets;
        const q = search.trim().toLowerCase();
        return tickets.filter((t) => {
            const code = (t.ticketCode || '').toLowerCase();
            const title = (t.title || '').toLowerCase();
            const name = (t.accountName || '').toLowerCase();
            return code.includes(q) || title.includes(q) || name.includes(q);
        });
    }, [tickets, search]);

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const clearFilters = () => setFilteredInfo({});
    const clearAll = () => { setFilteredInfo({}); setSortedInfo({}); setSearch(''); };
    const refresh = () => setRefreshKey((k) => k + 1);

    const columns = [
        {
            title: 'Mã ticket',
            dataIndex: 'ticketCode',
            key: 'ticketCode',
            width: 140,
            sorter: (a, b) => (a.ticketCode || '').localeCompare(b.ticketCode || ''),
            sortOrder: sortedInfo.columnKey === 'ticketCode' ? sortedInfo.order : null,
            render: (v) => <span className="font-medium">#{v}</span>,
            ellipsis: true,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            sortOrder: sortedInfo.columnKey === 'title' ? sortedInfo.order : null,
            ellipsis: true,
        },
        {
            title: 'Người gửi',
            dataIndex: 'accountName',
            key: 'accountName',
            width: 160,
            sorter: (a, b) => (a.accountName || '').localeCompare(b.accountName || ''),
            sortOrder: sortedInfo.columnKey === 'accountName' ? sortedInfo.order : null,
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            filters: [
                { text: 'Chờ xử lý', value: 'Pending' },
                { text: 'Đã chấp nhận', value: 'Accepted' },
                { text: 'Từ chối', value: 'Rejected' },
            ],
            filteredValue: filteredInfo.status || null,
            onFilter: (value, record) => (record.status || '') === value,
            render: (s) => <Tag color={statusColor(s)}>{statusLabelMap[s] || 'Không rõ'}</Tag>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
            render: (v) => <span>{formatDateTime(v)}</span>,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => { setDetailCode(record.ticketCode); setDetailOpen(true); }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Segmented
                        value={dataset}
                        onChange={(v) => setDataset(v)}
                        options={[
                            { label: 'Tất cả', value: 'all' },
                            { label: 'Chưa xử lý', value: 'unsolved' },
                            { label: 'Đã xử lý', value: 'solved' },
                        ]}
                    />
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo mã, tiêu đề, người gửi…"
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
                rowKey={(r) => r.ticketCode}
                loading={loading}
                columns={columns}
                dataSource={displayed}
                onChange={handleChange}
                pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false, showTotal: (t) => `${t} bản ghi` }}
                scroll={{ x: 980 }}
                locale={{ emptyText: 'Không tìm thấy ticket nào!' }}
            />

            <ResolveTicketModal
                open={detailOpen}
                code={detailCode}
                onClose={() => setDetailOpen(false)}
                onSuccess={() => { setDetailOpen(false); setRefreshKey(k => k + 1); }}
            />
        </div>
    );
}
