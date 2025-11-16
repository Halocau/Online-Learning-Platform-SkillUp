import React, { memo, useCallback } from 'react';
import { Space, Tag, Typography, Input, Button, Popover, Badge } from 'antd';
import { formatPrice } from '../../utils/formatUtils';

const VoucherSection = memo(({
    courseId,
    coursePrice,
    voucherData,
    availableVouchers,
    isLoadingVouchers,
    popoverVisible,
    primaryColor,
    onApplyVoucher,
    onRemoveVoucher,
    onVoucherCodeChange,
    onPopoverChange
}) => {
    const hasAppliedVoucher = voucherData.appliedVoucher;

    // Tính discount cho mỗi voucher
    const calculateVoucherDiscount = useCallback((voucher, price) => {
        if (voucher.percentage > 0) {
            const discount = price * (voucher.percentage / 100);
            return Math.min(discount, price);
        } else if (voucher.price) {
            return Math.min(voucher.price, price);
        }
        return 0;
    }, []);

    const handleApplyClick = useCallback(() => {
        onApplyVoucher(courseId, coursePrice);
    }, [courseId, coursePrice, onApplyVoucher]);

    const handleApplyFromList = useCallback(async (voucherCode) => {
        await onApplyVoucher(courseId, coursePrice, voucherCode, true);
    }, [courseId, coursePrice, onApplyVoucher]);

    const handleRemoveClick = useCallback(() => {
        onRemoveVoucher(courseId);
    }, [courseId, onRemoveVoucher]);

    const handleInputChange = useCallback((e) => {
        onVoucherCodeChange(courseId, e.target.value);
    }, [courseId, onVoucherCodeChange]);

    const handlePressEnter = useCallback(() => {
        onApplyVoucher(courseId, coursePrice);
    }, [courseId, coursePrice, onApplyVoucher]);

    if (hasAppliedVoucher) {
        return (
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
                        onClick={handleRemoveClick}
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
        );
    }

    return (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space size="small" style={{ width: '100%' }}>
                <Input
                    placeholder="Mã giảm giá"
                    value={voucherData.voucherCode || ''}
                    onChange={handleInputChange}
                    onPressEnter={handlePressEnter}
                    disabled={voucherData.applying}
                    size="small"
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    size="small"
                    onClick={handleApplyClick}
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
            {availableVouchers.length > 0 && (
                <Popover
                    content={
                        <div style={{ maxWidth: '300px' }}>
                            <Typography.Text strong style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                                Voucher có sẵn:
                            </Typography.Text>
                            <Space direction="vertical" size="small" style={{ width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
                                {availableVouchers.map((voucher) => {
                                    const discount = calculateVoucherDiscount(voucher, coursePrice);
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
                                                    onClick={() => handleApplyFromList(voucher.couponCode)}
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
                    open={popoverVisible}
                    onOpenChange={(visible) => onPopoverChange(courseId, visible)}
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
                        <Badge count={availableVouchers.length} size="small" offset={[8, 0]}>
                            <Typography.Text
                                style={{
                                    fontSize: '12px',
                                    color: primaryColor,
                                    fontWeight: 500
                                }}
                            >
                                Xem voucher có sẵn ({availableVouchers.length})
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
});

VoucherSection.displayName = 'VoucherSection';

export default VoucherSection;

