using System.Security.Cryptography;
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
    private readonly IEncryptionService _encryptionService;

    public GoogleAuthService(GoogleAuthorizationCodeFlow flow, AuthenticationSettings authSettings, IJwtGenerator jwtGenerator, ICookieService cookieService, IEncryptionService encryptionService)
    {
        _flow = flow;
        _authSettings = authSettings;
        _jwtGenerator = jwtGenerator;
        _cookieService = cookieService;
        _encryptionService = encryptionService;
    }
    public async Task<UserVm> AuthorizeWithGoogleAuthenticationCode(string email, string key, bool writeRefreshTokenInCookie, CancellationToken cancellationToken)
    {
        var exchangeRes = await _flow.ExchangeCodeForTokenAsync(email, key, _authSettings.PageUrl, cancellationToken);
        // Get user information
        var payload = await GetUserInformationFromGoogle(exchangeRes.IdToken);

        var appToken = await _jwtGenerator.CreateUserAuthToken(payload.Email);

        if (writeRefreshTokenInCookie)
        {
            await WriteRefreshTokenCookie(exchangeRes.RefreshToken);
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
        var encryptedRefreshToken = await _cookieService.GetCookie(_authSettings.GoogleAuth.RefreshTokenKey) ?? throw new InvalidOperationException("Refresh token cookie missing");
        var refreshToken = await DecryptRefreshToken(encryptedRefreshToken, cancellationToken);

        var exchangeRes = await _flow.RefreshTokenAsync(email, refreshToken, cancellationToken);
        var userInformation = await GetUserInformationFromGoogle(exchangeRes.IdToken);

        if (userInformation.Email != email)
        {
            throw new InvalidOperationException("Invalid email!");
        }

        var appToken = await _jwtGenerator.CreateUserAuthToken(userInformation.Email);

        if (writeRefreshTokenInCookie)
        {
            // Google does not always rotate the refresh token; keep the existing one in that case
            await WriteRefreshTokenCookie(exchangeRes.RefreshToken ?? refreshToken);
        }

        return new UserVm()
        {
            Email = userInformation.Email,
            AccessToken = appToken.AccessToken,
            Roles = appToken.Roles
        };
    }


    private async Task WriteRefreshTokenCookie(string refreshToken)
    {
        if (string.IsNullOrEmpty(refreshToken))
        {
            return;
        }

        var encrypted = await _encryptionService.Encrypt(refreshToken);
        await _cookieService.SetHttpOnlyCookie(_authSettings.GoogleAuth.RefreshTokenKey, encrypted, _authSettings.GoogleAuth.StoreRefreshTokenForDays);
    }

    private async Task<string> DecryptRefreshToken(string encryptedRefreshToken, CancellationToken cancellationToken)
    {
        try
        {
            return await _encryptionService.Decrypt(encryptedRefreshToken, cancellationToken);
        }
        catch (Exception ex) when (ex is FormatException or ArgumentException or CryptographicException or Azure.RequestFailedException)
        {
            throw new InvalidOperationException("Invalid refresh token", ex);
        }
    }

    private async Task<GoogleJsonWebSignature.Payload> GetUserInformationFromGoogle(string idToken)
    {
        return await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings()
        {
            Audience = new List<string>() { _authSettings.GoogleAuth.ClientId }
        });
    }
}
