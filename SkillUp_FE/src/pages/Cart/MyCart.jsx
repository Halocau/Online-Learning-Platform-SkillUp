import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../config/api.js';
import { axiosInstance } from '../../config/api.js';
import { GuestCartView } from '@/components/Cart/GuestCartView';
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
    Tag,
    Rate,
    Divider,
    Input,
} from 'antd';

// Định dạng tiền tệ
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Định dạng số (cho rating/enrollment)
const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

function MyCart() {
    // Get user from localStorage (decoded from JWT)
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const accountId = user?.userId;
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm gọi API để lấy giỏ hàng
    const fetchCart = async () => {
        setLoading(true);
        try {
            console.log('🛒 Fetching cart for accountId:', accountId); // DEBUG
            
            // Giả sử key trong config của bạn là 'CART'
            const apiUrlTemplate = getApiUrl('CART');
            const apiUrl = apiUrlTemplate.replace('{accountId}', accountId);
            
            console.log('📡 API URL:', apiUrl); // DEBUG
            
            const response = await axiosInstance.get(apiUrl);
            
            console.log('📦 Cart API Response:', response.data); // DEBUG

            if (response.data && response.data.code === 200) {
                // --- BỎ MOCK DATA ---
                // Lấy dữ liệu giỏ hàng gốc trực tiếp
                const originalCart = response.data.data[0];
                console.log('✅ Cart loaded:', originalCart); // DEBUG
                
                // Nếu cart null hoặc undefined → set cart rỗng
                if (!originalCart) {
                    setCart({ cartItems: [] });
                } else {
                    setCart(originalCart);
                }
                // --- KẾT THÚC SỬA ĐỔI ---

            } else {
                throw new Error(response.data.message || "Không thể tải giỏ hàng");
            }
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải giỏ hàng:", err);
            console.error("Error response:", err.response); // DEBUG
            
            // Xử lý 404 (Không tìm thấy giỏ hàng) bằng cách hiển thị giỏ hàng trống
            if (err.response?.status === 404) {
                setCart({ cartItems: [] }); // Set giỏ hàng rỗng
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
        // Chỉ fetch nếu có accountId (logged-in user)
        if (accountId) {
            fetchCart();
        } else {
            // Guest user - không cần fetch
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // --- RENDER LOGIC ---
    
    // Kiểm tra nếu không có accountId => Guest user
    if (!accountId) {
        return <GuestCartView />;
    }
    
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
    const primaryColor = '#FCCD04'; // Màu tím chủ đạo

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
                                                {/* SỬA: Dùng lecturerName từ API */}
                                                Giáo viên:  {item.course.lecturerName}
                                            </Typography.Text>

                                            {/* Hàng Rating (ĐÃ SỬA) */}
                                            <Space size="small" align="center" wrap>
                                                {/* ẨN: isBestseller (Không có trong API) */}

                                                <Typography.Text strong style={{ color: '#b4690e', fontSize: '14px' }}>{item.course.rating}</Typography.Text>
                                                <Rate disabled allowHalf value={item.course.rating} style={{ fontSize: '14px', position: 'relative', top: '-2px' }} />

                                                {/* SỬA: Dùng enrollmentCount và đổi text */}
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                    ({formatNumber(item.course.enrollmentCount)} học viên)
                                                </Typography.Text>
                                            </Space>

                                            {/* ẨN: Hàng Metadata (totalHours, lectureCount, level không có trong API) */}

                                        </Space>
                                    </Col>

                                    {/* Nút (Xóa,...) */}
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

                {/* Cột tổng tiền (Không thay đổi) */}
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

                        </Space>
                    </div>
                </Col>

            </Row>
        </div>
    );
}

export default MyCart;
