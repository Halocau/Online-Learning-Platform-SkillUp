import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getApiUrl } from '../../config/api.js';
import { axiosInstance } from '../../config/api.js';
import { GuestCartView } from '@/components/Cart/GuestCartView';
import { voucherAPI } from '../../api/voucherAPI.js';
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
    Popover,
    Badge,
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
    // Voucher cho từng khóa học: { courseId: { voucherCode, appliedVoucher, discountAmount, applying } }
    const [courseVouchers, setCourseVouchers] = useState({});
    // Danh sách voucher có sẵn cho từng khóa học: { courseId: [vouchers] }
    const [availableVouchers, setAvailableVouchers] = useState({});
    const [loadingVouchers, setLoadingVouchers] = useState({});
    // State để control popover visibility
    const [popoverVisible, setPopoverVisible] = useState({});

    // Hàm gọi API để lấy giỏ hàng
    const fetchCart = async () => {
        setLoading(true);
        try {
            const apiUrlTemplate = getApiUrl('CART');
            const apiUrl = apiUrlTemplate.replace('{accountId}', accountId);

            const response = await axiosInstance.get(apiUrl);

            if (response.data && response.data.code === 200) {
                const originalCart = response.data.data[0];

                // Nếu cart null hoặc undefined → set cart rỗng
                if (!originalCart) {
                    setCart({ cartItems: [] });
                } else {
                    setCart(originalCart);
                }

            } else {
                throw new Error(response.data.message || "Không thể tải giỏ hàng");
            }
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải giỏ hàng:", err);

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

    // Hàm lọc voucher còn hiệu lực (so sánh cả ngày và giờ)
    const filterValidVouchers = useCallback((vouchers) => {
        if (!vouchers || vouchers.length === 0) return [];
        const now = new Date();
        return vouchers.filter(v => {
            if (!v.isActive) return false;

            // Parse và so sánh với cả giờ, phút, giây
            if (v.startTime) {
                const startTime = new Date(v.startTime);
                // So sánh cả ngày và giờ (getTime() so sánh milliseconds)
                if (now.getTime() < startTime.getTime()) {
                    return false;
                }
            }

            if (v.endTime) {
                const endTime = new Date(v.endTime);
                // So sánh cả ngày và giờ (getTime() so sánh milliseconds)
                if (now.getTime() > endTime.getTime()) {
                    return false;
                }
            }

            return true;
        });
    }, []);

    // Fetch voucher cho tất cả khóa học trong cart (batch API)
    const fetchAllCourseVouchers = useCallback(async (cartItems) => {
        if (!cartItems || cartItems.length === 0) return;

        const courseIds = cartItems.map(item => {
            return item.courseId || item.course?.id || item.course?.courseId;
        }).filter(id => id != null && id !== undefined);

        if (courseIds.length === 0) return;

        // Set loading state cho tất cả courses
        const loadingState = {};
        courseIds.forEach(id => { loadingState[id] = true; });
        setLoadingVouchers(prev => ({ ...prev, ...loadingState }));

        try {
            const response = await voucherAPI.getCourseVouchersBatch(courseIds);
            if (response.data && response.data.code === 200) {
                const vouchersDict = response.data.data[0] || {};
                const newAvailableVouchers = {};

                // Lọc và lưu voucher hợp lệ cho từng course
                Object.keys(vouchersDict).forEach(courseId => {
                    const courseIdGuid = courseIds.find(id => id.toString() === courseId || id === courseId);
                    if (courseIdGuid) {
                        newAvailableVouchers[courseIdGuid] = filterValidVouchers(vouchersDict[courseId] || []);
                    }
                });

                // Đảm bảo tất cả courseIds đều có trong state (kể cả không có voucher)
                courseIds.forEach(id => {
                    if (!newAvailableVouchers[id]) {
                        newAvailableVouchers[id] = [];
                    }
                });

                setAvailableVouchers(prev => ({ ...prev, ...newAvailableVouchers }));
            }
        } catch (err) {
            console.error("Lỗi khi tải voucher:", err);
            // Set empty array cho tất cả courses nếu có lỗi
            const emptyVouchers = {};
            courseIds.forEach(id => { emptyVouchers[id] = []; });
            setAvailableVouchers(prev => ({ ...prev, ...emptyVouchers }));
        } finally {
            // Clear loading state
            const clearLoadingState = {};
            courseIds.forEach(id => { clearLoadingState[id] = false; });
            setLoadingVouchers(prev => ({ ...prev, ...clearLoadingState }));
        }
    }, [filterValidVouchers]);

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

    // Fetch voucher khi cart được load
    useEffect(() => {
        if (cart && cart.cartItems && cart.cartItems.length > 0) {
            fetchAllCourseVouchers(cart.cartItems);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart]);

    // Hàm xử lý xóa một item khỏi giỏ hàng
    const handleRemoveItem = async (cartItemId) => {
        try {
            const apiUrlTemplate = getApiUrl('REMOVE_FROM_CART');
            const apiUrl = apiUrlTemplate.replace('{cartItemId}', cartItemId);

            // Tìm courseId của item trước khi xóa để xóa voucher tương ứng
            const itemToRemove = cart?.cartItems?.find(item => item.id === cartItemId);
            const courseId = itemToRemove?.courseId || itemToRemove?.course?.id || itemToRemove?.course?.courseId;

            await axiosInstance.delete(apiUrl);

            setCart(prevCart => ({
                ...prevCart,
                cartItems: prevCart.cartItems.filter(item => item.id !== cartItemId),
            }));

            // Xóa voucher của khóa học này nếu có
            if (courseId) {
                setCourseVouchers(prev => {
                    const newState = { ...prev };
                    delete newState[courseId];
                    return newState;
                });
            }

            message.success("Đã xóa khóa học khỏi giỏ hàng");

        } catch (err) {
            console.error("Lỗi khi xóa item:", err);
            message.error("Lỗi khi xóa khóa học. Vui lòng thử lại.");
        }
    };

    // Tính tổng tiền - sử dụng useMemo để tối ưu
    const totalPrice = useMemo(() => {
        return cart?.cartItems?.reduce((acc, item) => acc + item.price, 0) || 0;
    }, [cart?.cartItems]);

    // Tính tổng discount từ tất cả các voucher - sử dụng useMemo để tối ưu
    const totalCourseDiscount = useMemo(() => {
        return Object.values(courseVouchers).reduce((acc, voucher) => {
            return acc + (voucher.discountAmount || 0);
        }, 0);
    }, [courseVouchers]);

    const totalDiscount = useMemo(() => {
        return totalCourseDiscount;
    }, [totalCourseDiscount]);

    const finalPrice = useMemo(() => {
        return Math.max(0, totalPrice - totalDiscount);
    }, [totalPrice, totalDiscount]);


    // Hàm xử lý áp dụng voucher cho một khóa học cụ thể (từ input hoặc từ danh sách)
    const handleApplyCourseVoucher = useCallback(async (courseId, coursePrice, voucherCodeToApply = null, closePopover = false) => {
        // Lấy voucher code từ parameter hoặc state
        let codeToUse = voucherCodeToApply;
        if (!codeToUse) {
            // Đọc từ state hiện tại bằng functional update
            let foundCode = null;
            setCourseVouchers(prev => {
                const voucherData = prev[courseId];
                foundCode = voucherData?.voucherCode?.trim();
                return prev; // Không thay đổi state
            });
            codeToUse = foundCode;

            // Nếu vẫn không có, return
            if (!codeToUse) {
                message.warning('Vui lòng nhập mã giảm giá hoặc chọn từ danh sách');
                return;
            }
        }

        // Set applying state cho khóa học này
        setCourseVouchers(prev => ({
            ...prev,
            [courseId]: {
                ...prev[courseId],
                applying: true
            }
        }));

        try {
            const response = await voucherAPI.validateVoucher(
                codeToUse,
                [courseId],
                coursePrice
            );

            if (response.data && response.data.code === 200) {
                const voucherDataResponse = response.data.data[0];
                const isValid = voucherDataResponse?.IsValid ?? voucherDataResponse?.isValid ?? false;
                const voucher = voucherDataResponse?.Voucher ?? voucherDataResponse?.voucher;
                const discountAmount = voucherDataResponse?.DiscountAmount ?? voucherDataResponse?.discountAmount ?? 0;
                const messageText = voucherDataResponse?.Message ?? voucherDataResponse?.message;

                if (voucherDataResponse && isValid) {
                    setCourseVouchers(prev => ({
                        ...prev,
                        [courseId]: {
                            voucherCode: codeToUse,
                            appliedVoucher: voucher,
                            discountAmount: discountAmount,
                            applying: false
                        }
                    }));
                    message.success(messageText || 'Áp dụng mã giảm giá thành công!');
                    // Đóng popover nếu được yêu cầu
                    if (closePopover) {
                        setPopoverVisible(prev => ({
                            ...prev,
                            [courseId]: false
                        }));
                    }
                } else {
                    throw new Error(messageText || 'Mã giảm giá không hợp lệ');
                }
            } else {
                throw new Error(response.data?.message || 'Mã giảm giá không hợp lệ');
            }
        } catch (err) {
            console.error("Lỗi khi áp dụng voucher:", err);
            const errorMessage = err.response?.data?.message || err.message || "Không thể áp dụng mã giảm giá. Vui lòng thử lại.";
            message.error(errorMessage);
            setCourseVouchers(prev => ({
                ...prev,
                [courseId]: {
                    ...prev[courseId],
                    appliedVoucher: null,
                    discountAmount: 0,
                    applying: false
                }
            }));
        }
    }, []);

    // Hàm xử lý xóa voucher cho một khóa học
    const handleRemoveCourseVoucher = useCallback((courseId) => {
        setCourseVouchers(prev => {
            const newState = { ...prev };
            delete newState[courseId];
            return newState;
        });
        message.info('Đã xóa mã giảm giá');
    }, []);

    // Hàm xử lý thay đổi voucher code cho một khóa học
    const handleCourseVoucherCodeChange = useCallback((courseId, value) => {
        setCourseVouchers(prev => ({
            ...prev,
            [courseId]: {
                ...prev[courseId],
                voucherCode: value.toUpperCase(),
                appliedVoucher: null,
                discountAmount: 0
            }
        }));
    }, []);

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
    const primaryColor = '#FCCD04'; // Màu vàng chủ đạo

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
            background: '#fff'
        }}>
            <Typography.Title level={2} style={{ marginBottom: '24px', fontWeight: 600 }}>
                Giỏ hàng
            </Typography.Title>

            <Row gutter={[32, 24]}>

                {/* Cột danh sách item */}
                <Col xs={24} lg={16}>
                    <Typography.Text type="secondary" style={{ fontSize: '14px', marginBottom: '16px', display: 'block' }}>
                        {cart.cartItems.length} khóa học trong giỏ hàng
                    </Typography.Text>

                    <List
                        itemLayout="vertical"
                        dataSource={cart.cartItems}
                        split={true}
                        renderItem={(item) => (
                            <List.Item
                                key={item.id}
                                style={{
                                    padding: '20px 0',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
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
                                                borderRadius: '6px',
                                                border: '1px solid #e8e8e8'
                                            }}
                                        />
                                    </Col>

                                    {/* Thông tin khóa học (Tên, tác giả, rating...) */}
                                    <Col flex="auto" style={{ minWidth: '200px' }}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }} ellipsis={{ rows: 2 }}>
                                                {item.course.title}
                                            </Typography.Title>

                                            <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                                                Giáo viên: {item.course.lecturerName}
                                            </Typography.Text>

                                            {/* Hàng Rating */}
                                            <Space size="small" align="center" wrap>
                                                <Typography.Text strong style={{ color: '#fa8c16', fontSize: '14px' }}>
                                                    {item.course.rating}
                                                </Typography.Text>
                                                <Rate
                                                    disabled
                                                    allowHalf
                                                    value={item.course.rating}
                                                    style={{ fontSize: '14px' }}
                                                />
                                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                    ({formatNumber(item.course.enrollmentCount)} học viên)
                                                </Typography.Text>
                                            </Space>

                                            {/* Voucher input cho từng khóa học */}
                                            <div style={{ marginTop: '8px', width: '100%' }}>
                                                {(() => {
                                                    const courseId = item.courseId || item.course?.id || item.course?.courseId;
                                                    const voucherData = courseVouchers[courseId] || {};
                                                    const hasAppliedVoucher = voucherData.appliedVoucher;
                                                    const vouchers = availableVouchers[courseId] || [];
                                                    const isLoadingVouchers = loadingVouchers[courseId];

                                                    // Tính discount cho mỗi voucher
                                                    const calculateVoucherDiscount = (voucher, coursePrice) => {
                                                        // Nếu có percentage thì tính theo phần trăm
                                                        if (voucher.percentage > 0) {
                                                            const discount = coursePrice * (voucher.percentage / 100);
                                                            return Math.min(discount, coursePrice);
                                                        } else if (voucher.price) {
                                                            // Nếu không có percentage thì dùng price như số tiền giảm cố định
                                                            return Math.min(voucher.price, coursePrice);
                                                        }
                                                        return 0;
                                                    };

                                                    return hasAppliedVoucher ? (
                                                        <div style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: '#f6ffed',
                                                            border: '1px solid #b7eb8f',
                                                            borderRadius: '6px',
                                                            width: '100%'
                                                        }}>
                                                            <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Space size="small" align="center">
                                                                    <Tag
                                                                        color="success"
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            padding: '2px 8px',
                                                                            margin: 0,
                                                                            borderRadius: '4px',
                                                                            fontWeight: 600
                                                                        }}
                                                                    >
                                                                        {voucherData.appliedVoucher.couponCode}
                                                                    </Tag>
                                                                    <Typography.Text type="success" style={{ fontSize: '12px', fontWeight: 500 }}>
                                                                        Giảm: {formatPrice(voucherData.discountAmount || 0)}
                                                                    </Typography.Text>
                                                                </Space>
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    size="small"
                                                                    onClick={() => handleRemoveCourseVoucher(courseId)}
                                                                    style={{
                                                                        padding: '0 4px',
                                                                        height: '20px',
                                                                        fontSize: '12px',
                                                                        minWidth: 'auto'
                                                                    }}
                                                                >
                                                                    ✕
                                                                </Button>
                                                            </Space>
                                                        </div>
                                                    ) : (
                                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                            <Space size="small" style={{ width: '100%' }}>
                                                                <Input
                                                                    placeholder="Mã giảm giá"
                                                                    value={voucherData.voucherCode || ''}
                                                                    onChange={(e) => handleCourseVoucherCodeChange(courseId, e.target.value)}
                                                                    onPressEnter={() => handleApplyCourseVoucher(courseId, item.price)}
                                                                    disabled={voucherData.applying}
                                                                    size="small"
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <Button
                                                                    type="primary"
                                                                    size="small"
                                                                    onClick={() => handleApplyCourseVoucher(courseId, item.price)}
                                                                    loading={voucherData.applying}
                                                                    style={{
                                                                        backgroundColor: primaryColor,
                                                                        borderColor: primaryColor,
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    Áp dụng
                                                                </Button>
                                                            </Space>
                                                            {vouchers.length > 0 && (
                                                                <Popover
                                                                    content={
                                                                        <div style={{ maxWidth: '300px' }}>
                                                                            <Typography.Text strong style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                                                                                Voucher có sẵn:
                                                                            </Typography.Text>
                                                                            <Space direction="vertical" size="small" style={{ width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
                                                                                {vouchers.map((voucher) => {
                                                                                    const discount = calculateVoucherDiscount(voucher, item.price);
                                                                                    const isPercentage = voucher.percentage > 0;
                                                                                    return (
                                                                                        <div
                                                                                            key={voucher.id}
                                                                                            style={{
                                                                                                padding: '8px',
                                                                                                border: '1px solid #d9d9d9',
                                                                                                borderRadius: '4px',
                                                                                                cursor: 'pointer',
                                                                                                transition: 'all 0.2s'
                                                                                            }}
                                                                                            onMouseEnter={(e) => {
                                                                                                e.currentTarget.style.borderColor = primaryColor;
                                                                                                e.currentTarget.style.backgroundColor = '#fffbf0';
                                                                                            }}
                                                                                            onMouseLeave={(e) => {
                                                                                                e.currentTarget.style.borderColor = '#d9d9d9';
                                                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                                            }}
                                                                                        >
                                                                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                                                                <Space direction="vertical" size={0} style={{ flex: 1 }}>
                                                                                                    <Typography.Text strong style={{ fontSize: '12px' }}>
                                                                                                        {voucher.couponCode}
                                                                                                    </Typography.Text>
                                                                                                    <Typography.Text type="success" style={{ fontSize: '11px' }}>
                                                                                                        {isPercentage ? `Giảm ${voucher.percentage}%` : `Giảm ${formatPrice(voucher.price)}`}
                                                                                                    </Typography.Text>
                                                                                                    <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                                                                                                        Tiết kiệm: {formatPrice(discount)}
                                                                                                    </Typography.Text>
                                                                                                </Space>
                                                                                                <Button
                                                                                                    type="primary"
                                                                                                    size="small"
                                                                                                    onClick={async () => {
                                                                                                        // Áp dụng voucher và đóng popover
                                                                                                        await handleApplyCourseVoucher(courseId, item.price, voucher.couponCode, true);
                                                                                                    }}
                                                                                                    loading={voucherData.applying}
                                                                                                    style={{
                                                                                                        backgroundColor: primaryColor,
                                                                                                        borderColor: primaryColor,
                                                                                                        fontSize: '11px'
                                                                                                    }}
                                                                                                >
                                                                                                    Áp dụng
                                                                                                </Button>
                                                                                            </Space>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </Space>
                                                                        </div>
                                                                    }
                                                                    title="Chọn voucher"
                                                                    trigger="click"
                                                                    placement="bottomLeft"
                                                                    open={popoverVisible[courseId]}
                                                                    onOpenChange={(visible) => {
                                                                        setPopoverVisible(prev => ({
                                                                            ...prev,
                                                                            [courseId]: visible
                                                                        }));
                                                                    }}
                                                                >
                                                                    <Button
                                                                        type="link"
                                                                        size="small"
                                                                        style={{
                                                                            padding: 0,
                                                                            fontSize: '12px',
                                                                            height: 'auto',
                                                                            color: primaryColor
                                                                        }}
                                                                    >
                                                                        <Badge count={vouchers.length} size="small" offset={[8, 0]}>
                                                                            <Typography.Text
                                                                                style={{
                                                                                    fontSize: '12px',
                                                                                    color: primaryColor,
                                                                                    fontWeight: 500
                                                                                }}
                                                                            >
                                                                                Xem voucher có sẵn ({vouchers.length})
                                                                            </Typography.Text>
                                                                        </Badge>
                                                                    </Button>
                                                                </Popover>
                                                            )}
                                                            {isLoadingVouchers && (
                                                                <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                                                                    Đang tải voucher...
                                                                </Typography.Text>
                                                            )}
                                                        </Space>
                                                    );
                                                })()}
                                            </div>

                                            {/* ẨN: Hàng Metadata (totalHours, lectureCount, level không có trong API) */}

                                        </Space>
                                    </Col>

                                    {/* Nút (Xóa,...) */}
                                    <Col flex="100px" style={{ textAlign: 'right' }}>
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
                                        <Space direction="vertical" size={0} align="end">
                                            {(() => {
                                                const courseId = item.courseId || item.course?.id || item.course?.courseId;
                                                const voucherData = courseVouchers[courseId];
                                                const courseDiscount = voucherData?.discountAmount || 0;
                                                const finalCoursePrice = Math.max(0, item.price - courseDiscount);

                                                return courseDiscount > 0 ? (
                                                    <>
                                                        <Typography.Text delete type="secondary" style={{ fontSize: '13px' }}>
                                                            {formatPrice(item.price)}
                                                        </Typography.Text>
                                                        <Typography.Title level={4} style={{ margin: 0, color: primaryColor, whiteSpace: 'nowrap' }}>
                                                            {formatPrice(finalCoursePrice)}
                                                        </Typography.Title>
                                                    </>
                                                ) : (
                                                    <Typography.Title level={4} style={{ margin: 0, color: primaryColor, whiteSpace: 'nowrap' }}>
                                                        {formatPrice(item.price)}
                                                    </Typography.Title>
                                                );
                                            })()}
                                        </Space>
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                    />
                </Col>

                {/* Cột tổng tiền */}
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: '24px', marginTop: '40px' }}>
                        <Card
                            size="small"
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                        >
                            <div style={{ padding: '20px 16px' }}>
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                                    {/* Price Summary */}
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                                                Tạm tính:
                                            </Typography.Text>
                                            <Typography.Text style={{ fontSize: '14px', fontWeight: 500 }}>
                                                {formatPrice(totalPrice)}
                                            </Typography.Text>
                                        </Space>

                                        {totalDiscount > 0 && (
                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                                                    Giảm giá:
                                                </Typography.Text>
                                                <Typography.Text type="success" style={{ fontSize: '14px', fontWeight: 500 }}>
                                                    -{formatPrice(totalDiscount)}
                                                </Typography.Text>
                                            </Space>
                                        )}

                                        <Divider style={{ margin: '12px 0' }} />

                                        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography.Text strong style={{ fontSize: '16px' }}>
                                                Tổng cộng:
                                            </Typography.Text>
                                            <Typography.Title level={3} style={{ margin: 0, color: primaryColor, fontWeight: 700 }}>
                                                {formatPrice(finalPrice)}
                                            </Typography.Title>
                                        </Space>
                                    </Space>

                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{
                                            backgroundColor: primaryColor,
                                            borderColor: primaryColor,
                                            height: '48px',
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            marginTop: '8px'
                                        }}
                                    >
                                        Tiến hành thanh toán
                                    </Button>

                                    <Typography.Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                                        Bạn sẽ không bị tính phí ngay bây giờ
                                    </Typography.Text>

                                </Space>
                            </div>
                        </Card>
                    </div>
                </Col>

            </Row>
        </div>
    );
}

export default MyCart;
