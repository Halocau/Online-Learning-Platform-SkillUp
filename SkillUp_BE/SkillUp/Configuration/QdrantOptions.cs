namespace SkillUp.Configuration
{
    public class QdrantOptions
    {
        /// <summary>
        /// Base endpoint of Qdrant, e.g. http://localhost:6333 or https://xxx.cloud.qdrant.io
        /// </summary>
        public string Endpoint { get; set; } = "https://08d02dbc-fd71-4d4a-80e4-4194b2c14301.europe-west3-0.gcp.cloud.qdrant.io";

        /// <summary>
        /// Qdrant Cloud API key. Leave empty for self-hosted clusters.
        /// </summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>
        /// Base name of the collection. The client will append vector size automatically.
        /// </summary>
        public string Collection { get; set; } = "skillup_subtitles";

        public int DefaultVectorSize { get; set; } = 0; // Must be configured in appsettings.json
    }
}

