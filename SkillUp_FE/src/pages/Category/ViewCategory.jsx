import Table from "@/components/common/Table";
import React, { useState, useEffect } from "react";
import { axiosInstance, API_ENDPOINTS } from "@/config/api";
import { useNavigate } from "react-router-dom";

function ViewCategory() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    //fetch data
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.CATEGORY_LIST);
                setCategories(response.data.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCategories();
    }, []);

    //load data to table
    const columns = [
        { key: "id", title: "Category ID" },
        { key: "name", title: "Category Name" },
        {
            key: "isActive", title: "Status", render: (value) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                    {value ? "Active" : "Inactive"}
                </span>
            ),
        },
    ];

    const handleEdit = (item) => {
        console.log("Edit:", item);
    };

    const handleDelete = (id) => {
        console.log("Delete:", id);
    };

    return (
        <div>
            <h1>View Category Page</h1>
            <Table
                columns={columns}
                data={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default ViewCategory;