using System.Security.Cryptography;
using System.Text;
using Azure.Security.KeyVault.Keys;
using Azure.Security.KeyVault.Keys.Cryptography;
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
    private readonly KeyClient _keyClient;

    public GoogleAuthService(GoogleAuthorizationCodeFlow flow, AuthenticationSettings authSettings, IJwtGenerator jwtGenerator, ICookieService cookieService, KeyClient keyClient)
    {
        _flow = flow;
        _authSettings = authSettings;
        _jwtGenerator = jwtGenerator;
        _cookieService = cookieService;
        _keyClient = keyClient;
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

        var encrypted = await EncryptRefreshToken(refreshToken);
        await _cookieService.SetHttpOnlyCookie(_authSettings.GoogleAuth.RefreshTokenKey, encrypted, _authSettings.GoogleAuth.StoreRefreshTokenForDays);
    }

    private async Task<string> EncryptRefreshToken(string refreshToken, CancellationToken cancellationToken = default)
    {
        var plainBytes = Encoding.UTF8.GetBytes(refreshToken);
        byte[] cipherBytes;

        if (_authSettings.UseKeyFromKeyVault)
        {
            var cryptoClient = _keyClient.GetCryptographyClient(_authSettings.KeyVault.KeyName);
            var result = await cryptoClient.EncryptAsync(EncryptionAlgorithm.RsaOaep256, plainBytes, cancellationToken);
            cipherBytes = result.Ciphertext;
        }
        else
        {
            using var rsa = RSA.Create();
            rsa.ImportParameters(_authSettings.RsaPrivateParameters);
            cipherBytes = rsa.Encrypt(plainBytes, RSAEncryptionPadding.OaepSHA256);
        }

        return Microsoft.IdentityModel.Tokens.Base64UrlEncoder.Encode(cipherBytes);
    }

    private async Task<string> DecryptRefreshToken(string encryptedRefreshToken, CancellationToken cancellationToken)
    {
        try
        {
            var cipherBytes = Microsoft.IdentityModel.Tokens.Base64UrlEncoder.DecodeBytes(encryptedRefreshToken);
            byte[] plainBytes;

            if (_authSettings.UseKeyFromKeyVault)
            {
                var cryptoClient = _keyClient.GetCryptographyClient(_authSettings.KeyVault.KeyName);
                var result = await cryptoClient.DecryptAsync(EncryptionAlgorithm.RsaOaep256, cipherBytes, cancellationToken);
                plainBytes = result.Plaintext;
            }
            else
            {
                using var rsa = RSA.Create();
                rsa.ImportParameters(_authSettings.RsaPrivateParameters);
                plainBytes = rsa.Decrypt(cipherBytes, RSAEncryptionPadding.OaepSHA256);
            }

            return Encoding.UTF8.GetString(plainBytes);
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
