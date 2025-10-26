import React from "react";
import { Modal } from "antd";

export default function NewsDetailMod({ visible, onClose, news }) {
  if (!news) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      title={<h2 className="text-xl font-semibold text-gray-800">{news.title}</h2>}
    >
      <div className="space-y-4">
        
        <div className="flex justify-between text-gray-600 text-sm">
          <p>
            <span className="font-semibold">Author:</span>{" "}
            {news.authorEmail || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {news.date ? new Date(news.date).toLocaleDateString("en-GB") : "N/A"}
          </p>
        </div>

        
        {news.image && (
          <div className="flex justify-center">
            <img
              src={news.image}
              alt="News"
              className="rounded-lg max-h-64 object-cover shadow-md"
            />
          </div>
        )}

        
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: news.content || "<i>No content available</i>",
          }}
        />
      </div>
    </Modal>
  );
}
