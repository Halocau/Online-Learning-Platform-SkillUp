using SkillUp.BussinessObjects.DTOs.Voucher;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
	public interface IVoucherService
	{
		Task<AddVoucherDTO> AddVoucher(AddVoucherDTO addVoucherDTO);
		Task<ViewVoucherDTO> GetVoucherById(Guid id);
		Task<List<ViewVoucherDTO>> GetVoucherByCourseId(Guid id);
		Task<Dictionary<Guid, List<ViewVoucherDTO>>> GetVouchersByCourseIds(List<Guid> courseIds);
		Task<AddVoucherDTO> UpdateVoucher(AddVoucherDTO addVoucherDTO, Guid voucherId);
		Task DeleteVoucher(Guid id);
		Task<ValidateVoucherResponseDTO> ValidateVoucherByCode(ValidateVoucherDTO validateVoucherDTO, decimal totalPrice);
		Task<List<VoucherType>> GetAllVoucherTypes();
		string? ValidateVoucherTime(DateTime? startTime, DateTime? endTime, bool requireFutureStart = true);
	}
}
