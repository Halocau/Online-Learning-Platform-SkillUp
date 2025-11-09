
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

				if (addVoucherDTO.EndTime <= addVoucherDTO.StartTime)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thời gian bắt đầu phải trước thời gian kết thúc!",
						data = new List<object>()
					});
				}

				if(addVoucherDTO.StartTime < DateTime.Now)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thời gian bắt đầu phải lớn hơn thời gian hiện tại!",
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

				if (updateVoucherDTO.EndTime <= updateVoucherDTO.StartTime)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thời gian bắt đầu phải trước thời gian kết thúc!",
						data = new List<object>()
					});
				}

				if (updateVoucherDTO.StartTime < DateTime.Now)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thời gian bắt đầu phải lớn hơn thời gian hiện tại!",
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
	}
}
