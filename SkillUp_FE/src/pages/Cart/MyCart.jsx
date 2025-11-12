import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGuestCart, removeFromGuestCart } from '@/utils/guestCart';
import { useCart } from '@/context/CartContext';
import { courseAPI } from '@/api/courseAPI';
import { cartAPI } from '@/api/cartAPI';
import {
    List,
    Button,
    Spin,
    Empty,
    Typography,
    Row,
    Col,
    message,
    Image,
    Space,
    Tag,
    Rate,
    Divider,
    Input,
    Alert,
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
    const { id: accountIdFromParams } = useParams();
    const navigate = useNavigate();
    const { fetchCartCount } = useCart();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm lấy user hiện tại
    const getCurrentUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user:', error);
            return null;
        }
    };

    // Lấy accountId: ưu tiên từ URL, fallback sang localStorage
    const getAccountId = () => {
        if (accountIdFromParams && accountIdFromParams !== 'undefined') {
            return accountIdFromParams;
        }
        const user = getCurrentUser();
        return user?.userId;
    };

    const accountId = getAccountId();

    // Hàm lấy giỏ hàng guest từ localStorage
    const fetchGuestCart = async () => {
        setLoading(true);
        try {
            const guestCartItems = getGuestCart();

            if (guestCartItems.length === 0) {
                setCart({ cartItems: [] });
                setError(null);
                setLoading(false);
                return;
            }

            // Fetch thông tin chi tiết các courses từ API
            const cartItemsPromises = guestCartItems.map(async (item) => {
                try {
                    const response = await courseAPI.getCourseDetail(item.courseId);

                    // Kiểm tra nhiều structure có thể
                    let courseData = null;
                    if (response?.data?.data?.[0]) {
                        courseData = response.data.data[0]; // Structure: {data: {data: [course]}}
                    } else if (response?.data?.data) {
                        courseData = response.data.data; // Structure: {data: {data: course}}
                    } else if (response?.data) {
                        courseData = response.data; // Structure: {data: course}
                    }

                    if (courseData) {
                        return {
                            id: item.courseId,
                            courseId: item.courseId,
                            price: item.price,
                            course: {
                                title: courseData.title || 'N/A',
                                image: courseData.image || '',
                                rating: courseData.rating || 0,
                                enrollmentCount: courseData.enrollmentCount || 0,
                                lecturerName: courseData.lecturerName || courseData.lecturer?.fullName || 'N/A',
                            }
                        };
                    } else {
                        // Fallback nếu không fetch được
                        return {
                            id: item.courseId,
                            courseId: item.courseId,
                            price: item.price,
                            course: {
                                title: 'Không thể tải thông tin khóa học',
                                image: '',
                                rating: 0,
                                enrollmentCount: 0,
                                lecturerName: 'N/A',
                            }
                        };
                    }
                } catch (error) {
                    console.error(`Lỗi khi fetch course ${item.courseId}:`, error);
                    // Fallback nếu có lỗi
                    return {
                        id: item.courseId,
                        courseId: item.courseId,
                        price: item.price,
                        course: {
                            title: 'Không thể tải thông tin khóa học',
                            image: '',
                            rating: 0,
                            enrollmentCount: 0,
                            lecturerName: 'N/A',
                        }
                    };
                }
            });

            const cartItemsWithDetails = await Promise.all(cartItemsPromises);

            setCart({
                cartItems: cartItemsWithDetails
            });
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải guest cart:', err);
            setError('Lỗi khi tải giỏ hàng.');
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API để lấy giỏ hàng từ server
    const fetchServerCart = useCallback(async () => {
        setLoading(true);
        try {
            const response = await cartAPI.getCart(accountId);

            if (response.data && response.data.code === 200) {
                const originalCart = response.data.data[0];
                setCart(originalCart);
                setError(null);
            } else {
                throw new Error(response.data.message || "Không thể tải giỏ hàng");
            }
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
    }, [accountId]);

    useEffect(() => {
        const user = getCurrentUser();

        // Redirect nếu user đã login nhưng URL không có userId hoặc có undefined
        if (user?.userId && (!accountIdFromParams || accountIdFromParams === 'undefined')) {
            navigate(`/cart/${user.userId}`, { replace: true });
            return;
        }

        if (!user) {
            // Nếu chưa đăng nhập, hiển thị guest cart
            fetchGuestCart();
        } else if (accountId) {
            // Nếu đã đăng nhập và có accountId, fetch từ server
            fetchServerCart();
        } else {
            setError("Không tìm thấy thông tin tài khoản.");
            setLoading(false);
        }
    }, [accountId, accountIdFromParams, fetchServerCart, navigate]);    // Hàm xử lý xóa một item khỏi giỏ hàng
    const handleRemoveItem = async (cartItemId, courseId) => {
        try {
            const user = getCurrentUser();

            if (!user) {
                // Guest cart: xóa từ localStorage
                removeFromGuestCart(courseId || cartItemId);
                setCart(prevCart => ({
                    ...prevCart,
                    cartItems: prevCart.cartItems.filter(item =>
                        item.courseId !== (courseId || cartItemId)
                    ),
                }));
                message.success("Đã xóa khóa học khỏi giỏ hàng");
                fetchCartCount(); // Cập nhật số lượng cart
            } else {
                // Logged in cart: xóa từ server
                await cartAPI.removeFromCart(cartItemId);

                setCart(prevCart => ({
                    ...prevCart,
                    cartItems: prevCart.cartItems.filter(item => item.id !== cartItemId),
                }));

                message.success("Đã xóa khóa học khỏi giỏ hàng");
                fetchCartCount(); // Cập nhật số lượng cart
            }
        } catch (err) {
            console.error("Lỗi khi xóa item:", err);
            message.error("Lỗi khi xóa khóa học. Vui lòng thử lại.");
        }
    };

    // Hàm xử lý thanh toán
    const handleCheckout = () => {
        const user = getCurrentUser();

        if (!user) {
            // Lưu current path để redirect về sau khi login
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            message.warning('Vui lòng đăng nhập để thanh toán');
            navigate('/login');
            return;
        }

        // Navigate to checkout page
        navigate('/checkout');
    };

    // Tính tổng tiền (Không thay đổi)
    const totalPrice = cart?.cartItems?.reduce((acc, item) => acc + item.price, 0) || 0;

    // --- RENDER LOGIC ---
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
    const user = getCurrentUser();

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#fff' }}>
            <Typography.Title level={2} style={{ marginBottom: '20px' }}>
                Giỏ hàng
            </Typography.Title>

            {/* Thông báo cho guest users */}
            {!user && (
                <Alert
                    message="Bạn chưa đăng nhập"
                    description="Giỏ hàng của bạn đang được lưu tạm thời. Vui lòng đăng nhập để thanh toán và đồng bộ giỏ hàng của bạn."
                    type="info"
                    showIcon
                    closable
                    style={{ marginBottom: '20px' }}
                    action={
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                                localStorage.setItem('redirectAfterLogin', window.location.pathname);
                                navigate('/login');
                            }}
                        >
                            Đăng nhập
                        </Button>
                    }
                />
            )}

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
                                                onClick={() => handleRemoveItem(item.id, item.courseId)}
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
                                onClick={handleCheckout}
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