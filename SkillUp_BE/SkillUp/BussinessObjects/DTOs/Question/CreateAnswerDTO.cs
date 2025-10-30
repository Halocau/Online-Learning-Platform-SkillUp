namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class CreateAnswerDTO
    {
        public string AnswerName { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
    }
}
