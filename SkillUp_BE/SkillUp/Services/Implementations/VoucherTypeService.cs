using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.Models;
using SkillUp.DataAccess.Repositories;

namespace SkillUp.BusinessLogic.Services
{
    public class VoucherTypeService : IVoucherTypeService
    {
        private readonly IVoucherTypeRepository _repository;

        public VoucherTypeService(IVoucherTypeRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<VoucherTypeResponse>> GetAllAsync()
        {
            var entities = await _repository.GetVoucherTypesAsync();
            return entities.Select(x => new VoucherTypeResponse
            {
                Id = x.Id,
                Name = x.Name,
                Percentage = x.Percentage
            }).ToList();
        }

        public async Task<VoucherTypeResponse?> GetByIdAsync(int id)
        {
            var entity = await _repository.GetVoucherTypeByIdAsync(id);
            if (entity == null) return null;

            return new VoucherTypeResponse
            {
                Id = entity.Id,
                Name = entity.Name,
                Percentage = entity.Percentage
            };
        }

        public async Task<VoucherTypeResponse> CreateAsync(VoucherTypeRequest request)
        {
            if (request.Percentage < 0 || request.Percentage > 100)
                throw new ArgumentException("Phần trăm giảm giá phải từ 0 đến 100.");

            // CHECK TRÙNG CẶP (NAME + PERCENTAGE)
            bool isDuplicate = await _repository.IsDuplicateAsync(request.Name, request.Percentage);
            if (isDuplicate)
            {
                throw new ArgumentException($"Đã tồn tại loại Voucher '{request.Name}' với mức giảm {request.Percentage}%.");
            }

            var newEntity = new VoucherType
            {
                Name = request.Name,
                Percentage = request.Percentage
            };

            await _repository.AddVoucherTypeAsync(newEntity);

            return new VoucherTypeResponse
            {
                Id = newEntity.Id,
                Name = newEntity.Name,
                Percentage = newEntity.Percentage
            };
        }

        public async Task<bool> UpdateAsync(int id, VoucherTypeRequest request)
        {
            if (request.Percentage < 0 || request.Percentage >= 100)
                throw new ArgumentException("Phần trăm giảm giá phải từ 0 đến 100.");

            var existingEntity = await _repository.GetVoucherTypeByIdAsync(id);
            if (existingEntity == null) return false;

            // LOGIC CHECK KHI UPDATE
            // Chỉ check nếu dữ liệu có thay đổi
            bool isChanged = (existingEntity.Name != request.Name) || (existingEntity.Percentage != request.Percentage);

            if (isChanged)
            {
                // Kiểm tra xem bộ dữ liệu MỚI này đã có ai dùng chưa
                bool isDuplicate = await _repository.IsDuplicateAsync(request.Name, request.Percentage);
                if (isDuplicate)
                {
                    throw new ArgumentException($"Đã tồn tại loại Voucher '{request.Name}' với mức giảm {request.Percentage}%.");
                }
            }

            // Cập nhật dữ liệu
            existingEntity.Name = request.Name;
            existingEntity.Percentage = request.Percentage;

            await _repository.UpdateVoucherTypeAsync(existingEntity);
            return true;
        }
    }
}