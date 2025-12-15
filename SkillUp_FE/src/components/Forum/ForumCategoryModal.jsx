import React, { useState, useMemo } from "react";
import { Modal, Table, Input, Select, Tag, Button, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, CheckOutlined } from "@ant-design/icons";
import axiosInstance from "@/lib/axios.js";
import { API_BASE_URL } from "@/config/api";
import { toast } from "react-toastify";

const { Search } = Input;

export default function ForumCategoryModal({ open, onClose, data, onEdit, onToggle }) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createData, setCreateData] = useState({
    id: 0,
    name: "",
    isActive: true
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
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

  const onCloseEdit = () => {
    setEditOpen(false);
    setEditData(null);
  };

  const onCloseCreate = () => {
    setCreateOpen(false);
    setCreateData(null);
  };

  const onSaveEdit = async () => {
    try {
      if (!editData.name || editData.name.trim().length < 1) {
        return toast.error("Tên danh mục phải có ít nhất 1 ký tự!");
      }

      await axiosInstance.put(`${API_BASE_URL}/ForumCategory/update/${editData.id}`, editData);

      toast.success("Cập nhật thành công!");

    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setEditOpen(false);
      onEdit();
    }
  };

  const onCreate = async () => {
    try {
      if (!createData.name || createData.name.trim().length < 1) {
        return toast.error("Tên chuyên mục phải có ít nhất 1 ký tự!");
      }

      const response = await axiosInstance.post(
        `${API_BASE_URL}/ForumCategory/create`,
        createData
      );

      toast.success("Tạo danh mục thành công");

      onCloseCreate();
      setCreateData({ name: "", isActive: true }); // reset
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo chuyên mục thất bại. Vui lòng thử lại.");
    } finally {
      setCreateOpen(false);
      onEdit();
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: isActive =>
        isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Đã tắt</Tag>,
      width: 120,
    },
    {
      title: "Hành động",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => { setEditData(record), setEditOpen(true) }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Thay đổi trạng thái?"
            onConfirm={() => {
              onToggle(record);
              message.success("Đã thay đổi trạng thái danh mục!");
            }}
            okText="Có"
            cancelText="Không"
          >
            {record.isActive ? (
              <Button danger icon={<DeleteOutlined />} size="small">
                Tắt
              </Button>
            ) : (
              <Button
                type="default"
                style={{
                  color: "#52c41a",
                  borderColor: "#52c41a",
                }}
                icon={<CheckOutlined />}
                size="small"
              >
                Bật
              </Button>
            )}
          </Popconfirm>
        </div>
      ),
    }
  ];

  return (
    <>
      <Modal
        title="Danh sách danh mục"
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
            onClick={() => setCreateOpen(true)}
          >
            Thêm mới
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

      <Modal
        title="Chỉnh sửa danh mục"
        open={editOpen}
        onCancel={onCloseEdit}
        onOk={onSaveEdit}
        okText="Lưu"
        cancelText="Hủy"
        width={450}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {/* Name Field */}
          <div>
            <label style={{ fontWeight: 500 }}>Tên danh mục</label>
            <Input
              value={editData?.name}
              maxLength={50}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nhập tên danh mục..."
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ fontWeight: 500 }}>Trạng thái</label>
            <Select
              value={editData?.isActive?.toString()}
              onChange={(value) =>
                setEditData((prev) => ({ ...prev, isActive: value === "true" }))
              }
              style={{ width: "100%" }}
              options={[
                { label: "Hoạt động", value: "true" },
                { label: "Đã tắt", value: "false" },
              ]}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Tạo danh mục mới"
        open={createOpen}
        onCancel={onCloseCreate}
        onOk={onCreate}
        okText="Lưu"
        cancelText="Hủy"
        width={450}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>

          {/* Name Field */}
          <div>
            <label style={{ fontWeight: 500 }}>Tên danh mục</label>
            <Input
              value={createData.name}
              maxLength={50}
              placeholder="Nhập tên danh mục..."
              onChange={(e) =>
                setCreateData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ fontWeight: 500 }}>Trạng thái</label>
            <Select
              value={createData.isActive.toString()}
              style={{ width: "100%" }}
              onChange={(value) =>
                setCreateData((prev) => ({
                  ...prev,
                  isActive: value === "true"
                }))
              }
              options={[
                { label: "Hoạt động", value: "true" },
                { label: "Đã tắt", value: "false" },
              ]}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
