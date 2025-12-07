using SkillUp.BussinessObjects.DTOs.Voucher;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.Linq;
using System;

namespace SkillUp.Services.Implementations
{
	public class VoucherService : IVoucherService
	{
		private readonly IVoucherRepository _voucherRepository;
		private readonly ICourseRepository _courseRepository;
		private readonly ICurrentUserService _currentUserService;
		private readonly ILecturerRepository _lecturerRepository;
		public VoucherService(IVoucherRepository voucherRepository, ICourseRepository courseRepository, ICurrentUserService currentUserService, ILecturerRepository lecturerRepository)
		{
			_voucherRepository = voucherRepository;
			_courseRepository = courseRepository;
			_currentUserService = currentUserService;
			_lecturerRepository = lecturerRepository;
		}
		public async Task<AddVoucherDTO> AddVoucher(AddVoucherDTO addVoucherDTO)
		{
			if (_currentUserService.UserId == null)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên");
			}
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(_currentUserService.UserId.Value);
			if (lecturer == null)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên");
			}
			if (addVoucherDTO.CourseId == null) 
			{ 
				throw new Exception("CourseId không được để trống!"); 
			}
			var course = await _courseRepository.GetByIdAsync((Guid)addVoucherDTO.CourseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học");
			}
			if(course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên của khoá học này");
			}
			var voucherTypes = await _voucherRepository.GetAllVoucherTypes();

			if (!voucherTypes.Any(v => v.Id == addVoucherDTO.VoucherType))
			{
				throw new Exception("Loại mã giảm giá không hợp lệ");
			}

			// Normalize thời gian về Local time trước khi lưu
			// Frontend gửi local time string → parse thành Unspecified → chuyển thành Local
			var normalizedStartTime = NormalizeToLocalTime(addVoucherDTO.StartTime);
			var normalizedEndTime = NormalizeToLocalTime(addVoucherDTO.EndTime);

			var voucher = new Voucher
			{
				Id = Guid.NewGuid(),
				CourseId = addVoucherDTO.CourseId,
				VoucherType = addVoucherDTO.VoucherType,
				CouponCode = addVoucherDTO.CouponCode,
				StartTime = normalizedStartTime,
				EndTime = normalizedEndTime,
				Price = addVoucherDTO.Price,
				IsActive = true
			};
			await _voucherRepository.AddVoucher(voucher);
			await _voucherRepository.SaveChangesAsync();

