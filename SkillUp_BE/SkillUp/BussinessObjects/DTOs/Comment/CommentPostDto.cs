public class CommentPostDto
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public string Contents { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;

    public Guid? ParentCommentId { get; set; }
}