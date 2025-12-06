// src/components/Lecturer/StudentFilterBar.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function StudentFilterBar({ 
  searchTerm, 
  onSearchChange, 
  progressFilter, 
  onProgressFilterChange, 
  onClearFilters 
}) {
  const showClearButton = searchTerm || progressFilter !== 'all';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên học viên hoặc email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={progressFilter} onValueChange={onProgressFilterChange}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Lọc theo tiến độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất Cả Tiến Độ</SelectItem>
              <SelectItem value="not-started">Chưa Bắt Đầu</SelectItem>
              <SelectItem value="in-progress">Đang Học</SelectItem>
              <SelectItem value="completed">Hoàn Thành</SelectItem>
            </SelectContent>
          </Select>
          {showClearButton && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="whitespace-nowrap"
            >
              Xóa Bộ Lọc
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentFilterBar;