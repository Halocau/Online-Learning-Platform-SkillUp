using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.DataAccess.Repositories
{
    public class VoucherTypeRepository : IVoucherTypeRepository
    {
        private readonly SkillUpContext _context; 

        public VoucherTypeRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<List<VoucherType>> GetVoucherTypesAsync()
        {
            return await _context.VoucherTypes.ToListAsync();
        }

        public async Task<VoucherType?> GetVoucherTypeByIdAsync(int id)
        {
            return await _context.VoucherTypes.FindAsync(id);
        }

        public async Task AddVoucherTypeAsync(VoucherType voucherType)
        {
            _context.VoucherTypes.Add(voucherType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVoucherTypeAsync(VoucherType voucherType)
        {
            _context.VoucherTypes.Update(voucherType);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> IsDuplicateAsync(string name, int percentage)
        {
            // Trả về true nếu tìm thấy bản ghi nào thỏa mãn CẢ 2 điều kiện
            return await _context.VoucherTypes
                                 .AnyAsync(x => x.Name == name && x.Percentage == percentage);
        }
    }
}