import React, { useState, useEffect } from "react";
import { Input, Button, Select, Card, message, Space } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import { axiosInstance, API_ENDPOINTS, TINYMCE_API_KEY } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
const { Option } = Select;

const CreateNews = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [loading, setLoading] = useState(false);
  const [userVerified, setUserVerified] = useState(false);

  // Verify user session and permissions when component mounts
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          message.error("Please sign in first!");
          navigate("/login");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        // if(user.roleId != 3) {
        //   message.error("You don't have permission to create news");
        //   navigate('/');
        // }
        setUserVerified(true);
      } catch (error) {
        console.error("Session verification error:", error);
        if (error.response?.status === 401) {
          message.error("Session expired. Please sign in again.");
          localStorage.removeItem("accessToken");
          navigate("/login");
        } else {
          message.error("Failed to verify user session");
        }
      }
    };

    verifyUser();
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      if (!userVerified) {
        toast.error("Please wait while we verify your session...");
        return;
      }

      if (!title?.trim() || !contents?.trim()) {
        toast.warn("Please fill in all fields!");
        return;
      }

      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please sign in first!");
        navigate("/login");
        return;
      }

      // Verify token before submitting
      try {
        await axiosInstance.get(API_ENDPOINTS.TEST_TOKEN);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }
      }

      const newsData = { title: title.trim(), contents };
      const response = await axiosInstance.post(
        API_ENDPOINTS.NEWS_CREATE,
        newsData
      );

      if (response.data.code === 201) {
        toast.success(response.data.message || "Tạo tin tức thành công!");
        setTitle("");
        setContents("");
        setTimeout(() => navigate("/contentmod/news"), 1000);
      } else {
        toast.error(response.data.message || "Tạo tin tức thất bại!");
      }
    } catch (error) {
      switch (error.response?.status) {
        case 400:
          toast.error(error.response.data?.message || "Invalid input data");
          break;
        case 401:
          toast.error("Session expired. Please sign in again.");
          localStorage.removeItem("accessToken");
          navigate("/login");
          break;
        case 403:
          toast.error("You don't have permission to create news");
          navigate("/");
          break;
        case 500:
          if (error.response?.data?.message?.includes("email")) {
            toast.error("User session is invalid. Please sign in again.");
            localStorage.removeItem("accessToken");
            navigate("/login");
          } else {
            toast.error("Server error. Please try again later.");
          }
          break;
        default:
          toast.error(
            error.response?.data?.message || "Failed to create news."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/contentmod/news")}
          className="mb-4"
        >
          Quay lại
        </Button>
        <Card
          title="📝 Tạo tin tức"
          className="w-full max-w-4xl shadow-lg rounded-2xl"
        >
          <Space direction="vertical" size="large" className="w-full">
            {/* Title Input */}
            <div>
              <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
              <Input
                placeholder="Nhập tiêu đề tin tức..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="large"
              />
            </div>

            {/* TinyMCE Editor */}
            <div>
              <label className="text-sm font-medium mb-1 block">Nội dung</label>
            </div>
            <Editor
              apiKey={TINYMCE_API_KEY}
              init={{
                height: 500,
                plugins: [
                  "anchor",
                  "autolink",
                  "charmap",
                  "codesample",
                  "emoticons",
                  "image",
                  "link",
                  "lists",
                  "media",
                  "searchreplace",
                  "table",
                  "visualblocks",
                  "wordcount",
                  "fullscreen",
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic underline strikethrough | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | image media link | fullscreen",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                element_format: "xhtml",
                file_picker_types: "image",
                image_caption: true,
                image_advtab: true,
                automatic_uploads: true,
                images_upload_handler: async function (blobInfo) {
                  try {
                    const formData = new FormData();
                    formData.append(
                      "image",
                      blobInfo.blob(),
                      blobInfo.filename()
                    );

                    const response = await axiosInstance.post(
                      API_ENDPOINTS.UPLOAD_IMAGE,
                      formData,
                      {
                        headers: { "Content-Type": "multipart/form-data" },
                      }
                    );

                    // On success, return the URL of the uploaded image
                    return response.data.data[0].url;
                  } catch (err) {
                    // On failure, throw an error with a message
                    throw new Error(
                      "Image upload failed. Error: " + err.message
                    );
                  }
                },
              }}
              value={contents}
              onEditorChange={(newContent) => setContents(newContent)}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => navigate("/contentmod/news")}>Hủy</Button>
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                Tạo tin
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default CreateNews;
