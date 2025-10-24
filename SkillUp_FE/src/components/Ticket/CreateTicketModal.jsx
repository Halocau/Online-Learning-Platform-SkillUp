import React, { useEffect, useRef, useState } from 'react';
import { axiosInstance, API_ENDPOINTS } from '@/config/api';
import { toast } from 'react-toastify';

// (Không cần 'type Props' nữa)

const isBlank = (v) => { // Bỏ ': unknown'
    if (v === undefined || v === null) return true;
    if (typeof v !== 'string') return false;
    const s = v.trim();
    return s.length === 0 || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined';
};

// Bỏ ': Props'
export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 1. Thêm state để quản lý lỗi
    const [errors, setErrors] = useState({}); // Bỏ generic type

    const dialogRef = useRef(null); // Bỏ '<HTMLDivElement>'

    useEffect(() => {
        if (isOpen) {
            // Reset form khi mở
            setTitle('');
            setContents('');
            setSubmitting(false);
            setErrors({}); // Xóa lỗi cũ
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    // 2. Hàm validate logic
    const validateForm = () => {
        const newErrors = {}; // Bỏ khai báo type

        if (isBlank(title)) {
            newErrors.title = 'Vui lòng nhập tiêu đề (không để trống hoặc chỉ khoảng trắng).';
        }
        if (isBlank(contents)) {
            newErrors.contents = 'Vui lòng nhập nội dung (không để trống hoặc chỉ khoảng trắng).';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => { // Bỏ ': React.FormEvent'
        e.preventDefault();

        // 3. Chạy validation
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            const fd = new FormData();
            fd.append('Title', title.trim());
            fd.append('Contents', contents.trim());

            const res = await axiosInstance.post(
                API_ENDPOINTS.CREATE_TICKET,
                fd,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (res?.data?.code === 200) {
                toast.success('Tạo ticket thành công!');
                onClose();
                onSuccess();
            } else {
                const msg = res?.data?.message || 'Không thể tạo ticket.';
                toast.error(msg);
            }
        } catch (err) { // Bỏ ': any'
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Có lỗi xảy ra khi tạo ticket.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* modal */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 p-6"
            >
                <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Tạo Ticket</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                        aria-label="Đóng"
                    >
                        ✖
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                // Xóa lỗi khi người dùng gõ
                                if (errors.title) {
                                    setErrors(prev => ({ ...prev, title: undefined }));
                                }
                            }}
                            placeholder="VD: Lỗi không đăng nhập được"
                            // 4. Thêm class động
                            className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            maxLength={200}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Không để trống, không chỉ khoảng trắng, không nhập “null”.
                        </p>
                        {/* 5. Hiển thị lỗi */}
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={contents}
                            onChange={(e) => {
                                setContents(e.target.value);
                                // Xóa lỗi khi người dùng gõ
                                if (errors.contents) {
                                    setErrors(prev => ({ ...prev, contents: undefined }));
                                }
                            }}
                            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                            rows={6}
                            // 4. Thêm class động
                            className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400 resize-y ${errors.contents ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Mô tả rõ bối cảnh, bước tái hiện, ảnh hưởng...
                        </p>
                        {/* 5. Hiển thị lỗi */}
                        {errors.contents && (
                            <p className="mt-1 text-xs text-red-600">{errors.contents}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-5 py-2 rounded-lg font-semibold text-gray-900
                ${submitting ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 shadow-md hover:shadow-lg'}
              `}
                        >
                            {submitting ? 'Đang tạo...' : 'Tạo ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}