
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Voucher;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class VoucherController : ControllerBase
	{
		private readonly IVoucherService _voucherService;
		public VoucherController(IVoucherService voucherService)
		{
			_voucherService = voucherService;
		}

		[HttpGet("course-voucher/{courseId}")]
		public async Task<IActionResult> GetCourseVouchers(Guid courseId)
		{
			var vouchers = await _voucherService.GetVoucherByCourseId(courseId);
			if (vouchers == null || !vouchers.Any())
			{
				return NotFound(new APIReturn
				{
					code = 404,
					message = "Không tìm thấy mã giảm giá nào cho khoá học này!",
					data = new List<object>()
				});
			}
			return Ok(new APIReturn
			{
				code = 200,
				message = "Lấy mã giảm giá thành công!",
				data = new List<object> { vouchers }
			});
		}

		[HttpPost("course-vouchers-batch")]
		public async Task<IActionResult> GetCourseVouchersBatch([FromBody] List<Guid> courseIds)
		{
			try
			{
				if (courseIds == null || !courseIds.Any())
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Danh sách khóa học không hợp lệ.",
						data = new List<object>()
					});
				}

				var vouchersDict = await _voucherService.GetVouchersByCourseIds(courseIds);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy mã giảm giá thành công!",
					data = new List<object> { vouchersDict }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpGet("{voucherId}")]
		public async Task<IActionResult> GetVoucherById(Guid voucherId)
		{
			var voucher = await _voucherService.GetVoucherById(voucherId);
			if (voucher == null)
			{
				return NotFound(new APIReturn
				{
					code = 404,
					message = "Không tìm thấy mã giảm giá.",
					data = new List<object>()
				});
			}
			return Ok(new APIReturn
			{
				code = 200,
				message = "Lấy mã giảm giá thành công!",
				data = new List<object> { voucher }
			});
		}

		[HttpPost("add-voucher")]
		public async Task<IActionResult> AddVoucher([FromBody] AddVoucherDTO addVoucherDTO)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thông tin không hợp lệ.",
						data = new List<object>()
					});
				}

			// Validate thời gian voucher
			var timeValidationError = _voucherService.ValidateVoucherTime(
				addVoucherDTO.StartTime, 
				addVoucherDTO.EndTime, 
				requireFutureStart: true
			);
			if (timeValidationError != null)
			{
				return BadRequest(new APIReturn
				{
					code = 400,
					message = timeValidationError,
					data = new List<object>()
				});
			}

				var addedVoucher = await _voucherService.AddVoucher(addVoucherDTO);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Thêm mã giảm giá thành công!",
					data = new List<object> { addedVoucher }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpDelete("delete-voucher")]
		public async Task<IActionResult> DeleteVoucher([FromBody] Guid voucherId)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Mã giảm giá không hợp lệ.",
						data = new List<object>()
					});
				}
				await _voucherService.DeleteVoucher(voucherId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Xoá mã giảm giá thành công!",
					data = new List<object>()
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpPut("update-voucher/{id}")]
		public async Task<IActionResult> UpdateVoucher(Guid id, [FromBody] AddVoucherDTO updateVoucherDTO)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thông tin không hợp lệ.",
						data = new List<object>()
					});
				}

			// Validate thời gian voucher
			var timeValidationError = _voucherService.ValidateVoucherTime(
				updateVoucherDTO.StartTime, 
				updateVoucherDTO.EndTime, 
				requireFutureStart: true
			);
			if (timeValidationError != null)
			{
				return BadRequest(new APIReturn
				{
					code = 400,
					message = timeValidationError,
					data = new List<object>()
				});
			}

				var updatedVoucher = await _voucherService.UpdateVoucher(updateVoucherDTO, id);

				if (updatedVoucher == null) {
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy mã giảm giá.",
						data = new List<object>()
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật mã giảm giá thành công!",
					data = new List<object> { updatedVoucher }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpGet("voucher-types")]
		public async Task<IActionResult> GetAllVoucherTypes()
		{
			try
			{
				var voucherTypes = await _voucherService.GetAllVoucherTypes();
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy danh sách loại voucher thành công!",
					data = new List<object> { voucherTypes }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpPost("validate-code")]
		public async Task<IActionResult> ValidateVoucherCode([FromBody] ValidateVoucherDTO validateVoucherDTO)
		{
			try
			{
				if (validateVoucherDTO == null)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Dữ liệu không hợp lệ.",
						data = new List<object>()
					});
				}

				if (!ModelState.IsValid)
				{
					var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
					return BadRequest(new APIReturn
					{
						code = 400,
						message = $"Dữ liệu không hợp lệ: {errors}",
						data = new List<object>()
					});
				}

				if (string.IsNullOrWhiteSpace(validateVoucherDTO.CouponCode))
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Mã giảm giá không hợp lệ.",
						data = new List<object>()
					});
				}

				var result = await _voucherService.ValidateVoucherByCode(validateVoucherDTO, validateVoucherDTO.TotalPrice);

				if (!result.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = result.Message,
						data = new List<object>()
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = result.Message,
					data = new List<object> { result }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}
	}
}
