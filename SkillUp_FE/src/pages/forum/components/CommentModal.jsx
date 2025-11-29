import React from "react";
import { Modal, Input } from "antd";
import { Trash2, Flag } from "lucide-react";

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
        title={
          <div className="flex items-center gap-2">
            <Trash2 size={18} className="text-red-500" />
            <span>Xóa bình luận</span>
          </div>
        }
        open={deleteModalVisible}
        onOk={onDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="py-2">
          <p className="text-gray-700">
            Bạn chắc chắn muốn xóa bình luận này không?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-red-500" />
            <span>Báo cáo bình luận</span>
          </div>
        }
        open={reportModalVisible}
        onOk={onReportConfirm}
        onCancel={() => {
          setReportModalVisible(false);
          setReportReason("");
        }}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
          disabled: !reportReason.trim(),
        }}
        centered
      >
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Vui lòng mô tả lý do bạn muốn báo cáo bình luận này. Chúng tôi sẽ
            xem xét và xử lý trong thời gian sớm nhất.
          </p>
          <Input.TextArea
            placeholder="Ví dụ: Nội dung không phù hợp, spam, vi phạm quy định..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
            className="rounded-lg"
          />
        </div>
      </Modal>
    </>
  );
};

export default CommentModals;
