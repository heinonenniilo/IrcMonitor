namespace IrcMonitor.Application.Common.Interfaces;
public interface ICookieService
{
    Task SetHttpOnlyCookie(string key, string value);
    Task<string> GetCookie(string key);
}
