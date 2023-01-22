using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Common.Models;
namespace IrcMonitor.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    public IdentityService()
    {
    }

    public async Task<string> GetUserNameAsync(string userId)
    {
        return "";
    }
}
