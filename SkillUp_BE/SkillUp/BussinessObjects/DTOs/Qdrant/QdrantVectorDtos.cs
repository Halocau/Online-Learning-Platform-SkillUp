using System.Text.Json.Serialization;

namespace SkillUp.BussinessObjects.DTOs.Qdrant
{
    public class QdrantVectorPoint
    {
        public QdrantVectorPoint(string id, float[] vector, QdrantVectorPayload payload)
        {
            Id = id;
            Vector = vector;
            Payload = payload;
        }

        public string Id { get; set; }
        public float[] Vector { get; set; }
        public QdrantVectorPayload Payload { get; set; }
    }

    public class QdrantVectorPayload
    {
        public QdrantVectorPayload(Guid lessonId, Guid courseId, int chunkIndex, string text, string? source = null)
        {
            LessonId = lessonId;
            CourseId = courseId;
            ChunkIndex = chunkIndex;
            Text = text;
            Source = source;
        }

        public Guid LessonId { get; set; }
        public Guid CourseId { get; set; }
        public int ChunkIndex { get; set; }
        public string Text { get; set; }
        public string? Source { get; set; }
    }

    public class QdrantVectorHit
    {
        public QdrantVectorHit(string id, float score, string text, QdrantVectorPayload payload)
        {
            Id = id;
            Score = score;
            Text = text;
            Payload = payload;
        }

        public string Id { get; set; }
        public float Score { get; set; }
        public string Text { get; set; }
        public QdrantVectorPayload Payload { get; set; }
    }

    internal sealed class QdrantSearchResponse
    {
        [JsonPropertyName("result")]
        public List<QdrantHit> Result { get; set; } = new();
    }

    internal sealed class QdrantHit
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("score")]
        public float Score { get; set; }

        [JsonPropertyName("payload")]
        public QdrantPayloadDocument Payload { get; set; } = new();
    }

    internal sealed class QdrantPayloadDocument
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("lessonId")]
        public Guid LessonId { get; set; }

        [JsonPropertyName("courseId")]
        public Guid CourseId { get; set; }

        [JsonPropertyName("chunkIndex")]
        public int ChunkIndex { get; set; }

        [JsonPropertyName("source")]
        public string? Source { get; set; }
    }
}

