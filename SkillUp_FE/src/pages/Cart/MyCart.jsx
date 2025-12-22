import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getApiUrl, axiosInstance } from '@/config/api';
import { GuestCartView } from '@/components/Cart/GuestCartView';
import CartItem from '@/components/Cart/CartItem';
import PriceSummary from '@/components/Cart/PriceSummary';
import { voucherAPI } from '@/api/voucherAPI';
import { paymentAPI } from '@/api/paymentAPI';
import { useCart } from '@/context/CartContext';
import {
    List,
    Spin,
    Empty,
    Typography,
    Row,
    Col,
    message,
} from 'antd';
import { toast } from 'react-toastify';

// Constants
const PRIMARY_COLOR = '#FCCD04';
const CART_STYLES = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#fff'
    }
};

// Utility function
const getCourseId = (item) => {
    return item.courseId || item.course?.id || item.course?.courseId;
};


// Main Component
function MyCart() {
    // Get user from localStorage
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);

    const accountId = user?.userId;
    const { fetchCartCount } = useCart();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseVouchers, setCourseVouchers] = useState({});
    const [availableVouchers, setAvailableVouchers] = useState({});
    const [loadingVouchers, setLoadingVouchers] = useState({});
    const [popoverVisible, setPopoverVisible] = useState({});

    // Fetch cart
    const fetchCart = useCallback(async () => {
        if (!accountId) return;

        setLoading(true);
        try {
            const apiUrlTemplate = getApiUrl('CART');
            const apiUrl = apiUrlTemplate.replace('{accountId}', accountId);
            const response = await axiosInstance.get(apiUrl);

            if (response.data?.code === 200) {
                const originalCart = response.data.data[0];
                setCart(originalCart || { cartItems: [] });
                setError(null);
            } else {
                throw new Error(response.data?.message || "Không thể tải giỏ hàng");
            }
        } catch (err) {
            if (err.response?.status === 404) {
                // Cart trống - không log error, chỉ set empty cart
                setCart({ cartItems: [] });
                setError(null);
            } else {
                // Lỗi thực sự - log và hiển thị error
                console.error("Lỗi khi tải giỏ hàng:", err);
                setError("Lỗi khi tải giỏ hàng. Vui lòng thử lại.");
                message.error(err.message || "Lỗi khi tải giỏ hàng");
            }
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    // Filter valid vouchers
    const filterValidVouchers = useCallback((vouchers) => {
        if (!vouchers?.length) return [];
        const now = new Date();
        return vouchers.filter(v => {
            if (!v.isActive) return false;
            if (v.startTime && now < new Date(v.startTime)) return false;
            if (v.endTime && now > new Date(v.endTime)) return false;
            return true;
        });
    }, []);

    // Fetch all course vouchers
    const fetchAllCourseVouchers = useCallback(async (cartItems) => {
        if (!cartItems?.length) return;

        const courseIds = cartItems
            .map(item => getCourseId(item))
            .filter(id => id != null);

        if (!courseIds.length) return;

        // Set loading state
        setLoadingVouchers(prev => {
            const newState = { ...prev };
            courseIds.forEach(id => { newState[id] = true; });
            return newState;
        });

        try {
            const response = await voucherAPI.getCourseVouchersBatch(courseIds);
            if (response.data?.code === 200) {
                const vouchersDict = response.data.data[0] || {};
                const newAvailableVouchers = {};

                Object.keys(vouchersDict).forEach(courseId => {
                    const courseIdGuid = courseIds.find(id =>
                        id.toString() === courseId || id === courseId
                    );
                    if (courseIdGuid) {
                        newAvailableVouchers[courseIdGuid] = filterValidVouchers(vouchersDict[courseId] || []);
                    }
                });

                // Ensure all courseIds have entries
                courseIds.forEach(id => {
                    if (!newAvailableVouchers[id]) {
                        newAvailableVouchers[id] = [];
                    }
                });

                setAvailableVouchers(prev => ({ ...prev, ...newAvailableVouchers }));
            }
        } catch (err) {
            console.error("Lỗi khi tải voucher:", err);
            const emptyVouchers = {};
            courseIds.forEach(id => { emptyVouchers[id] = []; });
            setAvailableVouchers(prev => ({ ...prev, ...emptyVouchers }));
        } finally {
            setLoadingVouchers(prev => {
                const newState = { ...prev };
                courseIds.forEach(id => { newState[id] = false; });
                return newState;
            });
        }
    }, [filterValidVouchers]);

    // Effects
    useEffect(() => {
        if (accountId) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [accountId, fetchCart]);

    // Đồng bộ lại số lượng cart trên header mỗi khi vào trang giỏ hàng
    useEffect(() => {
        if (!accountId) return;

        const syncCartCount = async () => {
            try {
                await fetchCartCount();
            } catch (error) {
                console.error("Error syncing cart count on cart page mount:", error);
            }
        };

        syncCartCount();
    }, [accountId, fetchCartCount]);

    useEffect(() => {
        if (cart?.cartItems?.length) {
            fetchAllCourseVouchers(cart.cartItems);
        }
    }, [cart, fetchAllCourseVouchers]);

    // Remove item handler
    const handleRemoveItem = useCallback(async (cartItemId) => {
        try {
            const apiUrlTemplate = getApiUrl('REMOVE_FROM_CART');
            const apiUrl = apiUrlTemplate.replace('{cartItemId}', cartItemId);

            const itemToRemove = cart?.cartItems?.find(item => item.id === cartItemId);
            const courseId = getCourseId(itemToRemove);

            await axiosInstance.delete(apiUrl);

            setCart(prevCart => ({
                ...prevCart,
                cartItems: prevCart.cartItems.filter(item => item.id !== cartItemId),
            }));

            // Cập nhật lại số lượng cart global
            try {
                await fetchCartCount();
            } catch (error) {
                console.error("Error refreshing cart count after removing item:", error);
            }

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
    }, [cart, fetchCartCount]);

    // Calculate totals
    const totalPrice = useMemo(() => {
        return cart?.cartItems?.reduce((acc, item) => acc + item.price, 0) || 0;
    }, [cart?.cartItems]);

    const totalDiscount = useMemo(() => {
        return Object.values(courseVouchers).reduce((acc, voucher) => {
            return acc + (voucher.discountAmount || 0);
        }, 0);
    }, [courseVouchers]);

    const finalPrice = useMemo(() => {
        return Math.max(0, totalPrice - totalDiscount);
    }, [totalPrice, totalDiscount]);

    // Apply voucher handler
    const handleApplyCourseVoucher = useCallback(async (courseId, coursePrice, voucherCodeToApply = null, closePopover = false) => {
        let codeToUse = voucherCodeToApply;

        if (!codeToUse) {
            const voucherData = courseVouchers[courseId];
            codeToUse = voucherData?.voucherCode?.trim();

            if (!codeToUse) {
                message.warning('Vui lòng nhập mã giảm giá hoặc chọn từ danh sách');
                return;
            }
        }

        // Lấy giá gốc từ cart item (không dùng giá đã giảm)
        const cartItem = cart?.cartItems?.find(item => {
            const id = getCourseId(item);
            return id === courseId;
        });
        const originalPrice = cartItem?.price || coursePrice;

        // Set applying state - reset discountAmount trước khi apply mới
        setCourseVouchers(prev => ({
            ...prev,
            [courseId]: {
                voucherCode: codeToUse,
                appliedVoucher: null,
                discountAmount: 0, // Reset discount trước khi apply mới
                applying: true
            }
        }));

        try {
            const response = await voucherAPI.validateVoucher(
                codeToUse,
                [courseId],
                originalPrice // Luôn dùng giá gốc từ cart item
            );

            if (response.data?.code === 200) {
                const voucherDataResponse = response.data.data[0];
                const isValid = voucherDataResponse?.IsValid ?? voucherDataResponse?.isValid ?? false;
                const voucher = voucherDataResponse?.Voucher ?? voucherDataResponse?.voucher;
                const discountAmount = voucherDataResponse?.DiscountAmount ?? voucherDataResponse?.discountAmount ?? 0;
                const messageText = voucherDataResponse?.Message ?? voucherDataResponse?.message;

                if (isValid) {
                    setCourseVouchers(prev => ({
                        ...prev,
                        [courseId]: {
                            voucherCode: codeToUse,
                            appliedVoucher: voucher,
                            discountAmount: discountAmount, // Sử dụng discountAmount mới từ API, không cộng dồn
                            applying: false
                        }
                    }));
                    message.success(messageText || 'Áp dụng mã giảm giá thành công!');

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
    }, [courseVouchers, cart?.cartItems]);

    // Remove voucher handler
    const handleRemoveCourseVoucher = useCallback((courseId) => {
        setCourseVouchers(prev => {
            const newState = { ...prev };
            // Reset về state rỗng thay vì xóa hoàn toàn
            newState[courseId] = {
                voucherCode: '',
                appliedVoucher: null,
                discountAmount: 0,
                applying: false
            };
            return newState;
        });
        message.info('Đã xóa mã giảm giá');
    }, []);

    // Voucher code change handler
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

    // Popover change handler
    const handlePopoverChange = useCallback((courseId, visible) => {
        setPopoverVisible(prev => ({
            ...prev,
            [courseId]: visible
        }));
    }, []);

    // Checkout handler
    const handleCheckout = useCallback(async () => {
        if (!cart?.cartItems?.length) {
            message.warning('Giỏ hàng trống');
            return;
        }

        if (finalPrice < 0) {
            message.warning('Tổng tiền không hợp lệ');
            return;
        }

        try {
            console.log('Starting checkout process...', { finalPrice, totalDiscount, cartItemsCount: cart.cartItems.length });

            // Prepare payment items
            const paymentItems = cart.cartItems.map(item => {
                const courseId = getCourseId(item);
                const voucherData = courseVouchers[courseId];
                const itemFinalPrice = item.price - (voucherData?.discountAmount || 0);
                return {
                    courseId: courseId,
                    price: item.price, // Original price
                    finalPrice: itemFinalPrice, // Price after discount
                    voucherCode: voucherData?.voucherCode || null,
                    voucherId: voucherData?.appliedVoucher?.id || null,
                    cartItemId: item.id
                };
            });

            console.log('Payment items prepared:', paymentItems);

            // Create payment
            const paymentResponse = await paymentAPI.createCartPayment(
                paymentItems,
                finalPrice,
                totalDiscount
            );

            console.log('Payment response:', paymentResponse);

            if (!paymentResponse) {
                throw new Error('Không nhận được phản hồi từ server');
            }

            // Check both Success (C#) and success (JavaScript) property names
            const isSuccess = paymentResponse?.Success || paymentResponse?.success;
            const isFreeCart = paymentResponse?.IsFreeCart || paymentResponse?.isFreeCart;
            const checkoutUrl = paymentResponse?.CheckoutUrl || paymentResponse?.checkoutUrl;
            const responseMessage = paymentResponse?.Message || paymentResponse?.message;

            if (isSuccess) {
                if (isFreeCart) {
                    // Free cart - enrollment already done, just show success toast
                    toast.success(responseMessage || 'Khóa học miễn phí đã được kích hoạt!');
                    message.success(responseMessage || 'Đăng ký khóa học thành công!');
                    // Refresh cart to show empty state
                    fetchCart();

                    // Đồng bộ lại số lượng cart trên header
                    try {
                        await fetchCartCount();
                    } catch (error) {
                        console.error("Error refreshing cart count after free cart checkout:", error);
                    }
                } else if (checkoutUrl) {
                    // Redirect to PayOS checkout
                    window.location.href = checkoutUrl;
                } else {
                    throw new Error(responseMessage || 'Không thể tạo thanh toán');
                }
            } else {
                throw new Error(responseMessage || 'Không thể tạo thanh toán');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            message.error(error.response?.data?.message || error.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
        }
    }, [cart, finalPrice, totalDiscount, courseVouchers, fetchCart, fetchCartCount]);

    // Early returns
    if (!accountId) {
        return <GuestCartView />;
    }

    if (loading) {
        return <Spin tip="Đang tải giỏ hàng..." fullscreen />;
    }

    if (error) {
        return (
            <Typography.Title level={3} style={{ textAlign: 'center', color: 'red' }}>
                {error}
            </Typography.Title>
        );
    }

    if (!cart?.cartItems?.length) {
        return <Empty description="Giỏ hàng của bạn trống" style={{ marginTop: '50px' }} />;
    }

    return (
        <div style={CART_STYLES.container}>
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
                        renderItem={(item) => {
                            const courseId = getCourseId(item);
                            return (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    courseVouchers={courseVouchers}
                                    availableVouchers={availableVouchers[courseId] || []}
                                    loadingVouchers={loadingVouchers[courseId]}
                                    popoverVisible={Boolean(popoverVisible[courseId])}
                                    primaryColor={PRIMARY_COLOR}
                                    onRemoveItem={handleRemoveItem}
                                    onApplyVoucher={handleApplyCourseVoucher}
                                    onRemoveVoucher={handleRemoveCourseVoucher}
                                    onVoucherCodeChange={handleCourseVoucherCodeChange}
                                    onPopoverChange={handlePopoverChange}
                                />
                            );
                        }}
                    />
                </Col>

                {/* Cột tổng tiền */}
                <Col xs={24} lg={8}>
                    <div style={{ position: 'sticky', top: '24px', marginTop: '40px' }}>
                        <PriceSummary
                            totalPrice={totalPrice}
                            totalDiscount={totalDiscount}
                            finalPrice={finalPrice}
                            primaryColor={PRIMARY_COLOR}
                            onCheckout={handleCheckout}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default MyCart;
