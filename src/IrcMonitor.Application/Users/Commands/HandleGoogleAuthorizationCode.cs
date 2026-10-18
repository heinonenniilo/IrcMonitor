using System.Text.Json;
using MediatR;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Users.Commands;
public class HandleGoogleAuthorizationCodeCommand : IRequest<UserVm>
{
    public HandleGoogleAuthorizationCodeCommand(string authorizationCode, string email)
    {
        AuthorizationCode = authorizationCode;
        Email = email;
    }

    public string AuthorizationCode { get;  }
    public string Email { get; }
}

public class HandleGoogleAuthorizationCodeCommandHandler : IRequestHandler<HandleGoogleAuthorizationCodeCommand, UserVm>
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IEncryptionService _encryptionService;
    private readonly ICookieService _cookieService;
    private readonly AuthenticationSettings _authSettings;

    public HandleGoogleAuthorizationCodeCommandHandler(IGoogleAuthService googleAuthService, IEncryptionService encryptionService, ICookieService cookieService, AuthenticationSettings authSettings)
    {
        _googleAuthService = googleAuthService;
        _encryptionService = encryptionService;
        _cookieService = cookieService;
        _authSettings = authSettings;
    }

    public async Task<UserVm> Handle(HandleGoogleAuthorizationCodeCommand request, CancellationToken cancellationToken)
    {
        var res = await _googleAuthService.AuthorizeWithGoogleAuthenticationCode(request.Email, request.AuthorizationCode, true, cancellationToken);
        var encryptedUser = await _encryptionService.Encrypt(JsonSerializer.Serialize(res), cancellationToken);
        await _cookieService.SetHttpOnlyCookie(_authSettings.UserCookieKey, encryptedUser, _authSettings.GoogleAuth.StoreRefreshTokenForDays);
        return res;
    }
}
