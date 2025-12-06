using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TestSkillUp
{
    [TestFixture]
    public class QuestionServiceTests
    {
        private Mock<IQuizRepository> _quizRepository = null!;
        private Mock<ILecturerRepository> _lecturerRepository = null!;
        private Mock<IQuestionBankRepository> _questionBankRepository = null!;
        private Mock<ICloudinaryService> _cloudinaryService = null!;
        private Mock<IQuestionQuizRepository> _questionQuizRepository = null!;
        private Mock<IQuizSubmissionRepository> _quizSubmissionRepository = null!;

        private QuestionService _sut = null!;

        [SetUp]
        public void Setup()
        {
            _quizRepository = new Mock<IQuizRepository>(MockBehavior.Strict);
            _lecturerRepository = new Mock<ILecturerRepository>(MockBehavior.Strict);
            _questionBankRepository = new Mock<IQuestionBankRepository>(MockBehavior.Strict);
            _cloudinaryService = new Mock<ICloudinaryService>(MockBehavior.Loose);
            _questionQuizRepository = new Mock<IQuestionQuizRepository>(MockBehavior.Strict);
            _quizSubmissionRepository = new Mock<IQuizSubmissionRepository>(MockBehavior.Strict);

            _sut = new QuestionService(
                _quizRepository.Object,
                _lecturerRepository.Object,
                _questionBankRepository.Object,
                _cloudinaryService.Object,
                _questionQuizRepository.Object,
                _quizSubmissionRepository.Object
            );
        }

        [Test]
        public async Task AddQuestionWithAnswersToQuizAsync_ReturnsQuestionResponse_WhenInputIsValid()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var sectionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();

            var lecturer = new Lecturer { Id = lecturerId, AccountId = accId };

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(lecturer);

            var quiz = new Quiz
            {
                Id = quizId,
                SectionId = sectionId,
                QuestionQuizzes = new List<QuestionQuiz>()
            };

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Q1",
                Description = "Desc",
                Type = "SingleChoice",
                Orders = 1,
                ImageUrl = null,
                Answers = new List<CreateAnswerDTO>
                {
                    new CreateAnswerDTO { AnswerName = "A", IsCorrect = true, ImageUrl = null },
                    new CreateAnswerDTO { AnswerName = "B", IsCorrect = false, ImageUrl = null }
                }
            };

            _questionBankRepository.Setup(r => r.CreateAsync(It.IsAny<QuestionBank>()))
                                   .Returns(Task.CompletedTask);

            _quizRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var result = await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId);

            Assert.IsNotNull(result);
            Assert.AreEqual(createDto.Title, result.Title);
            Assert.AreEqual(createDto.Type, result.Type);
            Assert.AreEqual(2, result.Answers.Count);

            _questionBankRepository.Verify(r => r.CreateAsync(It.IsAny<QuestionBank>()), Times.Once);
            _quizRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        [Test]
        public async Task AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenLecturerNotFound()
        {
            var accId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync((Lecturer)null);

            var createDto = new CreateQuestionDTO
            {
                QuizId = Guid.NewGuid(),
                Title = "Q",
                Type = "SingleChoice",
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = true },
            new CreateAnswerDTO { AnswerName = "B", IsCorrect = false }
        }
            };

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));
        }

        [Test]
        public async Task AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenQuizNotFound()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync((Quiz)null);

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Q",
                Type = "SingleChoice",
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = true },
            new CreateAnswerDTO { AnswerName = "B", IsCorrect = false }
        }
            };

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));
        }
        [Test]
        public async Task AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenTooManyAnswers()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId, SectionId = Guid.NewGuid(), QuestionQuizzes = new List<QuestionQuiz>() });

            var answers = new List<CreateAnswerDTO>();
            for (int i = 0; i < 8; i++)
                answers.Add(new CreateAnswerDTO { AnswerName = $"A{i}", IsCorrect = i == 0 });

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Q",
                Type = "SingleChoice",
                Answers = answers
            };

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));
        }
        [Test]
        public void AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenLessThanTwoAnswers()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId, SectionId = Guid.NewGuid(), QuestionQuizzes = new List<QuestionQuiz>() });

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Question 1",
                Type = "SingleChoice",
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = true, ImageUrl = null } // Chỉ 1 đáp án
        }
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));

            Assert.That(ex.Message, Is.EqualTo("Một câu hỏi phải có ít nhất 2 câu trả lời."));
        }
        [Test]
        public void AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenTypeIsNullOrEmpty()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId, SectionId = Guid.NewGuid(), QuestionQuizzes = new List<QuestionQuiz>() });

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Question 1",
                Type = null, 
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = true, ImageUrl = null },
            new CreateAnswerDTO { AnswerName = "B", IsCorrect = false, ImageUrl = null }
        }
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));

            Assert.That(ex.Message, Is.EqualTo("Loại câu hỏi (Type) không được để trống."));
        }
        [Test]
        public void AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenSingleChoiceHasNoCorrectAnswer()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId, SectionId = Guid.NewGuid(), QuestionQuizzes = new List<QuestionQuiz>() });

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Question 1",
                Type = "SingleChoice",
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = false, ImageUrl = null },
            new CreateAnswerDTO { AnswerName = "B", IsCorrect = false, ImageUrl = null }
        }
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));

            Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn 1 (SingleChoice) phải có 1 đáp án đúng."));
        }
        [Test]
        public void AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenSingleChoiceHasMultipleCorrectAnswers()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId, SectionId = Guid.NewGuid(), QuestionQuizzes = new List<QuestionQuiz>() });

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Question 1",
                Type = "SingleChoice",
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = true, ImageUrl = null },
            new CreateAnswerDTO { AnswerName = "B", IsCorrect = true, ImageUrl = null }
        }
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));

            Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn 1 (SingleChoice) chỉ được có 1 đáp án đúng."));
        }
        [Test]
        public void AddQuestionWithAnswersToQuizAsync_ThrowsException_WhenMultiChoiceHasNoCorrectAnswer()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId, SectionId = Guid.NewGuid(), QuestionQuizzes = new List<QuestionQuiz>() });

            var createDto = new CreateQuestionDTO
            {
                QuizId = quizId,
                Title = "Question 1",
                Type = "MultiChoice",
                Answers = new List<CreateAnswerDTO>
        {
            new CreateAnswerDTO { AnswerName = "A", IsCorrect = false, ImageUrl = null },
            new CreateAnswerDTO { AnswerName = "B", IsCorrect = false, ImageUrl = null }
        }
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddQuestionWithAnswersToQuizAsync(createDto, accId));

            Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng."));
        }
        //method : AddBulkQuestionFromBankToQuizAsync

        [Test]
        public async Task AddBulkQuestionFromBankToQuizAsync_ReturnsResult_WhenInputIsValid()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var questionId = Guid.NewGuid();

            var lecturer = new Lecturer { Id = lecturerId, AccountId = accId };
            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(lecturer);

            var quiz = new Quiz { Id = quizId, QuestionQuizzes = new List<QuestionQuiz>() };
            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);
            _quizRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var questionBank = new QuestionBank
            {
                Id = questionId,
                Title = "Q1",
                AnswerBanks = new List<AnswerBank>
            {
                new AnswerBank { Id = Guid.NewGuid(), IsCorrect = true },
                new AnswerBank { Id = Guid.NewGuid(), IsCorrect = false }
            }
            };
            _questionBankRepository.Setup(r => r.GetByIdAsync(questionId))
                                   .ReturnsAsync(questionBank);

            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, questionId))
                                   .ReturnsAsync((QuestionQuiz?)null);

            var dtos = new List<CreateQuestionQuizDTO>
        {
            new CreateQuestionQuizDTO { QuizId = quizId, QuestionBankId = questionId, Orders = 1 }
        };

            // Act
            var result = await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual(questionId, result[0].QuestionBankId);
            Assert.AreEqual(quizId, result[0].QuizId);

            _lecturerRepository.Verify(r => r.GetByAccountIdAsync(accId), Times.Once);
            _quizRepository.Verify(r => r.GetQuizByIdAsync(quizId), Times.Once);
            _questionBankRepository.Verify(r => r.GetByIdAsync(questionId), Times.Once);
            _quizRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        [Test]
        public void AddBulkQuestionFromBankToQuizAsync_Throws_WhenLecturerNotFound()
        {
            var accId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync((Lecturer?)null);

            var dtos = new List<CreateQuestionQuizDTO>
    {
        new CreateQuestionQuizDTO { QuizId = Guid.NewGuid(), QuestionBankId = Guid.NewGuid(), Orders = 1 }
    };

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId));
        }
        [Test]
        public void AddBulkQuestionFromBankToQuizAsync_Throws_WhenQuizNotFound()
        {
            var accId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer());

            _quizRepository.Setup(r => r.GetQuizByIdAsync(It.IsAny<Guid>()))
                           .ReturnsAsync((Quiz?)null);

            var dtos = new List<CreateQuestionQuizDTO>
    {
        new CreateQuestionQuizDTO { QuizId = Guid.NewGuid(), QuestionBankId = Guid.NewGuid(), Orders = 1 }
    };

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId));
        }
        [Test]
        public void AddBulkQuestionFromBankToQuizAsync_Throws_WhenQuestionBankNotFound()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer());

            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId))
                           .ReturnsAsync(new Quiz { Id = quizId });

            _questionBankRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                                   .ReturnsAsync((QuestionBank?)null);

            var dtos = new List<CreateQuestionQuizDTO>
    {
        new CreateQuestionQuizDTO { QuizId = quizId, QuestionBankId = Guid.NewGuid(), Orders = 1 }
    };

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId));
        }
        [Test]
        public async Task AddBulkQuestionFromBankToQuizAsync_UpdatesExistingInactiveLink()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer());

            var quiz = new Quiz { Id = quizId, QuestionQuizzes = new List<QuestionQuiz>() };
            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);
            _quizRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var qb = new QuestionBank
            {
                Id = questionId,
                AnswerBanks = new List<AnswerBank>
        {
            new AnswerBank { IsCorrect = true },
            new AnswerBank { IsCorrect = false }
        }
            };
            _questionBankRepository.Setup(r => r.GetByIdAsync(questionId))
                                   .ReturnsAsync(qb);

            var existing = new QuestionQuiz
            {
                QuizId = quizId,
                QuestionBankId = questionId,
                IsActive = false,
                Orders = 5
            };

            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, questionId))
                                   .ReturnsAsync(existing);

            _questionQuizRepository.Setup(r => r.Update(existing));

            var dtos = new List<CreateQuestionQuizDTO>
    {
        new CreateQuestionQuizDTO { QuizId = quizId, QuestionBankId = questionId, Orders = 1 }
    };

            var result = await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId);

            Assert.AreEqual(1, result.Count);
            Assert.AreEqual(1, existing.Orders);
            Assert.IsTrue(existing.IsActive);
        }
        [Test]
        public async Task AddBulkQuestionFromBankToQuizAsync_DoesNotUpdate_WhenExistingLinkIsActive()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer());

            var quiz = new Quiz { Id = quizId, QuestionQuizzes = new List<QuestionQuiz>() };
            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);
            _quizRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var qb = new QuestionBank
            {
                Id = questionId,
                AnswerBanks = new List<AnswerBank>
        {
            new AnswerBank { IsCorrect = true },
            new AnswerBank { IsCorrect = false }
        }
            };
            _questionBankRepository.Setup(r => r.GetByIdAsync(questionId)).ReturnsAsync(qb);

            var existing = new QuestionQuiz
            {
                QuizId = quizId,
                QuestionBankId = questionId,
                IsActive = true,
                Orders = 5
            };

            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, questionId)).ReturnsAsync(existing);
            _questionQuizRepository.Setup(r => r.Update(It.IsAny<QuestionQuiz>())).Verifiable();

            var dtos = new List<CreateQuestionQuizDTO>
    {
        new CreateQuestionQuizDTO { QuizId = quizId, QuestionBankId = questionId, Orders = 1 }
    };

            var result = await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId);

            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual(0, quiz.QuestionQuizzes.Count);
            Assert.IsTrue(existing.IsActive);
            Assert.AreEqual(5, existing.Orders);

            _questionQuizRepository.Verify(r => r.Update(It.IsAny<QuestionQuiz>()), Times.Never);
            _quizRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        [Test]
        public async Task AddBulkQuestionFromBankToQuizAsync_AddsMultipleQuestions_WhenDtosContainManyItems()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var q1 = Guid.NewGuid();
            var q2 = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer());
            var quiz = new Quiz { Id = quizId, QuestionQuizzes = new List<QuestionQuiz>() };
            _quizRepository.Setup(r => r.GetQuizByIdAsync(quizId)).ReturnsAsync(quiz);
            _quizRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var qb1 = new QuestionBank { Id = q1, Title = "Q1", AnswerBanks = new List<AnswerBank> { new AnswerBank { IsCorrect = true }, new AnswerBank { IsCorrect = false } } };
            var qb2 = new QuestionBank { Id = q2, Title = "Q2", AnswerBanks = new List<AnswerBank> { new AnswerBank { IsCorrect = true }, new AnswerBank { IsCorrect = false } } };

            _questionBankRepository.Setup(r => r.GetByIdAsync(q1)).ReturnsAsync(qb1);
            _questionBankRepository.Setup(r => r.GetByIdAsync(q2)).ReturnsAsync(qb2);

            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, q1)).ReturnsAsync((QuestionQuiz?)null);
            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, q2)).ReturnsAsync((QuestionQuiz?)null);

            var dtos = new List<CreateQuestionQuizDTO>
    {
        new CreateQuestionQuizDTO { QuizId = quizId, QuestionBankId = q1, Orders = 1 },
        new CreateQuestionQuizDTO { QuizId = quizId, QuestionBankId = q2, Orders = 2 }
    };

            var result = await _sut.AddBulkQuestionFromBankToQuizAsync(dtos, accId);

            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(q1, result[0].QuestionBankId);
            Assert.AreEqual(q2, result[1].QuestionBankId);

            _questionBankRepository.Verify(r => r.GetByIdAsync(q1), Times.Once);
            _questionBankRepository.Verify(r => r.GetByIdAsync(q2), Times.Once);
            _quizRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        // ---------- UPDATE QUESTION IN QUIZ TESTS ----------
        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenLecturerNotFound()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync((Lecturer?)null);

            var dto = new UpdateQuestionDTO
            {
                QuizId = Guid.NewGuid(),
                Title = "T",
                Description = "D",
                Type = "SingleChoice",
                ImageUrl = null,
                Answers = new List<UpdateAnswerDTO> { new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = true } }
            };

            Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenOldQuestionNotFound()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer { Id = Guid.NewGuid(), AccountId = accId });
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync((QuestionBank?)null);

            var dto = new UpdateQuestionDTO
            {
                QuizId = Guid.NewGuid(),
                Title = "T",
                Description = "D",
                Type = "SingleChoice",
                Answers = new List<UpdateAnswerDTO>
        {
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = true },
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "B", IsCorrect = false }
        }
            };

            Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenUnauthorizedLecturer()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(lecturer);

            var oldQuestion = new QuestionBank { Id = oldQuestionId, LecturerId = Guid.NewGuid(), AnswerBanks = new List<AnswerBank>() };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync(oldQuestion);

            var dto = new UpdateQuestionDTO
            {
                QuizId = Guid.NewGuid(),
                Title = "T",
                Description = "D",
                Type = "SingleChoice",
                Answers = new List<UpdateAnswerDTO>
        {
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = true },
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "B", IsCorrect = false }
        }
            };

            Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenLinkNotFound()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accId });

            var oldQuestion = new QuestionBank
            {
                Id = oldQuestionId,
                LecturerId = lecturerId,
                AnswerBanks = new List<AnswerBank>
        {
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A", IsCorrect = true },
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "B", IsCorrect = false }
        }
            };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync(oldQuestion);

            var dto = new UpdateQuestionDTO
            {
                QuizId = quizId,
                Title = "T",
                Description = "D",
                Type = "SingleChoice",
                Answers = new List<UpdateAnswerDTO>
        {
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = true },
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "B", IsCorrect = false }
        }
            };

            _questionQuizRepository.Setup(r => r.GetLinkAsync(dto.QuizId, oldQuestionId)).ReturnsAsync((QuestionQuiz?)null);

            Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenAnswersCountExceedsMax()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accId });

            var oldQuestion = new QuestionBank { Id = oldQuestionId, LecturerId = lecturerId, AnswerBanks = new List<AnswerBank>() };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync(oldQuestion);

            var link = new QuestionQuiz { QuizId = quizId, QuestionBankId = oldQuestionId, Orders = 1 };
            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, oldQuestionId)).ReturnsAsync(link);

            var answers = new List<UpdateAnswerDTO>();
            for (int i = 0; i < 8; i++) answers.Add(new UpdateAnswerDTO { AnswerId = null, AnswerName = $"A{i}", IsCorrect = i == 0 });

            var dto = new UpdateQuestionDTO { QuizId = quizId, Title = "T", Type = "SingleChoice", Answers = answers };

            Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenLessThanTwoAnswers()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accId });
            var oldQuestion = new QuestionBank { Id = oldQuestionId, LecturerId = lecturerId, AnswerBanks = new List<AnswerBank>() };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync(oldQuestion);

            var link = new QuestionQuiz { QuizId = quizId, QuestionBankId = oldQuestionId, Orders = 1 };
            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, oldQuestionId)).ReturnsAsync(link);

            var dto = new UpdateQuestionDTO
            {
                QuizId = quizId,
                Title = "T",
                Type = "SingleChoice",
                Answers = new List<UpdateAnswerDTO> { new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = true } }
            };

            var ex = Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
            Assert.That(ex.Message, Is.EqualTo("Một câu hỏi phải có ít nhất 2 câu trả lời."));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenSingleChoiceInvalidCorrectCount()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accId });

            var oldQuestion = new QuestionBank
            {
                Id = oldQuestionId,
                LecturerId = lecturerId,
                AnswerBanks = new List<AnswerBank>
        {
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A", IsCorrect = true },
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "B", IsCorrect = false }
        }
            };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync(oldQuestion);

            var link = new QuestionQuiz { QuizId = quizId, QuestionBankId = oldQuestionId, Orders = 1 };
            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, oldQuestionId)).ReturnsAsync(link);

            var dto = new UpdateQuestionDTO
            {
                QuizId = quizId,
                Title = "T",
                Type = "SingleChoice",
                Answers = new List<UpdateAnswerDTO>
        {
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = false },
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "B", IsCorrect = false }
        }
            };

            var ex = Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
            Assert.That(ex.Message, Is.EqualTo("SingleChoice phải có đúng 1 đáp án đúng."));
        }

        [Test]
        public void UpdateQuestionInQuizAsync_Throws_WhenMultiChoiceHasNoCorrect()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId)).ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accId });

            var oldQuestion = new QuestionBank
            {
                Id = oldQuestionId,
                LecturerId = lecturerId,
                AnswerBanks = new List<AnswerBank>
        {
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A", IsCorrect = true },
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "B", IsCorrect = false }
        }
            };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId)).ReturnsAsync(oldQuestion);

            var link = new QuestionQuiz { QuizId = quizId, QuestionBankId = oldQuestionId, Orders = 1 };
            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, oldQuestionId)).ReturnsAsync(link);

            var dto = new UpdateQuestionDTO
            {
                QuizId = quizId,
                Title = "T",
                Type = "MultiChoice",
                Answers = new List<UpdateAnswerDTO>
        {
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "A", IsCorrect = false },
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "B", IsCorrect = false }
        }
            };

            var ex = Assert.ThrowsAsync<Exception>(async () => await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId));
            Assert.That(ex.Message, Is.EqualTo("MultiChoice phải có ít nhất 1 đáp án đúng."));
        }

        [Test]
        public async Task UpdateQuestionInQuizAsync_UpdatesInPlace_WhenNotUsedInSubmissions()
        {
            var accId = Guid.NewGuid();
            var oldQuestionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                              .ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accId });

            var existingAnswerId = Guid.NewGuid();
            var oldQuestion = new QuestionBank
            {
                Id = oldQuestionId,
                LecturerId = lecturerId,
                Title = "OldTitle",
                Description = "OldDesc",
                Type = "SingleChoice",
                Image = "old-img",
                AnswerBanks = new List<AnswerBank>
        {
            new AnswerBank { Id = existingAnswerId, AnswerName = "OldA", IsCorrect = true, IsActive = true, Image = "a.png" },
            new AnswerBank { Id = Guid.NewGuid(), AnswerName = "OldB", IsCorrect = false, IsActive = true }
        }
            };
            _questionBankRepository.Setup(r => r.GetQuestionWithAnswersAsync(oldQuestionId))
                                   .ReturnsAsync(oldQuestion);

            var link = new QuestionQuiz { QuizId = quizId, QuestionBankId = oldQuestionId, Orders = 2 };
            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, oldQuestionId)).ReturnsAsync(link);

            _quizSubmissionRepository.Setup(r => r.GetQuestionBanksInSubmission(oldQuestionId))
                                    .ReturnsAsync(new List<QuizSubmission>());

            var dto = new UpdateQuestionDTO
            {
                QuizId = quizId,
                Title = "NewTitle",
                Description = "NewDesc",
                Type = "SingleChoice",
                ImageUrl = null,
                Answers = new List<UpdateAnswerDTO>
        {
            new UpdateAnswerDTO { AnswerId = existingAnswerId, AnswerName = "OldA-Edited", IsCorrect = true, ImageUrl = null },
            new UpdateAnswerDTO { AnswerId = null, AnswerName = "NewC", IsCorrect = false, ImageUrl = null }
        }
            };

            _questionBankRepository.Setup(r => r.Update(It.IsAny<QuestionBank>()));
            _questionBankRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var result = await _sut.UpdateQuestionInQuizAsync(oldQuestionId, dto, accId);

            Assert.IsNotNull(result);
            Assert.AreEqual(dto.Title, result.Title);
            Assert.AreEqual(link.Orders, result.Orders);
            Assert.AreEqual(2, result.Answers.Count);

            _questionBankRepository.Verify(r => r.Update(It.IsAny<QuestionBank>()), Times.Once);
            _questionBankRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }


        //RemoveQuestionFromQuizAsync
        [Test]
        public void RemoveQuestionFromQuizAsync_Throws_WhenLecturerNotFound()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                               .ReturnsAsync((Lecturer?)null);

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.RemoveQuestionFromQuizAsync(quizId, questionId, accId));
        }

        [Test]
        public void RemoveQuestionFromQuizAsync_Throws_WhenQuizNotFound()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                               .ReturnsAsync(new Lecturer { Id = lecturerId });

            _quizRepository.Setup(r => r.GetQuizWithSectionAndCourseAsync(quizId))
                           .ReturnsAsync((Quiz?)null);

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.RemoveQuestionFromQuizAsync(quizId, questionId, accId));
        }
        [Test]
        public void RemoveQuestionFromQuizAsync_Throws_WhenUnauthorized()
        {
            var accId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid() };

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                               .ReturnsAsync(lecturer);

            var quiz = new Quiz
            {
                Section = new Section
                {
                    Course = new Course
                    {
                        LecturerId = Guid.NewGuid()   
                    }
                }
            };

            _quizRepository.Setup(r => r.GetQuizWithSectionAndCourseAsync(quizId))
                           .ReturnsAsync(quiz);

            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _sut.RemoveQuestionFromQuizAsync(quizId, questionId, accId));
        }
        [Test]
        public void RemoveQuestionFromQuizAsync_Throws_WhenLinkNotFound()
        {
            var accId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                               .ReturnsAsync(new Lecturer { Id = lecturerId });

            var quiz = new Quiz
            {
                Section = new Section
                {
                    Course = new Course
                    {
                        LecturerId = lecturerId
                    }
                }
            };

            _quizRepository.Setup(r => r.GetQuizWithSectionAndCourseAsync(quizId))
                           .ReturnsAsync(quiz);

            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, questionId))
                                   .ReturnsAsync((QuestionQuiz?)null);

            Assert.ThrowsAsync<Exception>(async () =>
                await _sut.RemoveQuestionFromQuizAsync(quizId, questionId, accId));
        }
        [Test]
        public async Task RemoveQuestionFromQuizAsync_ReturnsTrue_WhenSuccessful()
        {
            var accId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();
            var quizId = Guid.NewGuid();
            var questionId = Guid.NewGuid();

            _lecturerRepository.Setup(r => r.GetByAccountIdAsync(accId))
                               .ReturnsAsync(new Lecturer { Id = lecturerId });

            var quiz = new Quiz
            {
                Section = new Section
                {
                    Course = new Course { LecturerId = lecturerId }
                }
            };
            _quizRepository.Setup(r => r.GetQuizWithSectionAndCourseAsync(quizId))
                           .ReturnsAsync(quiz);

            var link = new QuestionQuiz { IsActive = true };

            _questionQuizRepository.Setup(r => r.GetLinkAsync(quizId, questionId))
                                   .ReturnsAsync(link);

            _questionQuizRepository.Setup(r => r.Update(It.IsAny<QuestionQuiz>()));

            _questionBankRepository.Setup(r => r.SaveChangesAsync())
                                   .ReturnsAsync(true);

            var result = await _sut.RemoveQuestionFromQuizAsync(quizId, questionId, accId);

            Assert.IsTrue(result);
            Assert.IsFalse(link.IsActive);
            _questionQuizRepository.Verify(r => r.Update(It.IsAny<QuestionQuiz>()), Times.Once);
            _questionBankRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

    }
}
