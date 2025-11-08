import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Checkbox, Input, Button, Space } from "antd";

const QuestionBankEditModal = ({ open, onClose, questionBankObj, onSave }) => {
  const [questionData, setQuestionData] = useState(null);

  useEffect(() => {
    if (questionBankObj) {
      // Deep clone to avoid mutating parent state
      setQuestionData(JSON.parse(JSON.stringify(questionBankObj)));
    }
  }, [questionBankObj]);

  if (!questionData) return null;

  const handleCheckboxChange = (answerId) => {
    setQuestionData((prev) => ({
      ...prev,
      answers: prev.answers.map((ans) =>
        ans.answerId === answerId
          ? { ...ans, isCorrect: !ans.isCorrect }
          : ans
      ),
    }));
  };

  const handleAnswerNameChange = (answerId, newName) => {
    setQuestionData((prev) => ({
      ...prev,
      answers: prev.answers.map((ans) =>
        ans.answerId === answerId
          ? { ...ans, answerName: newName }
          : ans
      ),
    }));
  };

  const handleTitleChange = (e) => {
    setQuestionData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSave = () => {
    if (onSave) onSave(questionData);
    onClose();
  };

  return (
    <Modal
      title="Edit Question"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={600} // optional: control overall modal width
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "160px" }} // 👈 fixed label width
        contentStyle={{ wordBreak: "break-word", padding: "12px 16px" }}
      >
        {/* Question Title */}
        <Descriptions.Item label="Câu hỏi">
          <Input
            value={questionData.title}
            onChange={handleTitleChange}
            placeholder="Enter question title"
            style={{ width: "100%" }}
          />
        </Descriptions.Item>

        {/* Answers */}
        <Descriptions.Item label="Đáp án">
          {questionData.answers && questionData.answers.length > 0 ? (
            <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
              {questionData.answers.map((answer) => (
                <li
                  key={answer.answerId}
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Checkbox
                    checked={answer.isCorrect}
                    onChange={() => handleCheckboxChange(answer.answerId)}
                  />
                  <Input
                    value={answer.answerName}
                    onChange={(e) =>
                      handleAnswerNameChange(answer.answerId, e.target.value)
                    }
                    placeholder="Enter answer text"
                    style={{ flex: 1, minWidth: "0" }} // makes it responsive
                  />
                </li>
              ))}
            </ul>
          ) : (
            <span>Không có đáp án nào</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      {/* Footer Buttons */}
      <Space style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onClose}>Huỷ</Button>
        <Button type="primary" onClick={handleSave}>
          Lưu
        </Button>
      </Space>
    </Modal>

  );
};

export default QuestionBankEditModal;