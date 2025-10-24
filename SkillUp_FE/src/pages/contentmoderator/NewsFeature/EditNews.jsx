import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Input, Button, Space } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import { getAllNews, updateNews } from "../../../api/newsAPI";
import { axiosInstance, API_ENDPOINTS } from "@/config/api";

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
          message.error("News not found");
          navigate("/contentmod/newsmanage");
        } else {
          setNews(found);
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to load news details");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id, navigate]);

  // Handle field change (title or contents)
  const handleChange = (key, value) => {
    setNews((prev) => ({ ...prev, [key]: value }));
  };

  // Handle update
  // In EditNews.jsx inside handleSubmit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const updateData = {
        id: news.id,
        title: news.title.trim(),
        contents: news.contents.trim(),
      };

      await updateNews(updateData);
      

      
      setTimeout(() => navigate("/contentmod/news"), 1500);
    } catch (err) {
      console.error(err);
      message.error("❌ Failed to update news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <Card
        title="✏️ Edit News"
        className="w-full max-w-4xl shadow-lg rounded-2xl"
      >
        <Space direction="vertical" size="large" className="w-full">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              placeholder="Enter news title..."
              value={news.title}
              onChange={(e) => handleChange("title", e.target.value)}
              size="large"
            />
          </div>

          {/* Author Email */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Author Email
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
            <label className="text-sm font-medium mb-1 block">Contents</label>
            <Editor
              apiKey="tv8otnk3960gtkqgy0sdo1csb22swjvc7bgco353p0967x7i"
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
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
