using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Rating;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;
        private readonly ICurrentUserService _currentUserService;

        public RatingController(IRatingService ratingService, ICurrentUserService currentUserService)
        {
            _ratingService = ratingService;
            _currentUserService = currentUserService;
        }

        // GET: /api/Rating/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetRatingsByCourse(Guid courseId)
        {
            var ratings = await _ratingService.GetRatingsByCourseIdAsync(courseId);
            return Ok(new { code = 200, message = "Lấy danh sách đánh giá thành công", data = ratings });
        }

        // GET: /api/Rating/account?courseId={courseId}
        [Authorize]
        [HttpGet("account")]
        public async Task<IActionResult> GetRatingsByAccount([FromQuery] Guid? courseId = null)
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null)
            {
                return Unauthorized(new APIReturn(401, "Người dùng chưa đăng nhập", new List<object>()));
            }

            try
            {
                var ratings = await _ratingService.GetRatingsByAccountIdAsync(accountId.Value, courseId);
                var dataList = ratings.Select(r => (object)r).ToList();
                return Ok(new APIReturn(200, "Lấy danh sách đánh giá thành công", dataList));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(500, ex.Message, new List<object>()));
            }
        }

        // POST: /api/Rating/create
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateRating([FromBody] CreateRatingDto dto)
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null)
            {
                return Unauthorized(new { code = 401, message = "Người dùng chưa đăng nhập" });
            }

            try
            {
                var rating = await _ratingService.CreateRatingAsync(dto, accountId.Value);
                return Ok(new { code = 200, message = "Tạo đánh giá thành công", data = rating });
            }
            catch (InvalidOperationException ex) // Lỗi 400 (VD: "Đã đánh giá rồi")
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
            catch (Exception ex) // Lỗi 500
            {
                return StatusCode(500, new
                {
                    code = 500,
                    message = ex.Message,
                    innerMessage = ex.InnerException?.Message // Lỗi thật của SQL
                });
            }
        }

        // PUT: /api/Rating/update
        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateRating([FromBody] UpdateRatingDto dto)
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null)
            {
                return Unauthorized(new { code = 401, message = "Người dùng chưa đăng nhập" });
            }

            try
            {
                var rating = await _ratingService.UpdateRatingAsync(dto, accountId.Value);
                return Ok(new { code = 200, message = "Cập nhật đánh giá thành công", data = rating });
            }
            catch (KeyNotFoundException ex) // Lỗi 404
            {
                return NotFound(new { code = 404, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // Lỗi 403
            {
                return StatusCode(403, new { code = 403, message = ex.Message });
            }
            catch (Exception ex) // Lỗi 500
            {
                return StatusCode(500, new
                {
                    code = 500,
                    message = ex.Message,
                    innerMessage = ex.InnerException?.Message
                });
            }
        }

        // DELETE: /api/Rating/delete/{ratingId}
        [Authorize]
        [HttpDelete("delete/{ratingId}")]
        public async Task<IActionResult> DeleteRating(int ratingId)
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null)
            {
                return Unauthorized(new { code = 401, message = "Người dùng chưa đăng nhập" });
            }

            try
            {
                await _ratingService.DeleteRatingAsync(ratingId, accountId.Value);
                return Ok(new { code = 200, message = "Xóa đánh giá thành công" });
            }
            catch (KeyNotFoundException ex) // Lỗi 404
            {
                return NotFound(new { code = 404, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex) // Lỗi 403
            {
                return StatusCode(403, new { code = 403, message = ex.Message });
            }
            catch (Exception ex) // Lỗi 500
            {
                return StatusCode(500, new
                {
                    code = 500,
                    message = ex.Message,
                    innerMessage = ex.InnerException?.Message
                });
            }
        }
    }
}