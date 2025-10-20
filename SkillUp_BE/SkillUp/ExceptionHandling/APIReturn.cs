namespace SkillUp.ExceptionHandling
{
    public class APIReturn
    {
        public int code { get; set; }
        public string message { get; set; }
        public List<object> data { get; set; }

        public APIReturn()
        {

        }
        public APIReturn(int code, string message, List<object> data)
        {
            this.code = code;
            this.message = message;
            this.data = data;
        }

    }
}
