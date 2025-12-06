using System;
using System.Threading.Tasks;
using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Implementations;

namespace TestSkillUp;

[TestFixture]
public class QuizServiceTest
{
    private Mock<IQuizRepository> _mockQuizRepo;
    private Mock<ILecturerRepository> _mockLecturerRepo;
    private Mock<ISectionRepository> _mockSectionRepo;
    private Mock<IQuizSubmissionRepository> _mockQuizSubmissionRepo;
    private Mock<IStudentRepository> _mockStudentRepo;
    private Mock<IAnswerBankRepository> _mockAnswerBankRepo;
    private Mock<IQuizAnswerSubmissionRepository> _mockQuizAnswerSubmissionRepo;
    private Mock<IStudentSelectedAnswersRepository> _mockStudentSelectedAnswersRepo;
    private Mock<IQuestionBankRepository> _mockQuestionBankRepo;
    private Mock<IStudentProgressRepository> _mockStudentProgressRepo;
    private Mock<IEnrollmentRepository> _mockEnrollmentRepo;

    private QuizService _service;

    [SetUp]
    public void Setup()
    {
        _mockQuizRepo = new Mock<IQuizRepository>();
        _mockLecturerRepo = new Mock<ILecturerRepository>();
        _mockSectionRepo = new Mock<ISectionRepository>();
        _mockQuizSubmissionRepo = new Mock<IQuizSubmissionRepository>();
        _mockStudentRepo = new Mock<IStudentRepository>();
        _mockAnswerBankRepo = new Mock<IAnswerBankRepository>();
        _mockQuizAnswerSubmissionRepo = new Mock<IQuizAnswerSubmissionRepository>();
        _mockStudentSelectedAnswersRepo = new Mock<IStudentSelectedAnswersRepository>();
        _mockQuestionBankRepo = new Mock<IQuestionBankRepository>();
        _mockStudentProgressRepo = new Mock<IStudentProgressRepository>();
        _mockEnrollmentRepo = new Mock<IEnrollmentRepository>();

        _service = new QuizService(
            _mockQuizRepo.Object,
            _mockLecturerRepo.Object,
            _mockSectionRepo.Object,
            _mockQuizSubmissionRepo.Object,
            _mockStudentRepo.Object,
            _mockAnswerBankRepo.Object,
            _mockQuizAnswerSubmissionRepo.Object,
            _mockStudentSelectedAnswersRepo.Object,
            _mockQuestionBankRepo.Object,
            _mockStudentProgressRepo.Object,
            _mockEnrollmentRepo.Object
        );
    }

    [Test]
    public void CreateQuizAsync_ShouldThrowException_WhenLecturerNotFound()
    {
        var accountId = Guid.NewGuid();
        var dto = new CreateQuizDTO { SectionId = Guid.NewGuid(), Title = "t" };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync((Lecturer?)null);

        var ex = Assert.Throws<Exception>(() => _service.CreateQuizAsync(dto, accountId).GetAwaiter().GetResult());
        StringAssert.Contains("Không tìm thấy giảng viên", ex.Message);
    }

    [Test]
    public void CreateQuizAsync_ShouldThrowException_WhenSectionNotFound()
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var dto = new CreateQuizDTO { SectionId = Guid.NewGuid(), Title = "t" };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(dto.SectionId)).ReturnsAsync((Section?)null);

        var ex = Assert.Throws<Exception>(() => _service.CreateQuizAsync(dto, accountId).GetAwaiter().GetResult());
        StringAssert.Contains("Không tìm thấy section", ex.Message);
    }

    [Test]
    public void CreateQuizAsync_ShouldThrowException_WhenSectionCourseIsNull()
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var dto = new CreateQuizDTO { SectionId = Guid.NewGuid(), Title = "t" };
        var section = new Section { Id = dto.SectionId, Course = null };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(dto.SectionId)).ReturnsAsync(section);

        var ex = Assert.Throws<Exception>(() => _service.CreateQuizAsync(dto, accountId).GetAwaiter().GetResult());
        StringAssert.Contains("Lỗi hệ thống: Không thể tải thông tin Khóa học", ex.Message);
    }

    [Test]
    public void CreateQuizAsync_ShouldThrowUnauthorizedAccessException_WhenLecturerDoesNotOwnCourse()
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var dto = new CreateQuizDTO { SectionId = Guid.NewGuid(), Title = "t" };

        var course = new Course { Id = Guid.NewGuid(), LecturerId = Guid.NewGuid() };
        var section = new Section { Id = dto.SectionId, Course = course, CourseId = course.Id };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(dto.SectionId)).ReturnsAsync(section);

        Assert.Throws<UnauthorizedAccessException>(() => _service.CreateQuizAsync(dto, accountId).GetAwaiter().GetResult());
    }

    [Test]
    public async Task CreateQuizAsync_ShouldReturnNewQuizId_WhenAllValid()
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var sectionId = Guid.NewGuid();
        var course = new Course { Id = Guid.NewGuid(), LecturerId = lecturer.Id };
        var section = new Section { Id = sectionId, Course = course, CourseId = course.Id };

        var dto = new CreateQuizDTO
        {
            SectionId = sectionId,
            Title = "Success Quiz",
            Description = "desc",
            PassPercent = 70,
            Timer = 15,
            Orders = 2
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(sectionId)).ReturnsAsync(section);

        Quiz captured = null;
        _mockQuizRepo.Setup(x => x.CreateQuizAsync(It.IsAny<Quiz>()))
            .ReturnsAsync((Quiz q) =>
            {
                captured = q;
                return q;
            });

        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var result = await _service.CreateQuizAsync(dto, accountId);

        Assert.AreNotEqual(Guid.Empty, result);
        Assert.IsNotNull(captured);
        _mockQuizRepo.Verify(x => x.CreateQuizAsync(It.IsAny<Quiz>()), Times.Once);
        _mockQuizRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task CreateQuizAsync_ShouldSetQuizFields_CorrectlyWhenCreated()
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var sectionId = Guid.NewGuid();
        var course = new Course { Id = Guid.NewGuid(), LecturerId = lecturer.Id };
        var section = new Section { Id = sectionId, Course = course, CourseId = course.Id };

        var dto = new CreateQuizDTO
        {
            SectionId = sectionId,
            Title = "Field Check Quiz",
            Description = "desc",
            PassPercent = 75,
            Timer = 25,
            Orders = 3
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(sectionId)).ReturnsAsync(section);

        Quiz captured = null;
        _mockQuizRepo.Setup(x => x.CreateQuizAsync(It.IsAny<Quiz>()))
            .ReturnsAsync((Quiz q) =>
            {
                captured = q;
                return q;
            });

        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var before = DateTime.Now;
        var result = await _service.CreateQuizAsync(dto, accountId);
        var after = DateTime.Now;

        Assert.IsNotNull(captured);
        Assert.IsTrue(captured.IsActive);
        Assert.AreEqual(dto.Title, captured.Title);
        Assert.AreEqual(dto.SectionId, captured.SectionId);
        Assert.AreEqual(dto.PassPercent, captured.PassPercent);
        Assert.AreEqual(dto.Timer, captured.Timer);
        Assert.AreEqual(dto.Orders, captured.Orders);
        Assert.That(captured.CreatedAt, Is.InRange(before.AddSeconds(-1), after.AddSeconds(1)));
        Assert.That(captured.UpdatedAt, Is.InRange(before.AddSeconds(-1), after.AddSeconds(1)));
    }
}
