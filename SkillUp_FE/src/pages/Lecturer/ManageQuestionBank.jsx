import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Table, Button, Space, Tag, Input, Segmented, Tooltip, Select } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';
import QuestionBankViewModal from '@/components/QuestionBank/QuestionBankViewModal';
import QuestionBankEditModal from '@/components/QuestionBank/QuestionBankEditModal';
import QuestionBankCreateModal from '@/components/QuestionBank/QuestionBanKCreateModal';

const PAGE_SIZE = 10;

const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

export default function ManageQuestionBank() {
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [sections, setSections] = useState([]);
    const [questionBanks, setQuestionBanks] = useState([]);

    const [search, setSearch] = useState('');
    const [sortedInfo, setSortedInfo] = useState({});
    const [filteredInfo, setFilteredInfo] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);

    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const [detailCode, setDetailCode] = useState(null);
    const [questionBankObj, setQuestionBankObj] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('http://localhost:5120/api/Course/Courses-Of-Lecturer');
            const activeCourses = response.data.data.filter(course => course.isActive);
            setCourses(activeCourses);
        } catch (err) {
            console.log('')
            console.error('Fetch courses failed:', err);
            setCourseId(null);
            toast.error('Không thể tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSections = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_BY_COURSE.replace('{courseId}', courseId));
            const activeSections = response.data.data.filter(section => section.isActive);
            setSections(activeSections);
        } catch (err) {
            console.error('Fetch sections failed:', err);
            setSections([]);
            toast.error('Không thể tải danh sách chương');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    const fetchQuestionBank = useCallback(async () => {
        setLoading(true);
        try {
            const url = API_ENDPOINTS.GET_BY_SECTION.replace('{sectionId}', selectedSectionId);

            const response = await axiosInstance.get(url, {
                params: {
                    courseId: courseId
                }
            });
            const activeQuestions = response.data.data.flat().filter(question => question.isActive);
            setQuestionBanks(activeQuestions);

        } catch (err) {
            console.error('Fetch question bank failed:', err);
            setQuestionBanks([]);
            toast.error('Không thể tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }

    }, [selectedSectionId, courseId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // This effect runs when 'fetchSections' (or courseId) changes
    useEffect(() => {
        if (courseId) {
            fetchSections();
        }
    }, [fetchSections, courseId]);

    // This effect runs when 'fetchQuestionBank' (or sectionId/courseId) changes
    useEffect(() => {
        if (selectedSectionId) {
            fetchQuestionBank();
        }
    }, [fetchQuestionBank, selectedSectionId]);

    useEffect(() => {
        // Auto-select the first course if not already selected
        if (!courseId && courses.length > 0) {
            setCourseId(courses[0].id);
        }
    }, [courses, courseId]);

    // Add this hook after your component definition
    useEffect(() => {
        if (sections.length > 0) {
            setSelectedSectionId(sections[0].id);
        }
    }, [sections, courseId]);

    // Tìm kiếm phía client
    const displayed = useMemo(() => {
        if (!search.trim()) return questionBanks;
        const q = search.trim().toLowerCase();
        return questionBanks.filter((t) => {
            const title = (t.title || '').toLowerCase();
            return title.includes(q);
        });
    }, [questionBanks, search]);

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const handleSave = async (updatedQuestion) => {
        try {
            const url = API_ENDPOINTS.QUESTION_BANK_UPDATE.replace('{questionBankId}', updatedQuestion.id);
            const response = await axiosInstance.put(url, updatedQuestion, {
                params: {
                    courseId: courseId
                }
            });
            if (response?.data?.code === 200) {
                toast.success('Cập nhật câu hỏi thành công.');
                fetchQuestionBank();
                return;
            } else {
                toast.error('Không thể cập nhật câu hỏi.');
                fetchQuestionBank();
                return;
            }
        } catch (err) {
            console.error('Update question failed:', err);
            toast.error('Không thể cập nhật câu hỏi.');
        }
    };

    const handleDelete = async (questionId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xoá câu hỏi này?");
        if (!confirmDelete) return;  // User cancelled

        try {
            const url = API_ENDPOINTS.QUESTION_BANK_DELETE.replace('{questionBankId}', questionId);
            const response = await axiosInstance.delete(url, {
                params: {
                    courseId: courseId
                }
            });
            if (response?.data?.code === 200) {
                toast.success('Xóa câu hỏi thành công.');
                fetchQuestionBank();
                return;
            } else {
                toast.error('Không thể xóa câu hỏi.');
                fetchQuestionBank();
                return;
            }
        } catch (err) {
            console.error('Delete question failed:', err);
            toast.error('Không thể xóa câu hỏi.');
        }
    };

    const handleCreate = async (newQuestion) => {
        try {
            console.log(newQuestion);
            const url = API_ENDPOINTS.QUESTION_BANK_CREATE.replace('{sectionId}', selectedSectionId);
            const response = await axiosInstance.post(url, newQuestion, {
                params: {
                    courseId: courseId
                }
            });
            if (response?.data?.code === 200) {
                toast.success('Tạo câu hỏi thành cong.');
                fetchQuestionBank();
                return;
            } else {
                toast.error('Không thể tạo câu hỏi.');
                fetchQuestionBank();
                return;
            }
        } catch (err) {
            console.error('Create question failed:', err);
            toast.error('Không thể tạo câu hỏi.');
        }
    }

    const clearFilters = () => setFilteredInfo({});
    const clearAll = () => { setFilteredInfo({}); setSortedInfo({}); setSearch(''); };
    const refresh = () => setRefreshKey((k) => k + 1);

    const columns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'title',
            key: 'title',
            width: 140,
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            sortOrder: sortedInfo.columnKey === 'title' ? sortedInfo.order : null,
            render: (v) => <span className="font-medium">{v}</span>,
            ellipsis: true,
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
            title: 'Cập nhật vào',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
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
                            onClick={() => { setDetailCode(record.id); setQuestionBankObj(record); setDetailOpen(true); }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => { setDetailCode(record.id); setQuestionBankObj(record); setEditOpen(true); }}
                        />
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => { handleDelete(record.id); }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="flex gap-4">
            {/* SIDEBAR */}
            <div className="w-64 bg-gray-50 border border-gray-200 rounded-xl p-4 h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-3 mt-6">Chọn khóa học</h3>
                <Select
                    placeholder="Chọn khóa học"
                    value={courseId || undefined}
                    onChange={(value) => setCourseId(value)}
                    style={{ width: 220 }}
                >
                    {courses.map((course) => (
                        <Option key={course.id} value={course.id}>
                            {course.title}
                        </Option>
                    ))}
                </Select>

                <h3 className="text-lg font-semibold mb-3">Danh sách chương</h3>
                {sections.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                        {sections.map((section) => (
                            <li
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                className={`cursor-pointer px-3 py-2 rounded-lg border transition ${selectedSectionId === section.id
                                    ? 'bg-blue-500 text-white border-blue-600'
                                    : 'bg-white hover:bg-blue-50 border-gray-200'
                                    }`}
                            >
                                <div className="font-medium">{section.title}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-500 text-sm">Không có chương nào</div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo mã, tiêu đề, người gửi…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: 320 }}
                        />
                    </div>
                    {selectedSectionId ? (
                        <Button type="primary" onClick={() => setCreateOpen(true)}>
                        Tạo câu hỏi mới
                    </Button>
                    ) : (
                        <div></div>
                    )
                    }
                    

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
                    scroll={{ x: 980 }}
                    locale={{ emptyText: 'Không tìm thấy câu hỏi nào!' }}
                />

                <QuestionBankViewModal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    questionBankObj={questionBankObj}
                />

                <QuestionBankEditModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    questionBankObj={questionBankObj}
                    onSave={handleSave}
                />

                <QuestionBankCreateModal
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onCreate={handleCreate}
                    sectionId={selectedSectionId}
                />
            </div>
        </div >
    );

}
