import React from "react";
import { Modal, Descriptions, Tag } from "antd";

const QuestionBankViewModal = ({ open, onClose, questionBankObj }) => {


  if (!questionBankObj) return null;

  return (
  <Modal
    title="View Question Details"
    open={open}
    onCancel={onClose}
    footer={null}
    centered
  >
    <Descriptions
      bordered
      column={1}
      size="middle"
      labelStyle={{ fontWeight: 600, width: "30%" }}
      contentStyle={{ wordBreak: "break-word" }}
    >
      <Descriptions.Item label="Title">{questionBankObj.title}</Descriptions.Item>

      <Descriptions.Item label="Answers">
        {questionBankObj.answers && questionBankObj.answers.length > 0 ? (
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {questionBankObj.answers.map((answer) => (
              <li key={answer.answerId} style={{ marginBottom: "8px" }}>
                <strong>{answer.answerName}</strong>{" "}
                {answer.isCorrect && (
                  <Tag color="green" style={{ marginLeft: "8px" }}>
                    ✅ Đúng
                  </Tag>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span>Không có đáp án nào</span>
        )}
      </Descriptions.Item>
    </Descriptions>
  </Modal>
);
};

export default QuestionBankViewModal;
