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

        // 1. LẤY DANH SÁCH (Kèm trạng thái Active)
        public async Task<List<VoucherTypeResponse>> GetAllAsync()
        {
            var entities = await _repository.GetVoucherTypesAsync();

            // Map Entity -> DTO
            return entities.Select(x => new VoucherTypeResponse
            {
                Id = x.Id,
                Name = x.Name,
                Percentage = x.Percentage,
                // Nếu null thì mặc định là True (Hiện)
                IsActive = x.IsActive ?? true
            }).ToList();
        }

        // 2. LẤY CHI TIẾT
        public async Task<VoucherTypeResponse?> GetByIdAsync(int id)
        {
            var entity = await _repository.GetVoucherTypeByIdAsync(id);
            if (entity == null) return null;

            return new VoucherTypeResponse
            {
                Id = entity.Id,
                Name = entity.Name,
                Percentage = entity.Percentage,
                IsActive = entity.IsActive ?? true
            };
        }

        // 3. TẠO MỚI (Check trùng + Mặc định Active)
        public async Task<VoucherTypeResponse> CreateAsync(VoucherTypeRequest request)
        {
            // Validate Percentage
            if (request.Percentage < 0 || request.Percentage > 100)
            {
                throw new ArgumentException("Phần trăm giảm giá phải từ 0 đến 100.");
            }

            // Check trùng cặp (Name + Percentage)
            bool isDuplicate = await _repository.IsDuplicateAsync(request.Name, request.Percentage);
            if (isDuplicate)
            {
                throw new ArgumentException($"Đã tồn tại loại Voucher '{request.Name}' với mức giảm {request.Percentage}%.");
            }

            var newEntity = new VoucherType
            {
                Name = request.Name,
                Percentage = request.Percentage,
                IsActive = true // <--- Mặc định khi tạo mới là Hiện
            };

            await _repository.AddVoucherTypeAsync(newEntity);

            return new VoucherTypeResponse
            {
                Id = newEntity.Id,
                Name = newEntity.Name,
                Percentage = newEntity.Percentage,
                IsActive = true
            };
        }

        // 4. CẬP NHẬT THÔNG TIN (Tên, %)
        public async Task<bool> UpdateAsync(int id, VoucherTypeRequest request)
        {
            // Validate Percentage
            if (request.Percentage < 0 || request.Percentage > 100)
            {
                throw new ArgumentException("Phần trăm giảm giá phải từ 0 đến 100.");
            }

            var existingEntity = await _repository.GetVoucherTypeByIdAsync(id);
            if (existingEntity == null) return false;

            // Logic Check Trùng khi Update
            // Chỉ check nếu dữ liệu THỰC SỰ thay đổi
            bool isChanged = (existingEntity.Name != request.Name) || (existingEntity.Percentage != request.Percentage);

            if (isChanged)
            {
                bool isDuplicate = await _repository.IsDuplicateAsync(request.Name, request.Percentage);
                if (isDuplicate)
                {
                    throw new ArgumentException($"Đã tồn tại loại Voucher '{request.Name}' với mức giảm {request.Percentage}%.");
                }
            }

            // Cập nhật thông tin
            existingEntity.Name = request.Name;
            existingEntity.Percentage = request.Percentage;

            await _repository.UpdateVoucherTypeAsync(existingEntity);
            return true;
            
        }

        public async Task<bool> UpdateStatusAsync(int id, bool isActive)
        {
            var existingEntity = await _repository.GetVoucherTypeByIdAsync(id);
            if (existingEntity == null) return false;

            // Cập nhật cột IsActive
            existingEntity.IsActive = isActive;

            await _repository.UpdateVoucherTypeAsync(existingEntity);
            return true;
        }
    }
}