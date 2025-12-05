using Moq;
using NUnit.Framework;
using OfficeOpenXml;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TestSkillUp.Services
{
	[TestFixture]
	public class QuestionBankServiceTests
	{
		// Mocks
		private Mock<IQuestionBankRepository> _mockQuestionBankRepo;
		private Mock<ILecturerRepository> _mockLecturerRepo;
		private Mock<ICourseRepository> _mockCourseRepo;
		private Mock<ICurrentUserService> _mockCurrentUserService;
		private Mock<ICloudinaryService> _mockCloudinaryService;
		private Mock<ISectionRepository> _mockSectionRepo;
		private Mock<IQuestionQuizRepository> _mockQuestionQuizRepo;
		private Mock<IQuizSubmissionRepository> _mockQuizSubmissionRepo;

		private QuestionBankService _service;

		[SetUp]
		public void Setup()
		{
			_mockQuestionBankRepo = new Mock<IQuestionBankRepository>();
			_mockLecturerRepo = new Mock<ILecturerRepository>();
			_mockCourseRepo = new Mock<ICourseRepository>();
			_mockCurrentUserService = new Mock<ICurrentUserService>();
			_mockCloudinaryService = new Mock<ICloudinaryService>();
			_mockSectionRepo = new Mock<ISectionRepository>();
			_mockQuestionQuizRepo = new Mock<IQuestionQuizRepository>();
			_mockQuizSubmissionRepo = new Mock<IQuizSubmissionRepository>();

			_service = new QuestionBankService(
				_mockQuestionBankRepo.Object,
				_mockCurrentUserService.Object,
				_mockLecturerRepo.Object,
				_mockCourseRepo.Object,
				_mockCloudinaryService.Object,
				_mockSectionRepo.Object,
				_mockQuestionQuizRepo.Object,
				_mockQuizSubmissionRepo.Object
			);

			// License context for Import tests (EPPlus)
			ExcelPackage.License.SetNonCommercialPersonal("TestUser");
		}

		#region Create Tests

		[Test]
		public void Create_ShouldThrowUnauthorized_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId))
				.ReturnsAsync((Lecturer)null);

			var dto = new CreateQuestionBankDTO();

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.CreateQuestionBankAsync(dto, accountId, Guid.NewGuid(), null));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void Create_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var otherLecturerId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId };
			var course = new Course { Id = courseId, LecturerId = otherLecturerId };

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

			var dto = new CreateQuestionBankDTO();

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.CreateQuestionBankAsync(dto, accountId, courseId, null));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[TestCase(null)]
		[TestCase("")]
		[TestCase("   ")]
		public async Task Create_ShouldThrowException_WhenTypeIsNullOrWhiteSpace(string? invalidType)
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = invalidType,
				Title = "Valid Title",
				Answers = new List<CreateAnswerDTO>()
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));

			Assert.That(ex.Message, Is.EqualTo("Loại câu hỏi (Type) không được để trống."));
		}

		[Test]
		public void Create_ShouldThrowArgumentNullException_WhenAnswersListIsNull()
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = "SingleChoice",
				Answers = null
			};

			var ex = Assert.ThrowsAsync<ArgumentNullException>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));

			Assert.That(ex.ParamName, Is.EqualTo("source"));
		}

		[Test]
		public void Create_ShouldThrowException_WhenSingleChoiceHasZeroCorrectAnswers()
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = "SingleChoice",
				Answers = new List<CreateAnswerDTO>
				{
					new CreateAnswerDTO { IsCorrect = false },
					new CreateAnswerDTO { IsCorrect = false }
				}
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));
			Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn 1 (SingleChoice) phải có 1 đáp án đúng."));
		}

		[Test]
		public void Create_ShouldThrowException_WhenSingleChoiceHasMultipleCorrectAnswers()
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = "SingleChoice",
				Answers = new List<CreateAnswerDTO>
				{
					new CreateAnswerDTO { IsCorrect = true },
					new CreateAnswerDTO { IsCorrect = true }
				}
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));
			Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn 1 (SingleChoice) chỉ được có 1 đáp án đúng."));
		}

		[Test]
		public void Create_ShouldThrowException_WhenMultiChoiceHasZeroCorrectAnswers()
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = "MultiChoice",
				Answers = new List<CreateAnswerDTO>
				{
					new CreateAnswerDTO { IsCorrect = false },
					new CreateAnswerDTO { IsCorrect = false }
				}
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));
			Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng."));
		}

		[Test]
		public void Create_ShouldThrowException_WhenTypeIsInvalid()
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = "InvalidTypeString",
				Answers = new List<CreateAnswerDTO> { new CreateAnswerDTO { IsCorrect = true } }
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));
			Assert.That(ex.Message, Is.EqualTo("Loại câu hỏi 'InvalidTypeString' không hợp lệ."));
		}

		[Test]
		public void Create_ShouldThrowException_WhenSectionDoesNotExist()
		{
			var ctx = SetupValidContext();
			var nonExistentSectionId = Guid.NewGuid();

			_mockSectionRepo.Setup(x => x.GetByIdAsync(nonExistentSectionId))
				.ReturnsAsync((Section)null);

			var dto = new CreateQuestionBankDTO
			{
				Type = "SingleChoice",
				SectionId = nonExistentSectionId,
				Title = "Valid Title",
				Answers = new List<CreateAnswerDTO> { new CreateAnswerDTO { IsCorrect = true } }
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null));

			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy học phần!"));
		}

		[Test]
		public async Task Create_ShouldSucceed_WhenSingleChoiceIsValid_AndOptionalFieldsAreNull()
		{
			var ctx = SetupValidContext();
			var dto = new CreateQuestionBankDTO
			{
				Type = "SingleChoice",
				Title = null,
				Description = null,
				SectionId = Guid.NewGuid(),
				Answers = new List<CreateAnswerDTO>
				{
					new CreateAnswerDTO { AnswerName = "Correct", IsCorrect = true, ImageUrl = null },
					new CreateAnswerDTO { AnswerName = "Wrong", IsCorrect = false }
				}
			};

			var result = await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, null);

			Assert.IsNotNull(result);
			Assert.IsNull(result.Title);
			Assert.AreEqual("SingleChoice", result.Type);

			_mockQuestionBankRepo.Verify(x => x.CreateAsync(It.IsAny<QuestionBank>()), Times.Once);
			_mockQuestionBankRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
		}

		[Test]
		public async Task Create_ShouldSucceed_WhenMultiChoiceIsValid_AndAllFieldsFilled()
		{
			var ctx = SetupValidContext();
			string imageUrl = "http://cloudinary.com/img.png";
			var dto = new CreateQuestionBankDTO
			{
				Type = "MultiChoice",
				Title = "Math Question",
				Description = "Select primes",
				SectionId = Guid.NewGuid(),
				Answers = new List<CreateAnswerDTO>
				{
					new CreateAnswerDTO { AnswerName = "2", IsCorrect = true },
					new CreateAnswerDTO { AnswerName = "3", IsCorrect = true },
					new CreateAnswerDTO { AnswerName = "4", IsCorrect = false }
				}
			};

			var result = await _service.CreateQuestionBankAsync(dto, ctx.accountId, ctx.courseId, imageUrl);

			Assert.IsNotNull(result);
			Assert.AreEqual(imageUrl, result.Image);
			Assert.AreEqual(3, result.Answers.Count);

			_mockQuestionBankRepo.Verify(x => x.CreateAsync(It.Is<QuestionBank>(q =>
				q.Type == "MultiChoice" &&
				q.Title == "Math Question" &&
				q.Image == imageUrl
			)), Times.Once);
		}

		#endregion

		#region Update Tests

		[Test]
		public void Update_ShouldThrowUnauthorized_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var questionId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync((Lecturer)null);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(new Course { Id = courseId });

			var dto = new UpdateQuestionBankDTO();

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.UpdateQuestionBank(dto, questionId, accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void Update_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var otherLecturerId = Guid.NewGuid();
			var questionId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
			var course = new Course { Id = courseId, LecturerId = otherLecturerId };

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

			var dto = new UpdateQuestionBankDTO();

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.UpdateQuestionBank(dto, questionId, accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void Update_ShouldThrowException_WhenQuestionNotFound()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();

			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync((QuestionBank)null);

			var dto = new UpdateQuestionBankDTO
			{
				Type = "SingleChoice",
				Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { IsCorrect = true } }
			};

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateQuestionBank(dto, questionId, ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy câu hỏi!"));
		}

		[TestCase(null)]
		[TestCase("")]
		[TestCase("   ")]
		public async Task Update_ShouldThrowException_WhenTypeIsNullOrWhiteSpace(string? invalidType)
		{
			var ctx = SetupValidContext();
			var dto = new UpdateQuestionBankDTO { Type = invalidType, Answers = new List<UpdateAnswerBankDTO>() };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateQuestionBank(dto, Guid.NewGuid(), ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Loại câu hỏi (Type) không được để trống."));
		}

		[Test]
		public void Update_ShouldThrowException_WhenTypeIsInvalid()
		{
			var ctx = SetupValidContext();
			var dto = new UpdateQuestionBankDTO { Type = "InvalidType", Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { IsCorrect = true } } };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateQuestionBank(dto, Guid.NewGuid(), ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Loại câu hỏi 'InvalidType' không hợp lệ."));
		}

		[Test]
		public void Update_ShouldThrowException_WhenSingleChoiceHasZeroCorrectAnswers()
		{
			var ctx = SetupValidContext();
			var dto = new UpdateQuestionBankDTO { Type = "SingleChoice", Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { IsCorrect = false } } };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateQuestionBank(dto, Guid.NewGuid(), ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn 1 (SingleChoice) phải có 1 đáp án đúng."));
		}

		[Test]
		public void Update_ShouldThrowException_WhenSingleChoiceHasMultipleCorrectAnswers()
		{
			var ctx = SetupValidContext();
			var dto = new UpdateQuestionBankDTO { Type = "SingleChoice", Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { IsCorrect = true }, new UpdateAnswerBankDTO { IsCorrect = true } } };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateQuestionBank(dto, Guid.NewGuid(), ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn 1 (SingleChoice) chỉ được có 1 đáp án đúng."));
		}

		[Test]
		public void Update_ShouldThrowException_WhenMultiChoiceHasZeroCorrectAnswers()
		{
			var ctx = SetupValidContext();
			var dto = new UpdateQuestionBankDTO { Type = "MultiChoice", Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { IsCorrect = false }, new UpdateAnswerBankDTO { IsCorrect = false } } };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateQuestionBank(dto, Guid.NewGuid(), ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng."));
		}

		[Test]
		public async Task Update_ShouldUpdateExisting_WhenQuestionNotUsedInSubmission()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();
			var answerId = Guid.NewGuid();

			var existingQuestion = new QuestionBank
			{
				Id = questionId,
				IsHidden = false,
				Title = "Old Title",
				AnswerBanks = new List<AnswerBank> { new AnswerBank { Id = answerId, AnswerName = "Old Answer", IsCorrect = false } }
			};
			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync(existingQuestion);
			_mockQuizSubmissionRepo.Setup(x => x.GetQuestionBanksInSubmission(questionId)).ReturnsAsync(new List<QuizSubmission>());

			var dto = new UpdateQuestionBankDTO
			{
				Title = "Updated Title",
				Type = "SingleChoice",
				SectionId = Guid.NewGuid(),
				Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { AnswerId = answerId, AnswerName = "Updated Answer", IsCorrect = true } }
			};

			var result = await _service.UpdateQuestionBank(dto, questionId, ctx.accountId, ctx.courseId);

			Assert.IsNotNull(result);
			Assert.That(existingQuestion.Title, Is.EqualTo("Updated Title"));
			Assert.That(existingQuestion.AnswerBanks.First().AnswerName, Is.EqualTo("Updated Answer"));

			_mockQuestionBankRepo.Verify(x => x.Update(existingQuestion), Times.Once);
			_mockQuestionBankRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
			_mockQuestionBankRepo.Verify(x => x.CreateAsync(It.IsAny<QuestionBank>()), Times.Never);
		}

		[Test]
		public async Task Update_ShouldCreateNewAndHideOld_WhenQuestionIsUsed()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();

			var existingQuestion = new QuestionBank { Id = questionId, IsHidden = false, Title = "Old Title", AnswerBanks = new List<AnswerBank>() };
			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync(existingQuestion);
			_mockQuizSubmissionRepo.Setup(x => x.GetQuestionBanksInSubmission(questionId)).ReturnsAsync(new List<QuizSubmission> { new QuizSubmission() });

			var linkedQuizItems = new List<QuestionQuiz> { new QuestionQuiz { QuestionBankId = questionId } };
			_mockQuestionQuizRepo.Setup(x => x.CheckQuestionUsed(questionId)).ReturnsAsync(linkedQuizItems);

			var dto = new UpdateQuestionBankDTO { Title = "New Version Title", Type = "SingleChoice", SectionId = Guid.NewGuid(), Answers = new List<UpdateAnswerBankDTO> { new UpdateAnswerBankDTO { AnswerName = "Correct Answer", IsCorrect = true } } };

			QuestionBank capturedNewQuestion = null;
			_mockQuestionBankRepo.Setup(x => x.CreateAsync(It.IsAny<QuestionBank>())).Callback<QuestionBank>(q => capturedNewQuestion = q);

			var result = await _service.UpdateQuestionBank(dto, questionId, ctx.accountId, ctx.courseId);

			Assert.IsTrue(existingQuestion.IsHidden, "Old question should be set to Hidden");
			_mockQuestionBankRepo.Verify(x => x.Update(existingQuestion), Times.Once);
			_mockQuestionBankRepo.Verify(x => x.CreateAsync(It.IsAny<QuestionBank>()), Times.Once);
			Assert.IsNotNull(capturedNewQuestion);
			Assert.That(capturedNewQuestion.Title, Is.EqualTo("New Version Title"));
			Assert.That(capturedNewQuestion.Id, Is.Not.EqualTo(questionId));
			Assert.That(linkedQuizItems.First().QuestionBankId, Is.EqualTo(capturedNewQuestion.Id), "Existing quiz links should point to the new question ID");
			Assert.That(result.Title, Is.EqualTo("New Version Title"));
		}

		#endregion

		#region Delete Tests

		[Test]
		public void Delete_ShouldThrowUnauthorized_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync((Lecturer)null);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(new Course { Id = courseId });

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.DeleteQuestionBank(Guid.NewGuid(), accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void Delete_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var otherLecturerId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
			var course = new Course { Id = courseId, LecturerId = otherLecturerId };

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.DeleteQuestionBank(Guid.NewGuid(), accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void Delete_ShouldThrowException_WhenQuestionNotFound()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();

			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync((QuestionBank)null);

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.DeleteQuestionBank(questionId, ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy câu hỏi!"));
		}

		[Test]
		public async Task Delete_ShouldSoftDelete_WhenAuthorizedAndQuestionExists()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();

			var existingQuestion = new QuestionBank { Id = questionId, IsActive = true };
			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync(existingQuestion);

			await _service.DeleteQuestionBank(questionId, ctx.accountId, ctx.courseId);

			Assert.IsFalse(existingQuestion.IsActive, "QuestionBank.IsActive should be set to false");
			_mockQuestionBankRepo.Verify(x => x.Update(existingQuestion), Times.Once);
			_mockQuestionBankRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
		}

		#endregion

		#region Get By Section Tests

		[Test]
		public void GetBySection_ShouldThrowUnauthorized_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var sectionId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync((Lecturer)null);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(new Course { Id = courseId });

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.GetQuestionBanksBySectionIdAsync(sectionId, accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void GetBySection_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var otherLecturerId = Guid.NewGuid();
			var sectionId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
			var course = new Course { Id = courseId, LecturerId = otherLecturerId };

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.GetQuestionBanksBySectionIdAsync(sectionId, accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public async Task GetBySection_ShouldReturnMappedDTOs_WhenQuestionsExist()
		{
			var ctx = SetupValidContext();
			var sectionId = Guid.NewGuid();
			var questionId = Guid.NewGuid();
			var answerId = Guid.NewGuid();

			var questions = new List<QuestionBank>
			{
				new QuestionBank
				{
					Id = questionId, SectionId = sectionId, LecturerId = ctx.lecturerId, Title = "Question 1", Description = "Desc 1", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, IsActive = true, Image = "img.png", Type = "SingleChoice",
					AnswerBanks = new List<AnswerBank> { new AnswerBank { Id = answerId, AnswerName = "Answer A", IsCorrect = true, IsActive = true, Image = "ans_img.png" } }
				}
			};
			_mockQuestionBankRepo.Setup(x => x.GetBySectionId(sectionId)).ReturnsAsync(questions);

			var result = await _service.GetQuestionBanksBySectionIdAsync(sectionId, ctx.accountId, ctx.courseId);

			Assert.IsNotNull(result);
			Assert.That(result.Count, Is.EqualTo(1));
			var dto = result.First();
			Assert.That(dto.Id, Is.EqualTo(questionId));
			Assert.That(dto.Answers.Count, Is.EqualTo(1));
			Assert.That(dto.Answers.First().AnswerId, Is.EqualTo(answerId));
		}

		[Test]
		public async Task GetBySection_ShouldReturnEmptyList_WhenNoQuestionsExist()
		{
			var ctx = SetupValidContext();
			var sectionId = Guid.NewGuid();

			_mockQuestionBankRepo.Setup(x => x.GetBySectionId(sectionId)).ReturnsAsync(new List<QuestionBank>());

			var result = await _service.GetQuestionBanksBySectionIdAsync(sectionId, ctx.accountId, ctx.courseId);

			Assert.IsNotNull(result);
			Assert.That(result, Is.Empty);
		}

		#endregion

		#region Get By Course Tests

		[Test]
		public void GetByCourse_ShouldThrowUnauthorized_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync((Lecturer)null);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(new Course { Id = courseId });

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.GetQuestionBanksByCourseIdAsync(accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void GetByCourse_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var otherLecturerId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
			var course = new Course { Id = courseId, LecturerId = otherLecturerId };

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.GetQuestionBanksByCourseIdAsync(accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public async Task GetByCourse_ShouldReturnSectionsWithMappedQuestions_WhenDataExists()
		{
			var ctx = SetupValidContext();
			var sectionId1 = Guid.NewGuid();
			var sectionId2 = Guid.NewGuid();
			var questionId = Guid.NewGuid();

			var sections = new List<Section>
			{
				new Section { Id = sectionId1, CourseId = ctx.courseId, Title = "Section 1", Orders = 1 },
				new Section { Id = sectionId2, CourseId = ctx.courseId, Title = "Section 2", Orders = 2 }
			};
			_mockSectionRepo.Setup(x => x.GetByCourseIdAsync(ctx.courseId)).ReturnsAsync(sections);

			var questions = new List<QuestionBank>
			{
				new QuestionBank { Id = questionId, SectionId = sectionId1, Title = "Question in Section 1", Type = "SingleChoice", AnswerBanks = new List<AnswerBank> { new AnswerBank { Id = Guid.NewGuid(), AnswerName = "A", IsCorrect = true } } }
			};
			_mockQuestionBankRepo.Setup(x => x.GetByCourseId(ctx.courseId)).ReturnsAsync(questions);

			var result = await _service.GetQuestionBanksByCourseIdAsync(ctx.accountId, ctx.courseId);

			Assert.IsNotNull(result);
			Assert.That(result.Count, Is.EqualTo(2));
			var dto1 = result.First(s => s.Id == sectionId1);
			Assert.That(dto1.QuestionBanks.Count, Is.EqualTo(1));
			var dto2 = result.First(s => s.Id == sectionId2);
			Assert.That(dto2.QuestionBanks, Is.Empty);
		}

		[Test]
		public async Task GetByCourse_ShouldReturnEmptyList_WhenCourseHasNoSections()
		{
			var ctx = SetupValidContext();
			_mockSectionRepo.Setup(x => x.GetByCourseIdAsync(ctx.courseId)).ReturnsAsync(new List<Section>());
			_mockQuestionBankRepo.Setup(x => x.GetByCourseId(ctx.courseId)).ReturnsAsync(new List<QuestionBank>());

			var result = await _service.GetQuestionBanksByCourseIdAsync(ctx.accountId, ctx.courseId);

			Assert.IsNotNull(result);
			Assert.That(result, Is.Empty);
		}

		#endregion

		#region Get By Id Tests

		[Test]
		public void GetById_ShouldThrowUnauthorized_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var questionId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync((Lecturer)null);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(new Course { Id = courseId });

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.GetQuestionBankByIdAsync(questionId, accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void GetById_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var otherLecturerId = Guid.NewGuid();
			var questionId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
			var course = new Course { Id = courseId, LecturerId = otherLecturerId };

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.GetQuestionBankByIdAsync(questionId, accountId, courseId));

			Assert.That(ex.Message, Is.EqualTo("Bạn không phải là giảng viên của khoá học này"));
		}

		[Test]
		public void GetById_ShouldThrowNullReference_WhenCourseIdNotFound()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();

			var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(lecturer);
			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId)).ReturnsAsync((Course)null);

			Assert.ThrowsAsync<NullReferenceException>(async () =>
				await _service.GetQuestionBankByIdAsync(Guid.NewGuid(), accountId, courseId));
		}

		[Test]
		public void GetById_ShouldThrowException_WhenQuestionNotFound()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();

			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync((QuestionBank)null);

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.GetQuestionBankByIdAsync(questionId, ctx.accountId, ctx.courseId));

			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy câu hỏi!"));
		}

		[Test]
		public async Task GetById_ShouldReturnMappedDTO_WhenQuestionExists()
		{
			var ctx = SetupValidContext();
			var questionId = Guid.NewGuid();
			var answerId = Guid.NewGuid();

			var question = new QuestionBank
			{
				Id = questionId,
				SectionId = Guid.NewGuid(),
				LecturerId = ctx.lecturerId,
				Title = "Test Question Title",
				Description = "Description text",
				Type = "SingleChoice",
				Image = "question_image.png",
				CreatedAt = DateTime.Now,
				UpdatedAt = DateTime.Now,
				IsActive = true,
				AnswerBanks = new List<AnswerBank> { new AnswerBank { Id = answerId, AnswerName = "Answer 1", IsCorrect = true, IsActive = true, Image = "answer_image.png" } }
			};

			_mockQuestionBankRepo.Setup(x => x.GetByIdAsync(questionId)).ReturnsAsync(question);

			var result = await _service.GetQuestionBankByIdAsync(questionId, ctx.accountId, ctx.courseId);

			Assert.IsNotNull(result);
			Assert.That(result.Id, Is.EqualTo(questionId));
			Assert.That(result.Answers.Count, Is.EqualTo(1));
		}

		#endregion

		#region Import Tests

		[Test]
		public void Import_ShouldThrowException_WhenLecturerNotFound()
		{
			var accountId = Guid.NewGuid();
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync((Lecturer)null);

			using var stream = new MemoryStream();

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.ReadQuestionsWithMultipleAnswersAsync(stream, Guid.NewGuid(), accountId));

			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy giảng viên."));
		}

		[Test]
		public async Task Import_ShouldSaveValidQuestions_SingleAndMultiChoice()
		{
			var accountId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var sectionId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(new Lecturer { Id = lecturerId });

			using var stream = CreateExcelStream(worksheet =>
			{
				worksheet.Cells[3, 1].Value = "What is 2+2?";
				worksheet.Cells[3, 2].Value = "3"; worksheet.Cells[3, 3].Value = "4"; worksheet.Cells[3, 4].Value = "5"; worksheet.Cells[3, 9].Value = "B";
				worksheet.Cells[4, 1].Value = "Select primes";
				worksheet.Cells[4, 2].Value = "2"; worksheet.Cells[4, 3].Value = "3"; worksheet.Cells[4, 4].Value = "4"; worksheet.Cells[4, 9].Value = "A,B";
			});

			var result = await _service.ReadQuestionsWithMultipleAnswersAsync(stream, sectionId, accountId);

			Assert.IsNotNull(result);
			Assert.That(result.Count, Is.EqualTo(2));

			_mockQuestionBankRepo.Verify(x => x.AddRangeAsync(It.Is<List<QuestionBank>>(list =>
				list.Count == 2 &&
				list.Any(q => q.Title == "What is 2+2?" && q.Type == "SingleChoice") &&
				list.Any(q => q.Title == "Select primes" && q.Type == "MultiChoice")
			)), Times.Once);

			_mockQuestionBankRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
		}

		[Test]
		public void Import_ShouldThrowException_WhenCorrectOptionIsInvalid()
		{
			var accountId = Guid.NewGuid();
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(new Lecturer { Id = Guid.NewGuid() });

			using var stream = CreateExcelStream(worksheet =>
			{
				worksheet.Cells[3, 1].Value = "Question 1"; worksheet.Cells[3, 2].Value = "Ans A"; worksheet.Cells[3, 9].Value = "Z";
			});

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.ReadQuestionsWithMultipleAnswersAsync(stream, Guid.NewGuid(), accountId));

			Assert.That(ex.Message, Does.Contain("Đáp án đúng 'Z' không hợp lệ"));
		}

		[Test]
		public async Task Import_ShouldSkipEmptyRows()
		{
			var accountId = Guid.NewGuid();
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(new Lecturer { Id = Guid.NewGuid() });

			using var stream = CreateExcelStream(worksheet =>
			{
				worksheet.Cells[3, 1].Value = "Valid Q"; worksheet.Cells[3, 2].Value = "A"; worksheet.Cells[3, 9].Value = "A";
				worksheet.Cells[4, 2].Value = "A"; worksheet.Cells[4, 9].Value = "A"; // Empty Q text
				worksheet.Cells[5, 1].Value = "No Correct Ans"; worksheet.Cells[5, 2].Value = "A"; // Empty Correct
			});

			var result = await _service.ReadQuestionsWithMultipleAnswersAsync(stream, Guid.NewGuid(), accountId);

			Assert.That(result.Count, Is.EqualTo(1));
			Assert.That(result[0].Title, Is.EqualTo("Valid Q"));
		}

		[Test]
		public async Task Import_ShouldCorrectlyMapAnswersToKeys()
		{
			var accountId = Guid.NewGuid();
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId)).ReturnsAsync(new Lecturer { Id = Guid.NewGuid() });

			using var stream = CreateExcelStream(worksheet =>
			{
				worksheet.Cells[3, 1].Value = "Q1"; worksheet.Cells[3, 3].Value = "Answer B Content"; worksheet.Cells[3, 9].Value = "B";
			});

			IEnumerable<QuestionBank> savedQuestions = null;
			_mockQuestionBankRepo.Setup(x => x.AddRangeAsync(It.IsAny<List<QuestionBank>>()))
				.Callback<List<QuestionBank>>(list => savedQuestions = list);

			await _service.ReadQuestionsWithMultipleAnswersAsync(stream, Guid.NewGuid(), accountId);

			Assert.IsNotNull(savedQuestions);
			var q = savedQuestions.First();
			Assert.That(q.AnswerBanks.Count, Is.EqualTo(1));
			Assert.That(q.AnswerBanks.First().AnswerName, Is.EqualTo("Answer B Content"));
		}

		#endregion

		// --- Helpers ---

		private (Guid accountId, Guid courseId, Guid lecturerId) SetupValidContext()
		{
			var accountId = Guid.NewGuid();
			var courseId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(accountId))
				.ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = accountId });

			_mockCourseRepo.Setup(x => x.GetCourseByIdAsync(courseId))
				.ReturnsAsync(new Course { Id = courseId, LecturerId = lecturerId });

			return (accountId, courseId, lecturerId);
		}

		private MemoryStream CreateExcelStream(Action<ExcelWorksheet> setupAction)
		{
			var stream = new MemoryStream();
			using (var package = new ExcelPackage())
			{
				var worksheet = package.Workbook.Worksheets.Add("Sheet1");
				worksheet.Cells[1, 1].Value = "Header Row 1";
				worksheet.Cells[2, 1].Value = "Header Row 2";
				setupAction(worksheet);
				package.SaveAs(stream);
			}
			stream.Position = 0;
			return stream;
		}
	}
}