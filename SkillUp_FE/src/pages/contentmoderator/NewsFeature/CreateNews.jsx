import React, { useState, useEffect } from "react";
import { Input, Button, Select, Card, message, Space } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import { axiosInstance, API_ENDPOINTS } from "@/config/api";
import { useNavigate } from "react-router-dom";

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
        const token = localStorage.getItem('accessToken');
        if (!token) {
          message.error('Please sign in first!');
          navigate('/login');
          return;
        }

        // Test the token and get user info
        const response = await axiosInstance.get(API_ENDPOINTS.TEST_TOKEN);
        
        if (response.data.code === 200) {
          const userData = response.data.data[0];
          if (!userData.email) {
            message.error('User session is invalid. Please sign in again.');
            localStorage.removeItem('accessToken');
            navigate('/login');
            return;
          }
          setUserVerified(true);
        } else {
          message.error('Failed to verify user session');
          navigate('/login');
        }
      } catch (error) {
        console.error('Session verification error:', error);
        if (error.response?.status === 401) {
          message.error('Session expired. Please sign in again.');
          localStorage.removeItem('accessToken');
          navigate('/login');
        } else {
          message.error('Failed to verify user session');
        }
      }
    };

    verifyUser();
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      if (!userVerified) {
        message.error('Please wait while we verify your session...');
        return;
      }

      if (!title?.trim() || !contents?.trim()) {
        message.warning("Please fill in all fields!");
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('Please sign in first!');
        navigate('/login');
        return;
      }

      // Verify token again before submitting
      try {
        await axiosInstance.get(API_ENDPOINTS.TEST_TOKEN);
      } catch (error) {
        if (error.response?.status === 401) {
          message.error('Session expired. Please sign in again.');
          localStorage.removeItem('accessToken');
          navigate('/login');
          return;
        }
      }

      const newsData = {
        title: title.trim(),
        contents: contents.trim()
      };

      console.log('Sending news data:', newsData); // For debugging

      const response = await axiosInstance.post(API_ENDPOINTS.NEWS_CREATE, newsData)
      
      console.log('Server response:', response.data); // For debugging
      
      if (response.data.code === 201) {
        message.success(response.data.message || "News created successfully!");
        setTitle("");
        setContents("");
      } else {
        message.error(response.data.message || "Failed to create news");
      }
    } catch (error) {
      console.error('Error response:', error.response?.data); // For debugging
      
      switch (error.response?.status) {
        case 400:
          message.error(error.response.data?.message || "Invalid input data");
          break;
        case 401:
          message.error("Session expired. Please sign in again.");
          localStorage.removeItem('accessToken');
          navigate('/login');
          break;
        case 403:
          message.error("You don't have permission to create news");
          navigate('/'); // Navigate to home or appropriate page
          break;
        case 500:
          if (error.response?.data?.message?.includes("email")) {
            message.error("User session is invalid. Please sign in again.");
            localStorage.removeItem('accessToken');
            navigate('/login');
          } else {
            message.error("Server error. Please try again later.");
          }
          break;
        default:
          message.error(error.response?.data?.message || "Failed to create news: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <Card
        title="📝 Create News"
        className="w-full max-w-4xl shadow-lg rounded-2xl"
      >
        <Space direction="vertical" size="large" className="w-full">
          {/* Title Input */}
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              placeholder="Enter news title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="large"
            />
          </div>
          
          {/* TinyMCE Editor */}
          <div>
            <label className="text-sm font-medium mb-1 block">Contents</label>
          </div>
          <Editor
      apiKey='tv8otnk3960gtkqgy0sdo1csb22swjvc7bgco353p0967x7i'
      init={{
        height: 500,
        plugins: [
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
          'image', 'link', 'lists', 'media', 'searchreplace',
          'table', 'visualblocks', 'wordcount', 'fullscreen'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic underline strikethrough | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image media link | fullscreen',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        element_format: 'xhtml',
        file_picker_types: 'image',
        image_caption: true,
        image_advtab: true,
        automatic_uploads: true,
        images_upload_handler: async function (blobInfo) {
      try {
        const formData = new FormData();
        formData.append('image', blobInfo.blob(), blobInfo.filename());

        const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // On success, return the URL of the uploaded image
        return response.data.data[0].url;

      } catch (err) {
        // On failure, throw an error with a message
        throw new Error('Image upload failed. Error: ' + err.message);
      }
    }
      }}
      value={contents}
      onEditorChange={(newContent) => setContents(newContent)}
    />

          {/* Submit Button */}
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            className="w-full"
          >
            Publish News
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CreateNews;
