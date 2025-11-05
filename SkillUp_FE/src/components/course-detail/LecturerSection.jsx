// src/components/course-detail/InstructorSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, GraduationCap } from "lucide-react";

export default function LecturerSection({ lecturer, rating, enrollmentCount }) {
  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Giảng viên</h2>
        </div>
        
        <div className="flex gap-6">
          <Avatar className="w-24 h-24 border-4 border-[#FFD54F]">
            <AvatarImage src={lecturer.avartar} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-[#FFD54F] to-[#FFC107] text-gray-900">
              {lecturer.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {lecturer.fullName}
            </h3>
            <p className="text-[#FFD54F] font-semibold mb-2">{lecturer.title}</p>
            <p className="text-gray-600 mb-4">{lecturer.profession}</p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 bg-[#FFD54F]/10 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 fill-[#FFD54F] text-[#FFD54F]" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-sm text-gray-600">Đánh giá</span>
              </div>
              
              <div className="flex items-center gap-2 bg-[#FFD54F]/10 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-[#FFD54F]" />
                <span className="font-semibold">{enrollmentCount.toLocaleString()}</span>
                <span className="text-sm text-gray-600">Học viên</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}