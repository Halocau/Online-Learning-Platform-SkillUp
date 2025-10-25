namespace SkillUp.BussinessObjects.DTOs.Category
{
    public class ApiResponse
    {
        public int Code { get; set; }
        public string Message { get; set; } = "";
        public object? Data { get; set; }

        public static ApiResponse Ok(string msg, object? data = null)
            => new() { Code = 200, Message = msg, Data = data };
        public static ApiResponse BadRequest(string msg)
            => new() { Code = 400, Message = msg };
        public static ApiResponse NotFound(string msg)
            => new() { Code = 404, Message = msg };
        public static ApiResponse Conflict(string msg)
            => new() { Code = 409, Message = msg };
        public static ApiResponse ServerError(string msg)
            => new() { Code = 500, Message = msg };
    }
}
