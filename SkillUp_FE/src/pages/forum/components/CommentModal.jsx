import React from "react";
import { Modal, Input } from "antd";

const CommentModals = ({
  deleteModalVisible,
  setDeleteModalVisible,
  reportModalVisible,
  setReportModalVisible,
  reportReason,
  setReportReason,
  onDeleteConfirm,
  onReportConfirm,
}) => {
  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal
        title="Xóa bình luận"
        open={deleteModalVisible}
        onOk={onDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Bạn chắc chắn muốn xóa bình luận này không?</p>
        <p className="text-sm text-gray-500 mt-2">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>

      {/* Report Modal */}
      <Modal
        title="Báo cáo bình luận"
        open={reportModalVisible}
        onOk={onReportConfirm}
        onCancel={() => {
          setReportModalVisible(false);
          setReportReason("");
        }}
        okText="Báo cáo"
        cancelText="Hủy"
        centered
      >
        <div className="space-y-4">
          <p>Lý do báo cáo:</p>
          <Input.TextArea
            placeholder="Nhập lý do..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            maxLength={500}
            className="rounded"
          />
          <p className="text-xs text-gray-400">
            {reportReason.length}/500 ký tự
          </p>
        </div>
      </Modal>
    </>
  );
};

export default CommentModals;