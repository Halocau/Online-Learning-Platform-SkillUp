using SkillUp.BussinessObjects.DTOs.Qdrant;

namespace SkillUp.Services.Interfaces
{
    public interface IQdrantService
    {
        Task EnsureCollectionAsync(int vectorSize, CancellationToken ct = default);
        Task UpsertAsync(IEnumerable<QdrantVectorPoint> points, CancellationToken ct = default);
        Task<IReadOnlyList<QdrantVectorHit>> SearchAsync(
            float[] query,
            int topK,
            Guid? lessonId = null,
            Guid? courseId = null,
            float? scoreThreshold = null,
            CancellationToken ct = default);
        Task<long> CountVectorsAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            CancellationToken ct = default);
        Task<bool> LessonHasVectorsAsync(Guid lessonId, CancellationToken ct = default);
        Task DeleteVectorsAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            CancellationToken ct = default);
        Task DeleteVectorsByLessonAsync(Guid lessonId, CancellationToken ct = default);
        Task DeleteVectorsByCourseAsync(Guid courseId, CancellationToken ct = default);
        Task<IReadOnlyList<QdrantVectorPayload>> GetPayloadSamplesAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            int limit = 10,
            CancellationToken ct = default);
    }
}

