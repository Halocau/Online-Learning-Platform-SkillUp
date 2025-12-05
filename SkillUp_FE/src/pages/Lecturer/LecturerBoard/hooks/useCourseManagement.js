// src/hooks/useCourseManagement.js
import { useState, useEffect } from 'react';
import { courseAPI } from '@/api/courseAPI';
import { lecturerDashboardAPI } from '@/api/lecturerDashboardAPI';
import { calculateCourseStats } from '../utils/courseUtils';


export function useCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  const fetchCoursesAndStudents = async () => {
    try {
      setLoadingCourses(true);
      
      // Fetch courses
      const courseResponse = await courseAPI.getCoursesOfLecturer();
      const coursesData = courseResponse?. data?.data || courseResponse?.data || [];
      
      // Filter only Public courses
      const publicCourses = Array.isArray(coursesData) 
        ? coursesData.filter(course => course.status === 'Public')
        : [];
      
      // Fetch all students
      const studentResponse = await lecturerDashboardAPI.getStudents();
      const allStudents = studentResponse.data?.[0] || [];
      setAllStudentsData(allStudents);
      
      // Calculate stats
      const coursesWithStats = calculateCourseStats(publicCourses, allStudents);
      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const getStudentsForCourse = (courseId) => {
    return allStudentsData.filter(student => student.courseId === courseId);
  };

  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c.actualEnrollmentCount || 0), 
    0
  );

  return {
    courses,
    allStudentsData,
    loadingCourses,
    getStudentsForCourse,
    totalEnrollments
  };
}