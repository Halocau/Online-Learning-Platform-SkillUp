using SkillUp.BussinessObjects.DTOs.Voucher;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;

namespace SkillUp.Services.Implementations
{
	public class VoucherService : IVoucherService
	{
		private readonly IVoucherRepository _voucherRepository;
		public VoucherService(IVoucherRepository voucherRepository)
		{
			_voucherRepository = voucherRepository;
		}
		public async Task<AddVoucherDTO> AddVoucher(AddVoucherDTO addVoucherDTO)
		{
			var voucher = new Voucher
			{
				Id = Guid.NewGuid(),
				CourseId = addVoucherDTO.CourseId,
				VoucherType = addVoucherDTO.VoucherType,
				CouponCode = addVoucherDTO.CouponCode,
				StartTime = addVoucherDTO.StartTime,
				EndTime = addVoucherDTO.EndTime,
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
			var voucher = await _voucherRepository.GetVoucherById(id);
			if (voucher == null)
			{
				throw new Exception("Voucher not found");
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
				IsActive = v.IsActive
			}).ToList();
			return voucherDTOs;
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
				IsActive = voucher.IsActive
			};
		}

		public async Task<AddVoucherDTO> UpdateVoucher(AddVoucherDTO addVoucherDTO, Guid voucherId)
		{
			var existingVoucher = await _voucherRepository.GetVoucherById(voucherId);
			if (existingVoucher == null)
			{
				return null;
			}
			existingVoucher.CourseId = addVoucherDTO.CourseId;
			existingVoucher.VoucherType = addVoucherDTO.VoucherType;
			existingVoucher.CouponCode = addVoucherDTO.CouponCode;
			existingVoucher.StartTime = addVoucherDTO.StartTime;
			existingVoucher.EndTime = addVoucherDTO.EndTime;
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

			// Kiểm tra thời gian hiệu lực
			var now = DateTime.Now;
			if (voucher.StartTime.HasValue && now < voucher.StartTime.Value)
			{
				return new ValidateVoucherResponseDTO
				{
					IsValid = false,
					Message = "Mã giảm giá chưa có hiệu lực.",
					Voucher = null,
					DiscountAmount = 0
				};
			}

			if (voucher.EndTime.HasValue && now > voucher.EndTime.Value)
			{
				return new ValidateVoucherResponseDTO
				{
					IsValid = false,
					Message = "Mã giảm giá đã hết hạn.",
					Voucher = null,
					DiscountAmount = 0
				};
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
				IsActive = voucher.IsActive
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
	}
}
