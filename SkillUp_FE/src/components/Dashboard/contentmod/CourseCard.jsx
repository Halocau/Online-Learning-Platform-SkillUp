// src/components/contentmoderator/CourseCard.jsx
import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

export const CourseCard = ({ course, status, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
      status === "pending"
        ? "bg-amber-50/30 border-amber-100 hover:border-amber-200"
        : "bg-white border-gray-100 hover:border-blue-200"
    }`}
  >
    <img
      src={course.image}
      alt={course.title}
      className="w-16 h-16 rounded-xl object-cover shadow-sm"
    />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-800 truncate">{course. title}</p>
      <div className="flex items-center gap-2 mt-1. 5 text-xs text-gray-500">
        <UserIcon className="w-3. 5 h-3.5" />
        <span>{course.lecturerName}</span>
        <span>•</span>
        <span>{dayjs(course.createdAt).format("DD/MM/YYYY")}</span>
      </div>
    </div>
  </div>
);