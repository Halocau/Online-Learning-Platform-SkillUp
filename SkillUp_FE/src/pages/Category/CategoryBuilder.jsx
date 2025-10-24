// src/components/CategoryBuilder.js

import React, { useState, useEffect } from 'react';
import { Bars3Icon, EllipsisVerticalIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import ActionMenu from '@/components/common/ActionMenu';
import FormModal from '@/components/common/FormModal';
import { axiosInstance, API_ENDPOINTS } from "@/config/api";

// Main Component
const CategoryBuilder = () => {
    // const [categories, setCategories] = useState([]);
    //fetch data
    // const fetchCategories = async () => {
    //     try {
    //         const response = await axiosInstance.get(API_ENDPOINTS.CATEGORY_LIST);
    //         setCategories(response.data.data);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };
    // //thieu sub category vi api chua include
    // useEffect(() => {
    //     fetchCategories();
    // }, []);

    const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', subcategories: [{ id: 101, name: 'Smartphones' }, { id: 102, name: 'Laptops' }] },
    { id: 2, name: 'Books', subcategories: [{ id: 201, name: 'Science Fiction' }] },
  ]);

    // State to track which dropdown menu is open
    const [openMenuId, setOpenMenuId] = useState(null);

    // State for the confirmation modal
    const [modalState, setModalState] = useState({ isOpen: false, item: null, type: null });

    // --- Handlers ---

    const handleAddCategory = () => {
        const newCategory = { id: Date.now(), name: `New Category ${categories.length + 1}`, subcategories: [] };
        setCategories([...categories, newCategory]);
    };

    const handleAddSubcategory = (categoryId) => {
        setCategories(categories.map(cat =>
            cat.id === categoryId
                ? { ...cat, subcategories: [...cat.subcategories, { id: Date.now(), name: 'New Subcategory' }] }
                : cat
        ));
    };

    // Toggle the action menu for a given item
    const handleToggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Generic edit handler (can be expanded later)
    const handleEdit = (item, type) => {
        console.log(`Editing ${type}:`, item);
        // Add your logic to open an edit form/modal here
        setOpenMenuId(null); // Close menu after action
    };

    // Opens the confirmation modal
    const handleOpenDeleteModal = (item, type) => {
        setModalState({ isOpen: true, item, type });
        setOpenMenuId(null); // Close menu
    };

    // Closes the confirmation modal
    const handleCloseModal = () => {
        setModalState({ isOpen: false, item: null, type: null });
    };

    // Deletes the item after confirmation
    const handleConfirmDelete = () => {
        if (!modalState.item) return;

        if (modalState.type === 'category') {
            setCategories(categories.filter(cat => cat.id !== modalState.item.id));
        } else if (modalState.type === 'subcategory') {
            setCategories(categories.map(cat => ({
                ...cat,
                subcategories: cat.subcategories.filter(sub => sub.id !== modalState.item.id),
            })));
        }
        handleCloseModal();
    };

    return (
        <>
            <div className="bg-slate-50 min-h-screen font-sans">
                <div className="container mx-auto max-w-6xl p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <main className="md:col-span-3">
                            <h1 className="text-3xl font-bold text-slate-800">Category Builder</h1>
                            <p className="mt-2 text-slate-500">
                                Structure your product catalog by creating categories and subcategories.
                            </p>

                            <div className="mt-8">
                                <button
                                    onClick={handleAddCategory}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Add Category
                                </button>

                                <div className="mt-6 space-y-4">
                                    {categories.map((category) => (
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
                                                            onEdit={() => handleEdit(category, 'category')}
                                                            onDelete={() => handleOpenDeleteModal(category, 'category')}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 ml-4 space-y-3 border-l-2 border-slate-200 pl-6">
                                                {category.subcategories.map((sub) => (
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
                                                                    onEdit={() => handleEdit(sub, 'subcategory')}
                                                                    onDelete={() => handleOpenDeleteModal(sub, 'subcategory')}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleAddSubcategory(category.id)}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                                >
                                                    <PlusIcon className="h-5 w-5" />
                                                    Add Subcategory
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

            {/* Render the modal conditionally */}
            {/* <FormModal
        isOpen={modalState.isOpen}
        itemName={modalState.item?.name}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      /> */}
        </>
    );
};

export default CategoryBuilder;