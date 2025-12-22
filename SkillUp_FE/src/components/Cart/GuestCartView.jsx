// Guest Cart Page Component - Hiển thị giỏ hàng cho guest users
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGuestCart, removeFromGuestCart } from '@/utils/guestCart';
import { axiosInstance } from '@/config/api';
import { List, Button, Empty, Typography, Row, Col, Image, Space, Alert, Spin } from 'antd';
import { useCart } from '@/context/CartContext';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const GuestCartView = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coursesData, setCoursesData] = useState({});
    const { fetchCartCount } = useCart();

    useEffect(() => {
        loadGuestCart();
    }, []);

    const loadGuestCart = async () => {
        setLoading(true);
        const guestCart = getGuestCart();
        setCart(guestCart);

        // Fetch thông tin chi tiết các khóa học
        const coursesInfo = {};
        for (const item of guestCart) {
            try {
                const response = await axiosInstance.get(`/Course/${item.courseId}`);
                if (response.data.code === 200) {
                    coursesInfo[item.courseId] = response.data.data[0];
                }
            } catch (error) {
                console.error(`Error fetching course ${item.courseId}:`, error);
            }
        }
        setCoursesData(coursesInfo);
        setLoading(false);
    };

    const handleRemoveItem = async (courseId) => {
        removeFromGuestCart(courseId);
        await fetchCartCount(); // cập nhật badge/cartCount ở header
        loadGuestCart();
    };

    const handleLogin = () => {
        navigate('/login');
    };

    if (loading) {
        return <Spin tip="Đang tải giỏ hàng..." fullscreen />;
    }

    if (cart.length === 0) {
        return (
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <Typography.Title level={2}>Giỏ hàng</Typography.Title>
                <Empty description="Giỏ hàng của bạn trống" />
            </div>
        );
    }

    const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#fff' }}>
            <Typography.Title level={2} style={{ marginBottom: '20px' }}>
                Giỏ hàng
            </Typography.Title>

            {/* Alert cho guest user */}
            <Alert
                message="Bạn đang xem giỏ hàng với tư cách khách"
                description={
                    <span>
                        Vui lòng <a onClick={handleLogin} style={{ cursor: 'pointer', fontWeight: 'bold' }}>đăng nhập</a> để tiếp tục mua hàng.
                        Các sản phẩm trong giỏ hàng sẽ được tự động chuyển sang tài khoản của bạn.
                    </span>
                }
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
            />

            <Row gutter={[48, 24]}>
                {/* Danh sách items */}
                <Col xs={24} lg={16}>
                    <Typography.Title level={5} style={{ fontWeight: 400, marginBottom: '20px' }}>
                        {cart.length} khóa học trong giỏ hàng
                    </Typography.Title>

                    <List
                        itemLayout="vertical"
                        dataSource={cart}
                        renderItem={(item) => {
                            const courseInfo = coursesData[item.courseId];
                            return (
                                <List.Item key={item.courseId} style={{ padding: '16px 0' }}>
                                    <Row gutter={[16, 16]} wrap={false}>
                                        {/* Image */}
                                        <Col flex="120px">
                                            {courseInfo?.image ? (
                                                <Image
                                                    src={courseInfo.image}
                                                    alt={courseInfo.title}
                                                    preview={false}
                                                    style={{
                                                        width: '120px',
                                                        height: '70px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '120px',
                                                    height: '70px',
                                                    backgroundColor: '#f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid #d9d9d9'
                                                }}>
                                                    <Typography.Text type="secondary">Khóa học</Typography.Text>
                                                </div>
                                            )}
                                        </Col>

                                        {/* Thông tin */}
                                        <Col flex="auto" style={{ minWidth: '200px' }}>
                                            <Space direction="vertical" size="small">
                                                <Typography.Title level={5} style={{ margin: 0, fontWeight: 700 }}>
                                                    {courseInfo?.title || `Khóa học #${item.courseId}`}
                                                </Typography.Title>
                                                {courseInfo?.lecturerName && (
                                                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                        Giáo viên: {courseInfo.lecturerName}
                                                    </Typography.Text>
                                                )}
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Thêm vào: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                                                </Typography.Text>
                                            </Space>
                                        </Col>

                                        {/* Nút xóa */}
                                        <Col flex="150px" style={{ textAlign: 'right' }}>
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => handleRemoveItem(item.courseId)}
                                                style={{ padding: '4px 0', height: 'auto' }}
                                            >
                                                Xóa
                                            </Button>
                                        </Col>

                                        {/* Giá */}
                                        <Col flex="120px" style={{ textAlign: 'right' }}>
                                            <Typography.Title level={4} style={{ margin: 0, color: '#FCCD04', whiteSpace: 'nowrap' }}>
                                                {formatPrice(item.price)}
                                            </Typography.Title>
                                        </Col>
                                    </Row>
                                </List.Item>
                            );
                        }}
                    />
                </Col>

                {/* Tổng tiền */}
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: '24px' }}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '16px', fontWeight: 700 }}>
                                Tổng:
                            </Typography.Text>

                            <Typography.Title level={2} style={{ margin: 0, marginTop: '-10px', lineHeight: 1.2 }}>
                                {formatPrice(totalPrice)}
                            </Typography.Title>

                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleLogin}
                                style={{
                                    backgroundColor: '#FCCD04',
                                    borderColor: '#FCCD04',
                                    height: '48px',
                                    fontWeight: 700
                                }}
                            >
                                Đăng nhập để thanh toán
                            </Button>

                            <Typography.Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
                                Đăng nhập để tiếp tục mua hàng
                            </Typography.Text>
                        </Space>
                    </div>
                </Col>
            </Row>
        </div>
    );
};
