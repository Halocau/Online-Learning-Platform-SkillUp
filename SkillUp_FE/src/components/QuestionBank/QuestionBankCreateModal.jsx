import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Checkbox, Radio, Input, Button, Space, Upload, Select, Tooltip } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, CheckOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import RichTextEditor from "../Editor/RichText";

const QuestionBankCreateModal = ({ open, onClose, onCreate, sectionId }) => {
    const [fileList, setFileList] = useState([]);
    const [editingAnswerId, setEditingAnswerId] = useState(null);

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
                    imageUrl: finalAnswerUrl // The string URL (or null)
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

    const getCharacterCount = (htmlString) => {
        if (!htmlString) return 0;
        const tempElement = document.createElement("div");
        tempElement.innerHTML = htmlString;
        const text = tempElement.textContent || tempElement.innerText || "";
        return text.length;
    };

    const currentLength = getCharacterCount(questionData.title);
    const isOverLimit = currentLength > 255;

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
                styles={{ lable: { fontWeight: 600, width: "160px" }, content: { wordBreak: "break-word", padding: "12px 16px" } }}
            >
                {/* Question Title */}
                <Descriptions.Item label="Câu hỏi">
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

                        {/* Title Textarea (Left) */}
                        {/*<Input.TextArea
                            value={questionData.title}
                            onChange={handleTitleChange}
                            placeholder="Nhập câu hỏi"
                            maxLength={255}
                            autoSize={{ minRows: 4, maxRows: 4 }}
                            style={{ width: "100%" }}
                            required
                        /> */}

                        <div className="short-editor-wrapper" style={{ border: isOverLimit ? '1px solid red' : 'none' }}
                        >
                            <RichTextEditor
                                value={questionData.title}
                                onChange={(content) => {
                                    // Update state regardless of length (prevents editor glitches)
                                    handleTitleChange({ target: { value: content } });
                                }}
                                placeholder="Nhập câu hỏi"
                            />
                        </div>

                        {/* The Character Counter */}
                        <div style={{
                            textAlign: 'right',
                            fontSize: '12px',
                            marginTop: '4px',
                            // Turn text red if over limit
                            color: isOverLimit ? 'red' : '#888'
                        }}>
                        </div>

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
                    {currentLength} / 255
                    {isOverLimit && <span style={{ marginLeft: '5px', color: 'red' }}>(Quá giới hạn ký tự)</span>}
                </Descriptions.Item>

                {/* Answers */}
                <Descriptions.Item label="Đáp án">
                    {questionData.answers && questionData.answers.length > 0 ? (
                        <>
                            <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
                                {questionData.answers
                                    .filter((ans) => ans.isActive !== false)
                                    .map((answer) => {
                                        const isEditing = editingAnswerId === answer.answerId;

                                        return (
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

                                                {/* 2. Content (Editor OR Static Display) */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {isEditing ? (
                                                        /* --- EDIT MODE: Show Editor --- */
                                                        <div className="short-editor-wrapper">
                                                            <RichTextEditor
                                                                value={answer.answerName}
                                                                onChange={(content) =>
                                                                    handleAnswerNameChange(answer.answerId, content)
                                                                }
                                                                placeholder="Nhập nội dung đáp án"
                                                            />
                                                        </div>
                                                    ) : (
                                                        /* --- VIEW MODE: Show Static HTML --- */
                                                        <div
                                                            onClick={() => setEditingAnswerId(answer.answerId)}
                                                            style={{
                                                                border: "1px solid #d9d9d9",
                                                                borderRadius: "6px",
                                                                padding: "4px 11px",
                                                                minHeight: "32px",
                                                                cursor: "pointer",
                                                                backgroundColor: "#fafafa",
                                                                transition: "all 0.3s",
                                                            }}
                                                            /* Render HTML content safely */
                                                            dangerouslySetInnerHTML={{
                                                                __html: answer.answerName || "<span style='color:#ccc'>Nhập nội dung đáp án...</span>"
                                                            }}
                                                        />
                                                    )}

                                                    {/* Image Preview (Same as before) */}
                                                    {(answer.previewUrl || answer.imageUrl) && (
                                                        <div style={{ marginTop: "10px", position: "relative", display: "inline-block" }}>
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
                                                                style={{ position: "absolute", top: "-5px", right: "-5px" }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 3. Actions (Upload + Done/Delete) */}
                                                <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                                                    {/* Only show Upload if NOT editing (optional preference) */}
                                                    {!isEditing && (
                                                        <>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                id={`file-upload-${answer.answerId}`}
                                                                style={{ display: "none" }}
                                                                onChange={(e) => handleAnswerImageChange(answer.answerId, e)}
                                                            />
                                                            <label htmlFor={`file-upload-${answer.answerId}`}>
                                                                <Tooltip title="Thêm ảnh minh họa">
                                                                    <span className="ant-btn ant-btn-default ant-btn-icon-only" style={{ width: "32px", height: "32px", border: "1px solid #d9d9d9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: 'pointer' }}>
                                                                        <UploadOutlined />
                                                                    </span>
                                                                </Tooltip>
                                                            </label>
                                                        </>
                                                    )}

                                                    {/* If Editing: Show CHECK button. If Viewing: Show DELETE button */}
                                                    {isEditing ? (
                                                        <Tooltip title="Xong">
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                icon={<CheckOutlined />}
                                                                onClick={() => setEditingAnswerId(null)} // Exit edit mode
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Xóa đáp án">
                                                            <Button
                                                                type="text"
                                                                danger
                                                                icon={<MinusCircleOutlined />}
                                                                onClick={() => handleDeleteAnswer(answer.answerId)}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                            </ul>

                            {/* Add Answer Button */}
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    handleAddAnswer();
                                    // Optional: If you can get the ID of the new answer, 
                                    // call setEditingAnswerId(newId) here to auto-open it.
                                }}
                                style={{ marginTop: "8px", width: "100%" }}
                            >
                                Thêm đáp án
                            </Button>
                        </>
                    ) : (
                        /* Empty State */
                        <div style={{ textAlign: "center", padding: "10px 0" }}>
                            <span style={{ display: "block", marginBottom: "10px", color: "#888" }}>
                                Chưa có đáp án nào
                            </span>
                            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddAnswer} style={{ width: "100%" }}>
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
                <Button type="primary" loading={loading} onClick={handleSave} disabled={isOverLimit}>
                    Lưu
                </Button>
            </Space>
        </Modal >

    );
};

export default QuestionBankCreateModal;