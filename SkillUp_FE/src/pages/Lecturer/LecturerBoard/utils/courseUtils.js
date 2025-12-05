// src/utils/courseUtils.js

export const getProgressBadgeVariant = (percent) => {
  if (percent === 0) return 'secondary';
  if (percent === 100) return 'default';
  return 'outline';
};

export const getInitials = (name) => {
  if (!name) return '? ';
  return name
    .split(' ')
    . map(n => n[0])
    . join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getPageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages. push(1);
      pages. push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages. push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
};

export const filterStudents = (students, searchTerm, progressFilter) => {
  return students.filter(student => {
    const matchesSearch = 
      student.studentName?. toLowerCase().includes(searchTerm. toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgress = 
      progressFilter === 'all' ||
      (progressFilter === 'completed' && student.progressPercent === 100) ||
      (progressFilter === 'in-progress' && student.progressPercent > 0 && student.progressPercent < 100) ||
      (progressFilter === 'not-started' && student. progressPercent === 0);

    return matchesSearch && matchesProgress;
  });
};

export const sortCourses = (courses, sortBy) => {
  return [...courses].sort((a, b) => {
    switch (sortBy) {
      case 'students-desc':
        return b.actualEnrollmentCount - a.actualEnrollmentCount;
      case 'students-asc':
        return a.actualEnrollmentCount - b.actualEnrollmentCount;
      case 'rating-desc':
        return (b.rating || 0) - (a. rating || 0);
      case 'rating-asc':
        return (a.rating || 0) - (b.rating || 0);
      case 'title':
      default:
        return a.title.localeCompare(b. title);
    }
  });
};

export const filterCourses = (courses, searchTerm) => {
  return courses.filter(course => 
    course.title?. toLowerCase().includes(searchTerm. toLowerCase())
  );
};

export const calculateCourseStats = (courses, allStudents) => {
  return courses.map(course => {
    const studentsInCourse = allStudents.filter(
      student => student.courseId === course.id
    );
    return {
      ... course,
      actualEnrollmentCount: studentsInCourse.length,
      completedCount: studentsInCourse.filter(s => s.progressPercent === 100).length,
      inProgressCount: studentsInCourse.filter(s => s.progressPercent > 0 && s.progressPercent < 100).length
    };
  });
};