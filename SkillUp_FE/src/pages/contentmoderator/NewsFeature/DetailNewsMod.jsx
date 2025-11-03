import React from "react";
import { Modal } from "antd";

export default function NewsDetailModal({ visible, onClose, news }) {
  if (!news) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      title={
        <h2 className="text-xl font-semibold text-gray-800">{news.title}</h2>
      }
    >
      <div className="space-y-4">
        {/* Author and Date */}
        <div className="flex justify-between text-gray-600 text-sm">
          <p>
            <span className="font-semibold">Tác giả:</span> {news.email || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Ngày đăng:</span>{" "}
            {news.date
              ? new Date(news.date).toLocaleDateString("vi-VN")
              : "N/A"}
          </p>
        </div>

        {/* Content */}
        <div
          className="text-gray-700 leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: news.contents || "<i>Không có nội dung</i>",
          }}
        />
      </div>
    </Modal>
  );
}