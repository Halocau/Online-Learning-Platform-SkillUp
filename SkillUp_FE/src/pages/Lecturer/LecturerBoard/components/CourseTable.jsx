// src/components/Lecturer/CourseTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Star } from 'lucide-react';

function CourseTable({ courses, onCourseClick }) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Không tìm thấy khóa học</h3>
        <p className="text-muted-foreground">
          Không có khóa học nào phù hợp với bộ lọc hiện tại
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[300px]">Khóa Học</TableHead>
            <TableHead className="text-center min-w-[120px]">Học Viên</TableHead>
            <TableHead className="text-center min-w-[120px]">Đang Học</TableHead>
            <TableHead className="text-center min-w-[120px]">Hoàn Thành</TableHead>
            <TableHead className="text-center min-w-[100px]">Đánh Giá</TableHead>
            <TableHead className="text-right min-w-[120px]">Giá</TableHead>
            <TableHead className="text-center min-w-[100px]">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow 
              key={course.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onCourseClick(course)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                    {course.image ?  (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold line-clamp-2">{course.title}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">{course.actualEnrollmentCount}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-medium">
                  {course.inProgressCount}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="default" className="font-medium">
                  {course.completedCount}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {course.rating > 0 ? (
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{course.rating. toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {course.price > 0 ?  (
                  <span className="text-primary font-semibold">
                    {course.price.toLocaleString('vi-VN')} ₫
                  </span>
                ) : (
                  <Badge variant="secondary">Miễn phí</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCourseClick(course);
                  }}
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CourseTable;