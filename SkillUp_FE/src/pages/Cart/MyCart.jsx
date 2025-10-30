import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApiUrl } from '../../config/api.js'; // Import config
import { axiosInstance } from '../../config/api.js'; // Import config
import {
    List,
    Button,
    Spin,
    Empty,
    Typography,
    Row,
    Col,
    Card,
    message,
    Image,
    Space,
    Tag, // Thêm Tag
    Rate, // Thêm Rate
    Divider, // Thêm Divider
    Input, // Thêm Input
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

// Định dạng tiền tệ
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Định dạng số (cho rating count)
const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

function MyCart() {
    const { id: accountId } = useParams();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm gọi API để lấy giỏ hàng (ĐÃ CHỈNH SỬA ĐỂ THÊM MOCK DATA)
    const fetchCart = async () => {
        setLoading(true);
        try {
            const apiUrlTemplate = getApiUrl('CART');
            const apiUrl = apiUrlTemplate.replace('{accountId}', accountId);
            const response = await axiosInstance.get(apiUrl);

            if (response.data && response.data.code === 200) {
                const originalCart = response.data.data[0];

                // --- BẮT ĐẦU MOCK DATA ---
                // Vì UI mẫu cần nhiều data hơn API của bạn có thể cung cấp
                // Chúng ta sẽ "thêm" dữ liệu giả vào đây
                const augmentedCartItems = originalCart.cartItems.map((item, index) => ({
                    ...item,
                    course: {
                        ...item.course,
                        // Thêm dữ liệu mock dựa trên index để có sự khác biệt
                        instructorName: index % 3 === 0 ? 'Bởi Dr. Angela Yu, Developer and Lead Instructor' : (index % 3 === 1 ? 'Bởi Jonas Schmedtmann' : 'Bởi PapaR, #1 HR Instructor'),
                        isBestseller: index % 3 === 0,
                        rating: index % 3 === 0 ? 4.7 : (index % 3 === 1 ? 4.6 : 4.9),
                        ratingCount: index % 3 === 0 ? 397747 : (index % 3 === 1 ? 456113 : 8100),
                        totalHours: index % 3 === 0 ? 56.5 : (index % 3 === 1 ? 61.5 : 6.5),
                        lectureCount: index % 3 === 0 ? 597 : (index % 3 === 1 ? 374 : 11),
                        level: 'All Levels',
                    }
                }));

                setCart({ ...originalCart, cartItems: augmentedCartItems });
                // --- KẾT THÚC MOCK DATA ---

            } else {
                throw new Error(response.data.message || "Không thể tải giỏ hàng");
            }
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải giỏ hàng:", err);
            if (err.response?.status === 404) {
                setCart({ cartItems: [] });
                setError(null);
            } else {
                setError("Lỗi khi tải giỏ hàng. Vui lòng thử lại.");
                message.error(err.message || "Lỗi khi tải giỏ hàng");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId) {
            fetchCart();
        } else {
            setError("Không tìm thấy thông tin tài khoản.");
            setLoading(false);
        }
    }, [accountId]);

    // Hàm xử lý xóa một item khỏi giỏ hàng (Không thay đổi)
    const handleRemoveItem = async (cartItemId) => {
        try {
            const apiUrlTemplate = getApiUrl('REMOVE_FROM_CART');
            const apiUrl = apiUrlTemplate.replace('{cartItemId}', cartItemId);
            await axiosInstance.delete(apiUrl);

            setCart(prevCart => ({
                ...prevCart,
                cartItems: prevCart.cartItems.filter(item => item.id !== cartItemId),
            }));

            message.success("Đã xóa khóa học khỏi giỏ hàng");

        } catch (err) {
            console.error("Lỗi khi xóa item:", err);
            message.error("Lỗi khi xóa khóa học. Vui lòng thử lại.");
        }
    };

    // Tính tổng tiền (Không thay đổi)
    const totalPrice = cart?.cartItems?.reduce((acc, item) => acc + item.price, 0) || 0;

    // --- RENDER LOGIC (Không thay đổi) ---
    if (loading) {
        return <Spin tip="Đang tải giỏ hàng..." fullscreen />;
    }

    if (error) {
        return <Typography.Title level={3} style={{ textAlign: 'center', color: 'red' }}>{error}</Typography.Title>;
    }

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return <Empty description="Giỏ hàng của bạn trống" style={{ marginTop: '50px' }} />;
    }

    // --- GIAO DIỆN ĐÃ THIẾT KẾ LẠI ---
    // (Dùng màu tím #8a2be2 để giống ảnh)
    const primaryColor = '#8a2be2';

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#fff' }}>
            <Typography.Title level={2} style={{ marginBottom: '20px' }}>
                Giỏ hàng
            </Typography.Title>

            <Row gutter={[48, 24]}>

                {/* Cột danh sách item */}
                <Col xs={24} lg={16}>
                    <Typography.Title level={5} style={{ fontWeight: 400, marginBottom: '20px' }}>
                        {cart.cartItems.length} khóa học trong giỏ hàng
                    </Typography.Title>

                    {/* Thay vì Card, dùng List cho đẹp hơn */}
                    <List
                        itemLayout="vertical"
                        dataSource={cart.cartItems}
                        renderItem={(item) => (
                            <List.Item
                                key={item.id}
                                style={{ padding: '16px 0' }}
                            >
                                <Row gutter={[16, 16]} wrap={false}>
                                    {/* Ảnh */}
                                    <Col flex="120px">
                                        <Image
                                            src={item.course.image}
                                            alt={item.course.title}
                                            preview={false}
                                            style={{
                                                width: '120px',
                                                height: '70px',
                                                objectFit: 'cover',
                                                border: '1px solid #d9d9d9'
                                            }}
                                        />
                                    </Col>

                                    {/* Thông tin khóa học (Tên, tác giả, rating...) */}
                                    <Col flex="auto" style={{ minWidth: '200px' }}>
                                        <Space direction="vertical" size="small">
                                            <Typography.Title level={5} style={{ margin: 0, fontWeight: 700 }} ellipsis={{ rows: 2 }}>
                                                {item.course.title}
                                            </Typography.Title>

                                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                {item.course.instructorName}
                                            </Typography.Text>

                                            {/* Hàng Rating */}
                                            <Space size="small" align="center" wrap>
                                                {item.course.isBestseller && <Tag color="gold">Bán chạy nhất</Tag>}
                                                <Typography.Text strong style={{ color: '#b4690e', fontSize: '14px' }}>{item.course.rating}</Typography.Text>
                                                <Rate disabled allowHalf value={item.course.rating} style={{ fontSize: '14px', position: 'relative', top: '-2px' }} />
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>({formatNumber(item.course.ratingCount)} xếp hạng)</Typography.Text>
                                            </Space>

                                            {/* Hàng Metadata (Giờ, bài giảng...) */}
                                            <Space size="middle" split={<span style={{ color: '#ccc', userSelect: 'none' }}>•</span>} style={{ fontSize: '12px', color: '#666' }}>
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>Tổng số {item.course.totalHours} giờ</Typography.Text>
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{item.course.lectureCount} bài giảng</Typography.Text>
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{item.course.level}</Typography.Text>
                                            </Space>

                                        </Space>
                                    </Col>

                                    {/* Nút (Xóa, Lưu,...) */}
                                    <Col flex="150px" style={{ textAlign: 'right' }}>
                                        <Space direction="vertical" align="end" size={0}>
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => handleRemoveItem(item.id)}
                                                style={{ padding: '4px 0', height: 'auto' }}
                                            >
                                                Xóa
                                            </Button>

                                        </Space>
                                    </Col>

                                    {/* Giá */}
                                    <Col flex="120px" style={{ textAlign: 'right' }}>
                                        <Typography.Title level={4} style={{ margin: 0, color: primaryColor, whiteSpace: 'nowrap' }}>
                                            {formatPrice(item.price)}
                                        </Typography.Title>
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                    />

                </Col>

                {/* Cột tổng tiền (Đã bỏ Card) */}
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: '24px' }}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                            <Typography.Text type="secondary" style={{ fontSize: '16px', fontWeight: 700 }}>Tổng:</Typography.Text>

                            <Typography.Title level={2} style={{ margin: 0, marginTop: '-10px', lineHeight: 1.2 }}>
                                {formatPrice(totalPrice)}
                            </Typography.Title>

                            <Button
                                type="primary"
                                size="large"
                                block
                                style={{
                                    backgroundColor: primaryColor,
                                    borderColor: primaryColor,
                                    height: '48px',
                                    fontWeight: 700
                                }}
                            >
                                Tiến hành thanh toán
                            </Button>

                            <Typography.Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
                                Bạn sẽ không bị tính phí ngay bây giờ
                            </Typography.Text>

                            <Divider />

                            <Typography.Title level={5} style={{ fontWeight: 700 }}>Khuyến mại</Typography.Title>

                            <Input.Search
                                placeholder="Nhập coupon"
                                enterButton={
                                    <Button type="primary" style={{ backgroundColor: primaryColor, borderColor: primaryColor, fontWeight: 700 }}>
                                        Áp dụng
                                    </Button>
                                }
                                size="large"
                                onSearch={(value) => {
                                    if (value) {
                                        message.success(`Đã áp dụng coupon: ${value}`);
                                    } else {
                                        message.warning('Vui lòng nhập mã coupon');
                                    }
                                }}
                            />

                        </Space>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default MyCart;