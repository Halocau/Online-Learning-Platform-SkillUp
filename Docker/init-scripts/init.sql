-- ============================================
-- SkillUp Database Initialization Script
-- ============================================
-- Script này chỉ tạo database SkillUp
-- Các bảng và dữ liệu sẽ được thêm sau bằng tool khác
-- ============================================

-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SkillUp')
BEGIN
    CREATE DATABASE SkillUp;
    PRINT 'Database SkillUp created successfully';
END
ELSE
BEGIN
    PRINT 'Database SkillUp already exists';
END
GO

PRINT 'Database initialization completed!';
PRINT 'You can now use external tools to create tables and manage data.';
GO