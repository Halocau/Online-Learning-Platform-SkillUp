namespace SkillUp.BussinessObjects.DTOs.Cart
{
    public class CartDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public List<CartItemDto> CartItems { get; set; }
    }
}
