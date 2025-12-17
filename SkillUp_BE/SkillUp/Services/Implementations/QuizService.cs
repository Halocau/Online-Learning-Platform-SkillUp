using Microsoft.Identity.Client;
using SkillUp.BussinessObjects.DTOs.DoQuiz;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.Text;

namespace SkillUp.Services.Implementations
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository _quizRepository;
        private readonly ILecturerRepository _lecturerRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly IQuizSubmissionRepository _quizSubmissionRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IAnswerBankRepository _answerBankRepository;
        private readonly IQuizAnswerSubmissionRepository _quizAnswerSubmissionRepository;
        private readonly IStudentSelectedAnswersRepository _studentSelectedAnswersRepository;
        private readonly IQuestionBankRepository _questionBankRepository;
        private readonly IStudentProgressRepository _studentProgressRepository;
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly INotifyService _notifierService;
        public QuizService(IQuizRepository quizRepository, ILecturerRepository lecturerRepository, ISectionRepository sectionRepository, IQuizSubmissionRepository quizSubmissionRepository, IStudentRepository studentRepository, IAnswerBankRepository answerBankRepository, IQuizAnswerSubmissionRepository quizAnswerSubmissionRepository, IStudentSelectedAnswersRepository studentSelectedAnswersRepository, IQuestionBankRepository questionBankRepository, IStudentProgressRepository studentProgressRepository, IEnrollmentRepository enrollmentRepository , INotifyService notifyService)
        {
            _quizRepository = quizRepository;
            _lecturerRepository = lecturerRepository;
            _sectionRepository = sectionRepository;
            _quizSubmissionRepository = quizSubmissionRepository;
            _studentRepository = studentRepository;
            _answerBankRepository = answerBankRepository;
            _quizAnswerSubmissionRepository = quizAnswerSubmissionRepository;
            _studentSelectedAnswersRepository = studentSelectedAnswersRepository;
            _questionBankRepository = questionBankRepository;
            _studentProgressRepository = studentProgressRepository;
            _enrollmentRepository = enrollmentRepository;
            _notifierService = notifyService;
        }

        public async Task<Guid> CreateQuizAsync(CreateQuizDTO dto, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
            {
 
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            }

            var section = await _sectionRepository.GetSectionByIdAsync(dto.SectionId);
            if (section == null)
            {
                throw new Exception("Không tìm thấy section.");
            }

            if (section.Course == null)
            {
                throw new Exception("Lỗi hệ thống: Không thể tải thông tin Khóa học của Section này.");
            }

            if (section.Course.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền thêm quiz vào section này.");
            }

            var quiz = new Quiz
            {
                Id = Guid.NewGuid(),
                SectionId = dto.SectionId,
                Title = dto.Title,
                Description = dto.Description,
                PassPercent = dto.PassPercent,
                Timer = dto.Timer,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true,
                Orders = dto.Orders
            };

            await _quizRepository.CreateQuizAsync(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            if (!success)
            {
                throw new Exception("Lỗi: Không thể lưu bài quiz vào cơ sở dữ liệu.");
            }
            try
            {
                var courseId = section.Course.Id;
                string notiTitle = "Bài tập mới";
                string notiMessage = $"Khóa học '{section.Course.Title}' vừa có thêm bài tập mới: {quiz.Title}";
              
                await _notifierService.SendCourseUpdateNotificationAsync(courseId, notiTitle, notiMessage);
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Error sending notification: {ex.Message}");
            }
            return quiz.Id;
        }

        public async Task<bool> DeleteQuizAsync(Guid quizId, Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");

            var quiz = await _quizRepository.GetQuizWithSectionAndCourseAsync(quizId);
            if (quiz == null)
                throw new Exception("Không tìm thấy quiz.");

            if (quiz.Section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa quiz này.");
            if (!quiz.IsActive)
                throw new Exception("Quiz này đã bị xóa trước đó.");

            quiz.IsActive = false;
            quiz.UpdatedAt = DateTime.Now;

            _quizRepository.UpdateQuiz(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            return success;
        }

        public async Task<QuizDetailDTO?> GetQuizDetailAsync(Guid quizId, Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);
            if (lecturer == null)
            {
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            }

            var quiz = await _quizRepository.GetQuizWithQuestionsAsync(quizId);
            if (quiz == null)
            {
                throw new Exception("Không tìm thấy quiz.");
            }

            if (!quiz.IsActive)
            {
                throw new Exception("Bài quiz này đang bị ẩn (inactive).");
            }

            if (quiz.Section.Course.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem quiz này.");
            }

            return new QuizDetailDTO
            {
                QuizId = quiz.Id,
                Title = quiz.Title ?? string.Empty,
                Description = quiz.Description,       
                Orders = quiz.Orders,

                Questions = quiz.QuestionQuizzes
                    .Where(qq => qq.IsActive == true)
                    .Where(qq => qq.QuestionBank != null && qq.QuestionBank.IsActive)
                    .OrderBy(qq => qq.Orders)
                    .Select(qq => new QuestionDetailDTO
                    {
                        QuestionId = qq.QuestionBank.Id,
                        Title = qq.QuestionBank.Title,
                        Description = qq.QuestionBank.Description,
                        Image = qq.QuestionBank.Image,
                        Type = qq.QuestionBank.Type,
                        Orders = qq.Orders,

                        Answers = qq.QuestionBank.AnswerBanks
                            .Where(a => a.IsActive)
                            .Select(a => new AnswerDetailDTO
                            {
                                AnswerId = a.Id,
                                AnswerName = a.AnswerName,
                                IsCorrect = a.IsCorrect,
                                Image = a.Image
                            }).ToList()
                    }).ToList()
            };
        }

        public async Task<bool> UpdateQuizAsync(Guid quizId, UpdateQuizDTO dto, Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            var quiz = await _quizRepository.GetQuizWithSectionAndCourseAsync(quizId);
            if (quiz == null)
                throw new Exception("Không tìm thấy quiz.");
            if (quiz.Section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa quiz này.");
            quiz.Title = dto.Title ?? quiz.Title;
            quiz.Description = dto.Description ?? quiz.Description;
            quiz.PassPercent = dto.PassPercent != default ? dto.PassPercent : quiz.PassPercent;
            quiz.Timer = dto.Timer != default ? dto.Timer : quiz.Timer;
            quiz.UpdatedAt = DateTime.Now;

            _quizRepository.UpdateQuiz(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            return success;
        }

        public async Task<QuizStartDto> StartQuizAsync(Guid quizId, Guid accountId)
        {
            var quiz = await _quizRepository.GetQuizWithQuestionsAsync(quizId);
            if (quiz == null || !quiz.IsActive)
            {
                throw new Exception("Bài quiz không tồn tại hoặc không hoạt động.");
            }

            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new Exception("Không tìm thấy hồ sơ sinh viên cho tài khoản này.");
            }

            if (quiz.Section == null) throw new Exception("Lỗi dữ liệu: Quiz không thuộc chương nào.");

            var isEnrolled = await _enrollmentRepository.IsStudentEnrolledInCourseAsync(student.Id, quiz.Section.CourseId);
            if (!isEnrolled)
            {
                throw new UnauthorizedAccessException("Bạn chưa đăng ký khóa học này, vui lòng mua khóa học để làm bài.");
            }

            var newSubmission = new QuizSubmission
            {
                Id = Guid.NewGuid(),
                QuizId = quizId,
                StudentId = student.Id,
                StartedAt = DateTime.Now,
                Score = null,
                EndedAt = null
            };
            await _quizSubmissionRepository.AddAsync(newSubmission);

            var progress = await _studentProgressRepository.GetByStudentAndQuizAsync(student.Id, quizId);
            if (progress == null)
            {
                var newProgress = new StudentProgress
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    QuizId = quizId,
                    CourseId = quiz.Section.CourseId,
                    LessonId = null,
                    IsCompleted = false,
                    LastViewedAt = DateTime.Now
                };
                await _studentProgressRepository.AddAsync(newProgress);
            }
            else
            {
                progress.LastViewedAt = DateTime.Now;
            }

            var questionDtos = quiz.QuestionQuizzes
                .Where(qq => qq.IsActive == true)
                .Where(qq => qq.QuestionBank.IsActive == true)
                .OrderBy(qq => qq.Orders)
                .Select(qq => new QuestionStudentDto
                {
                    QuestionId = qq.QuestionBank.Id,
                    Title = qq.QuestionBank.Title,
                    Description = qq.QuestionBank.Description,
                    Image = qq.QuestionBank.Image,
                    Type = qq.QuestionBank.Type,
                    Answers = qq.QuestionBank.AnswerBanks
                        .Where(a => a.IsActive)
                        .Select(a => new AnswerStudentDto
                        {
                            AnswerId = a.Id,
                            AnswerName = a.AnswerName,
                            Image = a.Image
                        }).ToList()
                }).ToList();

            await _quizSubmissionRepository.SaveChangesAsync();

            return new QuizStartDto
            {
                SubmissionId = newSubmission.Id,
                QuizId = quiz.Id,
                Title = quiz.Title,
                Timer = quiz.Timer,
                Questions = questionDtos
            };
        }
        public async Task<QuizResultSummaryDto> SubmitQuizAsync(Guid submissionId, QuizSubmitDto submitDto, Guid accountId)
        {
            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new Exception("Không tìm thấy hồ sơ sinh viên cho tài khoản này.");
            }
            Guid studentId = student.Id;

            var submission = await _quizSubmissionRepository.GetByIdAsync(submissionId);
            if (submission == null || submission.StudentId != studentId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền nộp bài quiz này.");
            }
            if (submission.EndedAt != null)
            {
                throw new Exception("Bài quiz này đã được nộp trước đó.");
            }

            var quiz = await _quizRepository.GetQuizByIdAsync(submission.QuizId);
            if (quiz == null)
            {
                throw new Exception("Không tìm thấy bài quiz.");
            }

            decimal totalRawScore = 0;
            int totalQuestions = submitDto.Answers.Count;

            var answerSubmissionsToSave = new List<QuizAnswerSubmission>();
            var selectedAnswersToSave = new List<StudentSelectedAnswer>();

            foreach (var studentAnswer in submitDto.Answers)
            {
                var allAnswersForQuestion = await _answerBankRepository.GetActiveAnswersForQuestionAsync(studentAnswer.QuestionId);

                var correctDbIds = allAnswersForQuestion
                    .Where(a => a.IsCorrect)
                    .Select(a => a.Id)
                    .ToHashSet();

                var studentSelectedIds = new HashSet<Guid>(studentAnswer.SelectedAnswerIds);

                decimal questionScore = 0;
                int totalCorrectOptions = correctDbIds.Count;

                if (totalCorrectOptions > 0)
                {
                    decimal pointsPerCorrectOption = 1.0m / totalCorrectOptions;
                    int correctlyChosenCount = studentSelectedIds.Count(id => correctDbIds.Contains(id));
                    int incorrectlyChosenCount = studentSelectedIds.Count(id => !correctDbIds.Contains(id));

                    decimal scoreForThisQuestion = (correctlyChosenCount * pointsPerCorrectOption) - (incorrectlyChosenCount * pointsPerCorrectOption);

                    questionScore = Math.Max(0, scoreForThisQuestion);
                }

                totalRawScore += questionScore;

                bool isQuestionFullyCorrect = correctDbIds.SetEquals(studentSelectedIds);

                var newAnswerSubmission = new QuizAnswerSubmission
                {
                    Id = Guid.NewGuid(),
                    SubmissionId = submissionId,
                    QuestionBankId = studentAnswer.QuestionId,
                    IsCorrect = isQuestionFullyCorrect
                };
                answerSubmissionsToSave.Add(newAnswerSubmission);

                foreach (var selectedId in studentAnswer.SelectedAnswerIds)
                {
                    selectedAnswersToSave.Add(new StudentSelectedAnswer
                    {
                        Id = Guid.NewGuid(),
                        QuizAnswerSubmissionId = newAnswerSubmission.Id,
                        AnswerBankId = selectedId
                    });
                }
            }

            decimal finalPercentage = (totalQuestions > 0) ? ((totalRawScore / totalQuestions) * 100) : 0;

            submission.EndedAt = DateTime.Now;
            submission.Score = finalPercentage;

            _quizSubmissionRepository.Update(submission);

            await _quizAnswerSubmissionRepository.AddRangeAsync(answerSubmissionsToSave);
            await _studentSelectedAnswersRepository.AddRangeAsync(selectedAnswersToSave);

            //cập nhật progress khi pass quiz
            bool isPassed = (submission.Score >= quiz.PassPercent);

            if (isPassed)
            {
                var quizFull = await _quizRepository.GetQuizWithSectionAndCourseAsync(quiz.Id);

                if (quizFull != null && quizFull.Section != null)
                {
                    var courseId = quizFull.Section.CourseId;
                    var existingProgress = await _studentProgressRepository.GetByStudentAndQuizAsync(studentId, quiz.Id);

                    if (existingProgress != null)
                    {
                        existingProgress.IsCompleted = true;
                        existingProgress.LastViewedAt = DateTime.Now;
                    }
                    else
                    {
                        var newProgress = new StudentProgress
                        {
                            Id = Guid.NewGuid(),
                            StudentId = studentId,
                            CourseId = courseId,
                            QuizId = quiz.Id,
                            LessonId = null,
                            IsCompleted = true, 
                            LastViewedAt = DateTime.Now
                        };
                        await _studentProgressRepository.AddAsync(newProgress);
                    }
                }
            }
            await _quizRepository.SaveChangesAsync();

            return new QuizResultSummaryDto
            {
                SubmissionId = submission.Id,
                Score = submission.Score,
                StartedAt = submission.StartedAt,
                EndedAt = submission.EndedAt,
                IsPassed = (submission.Score >= quiz.PassPercent)
            };
        }
        public async Task<QuizResultDetailDto> GetQuizResultDetailAsync(Guid submissionId, Guid accountId)
        {
            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new Exception("Không tìm thấy sinh viên.");
            }

            var submission = await _quizSubmissionRepository.GetSubmissionWithDetailsAsync(submissionId, student.Id);
            if (submission == null)
            {
                throw new Exception("Không tìm thấy lượt làm bài này hoặc bạn không có quyền xem.");
            }

            var answerSubmissions = await _quizAnswerSubmissionRepository.GetBySubmissionIdAsync(submissionId);
            var allSelectedAnswers = await _studentSelectedAnswersRepository.GetSelectedAnswersBySubmissionIdAsync(submissionId);

            var studentChoiceSet = allSelectedAnswers.Select(sa => sa.AnswerBankId).ToHashSet();

            var questionIds = answerSubmissions.Select(x => x.QuestionBankId).ToList();
            var questionsData = await _questionBankRepository.GetQuestionsWithAnswersAsync(questionIds);

            var detailedQuestions = new List<QuestionResultDetailDto>();

            foreach (var qSub in answerSubmissions)
            {
                var question = questionsData.FirstOrDefault(q => q.Id == qSub.QuestionBankId);
                if (question == null) continue;

                var answerDtos = question.AnswerBanks.Select(a =>
                {
                    bool isSelected = studentChoiceSet.Contains(a.Id);

                    return new AnswerResultDetailDto
                    {
                        AnswerId = a.Id,
                        AnswerName = a.AnswerName,
                        WasSelected = isSelected,
                        IsCorrect = a.IsCorrect,
                        Image = a.Image
                    };
                }).ToList();

                detailedQuestions.Add(new QuestionResultDetailDto
                {
                    QuestionId = question.Id,
                    Title = question.Title,
                    Image = question.Image,
                    Type = question.Type,
                    IsQuestionCorrect = qSub.IsCorrect ?? false,
                    AllAnswers = answerDtos
                });
            }

            return new QuizResultDetailDto
            {
                SubmissionId = submission.Id,
                QuizTitle = submission.Quiz.Title,
                QuizDescription = submission.Quiz.Description,
                Score = submission.Score,
                EndedAt = submission.EndedAt,
                IsPassed = (submission.Score >= submission.Quiz.PassPercent),
                Questions = detailedQuestions
            };
        }
    }
}
