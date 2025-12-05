// src/components/Lecturer/SearchFilterBar. jsx
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

function SearchFilterBar({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  onClearFilters,
  showClearButton 
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khóa học theo tên..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Tên A-Z</SelectItem>
              <SelectItem value="students-desc">Học viên: Nhiều nhất</SelectItem>
              <SelectItem value="students-asc">Học viên: Ít nhất</SelectItem>
              <SelectItem value="rating-desc">Đánh giá: Cao nhất</SelectItem>
              <SelectItem value="rating-asc">Đánh giá: Thấp nhất</SelectItem>
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

export default SearchFilterBar;