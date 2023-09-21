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
    public string JwtPrivateSigningKey { get; set; }
    public string JwtPublicKey { get; set; }
    public GoogleAuth GoogleAuth { get; set; }
    public string PageUrl { get; set; }

    public KeyVaultSettings KeyVault { get; set; }
    public bool UseKeyFromKeyVault { get; set; }
}
