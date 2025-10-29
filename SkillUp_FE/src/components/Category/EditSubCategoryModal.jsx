import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditSubCategoryModal = ({ isOpen, onClose, SubCategory ,onEdit }) => {
    const [subCategoryName, setSubCategoryName] = useState('');

    // Update input value when Category prop changes
    useEffect(() => {
        if (SubCategory) {
            setSubCategoryName(SubCategory.name || '');
        }
    }, [SubCategory]);

    const handleSubmit = async () => {
        if (!subCategoryName.trim()) {
            toast.error('Xin hãy nhập tên danh mục con.');
            return;
        }

        if (subCategoryName.length > 50) {
            toast.error('Tên danh mục con không được vượt quá 50 ký tự.');
            return;
        }

        onEdit(subCategoryName, SubCategory.id);
        setSubCategoryName('');
        onClose();  // Close modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Chỉnh sửa danh mục con
                </h2>

                <input
                    type="text"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSubCategoryModal;
