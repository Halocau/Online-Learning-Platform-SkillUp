import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Input, Button, Space } from "antd";
import { ArrowLeft } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { getAllNews, updateNews } from "../../../api/newsAPI";
import { axiosInstance, API_ENDPOINTS, TINYMCE_API_KEY } from "@/config/api";
import { toast } from "sonner";

export default function EditNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState({
    title: "",
    email: "",
    contents: "",
    date: "",
  });

  // Fetch news details
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const list = await getAllNews();
        const found = list.find((n) => n.id === id);
        if (!found) {
          toast.error("Không tìm thấy tin tức");
          navigate("/contentmod/newsmanage");
        } else {
          setNews(found);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin tin tức");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id, navigate]);

  // Handle field change
  const handleChange = (key, value) => {
    setNews((prev) => ({ ...prev, [key]: value }));
  };

  // Handle update
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const updateData = {
        id: news.id,
        title: news.title.trim(),
        contents: news.contents.trim(),
      };

      await updateNews(updateData);

      toast.success("Cập nhật tin tức thành công!");
      setTimeout(() => navigate("/contentmod/news"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật tin tức thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Go Back Button */}
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/contentmod/news")}
          className="mb-4"
        >
          Quay lại
        </Button>

        <Card
          title="✏️ Chỉnh sửa tin tức"
          className="w-full shadow-lg rounded-2xl"
        >
          <Space direction="vertical" size="large" className="w-full">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
              <Input
                placeholder="Nhập tiêu đề tin tức..."
                value={news.title}
                onChange={(e) => handleChange("title", e.target.value)}
                size="large"
              />
            </div>

            {/* Author Email */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Email tác giả
              </label>
              <Input
                value={news.email}
                size="large"
                readOnly
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </div>

            {/* TinyMCE */}
            <div>
              <label className="text-sm font-medium mb-1 block">Nội dung</label>
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
                    "undo redo | blocks | bold italic underline strikethrough | " +
                    "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
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

                      return response.data.data[0].url;
                    } catch (err) {
                      throw new Error("Image upload failed: " + err.message);
                    }
                  },
                }}
                value={news.contents}
                onEditorChange={(newContent) =>
                  handleChange("contents", newContent)
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => navigate("/contentmod/news")}>Hủy</Button>
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                Lưu thay đổi
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
}
