using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly ILecturerService _lecturerService;

        public LecturerController(ILecturerService lecturerService)
        {
            _lecturerService = lecturerService;
        }
        [HttpGet("profile/{accId}")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetLecturerPublicProfile(Guid accId)
        {
            try
            {
                var profile = await _lecturerService.GetLecturerPublicProfileAsync(accId);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy thông tin giảng viên thành công",
                    data = new List<object> { profile }
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = ex.Message,
                        data = new List<object>()
                    });
                }
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
    }
}
