using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Common.Interfaces;
public interface IJwtGenerator
{
    public Task<CreateUserAuthTokenReturnModel> CreateUserAuthToken(string userId);
}
