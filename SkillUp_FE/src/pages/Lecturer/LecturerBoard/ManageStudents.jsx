// src/pages/Lecturer/ManageStudents.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourseManagement } from './hooks/useCourseManagement';
import SummaryCards from './components/SummaryCards';
import SearchFilterBar from './components/SearchFilterBar';
import CourseTable from './components/CourseTable';
import Pagination from './components/Pagination';
import CourseInfoCard from './components/CourseInfoCard';
import StudentFilterBar from './components/StudetnFilterBar';
import StudentTable from './components/StudentTable';
import { filterCourses, filterStudents, sortCourses } from './utils/courseUtils';


function ManageStudents() {
  // Use custom hook for data management
  const { 
    courses, 
    loadingCourses, 
    getStudentsForCourse, 
    totalEnrollments 
  } = useCourseManagement();

  // Course selection and filtering
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [courseSortBy, setCourseSortBy] = useState('title');
  const [courseCurrentPage, setCourseCurrentPage] = useState(1);
  const [courseItemsPerPage, setCourseItemsPerPage] = useState(10);

  // Student filtering and pagination
  const [courseStudents, setCourseStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Handle course selection
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    const students = getStudentsForCourse(course.id);
    setCourseStudents(students);
    setSearchTerm('');
    setProgressFilter('all');
    setCurrentPage(1);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCourseStudents([]);
    setSearchTerm('');
    setProgressFilter('all');
  };

  // Filter and sort courses
  const filteredCourses = sortCourses(
    filterCourses(courses, courseSearchTerm),
    courseSortBy
  );

  // Calculate course pagination
  const courseTotalPages = Math.ceil(filteredCourses.length / courseItemsPerPage);
  const courseStartIndex = (courseCurrentPage - 1) * courseItemsPerPage;
  const courseEndIndex = courseStartIndex + courseItemsPerPage;
  const currentCourses = filteredCourses.slice(courseStartIndex, courseEndIndex);

  // Filter students
  const filteredStudents = filterStudents(courseStudents, searchTerm, progressFilter);

  // Calculate student pagination
  const totalPages = Math.ceil(filteredStudents. length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, progressFilter, itemsPerPage]);

  useEffect(() => {
    setCourseCurrentPage(1);
  }, [courseSearchTerm, courseSortBy, courseItemsPerPage]);

  // Loading state
  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Course Selection View
  if (! selectedCourse) {
    return (
      <div className="w-full py-6 px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="pl-2">
          <h1 className="text-3xl font-bold">Quản Lý Học Viên</h1>
          <p className="text-muted-foreground mt-1">
            Chọn khóa học để xem chi tiết học viên và tiến độ học tập
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards 
          courseCount={courses.length} 
          totalEnrollments={totalEnrollments} 
        />

        {/* Search and Filter */}
        <SearchFilterBar
          searchTerm={courseSearchTerm}
          onSearchChange={setCourseSearchTerm}
          sortBy={courseSortBy}
          onSortChange={setCourseSortBy}
          onClearFilters={() => {
            setCourseSearchTerm('');
            setCourseSortBy('title');
          }}
          showClearButton={courseSearchTerm || courseSortBy !== 'title'}
        />

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Danh Sách Khóa Học ({filteredCourses.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hiển thị:</span>
                <Select 
                  value={courseItemsPerPage. toString()} 
                  onValueChange={(value) => setCourseItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có khóa học công khai</h3>
                <p className="text-muted-foreground">
                  Bạn chưa có khóa học nào ở trạng thái công khai
                </p>
              </div>
            ) : (
              <>
                <CourseTable 
                  courses={currentCourses} 
                  onCourseClick={handleCourseClick} 
                />
                <Pagination
                  currentPage={courseCurrentPage}
                  totalPages={courseTotalPages}
                  startIndex={courseStartIndex}
                  endIndex={courseEndIndex}
                  totalItems={filteredCourses. length}
                  onPreviousPage={() => setCourseCurrentPage(prev => Math.max(prev - 1, 1))}
                  onNextPage={() => setCourseCurrentPage(prev => Math.min(prev + 1, courseTotalPages))}
                  onPageClick={setCourseCurrentPage}
                  itemLabel="khóa học"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Student List View
  return (
    <div className="w-full py-6 px-4 md:px-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pl-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToCourses}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{selectedCourse.title}</h1>
          <p className="text-muted-foreground mt-1">
            Danh sách học viên và tiến độ học tập
          </p>
        </div>
      </div>

      {/* Course Info Card */}
      <CourseInfoCard course={selectedCourse} students={courseStudents} />

      {/* Student Filters */}
      <StudentFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        progressFilter={progressFilter}
        onProgressFilterChange={setProgressFilter}
        onClearFilters={() => {
          setSearchTerm('');
          setProgressFilter('all');
        }}
      />

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              Danh Sách Học Viên ({filteredStudents. length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StudentTable 
            students={currentStudents}
            emptyMessage={
              searchTerm || progressFilter !== 'all' 
                ? 'Không tìm thấy học viên phù hợp'
                : 'Chưa có học viên đăng ký'
            }
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredStudents.length}
            onPreviousPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            onPageClick={setCurrentPage}
            itemLabel="học viên"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ManageStudents;