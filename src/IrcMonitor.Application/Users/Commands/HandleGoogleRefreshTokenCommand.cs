using System.Text.Json;
using MediatR;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Users.Commands;
public class HandleGoogleRefreshTokenCommand : IRequest<UserVm>
{
    public HandleGoogleRefreshTokenCommand(string email)
    {
        Email = email;
    }

    public string Email { get; set; }
}

public class HandleGoogleRefreshTokenCommandHandler : IRequestHandler<HandleGoogleRefreshTokenCommand, UserVm>
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IEncryptionService _encryptionService;
    private readonly ICookieService _cookieService;
    private readonly AuthenticationSettings _authSettings;

    public HandleGoogleRefreshTokenCommandHandler(IGoogleAuthService googleAuthService, IEncryptionService encryptionService, ICookieService cookieService, AuthenticationSettings authSettings)
    {
        _googleAuthService = googleAuthService;
        _encryptionService = encryptionService;
        _cookieService = cookieService;
        _authSettings = authSettings;
    }

    public async Task<UserVm> Handle(HandleGoogleRefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var res = await _googleAuthService.AuthorizeWithGoogleRefreshToken(request.Email, true, cancellationToken);
        var encryptedUser = await _encryptionService.Encrypt(JsonSerializer.Serialize(res), cancellationToken);
        await _cookieService.SetHttpOnlyCookie(_authSettings.GoogleAuth.UserCookieKey, encryptedUser, _authSettings.GoogleAuth.StoreRefreshTokenForDays);
        return res;
    }
}
