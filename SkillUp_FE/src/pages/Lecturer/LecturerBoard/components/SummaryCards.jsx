// src/components/Lecturer/SummaryCards.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp } from "lucide-react";

function SummaryCards({ courseCount, totalEnrollments }) {
  const averageEnrollment =
    courseCount > 0 ? Math.round(totalEnrollments / courseCount) : 0;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">
            Khóa Học Công Khai
          </CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{courseCount}</div>
          <p className="text-xs text-blue-600 mt-1">Khóa học đang công khai</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-900">
            Tổng Học Viên
          </CardTitle>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">
            {totalEnrollments}
          </div>
          <p className="text-xs text-purple-600 mt-1">Tổng lượt đăng ký</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SummaryCards;
