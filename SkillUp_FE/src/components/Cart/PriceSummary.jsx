import React, { memo } from 'react';
import { Card, Space, Typography, Button, Divider } from 'antd';
import { formatPrice } from '../../utils/formatUtils';

const PriceSummary = memo(({
    totalPrice,
    totalDiscount,
    finalPrice,
    primaryColor,
    onCheckout
}) => {
    return (
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
                        onClick={onCheckout}
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
    );
});

PriceSummary.displayName = 'PriceSummary';

export default PriceSummary;

