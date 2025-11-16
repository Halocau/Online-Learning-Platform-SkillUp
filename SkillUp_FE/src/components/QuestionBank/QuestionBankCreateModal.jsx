import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Checkbox, Radio, Input, Button, Space, Upload, Select } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";

const QuestionBankCreateModal = ({ open, onClose, onCreate, sectionId }) => {
    const [fileList, setFileList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [questionData, setQuestionData] = useState({
        title: "",
        description: "description",
        answers: [],
        sectionId: sectionId,
        Type: "SingleChoice",
    });

    useEffect(() => {
        if (open) {
            setQuestionData({
                title: "",
                description: "description",
                answers: [],
                sectionId: sectionId,
                Type: "SingleChoice",
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

    const handleRadioChange = (selectedId) => {
        setQuestionData((prev) => ({
            ...prev,
            answers: prev.answers.map((a) => ({
                ...a,
                isCorrect: a.answerId === selectedId
            }))
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

    const handleSave = async () => {
        if (!questionData.title?.trim()) {
            toast.error("Vui lòng nhập câu hỏi!");
            return;
        }
        const hasCorrectAnswer = questionData.answers.some(ans => ans.isCorrect);
        if (!hasCorrectAnswer) {
            toast.error("Bạn phải chọn ít nhất một đáp án đúng!");
            return;
        }

        setLoading(true);

        try {
            const currentData = { ...questionData };
            let imageUrl = null;

            if (questionData.questionImage instanceof File) {
                imageUrl = await uploadImage(questionData.questionImage);
            }

            currentData.questionImage = imageUrl;
            await onCreate(currentData);
            toast.success("Lưu thành công!");

            // Reset form và đóng modal
            setQuestionData({
                title: "",
                description: "description",
                questionImage: null,
                answers: [],
                sectionId: sectionId,
                Type: "SingleChoice",
            });
            setFileList([]);
            onClose();

        } catch (error) {
            console.error("Lưu thất bại:", error);
            toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");

        } finally {
            setLoading(false);
        }
    };


    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await axiosInstance.post(
            "http://localhost:5120/api/Upload/image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data[0].url; // Assuming the API returns the image URL in data field
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

    const handleQuestionImageChange = (file) => {
        setQuestionData((prev) => ({
            ...prev,
            questionImage: file,
        }));
    };


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
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

                        {/* Title Textarea (Left) */}
                        <Input.TextArea
                            value={questionData.title}
                            onChange={handleTitleChange}
                            placeholder="Nhập câu hỏi"
                            maxLength={255}
                            autoSize={{ minRows: 4, maxRows: 4 }}
                            style={{ width: "100%" }}
                            required
                        />

                        {/* Image Upload */}
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            accept="image/*"
                            beforeUpload={() => false}
                            showUploadList={{
                                showPreviewIcon: false,
                                showRemoveIcon: true,
                            }}
                            fileList={fileList}
                            onChange={({ fileList: newList }) => {
                                setFileList(newList);

                                if (newList.length > 0) {
                                    handleQuestionImageChange(newList[0].originFileObj);
                                } else {
                                    handleQuestionImageChange(null); // user clicked trash icon
                                }
                            }}
                        >
                            {fileList.length >= 1 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Ảnh</div>
                                </div>
                            )}
                        </Upload>
                    </div>
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

                                            {questionData.Type === "MultiChoice" ? (
                                                <Checkbox
                                                    checked={answer.isCorrect}
                                                    onChange={() => handleCheckboxChange(answer.answerId)}
                                                />
                                            ) : (
                                                <Radio
                                                    checked={answer.isCorrect}
                                                    onChange={() => handleRadioChange(answer.answerId)}
                                                />
                                            )}

                                            <Input.TextArea
                                                value={answer.answerName}
                                                onChange={(e) =>
                                                    handleAnswerNameChange(answer.answerId, e.target.value)
                                                }
                                                placeholder="Nhập nội dung đáp án"
                                                maxLength={255}
                                                autoSize={{ minRows: 1, maxRows: 4 }}
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

                            {questionData.answers.length > 0 &&
                                !questionData.answers.some(ans => ans.isCorrect) && (
                                    <Alert
                                        message="Vui lòng chọn ít nhất một đáp án đúng."
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: "10px" }}
                                    />
                                )}
                        </>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Loại câu hỏi">
                    <Select
                        defaultValue="SingleChoice"
                        value={questionData.Type}
                        onChange={(value) => {
                            setQuestionData((prev) => ({
                                ...prev,
                                Type: value,
                                answers: prev.answers.map((a) => ({ ...a, isCorrect: false })) // reset lại đáp án đúng
                            }));
                        }}
                        style={{ width: 200 }}
                        options={[
                            { label: "Một đáp án đúng", value: "SingleChoice" },
                            { label: "Nhiều đáp án đúng", value: "MultiChoice" }
                        ]}
                    />
                </Descriptions.Item>

            </Descriptions>

            {/* Footer Buttons */}
            <Space style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Huỷ</Button>
                <Button type="primary" loading={loading} onClick={handleSave}>
                    Lưu
                </Button>
            </Space>
        </Modal >

    );
};

export default QuestionBankCreateModal;