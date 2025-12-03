// src/components/Lecturer/StudentTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getInitials, getProgressBadgeVariant } from '../utils/courseUtils';


function StudentTable({ students, emptyMessage }) {
  if (students.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Học Viên</TableHead>
              <TableHead className="min-w-[120px]">Ngày Đăng Ký</TableHead>
              <TableHead className="min-w-[180px]">Tiến Độ</TableHead>
              <TableHead className="text-right min-w-[100px]">Bài Học</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[250px]">Học Viên</TableHead>
            <TableHead className="min-w-[120px]">Ngày Đăng Ký</TableHead>
            <TableHead className="min-w-[180px]">Tiến Độ</TableHead>
            <TableHead className="text-right min-w-[100px]">Bài Học</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={`${student.studentId}-${index}`}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="border-2 border-primary/10">
                    <AvatarImage src={student.avatar} alt={student.studentName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {getInitials(student.studentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{student.studentName}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {student.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(student.enrolledAt), 'dd MMM, yyyy', { locale: vi })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={getProgressBadgeVariant(student.progressPercent)} className="min-w-[55px] justify-center">
                    {student.progressPercent}%
                  </Badge>
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${student.progressPercent}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                <span className="text-primary">{student.completedLessons}</span>
                <span className="text-muted-foreground"> / {student.totalLessons}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default StudentTable;