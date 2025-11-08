import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, Input, Button, Form, Typography, Space, Tooltip, AutoComplete, Spin } from 'antd';
import { toast } from 'react-toastify';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';

const { TextArea } = Input;
const { Text } = Typography;

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // --- Suggest state ---
    const [titleInput, setTitleInput] = useState('');
    const [suggests, setSuggests] = useState([]);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    // Reset form khi mở/đóng modal
    useEffect(() => {
        if (isOpen) {
            form.setFieldsValue({ ['Tiêu đề']: '', ['Nội dung']: '' });
            setSubmitting(false);
            setSuggests([]);
            setTitleInput('');
        } else {
            form.resetFields();
            setSubmitting(false);
            setSuggests([]);
            setTitleInput('');
        }
    }, [isOpen, form]);

    // --- Gọi API tạo phiếu (multipart/form-data) ---
    const doRequest = useCallback(
        async (values) => {
            try {
                setSubmitting(true);

                const rawTitle = values['Tiêu đề'];
                const rawContents = values['Nội dung'];

                const title = (rawTitle ?? '').trim();
                const contents = (rawContents ?? '').trim();

                const fd = new FormData();
                fd.append('Title', title);
                fd.append('Contents', contents);

                const res = await axiosInstance.post(API_ENDPOINTS.CREATE_TICKET, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (res?.data?.code === 200) {
                    toast.success('Tạo phiếu thành công!');
                    onClose?.();
                    onSuccess?.();
                } else {
                    toast.error(res?.data?.message || 'Không thể tạo phiếu.');
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo phiếu.';
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        },
        [onClose, onSuccess]
    );

    const handleSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields();
            await doRequest(values);
        } catch (err) {
            if (!err?.errorFields) {
                // eslint-disable-next-line no-console
                console.error(err);
                toast.error('Có lỗi xảy ra khi tạo phiếu.');
            }
        }
    }, [form, doRequest]);

    // Hotkey Ctrl/Cmd + Enter
    useEffect(() => {
        if (!isOpen) return;

        const handler = (e) => {
            if (e.isComposing) return;
            const isHotkey = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
            if (!isHotkey || submitting) return;
            e.preventDefault();
            handleSubmit();
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, submitting, handleSubmit]);

    // --- Suggest API with debounce + abort ---
    const fetchSuggest = useCallback((q) => {
        if (!q?.trim()) {
            setSuggests([]);
            return;
        }
        if (abortRef.current) abortRef.current.abort(); // hủy request cũ
        const ac = new AbortController();
        abortRef.current = ac;

        setLoadingSuggest(true);
        axiosInstance
            .get(API_ENDPOINTS.SUGGEST_TICKET_TITLES, {
                params: { query: q, limit: 8 },
                signal: ac.signal,
            })
            .then((res) => {
                setSuggests(res?.data?.items ?? []); // [{ id, title, score }]
            })
            .catch((err) => {
                if (err?.code !== 'ERR_CANCELED' && err?.name !== 'CanceledError') {
                    // console.warn('Suggest error:', err);
                }
            })
            .finally(() => setLoadingSuggest(false));
    }, []);

    const debouncedSearch = useCallback(
        (q) => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            debounceRef.current = window.setTimeout(() => fetchSuggest(q), 250);
        },
        [fetchSuggest]
    );

    // --- highlight query trong label ---
    const highlight = (text, key) => {
        if (!key) return text;
        const i = text.toLowerCase().indexOf(key.toLowerCase());
        if (i < 0) return text;
        return (
            <>
                {text.slice(0, i)}
                <mark>{text.slice(i, i + key.length)}</mark>
                {text.slice(i + key.length)}
            </>
        );
    };

    // --- map options cho AutoComplete ---
    const options =
        suggests.length > 0
            ? suggests.map((s) => ({
                value: s.title,
                label: (
                    <div className="flex flex-col">
                        <div className="text-sm">{highlight(s.title, titleInput)}</div>
                        {/**
                         {typeof s.score === 'number' && (
                            <div className="text-xs text-gray-400">Score: {s.score.toFixed(3)}</div>
                        )}
                        */}
                    </div>
                ),
            }))
            : [
                {
                    value: titleInput,
                    label: (
                        <div className="flex items-center gap-2">
                            {loadingSuggest ? <Spin size="small" /> : null}
                            <span>Không thấy tiêu đề tương tự. Tạo mới “{titleInput}”.</span>
                        </div>
                    ),
                },
            ];

    const TitleLabel = (
        <Space size={6}>
            <span>Tiêu đề</span>
            <Tooltip title="Tiêu đề ngắn gọn, nêu rõ vấn đề hoặc yêu cầu.">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    const ContentsLabel = (
        <Space size={6}>
            <span>Nội dung</span>
            <Tooltip title="Mô tả chi tiết bối cảnh, bước tái hiện, ảnh hưởng,…">
                <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
        </Space>
    );

    return (
        <Modal
            title={<span className="font-semibold">Tạo phiếu</span>}
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
                        Mẹo: nhấn <kbd>Ctrl</kbd>+<kbd>Enter</kbd> để gửi nhanh
                    </Text>
                    <Space>
                        <Button onClick={onClose} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button type="primary" onClick={handleSubmit} loading={submitting}>
                            Tạo phiếu
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form form={form} layout="vertical" requiredMark={false} autoComplete="off">

                <Form.Item
                    label={TitleLabel}
                    name="Tiêu đề"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                        { max: 200, message: `Tối đa 200 ký tự` },
                        {
                            validator: (_, v) =>
                                v && v.trim() ? Promise.resolve() : Promise.reject(new Error('Không chỉ nhập khoảng trắng')),
                        },
                    ]}
                    extra={
                        <Text type="secondary">
                            Tiêu đề ngắn gọn, ≤ 200 ký tự. ({titleInput.length}/200)
                        </Text>
                    }
                >
                    <AutoComplete
                        value={titleInput}
                        onChange={(v) => {
                            const next = (v ?? '').slice(0, 200);   // ✅ tự cắt độ dài
                            setTitleInput(next);
                            form.setFieldValue('Tiêu đề', next);
                        }}
                        onSearch={(v) => {
                            const next = (v ?? '').slice(0, 200);
                            setTitleInput(next);
                            debouncedSearch(next);
                            form.setFieldValue('Tiêu đề', next);
                        }}
                        onSelect={(v) => {
                            const next = (v ?? '').slice(0, 200);
                            setTitleInput(next);
                            form.setFieldValue('Tiêu đề', next);
                        }}
                        options={options}
                        filterOption={false}
                        popupMatchSelectWidth
                        allowClear           // ✅ Select hỗ trợ
                        placeholder="VD: Không đăng nhập được"
                    />
                </Form.Item>


                <Form.Item
                    label={ContentsLabel}
                    name="Nội dung"
                    rules={[
                        { required: true, message: 'Vui lòng nhập nội dung' },
                        { min: 10, message: 'Nội dung nên ≥ 10 ký tự' },
                        { max: 4000, message: 'Tối đa 4000 ký tự' },
                        {
                            validator: (_, v) =>
                                v && v.trim()
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Không chỉ nhập khoảng trắng')),
                        },
                    ]}
                    extra={<Text type="secondary">Bạn có thể xuống dòng; nội dung sẽ giữ format khi hiển thị.</Text>}
                >
                    <TextArea
                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải…"
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
