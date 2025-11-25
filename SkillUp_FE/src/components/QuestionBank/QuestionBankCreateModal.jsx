import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Checkbox, Radio, Input, Button, Space, Upload, Select, Tooltip } from "antd";
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
            let mainImageUrl = questionData.questionImage; // Default to existing value (if it's a string URL) or null

            if (questionData.questionImage instanceof File) {
                mainImageUrl = await uploadImage(questionData.questionImage);
            }
            const processedAnswers = await Promise.all(questionData.answers.map(async (ans) => {
                let finalAnswerUrl = ans.imageUrl; // Default to whatever is there (null or existing string)

                if (ans.imageFile instanceof File) {
                    finalAnswerUrl = await uploadImage(ans.imageFile);
                }

                return {
                    answerName: ans.answerName,
                    isCorrect: ans.isCorrect,
                    image: finalAnswerUrl // The string URL (or null)
                };
            }));

            const payload = {
                ...questionData,
                questionImage: mainImageUrl, 
                answers: processedAnswers,   
            };

            await onCreate(payload);
            toast.success("Lưu thành công!");

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
            answerName: "Đáp án mới",
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

    // Handle selecting an image for a specific answer
    const handleAnswerImageChange = (answerId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type/size if needed
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            // Assuming you have message or toast
            // message.error('Image must be smaller than 2MB!'); 
            return;
        }

        setQuestionData((prev) => {
            const newAnswers = prev.answers.map((ans) => {
                if (ans.answerId === answerId) {
                    return {
                        ...ans,
                        imageFile: file, // Store file for upload later
                        previewUrl: URL.createObjectURL(file), // Create local preview
                    };
                }
                return ans;
            });
            return { ...prev, answers: newAnswers };
        });
    };

    // Handle removing the image from an answer
    const handleRemoveAnswerImage = (answerId) => {
        setQuestionData((prev) => {
            const newAnswers = prev.answers.map((ans) => {
                if (ans.answerId === answerId) {
                    return {
                        ...ans,
                        imageFile: null,
                        previewUrl: null, // Clear preview
                        imageUrl: null,   // Clear existing server URL if any
                    };
                }
                return ans;
            });
            return { ...prev, answers: newAnswers };
        });
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
                                                marginBottom: "15px",
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: "10px",
                                            }}
                                        >
                                            {/* 1. Checkbox/Radio */}
                                            <div style={{ paddingTop: "5px" }}>
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
                                            </div>

                                            {/* 2. Content (Input + Image) */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Input.TextArea
                                                    value={answer.answerName}
                                                    onChange={(e) =>
                                                        handleAnswerNameChange(answer.answerId, e.target.value)
                                                    }
                                                    placeholder="Nhập nội dung đáp án"
                                                    maxLength={255}
                                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                                />

                                                {/* Image Preview */}
                                                {(answer.previewUrl || answer.imageUrl) && (
                                                    <div
                                                        style={{
                                                            marginTop: "10px",
                                                            position: "relative",
                                                            display: "inline-block",
                                                        }}
                                                    >
                                                        <img
                                                            src={answer.previewUrl || answer.imageUrl}
                                                            alt="Answer"
                                                            style={{
                                                                height: "80px",
                                                                borderRadius: "8px",
                                                                border: "1px solid #d9d9d9",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                        <Button
                                                            type="primary"
                                                            danger
                                                            shape="circle"
                                                            size="small"
                                                            icon={<MinusCircleOutlined />}
                                                            onClick={() => handleRemoveAnswerImage(answer.answerId)}
                                                            style={{
                                                                position: "absolute",
                                                                top: "-5px",
                                                                right: "-5px",
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. Actions (Upload + Delete) */}
                                            <div style={{ display: "flex", gap: "5px" }}>
                                                {/* Upload Button */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id={`file-upload-${answer.answerId}`}
                                                    style={{ display: "none" }}
                                                    onChange={(e) => handleAnswerImageChange(answer.answerId, e)}
                                                />
                                                <label htmlFor={`file-upload-${answer.answerId}`}>
                                                    <Tooltip title="Thêm ảnh minh họa">
                                                        <span
                                                            className="ant-btn ant-btn-default ant-btn-icon-only"
                                                            style={{
                                                                cursor: "pointer",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                width: "32px",
                                                                height: "32px",
                                                                border: "1px solid #d9d9d9",
                                                                borderRadius: "6px",
                                                            }}
                                                        >
                                                            <UploadOutlined />
                                                        </span>
                                                    </Tooltip>
                                                </label>

                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => handleDeleteAnswer(answer.answerId)}
                                                />
                                            </div>
                                        </li>
                                    ))}
                            </ul>

                            {/* Button when list is NOT empty */}
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
                        /* --- THIS WAS THE MISSING PART --- */
                        /* Button when list IS empty */
                        <div style={{ textAlign: "center", padding: "10px 0" }}>
                            <span style={{ display: "block", marginBottom: "10px", color: "#888" }}>
                                Chưa có đáp án nào
                            </span>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddAnswer}
                                style={{ width: "100%" }}
                            >
                                Thêm đáp án
                            </Button>
                        </div>
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