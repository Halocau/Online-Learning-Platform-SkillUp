using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.DoQuiz;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Implementations;
using System;
using System.Threading.Tasks;

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
    [TestCase(-1)]
    [TestCase(101)]
    public void CreateQuizAsync_ShouldThrowException_WhenPassPercentIsInvalid(int invalidPercent)
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var section = new Section
        {
            Id = Guid.NewGuid(),
            Course = new Course { LecturerId = lecturer.Id }
        };

        var dto = new CreateQuizDTO
        {
            SectionId = section.Id,
            Title = "Invalid Percent Quiz",
            PassPercent = invalidPercent
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(dto.SectionId)).ReturnsAsync(section);

        Assert.Throws<Exception>(() => _service.CreateQuizAsync(dto, accountId).GetAwaiter().GetResult());
    }
    [Test]
    public void CreateQuizAsync_ShouldThrowException_WhenTimerIsInvalid()
    {
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var section = new Section
        {
            Id = Guid.NewGuid(),
            Course = new Course { LecturerId = lecturer.Id }
        };

        var dto = new CreateQuizDTO
        {
            SectionId = section.Id,
            Title = "Invalid Timer Quiz",
            Timer = -5
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockSectionRepo.Setup(x => x.GetSectionByIdAsync(dto.SectionId)).ReturnsAsync(section);

        Assert.Throws<Exception>(() => _service.CreateQuizAsync(dto, accountId).GetAwaiter().GetResult());
    }
    // 
    [Test]
    public void DeleteQuizAsync_ShouldThrowException_WhenLecturerNotFound()
    {
        var accountId = Guid.NewGuid();
        var quizId = Guid.NewGuid();

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId))
            .ReturnsAsync((Lecturer?)null);

        var ex = Assert.Throws<Exception>(() => _service.DeleteQuizAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy giảng viên tương ứng với tài khoản này."));
    }

    [Test]
    public void DeleteQuizAsync_ShouldThrowException_WhenQuizNotFound()
    {
        var accountId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId))
            .ReturnsAsync(lecturer);

        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId))
            .ReturnsAsync((Quiz?)null);

        var ex = Assert.Throws<Exception>(() => _service.DeleteQuizAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy quiz."));
    }

    [Test]
    public void DeleteQuizAsync_ShouldThrowUnauthorizedAccessException_WhenLecturerIsNotOwner()
    {
        var accountId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();
        var otherLecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };

        var quiz = new Quiz
        {
            Id = quizId,
            Section = new Section
            {
                Course = new Course { LecturerId = otherLecturerId }
            }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);

        var ex = Assert.Throws<UnauthorizedAccessException>(() => _service.DeleteQuizAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Bạn không có quyền xóa quiz này."));
    }

    [Test]
    public void DeleteQuizAsync_ShouldThrowException_WhenQuizIsAlreadyDeleted()
    {
        var accountId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };

        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = false,
            Section = new Section
            {
                Course = new Course { LecturerId = lecturerId }
            }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);

        var ex = Assert.Throws<Exception>(() => _service.DeleteQuizAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Quiz này đã bị xóa trước đó."));
    }

    [Test]
    public async Task DeleteQuizAsync_ShouldSoftDelete_WhenAllConditionsMet()
    {
        var accountId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };

        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = true,
            Section = new Section
            {
                Course = new Course { LecturerId = lecturerId }
            }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.UpdateQuiz(It.IsAny<Quiz>()));
        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var result = await _service.DeleteQuizAsync(quizId, accountId);

        Assert.IsTrue(result);
        Assert.IsFalse(quiz.IsActive);
        Assert.That(quiz.UpdatedAt, Is.EqualTo(DateTime.Now).Within(TimeSpan.FromSeconds(1)));

        _mockQuizRepo.Verify(x => x.UpdateQuiz(quiz), Times.Once);
        _mockQuizRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task DeleteQuizAsync_ShouldReturnFalse_WhenSaveChangesFails()
    {
        var accountId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = true,
            Section = new Section
            {
                Course = new Course { LecturerId = lecturerId }
            }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.UpdateQuiz(It.IsAny<Quiz>()));

        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(false);

        var result = await _service.DeleteQuizAsync(quizId, accountId);

        Assert.IsFalse(result);
        _mockQuizRepo.Verify(x => x.UpdateQuiz(quiz), Times.Once);
    }
    [Test]
    public void GetQuizDetailAsync_ShouldThrowException_WhenLecturerNotFound()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId))
            .ReturnsAsync((Lecturer?)null);

        var ex = Assert.Throws<Exception>(() => _service.GetQuizDetailAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy giảng viên tương ứng với tài khoản này."));
    }

    [Test]
    public void GetQuizDetailAsync_ShouldThrowException_WhenQuizNotFound()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync((Quiz?)null);

        var ex = Assert.Throws<Exception>(() => _service.GetQuizDetailAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy quiz."));
    }

    [Test]
    public void GetQuizDetailAsync_ShouldThrowException_WhenQuizIsInactive()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = false,
            Section = new Section { Course = new Course { LecturerId = lecturerId } }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);

        var ex = Assert.Throws<Exception>(() => _service.GetQuizDetailAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Bài quiz này đang bị ẩn (inactive)."));
    }

    [Test]
    public void GetQuizDetailAsync_ShouldThrowUnauthorizedAccessException_WhenLecturerIsNotOwner()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();
        var otherLecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = true,
            Section = new Section { Course = new Course { LecturerId = otherLecturerId } }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);

        var ex = Assert.Throws<UnauthorizedAccessException>(() => _service.GetQuizDetailAsync(quizId, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Bạn không có quyền xem quiz này."));
    }

    [Test]
    public async Task GetQuizDetailAsync_ShouldReturnDTO_AndFilterInactiveQuestionsAndAnswers()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };

        var quiz = new Quiz
        {
            Id = quizId,
            Title = "Test Quiz",
            Description = "Desc",
            Orders = 1,
            IsActive = true,
            Section = new Section { Course = new Course { LecturerId = lecturerId } },
            QuestionQuizzes = new List<QuestionQuiz>
            {
                new QuestionQuiz
                {
                    IsActive = true,
                    Orders = 1,
                    QuestionBank = new QuestionBank
                    {
                        Id = Guid.NewGuid(), Title = "Q1", IsActive = true,
                        AnswerBanks = new List<AnswerBank>
                        {
                            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A1_Correct", IsActive = true },
                            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A1_Inactive", IsActive = false }
                        }
                    }
                },
                new QuestionQuiz
                {
                    IsActive = false,
                    QuestionBank = new QuestionBank { IsActive = true }
                },
                new QuestionQuiz
                {
                    IsActive = true,
                    QuestionBank = new QuestionBank { IsActive = false }
                },
                new QuestionQuiz
                {
                    IsActive = true,
                    QuestionBank = null
                }
            }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);

        var result = await _service.GetQuizDetailAsync(quizId, accountId);

        Assert.IsNotNull(result);
        Assert.AreEqual(quizId, result.QuizId);
        Assert.AreEqual("Test Quiz", result.Title);

        Assert.AreEqual(1, result.Questions.Count);

        var validQuestion = result.Questions[0];
        Assert.AreEqual("Q1", validQuestion.Title);

        Assert.AreEqual(1, validQuestion.Answers.Count);
        Assert.AreEqual("A1_Correct", validQuestion.Answers[0].AnswerName);
    }
    [Test]
    public async Task GetQuizDetailAsync_ShouldReturnEmptyQuestionsList_WhenQuizHasNoQuestions()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = true,
            Section = new Section { Course = new Course { LecturerId = lecturerId } },
            QuestionQuizzes = new List<QuestionQuiz>()
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);

        var result = await _service.GetQuizDetailAsync(quizId, accountId);

        Assert.IsNotNull(result);
        Assert.IsNotNull(result.Questions);
        Assert.IsEmpty(result.Questions);
    }

    [Test]
    public async Task GetQuizDetailAsync_ShouldReturnQuestionsInCorrectOrder()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            IsActive = true,
            Section = new Section { Course = new Course { LecturerId = lecturerId } },
            QuestionQuizzes = new List<QuestionQuiz>
            {
                new QuestionQuiz
                {
                    Orders = 2,
                    IsActive = true,
                    QuestionBank = new QuestionBank { Id = Guid.NewGuid(), Title = "Q2", IsActive = true }
                },
                new QuestionQuiz
                {
                    Orders = 1,
                    IsActive = true,
                    QuestionBank = new QuestionBank { Id = Guid.NewGuid(), Title = "Q1", IsActive = true }
                }
            }
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);

        var result = await _service.GetQuizDetailAsync(quizId, accountId);

        Assert.AreEqual(2, result.Questions.Count);
        Assert.AreEqual("Q1", result.Questions[0].Title);
        Assert.AreEqual("Q2", result.Questions[1].Title);
    }

    [Test]
    public async Task GetQuizDetailAsync_ShouldReturnEmptyString_WhenTitleIsNull()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();

        var lecturer = new Lecturer
        {
            Id = lecturerId,
            AccountId = accountId
        };

        var quiz = new Quiz
        {
            Id = quizId,
            Title = null,
            IsActive = true,
            Section = new Section
            {
                Course = new Course
                {
                    LecturerId = lecturerId
                }
            },
            QuestionQuizzes = new List<QuestionQuiz>()
        };

        _mockLecturerRepo
            .Setup(x => x.GetByAccountIdAsync(accountId))
            .ReturnsAsync(lecturer);

        _mockQuizRepo
            .Setup(x => x.GetQuizWithQuestionsAsync(quizId))
            .ReturnsAsync(quiz);

        var result = await _service.GetQuizDetailAsync(quizId, accountId);

        Assert.IsNotNull(result);
        Assert.AreEqual(string.Empty, result.Title);
    }
    [Test]
    public void UpdateQuizAsync_ShouldThrowException_WhenLecturerNotFound()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var dto = new UpdateQuizDTO { Title = "T" };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync((Lecturer?)null);

        var ex = Assert.Throws<Exception>(() => _service.UpdateQuizAsync(quizId, dto, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy giảng viên tương ứng với tài khoản này."));
    }

    [Test]
    public void UpdateQuizAsync_ShouldThrowException_WhenQuizNotFound()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var dto = new UpdateQuizDTO { Title = "T" };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync((Quiz?)null);

        var ex = Assert.Throws<Exception>(() => _service.UpdateQuizAsync(quizId, dto, accountId).GetAwaiter().GetResult());
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy quiz."));
    }

    [Test]
    public void UpdateQuizAsync_ShouldThrowUnauthorizedAccessException_WhenLecturerIsNotOwner()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accountId };
        var otherLecturerId = Guid.NewGuid();
        var quiz = new Quiz
        {
            Id = quizId,
            Section = new Section { Course = new Course { LecturerId = otherLecturerId } }
        };
        var dto = new UpdateQuizDTO { Title = "T" };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);

        Assert.Throws<UnauthorizedAccessException>(() => _service.UpdateQuizAsync(quizId, dto, accountId).GetAwaiter().GetResult());
    }

    [Test]
    public async Task UpdateQuizAsync_ShouldReturnTrue_AndUpdateFields_WhenDtoHasValues()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            Title = "Old",
            Description = "OldDesc",
            PassPercent = 50,
            Timer = 10,
            Section = new Section { Course = new Course { LecturerId = lecturerId } }
        };
        var dto = new UpdateQuizDTO
        {
            Title = "New Title",
            Description = "New Desc",
            PassPercent = 80,
            Timer = 30
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.UpdateQuiz(It.IsAny<Quiz>()));
        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var result = await _service.UpdateQuizAsync(quizId, dto, accountId);

        Assert.IsTrue(result);
        Assert.AreEqual("New Title", quiz.Title);
        Assert.AreEqual("New Desc", quiz.Description);
        Assert.AreEqual(80, quiz.PassPercent);
        Assert.AreEqual(30, quiz.Timer);
        _mockQuizRepo.Verify(x => x.UpdateQuiz(It.IsAny<Quiz>()), Times.Once);
        _mockQuizRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task UpdateQuizAsync_ShouldKeepOldValues_WhenDtoHasDefaultOrNull()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            Title = "Old",
            Description = "OldDesc",
            PassPercent = 50,
            Timer = 10,
            Section = new Section { Course = new Course { LecturerId = lecturerId } }
        };
        var dto = new UpdateQuizDTO
        {
            Title = null,
            Description = null,
            PassPercent = default,
            Timer = default
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.UpdateQuiz(It.IsAny<Quiz>()));
        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var result = await _service.UpdateQuizAsync(quizId, dto, accountId);

        Assert.IsTrue(result);
        Assert.AreEqual("Old", quiz.Title);
        Assert.AreEqual("OldDesc", quiz.Description);
        Assert.AreEqual(50, quiz.PassPercent);
        Assert.AreEqual(10, quiz.Timer);
        _mockQuizRepo.Verify(x => x.UpdateQuiz(It.IsAny<Quiz>()), Times.Once);
        _mockQuizRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task UpdateQuizAsync_ShouldReturnFalse_WhenSaveFails()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var lecturerId = Guid.NewGuid();
        var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
        var quiz = new Quiz
        {
            Id = quizId,
            Title = "Old",
            Description = "OldDesc",
            PassPercent = 50,
            Timer = 10,
            Section = new Section { Course = new Course { LecturerId = lecturerId } }
        };
        var dto = new UpdateQuizDTO
        {
            Title = "New Title"
        };

        _mockLecturerRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.UpdateQuiz(It.IsAny<Quiz>()));
        _mockQuizRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(false);

        var result = await _service.UpdateQuizAsync(quizId, dto, accountId);

        Assert.IsFalse(result);
        _mockQuizRepo.Verify(x => x.UpdateQuiz(It.IsAny<Quiz>()), Times.Once);
        _mockQuizRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public void StartQuizAsync_QuizNotFoundOrInactive()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();

        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync((Quiz?)null);

        Assert.Throws<Exception>(() =>
            _service.StartQuizAsync(quizId, accountId).GetAwaiter().GetResult()
        );

        var inactiveQuiz = new Quiz { Id = quizId, IsActive = false };
        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(inactiveQuiz);

        Assert.Throws<Exception>(() =>
            _service.StartQuizAsync(quizId, accountId).GetAwaiter().GetResult()
        );
    }

    [Test]
    public void StartQuizAsync_StudentNotFound()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var quiz = new Quiz { Id = quizId, IsActive = true, Section = new Section { CourseId = Guid.NewGuid() } };

        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);
        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync((Student?)null);

        Assert.Throws<Exception>(() =>
            _service.StartQuizAsync(quizId, accountId).GetAwaiter().GetResult()
        );
    }

    [Test]
    public void StartQuizAsync_SectionNull()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var quiz = new Quiz { Id = quizId, IsActive = true, Section = null };

        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);
        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(new Student { Id = Guid.NewGuid() });

        Assert.Throws<Exception>(() =>
            _service.StartQuizAsync(quizId, accountId).GetAwaiter().GetResult()
        );
    }

    [Test]
    public void StartQuizAsync_StudentNotEnrolled()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var quiz = new Quiz { Id = quizId, IsActive = true, Section = new Section { CourseId = courseId } };
        var student = new Student { Id = studentId };

        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);
        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
        _mockEnrollmentRepo.Setup(x => x.IsStudentEnrolledInCourseAsync(studentId, courseId)).ReturnsAsync(false);

        Assert.Throws<UnauthorizedAccessException>(() =>
            _service.StartQuizAsync(quizId, accountId).GetAwaiter().GetResult()
        );
    }

    [Test]
    public async Task StartQuizAsync_CreateSubmissionAndProgress()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var courseId = Guid.NewGuid();

        var student = new Student { Id = studentId, AccountId = accountId };

        var quiz = new Quiz
        {
            Id = quizId,
            Title = "Quiz 1",
            Timer = 20,
            IsActive = true,
            Section = new Section { CourseId = courseId },
            QuestionQuizzes = new List<QuestionQuiz>
            {
                new QuestionQuiz
                {
                    IsActive = true,
                    Orders = 1,
                    QuestionBank = new QuestionBank
                    {
                        Id = Guid.NewGuid(),
                        Title = "Q1",
                        Description = "D1",
                        Type = "SingleChoice",
                        IsActive = true,
                        AnswerBanks = new List<AnswerBank>
                        {
                            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A1", IsActive = true },
                            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A2", IsActive = false }
                        }
                    }
                }
            }
        };

        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);
        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
        _mockEnrollmentRepo.Setup(x => x.IsStudentEnrolledInCourseAsync(studentId, courseId)).ReturnsAsync(true);
        _mockStudentProgressRepo.Setup(x => x.GetByStudentAndQuizAsync(studentId, quizId)).ReturnsAsync((StudentProgress?)null);

        QuizSubmission capturedSubmission = null;
        _mockQuizSubmissionRepo.Setup(x => x.AddAsync(It.IsAny<QuizSubmission>()))
            .Callback<QuizSubmission>(s => capturedSubmission = s)
            .Returns(Task.CompletedTask);

        StudentProgress capturedProgress = null;
        _mockStudentProgressRepo.Setup(x => x.AddAsync(It.IsAny<StudentProgress>()))
            .Callback<StudentProgress>(p => capturedProgress = p)
            .Returns(Task.CompletedTask);

        _mockQuizSubmissionRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var result = await _service.StartQuizAsync(quizId, accountId);

        Assert.IsNotNull(result);
        Assert.AreEqual(quizId, result.QuizId);
        Assert.AreEqual("Quiz 1", result.Title);
        Assert.AreEqual(20, result.Timer);
        Assert.IsNotNull(capturedSubmission);
        Assert.AreEqual(studentId, capturedSubmission.StudentId);
        Assert.AreEqual(quizId, capturedSubmission.QuizId);
        Assert.IsNotNull(capturedProgress);
        Assert.AreEqual(studentId, capturedProgress.StudentId);
        Assert.AreEqual(quizId, capturedProgress.QuizId);
        Assert.AreEqual(courseId, capturedProgress.CourseId);
        Assert.IsFalse(capturedProgress.IsCompleted);
        Assert.AreEqual(1, result.Questions.Count);
        Assert.AreEqual(1, result.Questions[0].Answers.Count);
    }

    [Test]
    public async Task StartQuizAsync_UpdateProgress()
    {
        var quizId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var courseId = Guid.NewGuid();

        var student = new Student { Id = studentId, AccountId = accountId };

        var existingProgress = new StudentProgress
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            QuizId = quizId,
            CourseId = courseId,
            LastViewedAt = DateTime.Now.AddHours(-5)
        };

        var quiz = new Quiz
        {
            Id = quizId,
            Title = "Quiz 2",
            Timer = 10,
            IsActive = true,
            Section = new Section { CourseId = courseId },
            QuestionQuizzes = new List<QuestionQuiz>()
        };

        _mockQuizRepo.Setup(x => x.GetQuizWithQuestionsAsync(quizId)).ReturnsAsync(quiz);
        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
        _mockEnrollmentRepo.Setup(x => x.IsStudentEnrolledInCourseAsync(studentId, courseId)).ReturnsAsync(true);
        _mockStudentProgressRepo.Setup(x => x.GetByStudentAndQuizAsync(studentId, quizId)).ReturnsAsync(existingProgress);

        QuizSubmission capturedSubmission = null;
        _mockQuizSubmissionRepo.Setup(x => x.AddAsync(It.IsAny<QuizSubmission>()))
            .Callback<QuizSubmission>(s => capturedSubmission = s)
            .Returns(Task.CompletedTask);

        _mockQuizSubmissionRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(true);

        var before = DateTime.Now;
        var result = await _service.StartQuizAsync(quizId, accountId);
        var after = DateTime.Now;

        Assert.IsNotNull(result);
        Assert.IsNotNull(capturedSubmission);
        Assert.AreEqual(studentId, capturedSubmission.StudentId);
        Assert.AreEqual(quizId, capturedSubmission.QuizId);
        Assert.That(existingProgress.LastViewedAt, Is.InRange(before.AddSeconds(-1), after.AddSeconds(1)));
    }
    [Test]
    public void SubmitQuizAsync_ShouldThrowException_WhenStudentNotFound()
    {
        var submissionId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var submitDto = new QuizSubmitDto();

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync((Student?)null);

        var ex = Assert.ThrowsAsync<Exception>(() => _service.SubmitQuizAsync(submissionId, submitDto, accountId));
        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy hồ sơ sinh viên cho tài khoản này."));
    }

    [Test]
    public void SubmitQuizAsync_ShouldThrowUnauthorized_WhenSubmissionNotFoundOrUserMismatch()
    {
        var submissionId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var submitDto = new QuizSubmitDto();

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(new Student { Id = studentId });

        _mockQuizSubmissionRepo.Setup(x => x.GetByIdAsync(submissionId)).ReturnsAsync((QuizSubmission?)null);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.SubmitQuizAsync(submissionId, submitDto, accountId));
        Assert.That(ex.Message, Is.EqualTo("Bạn không có quyền nộp bài quiz này."));
    }

    [Test]
    public void SubmitQuizAsync_ShouldThrowException_WhenAlreadySubmitted()
    {
        var submissionId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var submitDto = new QuizSubmitDto();

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(new Student { Id = studentId });
        _mockQuizSubmissionRepo.Setup(x => x.GetByIdAsync(submissionId)).ReturnsAsync(new QuizSubmission
        {
            StudentId = studentId,
            EndedAt = DateTime.Now
        });

        var ex = Assert.ThrowsAsync<Exception>(() => _service.SubmitQuizAsync(submissionId, submitDto, accountId));
        Assert.That(ex.Message, Is.EqualTo("Bài quiz này đã được nộp trước đó."));
    }

    [Test]
    public async Task SubmitQuizAsync_ShouldCalculateScoreAndCreateProgress_WhenPassed()
    {
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var questionId = Guid.NewGuid();
        var correctAnsId = Guid.NewGuid();

        var student = new Student { Id = studentId };
        var submission = new QuizSubmission { Id = submissionId, StudentId = studentId, QuizId = quizId, EndedAt = null };
        var quiz = new Quiz { Id = quizId, PassPercent = 50 };

        var courseId = Guid.NewGuid();
        var quizFull = new Quiz { Id = quizId, Section = new Section { CourseId = courseId } };

        var submitDto = new QuizSubmitDto
        {
            Answers = new List<StudentAnswerSubmitDto>
            {
                new StudentAnswerSubmitDto { QuestionId = questionId, SelectedAnswerIds = new List<Guid> { correctAnsId } }
            }
        };

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
        _mockQuizSubmissionRepo.Setup(x => x.GetByIdAsync(submissionId)).ReturnsAsync(submission);
        _mockQuizRepo.Setup(x => x.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quizFull);

        _mockAnswerBankRepo.Setup(x => x.GetActiveAnswersForQuestionAsync(questionId))
            .ReturnsAsync(new List<AnswerBank>
            {
                new AnswerBank { Id = correctAnsId, IsCorrect = true },
                new AnswerBank { Id = Guid.NewGuid(), IsCorrect = false }
            });

        _mockStudentProgressRepo.Setup(x => x.GetByStudentAndQuizAsync(studentId, quizId))
            .ReturnsAsync((StudentProgress?)null);

        var result = await _service.SubmitQuizAsync(submissionId, submitDto, accountId);

        Assert.AreEqual(100, result.Score);
        Assert.IsTrue(result.IsPassed);
        Assert.IsNotNull(result.EndedAt);

        _mockQuizSubmissionRepo.Verify(x => x.Update(submission), Times.Once);
        _mockQuizAnswerSubmissionRepo.Verify(x => x.AddRangeAsync(It.IsAny<List<QuizAnswerSubmission>>()), Times.Once);
        _mockStudentProgressRepo.Verify(x => x.AddAsync(It.IsAny<StudentProgress>()), Times.Once);
        _mockQuizRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task SubmitQuizAsync_ShouldNotUpdateProgress_WhenFailed()
    {
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var questionId = Guid.NewGuid();
        var wrongAnsId = Guid.NewGuid();

        var student = new Student { Id = studentId };
        var submission = new QuizSubmission { Id = submissionId, StudentId = studentId, QuizId = quizId };
        var quiz = new Quiz { Id = quizId, PassPercent = 80 };

        var submitDto = new QuizSubmitDto
        {
            Answers = new List<StudentAnswerSubmitDto>
            {
                new StudentAnswerSubmitDto { QuestionId = questionId, SelectedAnswerIds = new List<Guid> { wrongAnsId } }
            }
        };

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
        _mockQuizSubmissionRepo.Setup(x => x.GetByIdAsync(submissionId)).ReturnsAsync(submission);
        _mockQuizRepo.Setup(x => x.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);

        _mockAnswerBankRepo.Setup(x => x.GetActiveAnswersForQuestionAsync(questionId))
            .ReturnsAsync(new List<AnswerBank>
            {
                new AnswerBank { Id = Guid.NewGuid(), IsCorrect = true },
                new AnswerBank { Id = wrongAnsId, IsCorrect = false }
            });

        var result = await _service.SubmitQuizAsync(submissionId, submitDto, accountId);

        Assert.AreEqual(0, result.Score);
        Assert.IsFalse(result.IsPassed);

        _mockStudentProgressRepo.Verify(x => x.AddAsync(It.IsAny<StudentProgress>()), Times.Never);
        _mockStudentProgressRepo.Verify(x => x.GetByStudentAndQuizAsync(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
    }

    [Test]
    public async Task SubmitQuizAsync_ShouldUpdateExistingProgress_WhenPassed()
    {
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var questionId = Guid.NewGuid();
        var correctAnsId = Guid.NewGuid();

        var student = new Student { Id = studentId };
        var submission = new QuizSubmission { Id = submissionId, StudentId = studentId, QuizId = quizId };
        var quiz = new Quiz { Id = quizId, PassPercent = 50 };
        var quizFull = new Quiz { Id = quizId, Section = new Section { CourseId = Guid.NewGuid() } };

        var submitDto = new QuizSubmitDto
        {
            Answers = new List<StudentAnswerSubmitDto>
            {
                new StudentAnswerSubmitDto { QuestionId = questionId, SelectedAnswerIds = new List<Guid> { correctAnsId } }
            }
        };

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
        _mockQuizSubmissionRepo.Setup(x => x.GetByIdAsync(submissionId)).ReturnsAsync(submission);
        _mockQuizRepo.Setup(x => x.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);
        _mockQuizRepo.Setup(x => x.GetQuizWithSectionAndCourseAsync(quizId)).ReturnsAsync(quizFull);

        _mockAnswerBankRepo.Setup(x => x.GetActiveAnswersForQuestionAsync(questionId))
            .ReturnsAsync(new List<AnswerBank> { new AnswerBank { Id = correctAnsId, IsCorrect = true } });

        var existingProgress = new StudentProgress { Id = Guid.NewGuid(), IsCompleted = false };
        _mockStudentProgressRepo.Setup(x => x.GetByStudentAndQuizAsync(studentId, quizId))
            .ReturnsAsync(existingProgress);

        await _service.SubmitQuizAsync(submissionId, submitDto, accountId);

        Assert.IsTrue(existingProgress.IsCompleted);
        _mockStudentProgressRepo.Verify(x => x.AddAsync(It.IsAny<StudentProgress>()), Times.Never);
    }
    [Test]
    public void SubmitQuizAsync_ShouldThrowException_WhenQuizNotFound()
    {
        var accountId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();
        var quizId = Guid.NewGuid();

        var student = new Student { Id = studentId };
        var submission = new QuizSubmission
        {
            Id = submissionId,
            StudentId = studentId,
            QuizId = quizId
        };

        var submitDto = new QuizSubmitDto
        {
            Answers = new List<StudentAnswerSubmitDto>()
        };

        _mockStudentRepo.Setup(x => x.GetByAccountIdAsync(accountId))
            .ReturnsAsync(student);

        _mockQuizSubmissionRepo.Setup(x => x.GetByIdAsync(submissionId))
            .ReturnsAsync(submission);

        _mockQuizRepo.Setup(x => x.GetQuizByIdAsync(quizId))
            .ReturnsAsync((Quiz?)null);

        var ex = Assert.ThrowsAsync<Exception>(() =>
            _service.SubmitQuizAsync(submissionId, submitDto, accountId));

        Assert.That(ex.Message, Is.EqualTo("Không tìm thấy bài quiz."));
    }
}
