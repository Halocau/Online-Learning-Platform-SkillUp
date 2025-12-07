using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Cart;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly ICourseRepository _courseRepository;

        public CartService(ICartRepository cartRepository, IStudentRepository studentRepository, ICourseRepository courseRepository)
        {
            _cartRepository = cartRepository;
            _studentRepository = studentRepository;
            _courseRepository = courseRepository;
        }

        private async Task<Student> GetStudentByAccountIdAsync(Guid accountId)
        {
            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin học viên cho tài khoản này.");
            }
            return student;
        }

        public async Task<bool> AddToCartByAccountIdAsync(Guid accountId, AddToCartRequestDto request)
        {
            var student = await GetStudentByAccountIdAsync(accountId);

            // Kiểm tra xem student đã đăng ký course chưa
            var isEnrolled = await _cartRepository.IsStudentEnrolledInCourseAsync(student.Id, request.CourseId);
            if (isEnrolled)
            {
                throw new InvalidOperationException("Bạn đã đăng ký khóa học này rồi. Không thể thêm vào giỏ hàng.");
            }

            var cart = await _cartRepository.GetCartByStudentIdAsync(student.Id);
            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id
                };
                await _cartRepository.AddCart(cart);
            }

            //block duplicate course add
            if (cart.CartItems != null && cart.CartItems.Any(c=> c.CourseId == request.CourseId))
            {
                return true;// có add thêm thì vẫn 1 course, ko báo lỗi
            }


            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                CourseId = request.CourseId,
                Price = request.Price,
            };

            await _cartRepository.AddToCartAsync(cartItem);

            return await _cartRepository.SaveChangesAsync();
        }

        public async Task<CartDto> GetCartByAccountIdAsync(Guid accountId)
        {
            var student = await GetStudentByAccountIdAsync(accountId);

            var cart = await _cartRepository.GetCartByStudentIdAsync(student.Id);
            if (cart == null)
            {
                return null;
            }

            return new CartDto
            {
                Id = cart.Id,
                StudentId = cart.StudentId,
                CartItems = cart.CartItems.Select(ci => new CartItemDto
                {
                    Id = ci.Id,
                    CourseId = ci.CourseId,
                    Price = ci.Price,
                    Course = new CourseCartDto
                    {
                        Title = ci.Course.Title,
                        Image = ci.Course.Image,
                        EnrollmentCount = ci.Course.EnrollmentCount,
                        Rating = ci.Course.Rating,
                        LecturerName = ci.Course.Lecturer?.Account?.Fullname
                    }
                }).ToList()
            };
        }

        public async Task<bool> RemoveFromCartAsync(Guid cartItemId)
        {
            await _cartRepository.RemoveFromCartAsync(cartItemId);
            return await _cartRepository.SaveChangesAsync();
        }


        public async Task<BulkAddToCartResultDto> BulkAddToCartByAccountIdAsync(Guid accountId, IEnumerable<AddToCartRequestDto> items)
        {
            var result = new BulkAddToCartResultDto();
            if (items == null) return result;

            // 1) Lấy student theo accountId
            var student = await GetStudentByAccountIdAsync(accountId);

            // 2) Lấy/khởi tạo cart
            var cart = await _cartRepository.GetCartByStudentIdAsync(student.Id);
            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    CartItems = new List<CartItem>()
                };
                await _cartRepository.AddCart(cart);
                await _cartRepository.SaveChangesAsync(); // cần Save để có CartId ràng buộc
            }

            // 3) Lấy các CourseId đã có trong cart để lọc trùng
            var existedCourseIds = await _cartRepository.GetCourseIdsInCartAsync(cart.Id);

            // 4) Chuẩn hoá input, loại item lỗi & trùng courseId trong input
            var distinctInput = items
               .Where(x => x != null && x.CourseId != Guid.Empty && x.Price >= 0)
               .GroupBy(x => x.CourseId)
               .Select(g => g.First())
               .ToList();

            // 5) Lọc để chỉ Add những cái chưa có
            var toAdd = new List<CartItem>();
            foreach (var it in distinctInput)
            {
                if (existedCourseIds.Contains(it.CourseId))
                {
                    result.Skipped++;
                    result.SkippedCourseIds.Add(it.CourseId);
                    continue;
                }

                // Kiểm tra xem student đã đăng ký course chưa
                var isEnrolled = await _cartRepository.IsStudentEnrolledInCourseAsync(student.Id, it.CourseId);
                if (isEnrolled)
                {
                    result.Skipped++;
                    result.SkippedCourseIds.Add(it.CourseId);
                    continue;
                }

                // (Tuỳ chọn) validate course tồn tại
                var courseExists = await _courseRepository.ExistsAsync(it.CourseId);
                if (!courseExists)
                {
                    result.Skipped++;
                    result.SkippedCourseIds.Add(it.CourseId);
                    continue;
                }

                toAdd.Add(new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    CourseId = it.CourseId,
                    Price = it.Price,              // nhận từ FE
                });
            }

            // 6) Thêm range + SaveChanges 1 lần
            if (toAdd.Count > 0)
            {
                await _cartRepository.AddCartItemsRangeAsync(toAdd);
                var saved = await _cartRepository.SaveChangesAsync();
                if (saved)
                {
                    result.Added = toAdd.Count;
                    result.AddedCourseIds.AddRange(toAdd.Select(ci => ci.CourseId));
                }
            }

            return result;
        }

        public async Task<bool> ClearCartAsync(Guid accountId)
        {
            var student = await GetStudentByAccountIdAsync(accountId);
            await _cartRepository.ClearCartAsync(student.Id);
            return await _cartRepository.SaveChangesAsync();
        }

        public async Task<bool> CreateCartIfNotExistsAsync(Guid accountId)
        {
            try
            {
                var student = await GetStudentByAccountIdAsync(accountId);
                
                var existingCart = await _cartRepository.GetCartByStudentIdAsync(student.Id);
                if (existingCart != null)
                {
                    return true;
                }


                var cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id
                };
                
                await _cartRepository.AddCart(cart);
                return await _cartRepository.SaveChangesAsync();
            }
            catch (InvalidOperationException)
            {
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
