import { useState, useEffect } from "react";
import { MessageSquare, FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils.js";
import CommentSection from "./CommentSection.jsx";
import { getLessonSubtitle } from "@/api/subtitleAPI";

const LearningTabs = ({ lessonId, item, description, showSummary = true }) => {
  const [activeTab, setActiveTab] = useState("discussion");
  const [subtitle, setSubtitle] = useState(null);
  const [loadingSubtitle, setLoadingSubtitle] = useState(false);

  const pdfAssets =
    item?.assets?.filter(
      (asset) =>
        asset.type === "PDF" || asset.url?.endsWith(". pdf") || asset.fileUrl
    ) || [];

  // Load subtitle khi tab summary được mở
  useEffect(() => {
    if (activeTab === "summary" && lessonId && !subtitle && !loadingSubtitle) {
      loadSubtitle();
    }
  }, [activeTab, lessonId]);

  const loadSubtitle = async () => {
    try {
      setLoadingSubtitle(true);
      const data = await getLessonSubtitle(lessonId);
      if (data?.subtitleText) {
        setSubtitle(data.subtitleText);
      }
    } catch (error) {
      console.error("Error loading subtitle:", error);
    } finally {
      setLoadingSubtitle(false);
    }
  };

  const tabs = [
    {
      id: "discussion",
      label: "Thảo luận",
      icon: MessageSquare,
    },
    ...(showSummary
      ? [
          {
            id: "summary",
            label: "Nội dung",
            icon: FileText,
          },
        ]
      : []),
    {
      id: "downloads",
      label: "Tài liệu tải xuống",
      icon: Download,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Discussion Tab */}
        {activeTab === "discussion" && <CommentSection lessonId={lessonId} />}

        {activeTab === "summary" && showSummary && (
          <div className="prose max-w-none">
            {loadingSubtitle ? (
              <div className="text-center py-12 text-gray-500">
                <Loader2 className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-spin" />
                <p>Đang tải nội dung...</p>
              </div>
            ) : subtitle ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Nội dung phụ đề video
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="whitespace-pre-line font-mono text-sm">
                    {subtitle}
                  </div>
                </div>
              </>
            ) : description ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tóm tắt bài học
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  {description
                    .split("\n")
                    .map(
                      (paragraph, index) =>
                        paragraph.trim() && <p key={index}>{paragraph}</p>
                    )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Chưa có tóm tắt cho bài học này</p>
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div>
            {pdfAssets.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tài liệu có sẵn
                </h3>
                {pdfAssets.map((asset, index) => {
                  const downloadUrl = asset.fileUrl || asset.url;

                  return (
                    <a
                      key={index}
                      href={downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-blue-50 hover: bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Download className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Tài liệu {pdfAssets.length > 1 ? index + 1 : ""}
                        </p>
                        <p className="text-sm text-blue-600">PDF Document</p>
                      </div>
                      <Download className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Download className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Không có tài liệu để tải xuống</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningTabs;
