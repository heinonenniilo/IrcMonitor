namespace IrcMonitor.Application.Common.Interfaces;
public interface IJwtGenerator
{
    public string CreateUserAuthToken(string userId);
}