			return new AddVoucherDTO
			{
				CourseId = voucher.CourseId,
				VoucherType = voucher.VoucherType,
				CouponCode = voucher.CouponCode,
				StartTime = voucher.StartTime,
				EndTime = voucher.EndTime,
				Price = voucher.Price
			};
		}

		public async Task DeleteVoucher(Guid id)
		{
			if (_currentUserService.UserId == null)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên");
			}
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(_currentUserService.UserId.Value);
			if (lecturer == null)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên");
			}
			
			var voucher = await _voucherRepository.GetVoucherById(id);
			if (voucher == null)
			{
				throw new Exception("Không tìm thấy voucher");
			}

			var course = await _courseRepository.GetByIdAsync((Guid)voucher.CourseId!);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học");
			}
			if (course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên của khoá học này");
			}

			voucher.IsActive = false;
			_voucherRepository.UpdateVoucher(voucher);
			await _voucherRepository.SaveChangesAsync();
		}

		public async Task<List<ViewVoucherDTO>> GetVoucherByCourseId(Guid id)
		{
			var vouchers = await _voucherRepository.GetVoucherByCourseId(id);
			var voucherDTOs = vouchers.Select(v => new ViewVoucherDTO
			{
				Id = v.Id,
				CourseId = v.CourseId,
				VoucherType = v.VoucherType,
				CouponCode = v.CouponCode,
				StartTime = v.StartTime,
				EndTime = v.EndTime,
				Price = v.Price,
				IsActive = v.IsActive,
				Percentage = v.VoucherTypeNavigation?.Percentage
			}).ToList();
			return voucherDTOs;
		}

		public async Task<Dictionary<Guid, List<ViewVoucherDTO>>> GetVouchersByCourseIds(List<Guid> courseIds)
		{
			if (courseIds == null || !courseIds.Any())
			{
				return new Dictionary<Guid, List<ViewVoucherDTO>>();
			}

			var vouchersDict = await _voucherRepository.GetVouchersByCourseIds(courseIds);
			var result = new Dictionary<Guid, List<ViewVoucherDTO>>();

			foreach (var kvp in vouchersDict)
			{
				result[kvp.Key] = kvp.Value.Select(v => new ViewVoucherDTO
				{
					Id = v.Id,
					CourseId = v.CourseId,
					VoucherType = v.VoucherType,
					CouponCode = v.CouponCode,
					StartTime = v.StartTime,
					EndTime = v.EndTime,
					Price = v.Price,
					IsActive = v.IsActive,
					Percentage = v.VoucherTypeNavigation?.Percentage
				}).ToList();
			}

			// Đảm bảo tất cả courseIds đều có trong result (kể cả không có voucher)
			foreach (var courseId in courseIds)
			{
				if (!result.ContainsKey(courseId))
				{
					result[courseId] = new List<ViewVoucherDTO>();
				}
			}

			return result;
		}

		public async Task<ViewVoucherDTO> GetVoucherById(Guid id)
		{
			var voucher = await _voucherRepository.GetVoucherById(id);
			if (voucher == null)
			{
				return null;
			}
			return new ViewVoucherDTO
			{
				Id = voucher.Id,
				CourseId = voucher.CourseId,
				VoucherType = voucher.VoucherType,
				CouponCode = voucher.CouponCode,
				StartTime = voucher.StartTime,
				EndTime = voucher.EndTime,
				Price = voucher.Price,
				IsActive = voucher.IsActive,
				Percentage = voucher.VoucherTypeNavigation?.Percentage
			};
		}

		public async Task<AddVoucherDTO> UpdateVoucher(AddVoucherDTO addVoucherDTO, Guid voucherId)
		{
			if (_currentUserService.UserId == null)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên");
			}
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(_currentUserService.UserId.Value);
			if (lecturer == null)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên");
			}
			if (addVoucherDTO.CourseId == null)
			{
				throw new Exception("CourseId không được để trống!");
			}
			var course = await _courseRepository.GetByIdAsync((Guid)addVoucherDTO.CourseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học");
			}
			if (course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải giảng viên của khoá học này");
			}
			var voucherTypes = await _voucherRepository.GetAllVoucherTypes();

			if (!voucherTypes.Any(v => v.Id == addVoucherDTO.VoucherType))
			{
				throw new Exception("Loại mã giảm giá không hợp lệ");
			}

			var existingVoucher = await _voucherRepository.GetVoucherById(voucherId);
			if (existingVoucher == null)
			{
				return null;
			}

			// Normalize thời gian về Local time trước khi lưu
			// Frontend gửi local time string → parse thành Unspecified → chuyển thành Local
			var normalizedStartTime = NormalizeToLocalTime(addVoucherDTO.StartTime);
			var normalizedEndTime = NormalizeToLocalTime(addVoucherDTO.EndTime);

			existingVoucher.CourseId = addVoucherDTO.CourseId;
			existingVoucher.VoucherType = addVoucherDTO.VoucherType;
			existingVoucher.CouponCode = addVoucherDTO.CouponCode;
			existingVoucher.StartTime = normalizedStartTime;
			existingVoucher.EndTime = normalizedEndTime;
			existingVoucher.Price = addVoucherDTO.Price;

			_voucherRepository.UpdateVoucher(existingVoucher);
			await _voucherRepository.SaveChangesAsync();

			return new AddVoucherDTO
			{
				CourseId = existingVoucher.CourseId,
				VoucherType = existingVoucher.VoucherType,
				CouponCode = existingVoucher.CouponCode,
				StartTime = existingVoucher.StartTime,
				EndTime = existingVoucher.EndTime,
				Price = existingVoucher.Price
			};
		}

		public async Task<ValidateVoucherResponseDTO> ValidateVoucherByCode(ValidateVoucherDTO validateVoucherDTO, decimal totalPrice)
		{
			var voucher = await _voucherRepository.GetVoucherByCode(validateVoucherDTO.CouponCode);
			
			if (voucher == null)
			{
				return new ValidateVoucherResponseDTO
				{
					IsValid = false,
					Message = "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.",
					Voucher = null,
					DiscountAmount = 0
				};
			}

			// Kiểm tra thời gian hiệu lực (so sánh cả ngày và giờ)
			var now = DateTime.Now;
			
			// Normalize thời gian về cùng timezone để so sánh chính xác
			if (voucher.StartTime.HasValue)
			{
				var startTime = voucher.StartTime.Value;
				// Nếu StartTime là UTC, chuyển về Local time
				if (startTime.Kind == DateTimeKind.Utc)
				{
					startTime = startTime.ToLocalTime();
				}
				else if (startTime.Kind == DateTimeKind.Unspecified)
				{
					// Giả sử là Local time nếu không xác định
					startTime = DateTime.SpecifyKind(startTime, DateTimeKind.Local);
				}
				
				// So sánh cả ngày và giờ
				if (now < startTime)
				{
					return new ValidateVoucherResponseDTO
					{
						IsValid = false,
						Message = $"Mã giảm giá chưa có hiệu lực. Thời gian bắt đầu: {startTime:dd/MM/yyyy HH:mm:ss}",
						Voucher = null,
						DiscountAmount = 0
					};
				}
			}

			if (voucher.EndTime.HasValue)
			{
				var endTime = voucher.EndTime.Value;
				// Nếu EndTime là UTC, chuyển về Local time
				if (endTime.Kind == DateTimeKind.Utc)
				{
					endTime = endTime.ToLocalTime();
				}
				else if (endTime.Kind == DateTimeKind.Unspecified)
				{
					// Giả sử là Local time nếu không xác định
					endTime = DateTime.SpecifyKind(endTime, DateTimeKind.Local);
				}
				
				// So sánh cả ngày và giờ
				if (now > endTime)
				{
					return new ValidateVoucherResponseDTO
					{
						IsValid = false,
						Message = $"Mã giảm giá đã hết hạn. Thời gian kết thúc: {endTime:dd/MM/yyyy HH:mm:ss}",
						Voucher = null,
						DiscountAmount = 0
					};
				}
			}

			// Kiểm tra nếu voucher chỉ áp dụng cho một khóa học cụ thể
			if (voucher.CourseId.HasValue)
			{
				if (!validateVoucherDTO.CourseIds.Contains(voucher.CourseId.Value))
				{
					return new ValidateVoucherResponseDTO
					{
						IsValid = false,
						Message = "Mã giảm giá này không áp dụng cho các khóa học trong giỏ hàng.",
						Voucher = null,
						DiscountAmount = 0
					};
				}
			}

			// Tính toán số tiền giảm
			decimal discountAmount = 0;
			if (voucher.VoucherTypeNavigation != null)
			{
				// Nếu là phần trăm
				if (voucher.VoucherTypeNavigation.Percentage > 0)
				{
					discountAmount = totalPrice * (voucher.VoucherTypeNavigation.Percentage / 100m);
				}
				else
				{
					// Nếu là số tiền cố định
					discountAmount = voucher.Price;
				}
			}
			else
			{
				// Fallback: sử dụng Price như số tiền giảm cố định
				discountAmount = voucher.Price;
			}

			// Đảm bảo discount không vượt quá tổng tiền
			if (discountAmount > totalPrice)
			{
				discountAmount = totalPrice;
			}

			var voucherDTO = new ViewVoucherDTO
			{
				Id = voucher.Id,
				CourseId = voucher.CourseId,
				VoucherType = voucher.VoucherType,
				CouponCode = voucher.CouponCode,
				StartTime = voucher.StartTime,
				EndTime = voucher.EndTime,
				Price = voucher.Price,
				IsActive = voucher.IsActive,
				Percentage = voucher.VoucherTypeNavigation?.Percentage
			};

			return new ValidateVoucherResponseDTO
			{
				IsValid = true,
				Message = "Mã giảm giá hợp lệ.",
				Voucher = voucherDTO,
				DiscountAmount = discountAmount
			};
		}

		public async Task<List<VoucherType>> GetAllVoucherTypes()
		{
			return await _voucherRepository.GetAllVoucherTypes();
		}

		/// <summary>
		/// Validate thời gian của voucher
		/// </summary>
		/// <param name="startTime">Thời gian bắt đầu</param>
		/// <param name="endTime">Thời gian kết thúc</param>
		/// <param name="requireFutureStart">Yêu cầu thời gian bắt đầu phải trong tương lai (mặc định true)</param>
		/// <returns>Null nếu hợp lệ, hoặc error message nếu không hợp lệ</returns>
		public string? ValidateVoucherTime(DateTime? startTime, DateTime? endTime, bool requireFutureStart = true)
		{
			// Kiểm tra null
			if (!startTime.HasValue || !endTime.HasValue)
			{
				return "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc!";
			}

			// Normalize về Local time để so sánh chính xác
			var normalizedStartTime = startTime.Value;
			var normalizedEndTime = endTime.Value;
			
			// Nếu DateTime là UTC (từ frontend toISOString), chuyển về Local time
			if (normalizedStartTime.Kind == DateTimeKind.Utc)
			{
				normalizedStartTime = normalizedStartTime.ToLocalTime();
			}
			else if (normalizedStartTime.Kind == DateTimeKind.Unspecified)
			{
				normalizedStartTime = DateTime.SpecifyKind(normalizedStartTime, DateTimeKind.Local);
			}
			
			if (normalizedEndTime.Kind == DateTimeKind.Utc)
			{
				normalizedEndTime = normalizedEndTime.ToLocalTime();
			}
			else if (normalizedEndTime.Kind == DateTimeKind.Unspecified)
			{
				normalizedEndTime = DateTime.SpecifyKind(normalizedEndTime, DateTimeKind.Local);
			}

			// Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
			if (normalizedEndTime <= normalizedStartTime)
			{
				return "Thời gian kết thúc phải sau thời gian bắt đầu!";
			}

			// Kiểm tra thời gian bắt đầu phải lớn hơn thời gian hiện tại (nếu yêu cầu)
			if (requireFutureStart)
			{
				var now = DateTime.Now;
				if (normalizedStartTime < now)
				{
					return "Thời gian bắt đầu phải lớn hơn thời gian hiện tại!";
				}
			}

			return null; // Hợp lệ
		}

        /// <summary>
        /// Normalize DateTime về Local time
        /// Frontend gửi local time string (format: "YYYY-MM-DDTHH:mm:ss") → .NET parse thành Unspecified
        /// Cần chuyển Unspecified → Local để lưu đúng vào database
        /// </summary>
        private DateTime? NormalizeToLocalTime(DateTime? dateTime)
        {
            if (!dateTime.HasValue)
                return null;

            var dt = dateTime.Value;
            if (dt.Kind == DateTimeKind.Utc)
            {
                // Nếu là UTC (từ toISOString cũ), chuyển về Local
                return dt.ToLocalTime();
            }
            else if (dt.Kind == DateTimeKind.Unspecified)
            {
                // Nếu là Unspecified (từ local time string), đặt thành Local
                return DateTime.SpecifyKind(dt, DateTimeKind.Local);
            }
            else
            {
                // Đã là Local, giữ nguyên
                return dt;
            }
        }
    }
}
