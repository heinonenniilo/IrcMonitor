using IrcMonitor.Application.Common.Models;

namespace IrcMonitor.Application.Common.Interfaces;

public interface IIdentityService
{


    bool IsAdmin { get; }
    Task<string> GetUserNameAsync(string userId);

    Task<bool> HasAccessToChannel(int channelId);
}
