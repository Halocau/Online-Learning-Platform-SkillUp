import { useState, useEffect } from 'react';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContentModerator, setIsContentModerator] = useState(false);
  const [isSystemModerator, setIsSystemModerator] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role;
    
    setUserRole(role);
    setIsStudent(role === 'Student');
    setIsLecturer(role === 'Lecturer');
    setIsAdmin(role === 'Admin');
    setIsContentModerator(role === 'Content Morderator');
    setIsSystemModerator(role === 'System Morderator');
  }, []);

  return {
    userRole,
    isStudent,
    isLecturer,
    isAdmin,
    isContentModerator,
    isSystemModerator,
  };
};