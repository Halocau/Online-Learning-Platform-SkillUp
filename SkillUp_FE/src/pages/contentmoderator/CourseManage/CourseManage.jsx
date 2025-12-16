// src/pages/contentmoderator/CourseManagement.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Spin } from "antd";
import { courseAPI } from "@/api/courseAPI";
import { getGroupedCourseReports } from "@/api/courseReportAPI"; // Updated import
import CoursePublicTab from "./CoursePublicTab";
import CoursePendingTab from "./CoursePendingtab";
import CourseReportTab from "./CourseReportTab";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("public");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch courses
      const courseResponse = await courseAPI.getAllCourses();
      setCourses(courseResponse.data?.data || []);

      // Fetch grouped reports
      const reportResponse = await getGroupedCourseReports();
      setReports(reportResponse.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data?.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
      console.error(error);
    }
  };

  // Calculate total report count from grouped data
  const reportCount =
    Array.isArray(reports) && Array.isArray(reports[0])
      ? reports[0].reduce((sum, group) => sum + group.totalCount, 0)
      : 0;

  const publicCount = courses.filter((c) => c.status === "Public").length;
  const pendingCount = courses.filter((c) => c.status === "Pending").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border-b">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab("public")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "public"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Đã công khai
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "public"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                {publicCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "pending"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Đang chờ duyệt
              <span
                className={`ml-2 px-2 py-0. 5 rounded-full text-xs ${activeTab === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "reports"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Báo cáo khóa học
              <span
                className={`ml-2 px-2 py-0. 5 rounded-full text-xs ${activeTab === "reports"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                {reportCount}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "public" && (
          <CoursePublicTab courses={courses} fetchCourses={fetchCourses} />
        )}
        {activeTab === "pending" && (
          <CoursePendingTab courses={courses} fetchCourses={fetchCourses} />
        )}
        {activeTab === "reports" && (
          <CourseReportTab reports={reports} fetchReports={fetchData} />
        )}
      </div>
    </div>
  );
}
