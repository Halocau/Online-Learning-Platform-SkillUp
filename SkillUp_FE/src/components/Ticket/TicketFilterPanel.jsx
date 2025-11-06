import React from 'react';
import clsx from 'clsx';

function TicketFilterPanel({
    activeTab = 'all',
    onChangeTab,
    onCreateNew,
    title = 'Lọc phiếu hỗ trợ',
    className,
    variant = 'card', // 'card' | 'plain'
}) {
    const TabButton = ({ tab, children }) => (
        <button
            type="button"
            onClick={() => onChangeTab?.(tab)}
            className={clsx(
                'w-full text-left px-4 py-3 rounded-lg font-medium transition-all',
                activeTab === tab
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
            )}
        >
            {children}
        </button>
    );

    const Container = ({ children }) =>
        variant === 'card' ? (
            <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
                {children}
            </div>
        ) : (
            <div className={clsx('p-0', className)}>{children}</div>
        );

    return (
        <Container>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>

            <nav className="space-y-2 mb-6">
                <TabButton tab="all">Tất cả phiếu</TabButton>
                <TabButton tab="approved">Phiếu đã duyệt</TabButton>
                <TabButton tab="rejected">Phiếu bị từ chối</TabButton>
            </nav>

            {onCreateNew && (
                <button
                    onClick={onCreateNew}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    <span className="text-xl">➕</span>
                    Tạo phiếu mới
                </button>
            )}
        </Container>
    );
}

export default TicketFilterPanel;
