import React, { memo } from 'react';
import { List, Row, Col, Image, Space, Typography, Rate, Button } from 'antd';
import VoucherSection from './VoucherSection';
import { formatPrice, formatNumber } from '../../utils/formatUtils';

const CartItem = memo(({
    item,
    courseVouchers,
    availableVouchers,
    loadingVouchers,
    popoverVisible,
    primaryColor,
    onRemoveItem,
    onApplyVoucher,
    onRemoveVoucher,
    onVoucherCodeChange,
    onPopoverChange
}) => {
    const courseId = item.courseId || item.course?.id || item.course?.courseId;
    const voucherData = courseVouchers[courseId];
    const courseDiscount = voucherData?.discountAmount || 0;
    const finalCoursePrice = Math.max(0, item.price - courseDiscount);

    return (
        <List.Item
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

                {/* Thông tin khóa học */}
                <Col flex="auto" style={{ minWidth: '200px' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }} ellipsis={{ rows: 2 }}>
                            {item.course.title}
                        </Typography.Title>

                        <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                            Giáo viên: {item.course.lecturerName}
                        </Typography.Text>

                        {/* Rating */}
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

                        {/* Voucher Section */}
                        <div style={{ marginTop: '8px', width: '100%' }}>
                            <VoucherSection
                                courseId={courseId}
                                coursePrice={item.price}
                                voucherData={courseVouchers[courseId] || {}}
                                availableVouchers={availableVouchers || []}
                                isLoadingVouchers={loadingVouchers}
                                popoverVisible={popoverVisible}
                                primaryColor={primaryColor}
                                onApplyVoucher={onApplyVoucher}
                                onRemoveVoucher={onRemoveVoucher}
                                onVoucherCodeChange={onVoucherCodeChange}
                                onPopoverChange={(visible) =>
                                    onPopoverChange(courseId, visible)
                                }
                            />
                        </div>
                    </Space>
                </Col>

                {/* Nút Xóa */}
                <Col flex="100px" style={{ textAlign: 'right' }}>
                    <Space direction="vertical" align="end" size={0}>
                        <Button
                            type="link"
                            danger
                            onClick={() => onRemoveItem(item.id)}
                            style={{ padding: '4px 0', height: 'auto' }}
                        >
                            Xóa
                        </Button>
                    </Space>
                </Col>

                {/* Giá */}
                <Col flex="120px" style={{ textAlign: 'right' }}>
                    <Space direction="vertical" size={0} align="end">
                        {courseDiscount > 0 ? (
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
                        )}
                    </Space>
                </Col>
            </Row>
        </List.Item>
    );
});

CartItem.displayName = 'CartItem';

export default CartItem;

