using IrcMonitor.Application.Users.Commands;

namespace IrcMonitor.Application.Common.Interfaces;
public interface IGoogleAuthService
{
    /// <summary>
    /// Exhange either a refresh token, or a auth key for an access token.
    /// </summary>
    /// <param name="key"></param>
    /// <returns></returns>
    public Task<UserVm> AuthorizeWithGoogleAuthenticationCode(string email, string key, bool writeRefreshTokenInCookie, CancellationToken cancellationToken);

    public Task<UserVm> AuthorizeWithGoogleRefreshToken(string email, bool writeRefreshTokenInCookie, CancellationToken cancellationToken);
}
