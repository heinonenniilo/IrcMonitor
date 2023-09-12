using MediatR;
using IrcMonitor.Application.Common.Interfaces;

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

    public HandleGoogleAuthorizationCodeCommandHandler(IGoogleAuthService googleAuthService)
    {
        _googleAuthService = googleAuthService;
    }

    public async Task<UserVm> Handle(HandleGoogleAuthorizationCodeCommand request, CancellationToken cancellationToken)
    {
        var res = await _googleAuthService.AuthorizeWithGoogleAuthenticationCode(request.Email, request.AuthorizationCode, true, cancellationToken);
        return res;
    }
}
