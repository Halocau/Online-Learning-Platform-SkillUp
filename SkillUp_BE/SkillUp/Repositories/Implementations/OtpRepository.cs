//using Microsoft.EntityFrameworkCore;
//using SkillUp.BussinessObjects.Models;
//using SkillUp.Repositories.Interfaces;

//namespace SkillUp.Repositories.Implementations
//{
//    public class OtpRepository : IOtpRepository
//    {
//        private readonly SkillUpContext _context;

//        public OtpRepository(SkillUpContext context)
//        {
//            _context = context;
//        }

//        public async Task<Otp?> GetByAccountEmailAndTokenAsync(string email, string token)
//        {
//            return await _context.Otps
//                .Include(o => o.Account)
//                .FirstOrDefaultAsync(o =>
//                    o.Account.Email == email &&
//                    o.OtpLink == token &&
//                    o.OtpExpiry > DateTime.UtcNow);
//        }

//        public async Task<Otp?> GetByAccountIdAsync(Guid accountId)
//        {
//            return await _context.Otps
//                .FirstOrDefaultAsync(o => o.AccountId == accountId);
//        }

//        public async Task AddAsync(Otp otp)
//        {
//            await _context.Otps.AddAsync(otp);
//        }

//        public async Task UpdateAsync(Otp otp)
//        {
//            _context.Otps.Update(otp);
//            await Task.CompletedTask;
//        }

//        public async Task DeleteAsync(Otp otp)
//        {
//            _context.Otps.Remove(otp);
//            await Task.CompletedTask;
//        }

//        public async Task<bool> SaveChangesAsync()
//        {
//            return await _context.SaveChangesAsync() > 0;
//        }
//    }
//}
