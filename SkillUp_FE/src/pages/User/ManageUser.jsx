import React, { useEffect, useState } from "react";
import { Table, Avatar, Button, Tag, Space, Input, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

const ManageUser = () => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("http://localhost:5120/api/User/All-Users");
      const data = response.data.data.flat();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user) => {
    try {
      if (user.status === "Active") {
        user.status = "Banned";
        toast.success("Đã cấm tài khoản.");
      } else if (user.status === "Banned") {
        user.status = "Active";
        toast.success("Đã bỏ cấm tài khoản.");
      } else if (user.status === "InActive") {
        console.log("User is inactive — no action taken.");
        return;
      }

      // Send id and status in the body
      await axiosInstance.put(
        "http://localhost:5120/api/User/update-status",
        {
          id: user.id,
          status: user.status
        }
      );

    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      fetchUsers();
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) =>
    [user.fullname, user.email].some((field) =>
      field?.toLowerCase().includes(searchText)
    )
  );

  const columns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",
      width: 90,
      render: (avatar, record) =>
        avatar ? (
          <Avatar src={avatar} />
        ) : (
          <Avatar>{record.fullname?.charAt(0)}</Avatar>
        ),
    },
    {
      title: "Họ Tên",
      dataIndex: "fullname",
      key: "fullname",
      width: 180,
      ellipsis: true,
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
      width: 120,
      filters: [
        { text: "Học sinh", value: "Student" },
        { text: "Giảng viên", value: "Lecturer" },
      ],
      onFilter: (value, record) => record.roleName === value,
      render: (role) => {
        let displayRole;
        switch (role) {
          case "Student":
            displayRole = "Học sinh";
            break;
          case "Lecturer":
            displayRole = "Giảng viên";
            break;
          default:
            displayRole = role;
        }
        return <Tag color="blue">{displayRole}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      filters: [
        { text: "Đang hoạt động", value: "Active" },
        { text: "Không hoạt động", value: "InActive" },
        { text: "Đã bị cấm", value: "Banned" },
        { text: "Chờ duyệt", value: "Pending" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        switch (status) {
          case "Active":
            return <Tag color="green">Đang hoạt động</Tag>;
          case "InActive":
            return <Tag color="orange">Không hoạt động</Tag>;
          case "Banned":
            return <Tag color="red">Đã bị cấm</Tag>;
          case "Pending":
            return <Tag color="blue">Chờ duyệt</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type={record.status === "Active" ? "default" : "primary"}
            danger={record.status === "Active"}
            disabled={record.status === "InActive" || record.status === "Pending"}
            onClick={() => {
              if (window.confirm(`Bạn có chắc chắn muốn đổi trạng thái tài khoản ${record.email}?`)) {
                handleToggleBan(record);
              }
            }}
            style={{ width: 150 }}
          >
            {record.status === "Active"
              ? "Cấm"
              : record.status === "Banned"
                ? "Bỏ cấm"
                : "Không khả dụng"}
          </Button>
        </Space>
      ),
    },
  ];


  return (
    <div style={{ padding: 20 }}>
      <Row style={{ marginBottom: 16 }} justify="space-between" align="middle">
        <Col>
          <Input
            placeholder="Search by name or email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredUsers}
        bordered
        pagination={{
          pageSize: 5,
        }}
      />
    </div>
  );
};

export default ManageUser;
