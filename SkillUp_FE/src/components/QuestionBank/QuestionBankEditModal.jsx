import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Checkbox, Radio, Input, Button, Space, Upload, Select, Alert, Tooltip } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, CheckOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import RichTextEditor from "../Editor/RichText";

const QuestionBankEditModal = ({ open, onClose, questionBankObj, onSave }) => {
  const [questionData, setQuestionData] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState(null);

  useEffect(() => {
    if (questionBankObj) {
      // Deep clone to avoid mutating parent state
      const clonedData = JSON.parse(JSON.stringify(questionBankObj));
      setQuestionData(clonedData);
      // Set file list if question has an image
      if (clonedData.image) {
        setFileList([{
          uid: '-1',
          name: 'image',
          status: 'done',
          url: clonedData.image,
        }]);
      } else {
        setFileList([]);
      }
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
    return response.data.data[0].url;
  };

  const handleQuestionImageChange = (file) => {
    setQuestionData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSave = async () => {
    // 1. Validation
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
      let mainQuestionImageUrl = questionData.image;
      if (questionData.image instanceof File) {
        mainQuestionImageUrl = await uploadImage(questionData.image);
      }

      const processedAnswers = await Promise.all(questionData.answers.map(async (ans) => {
        let finalUrl = ans.imageUrl || ans.image || null;
        if (ans.imageFile instanceof File) {
          finalUrl = await uploadImage(ans.imageFile);
        }
        return {
          ...ans,
          image: finalUrl,

          // Cleanup: Remove frontend-only fields so they don't get sent to API
          imageFile: undefined,
          previewUrl: undefined,
          imageUrl: undefined
        };
      }));

      const finalData = {
        ...questionData,
        image: mainQuestionImageUrl,
        answers: processedAnswers
      };
      if (onSave) await onSave(finalData);

      toast.success("Lưu thành công!");
      onClose();

    } catch (error) {
      console.error("Lưu thất bại:", error);
      toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an answer
  const handleDeleteAnswer = async (answerId) => {
    const updatedData = {
      ...questionData,
      answers: questionData.answers.map((ans) =>
        ans.answerId === answerId ? { ...ans, answerName:'', isCorrect: false, isActive: false } : ans
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

  const handleAnswerImageChange = (answerId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Validate size/type here

    setQuestionData((prev) => {
      const newAnswers = prev.answers.map((ans) => {
        if (ans.answerId === answerId) {
          return {
            ...ans,
            imageFile: file, // File to be uploaded
            previewUrl: URL.createObjectURL(file), // Local preview
            // We do NOT clear imageUrl here yet, so we know what to replace/delete on backend if needed,
            // but the UI will prioritize showing previewUrl.
          };
        }
        return ans;
      });
      return { ...prev, answers: newAnswers };
    });
  };

  // Handle removing the image (both new preview or existing URL)
  const handleRemoveAnswerImage = (answerId) => {
    setQuestionData((prev) => {
      const newAnswers = prev.answers.map((ans) => {
        if (ans.answerId === answerId) {
          return {
            ...ans,
            imageFile: null,
            previewUrl: null,
            image: null, // Mark as removed so backend knows to delete it
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
  const isAnswerOverLimit = questionData.answers.some(ans => getCharacterCount(ans.answerName) > 255);

  const activeAnswerCount = questionData.answers
    ? questionData.answers.filter(ans => ans.isActive !== false).length
    : 0;

  return (
    <Modal
      title="Sửa câu hỏi"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={1000}
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
            {/* <Input.TextArea
              value={questionData.title}
              onChange={handleTitleChange}
              placeholder="Nhập câu hỏi"
              maxLength={255}
              autoSize={{ minRows: 4, maxRows: 4 }}
              style={{ width: "100%" }}
              required
            /> */}

            <RichTextEditor
              value={questionData.title}
              onChange={(content) => {
                // Update state regardless of length (prevents editor glitches)
                handleTitleChange({ target: { value: content } });
              }}
              placeholder="Nhập câu hỏi"
              minHeight={100}
              maxHeight={250}
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
                    // 1. Determine if this specific answer is being edited
                    const isEditing = editingAnswerId === answer.answerId;

                    return (
                      <li
                        key={answer.answerId}
                        style={{
                          marginBottom: "15px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          flexWrap: "nowrap", // CRITICAL: Keeps everything on one line
                        }}
                      >
                        {/* --- COLUMN 1: CHECKBOX/RADIO --- */}
                        <div style={{ paddingTop: "5px", flexShrink: 0 }}>
                          {questionData.type === "MultiChoice" ? (
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

                        {/* --- COLUMN 2: EDITOR / STATIC VIEW --- */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {isEditing ? (
                            /* EDIT MODE: Show RichTextEditor */
                            <div className="short-editor-wrapper">
                              <RichTextEditor
                                value={answer.answerName}
                                onChange={(content) =>
                                  handleAnswerNameChange(answer.answerId, content)
                                }
                                placeholder="Nhập nội dung đáp án"
                              />
                              {getCharacterCount(answer.answerName.trim())} / 255
                              {isAnswerOverLimit && <span style={{ marginLeft: '5px', color: 'red' }}>(Một hoặc nhiều câu trả lời vượt quá giới hạn ký tự)</span>}
                            </div>
                          ) : (
                            /* VIEW MODE: Show Static HTML */
                            <div
                              onClick={() => setEditingAnswerId(answer.answerId)}
                              style={{
                                border: "1px solid #d9d9d9",
                                borderRadius: "6px",
                                padding: "4px 11px",
                                minHeight: "32px",
                                cursor: "pointer",
                                backgroundColor: "#fafafa",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                              }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  answer.answerName ||
                                  "<span style='color:#ccc'>Nhập nội dung đáp án...</span>",
                              }}
                            />
                          )}

                          {/* IMAGE PREVIEW */}
                          {(answer.previewUrl || answer.image) && (
                            <div
                              style={{
                                marginTop: "10px",
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <img
                                src={answer.previewUrl || answer.image}
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

                        {/* --- COLUMN 3: ACTIONS --- */}
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            flexShrink: 0,
                            alignItems: "center",
                          }}
                        >
                          {/* Show Upload Button only when NOT editing (cleaner UI) */}
                          {!isEditing && (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                id={`edit-file-upload-${answer.answerId}`}
                                style={{ display: "none" }}
                                onChange={(e) =>
                                  handleAnswerImageChange(answer.answerId, e)
                                }
                              />
                              <label htmlFor={`edit-file-upload-${answer.answerId}`}>
                                <Tooltip title="Thêm/Sửa ảnh minh họa">
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
                            </>
                          )}

                          {/* Toggle: Delete vs Check Button */}
                          {isEditing ? (
                            <Tooltip title="Xong">
                              <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => setEditingAnswerId(null)}
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
                disabled={activeAnswerCount >= 7}
                onClick={handleAddAnswer}
                style={{ marginTop: "8px", width: "100%" }}
              >
                Thêm đáp án
              </Button>
            </>
          ) : (
            /* --- EMPTY STATE --- */
            <>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span
                  style={{ display: "block", marginBottom: "10px", color: "#888" }}
                >
                  Không có đáp án nào
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

              {questionData.answers.length > 0 &&
                !questionData.answers.some((ans) => ans.isCorrect) && (
                  <Alert
                    message="Vui lòng chọn ít nhất một đáp án đúng."
                    type="warning"
                    showIcon
                    style={{ marginTop: "10px" }}
                  />
                )}
            </>
          )}
        </Descriptions.Item>;

        <Descriptions.Item label="Loại câu hỏi">
          <Select
            defaultValue={questionData.type}
            value={questionData.type}
            onChange={(value) => {
              setQuestionData((prev) => ({
                ...prev,
                type: value,
                answers: prev.answers.map((a) => ({ ...a, isCorrect: false }))
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
        <Button type="primary" loading={loading} onClick={handleSave} disabled={isOverLimit || isAnswerOverLimit}>
          Lưu
        </Button>
      </Space>
    </Modal >

  );
};

export default QuestionBankEditModal;