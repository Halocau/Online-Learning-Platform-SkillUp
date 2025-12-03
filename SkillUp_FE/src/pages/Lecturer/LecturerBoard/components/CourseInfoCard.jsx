// src/components/Lecturer/CourseInfoCard.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

function CourseInfoCard({ course, students }) {
  const completedCount = students.filter(s => s.progressPercent === 100).length;
  const inProgressCount = students.filter(s => s.progressPercent > 0 && s.progressPercent < 100).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 shadow-md">
            {course.image ?  (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="p-2. 5 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <div className="text-sm text-muted-foreground">Học Viên Đăng Ký</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Đã Hoàn Thành</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressCount}</div>
                  <div className="text-sm text-muted-foreground">Đang Học</div>
                </div>
              </div>
            </div>
            
            {course.price > 0 && (
              <div className="pt-3 border-t">
                <span className="text-sm text-muted-foreground">Giá khóa học: </span>
                <span className="text-primary font-semibold text-lg ml-2">
                  {course.price. toLocaleString('vi-VN')} ₫
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseInfoCard;