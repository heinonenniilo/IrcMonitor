using MediatR;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Users.Commands;
public class LogoutCommand : IRequest
{
}

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly ICookieService _cookieService;
    private readonly AuthenticationSettings _authSettings;

    public LogoutCommandHandler(ICookieService cookieService, AuthenticationSettings authSettings)
    {
        _cookieService = cookieService;
        _authSettings = authSettings;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await _cookieService.DeleteCookie(_authSettings.GoogleAuth.RefreshTokenKey);
        await _cookieService.DeleteCookie(_authSettings.UserCookieKey);
    }
}
