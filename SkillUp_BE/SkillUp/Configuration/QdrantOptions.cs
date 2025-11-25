namespace SkillUp.Configuration
{
    public class QdrantOptions
    {
        /// <summary>
        /// Base endpoint of Qdrant, e.g. http://localhost:6333
        /// </summary>
        public string Endpoint { get; set; } = "http://localhost:6333";

        /// <summary>
        /// Base name of the collection. The client will append vector size automatically.
        /// </summary>
        public string Collection { get; set; } = "skillup_subtitles";
    }
}

