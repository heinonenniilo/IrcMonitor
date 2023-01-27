using Google.Apis.Auth;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using MediatR;

namespace IrcMonitor.Application.Users.Commands;
public class HandleGoogleLoginCommand: IRequest<UserVm>
{
    public string TokenId { get; set; }
}

public class HandleGoogleLoginCommandHandler : IRequestHandler<HandleGoogleLoginCommand, UserVm>
{

    private readonly AuthenticationSettings _authenticationSettings;
    private readonly IJwtGenerator _jwtGenerator;
    public HandleGoogleLoginCommandHandler(AuthenticationSettings authenticationSettings, IJwtGenerator jwtGenerator)
    {
        _authenticationSettings = authenticationSettings;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<UserVm> Handle(HandleGoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings();
        settings.Audience = new List<string>() { _authenticationSettings.GoogleAuth.ClientId };
        var payload = GoogleJsonWebSignature.ValidateAsync(request.TokenId, settings).Result;
        var res = await _jwtGenerator.CreateUserAuthToken(payload.Email);
        return new UserVm
        {
            AccessToken = res.AccessToken,
            Email = payload.Email,
            Roles = res.Roles
        };
    }
}
