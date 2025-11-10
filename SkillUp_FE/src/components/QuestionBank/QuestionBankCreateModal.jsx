import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Checkbox, Input, Button, Space } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const QuestionBankCreateModal = ({ open, onClose, onCreate, sectionId }) => {
    const [questionData, setQuestionData] = useState({
        title: "",
        description: "description",
        answers: [],
        sectionId: sectionId,
    });

    useEffect(() => {
        if (open) {
            setQuestionData({
                title: "",
                description: "description",
                answers: [],
                sectionId: sectionId,
            });
        }
    }, [open]);

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
        const currentData = { ...questionData };
        if (onCreate) onCreate(currentData);
        onClose();
    };

    // Delete an answer
    const handleDeleteAnswer = async (answerId) => {
        const updatedData = {
            ...questionData,
            answers: questionData.answers.map((ans) =>
                ans.answerId === answerId ? { ...ans, isActive: false } : ans
            ),

        };

        // Update local state
        setQuestionData(updatedData);
    };

    const handleAddAnswer = () => {
        const newAnswer = {
            answerId: crypto.randomUUID(),
            answerName: "Cau tra loi moi",
            isCorrect: false,
            isActive: true
        };

        const updatedData = {
            ...questionData,
            answers: [...questionData.answers, newAnswer],
        };

        setQuestionData(updatedData);
    }


    return (
        <Modal
            title="Tạo câu hỏi"
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={1000} // optional: control overall modal width
        >
            <Descriptions
                bordered
                column={1}
                size="middle"
                styles={{ lable: { fontWeight: 600, width: "160px" }, content: { wordBreak: "break-word", padding: "12px 16px" } }} // 👈 fixed label width
            >
                {/* Question Title */}
                <Descriptions.Item label="Câu hỏi">
                    <Input.TextArea
                        onChange={handleTitleChange}
                        placeholder="Nhập câu hỏi"
                        maxLength={255}
                        style={{ width: "100%" }}
                        autoSize={{ minRows: 1, maxRows: 6 }} // 👈 auto expand up to 6 lines
                    />
                </Descriptions.Item>

                {/* Answers */}
                <Descriptions.Item label="Đáp án">
                    {questionData.answers && questionData.answers.length > 0 ? (
                        <>
                            <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
                                {questionData.answers
                                    .filter((ans) => ans.isActive !== false)
                                    .map((answer) => (
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
                                            <Input.TextArea
                                                value={answer.answerName}
                                                onChange={(e) =>
                                                    handleAnswerNameChange(answer.answerId, e.target.value)
                                                }
                                                placeholder="Nhập nội dung đáp án"
                                                maxLength={255}
                                                autoSize={{ minRows: 1, maxRows: 4 }} // 👈 auto expand as text grows
                                                style={{ flex: 1, minWidth: 0 }}
                                            />
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => handleDeleteAnswer(answer.answerId)}
                                            />
                                        </li>
                                    ))}
                            </ul>

                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddAnswer}
                                style={{ marginTop: "8px", width: "100%" }}
                            >
                                Thêm đáp án
                            </Button>
                        </>
                    ) : (
                        <>
                            <span>Không có đáp án nào</span>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddAnswer}
                                style={{ marginTop: "8px", width: "100%" }}
                            >
                                Thêm đáp án
                            </Button>
                        </>
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

export default QuestionBankCreateModal;