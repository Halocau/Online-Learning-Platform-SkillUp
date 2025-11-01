namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class UpdateQuestionDTO
    {    
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<UpdateAnswerDTO> Answers { get; set; } = new();
    }
}
