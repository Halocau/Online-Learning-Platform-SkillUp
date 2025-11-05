// src/components/course-detail/CourseCurriculumSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, FileText, BookOpen, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CourseCurriculumSection({ sections }) {
  if (!sections || sections.length === 0) {
    return (
      <Card className="border-2 border-[#FFD54F]/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#FFD54F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
          </div>
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nội dung khóa học sẽ được cập nhật sớm</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
        </div>
        
        <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
          <span>{sections.length} chương</span>
          <span>•</span>
          <span>{sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0)} bài học</span>
        </div>

        <div className="space-y-3">
          {sections.map((section, idx) => (
            <SectionAccordion key={idx} section={section} index={idx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionAccordion({ section, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#FFD54F]/50 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-8 h-8 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-sm text-gray-900">{index + 1}</span>
          </div>
          <span className="font-semibold text-gray-900">
            {section.title || `Chương ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {section.lectures?.length || 0} bài học
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 bg-gray-50/50 space-y-2">
          {section.lectures?.map((lecture, lIdx) => (
            <div
              key={lIdx}
              className="flex items-center gap-3 py-3 px-4 bg-white rounded-lg border border-gray-200"
            >
              <PlayCircle className="w-4 h-4 text-[#FFD54F] flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1">{lecture.title}</span>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}