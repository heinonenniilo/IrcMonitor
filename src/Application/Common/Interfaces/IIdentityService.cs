using IrcMonitor.Application.Common.Models;

namespace IrcMonitor.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<string> GetUserNameAsync(string userId);
}
