namespace IrcMonitor.Domain.Models;

public class GoogleAuth
{
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }

}
public class AuthenticationSettings
{
    public string JwtPrivateSigningKey { get; set; }
    public string JwtPublicKey { get; set; }
    public GoogleAuth GoogleAuth { get; set; }
}
