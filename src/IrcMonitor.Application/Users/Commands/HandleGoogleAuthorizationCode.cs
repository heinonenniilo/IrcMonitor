using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2;
using IrcMonitor.Domain.Models;
using MediatR;
using IrcMonitor.Application.Common.Interfaces;
using Google.Apis.Auth;

namespace IrcMonitor.Application.Users.Commands;
public class HandleGoogleAuthorizationCodeCommand : IRequest<UserVm>
{
    public string AuthorizationCode { get; set; }
    public string Email { get; set; }

    public bool IsRefresh { get; set; }
}

public class HandleGoogleAuthorizationCodeCommandHandler : IRequestHandler<HandleGoogleAuthorizationCodeCommand, UserVm>
{
    private readonly AuthenticationSettings _authenticationSettings;
    private readonly IJwtGenerator _jwtGenerator;
    public HandleGoogleAuthorizationCodeCommandHandler(AuthenticationSettings authenticationSettings, IJwtGenerator jwtGenerator)
    {
        _authenticationSettings = authenticationSettings;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<UserVm> Handle(HandleGoogleAuthorizationCodeCommand request, CancellationToken cancellationToken)
    {
        var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer()
        {
            ClientSecrets = new ClientSecrets()
            {
                ClientId = _authenticationSettings.GoogleAuth.ClientId,
                ClientSecret = _authenticationSettings.GoogleAuth.ClientSecret
            },
        });

        var res = request.IsRefresh ? await flow.RefreshTokenAsync(request.Email, request.AuthorizationCode, cancellationToken) : await flow.ExchangeCodeForTokenAsync(request.Email, request.AuthorizationCode, "https://localhost:3000", CancellationToken.None);

        var settings = new GoogleJsonWebSignature.ValidationSettings();
        settings.Audience = new List<string>() { _authenticationSettings.GoogleAuth.ClientId };

        var payload = GoogleJsonWebSignature.ValidateAsync(res.IdToken, new GoogleJsonWebSignature.ValidationSettings()
        {
            Audience = new List<string>() { _authenticationSettings.GoogleAuth.ClientId }
        }).Result;

        var tokenRes = await _jwtGenerator.CreateUserAuthToken(payload.Email);
        return new UserVm
        {
            AccessToken = tokenRes.AccessToken,
            Email = payload.Email,
            Roles = tokenRes.Roles,
            GoogleRefreshToken = res.RefreshToken
        };

    }
}
