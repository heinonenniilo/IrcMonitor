using System.Security.Claims;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Common.Models;
using IrcMonitor.Infrastructure.Constants;
using Microsoft.AspNetCore.Http;

namespace IrcMonitor.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    public IdentityService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }



    public bool IsAdmin =>
            _httpContextAccessor?.HttpContext?.User.Claims.Any(x => x.Type == ClaimTypes.Role && x.Value == RoleConstants.Admin ) ?? false;

    public async Task<string> GetUserNameAsync(string userId)
    {
        return "";
    }


    public async Task<bool> HasAccessToChannel(int channelId)
    {
        var claims = _httpContextAccessor.HttpContext?.User?.Claims.ToList() ?? new List<Claim>();

        if (IsAdmin)
        {
            return true;
        }


        var isViewer = claims.Any(c => c.Type == ClaimTypes.Role && c.Value == RoleConstants.Viewer);

        if (isViewer)
        {
            var readableChannels = claims.Where(r => r.Type == CustomClaims.ChannelViewer).Select(c => c.Value).ToList();
            return readableChannels.Any(c => c == channelId.ToString());
        }

        return false;
    }
}
