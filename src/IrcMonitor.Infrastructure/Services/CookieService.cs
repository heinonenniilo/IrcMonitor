
using IrcMonitor.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace IrcMonitor.Infrastructure.Services;
public class CookieService : ICookieService
{
    private readonly IHttpContextAccessor _contextAccessor;

    public CookieService(IHttpContextAccessor contextAccessor)
    {
        _contextAccessor = contextAccessor;
    }

    public Task SetHttpOnlyCookie(string key, string value, int daysUntilExpiration)
    {
        _contextAccessor.HttpContext.Response.Cookies.Append(key, value, new CookieOptions()
        {
            HttpOnly = true,
            Expires = DateTimeOffset.UtcNow.AddDays(daysUntilExpiration),
            Secure = true,
            SameSite = SameSiteMode.Strict
        });

        return Task.CompletedTask;
    }

    public Task<string> GetCookie(string key)
    {

        if( _contextAccessor.HttpContext.Request.Cookies.TryGetValue(key, out var cookie))
        {
            return Task.FromResult(cookie);
        }

        throw new InvalidOperationException("Cookie not found");
    }
}
