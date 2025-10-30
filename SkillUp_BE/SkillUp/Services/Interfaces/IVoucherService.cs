using SkillUp.BussinessObjects.DTOs.Voucher;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
	public interface IVoucherService
	{
		Task<AddVoucherDTO> AddVoucher(AddVoucherDTO addVoucherDTO);
		Task<ViewVoucherDTO> GetVoucherById(Guid id);
		Task<List<ViewVoucherDTO>> GetVoucherByCourseId(Guid id);
		Task<AddVoucherDTO> UpdateVoucher(AddVoucherDTO addVoucherDTO, Guid voucherId);
		Task DeleteVoucher(Guid id);
	}
}
