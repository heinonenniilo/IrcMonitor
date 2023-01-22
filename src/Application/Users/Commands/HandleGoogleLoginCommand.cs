using Google.Apis.Auth;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using MediatR;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace IrcMonitor.Application.Users.Commands;
public class HandleGoogleLoginCommand: IRequest<string>
{
    public string TokenId { get; set; }
    public string GoogleId { get; set; }
}

public class HandleGoogleLoginCommandHandler : IRequestHandler<HandleGoogleLoginCommand, string>
{

    private readonly AuthenticationSettings _authenticationSettings;
    private readonly IJwtGenerator _jwtGenerator;
    public HandleGoogleLoginCommandHandler(AuthenticationSettings authenticationSettings, IJwtGenerator jwtGenerator)
    {
        _authenticationSettings = authenticationSettings;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<string> Handle(HandleGoogleLoginCommand request, CancellationToken cancellationToken)
    {

        var settings = new GoogleJsonWebSignature.ValidationSettings();
        settings.Audience = new List<string>() { _authenticationSettings.GoogleAuth.ClientId };
        var payload = GoogleJsonWebSignature.ValidateAsync(request.TokenId, settings).Result;
        return _jwtGenerator.CreateUserAuthToken(payload.Email);
    }
}
