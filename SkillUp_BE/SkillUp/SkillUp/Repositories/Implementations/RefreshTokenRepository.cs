using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly SkillUpContext _context;

        public RefreshTokenRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task<RefreshToken?> GetValidTokenByUserIdAsync(Guid userId, string token)
        {
            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => 
                    rt.Token == token 
                    && rt.AccountId == userId 
                    && rt.RevokedUtc == null
                    && rt.ExpiresUtc > DateTime.UtcNow);
        }

        public async Task<List<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId)
        {
            return await _context.RefreshTokens
                .Where(rt => rt.AccountId == userId && rt.RevokedUtc == null)
                .ToListAsync();
        }

        public async Task AddAsync(RefreshToken refreshToken)
        {
            await _context.RefreshTokens.AddAsync(refreshToken);
        }

        public async Task UpdateAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Update(refreshToken);
            await Task.CompletedTask;
        }

        public async Task RevokeAllUserTokensAsync(Guid userId)
        {
            var tokens = await GetActiveTokensByUserIdAsync(userId);
            foreach (var token in tokens)
            {
                token.RevokedUtc = DateTime.UtcNow;
            }
            await Task.CompletedTask;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
