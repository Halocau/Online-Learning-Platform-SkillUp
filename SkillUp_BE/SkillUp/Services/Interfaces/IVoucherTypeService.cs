using SkillUp.BussinessObjects.DTOs;

namespace SkillUp.BusinessLogic.Services
{
    public interface IVoucherTypeService
    {
        Task<List<VoucherTypeResponse>> GetAllAsync();
        Task<VoucherTypeResponse?> GetByIdAsync(int id);
        Task<VoucherTypeResponse> CreateAsync(VoucherTypeRequest request);
        Task<bool> UpdateAsync(int id, VoucherTypeRequest request);
    }
}