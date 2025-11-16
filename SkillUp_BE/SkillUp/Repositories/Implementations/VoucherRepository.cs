using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
	public class VoucherRepository : IVoucherRepository
	{
		private readonly SkillUpContext _context;
		public VoucherRepository(SkillUpContext context)
		{
			_context = context;
		}
		public async Task AddVoucher(Voucher voucher)
		{
			await _context.Vouchers.AddAsync(voucher);
		}

	public async Task<List<Voucher>> GetVoucherByCourseId(Guid id)
	{
		return await _context.Vouchers.
			Include(v => v.VoucherTypeNavigation).
			Where(v => v.CourseId == id && v.IsActive == true).ToListAsync();
	}

		public async Task<Voucher?> GetVoucherById(Guid id)
		{
			return await _context.Vouchers.
				Include(v => v.VoucherTypeNavigation).
				FirstOrDefaultAsync(v => v.Id == id);
		}

		public async Task<Voucher?> GetVoucherByCode(string couponCode)
		{
			return await _context.Vouchers.
				Include(v => v.VoucherTypeNavigation).
				FirstOrDefaultAsync(v => v.CouponCode == couponCode && v.IsActive == true);
		}

		public async Task<List<VoucherType>> GetAllVoucherTypes()
		{
			return await _context.VoucherTypes.ToListAsync();
		}

		public async Task SaveChangesAsync()
		{
			await _context.SaveChangesAsync();
		}

		public void UpdateVoucher(Voucher voucher)
		{
			_context.Vouchers.Update(voucher);
		}
	}
}
