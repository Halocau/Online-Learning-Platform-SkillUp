using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository _lessonRepository;

        // Constructor injection để sử dụng repository
        public LessonService(ILessonRepository lessonRepository)
        {
            _lessonRepository = lessonRepository;
        }

        //public async Task<Asset> AddAssetToLessonAsync(Guid lessonId, Asset asset)
        //{
        //    var lesson = await _lessonRepository.GetLessonByIdAsync(lessonId);
        //    if (lesson == null)
        //    {
        //        throw new Exception("Lesson not found");
        //    }

        //    // Xử lý tùy thuộc vào loại tài liệu (Text hoặc Video)
        //    if (lesson.Type == "Video" || lesson.Type == "Text")
        //    {
        //        return await _assetRepository.AddAssetAsync(lessonId, asset);
        //    }
        //    else
        //    {
        //        throw new Exception("Invalid asset type");
        //    }
        //}

        public async Task<Lesson> CreateLessonAsync(Lesson lesson)
        {
            return await _lessonRepository.CreateLessonAsync(lesson);
        }

        public async Task<bool> DeleteLessonAsync(Guid id)
        {
            return await _lessonRepository.DeleteLessonAsync(id);
        }

        public async Task<IEnumerable<Lesson>> GetActiveLessonsAsync()
        {
            return await _lessonRepository.GetActiveLessonsAsync();
        }

        public async Task<IEnumerable<Lesson>> GetAllLessonsAsync()
        {
            return await _lessonRepository.GetAllLessonsAsync();
        }

        public async Task<Lesson> GetLessonByIdAsync(Guid id)
        {
            return await _lessonRepository.GetLessonByIdAsync(id);
        }

        public async Task<Lesson> UpdateLessonAsync(Lesson lesson)
        {
            return await _lessonRepository.UpdateLessonAsync(lesson);
        }
    }
}
