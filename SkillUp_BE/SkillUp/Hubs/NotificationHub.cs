using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SkillUp.Services.Interfaces; // Cần ICurrentUserService
using System.Security.Claims;

namespace SkillUp.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ICurrentUserService _currentUserService;

        public NotificationHub(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        // Tự động tham gia group mang tên AccountId của mình
        public override async Task OnConnectedAsync()
        {
            var accountId = _currentUserService.UserId;
            if (accountId.HasValue)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, accountId.Value.ToString());
            }
            await base.OnConnectedAsync();
        }

        // Tự động rời group
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var accountId = _currentUserService.UserId;
            if (accountId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, accountId.Value.ToString());
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}