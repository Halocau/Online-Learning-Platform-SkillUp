import React from "react";
import { Modal, Descriptions, Tag, Image } from "antd";

const QuestionBankViewModal = ({ open, onClose, questionBankObj }) => {


  if (!questionBankObj) return null;

  return (
    <Modal
      title="Chi tiết câu hỏi"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >

      {/* Image Preview */}
      {questionBankObj.image ? (
        <div
          style={{
            textAlign: "center",
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={questionBankObj.image}
            alt="Question"
            style={{
              width: 150,          // fixed width
              height: "auto",
              objectFit: "contain",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
              padding: 4,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            marginBottom: 16,
            color: "#999",
            fontStyle: "italic",
          }}
        >
          (Không có hình ảnh)
        </div>
      )}

      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "30%" }}
        contentStyle={{ wordBreak: "break-word" }}
      >
        <Descriptions.Item label="Câu hỏi">{questionBankObj.title}</Descriptions.Item>

        <Descriptions.Item label="Đáp án">
          {questionBankObj.answers && questionBankObj.answers.length > 0 ? (
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {questionBankObj.answers.map((answer, index) => (
                <li key={answer.answerId} style={{ marginBottom: "15px" }}> {/* Increased margin slightly */}

                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={
                        answer.isCorrect
                          ? { fontWeight: "bold", color: "green" }
                          : {}
                      }
                    >
                      <b>{String.fromCharCode(97 + index)}) </b>
                      {answer.answerName}
                    </span>

                    {answer.isCorrect && (
                      <Tag color="green" style={{ marginLeft: "8px" }}>
                        ✅ Đúng
                      </Tag>
                    )}
                  </div>

                  {answer.image && (
                    <div style={{ marginTop: "8px", marginLeft: "15px" }}>
                      <Image
                        width={150}
                        height={100}
                        src={answer.image}
                        
                        style={{ 
                          borderRadius: "8px", 
                          objectFit: "cover",
                          border: answer.isCorrect ? "2px solid green" : "1px solid #f0f0f0",
                         }}
                      />

                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <span>Không có đáp án nào</span>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Loại câu hỏi">
          {questionBankObj.type === 'SingleChoice'
            ? <b>Một đáp án đúng</b>
            : questionBankObj.type === 'MultiChoice'
              ? <b>Nhiều đáp án đúng</b>
              : <i>Không có dữ liệu</i>}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default QuestionBankViewModal;
