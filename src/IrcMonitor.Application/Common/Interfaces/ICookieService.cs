namespace IrcMonitor.Application.Common.Interfaces;
public interface ICookieService
{
    Task SetHttpOnlyCookie(string key, string value, int daysUntilExpiration);
    Task<string> GetCookie(string key);
}
