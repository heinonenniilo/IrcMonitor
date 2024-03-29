﻿using System.Security.Cryptography;

namespace IrcMonitor.Domain.Models;

public class GoogleAuth
{
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }
    public string RefreshTokenKey { get; set; }
    public int StoreRefreshTokenForDays { get; set; }
}

public class KeyVaultSettings
{
    public string KeyVaultUrl { get; set; }
    public string KeyName { get; set; }
}

public class AuthenticationSettings
{
    public string RsaPrivateKeyLocation { get; set; }
    public string RsaPublicKeyLocation { get; set; }
    public GoogleAuth GoogleAuth { get; set; }
    public string PageUrl { get; set; }
    public string Issuer { get; set; }
    public int AccessTokenExpirationInMinutes { get; set; }
    public KeyVaultSettings KeyVault { get; set; }
    public bool UseKeyFromKeyVault { get; set; }

    public RSAParameters RsaPrivateParameters { get; set; }



    public string GetIssuer => !string.IsNullOrEmpty(Issuer) ? Issuer : PageUrl;
}
