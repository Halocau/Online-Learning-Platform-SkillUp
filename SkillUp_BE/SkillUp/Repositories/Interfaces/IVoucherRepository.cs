using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
	public interface IVoucherRepository
	{
		Task AddVoucher(Voucher voucher);
		Task<Voucher?> GetVoucherById(Guid id);
		Task<List<Voucher>> GetVoucherByCourseId(Guid id);
		Task SaveChangesAsync();
		void UpdateVoucher(Voucher voucher);

	}
}
