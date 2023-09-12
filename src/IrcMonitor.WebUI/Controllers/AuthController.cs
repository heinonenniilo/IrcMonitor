using IrcMonitor.WebUI.Controllers;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using IrcMonitor.Application.Users.Commands;

namespace WebUI.Controllers;

public class AuthController: ApiControllerBase
{
    private readonly IHttpContextAccessor _contextAccessor;
    public AuthController(IHttpContextAccessor contextAccessor)
    {
        _contextAccessor = contextAccessor;
    }
    [HttpPost(template:"google")]
    public async Task<UserVm> GoogleAuth([FromBody] HandleGoogleLoginCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPost(template: "google-auth-code")]
    public async Task<UserVm> GoogleAuthCode([FromBody] HandleGoogleAuthorizationCodeCommand command)
    {
        return await Mediator.Send(new HandleGoogleAuthorizationCodeCommand(command.AuthorizationCode, command.Email));
    }

    [HttpPost(template: "google-refresh")]
    public async Task<UserVm> GoogleRefresh([FromBody] HandleGoogleRefreshTokenCommand command)
    {
        return await Mediator.Send(command);
    }
}
