import React, { useState, useMemo } from "react";
import { Modal, Table, Input, Select, Tag, Button, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

export default function ForumCategoryModal({ open, onClose, data, onAdd, onEdit, onDelete }) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = useMemo(() => {
    return data
      .filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter(item => {
        if (statusFilter === "") return true;
        return statusFilter === "true"
          ? item.isActive === true
          : item.isActive === false;
      });
  }, [data, searchText, statusFilter]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: isActive =>
        isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
      width: 120,
    },
    {
      title: "Actions",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete item?"
            description="This action cannot be undone."
            onConfirm={() => {
              onDelete(record.id);
              message.success("Deleted successfully.");
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    }
  ];

  return (
    <Modal
      title="Danh sách chuyên mục"
      open={open}
      onCancel={onClose}
      footer={null}
      width={650}
    >
      {/* Top Filters & Actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <Search
          placeholder="Tìm theo tên..."
          onChange={e => setSearchText(e.target.value)}
          style={{ flex: 1 }}
        />

        <Select
          placeholder="Trạng thái"
          style={{ width: 150 }}
          allowClear
          onChange={value => setStatusFilter(value ?? "")}
          options={[
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ]}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          Add New
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
}
