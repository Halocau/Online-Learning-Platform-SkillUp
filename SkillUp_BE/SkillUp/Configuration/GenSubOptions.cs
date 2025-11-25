namespace SkillUp.Configuration
{
    /// <summary>
    /// Settings for the external GenSub subtitle service.
    /// </summary>
    public class GenSubOptions
    {
        /// <summary>
        /// Base URL of the GenSub API (e.g. http://localhost:8000).
        /// </summary>
        public string BaseUrl { get; set; } = "http://localhost:8000";

        /// <summary>
        /// Default subtitle format to request when the caller does not provide one.
        /// </summary>
        public string DefaultFormat { get; set; } = "text";

        /// <summary>
        /// Whether AI correction should be requested by default.
        /// </summary>
        public bool AiCorrection { get; set; } = true;

    }
}

