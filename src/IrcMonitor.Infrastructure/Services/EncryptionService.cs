using System.Security.Cryptography;
using System.Text;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using Microsoft.IdentityModel.Tokens;

namespace IrcMonitor.Infrastructure.Services;

/// <summary>
/// AES-256-GCM encryption with a pre-generated key (from appsettings or Key Vault secret).
/// Format (base64url): [nonce:12][tag:16][cipherText]
/// </summary>
public class EncryptionService : IEncryptionService
{
    private const int NonceSize = 12;
    private const int TagSize = 16;

    private readonly byte[] _key;

    public EncryptionService(AuthenticationSettings authSettings)
    {
        _key = authSettings.CookieKeyBytes ?? throw new InvalidOperationException("Cookie encryption key is not loaded");
    }

    public Task<string> Encrypt(string plainText, CancellationToken cancellationToken = default)
    {
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var output = new byte[NonceSize + TagSize + plainBytes.Length];

        var nonce = output.AsSpan(0, NonceSize);
        var tag = output.AsSpan(NonceSize, TagSize);
        var cipherBytes = output.AsSpan(NonceSize + TagSize);

        RandomNumberGenerator.Fill(nonce);

        using (var aes = new AesGcm(_key, TagSize))
        {
            aes.Encrypt(nonce, plainBytes, cipherBytes, tag);
        }

        return Task.FromResult(Base64UrlEncoder.Encode(output));
    }

    public Task<string> Decrypt(string cipherText, CancellationToken cancellationToken = default)
    {
        var input = Base64UrlEncoder.DecodeBytes(cipherText);

        if (input.Length < NonceSize + TagSize)
        {
            throw new CryptographicException("Invalid cipher text");
        }

        var nonce = input.AsSpan(0, NonceSize);
        var tag = input.AsSpan(NonceSize, TagSize);
        var cipherBytes = input.AsSpan(NonceSize + TagSize);
        var plainBytes = new byte[cipherBytes.Length];

        using (var aes = new AesGcm(_key, TagSize))
        {
            aes.Decrypt(nonce, cipherBytes, tag, plainBytes);
        }

        return Task.FromResult(Encoding.UTF8.GetString(plainBytes));
    }
}
