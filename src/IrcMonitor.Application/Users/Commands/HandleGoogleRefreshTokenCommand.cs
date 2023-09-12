using MediatR;
using IrcMonitor.Application.Common.Interfaces;

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
    public HandleGoogleRefreshTokenCommandHandler(IGoogleAuthService googleAuthService)
    {
        _googleAuthService = googleAuthService;
    }

    public async Task<UserVm> Handle(HandleGoogleRefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var res = await _googleAuthService.AuthorizeWithGoogleRefreshToken(request.Email, true, cancellationToken);
        return res;
    }
}
