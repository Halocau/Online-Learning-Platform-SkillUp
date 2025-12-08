using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BusinessLogic.Services;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.ExceptionHandling; // Import file APIReturn

namespace SkillUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherTypesController : ControllerBase
    {
        private readonly IVoucherTypeService _service;

        public VoucherTypesController(IVoucherTypeService service)
        {
            _service = service;
        }

        // GET: api/VoucherTypes/GetAllVoucherTypes
        [HttpGet("GetAllVoucherTypes")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();

                // Chuyển List<DTO> sang List<object> để khớp với APIReturn
                var data = result.Cast<object>().ToList();

                return Ok(new APIReturn(200, "Lấy danh sách thành công", data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(500, "Lỗi hệ thống: " + ex.Message, null));
            }
        }

        // GET: api/VoucherTypes/GetVoucherTypesById/5
        [HttpGet("GetVoucherTypesById/{id}")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (result == null)
                {
                    return NotFound(new APIReturn(404, "Không tìm thấy loại Voucher", null));
                }

                // Bọc object đơn lẻ vào List<object>
                return Ok(new APIReturn(200, "Lấy chi tiết thành công", new List<object> { result }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(500, "Lỗi hệ thống: " + ex.Message, null));
            }
        }

        // POST: api/VoucherTypes/CreateVoucherTypes
        [HttpPost("CreateVoucherTypes")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> Create([FromBody] VoucherTypeRequest request)
        {
            try
            {
                var result = await _service.CreateAsync(request);

               
                return StatusCode(201, new APIReturn(201, "Tạo mới thành công", new List<object> { result }));
            }
            catch (ArgumentException ex)
            {
               
                return BadRequest(new APIReturn(400, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(500, "Lỗi hệ thống: " + ex.Message, null));
            }
        }

       
        [HttpPut("UpdateVoucherTypes/{id}")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> Update(int id, [FromBody] VoucherTypeRequest request)
        {
            try
            {
                var isUpdated = await _service.UpdateAsync(id, request);

                if (!isUpdated)
                {
                    return NotFound(new APIReturn(404, "Không tìm thấy loại Voucher để cập nhật", null));
                }

                
                return Ok(new APIReturn(200, "Cập nhật thành công", null));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(500, "Lỗi hệ thống: " + ex.Message, null));
            }
        }
        [HttpPut("UpdateStatus/{id}")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool isActive)
        {
            try
            {
                // Gọi Service xử lý logic ẩn hiện
                var isUpdated = await _service.UpdateStatusAsync(id, isActive);

                if (!isUpdated)
                {
                    return NotFound(new APIReturn(404, "Không tìm thấy loại Voucher", null));
                }

                string statusMessage = isActive ? "Đã hiện Voucher (Active)" : "Đã ẩn Voucher (Inactive)";

                // Trả về 200 OK kèm thông báo
                return Ok(new APIReturn(200, statusMessage, null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(500, "Lỗi hệ thống: " + ex.Message, null));
            }
        }
    }
}