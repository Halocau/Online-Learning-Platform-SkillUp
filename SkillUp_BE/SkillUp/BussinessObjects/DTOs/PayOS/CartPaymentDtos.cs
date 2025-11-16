namespace SkillUp.BussinessObjects.DTOs.PayOS
{
    public class CartPaymentRequestDto
    {
        public List<CartPaymentItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
    }

    public class CartPaymentItemDto
    {
        public Guid CourseId { get; set; }
        public decimal Price { get; set; }
        public decimal FinalPrice { get; set; }
        public string? VoucherCode { get; set; }
        public Guid? VoucherId { get; set; }
        public Guid? CartItemId { get; set; }
    }

    public class CartPaymentResponseDto
    {
        public string? CheckoutUrl { get; set; }
        public string? OrderCode { get; set; }
        public string? Message { get; set; }
        public bool Success { get; set; }
        public bool IsFreeCart { get; set; } = false;
    }
}

