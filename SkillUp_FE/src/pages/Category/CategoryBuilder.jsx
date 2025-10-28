import React, { useState, useEffect, useMemo } from 'react';
import { Bars3Icon, EllipsisVerticalIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import ActionMenu from '@/components/common/ActionMenu';
import AddCategoryModal from '@/components/Category/AddCategoryModal';
import EditCategoryModal from '@/components/Category/EditCategoryModal';
import AddSubCategoryModal from '@/components/Category/AddSubCategoryModal';
import EditSubCategoryModal from '@/components/Category/EditSubCategoryModal';
import { axiosInstance, API_ENDPOINTS } from "@/config/api";
import { toast } from 'react-toastify';
import { set } from 'zod';

// Main Component
const CategoryBuilder = () => {
    const [categories, setCategories] = useState([]);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
    const [showEditSubCategoryModal, setShowEditSubCategoryModal] = useState(false);

    // fetch data
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.CATEGORY_LIST);
            const activeCategories = response.data.data.filter(cat => cat.isActive);
            setCategories(activeCategories);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // State to track which dropdown menu is open
    const [openMenuId, setOpenMenuId] = useState(null);

    // State for the confirmation modal
    const [modalState, setModalState] = useState({ isOpen: false, item: null, type: null });

    // --- Handlers ---

    const handleAddCategory = async (categoryName) => {
        const newCategory = { name: categoryName, subcategories: [] };
        const response = await axiosInstance.post(API_ENDPOINTS.CATEGORY_CREATE, newCategory);
        if (response?.data?.message === 'Tạo danh mục thành công.') {
            toast.success('Tạo danh mục mới thành công.');
            fetchCategories();
            return;
        } else {
            toast.error('Không thể tạo danh mục mới.');
            fetchCategories();
            return;
        }
    };

    const handleEditCategory = async (categoryName, id) => {
        const newCategory = { name: categoryName, subcategories: [] };
        const response = await axiosInstance.put(API_ENDPOINTS.CATEGORY_UPDATE.replace('{id}', id), newCategory);
        if (response?.data?.message === 'Cập nhật danh mục thành công.') {
            toast.success('Cập nhật danh mục thành công.');
            fetchCategories();
            return;
        } else {
            toast.error('Không thể cập nhật danh mục.');
            fetchCategories();
            return;
        }
    };

    const handleEditSubCategory = async (subCategoryName, id) => {
        const newCategory = { name: subCategoryName, isActive: true };
        const response = await axiosInstance.put(API_ENDPOINTS.SUBCATEGORY_UPDATE.replace('{id}', id), newCategory);

        if (response?.data === 'Cập nhật thành công.') {
            toast.success('Cập nhật danh mục con thành công.');
            fetchCategories();
            return;
        } else {
            toast.error('Không thể cập nhật danh mục con.');
            fetchCategories();
            return;
        }
    };

    const handleAddSubcategory = async (categoryName, categoryId) => {
        const newSubCategory = { name: categoryName, categoryId: categoryId };
        const response = await axiosInstance.post(API_ENDPOINTS.SUBCATEGORY_CREATE, newSubCategory);
        if (response?.data?.code === 200) {
            toast.success('Tạo danh mục con mới thành công.');
            fetchCategories();
            return;
        } else {
            toast.error('Không thể tạo danh mục con mới.');
            fetchCategories();
            return;
        }
    };

    // Toggle the action menu for a given item
    const handleToggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Opens the confirmation modal
    const handleDelete = async (item, type) => {
        if (type === 'category') {
            const response = await axiosInstance.delete(API_ENDPOINTS.CATEGORY_DELETE.replace('{id}', item.id));
            if (response?.data?.message === 'Xóa danh mục (soft delete) thành công.') {
                toast.success('Xóa danh mục thành công.');
                setOpenMenuId(null); // Close menu
                fetchCategories();
                return;
            } else {
                toast.error('Không thể xoá danh mục.');
                setOpenMenuId(null); // Close menu
                fetchCategories();
                return;
            }
        }
        if (type === 'subcategory') {
            const response = await axiosInstance.delete(API_ENDPOINTS.SUBCATEGORY_DELETE.replace('{id}', item.id));
            if (response?.data === 'Xóa thành công.') {
                toast.success('Xóa danh mục con thành công.');
                setOpenMenuId(null); // Close menu
                fetchCategories();
                return;
            } else {
                toast.error('Không thể xoá danh mục con.');
                setOpenMenuId(null); // Close menu
                fetchCategories();
                return;
            }
        }
        setModalState({ isOpen: true, item, type });
        setOpenMenuId(null); // Close menu
    };

    // Opens the edit modal
    const [categoryObj, setCategoryObj] = useState(null);
    const handleOpenEditModal = (item, type) => {
        if (type === 'category') {
            setCategoryObj(item);
            setShowEditCategoryModal(true);
            setOpenMenuId(null); // Close menu
            return;
        }
        if (type === 'subcategory') {
            setCategoryObj(item);
            setShowEditSubCategoryModal(true);
            setOpenMenuId(null);
            return;
        }
    };

    const handleOpenAddSubCategoryModal = (item) => {
        setCategoryObj(item);
        setShowAddSubCategoryModal(true);
        setOpenMenuId(null); // Close menu
    };


    // --- NEW STATE FOR FILTER AND SORT ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');

    // --- FILTERING AND SORTING LOGIC WITH useMemo ---
    const filteredAndSortedCategories = useMemo(() => {
        // 1. FILTERING
        let filtered = categories
            .map(category => {
                const searchLower = searchTerm.toLowerCase();

                // Check if category name matches
                const categoryMatch = category.name.toLowerCase().includes(searchLower);

                // Filter subcategories that match
                const matchingSubCategories = category.subCategories.filter(sub =>
                    sub.name.toLowerCase().includes(searchLower)
                );

                // If the category itself matches, keep it with all its original subcategories
                if (categoryMatch) {
                    return category;
                }

                // If only subcategories match, return the category but with only the matching subs
                if (matchingSubCategories.length > 0) {
                    return { ...category, subCategories: matchingSubCategories };
                }

                // No match found in this category or its subs
                return null;
            })
            .filter(Boolean); // Remove null entries where no match was found

        // 2. SORTING
        const sorted = [...filtered]; // Create a new array to avoid mutating the filtered one
        switch (sortOption) {
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'sub-desc': // Most subcategories
                sorted.sort((a, b) => b.subCategories.length - a.subCategories.length);
                break;
            case 'sub-asc': // Fewest subcategories
                sorted.sort((a, b) => a.subCategories.length - b.subCategories.length);
                break;
            default:
                break;
        }

        return sorted;

    }, [categories, searchTerm, sortOption]); // Recalculate only when these dependencies change

    return (
        <>
            <div className="bg-slate-50 min-h-screen font-sans">
                <div className="container mx-auto max-w-6xl p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <main className="md:col-span-3">
                            <h1 className="text-3xl font-bold text-slate-800">Quản Lý Danh Mục</h1>
                            <p className="mt-2 text-slate-500">
                                Xây dựng cấu trúc danh mục của bạn bằng cách tạo các danh mục và danh mục con.
                            </p>

                            <div className="mt-8">
                                {/* --- FILTER AND SORT CONTROLS --- */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    {/* Search Input */}
                                    <div className="relative flex-grow">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm danh mục hoặc danh mục con..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full rounded-lg border-slate-300 bg-white pl-10 pr-4 py-2 text-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Sort Dropdown */}
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="rounded-lg border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="name-asc">Sắp xếp theo tên (A-Z)</option>
                                        <option value="name-desc">Sắp xếp theo tên (Z-A)</option>
                                        <option value="sub-desc">Nhiều danh mục con nhất</option>
                                        <option value="sub-asc">Ít danh mục con nhất</option>
                                    </select>
                                </div>


                                <button
                                    onClick={() => setShowAddCategoryModal(true)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Thêm Danh Mục
                                </button>

                                <div className="mt-6 space-y-4">
                                    {/* --- UPDATED: RENDER THE FILTERED AND SORTED LIST --- */}
                                    {filteredAndSortedCategories.map((category) => (
                                        <div key={category.id} className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Bars3Icon className="h-5 w-5 text-slate-400 cursor-grab" />
                                                    <h2 className="font-semibold text-slate-800">{category.name}</h2>
                                                </div>
                                                <div className="relative">
                                                    <button onClick={() => handleToggleMenu(category.id)} className="text-slate-400 hover:text-slate-600">
                                                        <EllipsisVerticalIcon className="h-6 w-6" />
                                                    </button>
                                                    {openMenuId === category.id && (
                                                        <ActionMenu
                                                            onEdit={() => handleOpenEditModal(category, 'category')}
                                                            onDelete={() => handleDelete(category, 'category')}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 ml-4 space-y-3 border-l-2 border-slate-200 pl-6">
                                                {category.subCategories.map((sub) => (
                                                    <div key={sub.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Bars3Icon className="h-5 w-5 text-slate-400 cursor-grab" />
                                                            <p className="text-slate-700">{sub.name}</p>
                                                        </div>
                                                        <div className="relative">
                                                            <button onClick={() => handleToggleMenu(sub.id)} className="text-slate-400 hover:text-slate-600">
                                                                <EllipsisVerticalIcon className="h-5 w-5" />
                                                            </button>
                                                            {openMenuId === sub.id && (
                                                                <ActionMenu
                                                                    onEdit={() => handleOpenEditModal(sub, 'subcategory')}
                                                                    onDelete={() => handleDelete(sub, 'subcategory')}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleOpenAddSubCategoryModal(category)}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                                >
                                                    <PlusIcon className="h-5 w-5" />
                                                    Thêm Danh Mục Con
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Call modal component */}
            <AddCategoryModal
                isOpen={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                onAdd={handleAddCategory}
            />

            <EditCategoryModal
                isOpen={showEditCategoryModal}
                onClose={() => setShowEditCategoryModal(false)}
                Category={categoryObj}
                onEdit={handleEditCategory}
            />

            <AddSubCategoryModal
                isOpen={showAddSubCategoryModal}
                onClose={() => setShowAddSubCategoryModal(false)}
                onAdd={handleAddSubcategory}
                categoryId={categoryObj?.id}
            />

            <EditSubCategoryModal
                isOpen={showEditSubCategoryModal}
                onClose={() => setShowEditSubCategoryModal(false)}
                SubCategory={categoryObj}
                onEdit={handleEditSubCategory}
            />
        </>
    );
};

export default CategoryBuilder;