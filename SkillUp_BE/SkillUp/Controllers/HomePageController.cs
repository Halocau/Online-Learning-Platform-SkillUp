using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomePageController : ControllerBase
    {
        private readonly IHomePageService _homeService;
   
       public HomePageController(IHomePageService homeService)
        {
            _homeService = homeService;
        }
        [HttpGet("GetAllHomePage")]
        public async Task<IActionResult> GetHomePageData()
        {
            try
            {
                var homePageData = await _homeService.GetHomePageDataAsync();

                if (homePageData == null)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không thể tải dữ liệu trang chủ"
                    });
                }
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy dữ liệu trang chủ thành công",
                    data = new List<object> { homePageData }
                });
            }
            catch (Exception ex)
            {             
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Lỗi máy chủ nội bộ: {ex.Message}"
                });
            }
        }
    }
}
