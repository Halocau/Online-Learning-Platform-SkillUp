using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LecturerRepository : ILecturerRepository
    {
        private readonly SkillUpContext _context;

        public LecturerRepository(SkillUpContext context)
        {
            _context = context;
        }

        // Lấy Lecturer theo AccountId
        public async Task<Lecturer> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.Lecturers
                .Include(x => x.Account) // Đảm bảo rằng bạn sẽ lấy thông tin về Account (nếu cần thiết)
                .FirstOrDefaultAsync(x => x.AccountId == accountId);
        }

        // Cập nhật thông tin Lecturer
        public async Task<Lecturer> UpdateAsync(Lecturer lecturer)
        {
            _context.Entry(lecturer).State = EntityState.Modified;
            return lecturer;
        }

        // Lưu thay đổi
        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        // Thêm Lecturer mới
        public async Task<Lecturer> AddAsync(Lecturer lecturer)
        {
            _context.Lecturers.Add(lecturer);
            return lecturer;
        }

        // Lấy tất cả Lecturer
        public async Task<List<Lecturer>> GetAllLecturersAsync()
        {
            return await _context.Lecturers
                .Include(x => x.Account) // Đảm bảo lấy thông tin về Account nếu cần
                .ToListAsync();
        }
        //public async Task<Lecturer?> GetLecturerByAccountIdAsync(Guid accountId)
        //{
        //    return await _context.Lecturers
        //         .FirstOrDefaultAsync(l => l.AccountId == accountId);
        //}
        public async Task<Lecturer?> GetLecturerByAccountIdAsync(Guid accountId)
        {
            return await _context.Lecturers
                .AsNoTracking() 
                .Include(x => x.Account) 
                .FirstOrDefaultAsync(x => x.AccountId == accountId);
        }

        public async Task<Lecturer?> GetLecturerByIdAsync(Guid lecturerId)
        {
            // Sử dụng AsNoTracking để tối ưu hiệu suất vì chỉ đọc dữ liệu
            return await _context.Lecturers
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(x => x.Id == lecturerId);
        }


    }
}
