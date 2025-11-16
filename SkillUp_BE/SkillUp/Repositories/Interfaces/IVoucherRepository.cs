using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
	public interface IVoucherRepository
	{
		Task AddVoucher(Voucher voucher);
		Task<Voucher?> GetVoucherById(Guid id);
		Task<List<Voucher>> GetVoucherByCourseId(Guid id);
		Task<Dictionary<Guid, List<Voucher>>> GetVouchersByCourseIds(List<Guid> courseIds);
		Task<Voucher?> GetVoucherByCode(string couponCode);
		Task<List<VoucherType>> GetAllVoucherTypes();
		Task SaveChangesAsync();
		void UpdateVoucher(Voucher voucher);

	}
}
