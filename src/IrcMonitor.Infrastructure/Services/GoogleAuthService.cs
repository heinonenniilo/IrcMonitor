using Google.Apis.Auth;
using Google.Apis.Auth.OAuth2.Flows;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Users.Commands;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Infrastructure.Services;
public class GoogleAuthService : IGoogleAuthService
{
    private readonly GoogleAuthorizationCodeFlow _flow;
    private readonly AuthenticationSettings _authSettings;
    private readonly IJwtGenerator _jwtGenerator;
    private readonly ICookieService _cookieService;

    public GoogleAuthService(GoogleAuthorizationCodeFlow flow, AuthenticationSettings authSettings, IJwtGenerator jwtGenerator, ICookieService cookieService)
    {
        _flow = flow;
        _authSettings = authSettings;
        _jwtGenerator = jwtGenerator;
        _cookieService = cookieService;
    }
    public async Task<UserVm> AuthorizeWithGoogleAuthenticationCode(string email, string key, bool writeRefreshTokenInCookie, CancellationToken cancellationToken)
    {
        var exchangeRes = await _flow.ExchangeCodeForTokenAsync(email, key, _authSettings.PageUrl, cancellationToken);
        // Get user information
        var payload = await GetUserInformationFromGoogle(exchangeRes.IdToken);

        var appToken = await _jwtGenerator.CreateUserAuthToken(payload.Email);

        if (writeRefreshTokenInCookie)
        {
            await _cookieService.SetHttpOnlyCookie(_authSettings.GoogleAuth.RefreshTokenKey, exchangeRes.RefreshToken);
        }

        return new UserVm()
        {
            Email = payload.Email,
            AccessToken = appToken.AccessToken,
            Roles = appToken.Roles
        };
    }

    public async Task<UserVm> AuthorizeWithGoogleRefreshToken(string email, bool writeRefreshTokenInCookie, CancellationToken cancellationToken)
    {
        var refreshToken = await _cookieService.GetCookie(_authSettings.GoogleAuth.RefreshTokenKey) ?? throw new InvalidOperationException("");

        var exchangeRes = await _flow.RefreshTokenAsync(email, refreshToken, cancellationToken);
        var userInformation = await GetUserInformationFromGoogle(exchangeRes.IdToken);

        if (userInformation.Email != email)
        {
            throw new InvalidOperationException("Invalid email!");
        }

        var appToken = await _jwtGenerator.CreateUserAuthToken(userInformation.Email);

        if (writeRefreshTokenInCookie)
        {
            await _cookieService.SetHttpOnlyCookie(_authSettings.GoogleAuth.RefreshTokenKey, exchangeRes.RefreshToken);
        }

        return new UserVm()
        {
            Email = userInformation.Email,
            AccessToken = appToken.AccessToken,
            Roles = appToken.Roles
        };
    }


    private async Task<GoogleJsonWebSignature.Payload> GetUserInformationFromGoogle(string idToken)
    {
        return await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings()
        {
            Audience = new List<string>() { _authSettings.GoogleAuth.ClientId }
        });
    }
}
